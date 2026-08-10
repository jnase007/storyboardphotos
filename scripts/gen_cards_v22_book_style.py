#!/usr/bin/env python3
"""Generate adventure cards matching River book PDF watercolor look."""
import base64
import json
import re
import urllib.request
from pathlib import Path

OUT = Path("public/adventure-cards")
TOOLS = Path("/Users/brandastic/.openclaw/workspace/TOOLS.md").read_text()
GOOGLE = (
    re.search(r"AQ\.Ab8RN[A-Za-z0-9_\-]+", TOOLS)
    or re.search(r"AIzaSy[A-Za-z0-9_\-]+", TOOLS)
).group(0).strip()
print("google", GOOGLE[:12], flush=True)

ref_paths = sorted(OUT.glob("_book-style-*.jpg"))[:4]
if not ref_paths:
    raise SystemExit("no book style refs")
refs = []
for p in ref_paths:
    refs.append((p.name, base64.b64encode(p.read_bytes()).decode()))
    print("ref", p.name, p.stat().st_size, flush=True)

STYLE = (
    "Match EXACTLY the watercolor illustration style from the attached River Kingdom Quest book pages. "
    "Same soft painted children storybook look, same line weight, same pastel watercolor washes, "
    "same cream paper feel, same character proportions and face style as the book. "
    "NOT a different art style. NOT CGI. NOT photoreal. NOT plastic 3D. NOT anime. "
    "ONE single new scene only, full illustration, no page text, no captions, no PDF layout, "
    "no white text box at bottom. Vertical adventure card."
)

CARDS = [
    (
        "dragon-slayer",
        "New scene in THIS book style only: young royal child on mountain peak with friendly dragon soft sparks. Same art style as attached book pages.",
    ),
    (
        "rescue-mission",
        "New scene in THIS book style only: young royal child on broken wooden bridge over river in rain with lantern. Same art style as attached book pages.",
    ),
    (
        "lost-crown",
        "New scene in THIS book style only: young royal child climbing white cliffs toward sword in stone. Same art style as attached book pages.",
    ),
    (
        "forest-guardian",
        "New scene in THIS book style only: young royal child leading animals uphill forest with soft fire glow below. Same art style as attached book pages.",
    ),
    (
        "kindness-quest",
        "New scene in THIS book style only: kingdom race day, child helps fallen runner. Same art style as attached book pages.",
    ),
    (
        "light-treasure",
        "New scene in THIS book style only: child opening treasure chest with warm gold light in cave. Same art style as attached book pages.",
    ),
]


def http_json(url: str, body: dict) -> dict:
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.loads(r.read().decode())


def generate(prompt: str, dest: Path) -> None:
    models = [
        "gemini-2.0-flash-preview-image-generation",
        "gemini-2.5-flash-image-preview",
        "gemini-3.1-flash-image",
    ]
    last = None
    for model in models:
        try:
            url = (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                + model
                + ":generateContent?key="
                + GOOGLE
            )
            parts = []
            for _name, b64 in refs:
                parts.append({"inline_data": {"mime_type": "image/jpeg", "data": b64}})
            parts.append({"text": STYLE + " " + prompt})
            body = {
                "contents": [{"role": "user", "parts": parts}],
                "generationConfig": {
                    "responseModalities": ["TEXT", "IMAGE"],
                    "temperature": 0.4,
                },
            }
            print("try", model, dest.name, flush=True)
            res = http_json(url, body)
            parts_out = (
                ((res.get("candidates") or [{}])[0].get("content") or {}).get("parts")
                or []
            )
            img = None
            for p in parts_out:
                if "inlineData" in p:
                    img = p["inlineData"].get("data")
                if "inline_data" in p:
                    img = p["inline_data"].get("data")
            if not img:
                raise RuntimeError(str(parts_out)[:200])
            dest.write_bytes(base64.b64decode(img))
            print("saved", dest.name, dest.stat().st_size, model, flush=True)
            return
        except Exception as e:
            err = str(e)
            if hasattr(e, "read"):
                try:
                    err = e.read().decode()[:300]
                except Exception:
                    pass
            print("fail", model, err[:200], flush=True)
            last = e

    # Imagen fallback
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "imagen-4.0-generate-001:predict?key="
        + GOOGLE
    )
    body = {
        "instances": [{"prompt": STYLE + " " + prompt}],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": "3:4",
            "personGeneration": "allow_all",
        },
    }
    print("try imagen", dest.name, flush=True)
    res = http_json(url, body)
    b64 = res["predictions"][0]["bytesBase64Encoded"]
    dest.write_bytes(base64.b64decode(b64))
    print("saved", dest.name, dest.stat().st_size, "imagen", flush=True)


def main() -> None:
    for cid, prompt in CARDS:
        dest = OUT / f"{cid}.jpg"
        print("gen", cid, flush=True)
        generate(prompt, dest)
        (OUT / f"{cid}-v22.jpg").write_bytes(dest.read_bytes())
        print("OK", cid, flush=True)
    print("DONE", flush=True)


if __name__ == "__main__":
    main()
