"""
test_site_integrity.py
Automated test suite checking data integrity, link health, and HTML page structure.
"""
import unittest
import json
from pathlib import Path


class TestRoadmapData(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open("data/roadmap.json", encoding="utf-8") as f:
            cls.roadmap = json.load(f)

    def test_phases_present(self):
        self.assertIn("phases", self.roadmap)
        self.assertEqual(len(self.roadmap["phases"]), 4)

    def test_sixteen_weeks_exist(self):
        all_weeks = [w for m in self.roadmap["months"] for w in m["weeks"]]
        self.assertEqual(len(all_weeks), 16, "Must contain exactly 16 weeks")

    def test_seven_days_per_week(self):
        for m in self.roadmap["months"]:
            for w in m["weeks"]:
                wid = w.get("id") or w.get("week")
                days = w.get("days", [])
                self.assertEqual(len(days), 7, f"Week {wid} must have exactly 7 days")
                # Day 7 must be review
                self.assertEqual(days[6]["day"], 7)
                self.assertIn("Review", days[6]["title"])

    def test_concrete_day_tasks(self):
        for m in self.roadmap["months"]:
            for w in m["weeks"]:
                wid = w.get("id") or w.get("week")
                for d in w["days"]:
                    day_num = d["day"]
                    self.assertTrue(len(d.get("what", "")) > 20, f"Week {wid} Day {day_num} 'what' is too brief")
                    self.assertTrue(len(d.get("produce", "")) > 5, f"Week {wid} Day {day_num} 'produce' is empty")
                    self.assertTrue(len(d.get("check", "")) > 5, f"Week {wid} Day {day_num} 'check' is empty")


class TestResourcesData(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open("data/resources.json", encoding="utf-8") as f:
            cls.resources = json.load(f)

    def test_resource_count(self):
        self.assertGreaterEqual(len(self.resources), 48, "Must contain at least 48 resources")

    def test_resource_schema_and_badges(self):
        for r in self.resources:
            rid = r["id"]
            self.assertIn("title", r)
            self.assertIn("type", r)
            self.assertIn("verified", r)
            self.assertIn("search_query", r)
            if not r["url"]:
                self.assertFalse(r["verified"], f"Resource {rid} without URL must have verified=False")
                self.assertTrue(len(r["search_query"]) > 0, f"Resource {rid} without URL must have search_query")


class TestCompetencyData(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open("data/competency.json", encoding="utf-8") as f:
            cls.competencies = json.load(f)

    def test_thirteen_skills(self):
        self.assertEqual(len(self.competencies), 13, "Must have exactly 13 competency skills")

    def test_evidence_hints(self):
        for c in self.competencies:
            self.assertTrue(len(c.get("evidenceHint", "")) > 5, f"Competency {c['id']} missing evidenceHint")


class TestPagesAndHTML(unittest.TestCase):
    def test_html_files_exist(self):
        required_pages = [
            "index.html",
            "roadmap.html",
            "week.html",
            "resources.html",
            "projects.html",
            "prompts.html",
            "competency.html",
            "interview.html",
            "later.html"
        ]
        for p in required_pages:
            self.assertTrue(Path(p).exists(), f"Page {p} does not exist")

    def test_accessibility_skip_links(self):
        for p in Path(".").glob("*.html"):
            content = p.read_text(encoding="utf-8")
            self.assertIn("skip-link", content, f"{p.name} missing skip-to-content accessibility link")
            self.assertIn('aria-label="Main navigation"', content, f"{p.name} missing accessible nav label")


if __name__ == "__main__":
    unittest.main()
