# Pull Request: Add GeciciEmailToolkit to langchain-community

- **Target Repository**: `https://github.com/langchain-ai/langchain`
- **Target Subdirectory**: `libs/community/langchain_community/tools/gecici_email/`
- **Suggested Branch Name**: `feat/langchain-community-gecici-email`

---

## 📝 PR Title
`feat(community): add GeciciEmailToolkit for disposable temporary email & OTP extraction`

---

## 📋 PR Description

### Description
Adds `GeciciEmailToolkit` and individual tools (`GeciciCreateInboxTool`, `GeciciWaitForOtpTool`, `GeciciWaitForMagicLinkTool`) to `langchain_community`.

This enables LangChain agents to autonomously register accounts, test onboarding flows, and bypass email verification walls by generating zero-auth temporary email inboxes and extracting 4–8 digit OTP codes or magic verification links.

### Key Benefits
- **Zero Configuration**: No API keys or accounts required.
- **Port 25 Direct Inbound**: Independent SMTP delivery that avoids blacklists.
- **Regex & Heuristic OTP Isolation**: Direct access to verification codes without parsing raw HTML emails.
- **Strict Ephemeral Privacy**: RAM-only storage with 60m TTL auto-purge.

### Example Usage
```python
from langchain_community.tools.gecici_email import GeciciEmailToolkit
from langchain.agents import create_openai_tools_agent, AgentExecutor
from langchain_openai import ChatOpenAI
from langchain import hub

toolkit = GeciciEmailToolkit()
tools = toolkit.get_tools()

llm = ChatOpenAI(model="gpt-4o", temperature=0)
prompt = hub.pull("hwchase17/openai-tools-agent")

agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

agent_executor.invoke({
    "input": "Create a temporary email address, wait for the incoming OTP code sent to it, and return the code."
})
```

---

## 🚀 Quick Submission Commands

```bash
# 1. Fork langchain-ai/langchain on GitHub
# 2. Clone your fork:
git clone git@github.com:codeonthetable/langchain.git
cd langchain

# 3. Create branch:
git checkout -b feat/langchain-community-gecici-email

# 4. Copy toolkit into libs/community:
mkdir -p libs/community/langchain_community/tools/gecici_email
cp /Users/bahadirdavdav/Desktop/Gemini\ Proje/gecici-email/community-prs/03-langchain/gecici_email_toolkit.py libs/community/langchain_community/tools/gecici_email/toolkit.py

# 5. Commit and push:
git add libs/community/langchain_community/tools/gecici_email/
git commit -m "feat(community): add GeciciEmailToolkit for disposable email & OTP extraction"
git push -u origin feat/langchain-community-gecici-email

# 6. Open PR on GitHub:
# Go to https://github.com/langchain-ai/langchain/compare and paste the PR Description above!
```
