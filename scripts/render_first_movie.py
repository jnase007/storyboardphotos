#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOK_PATH = ROOT / "tmp-movie" / "book.json"
OUT_DIR = ROOT / "tmp-movie"
OUT_DIR.mkdir(parents=True, exist_ok=True)
STATE_PATH = OUT_DIR / "render_state.json"
LOG_PATH = OUT_DIR / "render.log"

FAL_KEY = os.environ.get(
    "FAL_KEY",
    "dd81a063-9b3b-4eae-a34f-e73f9b013fdc:249a4951d574078d090736248afad1fb",
)
ELEVEN_KEY = os.environ.get(
    "ELEVENLABS_API_KEY",
    "sk_acf3f2dbb8187bbc916c584e234d5af25d672906aba9c44b",
)
ELEVEN_VOICE = os.environ.get("ELEVENLABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")
ADMIN_CODE = "3121"
SITE = "https://www.storybookphotos.com"
BOOK_ID = "034d5191-d94f-46b4-973f-6d62a0b4801c"
TEASER_MAX = 5
SEEDANCE = "bytedance/seedance-2.0/image-to-video"
COMPOSE = "fal-ai/ffmpeg-api/compose"
MERGE = "fal-ai/ffmpeg-api/merge-audio-video"
STILL = "fal-ai/ffmpeg-api/images-to-video"
END_CARD = "https://www.storybookphotos.com/brand/movie-end-card-v3.png"
END_CARD_SEC = 4


def log(msg):
    line = "%s %s" % (time.strftime("%H:%M:%S"), msg)
    print(line, flush=True)
    with LOG_PATH.open("a") as handle:
        handle.write(line + chr(10))


def save_state(state):
    STATE_PATH.write_text(json.dumps(state, indent=2))


def http_json(method, url, headers, body=None, timeout=120):
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read()
            if not raw:
                return {}
            return json.loads(raw.decode())
    except urllib.error.HTTPError as err:
        detail = err.read().decode(errors="ignore")
        raise RuntimeError("HTTP %s %s: %s" % (err.code, url, detail[:500]))


def fal_headers():
    return {
        "Authorization": "Key %s" % FAL_KEY,
        "Content-Type": "application/json",
    }


def fal_queue(model, payload, timeout_s=900):
    submitted = http_json(
        "POST",
        "https://queue.fal.run/%s" % model,
        fal_headers(),
        payload,
        timeout=60,
    )
    video = submitted.get("video")
    if isinstance(video, dict) and video.get("url"):
        return submitted
    if submitted.get("video_url"):
        return submitted
    request_id = submitted.get("request_id")
    if not request_id:
        raise RuntimeError("fal submit missing request_id: %s" % str(submitted)[:300])
    status_url = submitted.get("status_url") or (
        "https://queue.fal.run/%s/requests/%s/status" % (model, request_id)
    )
    result_url = submitted.get("response_url") or (
        "https://queue.fal.run/%s/requests/%s" % (model, request_id)
    )
    started = time.time()
    while True:
        if time.time() - started >= timeout_s:
            raise TimeoutError("fal timeout %s after %ss" % (model, timeout_s))
        st = http_json(
            "GET",
            status_url,
            {"Authorization": "Key %s" % FAL_KEY},
            timeout=60,
        )
        status = st.get("status")
        if status == "COMPLETED":
            return http_json(
                "GET",
                result_url,
                {"Authorization": "Key %s" % FAL_KEY},
                timeout=120,
            )
        if status in ("FAILED", "ERROR"):
            raise RuntimeError("fal failed %s: %s" % (model, str(st)[:400]))
        time.sleep(4)


def patch_book(video_url=None, notes=None, status="in_production"):
    body = {"video_status": status}
    if video_url:
        body["video_url"] = video_url
    if notes is not None:
        body["video_notes"] = notes
    return http_json(
        "PATCH",
        "%s/api/storybooks/%s/video" % (SITE, BOOK_ID),
        {"Content-Type": "application/json", "x-admin-code": ADMIN_CODE},
        body,
    )


