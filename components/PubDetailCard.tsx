"use client";

import { Pub } from "@/lib/pubs";

interface Props {
  pub: Pub;
  onClose: () => void;
}

export default function PubDetailCard({ pub, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-zinc-900 p-6 pb-10 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-zinc-600" />

        {/* Match badge */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{pub.name}</h2>
          {pub.showingMatch ? (
            <span className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Viser kampen
            </span>
          ) : (
            <span className="rounded-full bg-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-400">
              Ukjent
            </span>
          )}
        </div>

        {/* Match info */}
        <div className="mb-5 rounded-2xl bg-zinc-800 p-4 text-center">
          <div className="text-2xl mb-1">🇳🇴 vs 🇫🇷</div>
          <div className="text-sm font-semibold text-white">VM 2026 – 26. juni</div>
          <div className="text-xs text-zinc-400 mt-0.5">Fredag kl. 21:00</div>
        </div>

        {/* Details */}
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-lg">📍</span>
            <span className="text-zinc-300">{pub.address}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg">📞</span>
            <a
              href={`tel:${pub.phone.replace(/\s/g, "")}`}
              className="text-blue-400 underline-offset-2 hover:underline"
            >
              {pub.phone}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg">🌐</span>
            <a
              href={pub.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline-offset-2 hover:underline truncate"
            >
              {pub.website.replace("https://", "")}
            </a>
          </div>
          {pub.distance !== undefined && (
            <div className="flex items-center gap-3">
              <span className="text-lg">🚶</span>
              <span className="text-zinc-300">{pub.distance} meter unna</span>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-zinc-700 py-3.5 text-sm font-semibold text-white active:bg-zinc-600"
        >
          Lukk
        </button>
      </div>
    </div>
  );
}
