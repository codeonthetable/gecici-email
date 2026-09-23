"""
gecici-email integration for browser-use (https://github.com/browser-use/browser-use)
Allows autonomous browser agents to create temporary inboxes, receive confirmation emails,
and extract OTP codes or magic links directly during automated web workflows.
"""
from typing import Optional, Dict, Any, Union
from ..client import GeciciEmail

# Check if browser_use is available
try:
    from browser_use import ActionResult
except ImportError:
    try:
        from browser_use.controller.service import ActionResult  # type: ignore # legacy fallback
    except ImportError:
        # Fallback dummy class if browser-use is not installed in the current environment
        class ActionResult:  # type: ignore
            def __init__(self, extracted_content: Optional[str] = None, error: Optional[str] = None, is_done: bool = False):
                self.extracted_content = extracted_content
                self.error = error
                self.is_done = is_done

            def __repr__(self):
                if self.error:
                    return f"ActionResult(error={self.error!r})"
                return f"ActionResult(extracted_content={self.extracted_content!r})"


class GeciciBrowserTools:
    """
    Browser-Use helper and tool provider for gecici.email.
    Can be registered into a browser_use.Tools or browser_use.Controller instance.
    """

    def __init__(self, api_url: Optional[str] = None):
        self.client = GeciciEmail(base_url=api_url) if api_url else GeciciEmail()

    def register(self, tools_or_controller: Any) -> Any:
        """
        Registers all disposable email actions into the provided browser-use Tools or Controller.
        """
        if hasattr(tools_or_controller, 'action'):
            action_dec = tools_or_controller.action
        else:
            raise AttributeError("Expected an object with an .action() decorator (e.g. browser_use.Tools or Controller).")

        @action_dec(description="Create a new disposable temporary email inbox for signing up on the current website. Returns the email address.")
        def create_disposable_email(prefix: Optional[str] = None, domain: str = "gecici.email") -> ActionResult:
            try:
                inbox = self.client.create_inbox(prefix=prefix, domain=domain)
                return ActionResult(extracted_content=f"Created disposable email: {inbox.address}")
            except Exception as e:
                return ActionResult(error=f"Failed to create disposable email: {str(e)}")

        @action_dec(description="Wait for an incoming verification email sent to the disposable address and extract the 4-8 digit OTP / security code. Returns the OTP code.")
        def wait_for_otp_code(email_address: str, timeout_seconds: int = 30) -> ActionResult:
            try:
                otp = self.client.wait_for_otp(address=email_address, timeout=timeout_seconds)
                if otp:
                    return ActionResult(extracted_content=f"Extracted OTP code: {otp}")
                return ActionResult(error=f"No OTP code received on {email_address} within {timeout_seconds} seconds.")
            except Exception as e:
                return ActionResult(error=f"Error waiting for OTP: {str(e)}")

        @action_dec(description="Wait for an incoming verification email and extract the account confirmation or magic login link. Returns the URL.")
        def wait_for_activation_link(email_address: str, timeout_seconds: int = 30) -> ActionResult:
            try:
                link = self.client.wait_for_link(address=email_address, timeout=timeout_seconds)
                if link:
                    return ActionResult(extracted_content=f"Extracted activation link: {link}")
                return ActionResult(error=f"No activation link received on {email_address} within {timeout_seconds} seconds.")
            except Exception as e:
                return ActionResult(error=f"Error waiting for link: {str(e)}")

        @action_dec(description="Fetch all messages in the disposable inbox to read verification emails or message content.")
        def get_inbox_messages(email_address: str) -> ActionResult:
            try:
                inbox = self.client.get_inbox(email_address)
                messages = inbox.get_messages()
                if not messages:
                    return ActionResult(extracted_content=f"Inbox {email_address} is currently empty.")
                
                summary = []
                for msg in messages:
                    summary.append(f"From: {msg.get('from')} | Subject: {msg.get('subject')} | Snippet: {msg.get('snippet', '')}")
                return ActionResult(extracted_content="\n".join(summary))
            except Exception as e:
                return ActionResult(error=f"Error fetching inbox messages: {str(e)}")

        return tools_or_controller


def get_browser_use_tools(tools: Optional[Any] = None, api_url: Optional[str] = None) -> Any:
    """
    Convenience function: If `tools` is provided, registers actions into it.
    If `tools` is None, initializes a new browser_use.Tools (or Controller) and registers actions.
    """
    if tools is None:
        try:
            from browser_use import Tools  # type: ignore
            tools = Tools()
        except ImportError:
            try:
                from browser_use.controller.service import Controller  # type: ignore
                tools = Controller()
            except ImportError:
                raise ImportError(
                    "browser-use is not installed. Install it with: pip install browser-use"
                )

    helper = GeciciBrowserTools(api_url=api_url)
    return helper.register(tools)
