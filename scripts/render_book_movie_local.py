#!/usr/bin/env python3
import json, re, time, urllib.error, urllib.request
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
BOOK_ID = __import__("os").environ.get("BOOK_ID", "5894d859-b521-4d01-8aa5-f4ab03e5d4e4")
OUT = ROOT / "tmp-movie" / ("book-" + BOOK_ID[:8])
OUT.mkdir(parents=True, exist_ok=True)
LOG = OUT / "render.log"
SITE = "https://www.storybookphotos.com"
ADMIN = "3121"
tools = Path("/Users/brandastic/.openclaw/workspace/TOOLS.md").read_text()
FAL = re.search(r"dd81a063-9b3b-4eae-a34f-e73f9b013fdc:[A-Za-z0-9]+", tools).group(0)
SEEDANCE = "bytedance/seedance-2.0/fast/image-to-video"
COMPOSE = "fal-ai/ffmpeg-api/compose"
MERGE_V = "fal-ai/ffmpeg-api/merge-videos"
META = "fal-ai/ffmpeg-api/metadata"
STILL = "fal-ai/ffmpeg-api/images-to-video"
TTS = "fal-ai/minimax/speech-02-hd"
END_BUMP = SITE + "/brand/movie-end-bump.mp4"
END_CARD = SITE + "/brand/movie-end-card-16x9.png"
CLIP_SEC = 5
MAX_CLIPS = 6

def log(m):
    line = time.strftime("%H:%M:%S ") + m
    print(line, flush=True)
    with LOG.open("a") as f:
        f.write(line + chr(10))

def http_json(method, url, headers=None, body=None, timeout=120):
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read()
            return json.loads(raw.decode()) if raw else {}
    except urllib.error.HTTPError as e:
        detail = e.read()[:500].decode(errors="ignore")
        raise RuntimeError("HTTP %s %s: %s" % (e.code, url, detail))

def fal_headers():
    return {"Authorization": "Key " + FAL, "Content-Type": "application/json"}

def fal_queue(model, payload, timeout_s=900):
    sub = http_json("POST", "https://queue.fal.run/" + model, fal_headers(), payload, 60)
    if isinstance(sub.get("video"), dict) and sub["video"].get("url"):
        return sub
    if sub.get("video_url"):
        return sub
    audio = sub.get("audio")
    if isinstance(audio, dict) and audio.get("url"):
        return sub
    rid = sub.get("request_id")
    if not rid:
        raise RuntimeError("no request_id " + str(sub)[:300])
    status_url = sub.get("status_url") or ("https://queue.fal.run/%s/requests/%s/status" % (model, rid))
    result_url = sub.get("response_url") or ("https://queue.fal.run/%s/requests/%s" % (model, rid))
    start = time.time()
    while time.time() - start < timeout_s:
        st = http_json("GET", status_url, {"Authorization": "Key " + FAL}, timeout=60)
        s = st.get("status")
        if s == "COMPLETED":
            return http_json("GET", result_url, {"Authorization": "Key " + FAL}, timeout=120)
        if s in ("FAILED", "ERROR"):
            raise RuntimeError(str(st)[:400])
        time.sleep(4)
    raise TimeoutError(model)

def extract_video(res):
    if not isinstance(res, dict):
        return None
    v = res.get("video")
    if isinstance(v, dict) and v.get("url"):
        return v["url"]
    return res.get("video_url")

def extract_audio(res):
    if not isinstance(res, dict):
        return None
    a = res.get("audio")
    if isinstance(a, dict) and a.get("url"):
        return a["url"]
    return res.get("audio_url")

def probe(url):
    try:
        res = fal_queue(META, {"media_url": url}, 180)
        m = res.get("media") or res
        return float(m.get("duration") or 0)
    except Exception as e:
        log("probe fail " + str(e)[:120])
        return 0

