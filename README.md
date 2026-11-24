# gecici.email — free temporary email for people and AI agents

[Python / Node SDK 1.2.0](https://github.com/codeonthetable/gecici-email/releases/tag/sdk-v1.2.0) · [Chrome extension](https://gecici.email/en/chrome-extension.html) · [Download the developer kit (ZIP)](https://github.com/codeonthetable/gecici-email/releases/download/developer-kit-2026.10.28/gecici-email-developer-kit-2026.10.28.zip) · [Use the hosted website](https://gecici.email/en/) · [MCP endpoint](https://gecici.email/mcp) · [REST examples](docs/REST.md) · [Privacy and retention](https://gecici.email/en/privacy.html)

gecici.email provides short-lived, receive-only inboxes for development and QA workflows you are authorized to test. The hosted service is free to use. This repository contains downloadable clients and integration examples; it does **not** contain the mail server or private product implementation.

The downloadable clients and documentation in this repository are in English. The hosted site has an [English inbox and guide](https://gecici.email/en/) as well as Turkish pages.

## Choose how to use it

| Your workflow | Start here |
| --- | --- |
| Keep a temporary inbox in the Chrome toolbar | [Chrome extension and installation guide](https://gecici.email/en/chrome-extension.html) |
| Use an inbox without installing anything | [Hosted web inbox](https://gecici.email/en/) |
| Integrate a Python / Node script or test runner | [Install SDK 1.2.0](#python-and-nodejs-sdks), [API guide](https://gecici.email/en/api.html) and [REST examples](docs/REST.md) |
| Give an AI agent inbox tools | [MCP setup guide](https://gecici.email/en/agents.html) |
| Add inbox and verification-code tools to browser-use | [Tested tool setup and API simulation](docs/BROWSER_USE.md) |
| Test a complete browser verification form you control | [Runnable Python fixture and test results](docs/VERIFICATION_TESTING.md) |

Türkçe: [Geçici mail](https://gecici.email/) · [Chrome eklentisi](https://gecici.email/chrome-eklentisi) · [API rehberi](https://gecici.email/api-dokuman)

## Python and Node.js SDKs

Create an inbox, give its address to your own application, then match a new verification email by creation time, sender, subject and expected link hostname. The clients retain the inbox token and support explicit cleanup.

[SDK 1.2.0 downloads and checksums](https://github.com/codeonthetable/gecici-email/releases/tag/sdk-v1.2.0) · [Python API and example](https://gecici.email/downloads/python/README.md) · [Node.js / TypeScript API and example](https://gecici.email/downloads/typescript/README.md)

```sh
# Python 3.9+; use a virtual environment
python -m pip install https://github.com/codeonthetable/gecici-email/releases/download/sdk-v1.2.0/gecici_email-1.2.0-py3-none-any.whl

# Node.js 22+
npm install https://github.com/codeonthetable/gecici-email/releases/download/sdk-v1.2.0/gecici-email-1.2.0.tgz
```

Use `GeciciEmail()` in Python or `new GeciciEmail()` in Node for regular integrations. The guides also show explicitly labelled QA smoke tests. Outcomes are `ready`, `pending`, `ambiguous` and `blocked`; only `ready` contains a code or link. Extraction is not proof that your application accepted it. Links are never opened by the client.

These are direct-download SDK packages, not PyPI/npm registry publications. SDK artifacts retain their existing proprietary/UNLICENSED metadata; this repository's MIT license does not relicense those artifacts. Python SDK source is in the `.tar.gz`; the Node package includes TypeScript source.

Türkçe: Python veya Node paketini kurun, kutu adresini kendi uygulamanıza verin, yeni doğrulama iletisini eşleştirin ve iş bitince kutuyu silin. [Türkçe ajan rehberi](https://gecici.email/ai-ajanlar).

## Try hosted MCP with one file

Review [examples/mcp-quickstart.py](examples/mcp-quickstart.py) in the current checkout, or [download the same source](https://gecici.email/examples/mcp-quickstart.py). Run:

```sh
python3 examples/mcp-quickstart.py --run
```

No account, global API key, npm package or third-party Python dependency is needed. The example initializes MCP, creates its own inbox, rejects a wrong-token deletion, reads a fictional message, and deletes the inbox through MCP. It prints only result flags. Every request is tagged `qa-test`; this is an API simulation, not external SMTP delivery, a model run or real-user adoption.

For your own integration: keep the creation token, pass the matching address/token to read tools, then call `gecici_delete_inbox` after the task. Successful hosted tools provide both JSON text and `structuredContent`. Check `isError` and empty/timeout results before treating a read as successful. The hosted server now exposes seven tools, including `gecici_wait_for_verification` and `gecici_delete_inbox`. For existing Claude connectors, refresh the tool list to discover current tools. Prefer matched verification for new workflows: pass `since=inbox.createdAt`, sender/subject filters, and `expected_link_host` for HTTPS links. [Cursor configuration and troubleshooting](https://gecici.email/en/cursor-temporary-email-mcp.html).

## Try a complete REST and MCP QA flow

After downloading or cloning this repository, review [`examples/qa-flow.py`](examples/qa-flow.py) and run:

```sh
python3 examples/qa-flow.py --run
```

It uses the Python standard library and the live hosted service. It creates one disposable inbox, checks that a wrong token is rejected, inserts a fictional message through the simulation API, checks code extraction and an MCP message read, then deletes its inbox. It prints result flags without printing addresses, tokens, messages, or codes. Requests are tagged `qa-test` so they are not counted as normal product usage.

**This is an API integration test. It does not test external email delivery or create an account on another website.** Keep the address and token in memory when adapting it to your own application; replace the simulation step with your own authorized application flow.

## Download and run

Download the [developer kit ZIP](https://github.com/codeonthetable/gecici-email/releases/download/developer-kit-2026.10.28/gecici-email-developer-kit-2026.10.28.zip), extract it, and open `START_HERE.md` for English/Turkish instructions. The [release page](https://github.com/codeonthetable/gecici-email/releases/tag/developer-kit-2026.10.28) includes checksums and the pinned source commit. To use the browser client, open `index.html` in a browser. No installation or Python is required for the browser app. It needs an internet connection to the hosted gecici.email service.

Start with **Check API connection**. This makes one health request without creating an inbox. A successful connection does not prove mail delivery. If the browser blocks the local file's network access, use the [hosted inbox](https://gecici.email/en/) or the terminal client below.

Alternatively, clone the repository:

```sh
git clone https://github.com/codeonthetable/gecici-email.git
cd gecici-email
# Open index.html in your browser.
```

For a terminal or server environment, run `python3 app.py` with Python 3.9 or later (on Windows, `py app.py`). It has no third-party Python dependencies. Both clients can create an inbox, read messages and verification codes or links, extend the expiry, and delete the inbox.

Check the connection first with `python3 app.py --check` (`py app.py --check` on Windows). Success prints `{"api_reachable": true, "inbox_created": false}` and exits with code 0. Failure exits with code 1 without printing response bodies. The client keeps certificate and hostname verification enabled; when Python has no default CA file, it loads `/etc/ssl/cert.pem` if that system bundle exists. If verification still fails, repair your Python/OS trust configuration; do not disable certificate checks.

An inbox access token is shown when the inbox is created. The clients keep it only in memory during the current session, not on disk. Save it securely if you need to reconnect later. Email links are displayed but never opened automatically. These clients connect to the **hosted** service; downloading the repository does not install an offline mail server. The browser app loads no external scripts, analytics, or ads.

Run the local test suite with:

```sh
python3 -m unittest discover -s tests -v
```

The local form tests bind to loopback (`127.0.0.1`); sandboxed runners must permit that local socket. Optional browser-use tests need Python 3.11+ and the package described in [its setup guide](docs/BROWSER_USE.md); otherwise they are skipped. The live MCP test is opt-in and carries `qa-test` labels on tool calls and cleanup. Do not count test requests as product usage.

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

[gecici.email on Glama](https://glama.ai/mcp/connectors/io.github.codeonthetable/gecici-email)

The hosted endpoint is listed in the [official MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.codeonthetable%2Fgecici-email/versions/latest) as `io.github.codeonthetable/gecici-email`. The [public metadata](server.json) declares the direct Streamable HTTP URL; no local server installation or general API key is needed. Protected inbox reads still require the inbox-specific token. Registry listing is a discovery record, not a third-party endorsement.

Add `https://gecici.email/mcp` to a client that supports remote Streamable HTTP MCP. For REST clients, use `https://gecici.email/api/v1` and the [REST examples](docs/REST.md). A typical authorized test flow is:

1. Call `gecici_create_inbox` to receive an address, access token, and expiry.
2. Use only the address in the workflow you are authorized to test. Keep the token private.
3. Call `gecici_wait_for_verification` with **both** the address and token, `since` set to the inbox creation time in Unix milliseconds, and your known sender/subject filters. For links, set the exact `expected_link_host` independently of the email. Only `ready` returns a value; `pending`, `ambiguous` and `blocked` are not successful extraction.
4. Call `gecici_delete_inbox` with that same pair after the test; verify `deleted: true`.

Do not put the token in third-party websites, public prompts, source control, or logs. The tools extract links but do not open them. The service does not bypass CAPTCHA or account-verification safeguards, and delivery from external senders is not guaranteed. Do not use it for sensitive accounts or real user data.

Manually chosen address prefixes must contain 4–32 ASCII characters, at least one digit, and an internal `-`, `_`, or `.`. Reserved or official-looking names are unavailable. Randomly generated addresses are not subject to the manual-prefix rule. The default inbox lifetime is 60 minutes; see the [privacy and retention information](https://gecici.email/en/privacy.html) for storage and deletion details.

## Repository scope and license

The public source code here is limited to the `index.html` and `app.py` clients, Codex plugin package, tests, and integration documentation. The web application, API implementation, SMTP infrastructure, and other private product code are not included. The [MIT license](LICENSE) applies only to this repository's public clients, plugin package, and documentation, **not** to the hosted service or private code.

## Test a complete local verification form

The [owned-application verification fixture](docs/VERIFICATION_TESTING.md) adds a real browser form, wrong-code rejection, single-use challenge and cleanup to the hosted API simulation. Python standard library only; no SMTP or AI-agent execution is claimed.
