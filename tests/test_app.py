import io
import json
import ssl
import unittest
from contextlib import redirect_stdout
from types import SimpleNamespace
from unittest.mock import patch, MagicMock
from urllib.error import HTTPError

from app import ApiError, Client, NoRedirect, clean_text, tls_context, main


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
    def test_check_requests_only_health_and_never_displays_response_data(self):
        output = io.StringIO()
        with patch('app.Client') as factory, redirect_stdout(output):
            factory.return_value.request.return_value = {'status': 'ok', 'unexpected': 'fixture-private-value'}
            self.assertEqual(main(['--check']), 0)
        factory.return_value.request.assert_called_once_with('GET', '/health')
        self.assertEqual(json.loads(output.getvalue()), {'api_reachable': True, 'inbox_created': False})

    def test_check_reports_failures_without_echoing_exception_data(self):
        output = io.StringIO()
        with patch('app.Client') as factory, redirect_stdout(output):
            factory.return_value.request.side_effect = ApiError(0, 'fixture-private-value')
            self.assertEqual(main(['--check']), 1)
        self.assertNotIn('fixture-private-value', output.getvalue())
        self.assertFalse(json.loads(output.getvalue())['api_reachable'])

    def test_missing_health_status_is_not_success(self):
        with patch('app.Client') as factory, redirect_stdout(io.StringIO()):
            factory.return_value.request.return_value = {}
            self.assertEqual(main(['--check']), 1)

    def test_tls_keeps_hostname_and_certificate_verification(self):
        context = tls_context()
        self.assertTrue(context.check_hostname)
        self.assertEqual(context.verify_mode, ssl.CERT_REQUIRED)

    def test_missing_default_cafile_loads_existing_system_bundle(self):
        context = MagicMock()
        with patch('app.ssl.create_default_context', return_value=context), patch('app.ssl.get_default_verify_paths', return_value=SimpleNamespace(cafile=None)), patch('app.Path.is_file', return_value=True):
            self.assertIs(tls_context(), context)
        context.load_verify_locations.assert_called_once_with('/etc/ssl/cert.pem')

    def test_configured_cafile_is_preserved(self):
        context = MagicMock()
        with patch('app.ssl.create_default_context', return_value=context), patch('app.ssl.get_default_verify_paths', return_value=SimpleNamespace(cafile='/configured/ca.pem')):
            tls_context()
        context.load_verify_locations.assert_not_called()

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
            io.BytesIO('{"success":false,"error":"No email found yet"}'.encode("utf-8")),
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
