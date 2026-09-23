from typing import Optional, Type, List
try:
    from pydantic import BaseModel, Field
    from langchain_core.tools import BaseTool
except ImportError:
    try:
        from pydantic import BaseModel, Field
        from langchain.tools import BaseTool  # type: ignore
    except ImportError:
        class BaseModel:  # type: ignore
            pass
        def Field(*args, **kwargs):  # type: ignore
            return None
        class BaseTool:  # type: ignore
            pass
import requests


class CreateInboxInput(BaseModel):
    prefix: Optional[str] = Field(None, description="Optional custom prefix for the temporary email, e.g. 'agent_test'.")
    domain: str = Field("gecici.email", description="Domain to use, defaults to 'gecici.email'.")


class GeciciCreateInboxTool(BaseTool):
    name: str = "gecici_create_inbox"
    description: str = "Generates a new disposable temporary email inbox for receiving signups, verification codes, or test emails."
    args_schema: Type[BaseModel] = CreateInboxInput

    def _run(self, prefix: Optional[str] = None, domain: str = "gecici.email") -> str:
        endpoint = f"https://gecici.email/api/v1/inbox/{'custom' if prefix else 'generate'}"
        payload = {"prefix": prefix, "domain": domain} if prefix else {"domain": domain}
        resp = requests.post(endpoint, json=payload, timeout=15)
        resp.raise_for_status()
        return resp.json().get("inbox", {}).get("address", "")

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
        timeout_ms = min(timeout_seconds * 1000, 60000)
        resp = requests.get(f"https://gecici.email/api/v1/inbox/{address}/otp?timeout={timeout_ms}", timeout=timeout_seconds + 5)
        if resp.status_code == 200:
            otp = resp.json().get("otp")
            if otp:
                return str(otp)
        return "NO_OTP_RECEIVED_TIMEOUT"

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
        timeout_ms = min(timeout_seconds * 1000, 60000)
        resp = requests.get(f"https://gecici.email/api/v1/inbox/{address}/links?timeout={timeout_ms}", timeout=timeout_seconds + 5)
        if resp.status_code == 200:
            link = resp.json().get("verificationLink")
            if link:
                return str(link)
        return "NO_LINK_RECEIVED_TIMEOUT"

    async def _arun(self, address: str, timeout_seconds: int = 30) -> str:
        return self._run(address=address, timeout_seconds=timeout_seconds)


class GeciciEmailToolkit:
    """Toolkit for interacting with disposable temporary emails via gecici.email."""

    def get_tools(self) -> List[BaseTool]:
        """Return all available gecici-email tools for LangChain agents."""
        return [
            GeciciCreateInboxTool(),
            GeciciWaitForOtpTool(),
            GeciciWaitForMagicLinkTool(),
        ]
