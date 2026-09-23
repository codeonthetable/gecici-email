# Pull Request: Add GeciciEmailTool for Disposable Inboxes & OTP Extraction

- **Target Repository**: `https://github.com/crewAIInc/crewAI-tools`
- **Target Branch**: `main`
- **Suggested Branch Name**: `feat/gecici-disposable-email-tool`

---

## 📝 PR Title
`feat(tools): add GeciciEmailTool for disposable email & OTP verification extraction`

---

## 📋 PR Description

### Summary
Adds `GeciciEmailTool` to `crewai_tools`, enabling autonomous CrewAI agents to generate instant disposable temporary email inboxes, bypass spam, and automatically extract 4–8 digit OTP codes or account activation URLs during automated flows.

### Problem Solved
Autonomous agent crews performing user testing, account creation, or web research frequently get stuck when web services require email confirmations. Standard email integrations (Gmail, IMAP) require credential setups and pollute personal mailboxes. 

`gecici.email` provides:
- **Zero-Authentication**: No API keys required for disposable email generation.
- **Port 25 Inbound SMTP**: Independent mail delivery, not blocked by anti-bot filters.
- **Smart OTP Isolation**: Regex & NLP heuristics isolate verification codes in sub-seconds.
- **Ephemeral RAM Storage**: All messages self-destruct after 60 minutes.

### Usage Example
```python
from crewai import Agent, Task, Crew
from crewai_tools import GeciciEmailTool

email_tool = GeciciEmailTool()

qa_agent = Agent(
    role="Signup QA Specialist",
    goal="Register a test account and confirm OTP code",
    backstory="Specialized in automated QA onboarding pipelines.",
    tools=[email_tool],
    verbose=True
)

task = Task(
    description="Create a temporary email, submit signup on the staging app, wait for the OTP verification code, and report the code.",
    expected_output="The extracted 6-digit OTP code.",
    agent=qa_agent
)

crew = Crew(agents=[qa_agent], tasks=[task])
crew.kickoff()
```

---

## 🚀 Quick Submission Commands

```bash
# 1. Fork crewAIInc/crewAI-tools on GitHub
# 2. Clone your fork:
git clone git@github.com:codeonthetable/crewAI-tools.git
cd crewAI-tools

# 3. Create feature branch:
git checkout -b feat/gecici-disposable-email-tool

# 4. Copy the tool and test files:
cp /Users/bahadirdavdav/Desktop/Gemini\ Proje/gecici-email/community-prs/02-crewai-tools/gecici_email_tool.py crewai_tools/tools/gecici_email_tool/
cp /Users/bahadirdavdav/Desktop/Gemini\ Proje/gecici-email/community-prs/02-crewai-tools/test_gecici_email_tool.py tests/tools/test_gecici_email_tool.py

# 5. Commit and push:
git add crewai_tools/ tests/
git commit -m "feat(tools): add GeciciEmailTool for disposable email & OTP extraction"
git push -u origin feat/gecici-disposable-email-tool

# 6. Open PR on GitHub:
# Go to https://github.com/crewAIInc/crewAI-tools/compare and paste the PR Description above!
```
