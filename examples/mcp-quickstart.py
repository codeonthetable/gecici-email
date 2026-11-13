#!/usr/bin/env python3
"""Create, read and delete one QA inbox through MCP. No account or package required.
Uses a fictional API-injected message; does NOT test SMTP or a model.
All calls are tagged qa-test and excluded from adoption metrics.
"""
import argparse, json, ssl
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

BASE = 'https://gecici.email'
TLS = ssl.create_default_context()
if not ssl.get_default_verify_paths().cafile and Path('/etc/ssl/cert.pem').exists():
    TLS.load_verify_locations('/etc/ssl/cert.pem')

def request(path, payload=None, method='POST', token=None):
    headers={'Content-Type':'application/json','X-Gecici-Client':'qa-test'}
    if token: headers['Authorization']='Bearer '+token
    data=json.dumps(payload).encode() if payload is not None else None
    try: response=urlopen(Request(BASE+path,data=data,headers=headers,method=method),timeout=15,context=TLS)
    except HTTPError as error: response=error
    with response: return response.status,json.loads(response.read() or b'{}')

def rpc(method, params=None):
    status,data=request('/mcp',{'jsonrpc':'2.0','id':1,'method':method,'params':params or {}})
    if status != 200 or 'error' in data: raise RuntimeError('MCP request failed')
    return data['result']

def call(name, args=None, expect_error=False):
    result=rpc('tools/call',{'name':name,'arguments':args or {}})
    if result.get('isError',False) != expect_error: raise RuntimeError('Unexpected tool outcome')
    if expect_error: return None
    text=json.loads(result['content'][0]['text'])
    if result.get('structuredContent') != text: raise RuntimeError('Structured response mismatch')
    return text

def run():
    inbox=None; deleted=False
    checks={'external_smtp_tested':False,'model_tested':False,'qa_excluded':True}
    try:
        rpc('initialize',{'protocolVersion':'2025-06-18','capabilities':{},'clientInfo':{'name':'gecici-qa','version':'1.0.0'}})
        status,_ = request('/mcp',{'jsonrpc':'2.0','method':'notifications/initialized'})
        if status != 202: raise RuntimeError('Initialization notification failed')
        tools=rpc('tools/list')['tools']
        if not any(t['name']=='gecici_delete_inbox' for t in tools): raise RuntimeError('Cleanup tool missing')
        inbox=call('gecici_create_inbox')['inbox']; checks['created']=True
        args={'address':inbox['address'],'token':inbox['token']}
        call('gecici_delete_inbox',dict(args,token='0'*24),expect_error=True)
        checks['wrong_token_denied']=True
        if call('gecici_get_inbox_messages',args)['count'] != 0: raise RuntimeError('Unexpected initial messages')
        status,_=request('/api/v1/simulate',{'to':inbox['address'],'subject':'Fictional QA fixture','text':'Fictional inbox lifecycle test.'},token=inbox['token'])
        if status != 201: raise RuntimeError('Fixture insertion failed')
        if call('gecici_get_inbox_messages',args)['count'] != 1: raise RuntimeError('Message read failed')
        checks['mcp_message_read']=True
        deleted=call('gecici_delete_inbox',args).get('deleted') is True
        if not deleted: raise RuntimeError('MCP cleanup failed')
        checks['mcp_cleanup']=True; checks['structured_content']=True
        call('gecici_get_inbox_messages',args,expect_error=True)
        checks['deleted_inbox_unreadable']=True
    finally:
        if inbox and not deleted:
            status,_=request('/api/v1/inbox/'+inbox['address'],method='DELETE',token=inbox['token'])
            if status != 200: raise RuntimeError('Fallback cleanup failed')
    return checks

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run',action='store_true')
    if not parser.parse_args().run: parser.error('Review this source, then pass --run')
    try: print(json.dumps(run(),sort_keys=True))
    except Exception as error:
        print(json.dumps({'passed':False,'error_type':type(error).__name__})); raise SystemExit(1)
