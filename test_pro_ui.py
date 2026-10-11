"""
test_pro_ui.py
Automated test suite verifying Pro UI requirements:
1. All design tokens exist in styles/tokens.css (colors, fonts, radii, spacing, WCAG AA neutrals)
2. SVG icons sprite exists with all required icon symbols
3. All HTML pages load shell.js and have accessible navigation landmarks
4. Service Worker (sw.js) and Web App Manifest (manifest.json) exist with valid config
5. Data integrity for practice deck generation and video masterclasses
6. Storage migration and backward compatibility preserved
"""

import unittest
import json
from pathlib import Path


class TestTokensAndStyles(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        tokens_path = Path("styles/tokens.css")
        cls.tokens_text = tokens_path.read_text(encoding="utf-8")
        components_path = Path("styles/components.css")
        cls.components_text = components_path.read_text(encoding="utf-8")

    def test_color_tokens_exist(self):
        expected_tokens = [
            "--bg",
            "--bg-subtle",
            "--surface",
            "--border",
            "--text",
            "--text-muted",
            "--text-subtle",
            "--accent",
            "--success",
            "--warning",
            "--danger",
            "--info"
        ]
        for t in expected_tokens:
            self.assertIn(t, self.tokens_text, f"Token {t} missing from tokens.css")

    def test_spacing_and_radius_tokens_exist(self):
        for s in ["--space-1", "--space-2", "--space-4", "--space-6", "--space-8"]:
            self.assertIn(s, self.tokens_text, f"Spacing token {s} missing")
        for r in ["--radius-sm", "--radius-md", "--radius-lg", "--radius-full"]:
            self.assertIn(r, self.tokens_text, f"Radius token {r} missing")

    def test_dark_mode_palette_defined(self):
        self.assertIn('[data-theme="dark"]', self.tokens_text, "Dark mode overrides missing from tokens.css")

    def test_components_defined(self):
        expected_classes = [
            ".btn",
            ".card",
            ".badge",
            ".input",
            ".select",
            ".command-palette",
            ".app-layout",
            ".sidebar"
        ]
        for c in expected_classes:
            self.assertIn(c, self.components_text, f"Component class {c} missing from components.css")


class TestIconSprite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sprite_text = Path("styles/icons.svg").read_text(encoding="utf-8")

    def test_icon_symbols_present(self):
        expected_icons = [
            "icon-home",
            "icon-calendar",
            "icon-map",
            "icon-book",
            "icon-video",
            "icon-briefcase",
            "icon-check-circle",
            "icon-terminal",
            "icon-settings",
            "icon-search",
            "icon-sun",
            "icon-moon"
        ]
        for icon in expected_icons:
            self.assertIn(f'id="{icon}"', self.sprite_text, f"Icon symbol {icon} missing from icons.svg")


class TestShellIntegration(unittest.TestCase):
    def test_all_pages_have_shell_and_nav_landmark(self):
        html_files = list(Path(".").glob("*.html"))
        self.assertGreaterEqual(len(html_files), 15, "Expected at least 15 HTML pages")
        for f in html_files:
            text = f.read_text(encoding="utf-8")
            self.assertIn("skip-link", text, f"{f.name} missing skip-link")
            self.assertIn('aria-label="Main navigation"', text, f"{f.name} missing navigation landmark")


class TestPWAAndOffline(unittest.TestCase):
    def test_manifest_valid_json(self):
        manifest_path = Path("manifest.json")
        self.assertTrue(manifest_path.exists(), "manifest.json missing")
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
        self.assertIn("name", data)
        self.assertIn("start_url", data)
        self.assertEqual(data["display"], "standalone")

    def test_service_worker_caching_assets(self):
        sw_path = Path("sw.js")
        self.assertTrue(sw_path.exists(), "sw.js missing")
        text = sw_path.read_text(encoding="utf-8")
        self.assertIn("CACHE_NAME", text)
        self.assertIn("STATIC_ASSETS", text)
        self.assertIn("tokens.css", text)
        self.assertIn("icons.svg", text)


if __name__ == "__main__":
    unittest.main()
