#!/usr/bin/env python3
import json, re, urllib.request, time
from pathlib import Path
token = re.search(r"## Vercel\n- \*\*Token:\*\* ([^\n]+)", Path("/Users/brandastic/.openclaw/workspace/TOOLS.md").read_text()).group(1).strip()

def list_deps():
    req = urllib.request.Request(
        "https://api.vercel.com/v6/deployments?projectId=prj_XggOsp9FjgqVteabzeCYO9vPBPsO&limit=5",
        headers={"Authorization": f"Bearer {token}"},
    )
    with urllib.request.urlopen(req) as r:
        return json.load(r).get("deployments", [])

for x in list_deps():
    print(x.get("uid"), x.get("readyState") or x.get("state"), (x.get("meta") or {}).get("githubCommitSha","")[:7], ((x.get("meta") or {}).get("githubCommitMessage") or "")[:70], "err=", x.get("errorMessage"))
