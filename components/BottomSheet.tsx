"use client";

import { Pub } from "@/lib/pubs";

interface Props {
  pubs: Pub[];
  visible: boolean;
  onSelectPub: (pub: Pub) => void;
}

export default function BottomSheet({ pubs, visible, onSelectPub }: Props) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-500 ease-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto max-w-lg rounded-t-3xl bg-zinc-900/95 backdrop-blur-md px-4 pt-4 pb-8 shadow-2xl">
        {/* Handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-600" />

        {/* Header */}
        <div className="mb-4 flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-bold text-white">Nærmeste puber</h2>
            <p className="text-xs text-zinc-400 mt-0.5">🇳🇴 vs 🇫🇷 – VM 2026, 26. juni</p>
          </div>
          <div className="text-2xl">⚽</div>
        </div>

        {/* Pub list */}
        <div className="space-y-3">
          {pubs.map((pub) => (
            <button
              key={pub.id}
              onClick={() => onSelectPub(pub)}
              className="w-full rounded-2xl bg-zinc-800 p-4 text-left active:bg-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white truncate">{pub.name}</span>
                    {pub.showingMatch && (
                      <span className="shrink-0 flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 truncate">{pub.address}</p>
                </div>
                <div className="ml-3 shrink-0 text-right">
                  <div className="text-sm font-bold text-white">
                    {pub.distance !== undefined
                      ? pub.distance >= 1000
                        ? `${(pub.distance / 1000).toFixed(1)} km`
                        : `${pub.distance} m`
                      : "–"}
                  </div>
                  <div className="text-xs text-zinc-500">unna</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
