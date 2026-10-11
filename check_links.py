#!/usr/bin/env python3
"""
check_links.py — Verify all URLs in data/resources.json.

For each resource with a non-empty URL, sends an HTTP GET.
Updates verified and last_checked fields in resources.json.
Writes a summary report to link_report.json.

Usage:
    pip install requests
    python check_links.py
"""

import json
import datetime
import sys
import time
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: 'requests' not installed. Run: pip install requests", flush=True)
    sys.exit(1)

RESOURCES_FILE = Path("data/resources.json")
REPORT_FILE = Path("link_report.json")
TIMEOUT = 5

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
}


def check_url(url: str, session: requests.Session) -> tuple[bool, int, str]:
    """Returns (ok, status_code, error_msg)"""
    try:
        resp = session.get(url, timeout=TIMEOUT, headers=HEADERS, allow_redirects=True)
        return resp.status_code < 400, resp.status_code, ""
    except requests.exceptions.Timeout:
        return False, 0, "Timeout"
    except requests.exceptions.ConnectionError as e:
        return False, 0, f"Connection error: {str(e)[:60]}"
    except requests.exceptions.RequestException as e:
        return False, 0, f"Error: {str(e)[:60]}"


def main():
    if not RESOURCES_FILE.exists():
        print(f"ERROR: {RESOURCES_FILE} not found. Run from project root.", flush=True)
        sys.exit(1)

    with open(RESOURCES_FILE, encoding="utf-8") as f:
        resources = json.load(f)

    today = datetime.date.today().isoformat()
    report = {
        "date": today,
        "total": 0,
        "checked": 0,
        "ok": 0,
        "broken": 0,
        "skipped": 0,
        "results": []
    }

    print("=" * 60, flush=True)
    print("  Link Checker -- AI Engineer Roadmap Resources", flush=True)
    print(f"  Date: {today}", flush=True)
    print("=" * 60, flush=True)
    print(f"Checking {len(resources)} resources...\n", flush=True)

    # Use a requests session and cache results by URL to prevent redundant network hits
    session = requests.Session()
    cache = {}

    for r in resources:
        report["total"] += 1
        url = (r.get("url") or "").strip()

        if not url:
            r["verified"] = False
            result = {
                "id": r["id"],
                "title": r["title"],
                "url": "",
                "status": "SKIPPED",
                "code": None,
                "error": "No direct URL set (Search link used)",
                "search_query": r.get("search_query", "")
            }
            report["skipped"] += 1
            print(f"  [SKIP] [{r['id']}] SKIPPED - {r['title'][:55]}", flush=True)
        else:
            report["checked"] += 1
            if url in cache:
                ok, code, err = cache[url]
            else:
                ok, code, err = check_url(url, session)
                cache[url] = (ok, code, err)

            r["verified"] = ok
            r["last_checked"] = today
            status = "OK" if ok else "BROKEN"
            icon = "[OK] " if ok else "[ERR]"
            result = {
                "id": r["id"],
                "title": r["title"],
                "url": url,
                "status": status,
                "code": code,
                "error": err
            }
            if ok:
                report["ok"] += 1
                print(f"  {icon} [{r['id']}] {code} - {r['title'][:55]}", flush=True)
            else:
                report["broken"] += 1
                print(f"  {icon} [{r['id']}] {code} {err} - {r['title'][:55]}", flush=True)

        report["results"].append(result)

    # Write updated resources.json
    with open(RESOURCES_FILE, "w", encoding="utf-8") as f:
        json.dump(resources, f, indent=2, ensure_ascii=False)

    # Write report
    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 60, flush=True)
    print("  Link Verification Summary", flush=True)
    print("=" * 60, flush=True)
    print(f"  Total resources: {report['total']}", flush=True)
    print(f"  URLs checked:    {report['checked']}", flush=True)
    print(f"  [OK]  Valid:     {report['ok']}", flush=True)
    print(f"  [ERR] Broken:    {report['broken']}", flush=True)
    print(f"  [SKIP] Skipped:  {report['skipped']} (curated YouTube / search queries)", flush=True)
    print(f"\n  Updated: {RESOURCES_FILE}", flush=True)
    print(f"  Report:  {REPORT_FILE}", flush=True)

    if report["broken"] > 0:
        print(f"\n  Broken links ({report['broken']}):", flush=True)
        for r in report["results"]:
            if r["status"] == "BROKEN":
                print(f"    [{r['id']}] {r['url']} - {r['error'] or r['code']}", flush=True)

    print("", flush=True)
    return report["broken"]


if __name__ == "__main__":
    broken = main()
    sys.exit(0 if broken == 0 else 1)
