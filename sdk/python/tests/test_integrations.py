import unittest
from unittest.mock import patch, MagicMock
from gecici import GeciciEmail, GeciciInbox
from gecici.integrations.browser_use import GeciciBrowserTools, ActionResult
from gecici.integrations.langchain import (
    GeciciCreateInboxTool,
    GeciciWaitForOtpTool,
    GeciciWaitForMagicLinkTool,
    GeciciEmailToolkit,
)
from gecici.integrations.crewai import GeciciEmailTool


class TestGeciciIntegrations(unittest.TestCase):

    def test_client_init(self):
        client = GeciciEmail(base_url="https://gecici.email/api/v1")
        self.assertEqual(client.base_url, "https://gecici.email/api/v1")

    @patch("gecici.client.requests.post")
    def test_create_inbox(self, mock_post):
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            "inbox": {
                "address": "test_agent@gecici.email",
                "token": "tok_123",
                "expiresAt": 1720000000,
            }
        }
        client = GeciciEmail()
        inbox = client.create_inbox(prefix="test_agent")
        self.assertEqual(inbox.address, "test_agent@gecici.email")
        self.assertEqual(str(inbox), "test_agent@gecici.email")

    @patch("gecici.client.requests.get")
    def test_wait_for_otp(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"otp": "893120"}
        client = GeciciEmail()
        otp = client.wait_for_otp("test@gecici.email", timeout=10)
        self.assertEqual(otp, "893120")

    def test_browser_use_tools_registration(self):
        # Create a mock controller/tools object with an .action decorator
        class MockTools:
            def __init__(self):
                self.registered_actions = {}

            def action(self, description=""):
                def decorator(fn):
                    self.registered_actions[fn.__name__] = {
                        "fn": fn,
                        "description": description,
                    }
                    return fn
                return decorator

        mock_tools = MockTools()
        helper = GeciciBrowserTools()
        helper.register(mock_tools)

        self.assertIn("create_disposable_email", mock_tools.registered_actions)
        self.assertIn("wait_for_otp_code", mock_tools.registered_actions)
        self.assertIn("wait_for_activation_link", mock_tools.registered_actions)
        self.assertIn("get_inbox_messages", mock_tools.registered_actions)

        # Test action execution
        with patch.object(helper.client, "wait_for_otp", return_value="123456"):
            fn = mock_tools.registered_actions["wait_for_otp_code"]["fn"]
            res: ActionResult = fn("test@gecici.email")
            self.assertIn("123456", res.extracted_content)

    def test_langchain_toolkit(self):
        try:
            import langchain  # noqa: F401
            toolkit = GeciciEmailToolkit()
            tools = toolkit.get_tools()
            self.assertEqual(len(tools), 3)
            tool_names = [t.name for t in tools]
            self.assertIn("gecici_create_inbox", tool_names)
        except ImportError:
            # If langchain is not installed, verify friendly fallback error
            with self.assertRaises(ImportError) as ctx:
                GeciciEmailToolkit()
            self.assertIn("pip install langchain", str(ctx.exception))

    def test_crewai_tool_initialization(self):
        try:
            import crewai  # noqa: F401
            crew_tool = GeciciEmailTool()
            self.assertTrue(crew_tool.name.startswith("Gecici"))
        except ImportError:
            # If crewai is not installed, verify friendly fallback error
            with self.assertRaises(ImportError) as ctx:
                GeciciEmailTool()
            self.assertIn("pip install crewai", str(ctx.exception))


if __name__ == "__main__":
    unittest.main()
