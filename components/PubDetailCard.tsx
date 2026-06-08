"use client";

import { Pub } from "@/lib/pubs";

interface Props {
  pub: Pub;
  onClose: () => void;
}

const FEATURE_ICONS: Record<string, string> = {
  "Lyd på": "🔊",
  "Storskjerm": "📺",
  "Flere skjermer": "🖥️",
  "Uteplass": "☀️",
  "Bar": "🍸",
};

export default function PubDetailCard({ pub, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative w-full max-w-lg rounded-t-3xl bg-zinc-950 shadow-2xl animate-slide-up overflow-hidden"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image area */}
        <div className={`relative h-44 bg-gradient-to-br ${pub.gradient} flex items-end`}>
          <div className="absolute inset-0 flex items-center justify-center opacity-20 text-8xl select-none">
            🍺
          </div>
          {/* Back button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-sm px-3 py-1.5 text-xs text-white"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Tilbake
          </button>
          {/* Match badge */}
          {pub.showingMatch && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-green-500/90 backdrop-blur-sm px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-bold text-white">Viser kampen</span>
            </div>
          )}
          {/* Gradient fade to card */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-950 to-transparent" />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 176px)" }}>
          <div className="px-5 pb-8">
            {/* Name + location */}
            <div className="mt-4 mb-1 flex items-start justify-between gap-2">
              <h2 className="text-xl font-bold text-white leading-tight">{pub.name}</h2>
              {pub.showingMatch && (
                <div className="shrink-0 flex items-center gap-1 rounded-full border border-green-500/40 px-2.5 py-1">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[11px] font-semibold text-green-400">Bekreftet</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-zinc-400 mb-5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {pub.neighborhood}
              {pub.distance !== undefined && (
                <span className="text-zinc-600 ml-1">
                  · {pub.distance >= 1000 ? `${(pub.distance / 1000).toFixed(1)} km` : `${pub.distance} m`} unna
                </span>
              )}
            </div>

            {/* Metric boxes */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="rounded-2xl bg-zinc-900 p-3 text-center">
                <div className="text-lg font-bold text-white">{pub.priceLevel}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">Prisnivå</div>
              </div>
              <div className="rounded-2xl bg-zinc-900 p-3 text-center">
                <div className="text-lg font-bold text-white">~{pub.capacity}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">Kapasitet</div>
              </div>
              <div className="rounded-2xl bg-zinc-900 p-3 text-center">
                <div className="text-lg font-bold text-white">{pub.screens}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">TV-skjermer</div>
              </div>
            </div>

            {/* Match info */}
            <div className="rounded-2xl bg-zinc-900 p-4 mb-6 flex items-center gap-3">
              <span className="text-3xl">⚽</span>
              <div>
                <div className="text-sm font-bold text-white">🇳🇴 Norge vs Frankrike 🇫🇷</div>
                <div className="text-xs text-zinc-400 mt-0.5">VM 2026 · Fredag 26. juni · kl. 21:00</div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-5">
              <h3 className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase mb-3">
                Fasiliteter og tilbud
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {pub.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2.5">
                    <span className="text-base">{FEATURE_ICONS[f] ?? "•"}</span>
                    <span className="text-sm text-zinc-300">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-2 mb-6 text-sm text-zinc-400">
              <svg className="w-4 h-4 shrink-0 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {pub.address}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={pub.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-bold text-zinc-950 active:opacity-80"
              >
                Besøk nettsiden
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a
                href={`https://maps.google.com/?q=${pub.lat},${pub.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-800 py-3.5 text-sm font-bold text-white active:opacity-80"
              >
                Vis på kart
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
