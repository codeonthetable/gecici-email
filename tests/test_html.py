import unittest
from html.parser import HTMLParser
from pathlib import Path


class AppParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.scripts = []
        self.duplicate_ids = set()
        self.unsafe_external_assets = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        element_id = attrs.get("id")
        if element_id in self.ids:
            self.duplicate_ids.add(element_id)
        if element_id:
            self.ids.add(element_id)
        if tag == "script":
            self.scripts.append(attrs)
        if tag in {"script", "img", "iframe"} and (attrs.get("src") or attrs.get("href")):
            self.unsafe_external_assets.append(attrs.get("src") or attrs.get("href"))


class HtmlTests(unittest.TestCase):
    def test_downloadable_app_has_all_controls_without_external_assets(self):
        html = Path(__file__).resolve().parents[1].joinpath("index.html").read_text(encoding="utf-8")
        parser = AppParser()
        parser.feed(html)
        self.assertFalse(parser.duplicate_ids)
        self.assertFalse(parser.unsafe_external_assets)
        self.assertEqual(len(parser.scripts), 1)
        self.assertIn("connect-src https://gecici.email", html)
        self.assertNotIn(".innerHTML", html)
        for element_id in (
            "createRandom", "createCustom", "connect", "refresh", "otp", "link",
            "extend", "delete", "messageList", "preview", "newToken", "status",
        ):
            self.assertIn(element_id, parser.ids)


if __name__ == "__main__":
    unittest.main()
