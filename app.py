#!/usr/bin/env python3
"""A small, dependency-free terminal client for the hosted gecici.email API.

This is client code only. Mail delivery, storage, and the hosted API are not
implemented in this repository.
"""

import getpass
import json
import re
import sys
from datetime import datetime
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import HTTPRedirectHandler, Request, build_opener


BASE_URL = "https://gecici.email/api/v1"
TIMEOUT_SECONDS = 15


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, request, file_pointer, code, message, headers, url):
        return None


class ApiError(Exception):
    def __init__(self, status, message):
        self.status = status
        super().__init__(message)


def clean_text(value, limit=4000):
    """Do not allow email content to inject terminal control sequences."""
    if not isinstance(value, str):
        return ""
    value = re.sub(r"\x1b\[[0-?]*[ -/]*[@-~]", "", value)
    value = "".join(char for char in value if char in "\n\t" or ord(char) >= 32)
    return value[:limit]


def display_time(milliseconds):
    try:
        return datetime.fromtimestamp(milliseconds / 1000).astimezone().strftime("%Y-%m-%d %H:%M %z")
    except (TypeError, ValueError, OverflowError, OSError):
        return "unknown"


class Client:
    def __init__(self, opener=None):
        self.opener = opener or build_opener(NoRedirect)

    def request(self, method, path, token=None, payload=None):
        headers = {"Accept": "application/json", "User-Agent": "gecici-email-client/1.0"}
        if token:
            headers["Authorization"] = "Bearer " + token
        data = None
        if payload is not None:
            headers["Content-Type"] = "application/json"
            data = json.dumps(payload).encode("utf-8")
        request = Request(BASE_URL + path, data=data, headers=headers, method=method)
        try:
            with self.opener.open(request, timeout=TIMEOUT_SECONDS) as response:
                status = response.status
                body = response.read(1024 * 1024)
        except HTTPError as error:
            status = error.code
            body = error.read(1024 * 1024)
        except (URLError, TimeoutError) as error:
            raise ApiError(0, "Connection failed: " + str(error.reason if isinstance(error, URLError) else error)) from error
        try:
            result = json.loads(body)
        except (UnicodeDecodeError, ValueError) as error:
            raise ApiError(status, "The server did not return valid JSON") from error
        if not isinstance(result, dict):
            raise ApiError(status, "The server returned an unexpected response")
        if status < 200 or status >= 300 or result.get("success") is False:
            message = clean_text(result.get("error") or "Request failed", 300)
            raise ApiError(status, message)
        return result

    def create(self, prefix=None):
        if prefix is None:
            result = self.request("POST", "/inbox/generate")
        else:
            result = self.request("POST", "/inbox/custom", payload={"prefix": prefix})
        inbox = result.get("inbox")
        if not isinstance(inbox, dict) or not inbox.get("address") or not inbox.get("token"):
            raise ApiError(0, "The inbox creation response has no address or token")
        return inbox

    def inbox_path(self, address):
        return "/inbox/" + quote(address, safe="")

    def info(self, address, token):
        return self.request("GET", self.inbox_path(address), token)["inbox"]

    def messages(self, address, token):
        return self.request("GET", self.inbox_path(address) + "/messages", token)

    def otp(self, address, token):
        return self.request("GET", self.inbox_path(address) + "/otp", token)

    def links(self, address, token):
        return self.request("GET", self.inbox_path(address) + "/links", token)

    def extend(self, address, token, minutes):
        return self.request("POST", self.inbox_path(address) + "/extend", token, {"minutes": minutes})

    def delete(self, address, token):
        return self.request("DELETE", self.inbox_path(address), token)


def show_messages(result):
    messages = result.get("messages") or []
    print("\nMessage count:", len(messages))
    for index, message in enumerate(messages, 1):
        sender = message.get("from") or {}
        if not isinstance(sender, dict):
            sender = {}
        print("\n--- Message", index, "---")
        print("From:", clean_text(sender.get("address"), 200))
        print("Subject:", clean_text(message.get("subject"), 300))
        print("Received:", display_time(message.get("receivedAt")))
        print("Text:\n" + (clean_text(message.get("text")) or "(No plain-text content)"))
    if not messages:
        print("No email has arrived. An empty inbox is not proof of delivery.")


def main():
    print("gecici.email — terminal client")
    print("Free, receive-only inboxes. Your token stays in memory for this session; it is not saved to disk.")
    print("Use only for authorized testing. Avoid sensitive accounts and real user data.")
    client = Client()
    address = None
    token = None

    while True:
        print("\nActive inbox:", address or "none")
        print("1 Create random inbox   2 Create custom inbox   3 Connect to an existing inbox")
        print("4 Refresh messages      5 Show OTP              6 Show verification link")
        print("7 Extend expiry         8 Delete inbox          0 Exit")
        try:
            choice = input("Choose an option: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nExiting.")
            return 0

        try:
            if choice == "0":
                return 0
            if choice in ("1", "2"):
                prefix = input("Address prefix (must include a digit and -/_/.): ").strip() if choice == "2" else None
                inbox = client.create(prefix)
                address, token = inbox["address"], inbox["token"]
                print("\nAddress:", address)
                print("Access token (keep private; it cannot be retrieved after this session):", token)
                print("Expires:", display_time(inbox.get("expiresAt")))
            elif choice == "3":
                candidate_address = input("Full email address: ").strip().lower()
                candidate_token = getpass.getpass("Access token: ").strip()
                if not candidate_address or not candidate_token:
                    print("Both address and token are required.")
                    continue
                info = client.info(candidate_address, candidate_token)
                address, token = candidate_address, candidate_token
                print("Connected. Expires:", display_time(info.get("expiresAt")))
            elif choice in ("4", "5", "6", "7", "8"):
                if not address or not token:
                    print("Create an inbox or connect to an existing one first.")
                    continue
                if choice == "4":
                    show_messages(client.messages(address, token))
                elif choice == "5":
                    result = client.otp(address, token)
                    print("OTP:", clean_text(result.get("otp"), 100))
                elif choice == "6":
                    result = client.links(address, token)
                    print("Link (never opened automatically):", clean_text(result.get("verificationLink"), 2000))
                elif choice == "7":
                    raw = input("Minutes to add (1-60): ").strip()
                    if not raw.isdecimal() or not 1 <= int(raw) <= 60:
                        print("Enter a whole number from 1 to 60.")
                        continue
                    result = client.extend(address, token, int(raw))
                    print("New expiry:", display_time(result.get("inbox", {}).get("expiresAt")))
                elif choice == "8":
                    if input("Type 'delete' to permanently delete this inbox: ").strip() != "delete":
                        print("Deletion canceled.")
                        continue
                    client.delete(address, token)
                    address, token = None, None
                    print("Inbox deleted.")
            else:
                print("Invalid option.")
        except ApiError as error:
            print("Operation failed (HTTP {}): {}".format(error.status or "network", error))
            if error.status == 408:
                print("No OTP or link may have arrived yet; this is not a successful result.")
        except (EOFError, KeyboardInterrupt):
            print("\nOperation canceled.")


if __name__ == "__main__":
    sys.exit(main())
