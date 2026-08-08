#!/usr/bin/env python3
from pathlib import Path
import re, json, urllib.request, urllib.error
text = Path("/Users/brandastic/.openclaw/workspace/TOOLS.md").read_text()
sec = text.split("## Google AI")[1].split("## ")[0]
print(sec)
keys=[]
for line in sec.splitlines():
    m=re.search(r"(AIza[0-9A-Za-z_\\-]{20,}|AQ\\.[0-9A-Za-z_\\-]{20,})", line)
    if m:
        keys.append(m.group(1))
print("found", len(keys))
for k in keys:
    print("testing", k[:12], "len", len(k))
    try:
        with urllib.request.urlopen("https://generativelanguage.googleapis.com/v1beta/models?key="+k, timeout=25) as r:
            d=json.load(r)
        ms=d.get("models") or []
        veo=[m.get("name") for m in ms if "veo" in (m.get("name") or "").lower()]
        imagen=[m.get("name") for m in ms if "imagen" in (m.get("name") or "").lower()]
        print(" ok", len(ms), "veo", len(veo), "imagen", len(imagen))
        for v in veo[:20]:
            print(" ", v)
        for v in imagen[:8]:
            print(" ", v)
    except urllib.error.HTTPError as e:
        print(" http", e.code, e.read()[:300])
    except Exception as e:
        print(" fail", e)
