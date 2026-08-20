#!/usr/bin/env python3
"""Mac mini movie queue worker — best-setup path.

1) Approve art in admin (hard gate)
2) One button: Make Fast movie (~$30)
3) This worker auto-picks it up
4) BGM + full narration + no Ken Burns fallback
5) Site status updates when ready/failed
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE_PATH = ROOT / "tmp-movie" / "queue-worker-state.json"
LOG_PATH = ROOT / "tmp-movie" / "queue-worker.log"
PID_PATH = ROOT / "tmp-movie" / "queue-worker.pid"
NOTIFY_PATH = ROOT / "tmp-movie" / "queue-worker-notify.txt"
SITE = os.environ.get("STORYBOOK_SITE", "https://www.storybookphotos.com").rstrip("/")
ADMIN = os.environ.get("STORYBOOK_ADMIN_CODE", "3121")
POLL_SEC = int(os.environ.get("MOVIE_QUEUE_POLL_SEC", "45"))
DEFAULT_MIN_CREATED = "2026-08-19T00:00:00+00:00"
MIN_CREATED = os.environ.get("MOVIE_QUEUE_MIN_CREATED", DEFAULT_MIN_CREATED)

FAST_ENV = {
    "SEEDANCE_OUT_TAG": "fast15",
    "SEEDANCE_MODEL": "bytedance/seedance-2.0/fast/image-to-video",
    "SEEDANCE_CLIP_SEC": "15",
    "SEEDANCE_ALLOW_CHAIN": "1",
    "SEEDANCE_COST_PER_SEC": "0.2419",
    "SEEDANCE_MAX_CHAIN_PARTS": "6",
    "ALLOW_KENBURNS_FALLBACK": "0",
    "PAGE_SEEDANCE_RETRIES": "3",
    "ENABLE_BGM": "1",
    "PATCH_SITE_VIDEO": "1",
    "ALLOW_SEEDANCE": "1",
    "FORCE_RERENDER": "0",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def log(msg: str) -> None:
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    line = "%s %s" % (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), msg)
    print(line, flush=True)
    with LOG_PATH.open("a") as fh:
        fh.write(line + chr(10))


def load_state() -> dict:
    if STATE_PATH.exists():
        try:
            return json.loads(STATE_PATH.read_text())
        except Exception:
            pass
    return {"claimed": {}, "finished": {}, "skipped": {}}


def save_state(state: dict) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, indent=2) + chr(10))


def http_json(method, url, headers=None, body=None, timeout=45):
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Accept", "application/json")
    if body is not None:
        req.add_header("Content-Type", "application/json")
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        err = exc.read().decode(errors="replace")[:400]
        raise RuntimeError("HTTP %s %s: %s" % (exc.code, url, err)) from exc


def admin_headers():
    return {"x-admin-code": ADMIN}


def list_jobs():
    data = http_json("GET", SITE + "/api/admin/video-jobs", admin_headers())
    return list(data.get("jobs") or [])


def get_book(book_id):
    return http_json("GET", SITE + "/api/admin/storybooks/" + book_id, admin_headers())


def patch_video(book_id, body):
    return http_json(
        "PATCH",
        SITE + "/api/storybooks/" + book_id + "/video",
        admin_headers(),
        body,
        timeout=60,
    )


def parse_created(iso):
    if not iso:
        return 0.0
    try:
        return datetime.fromisoformat(iso.replace("Z", "+00:00")).timestamp()
    except Exception:
        return 0.0


def is_active_render(book_id, out_tag="fast15"):
    out = ROOT / "tmp-movie" / ("book-%s-%s" % (book_id[:8], out_tag))
    pid_path = out / "worker.pid"
    if not pid_path.exists():
        return False, ""
    pid = pid_path.read_text().strip()
    if not pid.isdigit():
        return False, pid
    try:
        os.kill(int(pid), 0)
        return True, pid
    except OSError:
        return False, pid


def any_paid_render_running(state):
    for book_id, meta in list(state.get("claimed", {}).items()):
        tag = meta.get("out_tag") or "fast15"
        alive, pid = is_active_render(book_id, tag)
        if alive:
            return book_id
        state["claimed"].pop(book_id, None)
        save_state(state)
        log("cleared stale claim book=%s old_pid=%s" % (book_id, pid))
    movie_root = ROOT / "tmp-movie"
    if movie_root.exists():
        for d in movie_root.glob("book-*-fast15"):
            pid_path = d / "worker.pid"
            if not pid_path.exists():
                continue
            pid = pid_path.read_text().strip()
            if pid.isdigit():
                try:
                    os.kill(int(pid), 0)
                    return d.name
                except OSError:
                    pass
    return None


def job_is_queue_candidate(job, min_ts):
    if job.get("video_url"):
        return False, "already has video_url"
    status = (job.get("video_status") or "").lower()
    if status in ("ready", "delivered", "none"):
        return False, "status=%s" % status
    notes = job.get("video_notes") or ""
    pkg = (job.get("video_package") or "").lower()
    created = parse_created(
        job.get("video_requested_at") or job.get("created_at") or job.get("updated_at")
    )
    if created and created < min_ts:
        return False, "too old (pre-cutoff)"
    if "premium" in pkg and "ALLOW_PREMIUM" not in notes:
        return False, "premium blocked"
    if "draft" in pkg:
        return False, "draft package"
    local_marker = "LOCAL_WORKER_QUEUE" in notes
    fastish = (
        local_marker
        or "standard" in pkg
        or "fast" in pkg
        or pkg in ("full", "teaser", "")
        or status in ("requested", "in_production", "paid")
    )
    if not fastish:
        return False, "package not fastish pkg=%s" % pkg
    return True, "ok"


def book_approved(book):
    return (book.get("status") or "").lower() == "approved"


def start_fast_movie(book_id):
    env = os.environ.copy()
    env.update(FAST_ENV)
    env["BOOK_ID"] = book_id
    env["ALLOW_KENBURNS_FALLBACK"] = "0"
    env["PAGE_SEEDANCE_RETRIES"] = "3"
    env["ENABLE_BGM"] = "1"
    script = ROOT / "scripts" / "start_full_seedance_detached.sh"
    proc = subprocess.run(
        ["bash", str(script)],
        cwd=str(ROOT),
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )
    out = (proc.stdout or "") + (proc.stderr or "")
    log("start_full_seedance book=%s rc=%s out=%s" % (book_id, proc.returncode, out.strip()[:400]))
    m = re.search(r"started pid=(\d+)", out)
    if proc.returncode != 0 and "Already running" not in out:
        raise RuntimeError("failed to start worker: %s" % out[:500])
    if m:
        return int(m.group(1))
    alive, pid = is_active_render(book_id, "fast15")
    if alive and pid.isdigit():
        return int(pid)
    raise RuntimeError("no pid from starter: %s" % out[:500])


def mark_claimed_on_site(book_id, pid):
    detail = "Mac mini Fast worker claimed · pid=%s · BGM on · no Ken Burns" % pid
    notes = (
        "[movie_tracker] step=animating pct=5 label=Animating pages detail=%s" + chr(10)
        + "LOCAL_WORKER_QUEUE|standard-seedance|worker_pid=%s|started=%s"
    ) % (detail, pid, now_iso())
    try:
        patch_video(
            book_id,
            {
                "video_status": "in_production",
                "video_package": "standard:full",
                "video_notes": notes[:1900],
            },
        )
    except Exception as exc:
        log("warn patch claimed failed book=%s: %s" % (book_id, exc))


def notify(message):
    NOTIFY_PATH.parent.mkdir(parents=True, exist_ok=True)
    NOTIFY_PATH.write_text("%s %s%s" % (now_iso(), message, chr(10)))
    log("NOTIFY %s" % message)


def pick_next_job(jobs, state, min_ts):
    candidates = []
    for job in jobs:
        bid = job.get("id")
        if not bid:
            continue
        if bid in state.get("claimed", {}):
            continue
        fin = state.get("finished", {}).get(bid) or {}
        if fin.get("status") == "ready" and job.get("video_url"):
            continue
        ok, _reason = job_is_queue_candidate(job, min_ts)
        if not ok:
            continue
        try:
            book = get_book(bid)
        except Exception as exc:
            log("skip %s: cannot load book (%s)" % (bid, exc))
            continue
        if not book_approved(book):
            reason = "not approved (status=%s)" % book.get("status")
            prev = state.setdefault("skipped", {}).get(bid)
            if prev != reason:
                state.setdefault("skipped", {})[bid] = reason
                save_state(state)
                log("skip %s %s: %s" % (bid, job.get("child_name"), reason))
            continue
        created = parse_created(job.get("video_requested_at") or job.get("created_at"))
        candidates.append((created, job))
    if not candidates:
        return None
    candidates.sort(key=lambda x: x[0] or 0)
    return candidates[0][1]


def reclaim_finished(state):
    for book_id, meta in list(state.get("claimed", {}).items()):
        tag = meta.get("out_tag") or "fast15"
        alive, _pid = is_active_render(book_id, tag)
        if alive:
            continue
        out = ROOT / "tmp-movie" / ("book-%s-%s" % (book_id[:8], tag))
        final_url = None
        url_file = out / "final_url.txt"
        if url_file.exists():
            final_url = url_file.read_text().strip() or None
        try:
            data = http_json("GET", SITE + "/api/storybooks/" + book_id + "/video", admin_headers())
            site_url = data.get("video_url")
        except Exception:
            site_url = None
        video_url = site_url or final_url
        if video_url:
            state["finished"][book_id] = {
                "finished_at": now_iso(),
                "status": "ready",
                "video_url": video_url,
            }
            notify("READY book=%s url=%s" % (book_id, video_url))
        else:
            log_path = out / "render.log"
            tail = ""
            if log_path.exists():
                tail = log_path.read_text(errors="replace")[-500:]
            state["finished"][book_id] = {
                "finished_at": now_iso(),
                "status": "failed",
                "tail": tail[-300:],
            }
            notify("FAILED book=%s check %s" % (book_id, log_path))
            try:
                msg = "Mac mini Fast worker stopped without final MP4. Check render.log; re-queue after fix." + chr(10) + tail[:800]
                patch_video(book_id, {"video_status": "requested", "video_notes": msg[:1900]})
            except Exception as exc:
                log("warn fail-patch %s: %s" % (book_id, exc))
        state["claimed"].pop(book_id, None)
        save_state(state)


def loop_once(state, min_ts):
    reclaim_finished(state)
    running = any_paid_render_running(state)
    if running:
        log("busy render=%s" % running)
        return
    try:
        jobs = list_jobs()
    except Exception as exc:
        log("list_jobs error: %s" % exc)
        return
    nxt = pick_next_job(jobs, state, min_ts)
    if not nxt:
        log("idle - no approved Fast jobs")
        return
    book_id = nxt["id"]
    child = nxt.get("child_name") or "?"
    log("claiming book=%s child=%s" % (book_id, child))
    try:
        pid = start_fast_movie(book_id)
    except Exception as exc:
        log("start failed book=%s: %s" % (book_id, exc))
        try:
            patch_video(book_id, {"video_status": "requested", "video_notes": ("Mac mini worker failed to start: %s" % exc)[:1900]})
        except Exception:
            pass
        notify("START_FAILED book=%s err=%s" % (book_id, exc))
        return
    state.setdefault("claimed", {})[book_id] = {
        "started_at": now_iso(),
        "out_tag": "fast15",
        "pid": pid,
        "child_name": child,
    }
    state.get("skipped", {}).pop(book_id, None)
    save_state(state)
    mark_claimed_on_site(book_id, pid)
    notify("STARTED book=%s child=%s pid=%s" % (book_id, child, pid))


def main():
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    PID_PATH.write_text(str(os.getpid()) + chr(10))
    min_ts = parse_created(MIN_CREATED)
    log("movie_queue_worker start pid=%s poll=%ss min_created=%s site=%s" % (os.getpid(), POLL_SEC, MIN_CREATED, SITE))
    state = load_state()
    busy = any_paid_render_running(state)
    if busy:
        log("detected live render at start: %s" % busy)
    while True:
        try:
            loop_once(state, min_ts)
        except Exception as exc:
            log("loop error: %s" % exc)
        time.sleep(POLL_SEC)


if __name__ == "__main__":
    main()
