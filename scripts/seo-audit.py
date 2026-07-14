#!/usr/bin/env python3
import json
import re
import urllib.request

base = "https://www.storybookphotos.com"
paths = [
    "/robots.txt",
    "/sitemap.xml",
    "/llms.txt",
    "/ai.txt",
    "/favicon.svg",
    "/hero-kingdom.jpg",
    "/og-image.jpg",
    "/manifest.webmanifest",
    "/favicon.ico",
]
for p in paths:
    try:
        req = urllib.request.Request(base + p, method="GET", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            body = r.read(5000)
            ctype = r.headers.get("content-type")
            print(f"{p} -> {r.status} {ctype} len={len(body)} final={r.geturl()}")
            if p.endswith((".txt", ".xml")) or (ctype and "text" in ctype and "html" not in ctype):
                print(body.decode("utf-8", "replace")[:1200])
                print("---")
    except Exception as e:
        print(f"{p} -> ERROR {e}")

pages = ["/", "/experience", "/how-it-works", "/kingdom-sets", "/storybooks", "/pricing", "/testimonials", "/faq", "/book", "/privacy", "/terms", "/business-plan", "/admin"]
for p in pages:
    try:
        with urllib.request.urlopen(urllib.request.Request(base + p, headers={"User-Agent": "Mozilla/5.0"}), timeout=20) as r:
            html = r.read().decode("utf-8", "replace")
            final = r.geturl()
        title = re.search(r"<title>(.*?)</title>", html, re.I | re.S)
        canon = re.search(r'rel="canonical" href="([^"]+)"', html)
        desc = re.search(r'name="description" content="([^"]*)"', html)
        og = re.search(r'property="og:image" content="([^"]*)"', html)
        robots = re.search(r'name="robots" content="([^"]*)"', html)
        ld = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
        h1 = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S)
        print(f"PAGE {p} final={final}")
        print("  title:", (re.sub(r"\s+", " ", title.group(1)).strip() if title else None))
        print("  canon:", (canon.group(1) if canon else None))
        print("  robots:", (robots.group(1) if robots else None))
        if desc:
            d = desc.group(1)
            print("  desc:", (d[:170] + "...") if len(d) > 170 else d)
        else:
            print("  desc:", None)
        print("  og:image:", (og.group(1) if og else None))
        print("  h1:", re.sub("<[^>]+>", "", h1.group(1)).strip()[:120] if h1 else None)
        print("  jsonld count:", len(ld))
        for i, block in enumerate(ld[:4]):
            try:
                data = json.loads(block)
                print("   ld", i, data.get("@type"))
            except Exception:
                print("   ld", i, "parse-fail")
        if "Chronicless" in html:
            print("  HAS TYPO Chronicless")
        if p != "/" and canon and canon.group(1).rstrip("/") == "https://storybookphotos.com":
            print("  CANON FALLS BACK TO HOMEPAGE")
    except Exception as e:
        print(f"PAGE {p} ERROR {e}")