def tracker_note(step, pct, detail, **extra):
    labels = {
        "queued": "Order in",
        "prep": "Prep",
        "oven": "In the oven",
        "quality": "Quality check",
        "delivery": "Out for delivery",
        "done": "Delivered",
        "failed": "Burned batch",
    }
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    state = {
        "v": 1,
        "tracker": True,
        "step": step,
        "label": labels.get(step, step),
        "pct": pct,
        "detail": detail,
        "startedAt": extra.get("startedAt") or now,
        "updatedAt": now,
    }
    for key in ("clipsDone", "clipsTotal", "error", "videoUrl"):
        if extra.get(key) is not None:
            state[key] = extra[key]
    return "TRACKER|" + json.dumps(state)


def motion_prompt(title, text, name):
    beat = (title or text or "magical kingdom scene")[:160]
    return (
        "Premium Disney-quality children's storybook illustration coming gently to life. "
        "Preserve the exact watercolor painting, soft sepia ink outlines, cream paper texture, "
        "and character likeness of King %s. Scene: %s. "
        "Cinematic slow camera push-in with subtle parallax depth. "
        "Soft magical sparkles and warm fairy light. Hair, cape, leaves move lightly. "
        "Keep face stable and on-model - no morphing. No text, no watermark. "
        "Wholesome fairytale bedtime energy."
    ) % (name, beat)


