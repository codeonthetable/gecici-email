'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Menu, X, Terminal, Bot, HelpCircle, Shield, Download, Github } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = pathname === '/';

  // Subpage title mapping for breadcrumbs
  const getPageTitle = (path: string) => {
    if (path.startsWith('/ai-ajanlar')) return 'AI Ajanlar & MCP';
    if (path.startsWith('/api-dokuman')) return 'API & Dokümantasyon';
    if (path.startsWith('/sss')) return 'Sıkça Sorulan Sorular (SSS)';
    if (path.startsWith('/gizlilik-ve-guvenlik')) return 'Gizlilik & Güvenlik';
    if (path === '/discord-gecici-eposta') return 'Discord Doğrulama';
    if (path === '/steam-onay-kodu-epostasi') return 'Steam Guard';
    if (path === '/twitter-icin-gecici-mail') return 'Twitter / X Güvenlik';
    if (path === '/yazilim-test-epostasi') return 'QA Test E-posta';
    if (path === '/instagram-dogrulama-kodu-alma') return 'Instagram Doğrulama';
    if (path === '/telegram-gecici-mail') return 'Telegram 2FA';
    if (path === '/netflix-deneme-epostasi') return 'Netflix Deneme';
    if (path === '/trendyol-indirim-gecici-posta') return 'Trendyol İndirim';
    return 'Sayfa';
  };

  const navLinks = [
    { href: '/', label: 'KONSOL', active: isHome },
    { href: '/ai-ajanlar', label: 'AI_AGENTS', badge: 'v1.1', active: pathname.startsWith('/ai-ajanlar') },
    { href: '/api-dokuman', label: 'API_TERMINAL', active: pathname.startsWith('/api-dokuman') },
    { href: '/sss', label: 'MANUAL_FAQ', active: pathname.startsWith('/sss') },
    { href: '/gizlilik-ve-guvenlik', label: 'SECURITY_SPEC', active: pathname.startsWith('/gizlilik-ve-guvenlik') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0e0f12]/95 backdrop-blur-md border-b border-[#242733]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Brand or Subpage Back Button */}
          <div className="flex items-center gap-3">
            {!isHome ? (
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ff4e00] hover:bg-[#ff621a] text-white font-mono font-bold text-xs shadow-[0_0_15px_rgba(255,78,0,0.4)] transition-all hover:scale-105 group"
                title="Ana Sayfadaki E-posta Konsoluna Dön"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>ANA SAYFAYA DÖN</span>
              </Link>
            ) : (
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-xl bg-[#ff4e00] flex items-center justify-center text-white font-mono font-black text-sm shadow-[0_0_15px_rgba(255,78,0,0.4)] group-hover:scale-105 transition-transform">
                  @
                </div>
                <div>
                  <div className="text-base font-bold font-mono tracking-tight text-white flex items-center gap-1.5">
                    <span>gecici.email</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#1e222c] text-[#ff9900] border border-[#2e3342] font-mono">
                      v1.1-AI
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-[#94a3b8] hidden sm:block">
                    BAĞIMSIZ DİJİTAL SİNYAL & AI AJAN KONSOLU
                  </p>
                </div>
              </Link>
            )}

            {/* Subpage Breadcrumb indicator on desktop */}
            {!isHome && (
              <div className="hidden md:flex items-center gap-2 text-xs font-mono pl-3 border-l border-[#242733]">
                <span className="text-[#64748b]">/</span>
                <span className="text-[#00ff66] font-bold">{getPageTitle(pathname)}</span>
              </div>
            )}
          </div>

          {/* Center / Right: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-mono">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  link.active
                    ? 'bg-[#1e222c] text-white font-bold border border-[#2e3342]'
                    : 'text-[#cbd5e1] hover:text-white hover:bg-[#151821]'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            <div className="h-4 w-[1px] bg-[#242733] mx-1.5" />

            {/* Extension Download Direct Link */}
            <a
              href="/gecici-email-extension.zip"
              className="px-2.5 py-1.5 rounded-lg bg-[#141720] hover:bg-[#1c202c] text-[#cbd5e1] hover:text-[#ff9900] border border-[#242733] transition-colors flex items-center gap-1.5 text-[11px]"
              title="Resmi Chrome Eklentisini İndir"
            >
              <Download className="w-3.5 h-3.5 text-[#ff9900]" />
              <span>UZANTI (.ZIP)</span>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/codeonthetable/gecici-email"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#151821] transition-colors"
              title="GitHub Deposu (codeonthetable)"
            >
              <Github className="w-4 h-4" />
            </a>
          </nav>

          {/* Right Status Indicator & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-[#00ff66] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
              <span>CANLI SİNYAL</span>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#141720] border border-[#242733] text-[#cbd5e1] hover:text-white hover:border-[#ff4e00] transition-colors"
              aria-label="Menüyü Aç/Kapat"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Slide-Down Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#242733] space-y-2 font-mono">
            {/* If on subpage, big prominent Home button */}
            {!isHome && (
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#ff4e00] text-white font-bold text-sm shadow-[0_0_15px_rgba(255,78,0,0.4)]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ANA SAYFAYA DÖN (KONSOL)</span>
              </Link>
            )}

            <div className="grid grid-cols-1 gap-1 text-xs pt-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl flex items-center justify-between ${
                  isHome ? 'bg-[#1e222c] text-white font-bold border border-[#2e3342]' : 'text-[#cbd5e1] hover:bg-[#141720]'
                }`}
              >
                <span>✉️ KONSOL (ANA SAYFA)</span>
                <span className="text-[#64748b]">/</span>
              </Link>

              <Link
                href="/ai-ajanlar"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl flex items-center justify-between ${
                  pathname.startsWith('/ai-ajanlar') ? 'bg-[#1e222c] text-[#00ff66] font-bold border border-[#2e3342]' : 'text-[#cbd5e1] hover:bg-[#141720]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#00ff66]" />
                  <span>AI AJANLAR & MCP</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30">
                  v1.1
                </span>
              </Link>

              <Link
                href="/api-dokuman"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl flex items-center justify-between ${
                  pathname.startsWith('/api-dokuman') ? 'bg-[#1e222c] text-[#00f0ff] font-bold border border-[#2e3342]' : 'text-[#cbd5e1] hover:bg-[#141720]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#00f0ff]" />
                  <span>REST & SSE API DOKÜMANI</span>
                </span>
                <span className="text-[#64748b]">/</span>
              </Link>

              <Link
                href="/sss"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl flex items-center justify-between ${
                  pathname.startsWith('/sss') ? 'bg-[#1e222c] text-[#ff9900] font-bold border border-[#2e3342]' : 'text-[#cbd5e1] hover:bg-[#141720]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#ff9900]" />
                  <span>SIKÇA SORULAN SORULAR (SSS)</span>
                </span>
                <span className="text-[#64748b]">/</span>
              </Link>

              <Link
                href="/gizlilik-ve-guvenlik"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl flex items-center justify-between ${
                  pathname.startsWith('/gizlilik-ve-guvenlik') ? 'bg-[#1e222c] text-emerald-400 font-bold border border-[#2e3342]' : 'text-[#cbd5e1] hover:bg-[#141720]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>GİZLİLİK & GÜVENLİK (0-LOG)</span>
                </span>
                <span className="text-[#64748b]">/</span>
              </Link>
            </div>

            {/* Quick Service Links in Mobile Drawer */}
            <div className="pt-2 border-t border-[#1f222b] space-y-1">
              <div className="px-4 text-[10px] text-[#94a3b8] uppercase tracking-wider font-bold">
                POPÜLER DOĞRULAMA SERVİSLERİ:
              </div>
              <div className="grid grid-cols-2 gap-1.5 px-2 text-[11px]">
                <Link
                  href="/discord-gecici-eposta"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1.5 rounded-lg bg-[#141720] text-[#cbd5e1] hover:text-white"
                >
                  Discord OTP
                </Link>
                <Link
                  href="/steam-onay-kodu-epostasi"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1.5 rounded-lg bg-[#141720] text-[#cbd5e1] hover:text-white"
                >
                  Steam Guard
                </Link>
                <Link
                  href="/twitter-icin-gecici-mail"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1.5 rounded-lg bg-[#141720] text-[#cbd5e1] hover:text-white"
                >
                  Twitter / X
                </Link>
                <Link
                  href="/yazilim-test-epostasi"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1.5 rounded-lg bg-[#141720] text-[#cbd5e1] hover:text-white"
                >
                  QA Yazılım Test
                </Link>
              </div>
            </div>

            {/* Mobile Footer Actions */}
            <div className="pt-3 border-t border-[#1f222b] flex items-center justify-between px-2 text-xs">
              <a
                href="/gecici-email-extension.zip"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1a1e28] text-[#ff9900] font-bold border border-[#2e3342]"
              >
                <Download className="w-4 h-4" />
                <span>CHROME EKLENTİSİ (.ZIP)</span>
              </a>
              <a
                href="https://github.com/codeonthetable/gecici-email"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141720] text-[#cbd5e1] border border-[#242733]"
              >
                <Github className="w-4 h-4" />
                <span>GITHUB</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
