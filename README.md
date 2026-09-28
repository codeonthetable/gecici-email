# gecici.email — free temporary email for people and AI agents

[Download the browser app (ZIP)](https://github.com/codeonthetable/gecici-email/archive/refs/heads/main.zip) · [Use the hosted website](https://gecici.email/en/) · [MCP endpoint](https://gecici.email/mcp) · [REST examples](docs/REST.md) · [Privacy and retention](https://gecici.email/en/privacy.html)

gecici.email provides short-lived, receive-only inboxes for development and QA workflows you are authorized to test. The hosted service is free to use. This repository contains downloadable clients and integration examples; it does **not** contain the mail server or private product implementation.

The downloadable clients and documentation in this repository are in English. The hosted site has an [English inbox and guide](https://gecici.email/en/) as well as Turkish pages.

## Download and run

Download the [repository ZIP](https://github.com/codeonthetable/gecici-email/archive/refs/heads/main.zip), extract it, and open `index.html` in a browser. No installation or Python is required for the browser app. It needs an internet connection to the hosted gecici.email service.

Alternatively, clone the repository:

```sh
git clone https://github.com/codeonthetable/gecici-email.git
cd gecici-email
# Open index.html in your browser.
```

For a terminal or server environment, run `python3 app.py` with Python 3.9 or later (on Windows, `py app.py`). It has no third-party Python dependencies. Both clients can create an inbox, read messages and verification codes or links, extend the expiry, and delete the inbox.

An inbox access token is shown when the inbox is created. The clients keep it only in memory during the current session, not on disk. Save it securely if you need to reconnect later. Email links are displayed but never opened automatically. These clients connect to the **hosted** service; downloading the repository does not install an offline mail server. The browser app loads no external scripts, analytics, or ads.

Run the local test suite with:

```sh
python3 -m unittest discover -s tests -v
```

## Connect Codex

The [`gecici-email` plugin](plugins/gecici-email/.codex-plugin/plugin.json) bundles a remote MCP connection and a short agent workflow. It uses the hosted `https://gecici.email/mcp` service; installation does not expose or install the private mail server.

In a Codex version with plugin support, add this repository as a marketplace and install the plugin:

```sh
codex plugin marketplace add codeonthetable/gecici-email --ref main
codex plugin add gecici-email@personal
```

Restart Codex or open a new task after installation, then ask it to create a temporary inbox for an authorized QA test. The plugin is distributed from this GitHub repository; it is **not** a claim of approval or listing in OpenAI's public Plugins Directory. Review the [plugin package](plugins/gecici-email/) and [English privacy policy](https://gecici.email/en/privacy.html) before installing.

## Connect Claude

In Claude, open **Customize → Connectors → Add custom connector** and enter this remote MCP URL:

```text
https://gecici.email/mcp
```

Enable the connector in the conversation where you need it. See [Claude's official custom connector guide](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp) for current menus and plan availability. Connecting Claude does not upload this repository or its source code to Claude.

## Connect other AI agents or applications

Add `https://gecici.email/mcp` to a client that supports remote Streamable HTTP MCP. For REST clients, use `https://gecici.email/api/v1` and the [REST examples](docs/REST.md). A typical authorized test flow is:

1. Call `gecici_create_inbox` to receive an address, access token, and expiry.
2. Use only the address in the workflow you are authorized to test. Keep the token private.
3. Read messages, a verification code, or a verification link with **both** the address and token. An empty inbox or missing code is not a successful delivery result.

Do not put the token in third-party websites, public prompts, source control, or logs. The tools extract links but do not open them. The service does not bypass CAPTCHA or account-verification safeguards, and delivery from external senders is not guaranteed. Do not use it for sensitive accounts or real user data.

Manually chosen address prefixes must contain 4–32 ASCII characters, at least one digit, and an internal `-`, `_`, or `.`. Reserved or official-looking names are unavailable. Randomly generated addresses are not subject to the manual-prefix rule. The default inbox lifetime is 60 minutes; see the [privacy and retention information](https://gecici.email/en/privacy.html) for storage and deletion details.

## Repository scope and license

The public source code here is limited to the `index.html` and `app.py` clients, Codex plugin package, tests, and integration documentation. The web application, API implementation, SMTP infrastructure, and other private product code are not included. The [MIT license](LICENSE) applies only to this repository's public clients, plugin package, and documentation, **not** to the hosted service or private code.
