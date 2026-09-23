from typing import Optional, Type
try:
    from pydantic import BaseModel, Field
    from crewai.tools import BaseTool
except ImportError:
    class BaseModel:  # type: ignore
        pass
    def Field(*args, **kwargs):  # type: ignore
        return None
    class BaseTool:  # type: ignore
        pass
import requests


class GeciciEmailToolInput(BaseModel):
    """Input schema for GeciciEmailTool."""
    action: str = Field(
        ...,
        description="Action to perform: 'create' (generates a new inbox), 'wait_otp' (waits for OTP verification code), or 'wait_link' (waits for confirmation URL)."
    )
    address: Optional[str] = Field(
        None,
        description="The disposable email address (required for 'wait_otp' and 'wait_link')."
    )
    prefix: Optional[str] = Field(
        None,
        description="Optional custom prefix for the new email address (only used for 'create')."
    )
    timeout_seconds: int = Field(
        30,
        description="Maximum seconds to wait for incoming OTP or verification link (default: 30)."
    )


class GeciciEmailTool(BaseTool):
    name: str = "Disposable Email and Verification Tool"
    description: str = (
        "Zero-auth disposable temporary email service powered by gecici.email. "
        "Allows autonomous AI agents to create clean inboxes, bypass email spam, "
        "and automatically extract OTP security codes and activation links."
    )
    args_schema: Type[BaseModel] = GeciciEmailToolInput
    base_url: str = "https://gecici.email/api/v1"

    def _run(
        self,
        action: str,
        address: Optional[str] = None,
        prefix: Optional[str] = None,
        timeout_seconds: int = 30,
    ) -> str:
        try:
            if action == "create":
                endpoint = f"{self.base_url}/inbox/custom" if prefix else f"{self.base_url}/inbox/generate"
                payload = {"prefix": prefix, "domain": "gecici.email"} if prefix else {"domain": "gecici.email"}
                resp = requests.post(endpoint, json=payload, timeout=15)
                resp.raise_for_status()
                data = resp.json()
                addr = data.get("inbox", {}).get("address", "")
                return f"Created disposable email inbox: {addr}"

            elif action == "wait_otp":
                if not address:
                    return "Error: 'address' parameter is required to wait for an OTP."
                timeout_ms = min(timeout_seconds * 1000, 60000)
                resp = requests.get(f"{self.base_url}/inbox/{address}/otp?timeout={timeout_ms}", timeout=timeout_seconds + 5)
                if resp.status_code == 200:
                    otp = resp.json().get("otp")
                    if otp:
                        return f"Extracted OTP code for {address}: {otp}"
                return f"No OTP received for {address} within {timeout_seconds} seconds."

            elif action == "wait_link":
                if not address:
                    return "Error: 'address' parameter is required to wait for a verification link."
                timeout_ms = min(timeout_seconds * 1000, 60000)
                resp = requests.get(f"{self.base_url}/inbox/{address}/links?timeout={timeout_ms}", timeout=timeout_seconds + 5)
                if resp.status_code == 200:
                    link = resp.json().get("verificationLink")
                    if link:
                        return f"Extracted confirmation link for {address}: {link}"
                return f"No verification link received for {address} within {timeout_seconds} seconds."

            else:
                return f"Unknown action '{action}'. Supported actions are: 'create', 'wait_otp', 'wait_link'."

        except Exception as e:
            return f"Error executing disposable email action: {str(e)}"
