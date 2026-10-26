#!/usr/bin/env python3
"""Local, disposable email-verification QA fixture. Python 3.8+ stdlib.

Run --serve, then open http://127.0.0.1:8797. Uses the hosted API's
authenticated simulation transport, NOT SMTP. No real account is created.
Never deploy this teaching server publicly. No request or message logging.
"""
import argparse
import hashlib
import json
import secrets
import ssl
import time
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen

BASE = 'https://gecici.email'
TLS = ssl.create_default_context()
if not ssl.get_default_verify_paths().cafile and Path('/etc/ssl/cert.pem').exists():
    TLS.load_verify_locations('/etc/ssl/cert.pem')


def api(path, method='GET', payload=None, token=None):
    headers = {'Content-Type': 'application/json', 'X-Gecici-Client': 'qa-test'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    body = json.dumps(payload).encode() if payload is not None else None
    try:
        response = urlopen(Request(BASE + path, data=body, method=method,
                                   headers=headers), timeout=15, context=TLS)
    except HTTPError as error:
        response = error
    with response:
        return response.status, json.loads(response.read(1_000_000))


class Challenge:
    def __init__(self, code, clock=time.monotonic):
        self.digest = hashlib.sha256(code.encode()).digest()
        self.clock = clock
        self.deadline = clock() + 120
        self.used = False
        self.attempts = 0

    def verify(self, code):
        if self.used:
            return 409, 'already_used'
        if self.clock() >= self.deadline:
            return 410, 'expired'
        if self.attempts >= 5:
            return 429, 'attempt_limit'
        self.attempts += 1
        if not isinstance(code, str) or len(code) != 6 or not secrets.compare_digest(
                self.digest, hashlib.sha256(code.encode()).digest()):
            return 400, 'wrong_code'
        self.used = True
        return 200, 'verified'


class Run:
    def __init__(self, transport=api):
        self.transport = transport
        self.inbox = None
        self.challenge = None
        self.verified = False
        self.cleaned = False

    def start(self):
        status, data = self.transport('/api/v1/inbox/generate', 'POST', {})
        if status != 201 or not data.get('success'):
            raise RuntimeError('create_failed')
        self.inbox = data['inbox']
        code = str(100000 + secrets.randbelow(900000))
        self.challenge = Challenge(code)
        status, _ = self.transport('/api/v1/simulate', 'POST', {
            'to': self.inbox['address'], 'from': 'qa@example.invalid',
            'subject': 'Owned application QA', 'text': 'Verification code: ' + code
        }, self.inbox['token'])
        if status != 201:
            raise RuntimeError('simulation_failed')

    def route(self):
        return '/api/v1/inbox/' + quote(self.inbox['address'], safe='')

    def read(self):
        if not self.inbox or self.cleaned:
            return 409, {'state': 'no_active_inbox'}
        status, data = self.transport(self.route() + '/otp', token=self.inbox['token'])
        if status == 408:
            return 408, {'state': 'not_arrived'}
        code = data.get('otp')
        if status != 200 or not isinstance(code, str) or len(code) != 6 or not code.isascii() or not code.isdigit():
            return 502, {'state': 'read_failed'}
        # Only the synthetic test code reaches the browser; never the token/address.
        return 200, {'state': 'code_loaded', 'code': code}

    def verify(self, code):
        if not self.challenge:
            return 409, {'state': 'not_started'}
        status, state = self.challenge.verify(code)
        if state == 'verified':
            self.verified = True
        return status, {'state': state}

    def close(self):
        if self.inbox and not self.cleaned:
            status, _ = self.transport(self.route(), 'DELETE', token=self.inbox['token'])
            if status != 200:
                return False  # Retain credentials in memory so cleanup can retry.
            self.inbox = None
        self.cleaned = True
        return True


HTML = '''<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Owned application email verification · QA fixture</title>
<style>body{font:17px system-ui;background:#10141d;color:#eef1f6;max-width:760px;margin:5vh auto;padding:24px;line-height:1.6}button,input{font:inherit;padding:10px;margin:6px 5px 6px 0}button{cursor:pointer}input{max-width:160px}p{color:#c7d2df}#status{padding:18px;background:#1e293b;border-radius:12px}small{color:#92a8bd}</style>
<h1>Email verification test application</h1>
<p><strong>QA fixture · simulated mail transport</strong><br>A real browser form and server-side challenge, using one disposable hosted inbox. No SMTP or AI agent is exercised. No real account is created.</p>
<ol><li>Start: create a QA inbox and insert a synthetic verification message.</li><li>Try a wrong code, then read the test inbox into the masked field.</li><li>Submit the form, check verification, then delete the inbox.</li></ol>
<button id="start">1. Start QA session</button><button id="wrong">Try wrong code</button>
<button id="read">2. Read test inbox</button>
<form id="verify"><label for="code">Test code (masked)</label><br><input id="code" type="password" inputmode="numeric" autocomplete="off" maxlength="6"><button>3. Verify code</button></form>
<button id="cleanup">4. Delete test inbox</button><button id="replay">Check replay rejection</button>
<p id="status" role="status">Not started</p><small>The 120-second challenge allows five attempts. Quit with Ctrl+C; cleanup also runs on shutdown. This local server is a teaching fixture, not production authentication.</small>
<script>
const statusBox=document.querySelector('#status'), codeField=document.querySelector('#code');
let busy=false;
async function call(path,body={}){if(busy)return;busy=true;try{
 const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json','X-QA-Fixture':'1'},body:JSON.stringify(body)});
 const d=await r.json();if(d.code)codeField.value=d.code;
 if(d.state==='verified'||d.state==='cleaned')codeField.value='';
 statusBox.textContent=d.state+' (HTTP '+r.status+')';
}catch(e){statusBox.textContent='Connection failed; retry cleanup before closing';}finally{busy=false;}}
document.querySelector('#start').onclick=()=>call('/start');
document.querySelector('#wrong').onclick=()=>call('/verify',{code:'000000'});
document.querySelector('#read').onclick=()=>call('/read');
document.querySelector('#verify').onsubmit=e=>{e.preventDefault();call('/verify',{code:codeField.value});};
document.querySelector('#cleanup').onclick=()=>call('/cleanup');
document.querySelector('#replay').onclick=()=>call('/verify',{code:'000000'});
</script></html>'''


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def reply(self, status, body, cookie=None, html=False):
        data = body.encode() if html else json.dumps(body).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'text/html; charset=utf-8' if html else 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        if cookie:
            self.send_header('Set-Cookie', 'qa_session=' + cookie + '; HttpOnly; SameSite=Strict; Path=/')
        self.end_headers()
        self.wfile.write(data)

    def trusted_host(self):
        return self.headers.get('Host') == '127.0.0.1:' + str(self.server.server_port)

    def do_GET(self):
        if not self.trusted_host():
            return self.reply(403, {'state': 'host_denied'})
        if self.path != '/':
            return self.reply(404, {'state': 'not_found'})
        self.reply(200, HTML, html=True)

    def do_POST(self):
        origin = 'http://127.0.0.1:' + str(self.server.server_port)
        if not self.trusted_host() or self.headers.get('Origin') not in (None, origin) or self.headers.get('X-QA-Fixture') != '1':
            return self.reply(403, {'state': 'request_denied'})
        if self.headers.get('Content-Type') != 'application/json':
            return self.reply(415, {'state': 'json_required'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 4096:
                raise ValueError()
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict):
                raise ValueError()
            cookies = SimpleCookie(self.headers.get('Cookie', ''))
        except Exception:
            return self.reply(400, {'state': 'invalid_request'})
        sid = cookies['qa_session'].value if 'qa_session' in cookies else None
        run = self.server.runs.get(sid)
        try:
            if self.path == '/start':
                if run and not run.cleaned:
                    return self.reply(409, {'state': 'cleanup_previous_first'})
                if not run and len(self.server.runs) >= 10:
                    return self.reply(429, {'state': 'restart_fixture_to_reset_sessions'})
                sid = sid if run else secrets.token_urlsafe(32)
                run = Run(); self.server.runs[sid] = run
                try:
                    run.start()
                except Exception:
                    try:
                        run.close()
                    except Exception:
                        pass  # Cookie below permits retry; shutdown retries too.
                    return self.reply(502, {'state': 'start_failed_retry_cleanup'}, cookie=sid)
                return self.reply(201, {'state': 'message_simulated'}, cookie=sid)
            if not run:
                return self.reply(401, {'state': 'start_required'})
            if self.path == '/read':
                status, result = run.read()
            elif self.path == '/verify':
                status, result = run.verify(data.get('code'))
            elif self.path == '/cleanup':
                ok = run.close()
                status, result = (200 if ok else 502), {'state': 'cleaned' if ok else 'cleanup_failed_retry'}
            else:
                status, result = 404, {'state': 'not_found'}
            return self.reply(status, result)
        except Exception:
            # No exception text, response bodies or request URLs in output.
            return self.reply(502, {'state': 'operation_failed_retry_cleanup'})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--serve', action='store_true')
    parser.add_argument('--port', type=int, default=8797)
    args = parser.parse_args()
    if not args.serve:
        parser.error('Review source, then use --serve to enable one local QA application')
    server = HTTPServer(('127.0.0.1', args.port), Handler)
    server.runs = {}
    print('QA fixture ready at http://127.0.0.1:' + str(server.server_port), flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        results = []
        for run in server.runs.values():
            try:
                results.append(run.close())
            except Exception:
                results.append(False)
        server.server_close()
        print(json.dumps({'shutdown_cleanup': all(results), 'sessions': len(results)}))


if __name__ == '__main__':
    main()
