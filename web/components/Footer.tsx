import React from 'react';
import Link from 'next/link';
import { Shield, Terminal, Bot, HelpCircle, Download, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#242733] bg-[#090a0d] mt-16 font-mono text-xs text-[#94a3b8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        
        {/* Top Section: Brand + Mission + Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Specs */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#ff4e00] flex items-center justify-center text-white font-bold text-sm shadow-[0_0_12px_rgba(255,78,0,0.4)]">
                @
              </span>
              <span className="font-bold text-white text-base tracking-tight">gecici.email</span>
            </Link>
            <p className="text-[11px] text-[#94a3b8] leading-relaxed">
              Zaman ayarlı, izsiz, mekanik e-posta konsolu ve otonom AI ajan altyapısı.
            </p>
            <div className="text-[10px] text-[#64748b] space-y-1">
              <div>PORT 25 INBOUND SMTP RELAY</div>
              <div>0-LOG // RAM DISKLESS CACHE</div>
              <div>60M TTL AUTO-PURGE</div>
            </div>
          </div>

          {/* Col 2: Core Platform Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white tracking-wider uppercase">
              PLATFORM & KONSOL
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-[#cbd5e1] hover:text-[#ff4e00] transition-colors flex items-center gap-1.5">
                  <span>✉️ Canlı E-posta Konsolu</span>
                </Link>
              </li>
              <li>
                <Link href="/ai-ajanlar" className="text-[#cbd5e1] hover:text-[#00ff66] transition-colors flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-[#00ff66]" />
                  <span>AI Ajanlar & MCP Hub</span>
                </Link>
              </li>
              <li>
                <Link href="/api-dokuman" className="text-[#cbd5e1] hover:text-[#00f0ff] transition-colors flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span>REST & SSE API Dokümanı</span>
                </Link>
              </li>
              <li>
                <a
                  href="/gecici-email-extension.zip"
                  className="text-[#cbd5e1] hover:text-[#ff9900] transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#ff9900]" />
                  <span>Chrome Uzantısı (.zip)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Services */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white tracking-wider uppercase">
              DOĞRULAMA SERVİSLERİ
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/discord-gecici-eposta" className="text-[#cbd5e1] hover:text-white transition-colors">
                  Discord Geçici E-posta
                </Link>
              </li>
              <li>
                <Link href="/steam-onay-kodu-epostasi" className="text-[#cbd5e1] hover:text-white transition-colors">
                  Steam Onay Kodu Postası
                </Link>
              </li>
              <li>
                <Link href="/twitter-icin-gecici-mail" className="text-[#cbd5e1] hover:text-white transition-colors">
                  Twitter / X Güvenlik Maili
                </Link>
              </li>
              <li>
                <Link href="/yazilim-test-epostasi" className="text-[#cbd5e1] hover:text-white transition-colors">
                  Yazılım QA Test E-postası
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Developer Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white tracking-wider uppercase">
              GÜVENLİK & TOPLULUK
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/sss" className="text-[#cbd5e1] hover:text-[#ff9900] transition-colors flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#ff9900]" />
                  <span>Sıkça Sorulan Sorular (SSS)</span>
                </Link>
              </li>
              <li>
                <Link href="/gizlilik-ve-guvenlik" className="text-[#cbd5e1] hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Gizlilik ve Sıfır Günlük</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/codeonthetable/gecici-email"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#cbd5e1] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Github className="w-3.5 h-3.5 text-[#94a3b8]" />
                  <span>GitHub: codeonthetable</span>
                </a>
              </li>
              <li>
                <a
                  href="https://smithery.ai/server/gecici-email"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#cbd5e1] hover:text-[#ff9900] transition-colors"
                >
                  Smithery MCP Registry ↗
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Hardware Cert */}
        <div className="pt-6 border-t border-[#1f222b] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#64748b] gap-3">
          <div>
            © {new Date().getFullYear()} gecici.email • Tamamen Açık Kaynak & Bağımsız Altyapı
          </div>
          <div className="flex items-center gap-4 text-[#94a3b8]">
            <Link href="/" className="hover:text-white hover:underline">
              Ana Sayfa
            </Link>
            <span>•</span>
            <Link href="/api-dokuman" className="hover:text-white hover:underline">
              API
            </Link>
            <span>•</span>
            <Link href="/sss" className="hover:text-white hover:underline">
              SSS
            </Link>
            <span>•</span>
            <Link href="/gizlilik-ve-guvenlik" className="hover:text-white hover:underline">
              Güvenlik
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
