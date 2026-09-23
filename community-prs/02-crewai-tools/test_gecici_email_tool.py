import unittest
from unittest.mock import patch
from gecici_email_tool import GeciciEmailTool


class TestGeciciEmailTool(unittest.TestCase):

    def setUp(self):
        self.tool = GeciciEmailTool()

    @patch("requests.post")
    def test_create_inbox(self, mock_post):
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            "inbox": {
                "address": "bot_99@gecici.email"
            }
        }
        res = self.tool._run(action="create", prefix="bot_99")
        self.assertIn("bot_99@gecici.email", res)

    @patch("requests.get")
    def test_wait_otp_success(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            "otp": "459812"
        }
        res = self.tool._run(action="wait_otp", address="bot_99@gecici.email", timeout_seconds=10)
        self.assertIn("459812", res)

    def test_wait_otp_missing_address(self):
        res = self.tool._run(action="wait_otp")
        self.assertIn("Error: 'address' parameter is required", res)


if __name__ == "__main__":
    unittest.main()
