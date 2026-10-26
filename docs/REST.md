# REST integration examples

Base URL: `https://gecici.email/api/v1` · [Full API reference (English)](https://gecici.email/en/api.html) · [Türkçe](https://gecici.email/api-dokuman)

From a repository checkout, `python3 app.py --check` verifies HTTPS connectivity without creating an inbox. To test your application's form result as well as code extraction, use the [owned-application verification fixture](VERIFICATION_TESTING.md).

```sh
# Create a random test inbox. The response includes address, token, and expiresAt.
curl --fail -sS -H 'X-Gecici-Client: qa-test' -X POST https://gecici.email/api/v1/inbox/generate

# Read messages sent to an inbox in your authorized test workflow.
curl --fail -sS -H 'X-Gecici-Client: qa-test' -H 'Authorization: Bearer <token>' \
  'https://gecici.email/api/v1/inbox/<address>/messages'

# Retrieve an extracted verification code, if one has arrived.
curl --fail -sS -H 'X-Gecici-Client: qa-test' -H 'Authorization: Bearer <token>' \
  'https://gecici.email/api/v1/inbox/<address>/otp'

# Delete only the disposable inbox created for your test, including on failure.
curl --fail -sS -H 'X-Gecici-Client: qa-test' -X DELETE -H 'Authorization: Bearer <token>' \
  'https://gecici.email/api/v1/inbox/<address>'
```

Replace `<address>` with the full email address, URL-encoded as a path segment. Replace `<token>` with the token returned when that inbox was created; the placeholder is not a usable token. Do not publish the token in source control, public chats, client-side analytics, or third-party test sites.

These examples are labeled `qa-test` so test operations are excluded from product-usage counts. `--fail` gives HTTP errors a nonzero exit status. A missing code returns HTTP 408; wait within a deadline rather than treating it as successful verification. These manual commands are a reference, not an automatic cleanup routine. The runnable QA script below performs cleanup in its error-handling path.

To choose a manual prefix, send `{"prefix":"myagent_99"}` to `POST /inbox/custom`. A manual prefix must be 4–32 ASCII characters long and include at least one digit and an internal `-`, `_`, or `.`. Reserved or official-looking names cannot be used. Random inbox creation is simpler for most workflows.

Delivery depends on the sender and the mail flow. An empty inbox or missing verification code is neither success nor proof of delivery. Use the service only for development and QA workflows you are authorized to test; avoid sensitive accounts and real user data.

## Runnable QA example

The [standard-library Python example](../examples/qa-flow.py) exercises a complete disposable REST/MCP test flow with cleanup. Run `python3 examples/qa-flow.py --run` from the repository root after reviewing the source. It uses simulated mail and is explicitly excluded from normal usage counters.
