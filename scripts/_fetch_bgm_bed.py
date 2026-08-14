#!/usr/bin/env python3
"""Fetch a soft royalty-free instrumental bed for storybook movies."""
from __future__ import annotations
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "audio"
OUT_DIR.mkdir(parents=True, exist_ok=True)
DEST = OUT_DIR / "storybook-bedtime-bed.mp3"

CANDIDATES = [
    "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Wallpaper.mp3",
    "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Thoughtful.mp3",
    "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Carefree.mp3",
    "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Soft%20Memorium.mp3",
    "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Dreamy%20Flashback.mp3",
]

def fetch(url: str, dest: Path) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 StorybookPhotosBGM/1.0"})
        with urllib.request.urlopen(req, timeout=90) as r:
            data = r.read()
        if len(data) < 50000:
            print("too small", url, len(data))
            return False
        dest.write_bytes(data)
        print("OK", dest, len(data), "from", url)
        (OUT_DIR / "storybook-bedtime-bed.ATTRIBUTION.txt").write_text(
            "Music: Kevin MacLeod (incompetech.com)\n"
            "Licensed under Creative Commons: By Attribution 4.0 License\n"
            "http://creativecommons.org/licenses/by/4.0/\n"
            f"Source: {url}\n"
        )
        return True
    except Exception as e:
        print("FAIL", url, e)
        return False

def main() -> int:
    if DEST.exists() and DEST.stat().st_size > 50000:
        print("already have", DEST, DEST.stat().st_size)
        return 0
    for url in CANDIDATES:
        if fetch(url, DEST):
            return 0
    print("NO_BGM")
    return 1

if __name__ == "__main__":
    raise SystemExit(main())
