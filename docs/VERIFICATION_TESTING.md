# Owned-application email verification test

This standard-library Python 3.8+ fixture adds a browser form and a server-side, single-use verification challenge to the hosted temporary-inbox API. It creates one disposable inbox per session, inserts a synthetic message with the authenticated simulation endpoint, reads the extracted code and submits it to the local application.

**Test scope:** a real Chrome form plus hosted API simulation. It does not exercise SMTP, an external sender, an LLM or browser-use agent. No real account is created. Do not deploy the fixture as a production authentication service.

## Run

Review `examples/verification_app.py`, then run from this repository:

```sh
python3 -m unittest discover -s tests -p 'test_verification_app.py' -v
python3 examples/verification_app.py --serve
```

Open `http://127.0.0.1:8797` in your browser. Python must have a working CA trust store; never disable certificate verification. The fixture binds only to IPv4 loopback. Use `--port 8798` if its default port is occupied.

1. Click **Start QA session**. Expect `message_simulated (HTTP 201)`.
2. Click **Try wrong code**. Expect `wrong_code (HTTP 400)`.
3. Click **Read test inbox**, then **Verify code**. Expect `code_loaded (HTTP 200)`, followed by `verified (HTTP 200)`. The latter is the application's result, not just extraction success.
4. Click **Check replay rejection**. Expect `already_used (HTTP 409)`.
5. Click **Delete test inbox**. Expect `cleaned (HTTP 200)`. Quit the server with Ctrl+C. Shutdown retries cleanup for sessions that remain in memory; check `shutdown_cleanup` in the final aggregate output.

The challenge expires after 120 seconds and allows five verification attempts. Restart the flow after cleaning up if it expires. The mailbox itself has its own lifetime. Up to ten browser sessions are retained in memory per server run; restart after cleanup to reset this limit.

## Recorded test — 2026-10-26

Python 3.8.3rc1: ten local tests passed. They cover incorrect codes, exact expiry, reuse, attempt limit, malformed code types, reading without verification, cleanup retry, missing session, origin/host rejection and the HTTP form lifecycle. A separate Chrome run against the hosted API confirmed the five steps above and deleted its one QA inbox. Expiry and attempt-limit coverage came from local tests, not a prolonged browser run.

All hosted requests carry `X-Gecici-Client: qa-test`. The fixture prints no inbox address, token, message or code. The synthetic code exists briefly in a masked browser input; clear browser debugging traces if you enabled them yourself. Inbox credentials remain server-side. Cleanup is a logical API deletion, not a physical-erasure guarantee. A forced process kill cannot run shutdown cleanup; the inbox can then remain until expiry.

## Adapting to your own application

Replace the simulation transport with your application's existing sender in a separate test environment. Give the application only the disposable address, keep the inbox token in the test runner, wait with a deadline, fill the returned code and assert the application's verified state. Keep the wrong-code, expiry and replay controls. This example has not established external SMTP delivery or compatibility with a third-party signup form.

Use a new inbox per parallel test. This small teaching server is sequential and is not a load test or a production-ready authentication design. The fixed `Read test inbox` button is a test harness convenience: production clients must not receive an endpoint that retrieves their own verification code.

References: [Python http.server](https://docs.python.org/3/library/http.server.html), [secrets](https://docs.python.org/3/library/secrets.html).
