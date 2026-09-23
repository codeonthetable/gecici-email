'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface SmartSummary {
  otpCode: string | null;
  otpContext: string | null;
  verificationLink: string | null;
  actionText: string | null;
  actionType: string;
  cleanSummary: string;
  senderDomain: string;
  isAutomated: boolean;
}

interface EmailItem {
  id: string;
  messageId: string;
  from: { name: string; address: string };
  subject: string;
  date: string;
  text?: string;
  html?: string;
  smartSummary: SmartSummary;
  read: boolean;
  receivedAt: number;
}

export default function IndustrialConsole() {
  const [address, setAddress] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<string>('60:00');
  const [ledCount, setLedCount] = useState<number>(12);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedOtp, setCopiedOtp] = useState<boolean>(false);
  const [messages, setMessages] = useState<EmailItem[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailItem | null>(null);
  const [viewMode, setViewMode] = useState<'html' | 'raw'>('html');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);

  // Custom Prefix Modal
  const [showPrefixModal, setShowPrefixModal] = useState<boolean>(false);
  const [prefixInput, setPrefixInput] = useState<string>('');
  const [prefixError, setPrefixError] = useState<string>('');

  // QR Modal
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const eventSourceRef = useRef<EventSource | null>(null);

  // Mechanical Click & Chime Audio Synthesis
  const playMechanicalClick = (pitch: number = 800) => {
    if (!sfxEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  };

  const playIncomingTeletype = () => {
    if (!sfxEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Double mechanical relay click
      [0, 0.08, 0.16].forEach((t, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(300 + i * 200, ctx.currentTime + t);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.06);
      });
    } catch (e) {}
  };

  useEffect(() => {
    const saved = localStorage.getItem('gecici_address');
    if (saved) {
      fetchInboxMetadata(saved);
    } else {
      generateNewInbox();
    }
  }, []);

  // Countdown & LED Bar
  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const total = 60 * 60 * 1000;
      const diff = Math.max(0, expiresAt - Date.now());
      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        setLedCount(0);
      } else {
        const m = Math.floor(diff / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        const ratio = diff / total;
        setLedCount(Math.ceil(ratio * 12));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // SSE Stream
  useEffect(() => {
    if (!address) return;
    if (eventSourceRef.current) eventSourceRef.current.close();

    const es = new EventSource(`/api/v1/inbox/${encodeURIComponent(address)}/stream`);
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'new_email' && payload.email) {
          playIncomingTeletype();
          setMessages((prev) => [payload.email, ...prev]);
          if (!selectedMessage) setSelectedMessage(payload.email);
        }
      } catch (err) {}
    };

    return () => es.close();
  }, [address]);

  const generateNewInbox = async () => {
    setIsLoading(true);
    playMechanicalClick(950);
    try {
      const res = await fetch('/api/v1/inbox/generate', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.inbox) {
        setAddress(data.inbox.address);
        setExpiresAt(data.inbox.expiresAt);
        localStorage.setItem('gecici_address', data.inbox.address);
        setMessages([]);
        setSelectedMessage(null);
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInboxMetadata = async (addr: string) => {
    setIsLoading(true);
    try {
      const [metaRes, messagesRes] = await Promise.all([
        fetch(`/api/v1/inbox/${encodeURIComponent(addr)}`),
        fetch(`/api/v1/inbox/${encodeURIComponent(addr)}/messages`)
      ]);
      const meta = await metaRes.json();
      const msgs = await messagesRes.json();
      if (meta.success && meta.inbox) {
        setAddress(meta.inbox.address);
        setExpiresAt(meta.inbox.expiresAt);
        const list = msgs.messages || [];
        setMessages(list);
        if (list.length > 0) setSelectedMessage(list[0]);
      } else {
        generateNewInbox();
      }
    } catch (e) {
      generateNewInbox();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrefixError('');
    if (!prefixInput || prefixInput.length < 2) {
      setPrefixError('MIN 2 CHARACTERS REQUIRED');
      return;
    }
    playMechanicalClick(1100);
    try {
      const res = await fetch('/api/v1/inbox/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix: prefixInput }),
      });
      const data = await res.json();
      if (data.success && data.inbox) {
        setAddress(data.inbox.address);
        setExpiresAt(data.inbox.expiresAt);
        localStorage.setItem('gecici_address', data.inbox.address);
        setMessages([]);
        setSelectedMessage(null);
        setShowPrefixModal(false);
        setPrefixInput('');
      } else {
        setPrefixError(data.error || 'UNAVAILABLE');
      }
    } catch (err) {
      setPrefixError('CONNECTION ERROR');
    }
  };

  const handleCopy = () => {
    if (!address) return;
    playMechanicalClick(1200);
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyOtp = (otp: string) => {
    playMechanicalClick(1400);
    navigator.clipboard.writeText(otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleExtend = async () => {
    if (!address) return;
    playMechanicalClick(700);
    try {
      const res = await fetch(`/api/v1/inbox/${encodeURIComponent(address)}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: 30 }),
      });
      const data = await res.json();
      if (data.success && data.inbox) {
        setExpiresAt(data.inbox.expiresAt);
      }
    } catch (e) {}
  };

  const handleOpenQr = async () => {
    if (!address) return;
    playMechanicalClick(850);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gecici.email';
      const qr = await QRCode.toDataURL(`${origin}?inbox=${address}`, {
        width: 280,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' }
      });
      setQrCodeUrl(qr);
      setShowQrModal(true);
    } catch (e) {}
  };

  const handleSimulate = async () => {
    if (!address) return;
    playMechanicalClick(600);
    setIsSimulating(true);
    try {
      const rndCode = Math.floor(100000 + Math.random() * 900000);
      await fetch('/api/v1/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: address,
          from: 'auth@secureservice.com',
          fromName: 'SECURE AUTH GATEWAY',
          subject: `Giriş Doğrulama Kodu: ${rndCode}`,
          text: `İşleminizi tamamlamak için güvenlik kodu:\n\n${rndCode}\n\nGeçerlilik süresi 10 dakikadır.`,
        }),
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 select-none">
      {/* ============================================================ */}
      {/* 1. PHYSICAL CHASSIS CONSOLE (TEENAGE ENGINEERING / BRAUN AESTHETIC) */}
      {/* ============================================================ */}
      <div className="bg-[#121419] border-2 border-[#242733] rounded-3xl p-5 md:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
        {/* Chassis Top Machine Labels & Screws */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1f222b] text-[11px] font-mono text-[#6c7284]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2a2e3b] border border-[#3e4456] flex items-center justify-center">
              <span className="w-1 h-0.5 bg-[#4f566d] block transform rotate-45"></span>
            </span>
            <span className="font-bold tracking-widest text-[#949db2] font-display-tech">
              GECICI-01 // TACTILE DISPOSABLE INBOX
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Audio switch */}
            <button
              onClick={() => {
                setSfxEnabled(!sfxEnabled);
                playMechanicalClick(900);
              }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#2b303e] hover:border-[#40475c] text-[10px] text-[#8e97af] transition-colors"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${sfxEnabled ? 'bg-[#00f0ff] shadow-[0_0_5px_#00f0ff]' : 'bg-[#40475c]'}`}></span>
              <span>SFX: {sfxEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Live LED */}
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#00ff66]">
              <span className="led-diode text-[#00ff66] animate-pulse"></span>
              <span className="hidden sm:inline">RELAY ACTIVE</span>
            </div>

            <span className="w-2.5 h-2.5 rounded-full bg-[#2a2e3b] border border-[#3e4456] flex items-center justify-center">
              <span className="w-1 h-0.5 bg-[#4f566d] block transform rotate-45"></span>
            </span>
          </div>
        </div>

        {/* The LCD Display Module */}
        <div className="lcd-screen rounded-2xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Screen Content */}
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-3 text-[10px] font-mono tracking-widest text-[#ff9900]/70 uppercase">
                <span>[01] ASSIGNED_INBOX_CHANNEL</span>
                <span>//</span>
                <span>STATUS: READY</span>
              </div>

              <div className="text-xl sm:text-2xl md:text-3xl font-mono-code font-bold tracking-tight text-[#ff9900] truncate select-all drop-shadow-[0_0_8px_rgba(255,153,0,0.3)]">
                {isLoading ? 'GENERATING_KEYSTREAM...' : address}
              </div>
            </div>

            {/* Digital Timer & Analog LED Segment Graph */}
            <div className="flex items-center gap-4 shrink-0 bg-[#0c0e12] border border-[#1d2028] px-4 py-2.5 rounded-xl">
              <div>
                <div className="text-[9px] font-mono text-[#6c7284] uppercase tracking-wider">TTL EXPIRE</div>
                <div className="font-mono font-bold text-base text-[#e4e5e8]">{timeLeft}</div>
              </div>

              {/* 12-LED Meter */}
              <div className="flex items-center gap-1">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-1 h-5 rounded-xs transition-all ${
                      i < ledCount ? 'bg-[#ff4e00] shadow-[0_0_4px_#ff4e00]' : 'bg-[#1e222b]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Physical Mechanical Action Keypad */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
          {/* Main Primary Orange Button */}
          <button
            onClick={handleCopy}
            disabled={isLoading || !address}
            className={`sm:col-span-2 py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider hw-btn-accent cursor-pointer ${
              copied ? '!bg-[#00ff66] !border-[#00cc52] !text-black shadow-[0_0_15px_rgba(0,255,102,0.4)]' : ''
            }`}
          >
            {copied ? '✓ KOPYALANDI' : '⧉ ADRESİ KOPYALA'}
          </button>

          {/* Random Key */}
          <button
            onClick={generateNewInbox}
            disabled={isLoading}
            className="py-3 px-3 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider hw-btn cursor-pointer"
          >
            ↻ YENİLE
          </button>

          {/* Custom Name Key */}
          <button
            onClick={() => {
              playMechanicalClick(900);
              setShowPrefixModal(true);
            }}
            className="py-3 px-3 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider hw-btn cursor-pointer"
          >
            + ÖZEL İSİM
          </button>

          {/* QR Sync Key */}
          <button
            onClick={handleOpenQr}
            className="py-3 px-3 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider hw-btn cursor-pointer"
          >
            ☷ QR MOBİL
          </button>

          {/* Time Extend Key */}
          <button
            onClick={handleExtend}
            className="py-3 px-3 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider hw-btn cursor-pointer"
          >
            ▲ +30 DK
          </button>
        </div>

        {/* Simulator Diagnostic Strip */}
        <div className="mt-4 pt-3 border-t border-[#1a1c24] flex items-center justify-between text-[11px] font-mono text-[#5a6072]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]"></span>
            <span>PORT 25/2525 INBOUND SMTP LISTENER // SSE REALTIME</span>
          </div>

          <button
            onClick={handleSimulate}
            disabled={isSimulating || !address}
            className="text-[#ff9900] hover:text-[#ffb84d] font-bold tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>▶</span>
            <span>{isSimulating ? 'SİNYAL GÖNDERİLİYOR...' : 'TEST SİNYALİ GÖNDER (SIMULATE)'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. THE TELEPRINTER FEED (MASTER-DETAIL WORKBENCH) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Teleprinter Queue (5 cols) */}
        <div className="md:col-span-5 bg-[#121419] border-2 border-[#242733] rounded-3xl p-4 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#1f222b] text-[11px] font-mono text-[#8a92a6]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#e4e5e8]">GELEN İLETİ ŞERİDİ</span>
              <span className="px-1.5 py-0.5 rounded bg-[#1e222c] text-[#ff9900] font-bold">
                {messages.length}
              </span>
            </div>
            <span className="text-[10px] text-[#525768]">BUFFER: 100/100</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#525768] font-mono">
                <div className="w-12 h-12 border-2 border-dashed border-[#242733] rounded-2xl flex items-center justify-center mb-3 text-[#525768]">
                  ✉
                </div>
                <div className="text-xs font-bold text-[#7e879c] uppercase">SİNYAL BEKLENİYOR</div>
                <div className="text-[10px] text-[#525768] mt-1">Bu adrese gelen postalar teleprinter gibi basılacaktır.</div>
              </div>
            ) : (
              messages.map((m) => {
                const isSel = selectedMessage?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      playMechanicalClick(1000);
                      setSelectedMessage(m);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all border font-mono ${
                      isSel
                        ? 'bg-[#1b1e27] border-[#ff9900]/50 text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
                        : 'bg-[#15171e] border-[#222530] text-[#9ca3b8] hover:border-[#323647]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-[#e4e5e8] truncate max-w-[140px]">
                        {m.from.name || m.from.address}
                      </span>
                      <span className="text-[10px] text-[#6c7284]">
                        {new Date(m.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-xs text-[#d1d5db] font-semibold truncate mb-2">
                      {m.subject}
                    </div>

                    {/* Industrial Rubber Stamp for OTP */}
                    {m.smartSummary?.otpCode && (
                      <span className="inline-block px-2 py-0.5 rounded border border-[#ff4e00] bg-[#ff4e00]/10 text-[#ff7333] text-[10px] font-bold tracking-widest uppercase">
                        ★ OTP: {m.smartSummary.otpCode}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Teleprinter Printout Viewer (7 cols) */}
        <div className="md:col-span-7 bg-[#121419] border-2 border-[#242733] rounded-3xl p-5 flex flex-col h-[520px]">
          {selectedMessage ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Message Header Specs */}
              <div className="pb-3 border-b border-[#1f222b] shrink-0 font-mono">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h2 className="font-bold text-base text-[#ffffff] leading-tight">
                    {selectedMessage.subject}
                  </h2>
                  <span className="text-[10px] text-[#6c7284] shrink-0">
                    {new Date(selectedMessage.receivedAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#7e879c] mt-2">
                  <div className="truncate">
                    <span>GÖNDEREN: </span>
                    <span className="text-[#00f0ff] font-semibold">
                      {selectedMessage.from.name} &lt;{selectedMessage.from.address}&gt;
                    </span>
                  </div>

                  {/* Mode switch */}
                  <div className="flex items-center gap-1 bg-[#0b0c0e] border border-[#1f222b] p-0.5 rounded-lg text-[10px]">
                    <button
                      onClick={() => setViewMode('html')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        viewMode === 'html' ? 'bg-[#ff4e00] text-white font-bold' : 'text-[#6c7284]'
                      }`}
                    >
                      RENDER
                    </button>
                    <button
                      onClick={() => setViewMode('raw')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        viewMode === 'raw' ? 'bg-[#ff4e00] text-white font-bold' : 'text-[#6c7284]'
                      }`}
                    >
                      RAW
                    </button>
                  </div>
                </div>
              </div>

              {/* Rubber Stamp OTP / Action Strip */}
              {(selectedMessage.smartSummary?.otpCode || selectedMessage.smartSummary?.verificationLink) && (
                <div className="my-3 p-3.5 rounded-2xl bg-[#08090b] border border-[#2a2e3b] flex items-center justify-between gap-3 shrink-0">
                  {selectedMessage.smartSummary.otpCode && (
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[10px] text-[#7e879c] uppercase tracking-wider">DOĞRULAMA KODU:</span>
                      <span className="text-xl font-bold font-mono text-[#00ff66] tracking-widest drop-shadow-[0_0_6px_rgba(0,255,102,0.4)]">
                        {selectedMessage.smartSummary.otpCode}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {selectedMessage.smartSummary.otpCode && (
                      <button
                        onClick={() => handleCopyOtp(selectedMessage.smartSummary.otpCode!)}
                        className="px-3 py-1.5 rounded-xl bg-[#1e222c] hover:bg-[#2b303e] text-xs font-mono font-bold text-white border border-[#363d50] cursor-pointer"
                      >
                        {copiedOtp ? '✓ KOPYALANDI' : '⧉ KODU KOPYALA'}
                      </button>
                    )}

                    {selectedMessage.smartSummary.verificationLink && (
                      <a
                        href={selectedMessage.smartSummary.verificationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#00f0ff] hover:bg-[#33f3ff] text-black font-mono font-bold text-xs shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                      >
                        {selectedMessage.smartSummary.actionText || 'ONAY LİNKİNE GİT ↗'}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Sandboxed Body */}
              <div className="flex-1 bg-[#090a0d] rounded-2xl border border-[#1f222b] overflow-hidden relative">
                {viewMode === 'html' ? (
                  selectedMessage.html ? (
                    <iframe
                      title="Mail Render"
                      sandbox="allow-popups allow-popups-to-escape-sandbox"
                      srcDoc={selectedMessage.html}
                      className="w-full h-full border-0 bg-white rounded-2xl"
                    />
                  ) : (
                    <div className="p-4 text-xs font-mono text-[#d1d5db] whitespace-pre-wrap overflow-y-auto h-full">
                      {selectedMessage.text}
                    </div>
                  )
                ) : (
                  <pre className="p-4 text-[11px] font-mono text-[#8a92a6] whitespace-pre-wrap overflow-y-auto h-full">
                    {selectedMessage.text || selectedMessage.html}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 font-mono text-[#525768]">
              <div className="text-sm font-bold text-[#7e879c] mb-1">BOŞ TELEPRINTER</div>
              <div className="text-xs text-[#525768]">Görüntülemek için soldaki listeden bir sinyale tıklayın.</div>
            </div>
          )}
        </div>
      </div>

      {/* Prefix Modal */}
      {showPrefixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
          <div className="bg-[#121419] border-2 border-[#2b303e] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#e4e5e8] uppercase">
              <span>[+] ÖZEL KANAL KİMLİĞİ</span>
              <button onClick={() => setShowPrefixModal(false)} className="text-[#6c7284] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div className="flex items-center rounded-xl border border-[#2b303e] bg-[#090a0d] overflow-hidden">
                <input
                  type="text"
                  value={prefixInput}
                  onChange={(e) => setPrefixInput(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                  placeholder="kanal_adi"
                  className="flex-1 bg-transparent px-3 py-2.5 text-xs text-white font-mono outline-none"
                  autoFocus
                />
                <span className="px-3 py-2.5 text-xs text-[#6c7284] border-l border-[#2b303e]">@gecici.email</span>
              </div>
              {prefixError && <div className="text-[10px] text-[#ff4e00] font-bold">{prefixError}</div>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrefixModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#8a92a6] hover:bg-[#1f222b]"
                >
                  İPTAL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold hw-btn-accent cursor-pointer"
                >
                  KAYDET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
          <div className="bg-[#121419] border-2 border-[#2b303e] rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#e4e5e8]">
              <span>QR SENKRONİZASYON</span>
              <button onClick={() => setShowQrModal(false)} className="text-[#6c7284] hover:text-white">✕</button>
            </div>

            <div className="p-3 bg-white rounded-2xl inline-block mx-auto">
              {qrCodeUrl && <img src={qrCodeUrl} alt="QR" className="w-48 h-48" />}
            </div>

            <div className="text-[10px] text-[#7e879c] truncate">{address}</div>
          </div>
        </div>
      )}
    </div>
  );
}
