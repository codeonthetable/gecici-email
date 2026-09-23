'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Copy, Check, RefreshCw, Plus, QrCode, Play, Trash2, 
  Mail, ExternalLink, ShieldCheck, Clock, Key, X, ChevronRight, Inbox as InboxIcon, Code, FileText
} from 'lucide-react';
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
  from: {
    name: string;
    address: string;
  };
  subject: string;
  date: string;
  text?: string;
  html?: string;
  smartSummary: SmartSummary;
  read: boolean;
  receivedAt: number;
}

export default function InboxManager() {
  const [address, setAddress] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<string>('60:00');
  const [progressPercent, setProgressPercent] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedOtp, setCopiedOtp] = useState<boolean>(false);
  const [messages, setMessages] = useState<EmailItem[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailItem | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  
  // Modals
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customPrefix, setCustomPrefix] = useState<string>('');
  const [customError, setCustomError] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const eventSourceRef = useRef<EventSource | null>(null);

  const playNotificationSound = () => {
    if (localStorage.getItem('gecici_sound') === 'false') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      // Browser audio restriction handling
    }
  };

  useEffect(() => {
    const savedAddress = localStorage.getItem('gecici_address');
    if (savedAddress) {
      fetchInboxMetadata(savedAddress);
    } else {
      generateNewInbox();
    }
  }, []);

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const totalTtl = 60 * 60 * 1000;
      const diff = Math.max(0, expiresAt - Date.now());
      if (diff <= 0) {
        setTimeLeft('00:00');
        setProgressPercent(0);
      } else {
        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        setProgressPercent(Math.min(100, Math.max(0, (diff / totalTtl) * 100)));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    if (!address) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const sseUrl = `/api/v1/inbox/${encodeURIComponent(address)}/stream`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'new_email' && payload.email) {
          playNotificationSound();
          setMessages((prev) => [payload.email, ...prev]);
          if (!selectedMessage) {
            setSelectedMessage(payload.email);
          }
        }
      } catch (e) {
        // SSE parse safety
      }
    };

    return () => {
      es.close();
    };
  }, [address]);

  const generateNewInbox = async () => {
    setIsLoading(true);
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
      console.error(err);
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

      const metaData = await metaRes.json();
      const messagesData = await messagesRes.json();

      if (metaData.success && metaData.inbox) {
        setAddress(metaData.inbox.address);
        setExpiresAt(metaData.inbox.expiresAt);
        const msgList = messagesData.messages || [];
        setMessages(msgList);
        if (msgList.length > 0) {
          setSelectedMessage(msgList[0]);
        }
      } else {
        generateNewInbox();
      }
    } catch (err) {
      generateNewInbox();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomInbox = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');
    if (!customPrefix || customPrefix.length < 2) {
      setCustomError('En az 2 karakter giriniz.');
      return;
    }

    try {
      const res = await fetch('/api/v1/inbox/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix: customPrefix }),
      });
      const data = await res.json();
      if (data.success && data.inbox) {
        setAddress(data.inbox.address);
        setExpiresAt(data.inbox.expiresAt);
        localStorage.setItem('gecici_address', data.inbox.address);
        setMessages([]);
        setSelectedMessage(null);
        setShowCustomModal(false);
        setCustomPrefix('');
      } else {
        setCustomError(data.error || 'Bu adres alınamadı.');
      }
    } catch (err) {
      setCustomError('Bağlantı hatası.');
    }
  };

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleExtend = async () => {
    if (!address) return;
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefresh = async () => {
    if (!address) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/v1/inbox/${encodeURIComponent(address)}/messages`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenQr = async () => {
    if (!address) return;
    try {
      const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gecici.email';
      const qrUrl = await QRCode.toDataURL(`${currentUrl}?inbox=${address}`, {
        width: 260,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' }
      });
      setQrCodeDataUrl(qrUrl);
      setShowQrModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateEmail = async () => {
    if (!address) return;
    setIsSimulating(true);
    try {
      const randomCode = Math.floor(100000 + Math.random() * 900000);
      await fetch('/api/v1/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: address,
          from: 'security@github.com',
          fromName: 'GitHub Security',
          subject: `Your GitHub verification code is ${randomCode}`,
          text: `Merhaba,\n\nGiriş işleminizi tamamlamak için doğrulama kodunuz:\n${randomCode}\n\nBu kod 10 dakika geçerlidir.`,
        }),
      });
      handleRefresh();
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDeleteInbox = async () => {
    if (!address) return;
    if (confirm('Gelen kutusu ve tüm mesajlar silinsin mi?')) {
      await fetch(`/api/v1/inbox/${encodeURIComponent(address)}`, { method: 'DELETE' });
      generateNewInbox();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* 1. Precision Tool Console (Top Address Bar) */}
      <div className="bg-[var(--bg-surface)] hairline-border rounded-2xl shadow-sm p-4 sm:p-5 relative overflow-hidden">
        {/* Subtle top progress indicator line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-zinc-100 dark:bg-zinc-800">
          <div 
            className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Active Address Display */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-500 shrink-0 font-mono text-xs font-semibold">
              IN
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                <span>GEÇİCİ ADRES</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-zinc-600 dark:text-zinc-300">
                  <Clock className="w-3 h-3" />
                  {timeLeft}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-base sm:text-lg md:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 truncate select-all">
                  {isLoading ? 'Adres yükleniyor...' : address}
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              disabled={isLoading || !address}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold font-mono flex items-center gap-1.5 tactile-btn ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'KOPYALANDI' : 'KOPYALA'}</span>
            </button>

            <button
              onClick={generateNewInbox}
              disabled={isLoading}
              title="Yeni Rastgele Adres"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 tactile-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setShowCustomModal(true)}
              title="Özel İsim Seç"
              className="px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1 tactile-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Özel İsim</span>
            </button>

            <button
              onClick={handleOpenQr}
              title="QR Kod İle Telefondan Aç"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 tactile-btn"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleExtend}
              title="+30 Dakika Uzat"
              className="px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-mono tactile-btn"
            >
              +30m
            </button>

            <button
              onClick={handleSimulateEmail}
              disabled={isSimulating || !address}
              title="Test E-postası Gönder"
              className="px-2.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium flex items-center gap-1.5 tactile-btn"
            >
              <Play className="w-3 h-3 text-emerald-500 fill-emerald-500" />
              <span>{isSimulating ? 'Gönderiliyor...' : 'Test Maili'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Master-Detail Workstation Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left: Message Master List (5 cols) */}
        <div className="md:col-span-5 bg-[var(--bg-surface)] hairline-border rounded-2xl p-3 flex flex-col h-[560px]">
          {/* Subheader */}
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-zinc-100 dark:border-zinc-800/60 mb-2">
            <div className="flex items-center gap-2">
              <InboxIcon className="w-4 h-4 text-zinc-400" />
              <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">Gelen Kutusu</span>
              <span className="px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                {messages.length}
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                <div className="w-10 h-10 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center mb-3">
                  <Mail className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">E-posta bekleniyor</div>
                <div className="text-[11px] text-zinc-400 mt-1 max-w-[200px]">
                  Bu adrese gönderilen iletiler anında listelenecektir.
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <button
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${
                      isSelected
                        ? 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700'
                        : 'bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-850'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                        {msg.from.name || msg.from.address}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                        {new Date(msg.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-600 dark:text-zinc-300 font-medium truncate mb-1.5">
                      {msg.subject}
                    </div>

                    {/* Detected OTP pill */}
                    {msg.smartSummary?.otpCode && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                        <Key className="w-2.5 h-2.5" />
                        OTP: {msg.smartSummary.otpCode}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Detail Inspector (7 cols) */}
        <div className="md:col-span-7 bg-[var(--bg-surface)] hairline-border rounded-2xl p-5 flex flex-col h-[560px]">
          {selectedMessage ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Message Header */}
              <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100 leading-snug">
                    {selectedMessage.subject}
                  </h2>
                  <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                    {new Date(selectedMessage.receivedAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 mt-2">
                  <div className="truncate">
                    <span className="font-medium text-zinc-400">Kimden: </span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">
                      {selectedMessage.from.name} &lt;{selectedMessage.from.address}&gt;
                    </span>
                  </div>

                  {/* View mode toggle */}
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px] font-mono shrink-0">
                    <button
                      onClick={() => setViewMode('preview')}
                      className={`px-2 py-0.5 rounded ${viewMode === 'preview' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-xs' : 'text-zinc-500'}`}
                    >
                      Önizleme
                    </button>
                    <button
                      onClick={() => setViewMode('raw')}
                      className={`px-2 py-0.5 rounded ${viewMode === 'raw' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-xs' : 'text-zinc-500'}`}
                    >
                      Ham Metin
                    </button>
                  </div>
                </div>
              </div>

              {/* High-Contrast Code / Link Action Strip */}
              {(selectedMessage.smartSummary?.otpCode || selectedMessage.smartSummary?.verificationLink) && (
                <div className="my-3 p-3 rounded-xl bg-zinc-900 text-white dark:bg-zinc-950 dark:border dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0 shadow-sm">
                  {selectedMessage.smartSummary.otpCode && (
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] text-zinc-400 font-mono">DOĞRULAMA KODU:</span>
                      <span className="font-mono text-lg font-black tracking-widest text-emerald-400">
                        {selectedMessage.smartSummary.otpCode}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {selectedMessage.smartSummary.otpCode && (
                      <button
                        onClick={() => handleCopyOtp(selectedMessage.smartSummary.otpCode!)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-semibold flex items-center gap-1 text-zinc-200 tactile-btn"
                      >
                        {copiedOtp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedOtp ? 'KOPYALANDI' : 'KOPYALA'}</span>
                      </button>
                    )}

                    {selectedMessage.smartSummary.verificationLink && (
                      <a
                        href={selectedMessage.smartSummary.verificationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1 tactile-btn"
                      >
                        <span>{selectedMessage.smartSummary.actionText || 'Onayla'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Message Content Body */}
              <div className="flex-1 bg-[var(--bg-subtle)] rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden relative">
                {viewMode === 'preview' ? (
                  selectedMessage.html ? (
                    <iframe
                      title="E-posta Görüntüleyici"
                      sandbox="allow-popups allow-popups-to-escape-sandbox"
                      srcDoc={selectedMessage.html}
                      className="w-full h-full border-0 rounded-xl"
                    />
                  ) : (
                    <div className="p-4 text-xs font-sans text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap overflow-y-auto h-full">
                      {selectedMessage.text}
                    </div>
                  )
                ) : (
                  <pre className="p-4 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap overflow-y-auto h-full">
                    {selectedMessage.text || selectedMessage.html}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <Mail className="w-6 h-6 text-zinc-300 dark:text-zinc-700 mb-2" />
              <div className="text-xs font-medium text-zinc-500">Mesaj seçilmedi</div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Custom Prefix */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-[var(--bg-surface)] hairline-border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Özel E-posta Adresi</h3>
              <button onClick={() => setShowCustomModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomInbox} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1 uppercase">Kullanıcı Adı</label>
                <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-[var(--bg-subtle)] focus-within:border-zinc-900 dark:focus-within:border-zinc-100">
                  <input
                    type="text"
                    value={customPrefix}
                    onChange={(e) => setCustomPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                    placeholder="kullanici_adi"
                    className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 outline-none"
                    autoFocus
                  />
                  <span className="px-2.5 py-2 text-[11px] font-mono text-zinc-400 border-l border-zinc-200 dark:border-zinc-800">
                    @gecici.email
                  </span>
                </div>
                {customError && <p className="text-[11px] text-red-500 mt-1">{customError}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Kullan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: QR Code */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-[var(--bg-surface)] hairline-border rounded-2xl p-6 max-w-xs w-full shadow-2xl text-center space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Mobil Senkronizasyon
              </h3>
              <button onClick={() => setShowQrModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-white rounded-xl border border-zinc-200 inline-block mx-auto">
              {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="QR" className="w-44 h-44" />}
            </div>

            <div className="font-mono text-[11px] text-zinc-500 truncate">{address}</div>
          </div>
        </div>
      )}
    </div>
  );
}
