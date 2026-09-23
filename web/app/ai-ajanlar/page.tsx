import React from 'react';
import type { Metadata } from 'next';
import { Bot, Terminal, Cpu, Sparkles, Key, CheckCircle, Code, ExternalLink, Shield } from 'lucide-react';
import AdPlaceholder from '../../components/AdPlaceholder';

export const metadata: Metadata = {
  title: 'AI Ajanları & MCP Sunucusu - gecici.email',
  description: 'Claude, OpenAI, Cursor, CrewAI ve LangChain otonom ajanları için tek kullanımlık geçici e-posta, akıllı OTP ve Magic Link yakalama altyapısı.',
};

export default function AiAgentsPage() {
  return (
    <div className="py-12 space-y-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <Bot className="w-4 h-4 text-indigo-500" />
          <span>Otonom AI Ajanları İçin E-posta Altyapısı</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Yapay Zeka Modelleri İçin <br />
          <span className="bg-gradient-to-r from-indigo-500 via-brand-500 to-purple-600 bg-clip-text text-transparent">
            Agent-Native Geçici E-posta
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          AutoGPT, Browser-Use, CrewAI veya Claude ajanlarınız artık web kayıtlarında ve OTP doğrulama adımlarında takılmıyor.
        </p>
      </div>

      <AdPlaceholder slotType="leaderboard" />

      {/* Problem & Solution Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-200/60 dark:border-red-900/40 p-6 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            ❌ Geleneksel Temp-Mail Servisleri
          </div>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>Cloudflare CAPTCHA ve bot engelleyiciler AI ajanlarını engeller.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>50+ KB karmaşık HTML döndürür, LLM token bütçenizi tüketir.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>OTP kodunu çıkarmak için ekstra model çağrısı yapmanız gerekir.</span>
            </li>
          </ul>
        </div>

        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 p-6 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            ✅ gecici.email AI-Native Çözümü
          </div>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Sıfır CAPTCHA engeli, doğrudan REST, SSE ve MCP sunucusu.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Akıllı motor 6 haneli OTP ve doğrulama linkini tek adımda ayıklar.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Python, TypeScript ve Claude Desktop için hazır kütüphaneler.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* MCP Setup Guide */}
      <section id="mcp-setup" className="bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Model Context Protocol (MCP) Kurulumu
            </h2>
            <p className="text-xs text-slate-500">Claude Desktop, Cursor ve Antigravity IDE ile uyumlu</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Claude Desktop veya Cursor <code className="text-brand-600 dark:text-brand-400 font-mono font-semibold">claude_desktop_config.json</code> dosyanıza aşağıdaki bloğu ekleyin:
        </p>

        <div className="bg-slate-950 rounded-2xl p-4 font-mono text-xs text-indigo-300 overflow-x-auto">
<pre>{`{
  "mcpServers": {
    "gecici-email": {
      "command": "npx",
      "args": ["-y", "gecici-email-mcp"]
    }
  }
}`}</pre>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Ajanınızın Kullanabileceği Araçlar:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <code className="font-bold text-indigo-600 dark:text-indigo-400">gecici_create_inbox()</code>
              <p className="text-slate-500 mt-1">Anında yeni geçici e-posta adresi açar.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <code className="font-bold text-emerald-600 dark:text-emerald-400">gecici_wait_for_otp()</code>
              <p className="text-slate-500 mt-1">Gelen maildeki 6 haneli kodu doğrudan yakalar.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <code className="font-bold text-brand-600 dark:text-brand-400">gecici_wait_for_magic_link()</code>
              <p className="text-slate-500 mt-1">Onay ve aktivasyon linkini döner.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <code className="font-bold text-purple-600 dark:text-purple-400">gecici_get_ai_summary()</code>
              <p className="text-slate-500 mt-1">LLM için tokenize edilmiş yüksek sinyalli özet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Python SDK Guide */}
      <section className="bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Python SDK ile Kullanım
            </h2>
            <p className="text-xs text-slate-500 font-mono">pip install gecici-email</p>
          </div>
        </div>

        <div className="bg-slate-950 rounded-2xl p-4 font-mono text-xs text-emerald-300 overflow-x-auto">
<pre>{`from gecici import GeciciEmail

# 1. Geçici e-posta kutusu oluştur
with GeciciEmail() as inbox:
    print(f"Oluşturulan Adres: {inbox.address}")
    
    # 2. AI Ajanınız web sitesinde kayıt butonuna bastıktan sonra:
    print("Doğrulama kodu bekleniyor...")
    otp_code = inbox.wait_for_otp(timeout=30)
    
    print(f"✅ Yakalanan Onay Kodu: {otp_code}")
    
    # 3. veya Aktivasyon linkini yakalayın:
    # link = inbox.wait_for_link()
`}</pre>
        </div>
      </section>

      {/* TypeScript SDK Guide */}
      <section className="bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              TypeScript / Node.js SDK
            </h2>
            <p className="text-xs text-slate-500 font-mono">npm install gecici-email</p>
          </div>
        </div>

        <div className="bg-slate-950 rounded-2xl p-4 font-mono text-xs text-blue-300 overflow-x-auto">
<pre>{`import { GeciciEmail } from 'gecici-email';

const client = new GeciciEmail();
const inbox = await client.createInbox();
console.log('E-posta:', inbox.address);

// Gelen OTP kodunu 30 saniye boyunca bekle
const otp = await client.waitForOtp(inbox.address, 30);
console.log('OTP Kodu:', otp);`}</pre>
        </div>
      </section>
    </div>
  );
}
