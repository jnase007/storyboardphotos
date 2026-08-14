#!/usr/bin/env python3
"""Mix soft bedtime BGM into an existing movie MP4 (no Seedance re-run)."""
from __future__ import annotations
import os, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BGM = ROOT / "public/audio/storybook-bedtime-bed.mp3"
VOL = float(os.environ.get("BGM_VOLUME", "0.18"))

def ffprobe_dur(path: Path) -> float:
    r = subprocess.run([
        "ffprobe","-v","error","-show_entries","format=duration",
        "-of","default=noprint_wrappers=1:nokey=1", str(path)
    ], capture_output=True, text=True)
    try:
        return float((r.stdout or "0").strip() or 0)
    except Exception:
        return 0.0

def main() -> int:
    if len(sys.argv) < 3:
        print("usage: mix_bgm_into_movie.py input.mp4 output.mp4")
        return 2
    src = Path(sys.argv[1]); dest = Path(sys.argv[2])
    if not src.exists():
        print("missing", src); return 1
    if not BGM.exists():
        print("missing bgm", BGM); return 1
    dur = ffprobe_dur(src)
    fc = (
        f"[1:a]volume={VOL:.3f},afade=t=in:st=0:d=2,afade=t=out:st={max(0.5, dur-3.0):.3f}:d=3,aformat=sample_rates=44100:channel_layouts=stereo[bg];"
        f"[0:a]aformat=sample_rates=44100:channel_layouts=stereo[voice];"
        f"[bg][voice]sidechaincompress=threshold=0.05:ratio=6:attack=50:release=400:level_sc=0.8[bgd];"
        f"[voice][bgd]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[a]"
    )
    cmd = [
        "ffmpeg","-y","-i",str(src),"-stream_loop","-1","-i",str(BGM),
        "-filter_complex", fc, "-map","0:v","-map","[a]","-t",f"{dur:.3f}",
        "-c:v","copy","-c:a","aac","-b:a","192k","-movflags","+faststart", str(dest)
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-500:])
        return 1
    print("OK", dest, "dur", ffprobe_dur(dest))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
