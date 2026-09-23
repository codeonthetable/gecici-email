import React from 'react';
import type { Metadata } from 'next';
import { Code, Terminal, Zap, Key, Copy, CheckCircle } from 'lucide-react';
import AdPlaceholder from '../../components/AdPlaceholder';

export const metadata: Metadata = {
  title: 'Geliştirici REST & SSE API Dokümantasyonu - gecici.email',
  description: 'gecici.email açık REST ve Server-Sent Events API referansı. cURL, Python ve JavaScript örnekleri ile hızlı entegrasyon.',
};

export default function ApiDocsPage() {
  const endpoints = [
    {
      method: 'POST',
      path: '/api/v1/inbox/generate',
      desc: 'Yeni rastgele geçici e-posta kutusu oluşturur.',
      body: '{\n  "domain": "gecici.email"\n}',
      response: '{\n  "success": true,\n  "inbox": {\n    "address": "swift_9812@gecici.email",\n    "token": "a1b2c3d4...",\n    "expiresAt": 1757271920000,\n    "ttlSeconds": 3600\n  }\n}'
    },
    {
      method: 'POST',
      path: '/api/v1/inbox/custom',
      desc: 'Özel kullanıcı adlı geçici e-posta kutusu oluşturur.',
      body: '{\n  "prefix": "ahmet_test",\n  "domain": "gecici.email"\n}',
      response: '{\n  "success": true,\n  "inbox": {\n    "address": "ahmet_test@gecici.email",\n    "token": "...",\n    "expiresAt": 1757271920000,\n    "ttlSeconds": 3600\n  }\n}'
    },
    {
      method: 'GET',
      path: '/api/v1/inbox/:address/otp',
      desc: 'Yapay Zeka (AI) Uç Noktası: Yeni e-posta gelene kadar bekler ve 6 haneli OTP doğrulama kodunu döner.',
      query: '?timeout=30000 (milisaniye cinsinden maksimum bekleme süresi)',
      response: '{\n  "success": true,\n  "otp": "893120",\n  "actionType": "verification",\n  "sender": {\n    "name": "GitHub Security",\n    "address": "noreply@github.com"\n  },\n  "subject": "Your GitHub verification code: 893120"\n}'
    },
    {
      method: 'GET',
      path: '/api/v1/inbox/:address/links',
      desc: 'Yapay Zeka (AI) Uç Noktası: Aktivasyon / Sihirli giriş linkini doğrudan ayıklar.',
      query: '?timeout=30000',
      response: '{\n  "success": true,\n  "verificationLink": "https://example.com/verify?token=xyz999",\n  "actionText": "Hesabımı Doğrula",\n  "actionType": "verification"\n}'
    },
    {
      method: 'GET',
      path: '/api/v1/inbox/:address/messages',
      desc: 'Gelen kutusundaki tüm mesajları listeler.',
      response: '{\n  "success": true,\n  "address": "swift_9812@gecici.email",\n  "count": 1,\n  "messages": [\n    {\n      "id": "abc123xyz",\n      "from": { "name": "Google", "address": "no-reply@google.com" },\n      "subject": "Güvenlik Uyarısı",\n      "smartSummary": { "otpCode": "449120", "actionType": "security_alert" },\n      "receivedAt": 1757271920000\n    }\n  ]\n}'
    },
    {
      method: 'GET',
      path: '/api/v1/inbox/:address/stream',
      desc: 'Server-Sent Events (SSE) Gerçek Zamanlı Akış. Yeni mail düştüğü anda milisaniyelik event iletir.',
      response: 'event: new_email\ndata: {"type":"new_email","email":{...},"timestamp":1757271920000}'
    },
    {
      method: 'DELETE',
      path: '/api/v1/inbox/:address',
      desc: 'Gelen kutusunu ve tüm e-postaları sunucu belleğinden anında kalıcı olarak siler.',
      response: '{\n  "success": true,\n  "message": "Gelen kutusu ve tüm e-postalar silindi"\n}'
    }
  ];

  return (
    <div className="py-12 space-y-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <Code className="w-4 h-4 text-emerald-500" />
          <span>REST & SSE API v1</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Geliştirici & Otomasyon API'si
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          API anahtarı gerekmeden, saniyede yüzlerce istek yapabileceğiniz hızlı ve bağımsız uç noktalar.
        </p>
      </div>

      <AdPlaceholder slotType="leaderboard" />

      {/* Base URL Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">API Base URL</span>
          <div className="font-mono text-base sm:text-lg text-emerald-400 font-bold mt-0.5">
            https://gecici.email/api/v1
          </div>
        </div>
        <div className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 font-mono">
          Header: Content-Type: application/json
        </div>
      </div>

      {/* Endpoints List */}
      <div className="space-y-6">
        {endpoints.map((ep, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono ${
                  ep.method === 'POST'
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : ep.method === 'GET'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                }`}
              >
                {ep.method}
              </span>
              <span className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {ep.path}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">{ep.desc}</p>

            {ep.query && (
              <div className="text-xs font-mono text-slate-500 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg">
                Query Params: {ep.query}
              </div>
            )}

            {ep.body && (
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Request Body (JSON):
                </span>
                <pre className="mt-1 bg-slate-950 text-slate-300 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                  {ep.body}
                </pre>
              </div>
            )}

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Response Örneği:
              </span>
              <pre className="mt-1 bg-slate-950 text-emerald-400 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                {ep.response}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
