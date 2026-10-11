"""
build_data_bundle.py
Generates data/bundle.js containing window.AIER_DATA with all JSON datasets.
Ensures zero-network offline loading and prevents CORS fetch issues.
"""

import os
import json

DATA_DIR = "data"
BUNDLE_FILE = os.path.join(DATA_DIR, "bundle.js")

def main():
    bundle = {}
    for filename in sorted(os.listdir(DATA_DIR)):
        if filename.endswith(".json"):
            key = filename[:-5]
            path = os.path.join(DATA_DIR, filename)
            with open(path, "r", encoding="utf-8") as f:
                bundle[key] = json.load(f)

    js_content = "/**\n * bundle.js — Preloaded static dataset for instant, zero-CORS access\n */\n"
    js_content += "window.AIER_DATA = " + json.dumps(bundle, indent=2, ensure_ascii=False) + ";\n"

    with open(BUNDLE_FILE, "w", encoding="utf-8") as f:
        f.write(js_content)

    print(f"Generated {BUNDLE_FILE} ({os.path.getsize(BUNDLE_FILE)} bytes) with keys: {list(bundle.keys())}")

if __name__ == "__main__":
    main()
