#!/usr/bin/env python3
"""Full Seedance movie: continuous zoom, multi-part chain, model via env."""
from __future__ import annotations
import atexit, fcntl, json, math, os, re, shutil, subprocess, sys, time
import urllib.error, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOK_ID = os.environ.get("BOOK_ID", "13e32fd6-d45d-4266-811a-6993f7e051cc")
# OUT_TAG keeps experiments separate (e.g. fullseed vs fast15) so gold cuts are not overwritten.
OUT_TAG = os.environ.get("SEEDANCE_OUT_TAG", "fullseed").strip() or "fullseed"
OUT = ROOT / "tmp-movie" / f"book-{BOOK_ID[:8]}-{OUT_TAG}"
OUT.mkdir(parents=True, exist_ok=True)
PAGES_DIR = OUT / "pages"; PAGES_DIR.mkdir(exist_ok=True)
LOG = OUT / "render.log"
LOCK_PATH = OUT / "worker.lock"
PID_PATH = OUT / "worker.pid"
HEARTBEAT_PATH = OUT / "heartbeat.json"
MAX_FAL_RETRIES = int(os.environ.get("MAX_FAL_RETRIES", "4"))
# Per-page Seedance attempts before giving up / optional Ken Burns.
PAGE_SEEDANCE_RETRIES = int(os.environ.get("PAGE_SEEDANCE_RETRIES", "3"))
# Default OFF: never silently ship a freeze/Ken Burns page (River p8 bug).
ALLOW_KENBURNS_FALLBACK = os.environ.get("ALLOW_KENBURNS_FALLBACK", "0") == "1"
_lock_fh = None

SITE = "https://www.storybookphotos.com"
ADMIN = "3121"
END_BUMP_LOCAL = ROOT / "public/brand/movie-end-bump.mp4"
END_CARD_LOCAL = ROOT / "public/brand/movie-end-card-16x9.png"
BGM_BED_LOCAL = ROOT / "public/audio/storybook-bedtime-bed.mp3"
# Soft bed under narration (0.0-1.0). 0.18 keeps voice clear.
BGM_VOLUME = float(os.environ.get("BGM_VOLUME", "0.18"))
ENABLE_BGM = os.environ.get("ENABLE_BGM", "1") == "1"
ALLOW_SEEDANCE = os.environ.get("ALLOW_SEEDANCE", "1") == "1"
tools = Path("/Users/brandastic/.openclaw/workspace/TOOLS.md").read_text()
FAL = re.search(r"dd81a063-9b3b-4eae-a34f-e73f9b013fdc:[A-Za-z0-9]+", tools).group(0)
# Defaults stay 2.5/30s; Fast cost tests set SEEDANCE_MODEL + SEEDANCE_CLIP_SEC=15
SEEDANCE = os.environ.get("SEEDANCE_MODEL", "bytedance/seedance-2.5/image-to-video")
TTS = "fal-ai/minimax/speech-02-hd"
CLIP_SEC = int(os.environ.get("SEEDANCE_CLIP_SEC", "30"))
MAX_PAGE_HOLD = float(os.environ.get("MAX_PAGE_HOLD", "45"))
MIN_PAGE_HOLD = 4.0
ALLOW_CHAIN = os.environ.get("SEEDANCE_ALLOW_CHAIN", "1") == "1"
FORCE_RERENDER = os.environ.get("FORCE_RERENDER", "0") == "1"
# Set PATCH_SITE_VIDEO=0 to render without replacing a live book video
PATCH_SITE_VIDEO = os.environ.get("PATCH_SITE_VIDEO", "1") == "1"
W, H, FPS = 1280, 720, 24
SEEDANCE_COST_PER_SEC = float(os.environ.get("SEEDANCE_COST_PER_SEC", "0.473"))
MAX_CHAIN_PARTS = int(os.environ.get("SEEDANCE_MAX_CHAIN_PARTS", "6"))

