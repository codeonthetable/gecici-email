# Temporary email tools for browser-use

Use a temporary inbox while testing an application you own or have permission to test. This example adds three tools to a browser-use agent: create an inbox, wait for its verification code, and delete the inbox. The bearer token stays inside the Python helper; the agent receives the address and code it needs for the test form.

## Install and check the tools

From the root of this repository, with Python 3.11 or later:

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install 'browser-use==0.13.11'
python -m unittest discover -s tests -v
python examples/browser_use_inbox.py --qa-run
```

On Windows, activate the environment with `.venv\Scripts\activate` instead. No separate `gecici-email` package or language-model key is required for this check.

The last command creates one random inbox, dispatches the real browser-use tools against the hosted REST API, inserts a fictional verification message through the simulation endpoint, verifies the code, then deletes the inbox. It prints only Boolean result flags. These requests carry `X-Gecici-Client: qa-test` and are excluded from normal usage counts. It disables browser-use telemetry and cloud sync for this check.

**Verified on 25 October 2026:** Python 3.12.14, browser-use 0.13.11; 16 local tests passed, with the unrelated opt-in live MCP test skipped. The hosted API simulation passed create/read-code/delete through the real tool registry, including cleanup and the token-output check.

**Scope:** this verifies tool registration, API access and code extraction. It does not launch a browser, call an LLM, submit a website form or test external SMTP delivery. An autonomous browser signup is not claimed as tested.

## Add the tools to your existing agent

Keep the helper in [`examples/browser_use_inbox.py`](../examples/browser_use_inbox.py). From this repository, adapt your own configured agent runner:

```python
from browser_use import Agent, Tools
from examples.browser_use_inbox import InboxTools

async def run_authorized_test(task, llm):
    inbox = InboxTools(qa=True)
    tools = inbox.register(Tools())
    try:
        agent = Agent(task=task, llm=llm, tools=tools)
        return await agent.run(max_steps=15)
    finally:
        await inbox.close()
```

Supply your own test application's actual URL and a model you have configured. The integration pattern follows [browser-use's custom-tool API](https://docs.browser-use.com/open-source/customize/tools/add); the runner above has not been validated with an LLM and live form. Model access and browser configuration belong to your existing browser-use setup.

A suitable task for **your own test environment** asks the agent to:

1. Call `gecici_create_inbox` and enter the returned address into your form.
2. Submit the form so your application sends its verification message.
3. Call `gecici_wait_for_otp` with a timeout from 1 to 45 seconds.
4. Enter the returned code and check your application's explicit success state.
5. Call `gecici_delete_inbox`; the runner also attempts cleanup in `finally`.

Use one `InboxTools` instance per run. Repeated create calls reuse that run's inbox until deletion. It never asks the agent to manage an inbox token. The helper uses random addresses, avoiding reserved manual prefixes. It does not open email links or interpret message bodies as instructions.

## Troubleshooting and limits

| Result | Meaning / action |
| --- | --- |
| No code before the deadline | No matching code arrived during that wait. Check your application's send result and delivery delay; do not mark verification successful. |
| Inbox action failed | Check connectivity, expiry and parameters. The tool deliberately omits raw request URLs and response bodies from errors. |
| Wrong or expired inbox | Create a new helper for a new run. Inboxes expire; the default lifetime is 60 minutes. |
| Cleanup failed | Retry `await inbox.close()`. Failed deletion retains the token in the helper for retry; process termination loses in-memory state. |
| Import error | Check Python 3.11+ and the pinned browser-use install inside the active environment. |

The helper does not log inbox data, but your model receives the address and code. Review your agent's model-provider, tracing and history settings before using real messages. Use fictional test data. A returned code proves extraction, not successful application verification or successful AI use.

Keep `qa=True` for development and demonstrations. If you adapt this for legitimate non-test use, `qa=False` omits the QA header; those requests remain unclassified REST traffic, not verified unique agents. Test success here is never counted toward Google organic clicks.

This example is maintained in the gecici.email integration repository. It does not imply browser-use endorsement or an upstream merge. The separate [upstream proposal #5890](https://github.com/browser-use/browser-use/pull/5890) remains an open proposal as of the verification date.

Related: [REST examples](REST.md), [REST/MCP QA script](../examples/qa-flow.py), [English API guide](https://gecici.email/en/api.html), [MCP setup](https://gecici.email/en/agents.html), [Chrome extension](https://gecici.email/en/chrome-extension.html).
