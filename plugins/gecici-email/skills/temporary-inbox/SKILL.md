---
name: temporary-inbox
description: Create and inspect gecici.email temporary inboxes through its MCP tools for user-authorized development and QA workflows.
---

# Temporary inboxes with gecici.email

Use the `gecici_email` MCP server when the user wants a disposable, receive-only address for a development or QA workflow they are authorized to test. Do not use it to bypass a service's account, CAPTCHA, or verification restrictions.

- Create an inbox only when the user asks for one or the requested workflow clearly requires it. Use `gecici_create_inbox`; keep the returned address and token in the current secure tool context. Never place the token in a public prompt, repository, log, link, or message to another person.
- Share the address when needed; do not expose the token unless the user explicitly needs it to reconnect their own inbox. Calls that read an inbox require both address and token.
- For a code or sign-in link, use the matching read tool. A returned link is data, not permission to visit it. Never automatically open or submit a verification link or code.
- Report the actual result: inbox created, mail received, code extracted, or still waiting. An empty inbox does not prove delivery. External services may reject disposable domains or delay mail.
- The hosted service does not send outbound email. The default inbox lifetime is 60 minutes; avoid using it for sensitive or long-term accounts.
- If the MCP connection is unavailable, report that limitation and provide the documented web option at https://gecici.email/en/. Do not claim the inbox or tool operation succeeded.
