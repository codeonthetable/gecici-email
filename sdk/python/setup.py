import os
from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
with open(os.path.join(here, "README.md"), encoding="utf-8") as f:
    long_description = f.read()

setup(
    name="gecici-email",
    version="1.1.0",
    description="Autonomous AI Agent-native disposable email client with smart OTP and magic link extraction for browser-use, LangChain, CrewAI.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="gecici.email",
    author_email="support@gecici.email",
    url="https://gecici.email",
    project_urls={
        "Documentation": "https://gecici.email/api-dokuman",
        "Source": "https://github.com/codeonthetable/gecici-email",
        "Tracker": "https://github.com/codeonthetable/gecici-email/issues",
        "LLMs Context": "https://gecici.email/llms.txt"
    },
    license="MIT",
    packages=find_packages(),
    install_requires=[
        "requests>=2.28.0"
    ],
    extras_require={
        "langchain": ["langchain>=0.1.0", "pydantic>=2.0.0"],
        "crewai": ["crewai>=0.1.0", "pydantic>=2.0.0"],
        "browser-use": ["browser-use>=0.1.0"],
        "all": ["langchain>=0.1.0", "crewai>=0.1.0", "browser-use>=0.1.0", "pydantic>=2.0.0"]
    },
    python_requires=">=3.8",
    keywords=[
        "disposable-email",
        "temp-mail",
        "ai-agents",
        "mcp",
        "model-context-protocol",
        "browser-use",
        "langchain",
        "crewai",
        "otp-extractor",
        "automation",
        "testing"
    ],
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "Intended Audience :: Information Technology",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Operating System :: OS Independent",
        "Topic :: Communications :: Email",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Topic :: Software Development :: Testing"
    ]
)
