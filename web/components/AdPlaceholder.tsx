import React from 'react';

interface AdPlaceholderProps {
  slotType?: 'leaderboard' | 'rectangle' | 'banner';
  className?: string;
}

export default function AdPlaceholder({ slotType = 'leaderboard', className = '' }: AdPlaceholderProps) {
  // Fixed heights to prevent CLS (Cumulative Layout Shift)
  const heightClasses = {
    leaderboard: 'min-h-[90px] max-w-[728px]',
    rectangle: 'min-h-[250px] max-w-[300px]',
    banner: 'min-h-[100px] max-w-full',
  }[slotType];

  return (
    <div
      className={`mx-auto w-full flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 p-2 text-center transition-all overflow-hidden ${heightClasses} ${className}`}
      aria-label="Sponsorlu Alan / Reklam"
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-1">
        Sponsor / Reklam Alanı (Sıfır CLS)
      </span>
      <div className="text-[11px] text-slate-400 dark:text-slate-500">
        Google AdSense & Doğrudan Sponsorluk Entegrasyonuna Hazır
      </div>
    </div>
  );
}
