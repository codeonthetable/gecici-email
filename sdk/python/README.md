# gecici-email

[![PyPI version](https://img.shields.io/pypi/v/gecici-email.svg)](https://pypi.org/project/gecici-email/)
[![Python versions](https://img.shields.io/pypi/pyversions/gecici-email.svg)](https://pypi.org/project/gecici-email/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Autonomous AI Agent-native disposable email client with smart OTP and magic link extraction.**

`gecici-email` provides zero-configuration temporary email inboxes designed specifically for autonomous bots, web scrapers, testing pipelines, and AI frameworks (**LangChain**, **CrewAI**, **Browser-Use**, **AutoGPT**).

---

## ⚡ Features

- **Zero-Authentication**: Create inboxes immediately without API keys or accounts.
- **Dedicated Port 25 Inbound SMTP**: Independent mail routing, never blocked by corporate anti-spam filters.
- **Smart OTP Isolation**: Automatically extracts 4–8 digit verification codes (numeric and alphanumeric) in sub-seconds.
- **Magic Link Detection**: Isolates account verification and password reset URLs directly.
- **High-Signal AI Summaries**: Token-optimized clean text summaries ready to inject into LLM prompts.
- **Ephemeral & Zero-Log**: All messages reside in volatile RAM and automatically expire in 60 minutes.
- **Context Manager Support**: Inboxes auto-purge themselves on block exit (`with client.create_inbox() as inbox:`).

---

## 📦 Installation

```bash
pip install gecici-email
```

---

## 🚀 Quickstart

### 1. Simple OTP Extraction (Signups & Verifications)
```python
from gecici import GeciciEmail

client = GeciciEmail()

# Automatically creates an inbox and cleans it up when done
with client.create_inbox() as inbox:
    print(f"Generated Disposable Email: {inbox.address}")

    # --- Your automation logic (e.g. submit form on website) ---

    # Wait up to 30 seconds for the incoming verification email
    otp = inbox.wait_for_otp(timeout=30)
    print(f"Extracted OTP Code: {otp}")
```

### 2. Magic Link / Account Activation
```python
from gecici import GeciciEmail

client = GeciciEmail()

inbox = client.create_inbox(prefix="autobot")
print(f"Inbox: {inbox.address}")

# Wait for activation button link
activation_url = inbox.wait_for_link(timeout=45)
print(f"Click here to verify: {activation_url}")

# Clean up
inbox.delete()
```

### 3. Full Message Inspection & AI Summary
```python
from gecici import GeciciEmail

client = GeciciEmail()
inbox = client.create_inbox()

# Get all messages
messages = inbox.get_messages()

# Get LLM-ready summary
summary = inbox.get_ai_summary()
print(summary)
```

---

## 🌐 Browser-Use Integration (Web Browsing Agents)

Autonomous agents browsing the web with [browser-use](https://github.com/browser-use/browser-use) can directly create inboxes and verify signups:

```python
import asyncio
from browser_use import Agent
from langchain_openai import ChatOpenAI
from gecici.integrations.browser_use import get_browser_use_tools

async def main():
    # Automatically registers: create_disposable_email, wait_for_otp_code, wait_for_activation_link
    tools = get_browser_use_tools()

    agent = Agent(
        task="Go to https://example.com/signup, create a temporary email using gecici.email, sign up, wait for the verification code, and enter it.",
        llm=ChatOpenAI(model="gpt-4o"),
        tools=tools,
    )
    await agent.run()

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 🤖 LangChain Integration

`gecici-email` includes single tools or a complete `GeciciEmailToolkit`:

```python
from langchain.agents import create_openai_tools_agent, AgentExecutor
from langchain_openai import ChatOpenAI
from langchain import hub
from gecici.integrations.langchain import GeciciEmailToolkit

llm = ChatOpenAI(model="gpt-4o", temperature=0)
toolkit = GeciciEmailToolkit()
tools = toolkit.get_tools()

prompt = hub.pull("hwchase17/openai-tools-agent")
agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

agent_executor.invoke({"input": "Create a temporary email inbox and wait for the verification code sent to it."})
```

---

## 👥 CrewAI Integration

```python
from crewai import Agent, Task, Crew
from gecici.integrations.crewai import GeciciEmailTool

email_tool = GeciciEmailTool()

qa_agent = Agent(
    role="Automated QA Specialist",
    goal="Test new user registration and extract OTP confirmation codes",
    backstory="You are an expert QA automation agent running registration tests.",
    tools=[email_tool]
)
```

---

## 🌐 API & Protocol Specification

- **Website & Interactive Console**: [https://gecici.email](https://gecici.email)
- **REST API Documentation**: [https://gecici.email/api-dokuman](https://gecici.email/api-dokuman)
- **LLM Context (`llms.txt`)**: [https://gecici.email/llms.txt](https://gecici.email/llms.txt)

---

## 📄 License

MIT License. Free for commercial and non-commercial use.
