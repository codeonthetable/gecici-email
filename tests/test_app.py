import io
import json
import unittest
from urllib.error import HTTPError

from app import ApiError, Client, NoRedirect, clean_text


class Response(io.BytesIO):
    def __init__(self, status, payload):
        super().__init__(json.dumps(payload).encode("utf-8"))
        self.status = status


class FakeOpener:
    def __init__(self, responses):
        self.responses = iter(responses)
        self.requests = []

    def open(self, request, timeout):
        self.requests.append((request, timeout))
        response = next(self.responses)
        if isinstance(response, Exception):
            raise response
        return response


class ClientTests(unittest.TestCase):
    def test_create_and_token_protected_read(self):
        opener = FakeOpener([
            Response(201, {"success": True, "inbox": {"address": "qa-123@gecici.email", "token": "secret"}}),
            Response(200, {"success": True, "messages": []}),
        ])
        client = Client(opener)
        inbox = client.create()
        messages = client.messages(inbox["address"], inbox["token"])
        self.assertEqual(messages["messages"], [])
        create_request = opener.requests[0][0]
        self.assertEqual(create_request.get_method(), "POST")
        self.assertEqual(create_request.full_url, "https://gecici.email/api/v1/inbox/generate")
        read_request = opener.requests[1][0]
        self.assertIn("qa-123%40gecici.email/messages", read_request.full_url)
        self.assertEqual(read_request.get_header("Authorization"), "Bearer secret")
        self.assertEqual(opener.requests[1][1], 15)

    def test_custom_prefix_and_delete(self):
        opener = FakeOpener([
            Response(201, {"success": True, "inbox": {"address": "qa-123@gecici.email", "token": "secret"}}),
            Response(200, {"success": True}),
        ])
        client = Client(opener)
        client.create("qa-123")
        self.assertEqual(json.loads(opener.requests[0][0].data), {"prefix": "qa-123"})
        client.delete("qa-123@gecici.email", "secret")
        self.assertEqual(opener.requests[1][0].get_method(), "DELETE")

    def test_http_error_is_not_reported_as_success(self):
        error = HTTPError(
            "https://gecici.email/api/v1/inbox/x/otp", 408, "Not ready", {},
            io.BytesIO('{"success":false,"error":"Henüz e-posta bulunamadı"}'.encode("utf-8")),
        )
        with self.assertRaises(ApiError) as caught:
            Client(FakeOpener([error])).otp("x@gecici.email", "secret")
        self.assertEqual(caught.exception.status, 408)

    def test_bad_creation_response_is_rejected(self):
        with self.assertRaises(ApiError):
            Client(FakeOpener([Response(201, {"success": True, "inbox": {"address": "x"}})])).create()

    def test_redirects_are_not_followed_with_token(self):
        self.assertIsNone(NoRedirect().redirect_request(None, None, 302, "", {}, "https://example.com"))

    def test_email_cannot_inject_terminal_escape(self):
        self.assertEqual(clean_text("hello\x1b[31mred\x07"), "hellored")


if __name__ == "__main__":
    unittest.main()
