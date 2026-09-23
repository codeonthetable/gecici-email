# gecici-email-mcp

[![npm version](https://img.shields.io/npm/v/gecici-email-mcp.svg)](https://www.npmjs.com/package/gecici-email-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Smithery](https://smithery.ai/badge/gecici-email-mcp)](https://smithery.ai/server/gecici-email-mcp)

Official **Model Context Protocol (MCP)** server for [gecici.email](https://gecici.email) — High-speed, zero-log disposable temporary email infrastructure built for autonomous AI agents (**Claude Desktop**, **Cursor**, **Windsurf**, and custom LLM workflows).

---

## 🚀 Quick Setup

### 1. Claude Desktop
Add to your `claude_desktop_config.json`:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gecici-email": {
      "command": "npx",
      "args": ["-y", "gecici-email-mcp"]
    }
  }
}
```

### 2. Cursor IDE
Open `Cursor Settings` -> `Features` -> `MCP Servers` -> `Add New MCP Server`:
- **Name**: `gecici-email`
- **Type**: `command`
- **Command**: `npx -y gecici-email-mcp`

### 3. Smithery (Automatic Installation)
```bash
npx -y @smithery/cli install gecici-email-mcp --client claude
```

---

## 🛠️ Available MCP Tools

| Tool | Description | Arguments |
| :--- | :--- | :--- |
| `gecici_create_inbox` | Generates a new disposable inbox immediately (zero-auth) | `prefix` (optional), `domain` (optional) |
| `gecici_wait_for_otp` | Waits for incoming email and extracts 4-8 digit OTP code | `address` (required), `timeout_seconds` (optional, default: 30) |
| `gecici_wait_for_magic_link` | Waits for incoming email and extracts activation URL | `address` (required), `timeout_seconds` (optional, default: 30) |
| `gecici_get_inbox_messages` | Lists all messages in the inbox with smart summaries | `address` (required) |
| `gecici_get_ai_summary` | Returns token-optimized high-signal summary of latest mail | `address` (required) |

---

## 💡 Example Prompt for Claude or Cursor

> "Create a disposable email inbox for me, sign up on example.com with it, and wait for the verification OTP code to complete the registration."

Claude will automatically:
1. Call `gecici_create_inbox` -> gets `swift_9812@gecici.email`.
2. Fills in the email field.
3. Calls `gecici_wait_for_otp(address: "swift_9812@gecici.email")`.
4. Receives `894120` in seconds and finishes the task!

---

## 🌐 Documentation & Links
- Website: [https://gecici.email](https://gecici.email)
- REST API Reference: [https://gecici.email/api-dokuman](https://gecici.email/api-dokuman)
- LLM Machine-Readable Spec: [https://gecici.email/llms.txt](https://gecici.email/llms.txt)

---

## 📄 License
MIT
