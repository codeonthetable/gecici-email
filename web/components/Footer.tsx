import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="hairline-border-t bg-[var(--bg-surface)] py-8 text-xs text-zinc-500 font-mono">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">gecici.email</span>
          <span>•</span>
          <span>Sıfır Günlük (Zero-Log)</span>
          <span>•</span>
          <span>60m TTL Bellek</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/api-dokuman" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            API Uç Noktaları
          </Link>
          <Link href="/gizlilik-ve-guvenlik" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Gizlilik
          </Link>
          <Link href="/sss" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            SSS
          </Link>
        </div>
      </div>
    </footer>
  );
}
