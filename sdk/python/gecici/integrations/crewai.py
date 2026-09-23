from typing import Optional, Type
from ..client import GeciciEmail

try:
    from pydantic import BaseModel, Field
    from crewai.tools import BaseTool

    class CreateAndMonitorInboxInput(BaseModel):
        prefix: Optional[str] = Field(None, description="Optional custom prefix for the inbox.")
        domain: str = Field("gecici.email", description="Domain name, defaults to 'gecici.email'.")
        wait_for_otp: bool = Field(True, description="Whether to wait for an incoming OTP code.")
        timeout_seconds: int = Field(30, description="Max seconds to wait.")

    class GeciciEmailTool(BaseTool):
        name: str = "Gecici Disposable Email Tool"
        description: str = "Creates a temporary email inbox, receives verification emails, and extracts OTP codes or activation links."
        args_schema: Type[BaseModel] = CreateAndMonitorInboxInput

        def _run(self, prefix: Optional[str] = None, domain: str = "gecici.email", wait_for_otp: bool = True, timeout_seconds: int = 30) -> str:
            client = GeciciEmail()
            inbox = client.create_inbox(prefix=prefix, domain=domain)
            
            if not wait_for_otp:
                return f"Created disposable inbox: {inbox.address}. Monitoring active."

            otp = inbox.wait_for_otp(timeout=timeout_seconds)
            if otp:
                return f"Inbox: {inbox.address} | Extracted OTP Code: {otp}"
            return f"Inbox: {inbox.address} | No OTP received within {timeout_seconds} seconds."

except ImportError:
    class GeciciEmailTool:  # type: ignore
        def __init__(self):
            raise ImportError("CrewAI is required to use GeciciEmailTool. Install it with: pip install crewai")
