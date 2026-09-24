import React from 'react';
import Link from 'next/link';
import {
  Github,
  GitPullRequest,
  Bot,
  Terminal,
  Cpu,
  Boxes,
  ExternalLink,
  CheckCircle,
  Download,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function AiDeveloperHub() {
  const tools = [
    {
      title: 'Resmi GitHub Deposu',
      slug: 'codeonthetable/gecici-email',
      badge: 'Open Source (MIT)',
      badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      description: 'gecici.email platformunun tüm kaynak kodları, MCP sunucusu, Python/TS SDK’ları ve bağımsız Inbound SMTP dinleyicisi.',
      href: 'https://github.com/codeonthetable/gecici-email',
      isExternal: true,
      actionText: 'GitHub’da Görüntüle & Yıldızla',
      icon: <Github className="w-5 h-5 text-white" />,
      highlight: true,
    },
    {
      title: 'Smithery.ai Resmi MCP Kaydı',
      slug: 'smithery.ai/server/gecici-email',
      badge: 'Smithery Verified',
      badgeColor: 'bg-orange-950/60 text-orange-400 border-orange-800/80',
      description: 'Claude Desktop, Cursor ve Windsurf için tek tıkla kurulan resmi Model Context Protocol sunucusu (5 araç tam aktif).',
      href: 'https://smithery.ai/server/gecici-email',
      isExternal: true,
      actionText: 'Smithery’de İncele',
      icon: <Cpu className="w-5 h-5 text-orange-400" />,
      highlight: false,
    },
    {
      title: 'browser-use (116k★) Entegrasyonu',
      slug: 'PR #5890 — browser-use/browser-use',
      badge: 'PR #5890 Canlı',
      badgeColor: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80',
      description: 'Dünyanın en popüler otonom web gezginine (116k+ star) açılan resmi e-posta ve akıllı OTP doğrulama katkımız.',
      href: 'https://github.com/browser-use/browser-use/pull/5890',
      isExternal: true,
      actionText: 'Resmi PR #5890’ı Gör',
      icon: <GitPullRequest className="w-5 h-5 text-emerald-400" />,
      highlight: false,
    },
    {
      title: 'Canlı Streamable HTTP / SSE MCP Gateway',
      slug: 'https://gecici.email/mcp',
      badge: 'Canlı SSE Gateway',
      badgeColor: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/80',
      description: 'Kurulum veya npm paketi gerektirmeyen, doğrudan Claude veya Cursor’a yapıştırılabilen canlı HTTPS JSON-RPC 2.0 uç noktası.',
      href: '/mcp',
      isExternal: false,
      actionText: 'Canlı /mcp Uç Noktası',
      icon: <Bot className="w-5 h-5 text-cyan-400" />,
      highlight: false,
    },
    {
      title: 'Python SDK v1.1.0 (LangChain & CrewAI)',
      slug: 'pip install gecici-email',
      badge: 'v1.1.0 Ready',
      badgeColor: 'bg-indigo-950/60 text-indigo-400 border-indigo-800/80',
      description: 'LangChain Toolkit, CrewAI Tools ve browser-use için yerel Python kütüphanesi. Tek satırda OTP ve link yakalama.',
      href: '/ai-ajanlar',
      isExternal: false,
      actionText: 'Python SDK Rehberi',
      icon: <Terminal className="w-5 h-5 text-indigo-400" />,
      highlight: false,
    },
    {
      title: 'Resmi Chrome Uzantısı (Manifest V3)',
      slug: 'gecici-email-extension.zip',
      badge: 'Manifest V3',
      badgeColor: 'bg-purple-950/60 text-purple-400 border-purple-800/80',
      description: 'Tek tıkla rastgele adres alma, anında OTP panoya kopyalama, arka plan servis çalışanı ve masaüstü rozet bildirimleri.',
      href: '/gecici-email-extension.zip',
      isExternal: false,
      actionText: 'Uzantıyı İndir (.zip)',
      icon: <Download className="w-5 h-5 text-purple-400" />,
      highlight: false,
    },
  ];

  return (
    <section className="bg-[#121419] border-2 border-[#242733] rounded-3xl p-6 sm:p-8 font-mono space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1f222b] gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff4e00] to-[#ff8c00] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,78,0,0.3)]">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <span>YAPAY ZEKA & GELİŞTİRİCİ EKOSİSTEMİ</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30 font-normal">
                RESMİ ARAÇLAR
              </span>
            </h2>
            <p className="text-[11px] text-[#6c7284]">
              Claude, Cursor, browser-use, CrewAI, LangChain ve geliştiriciler için açık kaynaklı altyapı
            </p>
          </div>
        </div>

        <Link
          href="https://github.com/codeonthetable/gecici-email"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-[#ff4e00] hover:text-[#ff7836] font-semibold transition-colors"
        >
          <Github className="w-3.5 h-3.5" />
          <span>codeonthetable/gecici-email →</span>
        </Link>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
              t.highlight
                ? 'bg-[#181b22] border-[#ff4e00]/50 shadow-[0_0_25px_rgba(255,78,0,0.1)]'
                : 'bg-[#090a0d] border-[#1f222b] hover:border-[#2e3342]'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#14171f] border border-[#232734] flex items-center justify-center shrink-0">
                  {t.icon}
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded border font-medium ${t.badgeColor}`}
                >
                  {t.badge}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-white tracking-tight">{t.title}</h3>
                <code className="text-[10px] text-[#6c7284] block truncate mt-0.5">{t.slug}</code>
              </div>

              <p className="text-[11px] text-[#8a92a6] leading-relaxed line-clamp-3">
                {t.description}
              </p>
            </div>

            <div className="pt-2 border-t border-[#1a1d26]">
              {t.isExternal ? (
                <a
                  href={t.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl bg-[#14171f] hover:bg-[#1a1e28] text-xs font-semibold text-white border border-[#232734] hover:border-[#ff4e00]/60 transition-colors group"
                >
                  <span>{t.actionText}</span>
                  <ExternalLink className="w-3 h-3 text-[#6c7284] group-hover:text-[#ff4e00] transition-colors" />
                </a>
              ) : (
                <Link
                  href={t.href}
                  className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl bg-[#14171f] hover:bg-[#1a1e28] text-xs font-semibold text-white border border-[#232734] hover:border-[#ff4e00]/60 transition-colors group"
                >
                  <span>{t.actionText}</span>
                  <span className="text-[#6c7284] group-hover:text-[#ff4e00] transition-colors">→</span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Terminal Snippet Banner */}
      <div className="p-4 rounded-2xl bg-[#08090b] border border-[#1f222b] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#00ff66]" />
          <span className="text-[#8a92a6]">Claude Desktop / Cursor Hızlı Kurulum:</span>
        </div>
        <div className="flex items-center gap-2">
          <code className="px-3 py-1.5 rounded-lg bg-[#12141a] text-[#00ff66] border border-[#1f222b] font-mono text-[11px] select-all">
            npx -y gecici-email-mcp
          </code>
          <Link
            href="/ai-ajanlar"
            className="text-[11px] text-[#ff4e00] hover:underline font-semibold whitespace-nowrap"
          >
            Tüm Kılavuz →
          </Link>
        </div>
      </div>
    </section>
  );
}
