#!/usr/bin/env python3
"""
validate_data.py — Validate all JSON data files against their schemas.

Checks:
1. roadmap.json: every week has exactly 7 days; every day has required fields
2. resources.json: every resource has all required fields
3. competency.json: exactly 13 skills with required fields
4. interview.json: required fields per question
5. prompts.json: required fields per prompt
6. projects.json: required structure and stage fields

Usage: python validate_data.py
Exit code 0 = all pass, 1 = failures found.
"""

import json
import io
import sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

ERRORS = []
WARNINGS = []


def err(msg: str):
    ERRORS.append(f"  [FAIL] {msg}")
    print(f"  [FAIL] {msg}")


def warn(msg: str):
    WARNINGS.append(f"  [WARN] {msg}")
    print(f"  [WARN] {msg}")


def ok(msg: str):
    print(f"  [OK]   {msg}")


def load(path: str) -> dict | list | None:
    p = Path(path)
    if not p.exists():
        err(f"File not found: {path}")
        return None
    try:
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        err(f"Invalid JSON in {path}: {e}")
        return None


def check_required(obj: dict, fields: list[str], context: str):
    # Fields that are allowed to be null initially (set by check_links.py)
    nullable = {"url", "last_checked"}
    for field in fields:
        if field not in obj:
            err(f"{context}: missing required field '{field}'")
        elif obj[field] is None and field not in nullable:
            err(f"{context}: field '{field}' is null (should not be)")
        elif obj[field] == "" and field not in nullable and field != "search_query":
            warn(f"{context}: field '{field}' is empty string")


# ── roadmap.json ───────────────────────────────────────────────────────────
def validate_roadmap(data):
    print("\n  [roadmap.json]")
    if "months" not in data:
        err("Missing 'months' key"); return

    total_weeks = 0
    total_days = 0

    for month in data["months"]:
        mid = month.get("id", "?")
        if "weeks" not in month:
            err(f"Month {mid}: missing 'weeks'"); continue

        for week in month["weeks"]:
            wid = week.get("id", "?")
            total_weeks += 1

            # Required week fields
            check_required(week, ["id", "title", "goal", "concepts", "deliverable", "milestone", "days"], f"Week {wid}")

            days = week.get("days", [])
            if len(days) != 7:
                err(f"Week {wid}: has {len(days)} days, expected exactly 7")
            else:
                ok(f"Week {wid} ({week.get('title', '')}): 7 days ✓")

            day_nums = sorted(d.get("day", 0) for d in days)
            if day_nums != list(range(1, 8)):
                err(f"Week {wid}: day numbers {day_nums}, expected [1,2,3,4,5,6,7]")

            for day in days:
                dnum = day.get("day", "?")
                ctx = f"Week {wid} Day {dnum}"
                check_required(day, ["day", "title", "what", "produce", "check", "duration_min"], ctx)
                total_days += 1

    ok(f"Total: {total_weeks} weeks, {total_days} days")
    if total_weeks != 16:
        warn(f"Expected 16 weeks, found {total_weeks}")


# ── resources.json ─────────────────────────────────────────────────────────
def validate_resources(data):
    print("\n  [resources.json]")
    required = ["id", "title", "url", "type", "topic", "week", "level",
                "author_or_channel", "why_it_helps", "verified", "last_checked", "search_query"]
    valid_types = {"docs", "video", "course", "article", "tool"}
    valid_levels = {"beginner", "intermediate", "advanced"}

    ids = set()
    for r in data:
        rid = r.get("id", "?")
        if rid in ids:
            err(f"Duplicate resource id: {rid}")
        ids.add(rid)

        check_required(r, required, f"Resource {rid}")

        if r.get("type") not in valid_types:
            err(f"Resource {rid}: invalid type '{r.get('type')}', must be one of {valid_types}")
        if r.get("level") not in valid_levels:
            err(f"Resource {rid}: invalid level '{r.get('level')}', must be one of {valid_levels}")
        if r.get("url") == "" and not r.get("search_query"):
            warn(f"Resource {rid}: no URL and no search_query — user cannot find it")

    ok(f"Total: {len(data)} resources, {len(ids)} unique IDs")


# ── competency.json ────────────────────────────────────────────────────────
def validate_competency(data):
    print("\n  [competency.json]")
    if len(data) != 13:
        err(f"Expected exactly 13 skills, found {len(data)}")
    else:
        ok(f"13 skills ✓")

    for s in data:
        sid = s.get("id", "?")
        check_required(s, ["id", "skill", "description", "weeks", "evidenceHint"], f"Skill {sid}")
        if "ticked" in s or "evidence" in s:
            err(f"Skill {sid}: should NOT contain 'ticked' or 'evidence' (those are localStorage-only)")


# ── interview.json ─────────────────────────────────────────────────────────
def validate_interview(data):
    print("\n  [interview.json]")
    topics = {}
    ids = set()
    for q in data:
        qid = q.get("id", "?")
        if qid in ids:
            err(f"Duplicate question id: {qid}")
        ids.add(qid)
        check_required(q, ["id", "topic", "question", "hints"], f"Question {qid}")
        if "myAnswer" in q:
            err(f"Question {qid}: should NOT contain 'myAnswer' (localStorage-only)")
        t = q.get("topic", "Unknown")
        topics[t] = topics.get(t, 0) + 1

    ok(f"Total: {len(data)} questions across {len(topics)} topics")
    for t, c in sorted(topics.items()):
        print(f"    {t}: {c} questions")


# ── prompts.json ───────────────────────────────────────────────────────────
def validate_prompts(data):
    print("\n  [prompts.json]")
    ids = set()
    for p in data:
        pid = p.get("id", "?")
        if pid in ids:
            err(f"Duplicate prompt id: {pid}")
        ids.add(pid)
        check_required(p, ["id", "name", "useCase", "prompt", "tags"], f"Prompt {pid}")
        if len(p.get("prompt", "")) < 50:
            warn(f"Prompt {pid}: prompt text seems very short ({len(p.get('prompt',''))} chars)")

    ok(f"Total: {len(data)} prompts")


# ── projects.json ──────────────────────────────────────────────────────────
def validate_projects(data):
    print("\n  [projects.json]")
    check_required(data, ["name", "description", "safetyNote", "stages"], "projects.json")
    for stage in data.get("stages", []):
        m = stage.get("month", "?")
        check_required(stage, ["month", "title", "description", "features", "checklist"], f"Stage M{m}")
        for item in stage.get("checklist", []):
            check_required(item, ["id", "label", "category"], f"Stage M{m} checklist item")

    ok(f"Total: {len(data.get('stages', []))} stages")


# ── Main ───────────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  AI Engineer Roadmap — Data Validation")
    print("=" * 60)

    files = {
        "data/roadmap.json": validate_roadmap,
        "data/resources.json": validate_resources,
        "data/competency.json": validate_competency,
        "data/interview.json": validate_interview,
        "data/prompts.json": validate_prompts,
        "data/projects.json": validate_projects,
    }

    for path, validator in files.items():
        data = load(path)
        if data is not None:
            validator(data)

    print(f"\n{'='*60}")
    if ERRORS:
        print(f"  FAILED: {len(ERRORS)} error(s), {len(WARNINGS)} warning(s)")
        sys.exit(1)
    elif WARNINGS:
        print(f"  PASSED with {len(WARNINGS)} warning(s)")
        sys.exit(0)
    else:
        print(f"  All checks passed ✅")
        sys.exit(0)


if __name__ == "__main__":
    main()
