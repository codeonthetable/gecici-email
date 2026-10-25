"""Local contract tests: no model, browser, external mail or live HTTP."""
import asyncio
import io
import importlib.util
import json
import os
import sys
import unittest
from unittest.mock import AsyncMock, patch
from urllib.error import HTTPError

os.environ['ANONYMIZED_TELEMETRY'] = 'false'
os.environ['BROWSER_USE_CLOUD_SYNC'] = 'false'
os.environ['BROWSER_USE_LOGGING_LEVEL'] = 'critical'

from examples.browser_use_inbox import ApiFailure, InboxTools, NoRedirect


class Response(io.BytesIO):
    def __init__(self, status, data):
        super().__init__(json.dumps(data).encode())
        self.status = status


class Opener:
    def __init__(self, responses):
        self.responses = iter(responses)
        self.requests = []

    def open(self, request, timeout):
        self.requests.append((request, timeout))
        response = next(self.responses)
        if isinstance(response, Exception):
            raise response
        return response


def created():
    return Response(201, {'success': True, 'inbox': {
        'address': 'fixture@example.invalid', 'token': 'fictional-private-token'}})


@unittest.skipUnless(sys.version_info >= (3, 11), 'browser-use example requires Python 3.11+')
class InboxTests(unittest.IsolatedAsyncioTestCase):
    async def test_concurrent_create_reuses_inbox_and_private_token(self):
        opener = Opener([created(), Response(200, {'success': True, 'otp': '572634'}),
                         Response(200, {'success': True})])
        inbox = InboxTools(qa=True, opener=opener)
        addresses = await asyncio.gather(inbox.create(), inbox.create())
        self.assertEqual(addresses[0], addresses[1])
        self.assertEqual(len(opener.requests), 1)
        self.assertEqual(json.loads(opener.requests[0][0].data), {})
        self.assertEqual(await inbox.wait_for_otp(1), '572634')
        self.assertEqual(opener.requests[1][0].get_header('Authorization'), 'Bearer fictional-private-token')
        self.assertLessEqual(opener.requests[1][1], 1)
        await inbox.close()
        self.assertIsNone(inbox._inbox)
        self.assertTrue(all(req.get_header('X-gecici-client') == 'qa-test' for req, _ in opener.requests))

    async def test_failed_delete_retains_token_for_retry(self):
        opener = Opener([created(), Response(503, {}), Response(200, {'success': True})])
        inbox = InboxTools(opener=opener)
        await inbox.create()
        with self.assertRaises(ApiFailure):
            await inbox.close()
        self.assertIsNotNone(inbox._inbox)
        await inbox.close()
        self.assertIsNone(inbox._inbox)

    async def test_missing_otp_is_not_success(self):
        inbox = InboxTools(opener=Opener([created(), Response(200, {'success': True, 'otp': None})]))
        await inbox.create()
        with self.assertRaises(TimeoutError):
            await inbox.wait_for_otp(1)

    async def test_408_retries_but_403_stops(self):
        opener = Opener([created(), Response(408, {}), Response(200, {'success': True, 'otp': '572634'}), Response(403, {})])
        inbox = InboxTools(opener=opener)
        await inbox.create()
        with patch('examples.browser_use_inbox.asyncio.sleep', new=AsyncMock()):
            self.assertEqual(await inbox.wait_for_otp(2), '572634')
        with self.assertRaises(ApiFailure) as caught:
            await inbox.wait_for_otp(2)
        self.assertEqual(caught.exception.status, 403)

    async def test_invalid_timeouts_and_no_inbox_do_not_make_requests(self):
        opener = Opener([])
        inbox = InboxTools(opener=opener)
        for timeout in (0, 46, True, '30'):
            with self.assertRaises(ValueError):
                await inbox.wait_for_otp(timeout)
        with self.assertRaises(ValueError):
            await inbox.wait_for_otp(1)
        self.assertEqual(opener.requests, [])

    def test_http_redirect_is_not_followed_with_bearer_token(self):
        self.assertIsNone(NoRedirect().redirect_request(None, None, 302, '', {}, 'https://example.invalid'))
        inbox = InboxTools(opener=Opener([HTTPError('https://example.invalid', 302, 'moved', {}, io.BytesIO(b''))]))
        with self.assertRaises(ApiFailure):
            inbox._request('/inbox/generate', 'POST', {})


@unittest.skipUnless(importlib.util.find_spec('browser_use'), 'Optional browser-use package is not installed')
class RealFrameworkTests(unittest.IsolatedAsyncioTestCase):
    async def test_actual_tool_schema_and_dispatch(self):
        from browser_use import Tools
        inbox = InboxTools(opener=Opener([created(), Response(200, {'success': True, 'otp': '572634'}), Response(200, {'success': True})]))
        tools = inbox.register(Tools())
        names = ['gecici_create_inbox', 'gecici_wait_for_otp', 'gecici_delete_inbox']
        action_model = tools.registry.create_action_model(include_actions=names)
        for name in names:
            action_model.model_validate({name: {}})
            parameters = tools.registry.registry.actions[name].param_model.model_json_schema()['properties']
            self.assertNotIn('token', parameters)
            self.assertNotIn('email_address', parameters)
        result = await tools.registry.execute_action(names[0], {})
        self.assertFalse(result.error)
        self.assertNotIn('fictional-private-token', result.model_dump_json())
        result = await tools.registry.execute_action(names[1], {'timeout_seconds': 1})
        self.assertEqual(result.extracted_content, '572634')
        result = await tools.registry.execute_action(names[2], {})
        self.assertFalse(result.error)
        self.assertIsNone(inbox._inbox)

    async def test_framework_error_does_not_return_exception_body(self):
        from browser_use import Tools
        inbox = InboxTools(opener=Opener([RuntimeError('fictional-private-token')]))
        tools = inbox.register(Tools())
        result = await tools.registry.execute_action('gecici_create_inbox', {})
        self.assertTrue(result.error)
        self.assertNotIn('fictional-private-token', result.model_dump_json())


if __name__ == '__main__':
    unittest.main()
