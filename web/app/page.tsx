import React from 'react';
import Link from 'next/link';
import IndustrialConsole from '../components/IndustrialConsole';

export default function HomePage() {
  return (
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
                v1.0-HW
              </span>
            </h1>
            <p className="text-[11px] font-mono text-[#6c7284]">
              BAĞIMSIZ DİJİTAL SİNYAL & GEÇİCİ E-POSTA İSTASYONU
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-[#8a92a6]">
          <Link href="/api-dokuman" className="hover:text-white hover:underline">
            API_TERMINAL
          </Link>
          <span>/</span>
          <Link href="/sss" className="hover:text-white hover:underline">
            MANUAL_FAQ
          </Link>
          <span>/</span>
          <Link href="/gizlilik-ve-guvenlik" className="hover:text-white hover:underline">
            SECURITY_SPEC
          </Link>
        </div>
      </div>

      {/* 2. Main Hardware Machine Interface */}
      <main>
        <IndustrialConsole />
      </main>

      {/* 3. Hardware Technical Specifications & Terminal Integration Box */}
      <section className="bg-[#121419] border-2 border-[#242733] rounded-3xl p-6 font-mono space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f222b] text-[11px] text-[#6c7284]">
          <span className="font-bold text-[#e4e5e8]">AI AJANLARI & GELİŞTİRİCİ ENTEGRASYONU // DIRECT INTERFACE</span>
          <span className="text-[#00f0ff]">REST / SSE / MCP READY</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#08090b] rounded-xl border border-[#1f222b] space-y-1">
            <div className="text-[10px] text-[#ff4e00] font-bold">PYTHON SDK // PIP</div>
            <code className="text-[#00ff66] select-all block">pip install gecici-email</code>
          </div>

          <div className="p-3 bg-[#08090b] rounded-xl border border-[#1f222b] space-y-1">
            <div className="text-[10px] text-[#00f0ff] font-bold">MODEL CONTEXT PROTOCOL (MCP)</div>
            <code className="text-[#e4e5e8] select-all block">npx -y gecici-email-mcp</code>
          </div>

          <div className="p-3 bg-[#08090b] rounded-xl border border-[#1f222b] space-y-1">
            <div className="text-[10px] text-[#ff9900] font-bold">ANINDA OTP UÇ NOKTASI</div>
            <code className="text-[#e4e5e8] select-all block truncate">GET /api/v1/inbox/:addr/otp</code>
          </div>
        </div>
      </section>

      {/* 4. Footer Specs Bar */}
      <footer className="pt-4 border-t border-[#1f222b] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#525768] gap-2">
        <div>© {new Date().getFullYear()} GECICI.EMAIL // 0-LOG // RAM MEMORY DISKLESS CACHE</div>
        <div className="text-[#6c7284]">PORT 25 SMTP RELAY // SSL STRICT // CORS OPEN</div>
      </footer>
    </div>
  );
}
