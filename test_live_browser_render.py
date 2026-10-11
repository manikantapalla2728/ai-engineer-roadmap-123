"""
test_live_browser_render.py
Starts a local server and tests real browser rendering via Chrome headless
for every primary page in the application.
"""

import subprocess
import time
import sys

def main():
    server = subprocess.Popen([sys.executable, "-m", "http.server", "8350"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.5)

    pages_to_test = [
        ("index.html", ["Dashboard", "Current Stage", "Hero Metric Bar"]),
        ("videos.html", ["Showing 190 of 190 videos", "Verified Masterclass", "video-card-thumb-img"]),
        ("skill.html?id=ai-tools-assistants", ["AI Tools &amp; Assistants", "Official Documentation", "Recommended Video Masterclasses", "Mini Project Deliverable"]),
        ("roadmap.html", ["Roadmap", "16 weeks", "Tasks done", "Remaining"]),
        ("skills.html", ["Skills Catalogue", "AI Tools &amp; Assistants", "Prompt Engineering"]),
        ("practice.html", ["Practice &amp; Flashcards Studio"]),
        ("projects.html", ["Personal AI Engineering Assistant", "Flagship Project"]),
        ("prompts.html", ["Prompt Library", "Plan Before Implementation"])
    ]

    all_passed = True
    for page, expected_snippets in pages_to_test:
        url = f"http://localhost:8350/{page}"
        cmd = [
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            "--headless=new",
            "--disable-gpu",
            "--virtual-time-budget=3000",
            "--dump-dom",
            url
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        dom = res.stdout.decode("utf-8", errors="replace")

        # Check for undesirable states
        if "Loading roadmap" in dom or "Loading curated video" in dom or "Failed to load" in dom:
            print(f"[FAIL] {page} contains hanging loading or failure message!")
            all_passed = False
            continue

        # Check expected snippets
        missing = [s for s in expected_snippets if s not in dom]
        if missing:
            print(f"[FAIL] {page} missing expected content: {missing}")
            all_passed = False
        else:
            print(f"[PASS] {page} rendered cleanly with all expected elements!")

    server.terminate()
    server.wait()

    if all_passed:
        print("\nALL PAGES RENDERED PERFECTLY IN LIVE HEADLESS CHROME!")
    else:
        print("\nSOME PAGES FAILED RENDER CHECK.")
        sys.exit(1)

if __name__ == "__main__":
    main()
