#!/usr/bin/env python3
"""Let Vite handle /assets/*?import during `npm run dev`.

SvelteKit's dev static middleware serves files from static/ and drops the query
string. A browser then receives image bytes for a module import and hydration
fails. Skip those import requests so Vite can return a JavaScript module.
Idempotent. Safe to run again after npm ci.
"""

from pathlib import Path

path = Path("node_modules/@sveltejs/kit/src/exports/vite/dev/index.js")
text = path.read_text()
guard = (
    "\t\t// Vite `?import` requests must reach Vite's transform pipeline.\n"
    "\t\tif (req.url && /[?&]import(?:&|$)/.test(req.url.split('#')[0])) {\n"
    "\t\t\tnext();\n"
    "\t\t\treturn;\n"
    "\t\t}\n\n"
)
anchor = "req.url = encodeURI(pathname); // don't need query/hash"
if anchor not in text:
    raise SystemExit("SvelteKit static middleware anchor not found; dev server patch not applied")
if "[?&]import(?:&|$)" in text:
    print("dev static import patch already present")
else:
    decoded = "\t\tconst decoded = decodeURI(new URL(base + req.url).pathname);\n"
    idx = text.find(anchor)
    window = text.rfind(decoded, 0, idx)
    if window == -1 or idx - window > 800:
        raise SystemExit("could not locate static middleware decoded pathname")
    path.write_text(text[:window] + guard + text[window:])
    print("applied dev static import patch")