def patch(status, video_url=None, notes=None, package="teaser"):
    body = {"video_status": status, "video_package": package}
    if video_url is not None:
        body["video_url"] = video_url
    if notes is not None:
        body["video_notes"] = notes
    return http_json("PATCH", "%s/api/storybooks/%s/video" % (SITE, BOOK_ID), {"Content-Type": "application/json", "x-admin-code": ADMIN}, body)

def get_book():
    data = http_json("GET", SITE + "/api/admin/storybooks", {"x-admin-code": ADMIN})
    for b in data.get("storybooks") or []:
        if b.get("id") == BOOK_ID:
            return b
    raise RuntimeError("book not found")

def tts(text):
    res = fal_queue(TTS, {"text": text[:1000], "voice_id": "Wise_Woman"}, 300)
    url = extract_audio(res)
    if not url:
        raise RuntimeError("tts no url " + str(res)[:200])
    return url

def animate(img, prompt):
    res = fal_queue(SEEDANCE, {"prompt": prompt, "image_url": img, "resolution": "720p", "duration": str(CLIP_SEC), "aspect_ratio": "16:9", "generate_audio": False}, 900)
    url = extract_video(res)
    if not url:
        raise RuntimeError("seedance no url")
    return url

def still(img, sec):
    res = fal_queue(STILL, {"fps": 24, "images": [{"url": img, "frames": max(24, int(sec * 24))}]}, 300)
    url = extract_video(res)
    if not url:
        raise RuntimeError("still no url")
    return url

