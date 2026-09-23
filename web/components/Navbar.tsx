'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Moon, Sun, Terminal, HelpCircle, Shield, Volume2, VolumeX } from 'lucide-react';

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }

    const sound = localStorage.getItem('gecici_sound');
    if (sound !== null) {
      setSoundEnabled(sound === 'true');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('gecici_sound', String(next));
  };

  return (
    <header className="hairline-border-b bg-[var(--bg-surface)] sticky top-0 z-40 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-mono font-bold text-xs shadow-sm">
            @
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
              gecici<span className="text-zinc-400 dark:text-zinc-500">.email</span>
            </span>
          </div>
        </Link>

        {/* Status indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SMTP & SSE AKTİF</span>
        </div>

        {/* Utility Controls */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Link
            href="/api-dokuman"
            className="px-2.5 py-1.5 rounded-md hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors flex items-center gap-1.5 font-mono text-[11px]"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>API & MCP</span>
          </Link>

          <Link
            href="/sss"
            className="px-2.5 py-1.5 rounded-md hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors flex items-center gap-1 font-medium text-[11px]"
          >
            <span>SSS</span>
          </Link>

          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Bildirim Sesini Kapat' : 'Bildirim Sesini Aç'}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
          </button>

          <button
            onClick={toggleDarkMode}
            title="Tema Değiştir"
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
