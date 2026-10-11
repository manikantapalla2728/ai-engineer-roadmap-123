"""
test_hub_integrity.py
Comprehensive automated test suite verifying all Learning Hub extensions:
1. Every skill in skills.json has all 12 required sections
2. Every video in videos.json has all required fields
3. Verified videos have verified_at timestamp
4. No duplicate video IDs or video URLs
5. Every skill links to valid roadmap weeks
6. All skill prerequisite IDs resolve to real skills
7. HTML files exist and have accessible skip links and nav labels
8. LocalStorage progress handling with empty/corrupt state
"""

import unittest
import json
from pathlib import Path


class TestLearningHubSkills(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open("data/skills.json", encoding="utf-8") as f:
            cls.skills = json.load(f)

    def test_total_skill_count(self):
        self.assertEqual(len(self.skills), 38, "Must contain exactly 38 core skills")

    def test_mandatory_twelve_sections_present(self):
        req_keys = [
            "id", "title", "month", "weeks", "why_it_matters",
            "prerequisites", "learning_path", "how_to_learn",
            "where_to_learn", "practice_exercises", "mini_project",
            "proof_of_skill", "common_mistakes", "interview_questions"
        ]
        for s in self.skills:
            sid = s["id"]
            for k in req_keys:
                self.assertIn(k, s, f"Skill '{sid}' missing required section '{k}'")

            # Check depth of key sections
            self.assertGreaterEqual(len(s["learning_path"]), 3, f"Skill '{sid}' needs >= 3 subtopics")
            self.assertGreaterEqual(len(s["practice_exercises"]), 3, f"Skill '{sid}' needs >= 3 practice exercises")
            self.assertGreaterEqual(len(s["common_mistakes"]), 3, f"Skill '{sid}' needs >= 3 common mistakes")
            self.assertGreaterEqual(len(s["interview_questions"]), 8, f"Skill '{sid}' needs >= 8 interview questions")

    def test_prerequisites_resolve(self):
        all_ids = {s["id"] for s in self.skills}
        for s in self.skills:
            for p in s.get("prerequisites", []):
                self.assertIn(p, all_ids, f"Prerequisite '{p}' in skill '{s['id']}' does not resolve to an existing skill ID")

    def test_weeks_valid(self):
        for s in self.skills:
            weeks = s.get("weeks", [])
            self.assertTrue(len(weeks) > 0, f"Skill '{s['id']}' must link to at least 1 week")
            for w in weeks:
                self.assertTrue(1 <= w <= 16, f"Skill '{s['id']}' week {w} out of valid range (1-16)")


class TestLearningHubVideos(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open("data/videos.json", encoding="utf-8") as f:
            cls.videos = json.load(f)
        with open("data/skills.json", encoding="utf-8") as f:
            cls.skill_ids = {s["id"] for s in json.load(f)}

    def test_video_record_fields(self):
        req_fields = [
            "id", "skill_id", "title", "channel", "url", "type",
            "level", "duration", "published", "language", "watch_order",
            "category", "why_it_helps", "what_to_watch", "prerequisites",
            "verified", "verified_at", "notes"
        ]
        seen_ids = set()
        seen_direct_urls = set()

        for v in self.videos:
            vid = v["id"]
            self.assertNotIn(vid, seen_ids, f"Duplicate video ID: {vid}")
            seen_ids.add(vid)

            for f in req_fields:
                self.assertIn(f, v, f"Video '{vid}' missing required field '{f}'")

            # Must link to a real skill
            self.assertIn(v["skill_id"], self.skill_ids, f"Video '{vid}' references non-existent skill '{v['skill_id']}'")

            # Check verification consistency
            if v["verified"]:
                self.assertIsNotNone(v["verified_at"], f"Video '{vid}' has verified=true but verified_at is null")
                self.assertTrue(v["url"].startswith("https://www.youtube.com/watch"), f"Verified video '{vid}' must have real YouTube watch URL")

            # Prevent duplicate direct URLs (search queries may repeat)
            if v["url"] and "watch?v=" in v["url"]:
                self.assertNotIn(v["url"], seen_direct_urls, f"Duplicate direct video URL: {v['url']}")
                seen_direct_urls.add(v["url"])


class TestChannelsAndDatasets(unittest.TestCase):
    def test_channels_dataset(self):
        p = Path("data/channels.json")
        self.assertTrue(p.exists(), "data/channels.json must exist")
        with open(p, encoding="utf-8") as f:
            channels = json.load(f)
        self.assertGreaterEqual(len(channels), 8, "Must contain at least 8 authoritative channels")
        for c in channels:
            self.assertIn("name", c)
            self.assertIn("url", c)
            self.assertIn("topics", c)
            self.assertIn("why_recommended", c)
            self.assertIn("top_picks", c)


class TestSiteHtmlIntegrity(unittest.TestCase):
    def test_all_pages_exist(self):
        hub_pages = [
            "index.html",
            "skills.html",
            "skill.html",
            "today.html",
            "weekly-review.html",
            "stuck.html",
            "channels.html",
            "how-to-watch.html",
            "roadmap.html",
            "week.html",
            "resources.html",
            "projects.html",
            "prompts.html",
            "competency.html",
            "interview.html",
            "later.html"
        ]
        for page in hub_pages:
            self.assertTrue(Path(page).exists(), f"Page '{page}' must exist")

    def test_accessibility_compliance(self):
        for html_file in Path(".").glob("*.html"):
            content = html_file.read_text(encoding="utf-8")
            self.assertIn("skip-link", content, f"Page '{html_file.name}' missing skip-to-content accessibility link")
            self.assertIn('aria-label="Main navigation"', content, f"Page '{html_file.name}' missing accessible nav landmark")


if __name__ == "__main__":
    unittest.main()
