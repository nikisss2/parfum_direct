import React from 'react';

export const PageLoader: React.FC = () => {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 sm:py-28 animate-in fade-in duration-300">
      <div className="flex flex-col items-center text-center max-w-sm mx-auto">
        {/* Minimalist Luxury Spinner */}
        <div className="relative mb-6">
          <div className="w-12 h-12 rounded-full border border-zinc-200/80 bg-zinc-50/50 flex items-center justify-center shadow-xs">
            <div className="w-6 h-6 rounded-full border-2 border-zinc-200 border-t-zinc-950 animate-spin" />
          </div>
          {/* Subtle ambient pulse ring */}
          <div className="absolute inset-0 rounded-full bg-zinc-900/5 animate-ping pointer-events-none" />
        </div>

        {/* Brand Tagline */}
        <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-900">
          Maison Arôme
        </span>
        <span className="text-xs text-zinc-400 font-light tracking-wide mt-1 text-delicate">
          Селективная парфюмерия и распивы
        </span>

        {/* Delicate Shimmer Progress Bar */}
        <div className="w-36 h-0.5 bg-zinc-100 rounded-full overflow-hidden mt-5 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-900/60 to-transparent animate-shimmer" />
        </div>

        {/* Status Pill Badge */}
        <div className="mt-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-50 border border-zinc-200/70 text-[11px] font-light text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Подготовка витрины…</span>
        </div>
      </div>
    </div>
  );
};
