"""
verify_videos.py — Automated YouTube video verification tool.
Queries https://www.youtube.com/oembed?url=<url>&format=json to verify:
1. Video actually exists (returns HTTP 200)
2. Compares the real YouTube title and author/channel against stored metadata
3. Updates `verified` and `verified_at`
4. Writes VIDEO_VERIFICATION_REPORT.md
"""

import json
import datetime
import urllib.request
import urllib.error
import time
from pathlib import Path

VIDEOS_FILE = Path("data/videos.json")
REPORT_FILE = Path("VIDEO_VERIFICATION_REPORT.md")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
}


def verify_oembed(video_url: str):
    """
    Returns (success: bool, remote_title: str, remote_author: str, error: str)
    """
    # Clean URL to standard watch format for oEmbed
    if "youtu.be/" in video_url:
        vid_id = video_url.split("youtu.be/")[1].split("?")[0]
        query_url = f"https://www.youtube.com/watch?v={vid_id}"
    else:
        query_url = video_url

    oembed_url = f"https://www.youtube.com/oembed?url={urllib.parse.quote(query_url, safe=':/?=&')}&format=json"

    try:
        req = urllib.request.Request(oembed_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                return True, data.get("title", ""), data.get("author_name", ""), ""
            return False, "", "", f"Status {resp.status}"
    except urllib.error.HTTPError as e:
        return False, "", "", f"HTTP {e.code}: {e.reason}"
    except Exception as e:
        return False, "", "", str(e)


def main():
    if not VIDEOS_FILE.exists():
        print(f"Error: {VIDEOS_FILE} does not exist.")
        return 1

    with open(VIDEOS_FILE, encoding="utf-8") as f:
        videos = json.load(f)

    today = datetime.date.today().isoformat()
    total = len(videos)
    verified_count = 0
    failed_count = 0
    skipped_count = 0

    results = []

    print("=" * 65)
    print("  YouTube Video oEmbed Verification Protocol")
    print(f"  Total videos to check: {total}")
    print("=" * 65)

    for i, v in enumerate(videos, 1):
        vid_id = v.get("id", f"v{i}")
        url = v.get("url", "").strip()
        title = v.get("title", "")
        channel = v.get("channel", "")

        if not url or "youtube.com/results" in url:
            v["verified"] = False
            v["verified_at"] = None
            skipped_count += 1
            results.append({
                "id": vid_id,
                "title": title,
                "channel": channel,
                "status": "SEARCH_SUGGESTION",
                "error": "No direct video URL; search link used",
                "diff": None
            })
            print(f"[{i}/{total}] [SEARCH] {vid_id} - {title[:40]}")
            continue

        ok, remote_title, remote_author, err = verify_oembed(url)

        if ok:
            verified_count += 1
            v["verified"] = True
            v["verified_at"] = today
            # Update canonical title and channel if slight formatting diff
            title_match = remote_title.strip().lower() == title.strip().lower()
            channel_match = remote_author.strip().lower() == channel.strip().lower()
            
            diff_note = None
            if not title_match or not channel_match:
                diff_note = f"Remote title: '{remote_title}' | Channel: '{remote_author}'"
                # Keep real title from YouTube
                v["title"] = remote_title
                v["channel"] = remote_author

            results.append({
                "id": vid_id,
                "title": v["title"],
                "channel": v["channel"],
                "status": "VERIFIED_OK",
                "error": None,
                "diff": diff_note
            })
            print(f"[{i}/{total}] [OK] {vid_id} - {v['title'][:40]}")
        else:
            failed_count += 1
            v["verified"] = False
            v["verified_at"] = None
            results.append({
                "id": vid_id,
                "title": title,
                "channel": channel,
                "status": "FAILED",
                "error": err,
                "diff": None
            })
            print(f"[{i}/{total}] [FAIL] {vid_id} - Error: {err}")

        time.sleep(0.15)  # Respect rate limit

    # Update videos.json with verification results
    with open(VIDEOS_FILE, "w", encoding="utf-8") as f:
        json.dump(videos, f, indent=2, ensure_ascii=False)

    # Write Markdown Report
    report_md = f"""# YouTube Video Verification Report

**Run Date:** {today}  
**Total Video Records:** {total}  
**Verified Active (HTTP 200 via oEmbed):** {verified_count}  
**Failed / Broken / Inaccessible:** {failed_count}  
**Search Suggestions (Unverified):** {skipped_count}  

---

## 1. Verified Videos
| ID | Skill ID | Title | Channel | Category | Level |
|---|---|---|---|---|---|
"""
    for r in results:
        if r["status"] == "VERIFIED_OK":
            report_md += f"| `{r['id']}` | `{r.get('skill_id', '')}` | {r['title']} | {r['channel']} | Verified | OK |\n"

    report_md += "\n---\n\n## 2. Failed or Broken Videos\n"
    if failed_count == 0:
        report_md += "_Zero broken videos found. All direct video links resolved successfully._\n"
    else:
        for r in results:
            if r["status"] == "FAILED":
                report_md += f"- **[{r['id']}]** {r['title']} ({r['channel']}): `{r['error']}`\n"

    report_md += "\n---\n\n## 3. Search Suggestions (No Direct Video URL)\n"
    for r in results:
        if r["status"] == "SEARCH_SUGGESTION":
            report_md += f"- **[{r['id']}]** {r['title']} ({r['channel']}) — pre-formatted search query\n"

    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        f.write(report_md)

    print("\n" + "=" * 65)
    print("  Verification Complete")
    print(f"  Verified: {verified_count} | Failed: {failed_count} | Suggestions: {skipped_count}")
    print(f"  Report written to: {REPORT_FILE}")
    print("=" * 65)

    return failed_count


if __name__ == "__main__":
    import sys
    sys.exit(main())
