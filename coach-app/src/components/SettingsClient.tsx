'use client';

import { useState } from 'react';

export function SettingsClient() {
  const [saved, setSaved] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetKcal, setPresetKcal] = useState('');
  const [presetProtein, setPresetProtein] = useState('');
  const [presetEmoji, setPresetEmoji] = useState('🍽️');

  async function savePreset() {
    if (!presetName || !presetKcal || !presetProtein) return;
    await fetch('/api/meal-preset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: presetName,
        kcal: Number(presetKcal),
        protein_g: Number(presetProtein),
        emoji: presetEmoji,
        description: presetName,
      }),
    });
    setPresetName(''); setPresetKcal(''); setPresetProtein('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="px-4 space-y-6">
      {/* Connection status */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Tilkoblinger</p>
        <div className="space-y-2">
          {[
            { label: 'Garmin Connect', desc: 'Auto-synk via Interval.icu', status: 'configured' },
            { label: 'Interval.icu', desc: 'API-nøkkel konfigurert i .env', status: 'configured' },
            { label: 'Claude AI', desc: 'Vision + coaching aktivert', status: 'configured' },
            { label: 'Push-varslinger', desc: 'Aktiv når PWA er installert', status: 'configured' },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-zinc-500">{item.desc}</p>
              </div>
              <span className="text-xs text-emerald-400">✓ Aktiv</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add meal preset */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-3">Legg til hurtigmåltid</p>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              value={presetEmoji}
              onChange={(e) => setPresetEmoji(e.target.value)}
              className="w-14 bg-zinc-800 rounded-lg px-2 py-2.5 text-center text-xl border border-zinc-700"
              placeholder="🍽️"
            />
            <input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="flex-1 bg-zinc-800 rounded-lg px-3 py-2.5 text-sm border border-zinc-700 placeholder-zinc-600"
              placeholder="Navn (f.eks. Sardinlunsj)"
            />
          </div>
          <div className="flex gap-2">
            <input
              value={presetKcal}
              onChange={(e) => setPresetKcal(e.target.value)}
              className="flex-1 bg-zinc-800 rounded-lg px-3 py-2.5 text-sm border border-zinc-700 placeholder-zinc-600"
              placeholder="Kalorier (kcal)"
              type="number"
              inputMode="numeric"
            />
            <input
              value={presetProtein}
              onChange={(e) => setPresetProtein(e.target.value)}
              className="flex-1 bg-zinc-800 rounded-lg px-3 py-2.5 text-sm border border-zinc-700 placeholder-zinc-600"
              placeholder="Protein (g)"
              type="number"
              inputMode="numeric"
            />
          </div>
          <button
            onClick={savePreset}
            className="w-full bg-white text-black rounded-lg py-2.5 font-medium text-sm active:bg-zinc-200"
          >
            {saved ? 'Lagret ✓' : 'Lagre måltid'}
          </button>
        </div>
      </div>

      {/* How to install */}
      <div className="rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Installer på iPhone</p>
        <ol className="text-sm text-zinc-400 space-y-1">
          <li>1. Åpne denne siden i Safari</li>
          <li>2. Trykk Del-knappen (firkant med pil opp)</li>
          <li>3. Velg &quot;Legg til på hjemskjerm&quot;</li>
          <li>4. Trykk &quot;Legg til&quot;</li>
          <li>5. Godkjenn push-varslinger første gang</li>
        </ol>
      </div>
    </div>
  );
}
