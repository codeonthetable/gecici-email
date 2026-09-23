"""
gecici-email integrations for AI Agent frameworks (browser-use, LangChain, CrewAI).
"""

from .browser_use import GeciciBrowserTools, get_browser_use_tools
from .langchain import (
    GeciciCreateInboxTool,
    GeciciWaitForOtpTool,
    GeciciWaitForMagicLinkTool,
    GeciciEmailToolkit,
)
from .crewai import GeciciEmailTool

__all__ = [
    "GeciciBrowserTools",
    "get_browser_use_tools",
    "GeciciCreateInboxTool",
    "GeciciWaitForOtpTool",
    "GeciciWaitForMagicLinkTool",
    "GeciciEmailToolkit",
    "GeciciEmailTool",
]
