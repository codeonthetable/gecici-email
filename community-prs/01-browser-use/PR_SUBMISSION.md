# Pull Request: Add Disposable Email & OTP Extraction Example for Autonomous Signups

- **Target Repository**: `https://github.com/browser-use/browser-use`
- **Target Branch**: `main`
- **Suggested Branch Name**: `feat/example-disposable-email-otp`

---

## 📝 PR Title
`feat(examples): add autonomous signup example with disposable email & OTP extraction`

---

## 📋 PR Description

### What does this PR do?
One of the most common blockers for autonomous web browsing agents is handling **account registrations and email verification walls (OTP / Magic Links)**. 

When agents attempt to sign up on platforms, they either:
1. Cannot complete the workflow because they lack an email address.
2. Get blocked waiting for a verification code or confirmation link.

This PR adds an official, self-contained example under `examples/use-cases/autonomous_disposable_email_signup.py` demonstrating how to integrate temporary disposable inboxes and sub-second OTP extraction via `gecici-email` (Zero-auth, ephemeral RAM storage).

### Features demonstrated:
- Generating on-the-fly disposable inboxes (`create_disposable_email`).
- Automated form submission.
- Real-time polling/listening for 4–8 digit verification codes (`wait_for_otp_verification_code`).
- Handling magic verification links (`wait_for_confirmation_link`).
- End-to-end autonomous account creation without human intervention.

### How to test:
```bash
pip install browser-use gecici-email langchain-openai
python examples/use-cases/autonomous_disposable_email_signup.py
```

---

## 🚀 Quick Submission Commands

```bash
# 1. Fork browser-use/browser-use on GitHub
# 2. Clone your fork:
git clone git@github.com:codeonthetable/browser-use.git
cd browser-use

# 3. Create feature branch:
git checkout -b feat/example-disposable-email-otp

# 4. Copy the example file:
mkdir -p examples/use-cases
cp /Users/bahadirdavdav/Desktop/Gemini\ Proje/gecici-email/community-prs/01-browser-use/autonomous_disposable_email_signup.py examples/use-cases/

# 5. Commit and push:
git add examples/use-cases/autonomous_disposable_email_signup.py
git commit -m "feat(examples): add autonomous signup with disposable email & OTP"
git push -u origin feat/example-disposable-email-otp

# 6. Open PR on GitHub:
# Go to https://github.com/browser-use/browser-use/compare and paste the PR Description above!
```