def main():
    state = json.loads((OUT / "state.json").read_text()) if (OUT / "state.json").exists() else {"clips": [], "notes": [], "t": 0, "audio": []}
    clip_urls = list(state.get("clips") or [])
    notes = list(state.get("notes") or [])
    audio_kfs = list(state.get("audio") or [])
    t = int(state.get("t") or 0)
    log("local worker book=%s clips=%s t=%s" % (BOOK_ID, len(clip_urls), t))
    book = get_book()
    child = book.get("child_name") or "Lela"
    role = "Queen" if book.get("gender") == "girl" else "King"
    pages = book.get("pages") or []
    if isinstance(pages, str):
        pages = json.loads(pages)
    pages = [p for p in pages if isinstance(p, dict) and str(p.get("imageUrl") or "").startswith("http")]
    if len(pages) > MAX_CLIPS:
        idxs = [round(i * (len(pages) - 1) / (MAX_CLIPS - 1)) for i in range(MAX_CLIPS)]
        pages = [pages[i] for i in sorted(set(idxs))]
    # rebuild durations from existing clips via probe if audio missing
    durs = []
    if not audio_kfs and clip_urls:
        log("rebuilding audio for existing clips")
        t = 0
        for i, p in enumerate(pages[:len(clip_urls)]):
            title = (p.get("title") or "").strip()
            text = (p.get("text") or "").strip()
            line = ((title + ". ") if title and not text.lower().startswith(title.lower()) else "") + text
            if not line:
                line = "%s %s continues the adventure." % (role, child)
            try:
                aurl = tts(line[:360])
                adur = probe(aurl) or CLIP_SEC
                hold = max(CLIP_SEC, min(8, adur + 0.5))
            except Exception as e:
                aurl = None
                hold = CLIP_SEC
                log("tts rebuild fail " + str(e)[:100])
            vdur = probe(clip_urls[i]) or hold
            hold = min(hold, vdur) if vdur else hold
            ms = int(hold * 1000)
            durs.append(ms)
            if aurl:
                audio_kfs.append({"timestamp": t, "duration": ms, "url": aurl})
            t += ms
    else:
        # probe existing clip durations
        for u in clip_urls:
            durs.append(int((probe(u) or CLIP_SEC) * 1000))
        t = sum(durs)
    # finish remaining pages
    for i in range(len(clip_urls), len(pages)):
        p = pages[i]
        img = p["imageUrl"]
        title = (p.get("title") or "").strip()
        text = (p.get("text") or "").strip()
        line = ((title + ". ") if title and not text.lower().startswith(title.lower()) else "") + text
        if not line:
            line = "%s %s continues the adventure." % (role, child)
        line = line[:360]
        log("tts %s/%s" % (i + 1, len(pages)))
        try:
            aurl = tts(line)
            adur = probe(aurl) or 5
            hold = max(CLIP_SEC, min(8, adur + 0.5))
            notes.append("narration %s ok ~%.1fs" % (i + 1, hold))
        except Exception as e:
            aurl = None
            hold = CLIP_SEC
            notes.append("narration fail " + str(e)[:80])
        prompt = ("STYLE LOCK: 2D watercolor children storybook illustration coming gently alive. NOT anime NOT 3D CGI NOT photoreal. "
                  "Face/eyes/outfit locked. Slow gentle push-in. Soft breeze hair cloth leaves sparkle dust subtle blink. No text. "
                  "Hero %s %s. Beat: %s" % (role, child, (title or text)[:120]))
        log("seedance %s/%s" % (i + 1, len(pages)))
        vurl = animate(img, prompt)
        notes.append("clip %s Seedance Fast animated" % (i + 1))
        vdur = probe(vurl) or CLIP_SEC
        if hold > vdur + 0.4:
            loops = min(3, max(2, int(hold / max(vdur, 1)) + 1))
            log("loop clip %s x%s" % (i + 1, loops))
            merged = fal_queue(MERGE_V, {"video_urls": [vurl] * loops, "target_fps": 24, "resolution": {"width": 1280, "height": 720}}, 600)
            vurl = extract_video(merged) or vurl
            vdur = probe(vurl) or hold
        hold = min(hold, vdur) if vdur else hold
        ms = int(hold * 1000)
        clip_urls.append(vurl)
        durs.append(ms)
        if aurl:
            audio_kfs.append({"timestamp": t, "duration": ms, "url": aurl})
        t += ms
        (OUT / "state.json").write_text(json.dumps({"clips": clip_urls, "notes": notes, "t": t, "audio": audio_kfs}, indent=2))
    log("end bump")
    try:
        scaled = fal_queue(MERGE_V, {"video_urls": [END_BUMP], "target_fps": 24, "resolution": {"width": 1280, "height": 720}}, 600)
        eurl = extract_video(scaled) or END_BUMP
        ed = probe(eurl) or 10
        clip_urls.append(eurl)
        durs.append(int(ed * 1000))
        t += int(ed * 1000)
        notes.append("end bump scaled 16:9")
    except Exception as e:
        log("end bump fail " + str(e)[:120])
        eurl = still(END_CARD, 5)
        clip_urls.append(eurl)
        durs.append(5000)
        t += 5000
        notes.append("end card still")
    log("compose clips=%s" % len(clip_urls))
    ts = 0
    vk = []
    for u, d in zip(clip_urls, durs):
        vk.append({"timestamp": ts, "duration": d, "url": u})
        ts += d
    tracks = [{"id": "video", "type": "video", "keyframes": vk}]
    if audio_kfs:
        tracks.append({"id": "narration", "type": "audio", "keyframes": audio_kfs})
    composed = fal_queue(COMPOSE, {"tracks": tracks}, 900)
    final = extract_video(composed)
    if not final:
        raise RuntimeError("compose no url")
    notes.append("compose ok ~%.0fs" % (ts / 1000.0))
    log("FINAL " + final)
    (OUT / "final_url.txt").write_text(final)
    (OUT / "notes.json").write_text(json.dumps(notes, indent=2))
    note = chr(10).join(["Tinny local Mac mini worker READY", "provider=seedance-fast+minimax+ffmpeg", "animated_clips=%s" % max(0, len(clip_urls)-1)] + notes[:20])
    patch("ready", video_url=final, notes=note)
    log("patched ready")
    return 0

if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as e:
        log("FAILED " + str(e))
        try:
            patch("requested", notes="Tinny local Mac mini worker FAILED: " + str(e)[:300])
        except Exception:
            pass
        raise
