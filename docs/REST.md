# REST integration examples

Base URL: `https://gecici.email/api/v1` · [Full API reference (Turkish)](https://gecici.email/api-dokuman)

```sh
# Create a random test inbox. The response includes address, token, and expiresAt.
curl -sS -X POST https://gecici.email/api/v1/inbox/generate

# Read messages sent to an inbox in your authorized test workflow.
curl -sS -H 'Authorization: Bearer <token>' \
  'https://gecici.email/api/v1/inbox/<address>/messages'

# Retrieve an extracted verification code, if one has arrived.
curl -sS -H 'Authorization: Bearer <token>' \
  'https://gecici.email/api/v1/inbox/<address>/otp'
```

Replace `<address>` with the full email address, URL-encoded as a path segment. Replace `<token>` with the token returned when that inbox was created; the placeholder is not a usable token. Do not publish the token in source control, public chats, client-side analytics, or third-party test sites.

To choose a manual prefix, send `{"prefix":"qa-example-1"}` to `POST /inbox/custom`. A manual prefix must be 4–32 ASCII characters long and include at least one digit and an internal `-`, `_`, or `.`. Reserved or official-looking names cannot be used. Random inbox creation is simpler for most workflows.

Delivery depends on the sender and the mail flow. An empty inbox or missing verification code is neither success nor proof of delivery. Use the service only for development and QA workflows you are authorized to test; avoid sensitive accounts and real user data.