def page_duration(text):
    words = len((text or "").split())
    return max(6, min(10, 5 + words // 20))


def pick_teaser_pages(pages):
    filtered = []
    for page in pages:
        title = (page.get("title") or "").strip().lower()
        text = (page.get("text") or "").strip()
        if title == "title page":
            continue
        if len(text) <= 80 and "and the" in text.lower() and chr(10) not in text:
            continue
        if page.get("imageUrl"):
            filtered.append(page)
    if len(filtered) <= TEASER_MAX:
        return filtered
    idxs = [
        0,
        len(filtered) // 4,
        len(filtered) // 2,
        (3 * len(filtered)) // 4,
        len(filtered) - 1,
    ]
    uniq = sorted(set(idxs))
    return [filtered[i] for i in uniq]


def elevenlabs_narration(script):
    if not ELEVEN_KEY:
        return None
    url = "https://api.elevenlabs.io/v1/text-to-speech/%s" % ELEVEN_VOICE
    headers = {
        "xi-api-key": ELEVEN_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }
    body = {
        "text": script,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.45,
            "similarity_boost": 0.8,
            "style": 0.35,
            "use_speaker_boost": True,
        },
    }
    req = urllib.request.Request(
        url, data=json.dumps(body).encode(), headers=headers, method="POST"
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        audio = resp.read()
    (OUT_DIR / "narration.mp3").write_bytes(audio)
    log("narration bytes=%s" % len(audio))
    try:
        up = urllib.request.Request(
            "https://rest.alpha.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3",
            data=json.dumps(
                {"content_type": "audio/mpeg", "file_name": "narration.mp3"}
            ).encode(),
            headers=fal_headers(),
            method="POST",
        )
        with urllib.request.urlopen(up, timeout=60) as resp:
            init = json.loads(resp.read().decode())
        upload_url = init.get("upload_url")
        file_url = init.get("file_url") or init.get("url")
        if upload_url:
            put = urllib.request.Request(
                upload_url,
                data=audio,
                headers={"Content-Type": "audio/mpeg"},
                method="PUT",
            )
            with urllib.request.urlopen(put, timeout=120) as resp:
                resp.read()
            if file_url:
                return file_url
    except Exception as err:
        log("fal audio upload failed: %s" % err)
    return None


def build_script(name, pages):
    nl = chr(10)
    lines = [
        "Once upon a time, in the Kingdom of Light, there lived King %s." % name,
        "",
    ]
    for page in pages:
        body = (page.get("text") or "").strip()
        if not body:
            continue
        title = (page.get("title") or "").strip()
        if title and title.lower() not in ("title page", "the end"):
            lines.append(title + ".")
        lines.append(body)
        lines.append("")
    lines.append(
        "And so, King %s lived bravely ever after - knowing %s is strong, kind, and deeply loved."
        % (name, name)
    )
    lines.append("The End.")
    lines.append("Sweet dreams, King %s." % name)
    return nl.join(lines)


def main():
    if LOG_PATH.exists():
        LOG_PATH.write_text("")
    if not BOOK_PATH.exists():
        log("missing book.json")
        return 1

    book = json.loads(BOOK_PATH.read_text())
    name = book.get("child_name") or "Justin"
    pages_all = book.get("pages") or []
    pages = pick_teaser_pages(pages_all)
    log("teaser pages=%s of %s" % (len(pages), len(pages_all)))
    started = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    state = {"startedAt": started, "clips": [], "stage": "prep"}
    save_state(state)

    patch_book(
        status="in_production",
        notes=tracker_note(
            "prep",
            12,
            "Local kitchen: prepping %s-page teaser..." % len(pages),
            startedAt=started,
            clipsDone=0,
            clipsTotal=len(pages),
        ),
    )

    script = build_script(name, pages)
    (OUT_DIR / "script.txt").write_text(script)
    narration_url = None
    try:
        narration_url = elevenlabs_narration(script)
        log("narration_url=%s" % str(narration_url)[:90])
    except Exception as err:
        log("narration failed (continue silent): %s" % err)

    patch_book(
        status="in_production",
        notes=tracker_note(
            "oven",
            25,
            "Pages going into the oven (Seedance)...",
            startedAt=started,
            clipsDone=0,
            clipsTotal=len(pages),
        ),
    )

    clip_urls = []
    clip_durs_ms = []
    for i, page in enumerate(pages):
        title = page.get("title") or ("page %s" % (i + 1))
        img = page.get("imageUrl")
        dur = page_duration(page.get("text") or "")
        log("[%s/%s] animate %s (%ss)" % (i + 1, len(pages), title, dur))
        patch_book(
            status="in_production",
            notes=tracker_note(
                "oven",
                25 + int(45 * i / max(1, len(pages))),
                "Page %s/%s: %s" % (i + 1, len(pages), title),
                startedAt=started,
                clipsDone=i,
                clipsTotal=len(pages),
            ),
        )
        prompt = motion_prompt(title, page.get("text") or "", name)
        url = None
        try:
            result = fal_queue(
                SEEDANCE,
                {
                    "prompt": prompt,
                    "image_url": img,
                    "resolution": "720p",
                    "duration": str(dur),
                    "aspect_ratio": "16:9",
                    "generate_audio": False,
                    "bitrate_mode": "standard",
                },
                timeout_s=900,
            )
            url = (result.get("video") or {}).get("url") or result.get("video_url")
            if not url:
                raise RuntimeError("no url: %s" % str(result)[:200])
            log("  seedance ok %s" % url[:70])
        except Exception as err:
            log("  seedance fail -> still: %s" % err)
            try:
                still = fal_queue(
                    STILL,
                    {"fps": 24, "images": [{"url": img, "frames": int(dur * 24)}]},
                    timeout_s=300,
                )
                url = (still.get("video") or {}).get("url") or still.get("video_url")
                log("  still ok %s" % str(url)[:70])
            except Exception as err2:
                log("  dropped page: %s" % err2)
                continue
        clip_urls.append(url)
        clip_durs_ms.append(dur * 1000)
        state["clips"] = clip_urls
        save_state(state)
        patch_book(
            status="in_production",
            notes=tracker_note(
                "oven",
                25 + int(45 * (i + 1) / max(1, len(pages))),
                "Finished page %s/%s" % (i + 1, len(pages)),
                startedAt=started,
                clipsDone=i + 1,
                clipsTotal=len(pages),
            ),
        )

    if not clip_urls:
        patch_book(
            status="requested",
            notes=tracker_note(
                "failed",
                0,
                "All page animations failed",
                startedAt=started,
                error="no clips",
            ),
        )
        return 2

    # Closing slate: Storybook Photos logo
    try:
        log("end card Storybook Photos logo")
        end_still = fal_queue(
            STILL,
            {
                "fps": 24,
                "images": [{"url": END_CARD, "frames": int(END_CARD_SEC * 24)}],
            },
            timeout_s=300,
        )
        end_url = (end_still.get("video") or {}).get("url") or end_still.get(
            "video_url"
        )
        if end_url:
            clip_urls.append(end_url)
            clip_durs_ms.append(END_CARD_SEC * 1000)
            log("  end card ok")
    except Exception as err:
        log("  end card skipped: %s" % err)

    log("stitching %s clips" % len(clip_urls))
    patch_book(
        status="in_production",
        notes=tracker_note(
            "quality",
            78,
            "Stitching %s clips..." % len(clip_urls),
            startedAt=started,
            clipsDone=len(clip_urls),
            clipsTotal=len(pages),
        ),
    )

    ts = 0
    keyframes = []
    for u, dms in zip(clip_urls, clip_durs_ms):
        keyframes.append({"timestamp": ts, "duration": dms, "url": u})
        ts += dms
    tracks = [{"id": "video", "type": "video", "keyframes": keyframes}]
    if narration_url:
        tracks.append(
            {
                "id": "narration",
                "type": "audio",
                "keyframes": [{"timestamp": 0, "duration": ts, "url": narration_url}],
            }
        )

    final_url = None
    try:
        composed = fal_queue(COMPOSE, {"tracks": tracks}, timeout_s=600)
        final_url = composed.get("video_url") or (composed.get("video") or {}).get(
            "url"
        )
        log("compose url=%s" % str(final_url)[:90])
    except Exception as err:
        log("compose failed: %s" % err)
        final_url = clip_urls[0]
        if narration_url:
            try:
                patch_book(
                    status="in_production",
                    notes=tracker_note(
                        "delivery",
                        90,
                        "Mixing bedtime narration...",
                        startedAt=started,
                    ),
                )
                merged = fal_queue(
                    MERGE,
                    {"video_url": final_url, "audio_url": narration_url},
                    timeout_s=600,
                )
                murl = (merged.get("video") or {}).get("url") or merged.get(
                    "video_url"
                )
                if murl:
                    final_url = murl
                    log("merged url=%s" % final_url[:90])
            except Exception as err2:
                log("merge failed: %s" % err2)

    if not final_url:
        patch_book(
            status="requested",
            notes=tracker_note(
                "failed",
                0,
                "No final URL",
                startedAt=started,
                error="no final url",
            ),
        )
        return 3

    (OUT_DIR / "final_url.txt").write_text(final_url)
    nl = chr(10)
    notes = tracker_note(
        "done",
        100,
        "Round-1 teaser ready · %s pages" % len(clip_urls),
        startedAt=started,
        clipsDone=len(clip_urls),
        clipsTotal=len(pages),
        videoUrl=final_url,
    )
    notes = notes + nl + nl + "provider=local-seedance-teaser" + nl + nl.join(clip_urls)
    patch_book(status="ready", video_url=final_url, notes=notes)
    log("DONE %s" % final_url)
    state["final_url"] = final_url
    state["stage"] = "done"
    save_state(state)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as err:
        log("FATAL %s" % err)
        try:
            patch_book(
                status="requested",
                notes=tracker_note(
                    "failed", 0, str(err)[:180], error=str(err)[:400]
                ),
            )
        except Exception:
            pass
        raise
