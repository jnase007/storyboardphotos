#!/usr/bin/env python3
from pathlib import Path
import re
import json
import urllib.request
import urllib.error

text = Path("/Users/brandastic/.openclaw/workspace/TOOLS.md").read_text()
sec = text.split("## Google AI")[1].split("## ")[0]
print("SECTION:\n", sec)

keys = []
for line in sec.splitlines():
    if "Key" in line or "AIza" in line or "AQ." in line:
        m = re.search(r"(AIza[0-9A-Za-z_\-]{20,}|AQ\.[0-9A-Za-z_\-]{20,})", line)
        if m:\n            keys.append(m.group(1))\n\nprint("found keys:", len(keys))
for k in keys:
    print("testing", k[:12] + "..." + k[-6:], "len", len(k))
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={k}"
    try:
        with urllib.request.urlopen(url, timeout=25) as r:\n            d = json.load(r)\n        ms = d.get("models") or []
        veo = [m.get("name") for m in ms if "veo" in (m.get("name") or "").lower()]
        imagen = [m.get("name") for m in ms if "imagen" in (m.get("name") or "").lower()]
        print("  ok models", len(ms), "veo", len(veo), "imagen", len(imagen))
        for v in veo[:25]:
            print("   ", v)
        for v in imagen[:10]:
            print("   ", v)
    except urllib.error.HTTPError as e:\n        body = e.read().decode("utf-8", "ignore")[:400]
        print("  http", e.code, body)
    except Exception as e:\n        print("  fail", e)
