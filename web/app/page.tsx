import React from 'react';
import Link from 'next/link';
import IndustrialConsole from '../components/IndustrialConsole';
import AiDeveloperHub from '../components/AiDeveloperHub';

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'gecici.email — AI Ajan & Geçici E-posta İstasyonu',
        url: 'https://gecici.email',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'All',
        description: 'Zaman ayarlı, izsiz, mekanik e-posta konsolu, Model Context Protocol (MCP) ve otonom AI ajan altyapısı.',
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
      },
      {
        '@type': 'WebSite',
        name: 'gecici.email',
        url: 'https://gecici.email',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://gecici.email/api/v1/inbox/{search_term_string}/messages',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="py-6 md:py-10 max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        {/* 1. Industrial Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242733] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#ff4e00] flex items-center justify-center text-white font-mono font-black text-sm shadow-[0_0_15px_rgba(255,78,0,0.4)]">
              @
            </div>
            <div>
              <h1 className="text-base font-bold font-mono tracking-tight text-white flex items-center gap-2">
                <span>gecici.email</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1e222c] text-[#ff9900] border border-[#2e3342]">
                  v1.1-AI
                </span>
              </h1>
              <p className="text-[11px] font-mono text-[#6c7284]">
                BAĞIMSIZ DİJİTAL SİNYAL & AI AJAN GEÇİCİ E-POSTA İSTASYONU
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#8a92a6]">
            <Link
              href="/ai-ajanlar"
              className="text-[#00ff66] hover:text-white font-bold flex items-center gap-1 transition-colors"
            >
              <span>AI_AGENTS</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30">
                v1.1
              </span>
            </Link>
            <span>/</span>
            <a
              href="https://github.com/codeonthetable/gecici-email"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white hover:underline transition-colors flex items-center gap-1"
            >
              <span>GITHUB</span>
            </a>
            <span>/</span>
            <Link href="/api-dokuman" className="hover:text-white hover:underline transition-colors">
              API_TERMINAL
            </Link>
            <span>/</span>
            <Link href="/sss" className="hover:text-white hover:underline transition-colors">
              MANUAL_FAQ
            </Link>
          </div>
        </div>

        {/* 2. Main Hardware Machine Interface */}
        <main>
          <IndustrialConsole />
        </main>

        {/* 3. AI Agents & Developer Hub Showcase */}
        <AiDeveloperHub />

        {/* 4. Footer Specs Bar */}
        <footer className="pt-4 border-t border-[#1f222b] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#525768] gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span>© {new Date().getFullYear()} GECICI.EMAIL // 0-LOG // RAM DISKLESS CACHE</span>
            <span>•</span>
            <a
              href="https://github.com/codeonthetable/gecici-email"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8a92a6] hover:text-white hover:underline"
            >
              GitHub (codeonthetable)
            </a>
            <span>•</span>
            <a
              href="https://smithery.ai/server/gecici-email"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff9900] hover:underline"
            >
              Smithery MCP
            </a>
          </div>
          <div className="text-[#6c7284]">PORT 25 SMTP RELAY // SSL STRICT // CORS OPEN</div>
        </footer>
      </div>
    </>
  );
}
