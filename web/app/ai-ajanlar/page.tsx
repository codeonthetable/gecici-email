import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Bot,
  Terminal,
  Cpu,
  Sparkles,
  Key,
  CheckCircle,
  Code,
  ExternalLink,
  Shield,
  Github,
  GitPullRequest,
  Boxes,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import AdPlaceholder from '../../components/AdPlaceholder';

export const metadata: Metadata = {
  title: 'AI Ajanları & Model Context Protocol (MCP) - gecici.email',
  description:
    'Claude Desktop, Cursor, browser-use, CrewAI ve LangChain otonom ajanları için resmi geçici e-posta, akıllı OTP ayıklama ve MCP altyapısı.',
  alternates: {
    canonical: 'https://gecici.email/ai-ajanlar',
  },
  openGraph: {
    title: 'AI Ajanları & Model Context Protocol (MCP) - gecici.email',
    description:
      'Claude Desktop, Cursor, browser-use ve CrewAI için tek kullanımlık e-posta ve anında OTP çıkarma motoru.',
    url: 'https://gecici.email/ai-ajanlar',
    siteName: 'gecici.email',
    type: 'website',
  },
};

export default function AiAgentsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'gecici.email AI Agent & MCP Infrastructure',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    url: 'https://gecici.email/ai-ajanlar',
    codeRepository: 'https://github.com/codeonthetable/gecici-email',
    author: {
      '@type': 'Person',
      name: 'Bahadir Davdav',
      url: 'https://github.com/codeonthetable',
    },
    sameAs: [
      'https://github.com/codeonthetable/gecici-email',
      'https://smithery.ai/server/gecici-email',
      'https://github.com/browser-use/browser-use/pull/5890',
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="py-8 md:py-12 space-y-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
        
        {/* Navigation Breadcrumb & Back to Home Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242733]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#94a3b8]">
            <Link href="/" className="hover:text-white hover:underline flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5 text-[#ff4e00]" />
              <span>KONSOL</span>
            </Link>
            <span className="text-[#475569]">/</span>
            <span className="text-[#00ff66] font-bold">AI_AGENTS_HUB</span>
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
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#00ff66] text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse"></span>
            <span>MODEL CONTEXT PROTOCOL & AI AGENT ECOSYSTEM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Yapay Zeka Modelleri İçin <br />
            <span className="bg-gradient-to-r from-[#ff4e00] via-[#ff9900] to-[#00f0ff] bg-clip-text text-transparent">
              Agent-Native Geçici E-posta
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#cbd5e1] max-w-2xl mx-auto leading-relaxed font-normal">
            Claude Desktop, Cursor, browser-use, CrewAI veya LangChain ajanlarınız web kayıtlarında,
            2FA güvenlik bariyerlerinde ve OTP doğrulama duvarlarında takılmadan görevlerini otonom tamamlasın.
          </p>
        </div>

        {/* Official Ecosystem & Verification Banner */}
        <section className="bg-[#121419] border-2 border-[#242733] rounded-3xl p-6 sm:p-8 font-mono space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f222b] text-[11px] text-[#94a3b8]">
            <span className="font-bold text-white">RESMİ DOĞRULANMIŞ ENTEGRASYONLAR</span>
            <span className="text-[#00ff66] font-bold">LIVE & VERIFIED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* GitHub */}
            <a
              href="https://github.com/codeonthetable/gecici-email"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 bg-[#08090b] rounded-2xl border border-[#242733] hover:border-[#ff4e00] transition-colors space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#ff4e00] font-bold">GITHUB // REPO</span>
                <ExternalLink className="w-3 h-3 text-[#94a3b8] group-hover:text-white" />
              </div>
              <div className="font-bold text-white text-xs">codeonthetable/gecici-email</div>
              <p className="text-[11px] text-[#cbd5e1]">Resmi açık kaynak depo</p>
            </a>

            {/* Smithery */}
            <a
              href="https://smithery.ai/server/gecici-email"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 bg-[#08090b] rounded-2xl border border-[#242733] hover:border-orange-500 transition-colors space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-orange-400 font-bold">SMITHERY // MCP</span>
                <ExternalLink className="w-3 h-3 text-[#94a3b8] group-hover:text-white" />
              </div>
              <div className="font-bold text-white text-xs">gecici-email (Smithery)</div>
              <p className="text-[11px] text-[#cbd5e1]">Doğrulanmış 5 araçlı sunucu</p>
            </a>

            {/* browser-use PR */}
            <a
              href="https://github.com/browser-use/browser-use/pull/5890"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 bg-[#08090b] rounded-2xl border border-[#242733] hover:border-emerald-500 transition-colors space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-bold">BROWSER-USE (116k★)</span>
                <ExternalLink className="w-3 h-3 text-[#94a3b8] group-hover:text-white" />
              </div>
              <div className="font-bold text-white text-xs">Resmi PR #5890</div>
              <p className="text-[11px] text-[#cbd5e1]">Otonom kayıt & OTP örneği</p>
            </a>

            {/* Live SSE Gateway */}
            <Link
              href="/mcp"
              className="p-3.5 bg-[#08090b] rounded-2xl border border-[#242733] hover:border-cyan-500 transition-colors space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-400 font-bold">STREAMABLE HTTP</span>
                <span className="text-[#94a3b8] group-hover:text-white">→</span>
              </div>
              <div className="font-bold text-white text-xs">https://gecici.email/mcp</div>
              <p className="text-[11px] text-[#cbd5e1]">Canlı SSE MCP gateway</p>
            </Link>
          </div>
        </section>

        <AdPlaceholder slotType="leaderboard" />

        {/* Problem vs Solution Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
          <div className="bg-[#140b0e] rounded-3xl border border-red-950/80 p-6 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
              <span>❌ Geleneksel Temp-Mail Servisleri</span>
            </div>
            <ul className="space-y-2 text-xs text-[#cbd5e1]">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Cloudflare CAPTCHA ve bot engelleyiciler otonom ajanları bloke eder.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>50+ KB dağınık HTML döndürür, LLM token bütçenizi gereksiz tüketir.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>OTP kodunu veya linki ayıklamak için karmaşık parser veya regex yazmanız gerekir.</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#0b1411] rounded-3xl border border-emerald-950/80 p-6 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <span>✅ gecici.email Agent-Native Mimarisi</span>
            </div>
            <ul className="space-y-2 text-xs text-[#cbd5e1]">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Sıfır CAPTCHA, doğrudan Model Context Protocol, REST ve canlı SSE akışı.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Akıllı ayrıştırıcı motoru 4–8 haneli OTP ve sihirli linkleri alt-saniyede çıkarır.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Python, TypeScript, Claude Desktop, Cursor ve browser-use için tam hazır.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 1. MCP Setup Guide */}
        <section id="mcp-setup" className="bg-[#121419] border-2 border-[#242733] rounded-3xl p-6 sm:p-8 space-y-6 font-mono">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-md">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Model Context Protocol (MCP) Kurulumu
              </h2>
              <p className="text-xs text-[#94a3b8]">Claude Desktop, Cursor IDE ve Antigravity ile tam uyumlu</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
            Claude Desktop veya Cursor <code className="text-[#00ff66] font-bold">claude_desktop_config.json</code> dosyanıza aşağıdaki konfigürasyonu ekleyin:
          </p>

          <div className="bg-[#08090b] rounded-2xl p-4 font-mono text-xs text-[#00ff66] overflow-x-auto border border-[#242733]">
<pre>{`{
  "mcpServers": {
    "gecici-email": {
      "command": "npx",
      "args": ["-y", "gecici-email-mcp"]
    }
  }
}`}</pre>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Ajanınızın Çağırabileceği Hazır MCP Araçları:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#08090b] border border-[#242733]">
                <code className="font-bold text-[#ff9900]">gecici_create_inbox()</code>
                <p className="text-[#cbd5e1] mt-1">Anında yeni geçici e-posta adresi açar.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#08090b] border border-[#242733]">
                <code className="font-bold text-[#00ff66]">gecici_wait_for_otp()</code>
                <p className="text-[#cbd5e1] mt-1">Gelen maildeki 4-8 haneli güvenlik kodunu döner.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#08090b] border border-[#242733]">
                <code className="font-bold text-[#00f0ff]">gecici_wait_for_magic_link()</code>
                <p className="text-[#cbd5e1] mt-1">Onay ve aktivasyon linkini tek seferde döner.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#08090b] border border-[#242733]">
                <code className="font-bold text-purple-400">gecici_get_ai_summary()</code>
                <p className="text-[#cbd5e1] mt-1">LLM için tokenize edilmiş yüksek sinyalli özet.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. browser-use Integration Guide */}
        <section id="browser-use" className="bg-[#121419] border-2 border-[#242733] rounded-3xl p-6 sm:p-8 space-y-6 font-mono">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                browser-use Otonom Gezgin Entegrasyonu
              </h2>
              <p className="text-xs text-[#94a3b8]">
                116.000+ Star Alan browser-use Kütüphanesi İçin Resmi Örnek
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
            Ajanınız web sitelerine otomatik kayıt olurken tek tıkla e-posta üretsin ve OTP onay kodunu bekleyip forma girsin:
          </p>

          <div className="bg-[#08090b] rounded-2xl p-4 font-mono text-xs text-emerald-300 overflow-x-auto border border-[#242733]">
<pre>{`import asyncio
from browser_use import Agent, Tools, ActionResult
from gecici import GeciciEmail

gecici = GeciciEmail()
tools = Tools()

@tools.registry.action('Create disposable email for signups')
def create_email() -> ActionResult:
    inbox = gecici.create_inbox()
    return ActionResult(extracted_content=inbox.address)

@tools.registry.action('Wait for OTP verification code')
def wait_otp(email_address: str) -> ActionResult:
    otp = gecici.wait_for_otp(address=email_address, timeout=30)
    return ActionResult(extracted_content=f"OTP: {otp}")

# Ajan görevi otonom olarak icra eder
agent = Agent(
    task="Create disposable email, signup on example.com, wait for OTP and enter it.",
    tools=tools
)
asyncio.run(agent.run())`}</pre>
          </div>
        </section>

        {/* 3. Python SDK (LangChain & CrewAI) */}
        <section id="python-sdk" className="bg-[#121419] border-2 border-[#242733] rounded-3xl p-6 sm:p-8 space-y-6 font-mono">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Python SDK v1.1.0 & LangChain / CrewAI
              </h2>
              <p className="text-xs text-[#94a3b8]">pip install gecici-email</p>
            </div>
          </div>

          <div className="bg-[#08090b] rounded-2xl p-4 font-mono text-xs text-indigo-300 overflow-x-auto border border-[#242733]">
<pre>{`from gecici import GeciciEmail
from gecici.integrations.langchain import GeciciEmailToolkit

# 1. Standart Python Context Manager
with GeciciEmail() as inbox:
    print("Geçici Adres:", inbox.address)
    otp = inbox.wait_for_otp(timeout=30)
    print("Gelen OTP:", otp)

# 2. LangChain Ajanlarına Tek Satırda Bağlama
toolkit = GeciciEmailToolkit()
tools = toolkit.get_tools() # [create_inbox, wait_for_otp, wait_for_link]`}</pre>
          </div>
        </section>

      </div>
    </>
  );
}
