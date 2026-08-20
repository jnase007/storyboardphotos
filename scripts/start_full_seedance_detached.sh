#!/usr/bin/env bash
# Detach full Seedance movie worker so chat/session death cannot kill it.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BOOK_ID="${BOOK_ID:?BOOK_ID required}"
ALLOW_SEEDANCE="${ALLOW_SEEDANCE:-1}"
SEEDANCE_OUT_TAG="${SEEDANCE_OUT_TAG:-fullseed}"
OUT="$ROOT/tmp-movie/book-${BOOK_ID:0:8}-${SEEDANCE_OUT_TAG}"
mkdir -p "$OUT"
LOG="$OUT/render.log"
PIDFILE="$OUT/worker.pid"

if [[ -f "$PIDFILE" ]]; then
  old="$(cat "$PIDFILE" 2>/dev/null || true)"
  if [[ -n "${old:-}" ]] && kill -0 "$old" 2>/dev/null; then
    echo "Already running pid=$old log=$LOG"
    exit 0
  fi
fi

export BOOK_ID ALLOW_SEEDANCE SEEDANCE_OUT_TAG
# Pass through optional cost/quality knobs if set in caller env
for k in SEEDANCE_MODEL SEEDANCE_CLIP_SEC SEEDANCE_ALLOW_CHAIN SEEDANCE_COST_PER_SEC \
         SEEDANCE_MAX_CHAIN_PARTS FORCE_RERENDER PATCH_SITE_VIDEO MAX_PAGE_HOLD MAX_FAL_RETRIES \
         ALLOW_KENBURNS_FALLBACK PAGE_SEEDANCE_RETRIES ENABLE_BGM BGM_VOLUME; do
  if [[ -n "${!k:-}" ]]; then
    export "$k"
  fi
done

nohup python3 -u "$ROOT/scripts/render_full_seedance_movie.py" >>"$LOG" 2>&1 &
pid=$!
disown "$pid" 2>/dev/null || true
echo "started pid=$pid"
echo "log=$LOG"
echo "out=$OUT"
echo "heartbeat=$OUT/heartbeat.json"
echo "model=${SEEDANCE_MODEL:-default}"
echo "clip=${SEEDANCE_CLIP_SEC:-default}"
echo "$pid" > "$PIDFILE"
