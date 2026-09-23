from typing import Optional, Type
from ..client import GeciciEmail

try:
    from pydantic import BaseModel, Field
    from langchain.tools import BaseTool

    class CreateInboxInput(BaseModel):
        prefix: Optional[str] = Field(None, description="Optional custom prefix for the temporary email, e.g. 'agent_test'.")
        domain: str = Field("gecici.email", description="Domain to use, defaults to 'gecici.email'.")

    class GeciciCreateInboxTool(BaseTool):
        name: str = "gecici_create_inbox"
        description: str = "Generates a new disposable temporary email inbox for receiving signups, verification codes, or test emails."
        args_schema: Type[BaseModel] = CreateInboxInput

        def _run(self, prefix: Optional[str] = None, domain: str = "gecici.email") -> str:
            client = GeciciEmail()
            inbox = client.create_inbox(prefix=prefix, domain=domain)
            return inbox.address

        async def _arun(self, prefix: Optional[str] = None, domain: str = "gecici.email") -> str:
            return self._run(prefix=prefix, domain=domain)

    class WaitForOtpInput(BaseModel):
        address: str = Field(..., description="The temporary email address to monitor for an incoming OTP verification code.")
        timeout_seconds: int = Field(30, description="Max seconds to wait (default: 30, max: 60).")

    class GeciciWaitForOtpTool(BaseTool):
        name: str = "gecici_wait_for_otp"
        description: str = "Waits for an incoming verification email sent to the disposable address and returns the extracted 4-8 digit OTP code."
        args_schema: Type[BaseModel] = WaitForOtpInput

        def _run(self, address: str, timeout_seconds: int = 30) -> str:
            client = GeciciEmail()
            otp = client.wait_for_otp(address=address, timeout=timeout_seconds)
            return otp or "NO_OTP_RECEIVED_TIMEOUT"

        async def _arun(self, address: str, timeout_seconds: int = 30) -> str:
            return self._run(address=address, timeout_seconds=timeout_seconds)

    class WaitForLinkInput(BaseModel):
        address: str = Field(..., description="The temporary email address to monitor for an activation / confirmation link.")
        timeout_seconds: int = Field(30, description="Max seconds to wait.")

    class GeciciWaitForMagicLinkTool(BaseTool):
        name: str = "gecici_wait_for_magic_link"
        description: str = "Waits for an incoming email and extracts the main account confirmation / password reset URL."
        args_schema: Type[BaseModel] = WaitForLinkInput

        def _run(self, address: str, timeout_seconds: int = 30) -> str:
            client = GeciciEmail()
            link = client.wait_for_link(address=address, timeout=timeout_seconds)
            return link or "NO_LINK_RECEIVED_TIMEOUT"

        async def _arun(self, address: str, timeout_seconds: int = 30) -> str:
            return self._run(address=address, timeout_seconds=timeout_seconds)

    class GeciciEmailToolkit(BaseModel):
        """Toolkit for interacting with disposable temporary emails via gecici.email."""

        def get_tools(self) -> list:
            """Return all available gecici-email tools for LangChain agents."""
            return [
                GeciciCreateInboxTool(),
                GeciciWaitForOtpTool(),
                GeciciWaitForMagicLinkTool(),
            ]

except ImportError:
    # If langchain or pydantic is not installed, provide stub with helpful message
    class GeciciCreateInboxTool:  # type: ignore
        def __init__(self):
            raise ImportError("LangChain is required to use GeciciCreateInboxTool. Install it with: pip install langchain")

    class GeciciWaitForOtpTool:  # type: ignore
        def __init__(self):
            raise ImportError("LangChain is required to use GeciciWaitForOtpTool. Install it with: pip install langchain")

    class GeciciWaitForMagicLinkTool:  # type: ignore
        def __init__(self):
            raise ImportError("LangChain is required to use GeciciWaitForMagicLinkTool. Install it with: pip install langchain")

    class GeciciEmailToolkit:  # type: ignore
        def __init__(self):
            raise ImportError("LangChain is required to use GeciciEmailToolkit. Install it with: pip install langchain")
