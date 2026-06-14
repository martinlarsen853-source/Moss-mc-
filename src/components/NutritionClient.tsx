'use client';

import { useState, useRef } from 'react';
import { BottomNav } from './BottomNav';

interface Props {
  logs: Array<{ id: string; desc: string; kcal: number; protein: number; time: string; source: string }>;
  presets: Array<{ id: string; name: string; emoji: string; kcal: number; protein: number; desc: string }>;
  todayKcal: number;
  todayProtein: number;
  proteinGoal: number;
  weekByDay: Record<string, { kcal: number; protein: number }>;
}

export function NutritionClient({ logs, presets, todayKcal, todayProtein, proteinGoal, weekByDay }: Props) {
  const [analyzing, setAnalyzing] = useState(false);
  const [foodResult, setFoodResult] = useState<{ description: string; kcal: number; protein_g: number; confidence: string } | null>(null);
  const [logging, setLogging] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const proteinPct = Math.min(100, Math.round((todayProtein / proteinGoal) * 100));

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    setFoodResult(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const res = await fetch('/api/food-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type, logImmediately: true }),
      });
      setFoodResult(await res.json());
      setAnalyzing(false);
    };
    reader.readAsDataURL(file);
  }

  async function logPreset(id: string) {
    setLogging(id);
    await fetch('/api/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ presetId: id }),
    });
    setLogging(null);
    window.location.reload();
  }

  const weekDays = Object.entries(weekByDay).sort(([a], [b]) => a.localeCompare(b)).slice(-7);
  const maxProtein = Math.max(...weekDays.map(([, v]) => v.protein), proteinGoal);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold">Ernæring</h1>
      </div>
      <div className="mx-4 mb-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex justify-between mb-3">
          <div>
            <p className="text-3xl font-bold">{todayProtein}g</p>
            <p className="text-xs text-zinc-500">protein</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{todayKcal}</p>
            <p className="text-xs text-zinc-500">kcal</p>
          </div>
        </div>
        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${todayProtein >= proteinGoal ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${proteinPct}%` }} />
        </div>
        <p className="text-xs text-zinc-500 mt-1.5">Mål: {proteinGoal}g protein · {proteinPct}% nådd</p>
      </div>
      <div className="mx-4 mb-3">
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
        <button onClick={() => fileRef.current?.click()} className="w-full rounded-2xl bg-zinc-900 border border-dashed border-zinc-700 p-4 flex items-center gap-3 active:bg-zinc-800">
          <span className="text-3xl">{analyzing ? '⏳' : '📷'}</span>
          <div className="text-left">
            <p className="font-medium">{analyzing ? 'Analyserer bilde...' : 'Ta bilde av mat'}</p>
            <p className="text-xs text-zinc-500">Claude regner ut kalorier og protein</p>
          </div>
        </button>
        {foodResult && (
          <div className="mt-2 p-3 rounded-xl border border-emerald-700/40 bg-emerald-900/20">
            <p className="font-medium text-emerald-300">{foodResult.description}</p>
            <p className="text-sm text-zinc-400 mt-1">{foodResult.kcal} kcal · {foodResult.protein_g}g protein</p>
            <p className="text-xs text-zinc-600 mt-0.5">Sikkerhet: {foodResult.confidence} · Logget ✓</p>
          </div>
        )}
      </div>
      <div className="px-4 mb-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Hurtiglogg</p>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((p) => (
            <button key={p.id} onClick={() => logPreset(p.id)} disabled={logging === p.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-left active:bg-zinc-800 disabled:opacity-50">
              <span className="text-2xl">{p.emoji}</span>
              <p className="text-sm font-medium mt-1">{p.name}</p>
              <p className="text-xs text-zinc-500">{p.kcal} kcal · {p.protein}g</p>
              {logging === p.id && <p className="text-xs text-emerald-400">Logget ✓</p>}
            </button>
          ))}
        </div>
      </div>
      {weekDays.length > 0 && (
        <div className="px-4 mb-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-3">Protein siste 7 dager</p>
          <div className="flex items-end gap-2 h-20">
            {weekDays.map(([date, val]) => {
              const pct = Math.round((val.protein / maxProtein) * 100);
              const isToday = date === new Date().toISOString().split('T')[0];
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-zinc-800 rounded-sm relative" style={{ height: `${pct}%`, minHeight: 4 }}>
                    <div className={`absolute bottom-0 left-0 right-0 rounded-sm ${val.protein >= proteinGoal ? 'bg-emerald-500' : isToday ? 'bg-amber-400' : 'bg-zinc-600'}`} style={{ height: '100%' }} />
                  </div>
                  <span className="text-[9px] text-zinc-600">{new Date(date).toLocaleDateString('no', { weekday: 'short' }).charAt(0)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {logs.length > 0 && (
        <div className="px-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">I dag</p>
          <div className="space-y-1">
            {logs.map((l) => (
              <div key={l.id} className="flex justify-between items-center py-2.5 border-b border-zinc-900">
                <div>
                  <p className="text-sm">{l.desc}</p>
                  <p className="text-xs text-zinc-600">{new Date(l.time).toLocaleTimeString('no', { hour: '2-digit', minute: '2-digit' })} · {l.source === 'photo' ? '📷' : l.source === 'preset' ? '⚡' : '✏️'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{l.kcal} kcal</p>
                  <p className="text-xs text-zinc-500">{l.protein}g</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <BottomNav active="nutrition" />
    </div>
  );
}
