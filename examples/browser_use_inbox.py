#!/usr/bin/env python3
"""One token-private inbox for browser-use tools. See docs/BROWSER_USE.md.

--qa-run tests real tool dispatch and the hosted API with a simulated message.
It does not launch a browser, call a model, or test external SMTP delivery.
"""
import argparse
import asyncio
import json
import os
import re
import ssl
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import HTTPRedirectHandler, HTTPSHandler, Request, build_opener


class ApiFailure(Exception):
    def __init__(self, status):
        self.status = status
        super().__init__(f"Inbox API failed (HTTP {status})")


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class InboxTools:
    """Create a fresh instance per agent run; only its own inbox is accessible.

    The address and OTP are returned to the agent. The bearer token is not.
    Concurrent tool calls are serialized to avoid orphaning created inboxes.
    """
    def __init__(self, *, qa=False, opener=None):
        context = ssl.create_default_context()
        if not ssl.get_default_verify_paths().cafile and Path('/etc/ssl/cert.pem').exists():
            context.load_verify_locations('/etc/ssl/cert.pem')
        self._opener = opener or build_opener(NoRedirect(), HTTPSHandler(context=context))
        self._qa = qa
        self._inbox = None
        self._lock = asyncio.Lock()

    def _request(self, path, method='GET', payload=None, timeout=10):
        headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
        if self._qa:
            headers['X-Gecici-Client'] = 'qa-test'
        # No new unrecognized client label is counted as verified AI usage.
        if self._inbox:
            headers['Authorization'] = 'Bearer ' + self._inbox['token']
        data = None if payload is None else json.dumps(payload).encode()
        request = Request('https://gecici.email/api/v1' + path,
                          data=data, headers=headers, method=method)
        try:
            response = self._opener.open(request, timeout=timeout)
        except HTTPError as error:
            response = error
        with response:
            status = response.status
            if not 200 <= status < 300:
                raise ApiFailure(status)
            result = json.loads(response.read(1024 * 1024))
        if not isinstance(result, dict) or result.get('success') is not True:
            raise ApiFailure(status)
        return result

    def _route(self):
        if not self._inbox:
            raise ValueError('Create an inbox first')
        return '/inbox/' + quote(self._inbox['address'], safe='')

    async def create(self):
        async with self._lock:
            if not self._inbox:
                result = await asyncio.to_thread(self._request, '/inbox/generate', 'POST', {})
                inbox = result.get('inbox', {})
                if not isinstance(inbox.get('address'), str) or not isinstance(inbox.get('token'), str):
                    raise ApiFailure(201)
                if not inbox['address'] or not inbox['token']:
                    raise ApiFailure(201)
                self._inbox = inbox
            return self._inbox['address']

    async def wait_for_otp(self, timeout_seconds=30):
        if isinstance(timeout_seconds, bool) or not isinstance(timeout_seconds, int) or not 1 <= timeout_seconds <= 45:
            raise ValueError('Timeout must be between 1 and 45 seconds')
        async with self._lock:
            route = self._route() + '/otp'
            deadline = time.monotonic() + timeout_seconds
            while time.monotonic() < deadline:
                remaining = deadline - time.monotonic()
                try:
                    result = await asyncio.to_thread(self._request, route, timeout=min(10, remaining))
                    otp = result.get('otp')
                    if isinstance(otp, str) and re.fullmatch(r'[0-9]{4,8}', otp):
                        return otp
                except ApiFailure as error:
                    if error.status != 408:
                        raise
                await asyncio.sleep(min(1, max(0, deadline - time.monotonic())))
            raise TimeoutError('No verification code before the deadline')

    async def close(self):
        async with self._lock:
            if self._inbox:
                try:
                    await asyncio.to_thread(self._request, self._route(), 'DELETE')
                except ApiFailure as error:
                    if error.status != 404:
                        raise
                self._inbox = None

    def register(self, tools):
        from browser_use import ActionResult

        async def result_of(call):
            try:
                return ActionResult(extracted_content=await call())
            except TimeoutError:
                return ActionResult(error='No verification code received before the deadline.')
            except Exception:
                # URLs and server exception bodies can contain private inbox data.
                return ActionResult(error='Inbox action failed. Check connectivity, expiry and parameters.')

        @tools.action(description='Create a temporary inbox for your authorized test. Returns its address; the access token stays private.')
        async def gecici_create_inbox() -> ActionResult:
            return await result_of(self.create)

        @tools.action(description='Read the 4–8 digit verification code from the inbox created in this run. Wait 1–45 seconds; no code is a failure.')
        async def gecici_wait_for_otp(timeout_seconds: int = 30) -> ActionResult:
            return await result_of(lambda: self.wait_for_otp(timeout_seconds))

        @tools.action(description='Delete the temporary inbox created in this run and its messages.')
        async def gecici_delete_inbox() -> ActionResult:
            async def delete():
                await self.close()
                return 'Temporary inbox deleted or already absent.'
            return await result_of(delete)

        return tools


async def qa_run():
    from browser_use import Tools
    inbox = InboxTools(qa=True)
    tools = inbox.register(Tools())
    result = {'browser_agent_tested': False, 'external_smtp_tested': False,
              'qa_excluded_from_usage': True, 'cleanup': False}
    try:
        created = await tools.registry.execute_action('gecici_create_inbox', {})
        if created.error or not inbox._inbox:
            raise RuntimeError('Create action failed')
        result['create_action_passed'] = True
        result['token_not_returned'] = inbox._inbox['token'] not in created.extracted_content
        # Test data, delivered directly to our own disposable inbox via the API.
        await asyncio.to_thread(inbox._request, '/simulate', 'POST', {
            'to': inbox._inbox['address'], 'from': 'fixture@example.invalid',
            'subject': 'Fictional browser-use contract test', 'text': 'Verification code: 572634'
        })
        otp = await tools.registry.execute_action('gecici_wait_for_otp', {'timeout_seconds': 15})
        result['otp_action_matched'] = not otp.error and otp.extracted_content == '572634'
        deleted = await tools.registry.execute_action('gecici_delete_inbox', {})
        result['delete_action_passed'] = not deleted.error and inbox._inbox is None
        if not all(result[key] for key in ('token_not_returned', 'otp_action_matched', 'delete_action_passed')):
            raise RuntimeError('Action assertion failed')
    finally:
        await inbox.close()
        result['cleanup'] = inbox._inbox is None
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--qa-run', action='store_true')
    if not parser.parse_args().qa_run:
        parser.error('Use --qa-run for one disposable live API simulation')
    os.environ['ANONYMIZED_TELEMETRY'] = 'false'
    os.environ['BROWSER_USE_CLOUD_SYNC'] = 'false'
    os.environ['BROWSER_USE_LOGGING_LEVEL'] = 'critical'
    try:
        print(json.dumps(asyncio.run(qa_run()), sort_keys=True))
    except Exception as error:
        print(json.dumps({'passed': False, 'error_type': type(error).__name__}))
        raise SystemExit(1)
