#!/usr/bin/env python3
"""Token-protected REST + MCP QA. Uses only a disposable inbox it creates.
This simulation checks the API and extraction, NOT external SMTP delivery.
Python 3 standard library only. No addresses, tokens or messages are printed.
"""
import argparse
import json
import ssl
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen

BASE = 'https://gecici.email'
TLS = ssl.create_default_context()
if not ssl.get_default_verify_paths().cafile and Path('/etc/ssl/cert.pem').exists():
    TLS.load_verify_locations('/etc/ssl/cert.pem')


def request(path, method='GET', payload=None, token=None):
    headers = {'Content-Type': 'application/json', 'X-Gecici-Client': 'qa-test'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    body = json.dumps(payload).encode() if payload is not None else None
    try:
        response = urlopen(Request(BASE + path, data=body, headers=headers, method=method), timeout=15, context=TLS)
    except HTTPError as error:
        response = error
    with response:
        return response.status, json.loads(response.read())


def run():
    inbox = None
    result = {'external_smtp_tested': False, 'cleanup': False}
    try:
        status, created = request('/api/v1/inbox/generate', 'POST', {})
        if status != 201 or not created.get('success'):
            raise RuntimeError('Inbox creation failed')
        inbox = created['inbox']
        route = '/api/v1/inbox/' + quote(inbox['address'], safe='')
        result['created'] = True
        status, _ = request(route + '/messages', token='0' * 24)
        if status != 403:
            raise RuntimeError('Wrong-token control failed')
        result['wrong_token_denied'] = True
        status, _ = request('/api/v1/simulate', 'POST', {
            'to': inbox['address'], 'from': 'qa@example.invalid',
            'subject': 'Fictional QA verification', 'text': 'Verification code: 572634'
        }, inbox['token'])
        if status != 201:
            raise RuntimeError('Own-inbox simulation failed')
        deadline = time.monotonic() + 15
        while True:
            status, data = request(route + '/otp', token=inbox['token'])
            if status == 200:
                if data.get('otp') != '572634':
                    raise RuntimeError('Unexpected extraction result')
                result['rest_otp_matched'] = True
                break
            if status != 408:
                raise RuntimeError('OTP endpoint failed with HTTP ' + str(status))
            if time.monotonic() >= deadline:
                raise TimeoutError('OTP deadline reached')
            time.sleep(2)
        status, data = request('/mcp', 'POST', {
            'jsonrpc': '2.0', 'id': 1, 'method': 'tools/call',
            'params': {'name': 'gecici_get_inbox_messages',
                       'arguments': {'address': inbox['address'], 'token': inbox['token']}}
        })
        rpc_result = data.get('result', {})
        if status != 200 or data.get('error') or rpc_result.get('isError'):
            raise RuntimeError('MCP tool failed')
        content = json.loads(rpc_result['content'][0]['text'])
        if content.get('count') != 1:
            raise RuntimeError('Unexpected message count')
        result['mcp_message_read'] = True
    finally:
        if inbox:
            status, _ = request('/api/v1/inbox/' + quote(inbox['address'], safe=''), 'DELETE', token=inbox['token'])
            result['cleanup'] = status == 200
            if not result['cleanup']:
                raise RuntimeError('Own-inbox cleanup failed')
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run', action='store_true', help='Create, test and delete one disposable inbox on gecici.email')
    if not parser.parse_args().run:
        parser.error('Review the source first, then use --run to start the disposable test')
    try:
        print(json.dumps(run(), sort_keys=True))
    except Exception as error:
        # Do not print request URLs or server response bodies containing private data.
        print(json.dumps({'passed': False, 'error_type': type(error).__name__}))
        raise SystemExit(1)
