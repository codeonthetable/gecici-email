import importlib.util
import json
import threading
import unittest
from http.client import HTTPConnection
from http.server import HTTPServer
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'examples/verification_app.py'
if not SOURCE.exists():
    SOURCE = ROOT / 'web/public/examples/verification-app.py'
spec = importlib.util.spec_from_file_location('fixture', SOURCE)
fixture = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fixture)


class FakeTransport:
    def __init__(self):
        self.calls = []
        self.code = None
        self.delete_ok = True
        self.simulate_ok = True

    def __call__(self, path, method='GET', payload=None, token=None):
        self.calls.append((path, method))
        if path.endswith('/generate'):
            return 201, {'success': True, 'inbox': {'address': 'fictional@example.invalid', 'token': 'fixture-only'}}
        if path.endswith('/simulate'):
            self.code = payload['text'].split()[-1]
            return (201 if self.simulate_ok else 503), {}
        if path.endswith('/otp'):
            return 200, {'otp': self.code}
        if method == 'DELETE':
            return (200 if self.delete_ok else 503), {}
        raise AssertionError('Unexpected fake API operation')


class ChallengeTests(unittest.TestCase):
    def test_wrong_then_correct_then_replay(self):
        c = fixture.Challenge('123456')
        self.assertEqual(c.verify('000000'), (400, 'wrong_code'))
        self.assertEqual(c.verify('123456'), (200, 'verified'))
        self.assertEqual(c.verify('123456'), (409, 'already_used'))

    def test_expiry_boundary(self):
        now = [0]
        c = fixture.Challenge('123456', lambda: now[0])
        now[0] = 120
        self.assertEqual(c.verify('123456'), (410, 'expired'))

    def test_attempt_limit(self):
        c = fixture.Challenge('123456')
        for _ in range(5):
            self.assertEqual(c.verify('000000')[0], 400)
        self.assertEqual(c.verify('123456'), (429, 'attempt_limit'))

    def test_non_string_code_rejected(self):
        c = fixture.Challenge('123456')
        self.assertEqual(c.verify(['123456'])[0], 400)

    def test_read_does_not_verify(self):
        r = fixture.Run(FakeTransport()); r.start()
        self.assertEqual(r.read()[0], 200)
        self.assertFalse(r.verified)
        self.assertTrue(r.close())

    def test_failed_cleanup_retains_token_for_retry(self):
        transport = FakeTransport(); r = fixture.Run(transport); r.start()
        transport.delete_ok = False
        self.assertFalse(r.close()); self.assertIsNotNone(r.inbox)
        transport.delete_ok = True
        self.assertTrue(r.close()); self.assertIsNone(r.inbox)
        self.assertEqual(r.read()[0], 409)


class HTTPTests(unittest.TestCase):
    def setUp(self):
        self.transport = FakeTransport()
        original = fixture.Run
        self.mock = patch.object(fixture, 'Run', lambda: original(self.transport))
        self.mock.start()
        self.server = HTTPServer(('127.0.0.1', 0), fixture.Handler)
        self.server.runs = {}
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.cookie = None

    def tearDown(self):
        self.server.shutdown(); self.server.server_close(); self.thread.join()
        self.mock.stop()

    def request(self, route, payload=None, **extra):
        conn = HTTPConnection('127.0.0.1', self.server.server_port, timeout=3)
        headers = {'Content-Type': 'application/json', 'X-QA-Fixture': '1'}
        if self.cookie:
            headers['Cookie'] = self.cookie
        headers.update(extra)
        conn.request('POST', route, json.dumps(payload or {}), headers)
        res = conn.getresponse(); status = res.status
        cookie = res.getheader('Set-Cookie')
        if cookie:
            self.cookie = cookie.split(';')[0]
        body = json.loads(res.read()); conn.close()
        return status, body

    def test_form_lifecycle_and_no_token_in_reply(self):
        status, body = self.request('/start')
        self.assertEqual(status, 201)
        self.assertEqual(set(body), {'state'})
        self.assertEqual(self.request('/start')[0], 409)
        self.assertEqual(self.request('/verify', {'code': '000000'})[0], 400)
        status, data = self.request('/read'); self.assertEqual(status, 200)
        self.assertEqual(self.request('/verify', {'code': data['code']})[0], 200)
        self.assertEqual(self.request('/verify', {'code': data['code']})[0], 409)
        self.assertEqual(self.request('/cleanup'), (200, {'state': 'cleaned'}))

    def test_missing_session_rejected(self):
        self.assertEqual(self.request('/read')[0], 401)
        self.assertEqual(self.request('/verify', {'code': '000000'})[0], 401)

    def test_origin_and_host_checks(self):
        self.assertEqual(self.request('/start', Origin='https://example.invalid')[0], 403)
        self.assertEqual(self.request('/start', Host='example.invalid')[0], 403)
        self.assertEqual(self.transport.calls, [])

    def test_failed_start_still_allows_cleanup_retry(self):
        self.transport.simulate_ok = False; self.transport.delete_ok = False
        self.assertEqual(self.request('/start')[0], 502)
        self.assertIsNotNone(self.cookie)
        self.transport.delete_ok = True
        self.assertEqual(self.request('/cleanup')[0], 200)


if __name__ == '__main__':
    unittest.main()