def acquire_single_instance_lock():
    global _lock_fh
    LOCK_PATH.parent.mkdir(parents=True, exist_ok=True)
    _lock_fh = open(LOCK_PATH, "a+")
    try:
        fcntl.flock(_lock_fh.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        other = ""
        try:
            other = PID_PATH.read_text().strip()
        except Exception:
            pass
        raise SystemExit("Another worker already running for this book (pid %s). Refusing double-bill." % (other or "?"))
    _lock_fh.seek(0)
    _lock_fh.truncate()
    _lock_fh.write(str(os.getpid()) + chr(10))
    _lock_fh.flush()
    PID_PATH.write_text(str(os.getpid()) + chr(10))
    def _cleanup():
        try:
            if PID_PATH.exists() and PID_PATH.read_text().strip() == str(os.getpid()):
                PID_PATH.unlink(missing_ok=True)
        except Exception:
            pass
        try:
            if _lock_fh:
                fcntl.flock(_lock_fh.fileno(), fcntl.LOCK_UN)
                _lock_fh.close()
        except Exception:
            pass
    atexit.register(_cleanup)

def heartbeat(stage, **extra):
    payload = {
        "pid": os.getpid(), "ts": time.time(),
        "iso": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "stage": stage, "book_id": BOOK_ID,
    }
    payload.update(extra)
    try:
        HEARTBEAT_PATH.write_text(json.dumps(payload, indent=2) + chr(10))
    except Exception:
        pass

def log(msg):
    line = time.strftime("%H:%M:%S ") + msg
    print(line, flush=True)
    with LOG.open("a") as f:
        f.write(line + chr(10))

def run(cmd, check=True):
    return subprocess.run(cmd, check=check, capture_output=True, text=True)

def ffprobe_dur(path):
    r = run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",str(path)])
    try:
        return float(r.stdout.strip())
    except Exception:
        return 0.0

def http_json(method, url, headers=None, body=None, timeout=120):
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read()
            return json.loads(raw.decode()) if raw else {}
    except urllib.error.HTTPError as e:
        detail = e.read()[:800].decode(errors="ignore")
        raise RuntimeError("HTTP %s %s: %s" % (e.code, url, detail))

def fal_headers():
    return {"Authorization": "Key " + FAL, "Content-Type": "application/json"}

def fal_queue(model, payload, timeout_s=900):
    last_err = None
    for attempt in range(1, MAX_FAL_RETRIES + 1):
        try:
            heartbeat("fal_submit", model=model, attempt=attempt)
            sub = http_json("POST", "https://queue.fal.run/" + model, fal_headers(), payload, 60)
            if isinstance(sub.get("video"), dict) and sub["video"].get("url"):
                return sub
            if isinstance(sub.get("audio"), dict) and sub["audio"].get("url"):
                return sub
            rid = sub.get("request_id")
            if not rid:
                raise RuntimeError("no request_id " + str(sub)[:300])
            status_url = sub.get("status_url") or ("https://queue.fal.run/%s/requests/%s/status" % (model, rid))
            result_url = sub.get("response_url") or ("https://queue.fal.run/%s/requests/%s" % (model, rid))
            start = time.time()
            while time.time() - start < timeout_s:
                heartbeat("fal_poll", model=model, request_id=rid, elapsed=int(time.time()-start))
                st = http_json("GET", status_url, {"Authorization": "Key " + FAL}, timeout=60)
                s = st.get("status")
                if s == "COMPLETED":
                    return http_json("GET", result_url, {"Authorization": "Key " + FAL}, timeout=120)
                if s in ("FAILED", "ERROR"):
                    raise RuntimeError(str(st)[:400])
                time.sleep(4)
            raise TimeoutError(model)
        except Exception as e:
            last_err = e
            wait = min(60, 5 * attempt)
            log("fal_queue retry %s/%s model=%s err=%s wait=%ss" % (attempt, MAX_FAL_RETRIES, model, str(e)[:160], wait))
            time.sleep(wait)
    raise RuntimeError("fal_queue failed after retries: %s" % last_err)

def extract_video(res):
    if not isinstance(res, dict): return None
    v = res.get("video")
    if isinstance(v, dict) and v.get("url"): return v["url"]
    return res.get("video_url")

def extract_audio(res):
    if not isinstance(res, dict): return None
    a = res.get("audio")
    if isinstance(a, dict) and a.get("url"): return a["url"]
    return res.get("audio_url")

def download(url, dest, timeout=300, attempts=4):
    if dest.exists() and dest.stat().st_size > 1000: return dest
    last_err = None
    for attempt in range(1, attempts + 1):
        tmp = dest.with_suffix(dest.suffix + ".part")
        try:
            if tmp.exists():
                try: tmp.unlink()
                except Exception: pass
            req = urllib.request.Request(url, headers={"User-Agent": "storybook-fullseed/1.0"})
            with urllib.request.urlopen(req, timeout=timeout) as r, tmp.open("wb") as f:
                shutil.copyfileobj(r, f)
            if tmp.stat().st_size < 1000:
                raise RuntimeError("download too small %s bytes" % tmp.stat().st_size)
            tmp.replace(dest)
            return dest
        except Exception as e:
            last_err = e
            log("  download retry %s/%s err=%s" % (attempt, attempts, str(e)[:120]))
            try:
                if tmp.exists(): tmp.unlink()
            except Exception:
                pass
            time.sleep(min(30, 3 * attempt))
    raise RuntimeError("download failed after retries: %s" % last_err)


def patch(status, video_url=None, notes=None, package='full'):
    body = {"video_status": status, "video_package": package if package in ("teaser","full") else "full"}
    if video_url is not None: body['video_url'] = video_url
    if notes is not None: body['video_notes'] = notes[:1900]
    return http_json("PATCH", "%s/api/storybooks/%s/video" % (SITE, BOOK_ID), {"Content-Type":"application/json","x-admin-code":ADMIN}, body)

def get_book():
    data = http_json("GET", SITE + "/api/admin/storybooks", {"x-admin-code": ADMIN})
    for b in data.get("storybooks") or []:
        if b.get("id") == BOOK_ID: return b
    raise RuntimeError("book not found")

def narration_line(page, child, role):
    title = (page.get("title") or "").strip()
    body = re.sub(r"\s+", " ", (page.get("text") or "").strip())
    if not body or re.match(r"^title page$", title, re.I):
        return "%s %s continues the adventure." % (role, child)
    if len(body) > 900: body = body[:880].rsplit(' ', 1)[0] + '.'
    if title and body.lower() == title.lower(): return body
    if title and not body.lower().startswith(title.lower()) and len(title) < 60:
        return "%s. %s" % (title, body)
    return body

def tts(text, dest):
    if dest.exists() and dest.stat().st_size > 1000 and ffprobe_dur(dest) > 1: return dest
    res = fal_queue(TTS, {"text": text[:1200], "voice_id": "Wise_Woman"}, 300)
    url = extract_audio(res)
    if not url: raise RuntimeError("tts no url")
    download(url, dest)
    return dest

def seedance_prompt(role, child, title, text, zoom_continue=False):
    beat = (title or text or "")[:160]
    cont = "Continue the SAME slow push-in from prior framing. " if zoom_continue else ""
    return (
        "STYLE LOCK: 2D watercolor children storybook illustration coming gently alive. "
        "NOT anime NOT 3D CGI NOT photoreal. Face/eyes/outfit locked to the start frame. "
        "If a dragon appears: SAME emerald-green dragon, amber eyes, bat wings - do not redesign. "
        + cont +
        "CAMERA: one continuous slow cinematic dolly/push-in zoom for the ENTIRE clip - "
        "smooth constant speed, no cuts, no snap zoom, no orbit, no whip pan. "
        "Start slightly wider, end closer on the hero / key action. "
        "Soft breeze in hair cloth leaves, subtle blink, gentle sparkle dust. No text. No watermark. "
        "Hero %s %s. Beat: %s" % (role, child, beat)
    )

def animate_seedance(img_url, prompt, dest, duration_sec=None):
    dur = int(duration_sec or CLIP_SEC)
    dur = max(4, min(CLIP_SEC, dur))
    if dest.exists() and dest.stat().st_size > 50000:
        have = ffprobe_dur(dest)
        if have >= max(2.0, dur - 0.75):
            return dest
        try:
            dest.unlink()
        except Exception:
            pass
    last_err = None
    for attempt in range(1, PAGE_SEEDANCE_RETRIES + 1):
        try:
            if dest.exists():
                try: dest.unlink()
                except Exception: pass
            payload = {
                "prompt": prompt, "image_url": img_url, "resolution": "720p",
                "duration": str(dur), "aspect_ratio": "16:9", "generate_audio": False,
            }
            # Fast/long queues can exceed 15m; keep poll window generous
            res = fal_queue(SEEDANCE, payload, int(os.environ.get("SEEDANCE_FAL_TIMEOUT", "1500")))
            url = extract_video(res)
            if not url: raise RuntimeError("seedance no url")
            download(url, dest, timeout=300, attempts=4)
            have = ffprobe_dur(dest)
            if have < max(2.0, dur - 1.25):
                raise RuntimeError("seedance short clip have=%.2fs want=%ss" % (have, dur))
            if attempt > 1:
                log("  Seedance ok on retry %s (%.1fs)" % (attempt, have))
            return dest
        except Exception as e:
            last_err = e
            log("  Seedance attempt %s/%s failed: %s" % (attempt, PAGE_SEEDANCE_RETRIES, str(e)[:160]))
            try:
                if dest.exists(): dest.unlink()
            except Exception:
                pass
            time.sleep(min(45, 5 * attempt))
    raise RuntimeError("animate_seedance failed after %s tries: %s" % (PAGE_SEEDANCE_RETRIES, last_err))


def upload_fal_storage_image(path):
    init = http_json("POST", "https://rest.alpha.fal.ai/storage/upload/initiate",
        {"Authorization":"Key "+FAL,"Content-Type":"application/json"},
        {"file_name": path.name, "content_type":"image/jpeg"})
    upload_url = init.get("upload_url"); file_url = init.get("file_url")
    if not upload_url or not file_url: raise RuntimeError("fal image init fail " + str(init)[:200])
    data = path.read_bytes()
    req = urllib.request.Request(upload_url, data=data, method="PUT", headers={"Content-Type":"image/jpeg"})
    with urllib.request.urlopen(req, timeout=180) as r:
        r.read()
    return file_url

def extend_seedance_to_hold(img_url, base_prompt, seed_path, hold_sec, role, child, title, text):
    """Generate Seedance for full hold via multi-part last-frame chain (supports 15s Fast)."""
    first_want = max(4, min(CLIP_SEC, int(math.ceil(min(hold_sec, CLIP_SEC)))))
    animate_seedance(img_url, base_prompt, seed_path, duration_sec=first_want)
    parts = [seed_path]
    part_n = 1
    while ALLOW_CHAIN and part_n < MAX_CHAIN_PARTS:
        have = sum(ffprobe_dur(p) for p in parts)
        if have >= hold_sec - 0.5:
            break
        need = min(CLIP_SEC, max(4, int(math.ceil(hold_sec - have + 0.5))))
        part_n += 1
        part_path = seed_path.with_name("seed_part%s.mp4" % part_n)
        last_frame = seed_path.with_name("seed_last_p%s.jpg" % part_n)
        src_for_frame = parts[-1]
        run(["ffmpeg","-y","-sseof","-0.05","-i",str(src_for_frame),"-frames:v","1","-q:v","2",str(last_frame)], check=False)
        cont_prompt = seedance_prompt(role, child, title, text, zoom_continue=True)
        cont_img = img_url
        if last_frame.exists() and last_frame.stat().st_size > 1000:
            try:
                cont_img = upload_fal_storage_image(last_frame)
            except Exception:
                cont_img = img_url
        log("  chain part %s need=%ss have=%.1fs hold=%.1fs" % (part_n, need, have, hold_sec))
        animate_seedance(cont_img, cont_prompt, part_path, duration_sec=need)
        if not part_path.exists() or ffprobe_dur(part_path) < 2:
            log("  chain part %s failed/short — stop chain" % part_n)
            break
        parts.append(part_path)
    if len(parts) == 1:
        return seed_path
    chained = seed_path.with_name("seed_chained.mp4")
    list_file = seed_path.with_name("seed_chain.txt")
    with list_file.open("w") as f:
        for p in parts:
            f.write("file '%s'%s" % (p.resolve(), chr(10)))
    r = run(["ffmpeg","-y","-f","concat","-safe","0","-i",str(list_file),"-c:v","libx264","-pix_fmt","yuv420p","-preset","veryfast","-crf","18","-an",str(chained)], check=False)
    if r.returncode == 0 and chained.exists() and ffprobe_dur(chained) > ffprobe_dur(parts[0]):
        shutil.copy2(chained, seed_path)
        log("  chained %s parts -> %.1fs" % (len(parts), ffprobe_dur(seed_path)))
    return seed_path

def still_from_image(img_path, sec, dest):
    base_sec = max(4.0, float(sec))
    if dest.exists() and dest.stat().st_size > 20000 and abs(ffprobe_dur(dest) - base_sec) < 0.5:
        return dest
    frames = max(24, int(round(base_sec * FPS)))
    zstep = max(0.00008, min(0.00035, 0.18 / max(frames, 1)))
    vf = ("scale=%d:%d:force_original_aspect_ratio=increase,crop=%d:%d,"
         "zoompan=z='min(zoom+%.6f,1.18)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
         ":d=%d:s=%dx%d:fps=%d,format=yuv420p") % (W, H, W, H, zstep, frames, W, H, FPS)
    r = run(["ffmpeg","-y","-loop","1","-i",str(img_path),"-vf",vf,"-t","%.3f"%base_sec,"-r",str(FPS),"-an","-c:v","libx264","-pix_fmt","yuv420p","-preset","veryfast","-crf","18",str(dest)], check=False)
    if r.returncode != 0: raise RuntimeError("kenburns fail: " + (r.stderr or "")[-300:])
    return dest

def fit_video_to_duration(src, target_sec, dest):
    if dest.exists() and abs(ffprobe_dur(dest) - target_sec) < 0.35 and dest.stat().st_size > 20000:
        return dest
    have = ffprobe_dur(src)
    if have <= 0.1: raise RuntimeError("bad src " + str(src))
    vf_base = "scale=%d:%d:force_original_aspect_ratio=increase,crop=%d:%d,fps=%d,format=yuv420p" % (W, H, W, H, FPS)
    if have + 0.05 >= target_sec:
        r = run(["ffmpeg","-y","-i",str(src),"-t","%.3f"%target_sec,"-vf",vf_base,"-an","-c:v","libx264","-pix_fmt","yuv420p","-preset","veryfast","-crf","18",str(dest)], check=False)
        if r.returncode != 0: raise RuntimeError("fit trim fail: " + (r.stderr or "")[-300:])
        return dest
    ratio = target_sec / have
    if ratio <= 1.35:
        vf = "setpts=PTS*%.6f,%s" % (ratio, vf_base)
        r = run(["ffmpeg","-y","-i",str(src),"-vf",vf,"-t","%.3f"%target_sec,"-an","-c:v","libx264","-pix_fmt","yuv420p","-preset","veryfast","-crf","18",str(dest)], check=False)
        if r.returncode == 0 and abs(ffprobe_dur(dest) - target_sec) < 0.5:
            return dest
    pad = target_sec - have
    vf = "%s,tpad=stop_mode=clone:stop_duration=%.3f" % (vf_base, pad)
    r = run(["ffmpeg","-y","-i",str(src),"-vf",vf,"-t","%.3f"%target_sec,"-an","-c:v","libx264","-pix_fmt","yuv420p","-preset","veryfast","-crf","18",str(dest)], check=False)
    if r.returncode != 0: raise RuntimeError("fit freeze fail: " + (r.stderr or "")[-300:])
    return dest

def mux_av(video, audio, dest, hold_sec):
    fc = ("[0:v]trim=0:%.3f,setpts=PTS-STARTPTS,fps=%d,format=yuv420p[v];"
          "[1:a]atrim=0:%.3f,asetpts=PTS-STARTPTS,"
          "aformat=sample_rates=44100:channel_layouts=stereo,apad=whole_dur=%.3f[a]") % (hold_sec, FPS, hold_sec, hold_sec)
    r = run(["ffmpeg","-y","-i",str(video),"-i",str(audio),"-filter_complex",fc,"-map","[v]","-map","[a]","-t","%.3f"%hold_sec,"-c:v","libx264","-pix_fmt","yuv420p","-preset","veryfast","-crf","18","-c:a","aac","-b:a","192k",str(dest)], check=False)
    if r.returncode != 0: raise RuntimeError("mux fail: " + (r.stderr or "")[-300:])
    return dest

def prepare_end_bump(dest):
    if END_BUMP_LOCAL.exists():
        r = run(["ffmpeg","-y","-i",str(END_BUMP_LOCAL),"-vf","scale=%d:%d:force_original_aspect_ratio=increase,crop=%d:%d,fps=%d,format=yuv420p"%(W,H,W,H,FPS),"-an","-c:v","libx264","-pix_fmt","yuv420p","-preset","veryfast","-crf","18",str(dest)], check=False)
        if r.returncode != 0: raise RuntimeError("end bump fail")
        return dest
    return still_from_image(END_CARD_LOCAL, 6.0, dest)

def upload_fal_storage(path):
    init = http_json("POST", "https://rest.alpha.fal.ai/storage/upload/initiate", {"Authorization":"Key "+FAL,"Content-Type":"application/json"}, {"file_name": path.name, "content_type":"video/mp4"})
    upload_url = init.get("upload_url"); file_url = init.get("file_url")
    if not upload_url or not file_url: raise RuntimeError("fal init fail " + str(init)[:200])
    data = path.read_bytes()
    req = urllib.request.Request(upload_url, data=data, method="PUT", headers={"Content-Type":"application/octet-stream"})
    with urllib.request.urlopen(req, timeout=600) as r:
        r.read()
    return file_url

def invalidate_short_assets(seed_path, fitted_path, muxed_path):
    if FORCE_RERENDER:
        log("  FORCE_RERENDER: clearing seed/fitted/muxed")
        for stale in (seed_path, fitted_path, muxed_path):
            try:
                if stale.exists(): stale.unlink()
            except Exception:
                pass
        return
    if not seed_path.exists(): return
    have = ffprobe_dur(seed_path)
    if have >= min(CLIP_SEC, 12) - 0.5: return
    log("  invalidate short seed %.1fs (want up to %ss)" % (have, CLIP_SEC))
    for stale in (seed_path, fitted_path, muxed_path):
        try:
            if stale.exists(): stale.unlink()
        except Exception:
            pass

def mix_bgm(video_in: Path, dest: Path, bgm_path: Path | None = None, volume: float | None = None) -> Path:
    """Mix a soft looping instrumental bed under existing narration audio."""
    bgm = bgm_path or BGM_BED_LOCAL
    vol = BGM_VOLUME if volume is None else float(volume)
    if not ENABLE_BGM:
        log("BGM disabled (ENABLE_BGM=0)")
        if video_in.resolve() != dest.resolve():
            shutil.copy2(video_in, dest)
        return dest
    if not bgm.exists() or bgm.stat().st_size < 10000:
        log("BGM missing — shipping voice-only (" + str(bgm) + ")")
        if video_in.resolve() != dest.resolve():
            shutil.copy2(video_in, dest)
        return dest
    dur = ffprobe_dur(video_in)
    if dur < 1:
        raise RuntimeError("mix_bgm: bad video duration")
    # Loop BGM to full length, low volume, slow fade in/out; keep original voice on top.
    # sidechaincompress ducks bed slightly under narration peaks.
    fc = (
        "[1:a]volume=%.3f,afade=t=in:st=0:d=2,afade=t=out:st=%.3f:d=3,aformat=sample_rates=44100:channel_layouts=stereo[bg];"
        "[0:a]aformat=sample_rates=44100:channel_layouts=stereo[voice];"
        "[bg][voice]sidechaincompress=threshold=0.05:ratio=6:attack=50:release=400:level_sc=0.8[bgd];"
        "[voice][bgd]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[a]"
    ) % (max(0.05, min(0.45, vol)), max(0.5, dur - 3.0))
    r = run([
        "ffmpeg","-y",
        "-i", str(video_in),
        "-stream_loop","-1","-i", str(bgm),
        "-filter_complex", fc,
        "-map","0:v","-map","[a]",
        "-t","%.3f" % dur,
        "-c:v","copy",
        "-c:a","aac","-b:a","192k",
        "-movflags","+faststart",
        str(dest),
    ], check=False)
    if r.returncode != 0:
        log("BGM sidechain failed, retry simple amix: " + (r.stderr or "")[-200:])
        fc2 = (
            "[1:a]volume=%.3f,afade=t=in:st=0:d=2,afade=t=out:st=%.3f:d=3[bg];"
            "[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2:normalize=0[a]"
        ) % (max(0.05, min(0.35, vol)), max(0.5, dur - 3.0))
        r2 = run([
            "ffmpeg","-y",
            "-i", str(video_in),
            "-stream_loop","-1","-i", str(bgm),
            "-filter_complex", fc2,
            "-map","0:v","-map","[a]",
            "-t","%.3f" % dur,
            "-c:v","copy",
            "-c:a","aac","-b:a","192k",
            "-movflags","+faststart",
            str(dest),
        ], check=False)
        if r2.returncode != 0:
            log("BGM mix failed — shipping voice-only: " + (r2.stderr or "")[-250:])
            if video_in.resolve() != dest.resolve():
                shutil.copy2(video_in, dest)
            return dest
    log("BGM mixed vol=%.2f bed=%s" % (vol, bgm.name))
    return dest


def main():
    acquire_single_instance_lock()
    heartbeat("start")
    log("FULL SEEDANCE movie book=%s allow=%s model=%s clip_max=%ss force=%s pid=%s" % (BOOK_ID, ALLOW_SEEDANCE, SEEDANCE, CLIP_SEC, FORCE_RERENDER, os.getpid()))
    try:
        if PATCH_SITE_VIDEO:
            patch("in_production", notes="Tinny FULL Seedance model=%s max %ss/page continuous zoom tag=%s pid=%s" % (SEEDANCE, CLIP_SEC, OUT_TAG, os.getpid()))
        else:
            log("PATCH_SITE_VIDEO=0 — skipping site status patch")
    except Exception as e:
        log("patch start warn " + str(e)[:120])
    book = get_book()
    child = book.get("child_name") or "Hero"
    role = "Queen" if book.get("gender") == "girl" else "King"
    pages = book.get("pages") or []
    if isinstance(pages, str): pages = json.loads(pages)
    pages = [p for p in pages if isinstance(p, dict) and str(p.get("imageUrl") or "").startswith("http")]
    log("pages=%s child=%s role=%s" % (len(pages), child, role))
    state_path = OUT / "state.json"
    state = json.loads(state_path.read_text()) if state_path.exists() else {"pages": {}}
    page_movies = []; notes = []; new_seed = 0; kenburns = 0; billed_seconds = 0.0
    for i, page in enumerate(pages):
        pdir = PAGES_DIR / ("p%02d" % (i+1)); pdir.mkdir(exist_ok=True)
        img_url = page["imageUrl"]
        img_path = pdir / "art.jpg"
        audio_path = pdir / "narration.mp3"
        seed_path = pdir / "seed.mp4"
        fitted_path = pdir / "fitted.mp4"
        muxed_path = pdir / "page.mp4"
        line = narration_line(page, child, role)
        log("page %s/%s chars=%s title=%s" % (i+1, len(pages), len(line), (page.get("title") or "")[:40]))
        heartbeat("page", page=i+1, total=len(pages), title=(page.get("title") or "")[:80])
        invalidate_short_assets(seed_path, fitted_path, muxed_path)
        seed_ok = seed_path.exists() and ffprobe_dur(seed_path) >= min(CLIP_SEC, 12) - 0.5
        if (not FORCE_RERENDER) and seed_ok and muxed_path.exists() and muxed_path.stat().st_size > 20000 and ffprobe_dur(muxed_path) > 2:
            log("  resume skip (page.mp4 ready %.1fs, seed %.1fs)" % (ffprobe_dur(muxed_path), ffprobe_dur(seed_path)))
            page_movies.append(muxed_path)
            notes.append("page %s: resume skip" % (i+1))
            continue
        download(img_url, img_path)
        tts(line, audio_path)
        adur = ffprobe_dur(audio_path)
        hold = max(MIN_PAGE_HOLD, min(MAX_PAGE_HOLD, adur + 0.65))
        log("  audio=%.2fs hold=%.2fs" % (adur, hold))
        notes.append("page %s: narration %.1fs hold %.1fs" % (i+1, adur, hold))
        title = (page.get("title") or "").strip()
        body_txt = (page.get("text") or "").strip()
        want_clip = max(4, min(CLIP_SEC, int(math.ceil(hold))))
        have_seed = ffprobe_dur(seed_path) if seed_path.exists() else 0.0
        if have_seed >= max(want_clip - 0.75, min(hold, CLIP_SEC) * 0.85):
            log("  reuse local seed (%.1fs)" % have_seed)
        elif ALLOW_SEEDANCE:
            prompt = seedance_prompt(role, child, title, body_txt, zoom_continue=False)
            log("  Seedance NEW model=%s want=%ss hold=%.1fs retries=%s" % (
                SEEDANCE, CLIP_SEC if hold > CLIP_SEC else want_clip, hold, PAGE_SEEDANCE_RETRIES))
            try:
                if hold > CLIP_SEC + 0.5 and ALLOW_CHAIN:
                    extend_seedance_to_hold(img_url, prompt, seed_path, hold, role, child, title, body_txt)
                    notes.append("page %s: Seedance %ss + chain toward %.0fs" % (i+1, CLIP_SEC, hold))
                else:
                    animate_seedance(img_url, prompt, seed_path, duration_sec=want_clip)
                    notes.append("page %s: NEW Seedance %ss" % (i+1, want_clip))
                sdur = ffprobe_dur(seed_path)
                if sdur < 2.0:
                    raise RuntimeError("seed missing/short after generate (%.2fs)" % sdur)
                new_seed += 1
                # Prefer measured seed duration; chain parts already included in file length.
                billed_seconds += sdur if sdur > 0 else float(want_clip)
                notes.append("page %s seed_dur=%.1fs" % (i+1, sdur))
            except Exception as e:
                log("  seedance fail after retries: " + str(e)[:200])
                if ALLOW_KENBURNS_FALLBACK:
                    still_from_image(img_path, hold, seed_path)
                    kenburns += 1
                    notes.append("page %s: Ken Burns fallback full hold (ALLOWED)" % (i+1))
                else:
                    # Fail the whole job rather than ship a frozen finale.
                    raise RuntimeError(
                        "page %s Seedance failed and Ken Burns fallback disabled: %s" % (i+1, e)
                    )
        else:
            if not ALLOW_KENBURNS_FALLBACK:
                raise RuntimeError("ALLOW_SEEDANCE=0 but Ken Burns fallback disabled")
            still_from_image(img_path, hold, seed_path)
            kenburns += 1
        if fitted_path.exists():
            try: fitted_path.unlink()
            except Exception: pass
        if muxed_path.exists():
            try: muxed_path.unlink()
            except Exception: pass
        fit_video_to_duration(seed_path, hold, fitted_path)
        mux_av(fitted_path, audio_path, muxed_path, hold)
        log("  muxed=%.2fs seed=%.2fs" % (ffprobe_dur(muxed_path), ffprobe_dur(seed_path)))
        page_movies.append(muxed_path)
        state["pages"][str(i+1)] = {"hold": hold, "audio": adur, "seed": ffprobe_dur(seed_path), "line": line[:240], "model": SEEDANCE, "clip_max": CLIP_SEC}
        state_path.write_text(json.dumps(state, indent=2))
    end_path = OUT / "end_bump.mp4"
    if end_path.exists(): end_path.unlink()
    prepare_end_bump(end_path)
    end_fit = OUT / "end_bump_fit.mp4"
    end_dur = max(5.0, min(14.0, ffprobe_dur(end_path) or 10.0))
    if end_fit.exists(): end_fit.unlink()
    fit_video_to_duration(end_path, end_dur, end_fit)
    end_av = OUT / "end_bump_av.mp4"
    r = run(["ffmpeg","-y","-i",str(end_fit),"-f","lavfi","-i","anullsrc=channel_layout=stereo:sample_rate=44100","-t","%.3f"%end_dur,"-c:v","libx264","-pix_fmt","yuv420p","-preset","veryfast","-crf","18","-c:a","aac","-b:a","128k","-shortest",str(end_av)], check=False)
    if r.returncode != 0: raise RuntimeError("end av fail")
    notes.append("end spin %.1fs Justin bump" % end_dur)
    page_movies.append(end_av)
    concat_list = OUT / "concat.txt"
    with concat_list.open("w") as f:
        for mp in page_movies:
            f.write("file '%s'%s" % (mp.resolve(), chr(10)))
    final = OUT / "final.mp4"
    log("concat %s segments" % len(page_movies))
    r = run(["ffmpeg","-y","-f","concat","-safe","0","-i",str(concat_list),"-c:v","libx264","-pix_fmt","yuv420p","-preset","fast","-crf","18","-c:a","aac","-b:a","192k","-movflags","+faststart",str(final)], check=False)
    if r.returncode != 0: raise RuntimeError("concat fail: " + (r.stderr or "")[-400:])
    total = ffprobe_dur(final)
    log("FINAL duration=%.1fs" % total)
    log("credit new_seedance=%s kenburns=%s billed_s~%.0f" % (new_seed, kenburns, billed_seconds))
    final_bgm = OUT / "final-bgm.mp4"
    try:
        mix_bgm(final, final_bgm)
        if final_bgm.exists() and final_bgm.stat().st_size > 100000:
            final = final_bgm
            notes.append("bgm bed=%s vol=%.2f" % (BGM_BED_LOCAL.name, BGM_VOLUME))
            total = ffprobe_dur(final)
            log("FINAL+BGM duration=%.1fs" % total)
    except Exception as e:
        log("BGM step warn: " + str(e)[:160])
    upload_src = OUT / "final-upload.mp4"
    log("compress")
    r = run(["ffmpeg","-y","-i",str(final),"-c:v","libx264","-preset","fast","-crf","23","-c:a","aac","-b:a","128k","-movflags","+faststart",str(upload_src)], check=False)
    if r.returncode != 0 or not upload_src.exists(): upload_src = final
    log("upload fal")
    url = upload_fal_storage(upload_src)
    log("URL " + url)
    (OUT / "final_url.txt").write_text(url + chr(10))
    est = billed_seconds * SEEDANCE_COST_PER_SEC if billed_seconds else new_seed * CLIP_SEC * SEEDANCE_COST_PER_SEC
    note_parts = [
        "Tinny Mac mini FULL Seedance READY",
        "model=%s clip_max=%ss continuous zoom" % (SEEDANCE, CLIP_SEC),
        "duration~%.0fs pages=%s + end spin" % (total, len(pages)),
        "Seedance new=%s KenBurns=%s" % (new_seed, kenburns),
        "est cost ~$%.0f motion (approx)" % est,
    ] + notes[:20]
    note = chr(10).join(note_parts)
    if PATCH_SITE_VIDEO:
        patch("ready", video_url=url, notes=note, package="full")
        log("patched ready")
    else:
        log("PATCH_SITE_VIDEO=0 — final URL saved locally only")
    heartbeat("ready", url=url, duration=total, new_seed=new_seed, kenburns=kenburns)
    print(url)
    return 0

if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as e:
        log("FAILED " + str(e))
        try:
            patch("requested", notes="Tinny FULL Seedance FAILED: " + str(e)[:300])
        except Exception:
            pass
        raise
