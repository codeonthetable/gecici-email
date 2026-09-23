"""
Example: Autonomous Web Signup with Disposable Email and Smart OTP Extraction
Framework: browser-use (https://github.com/browser-use/browser-use)
Email Provider: gecici.email (https://gecici.email)

Requirements:
    pip install browser-use gecici-email langchain-openai
"""

import asyncio
import os
from langchain_openai import ChatOpenAI
from browser_use import Agent, Tools, ActionResult
from gecici import GeciciEmail

# 1. Initialize gecici.email client
gecici = GeciciEmail()

# 2. Initialize browser-use tools registry
tools = Tools()


@tools.action(description="Generate a disposable temporary email inbox for user signups. Returns the email address.")
def create_disposable_email(prefix: str = "agent") -> ActionResult:
    try:
        inbox = gecici.create_inbox(prefix=prefix)
        return ActionResult(extracted_content=f"Disposable email generated: {inbox.address}")
    except Exception as e:
        return ActionResult(error=f"Failed to create email: {str(e)}")


@tools.action(description="Wait for an incoming verification email sent to the disposable address and extract the 4-8 digit OTP code. Returns the OTP code.")
def wait_for_otp_verification_code(email_address: str, timeout_seconds: int = 30) -> ActionResult:
    try:
        otp = gecici.wait_for_otp(address=email_address, timeout=timeout_seconds)
        if otp:
            return ActionResult(extracted_content=f"Verification OTP code received: {otp}")
        return ActionResult(error=f"No verification code received on {email_address} within {timeout_seconds}s.")
    except Exception as e:
        return ActionResult(error=f"Error waiting for OTP: {str(e)}")


@tools.action(description="Wait for an incoming verification email and extract the confirmation link URL.")
def wait_for_confirmation_link(email_address: str, timeout_seconds: int = 30) -> ActionResult:
    try:
        link = gecici.wait_for_link(address=email_address, timeout=timeout_seconds)
        if link:
            return ActionResult(extracted_content=f"Confirmation URL received: {link}")
        return ActionResult(error=f"No confirmation link received on {email_address} within {timeout_seconds}s.")
    except Exception as e:
        return ActionResult(error=f"Error waiting for confirmation link: {str(e)}")


async def run_autonomous_signup():
    # Configure your preferred LLM (OpenAI, Anthropic, or local)
    llm = ChatOpenAI(model="gpt-4o", temperature=0)

    # Define the autonomous browser task
    task = (
        "1. Generate a disposable email using the create_disposable_email tool.\n"
        "2. Navigate to https://example.com/signup (or your target registration page).\n"
        "3. Fill in the registration form using the generated disposable email.\n"
        "4. Submit the form to trigger the verification email.\n"
        "5. Call wait_for_otp_verification_code with the email to retrieve the 6-digit OTP code.\n"
        "6. Enter the OTP code on the page and complete registration."
    )

    agent = Agent(
        task=task,
        llm=llm,
        tools=tools,
        use_vision=True,
    )

    history = await agent.run(max_steps=20)
    print("\n--- Agent Execution Result ---")
    print(history.final_result())


if __name__ == "__main__":
    asyncio.run(run_autonomous_signup())
