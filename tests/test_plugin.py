"""Codex plugin contract checks; set GECICI_LIVE_TEST=1 for bounded live MCP checks."""

import json
import os
from pathlib import Path
import unittest
from urllib.parse import quote
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
PLUGIN = ROOT / "plugins" / "gecici-email"
MCP_URL = "https://gecici.email/mcp"


class PluginPackageTests(unittest.TestCase):
    def test_manifest_marketplace_and_mcp_target(self):
        manifest = json.loads((PLUGIN / ".codex-plugin" / "plugin.json").read_text())
        connection = json.loads((PLUGIN / ".mcp.json").read_text())
        marketplace = json.loads((ROOT / ".agents" / "plugins" / "marketplace.json").read_text())

        self.assertEqual(manifest["name"], "gecici-email")
        self.assertEqual(manifest["mcpServers"], "./.mcp.json")
        self.assertEqual(manifest["skills"], "./skills/")
        self.assertEqual(connection["mcpServers"]["gecici_email"], {"type": "http", "url": MCP_URL})
        self.assertEqual(marketplace["plugins"][0]["source"]["path"], "./plugins/gecici-email")
        self.assertTrue((PLUGIN / "skills" / "temporary-inbox" / "SKILL.md").is_file())


@unittest.skipUnless(os.environ.get("GECICI_LIVE_TEST") == "1", "opt-in live MCP test")
class LivePluginTests(unittest.TestCase):
    def rpc(self, method, params=None):
        body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params or {}}).encode()
        request = Request(MCP_URL, data=body, headers={
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
        })
        with urlopen(request, timeout=20) as response:
            return json.load(response)

    def call(self, name, arguments):
        return self.rpc("tools/call", {"name": name, "arguments": arguments})["result"]

    def test_live_tools_and_token_boundary(self):
        self.assertEqual(self.rpc("initialize")["result"]["serverInfo"]["name"], "gecici-email-mcp")
        tools = self.rpc("tools/list")["result"]["tools"]
        names = {tool["name"] for tool in tools}
        expected = {
            "gecici_create_inbox", "gecici_wait_for_otp", "gecici_wait_for_magic_link",
            "gecici_get_inbox_messages", "gecici_get_ai_summary",
        }
        self.assertTrue(expected <= names)
        for tool in tools:
            self.assertTrue({"readOnlyHint", "openWorldHint", "destructiveHint"} <= tool["annotations"].keys())

        created = self.call("gecici_create_inbox", {})
        self.assertFalse(created["isError"])
        inbox = json.loads(created["content"][0]["text"])["inbox"]
        address, token = inbox["address"], inbox["token"]
        try:
            self.assertTrue(address.endswith("@gecici.email"))
            self.assertTrue(token)
            for name in expected - {"gecici_create_inbox"}:
                denied = self.call(name, {"address": address, "token": "invalid"})
                self.assertTrue(denied["isError"], f"{name} accepted an invalid token")

            messages = self.call("gecici_get_inbox_messages", {"address": address, "token": token})
            self.assertFalse(messages["isError"])
            self.assertEqual(json.loads(messages["content"][0]["text"])["count"], 0)
            summary = self.call("gecici_get_ai_summary", {"address": address, "token": token})
            self.assertFalse(summary["isError"])
            self.assertFalse(json.loads(summary["content"][0]["text"])["hasMessage"])
        finally:
            request = Request(
                "https://gecici.email/api/v1/inbox/" + quote(address, safe=""),
                headers={"Authorization": "Bearer " + token}, method="DELETE",
            )
            with urlopen(request, timeout=20) as response:
                self.assertEqual(response.status, 200)


if __name__ == "__main__":
    unittest.main()
