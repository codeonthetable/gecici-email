import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Code, Terminal, Zap, Key, ArrowLeft, Copy, CheckCircle } from 'lucide-react';
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
      desc: 'Yapay Zeka (AI) Uç Noktası: Yeni e-posta gelene kadar bekler ve 4-8 haneli OTP doğrulama kodunu döner.',
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
    <div className="py-8 md:py-12 space-y-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242733]">
        <div className="flex items-center gap-2 text-xs font-mono text-[#94a3b8]">
          <Link href="/" className="hover:text-white hover:underline flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5 text-[#ff4e00]" />
            <span>KONSOL</span>
          </Link>
          <span className="text-[#475569]">/</span>
          <span className="text-[#00f0ff] font-bold">API_DOKÜMANI</span>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-[#141720] hover:bg-[#1e2330] text-white text-xs font-mono font-bold border border-[#2e3342] hover:border-[#ff4e00] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#ff4e00]" />
          <span>E-POSTA KONSOLUNA DÖN</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 text-xs font-mono font-semibold">
          <Code className="w-4 h-4 text-cyan-400" />
          <span>REST & SSE API v1</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Geliştirici & Otomasyon API'si
        </h1>
        <p className="text-sm sm:text-base text-[#cbd5e1] max-w-2xl mx-auto leading-relaxed">
          API anahtarı gerekmeden, saniyede yüzlerce istek yapabileceğiniz hızlı, izsiz ve bağımsız uç noktalar.
        </p>
      </div>

      <AdPlaceholder slotType="leaderboard" />

      {/* Base URL Card */}
      <div className="bg-[#121419] text-white rounded-2xl p-6 border-2 border-[#242733] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#94a3b8] font-bold">API Base URL</span>
          <div className="text-base sm:text-lg text-[#00ff66] font-bold mt-0.5">
            https://gecici.email/api/v1
          </div>
        </div>
        <div className="text-xs bg-[#090a0d] px-3 py-1.5 rounded-lg text-[#cbd5e1] border border-[#1f222b]">
          Header: Content-Type: application/json
        </div>
      </div>

      {/* Endpoints List */}
      <div className="space-y-6">
        {endpoints.map((ep, idx) => (
          <div
            key={idx}
            className="bg-[#121419] rounded-2xl border-2 border-[#242733] p-6 space-y-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono border ${
                  ep.method === 'POST'
                    ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                    : ep.method === 'GET'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                    : 'bg-red-950/80 text-red-300 border-red-800'
                }`}
              >
                {ep.method}
              </span>
              <span className="font-mono font-bold text-sm sm:text-base text-white">
                {ep.path}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed font-medium">
              {ep.desc}
            </p>

            {ep.query && (
              <div className="text-xs font-mono text-[#ff9900] bg-[#090a0d] border border-[#1f222b] p-3 rounded-xl">
                Parametre: {ep.query}
              </div>
            )}

            {ep.body && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] font-mono">
                  İSTEK GÖVDESİ (REQUEST JSON):
                </span>
                <pre className="mt-1.5 bg-[#090a0d] text-[#cbd5e1] border border-[#1f222b] p-4 rounded-xl font-mono text-xs overflow-x-auto">
                  {ep.body}
                </pre>
              </div>
            )}

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] font-mono">
                ÖRNEK YANIT (RESPONSE):
              </span>
              <pre className="mt-1.5 bg-[#090a0d] text-[#00ff66] border border-[#1f222b] p-4 rounded-xl font-mono text-xs overflow-x-auto">
                {ep.response}
              </pre>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
