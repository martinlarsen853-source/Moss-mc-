'use client';

import { useState, useRef } from 'react';
import { BottomNav } from './BottomNav';
import { PushSubscriber } from './PushSubscriber';

interface Props {
  todayMetrics: {
    hrv: number | null;
    restingHr: number | null;
    sleepMin: number | null;
    bodyBattery: number | null;
    stress: number | null;
    ctl: number | null;
    atl: number | null;
    tsb: number | null;
  } | null;
  formStatus: 'god' | 'nøytral' | 'sliten';
  hrvTrend: number[];
  latestCoachMessage: string | null;
  latestCoachType: string | null;
  latestWorkout: {
    date: string;
    name: string;
    type: string;
    distanceKm: number | null;
    avgPace: string | null;
    avgHr: number | null;
    dragMedian: string | null;
    analysis: string | null;
  } | null;
  proteinToday: number;
  proteinGoal: number;
  kcalToday: number;
  nutritionLogs: Array<{ id: string; desc: string; kcal: number; protein: number; time: string }>;
  presets: Array<{ id: string; name: string; emoji: string; kcal: number; protein: number }>;
  currentWeek: number;
}

export function HomeClient(props: Props) {
  const { todayMetrics, formStatus, latestCoachMessage, latestCoachType, latestWorkout, proteinToday, proteinGoal, kcalToday, nutritionLogs, presets, currentWeek } = props;
  const [foodResult, setFoodResult] = useState<{ description: string; kcal: number; protein_g: number } | null>(null);
  const [logging, setLogging] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const formColors = {
    god: { bg: 'bg-emerald-900/30', border: 'border-emerald-500/50', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    nøytral: { bg: 'bg-zinc-900/50', border: 'border-zinc-700', text: 'text-zinc-400', dot: 'bg-zinc-400' },
    sliten: { bg: 'bg-red-900/30', border: 'border-red-500/50', text: 'text-red-400', dot: 'bg-red-400' },
  }[formStatus];

  async function logPreset(presetId: string, name: string) {
    setLogging(presetId);
    await fetch('/api/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ presetId }),
    });
    setLogging(null);
    window.location.reload();
  }

  async function handleFoodPhoto(e: React.ChangeEvent<HTMLInputElement>) {
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
      const data = await res.json();
      setFoodResult(data);
      setAnalyzing(false);
    };
    reader.readAsDataURL(file);
  }

  const proteinPct = Math.min(100, Math.round((proteinToday / proteinGoal) * 100));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      <PushSubscriber />
      <div className="px-4 pt-12 pb-4">
        <p className="text-zinc-500 text-sm">Uke {currentWeek} av 16</p>
        <h1 className="text-2xl font-bold mt-0.5">Coach</h1>
      </div>
      <div className={`mx-4 mb-3 rounded-2xl border p-4 ${formColors.bg} ${formColors.border}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${formColors.dot}`} />
          <span className={`text-sm font-medium ${formColors.text}`}>Form: {formStatus.charAt(0).toUpperCase() + formStatus.slice(1)}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'HRV', value: todayMetrics?.hrv ? `${todayMetrics.hrv}ms` : '—' },
            { label: 'Hvile', value: todayMetrics?.restingHr ? `${todayMetrics.restingHr}` : '—' },
            { label: 'Battery', value: todayMetrics?.bodyBattery ? `${todayMetrics.bodyBattery}%` : '—' },
            { label: 'Søvn', value: todayMetrics?.sleepMin ? `${Math.floor(todayMetrics.sleepMin / 60)}t${todayMetrics.sleepMin % 60}m` : '—' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-xs text-zinc-500">{item.label}</p>
              <p className="text-base font-semibold mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
        {todayMetrics?.ctl && (
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
            {[
              { label: 'CTL(fitness)', value: todayMetrics.ctl?.toFixed(0) },
              { label: 'ATL(fatigue)', value: todayMetrics.atl?.toFixed(0) },
              { label: 'TSB(form)', value: todayMetrics.tsb?.toFixed(0) },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-[10px] text-zinc-500">{item.label}</p>
                <p className="text-sm font-semibold mt-0.5">{item.value ?? '—'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      {latestCoachMessage && (
        <div className="mx-4 mb-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
            {latestCoachType === 'post-workout' ? 'Økt-analyse' : latestCoachType === 'pre-workout' ? 'Pre-økt' : 'Coach'}
          </p>
          <p className="text-sm leading-relaxed text-zinc-200 whitespace-pre-line line-clamp-4">{latestCoachMessage}</p>
        </div>
      )}
      {latestWorkout && (
        <div className="mx-4 mb-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Siste økt</p>
          <p className="font-semibold">{latestWorkout.name}</p>
          <div className="flex gap-4 mt-2 text-sm text-zinc-400">
            {latestWorkout.distanceKm && <span>{latestWorkout.distanceKm.toFixed(1)} km</span>}
            {latestWorkout.avgPace && <span>{latestWorkout.avgPace}</span>}
            {latestWorkout.avgHr && <span>{latestWorkout.avgHr} bpm</span>}
            {latestWorkout.dragMedian && <span className="text-amber-400">drag {latestWorkout.dragMedian}</span>}
          </div>
        </div>
      )}
      <div className="mx-4 mb-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Protein i dag</p>
          <p className="text-sm font-semibold">
            <span className={proteinToday >= proteinGoal * 0.9 ? 'text-emerald-400' : 'text-white'}>{proteinToday}g</span>
            <span className="text-zinc-500"> / {proteinGoal}g</span>
          </p>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${proteinToday >= proteinGoal ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${proteinPct}%` }} />
        </div>
        <p className="text-xs text-zinc-500 mt-1">{kcalToday} kcal logget i dag</p>
      </div>
      <div className="mx-4 mb-3">
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFoodPhoto} />
        <button onClick={() => fileRef.current?.click()} className="w-full rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-4 flex items-center gap-3 active:bg-zinc-800 transition-colors">
          <span className="text-2xl">{analyzing ? '⏳' : '📷'}</span>
          <div className="text-left">
            <p className="text-sm font-medium">{analyzing ? 'Analyserer...' : 'Logg mat med bilde'}</p>
            <p className="text-xs text-zinc-500">Claude identifiserer kalorier automatisk</p>
          </div>
        </button>
        {foodResult && (
          <div className="mt-2 rounded-xl border border-emerald-700/50 bg-emerald-900/20 p-3">
            <p className="text-sm font-medium text-emerald-300">{foodResult.description}</p>
            <p className="text-xs text-zinc-400 mt-1">{foodResult.kcal} kcal · {foodResult.protein_g}g protein</p>
            <p className="text-[10px] text-emerald-500 mt-1">Logget ✓</p>
          </div>
        )}
      </div>
      {presets.length > 0 && (
        <div className="px-4 mb-3">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Hurtiglogg</p>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button key={p.id} onClick={() => logPreset(p.id, p.name)} disabled={logging === p.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-left active:bg-zinc-800 disabled:opacity-60 transition-colors">
                <span className="text-xl">{p.emoji}</span>
                <p className="text-sm font-medium mt-1 line-clamp-1">{p.name}</p>
                <p className="text-xs text-zinc-500">{p.kcal} kcal · {p.protein}g</p>
                {logging === p.id && <p className="text-xs text-emerald-400 mt-1">Logget ✓</p>}
              </button>
            ))}
          </div>
        </div>
      )}
      {nutritionLogs.length > 0 && (
        <div className="px-4 mb-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Matlogg i dag</p>
          <div className="space-y-1">
            {nutritionLogs.map((log) => (
              <div key={log.id} className="flex justify-between items-center py-2 border-b border-zinc-900">
                <p className="text-sm text-zinc-300 truncate max-w-[60%]">{log.desc}</p>
                <p className="text-xs text-zinc-500">{log.kcal} kcal · {log.protein}g</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <BottomNav active="hjem" />
    </div>
  );
}
