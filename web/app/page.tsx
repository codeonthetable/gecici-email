import React from 'react';
import type { Metadata } from 'next';
import IndustrialConsole from '../components/IndustrialConsole';
import AiDeveloperHub from '../components/AiDeveloperHub';

export const metadata: Metadata = {
  title: 'gecici.email — Tek Kullanımlık E-posta & AI Ajan İstasyonu',
  description:
    'Zaman ayarlı, izsiz, mekanik e-posta konsolu, Model Context Protocol (MCP) ve otonom AI ajan altyapısı.',
};

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'gecici.email — AI Ajan & Geçici E-posta İstasyonu',
        url: 'https://gecici.email',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'All',
        description:
          'Zaman ayarlı, izsiz, mekanik e-posta konsolu, Model Context Protocol (MCP) ve otonom AI ajan altyapısı.',
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
        
        {/* Machine Status Ticker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121419] border-2 border-[#242733] rounded-2xl px-5 py-3 font-mono text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff66] animate-pulse" />
            <span className="font-bold text-white tracking-wide">
              BAĞIMSIZ DONANIM KONSOLU
            </span>
            <span className="text-[#475569] hidden sm:inline">//</span>
            <span className="text-[#00f0ff] hidden sm:inline">PORT 25 SMTP RELAY</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#cbd5e1] flex-wrap">
            <span className="text-[#ff9900] font-bold">60 DK TTL</span>
            <span>•</span>
            <span className="text-[#00ff66] font-bold">0-LOG BELLEK</span>
            <span>•</span>
            <span className="text-white">OTOMATİK OTP AYIKLAMA</span>
          </div>
        </div>

        {/* Main Hardware Machine Interface */}
        <main>
          <IndustrialConsole />
        </main>

        {/* AI Agents & Developer Hub Showcase */}
        <AiDeveloperHub />

      </div>
    </>
  );
}
