# gecici-email (TypeScript & Node.js SDK)

[![npm version](https://img.shields.io/npm/v/gecici-email.svg)](https://www.npmjs.com/package/gecici-email)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official TypeScript / JavaScript client for [gecici.email](https://gecici.email) — Fast, zero-log disposable temporary email with smart OTP and verification link extraction for Humans & AI Agents.

---

## 📦 Installation

```bash
npm install gecici-email
# or
pnpm add gecici-email
# or
yarn add gecici-email
```

---

## 🚀 Quickstart

### 1. Wait for Verification Code (OTP)
```typescript
import { GeciciEmail } from 'gecici-email';

const client = new GeciciEmail();

async function main() {
  // Create randomized inbox
  const inbox = await client.createInbox();
  console.log(`Assigned Address: ${inbox.address}`);

  // Perform registration/form submit on target website...

  // Wait up to 30s for OTP code
  const otp = await client.waitForOtp(inbox.address, 30);
  console.log(`Extracted OTP Code: ${otp}`);

  // Delete inbox when finished
  await client.deleteInbox(inbox.address);
}

main();
```

### 2. Wait for Magic / Activation Link
```typescript
import { GeciciEmail } from 'gecici-email';

const client = new GeciciEmail();

async function main() {
  const inbox = await client.createCustomInbox('my_test_bot');
  console.log(`Inbox: ${inbox.address}`);

  const link = await client.waitForMagicLink(inbox.address, 45);
  console.log(`Activation Link: ${link}`);
}

main();
```

---

## 📄 License
MIT
