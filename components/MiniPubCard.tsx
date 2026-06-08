"use client";

import { Pub } from "@/lib/pubs";

interface Props {
  pub: Pub;
  onExpand: () => void;
  onClose: () => void;
}

const FEATURE_ICONS: Record<string, string> = {
  "Lyd på": "🔊",
  "Storskjerm": "📺",
  "Flere skjermer": "🖥️",
  "Uteplass": "☀️",
  "Bar": "🍸",
};

export default function MiniPubCard({ pub, onExpand, onClose }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-3 pb-6">
      <div
        className="w-full max-w-lg rounded-2xl bg-zinc-900 shadow-2xl border border-zinc-800 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
        onClick={onExpand}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Color dot */}
          <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${pub.gradient} flex items-center justify-center text-2xl`}>
            🍺
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white truncate">{pub.name}</span>
              {pub.showingMatch && (
                <span className="shrink-0 flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-[11px] font-semibold text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-zinc-400">{pub.neighborhood}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-400">
                {pub.distance !== undefined
                  ? pub.distance >= 1000
                    ? `${(pub.distance / 1000).toFixed(1)} km`
                    : `${pub.distance} m`
                  : "–"}
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-400">{pub.screens} TV</span>
            </div>
          </div>

          {/* Chevron */}
          <div className="shrink-0 flex flex-col items-center gap-0.5">
            <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            <span className="text-[10px] text-zinc-600">Se mer</span>
          </div>
        </div>

        {/* Features strip */}
        {pub.features.length > 0 && (
          <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-none">
            {pub.features.map((f) => (
              <span key={f} className="shrink-0 flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-1 text-[11px] text-zinc-400">
                <span>{FEATURE_ICONS[f] ?? "•"}</span> {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
