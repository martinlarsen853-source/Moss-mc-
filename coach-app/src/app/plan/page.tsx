import { BottomNav } from '@/components/BottomNav';

export const dynamic = 'force-dynamic';

const PLAN = [
  { week: 1, dates: '8.–14. jun', km: 30, key: 'I gang etter 3 ukers stopp', light: false },
  { week: 2, dates: '15.–21. jun', km: 40, key: 'Full Askim-disiplin', light: false },
  { week: 3, dates: '22.–28. jun', km: 50, key: 'Bakkesprint mandag fra nå (4–6)', light: false },
  { week: 4, dates: '29. jun–5. jul', km: 33, key: 'LETT – Hyrox teknisk, ikke race', light: true },
  { week: 5, dates: '6.–12. jul', km: 50, key: 'Langturer kupert herfra', light: false },
  { week: 6, dates: '13.–19. jul', km: 50, key: 'Duttebu-økt 1: 5–6×2–3 min motbakke 165–172', light: false },
  { week: 7, dates: '20.–26. jul', km: 52, key: 'Største uka – følg røde flagg', light: false },
  { week: 8, dates: '27. jul–2. aug', km: 34, key: 'LETT', light: true },
  { week: 9, dates: '3.–9. aug', km: 50, key: 'Duttebu-økt 2: langtur PÅ Skiptvet-løypa → terskeldom', light: false },
  { week: 10, dates: '10.–16. aug', km: 40, key: '🏅 DUTTEBULØPET (generalprøve)', light: false },
  { week: 11, dates: '17.–23. aug', km: 52, key: 'Vekt fryses. Lør: bane 5×1000 i målfart', light: false },
  { week: 12, dates: '24.–30. aug', km: 52, key: 'Toppuke. Siste race-lørdag', light: false },
  { week: 13, dates: '31. aug–6. sep', km: 50, key: 'Lør: bane 4×1500 i målfart', light: false },
  { week: 14, dates: '7.–13. sep', km: 42, key: '−20%. Tir 4–5×3 min i 10K-fart', light: false },
  { week: 15, dates: '14.–20. sep', km: 28, key: 'LØPSUKA. SØN 20.: 🏆 10 KM', light: false },
  { week: 16, dates: '21.–27. sep', km: 15, key: 'HYROX-UKA. SØN 27.: 💪 HYROX', light: false },
];

export default function PlanPage() {
  const weekStart = new Date('2026-06-08');
  const currentWeek = Math.max(1, Math.min(16, Math.ceil((Date.now() - weekStart.getTime()) / (7 * 86400000))));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold">16-ukers plan</h1>
        <p className="text-zinc-500 text-sm mt-1">10 km sub-41 · 20. sep 2026</p>
      </div>

      {/* Progress bar */}
      <div className="mx-4 mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-zinc-400">Uke {currentWeek} av 16</span>
          <span className="text-zinc-400">{Math.round((currentWeek / 16) * 100)}% ferdig</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(currentWeek / 16) * 100}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-zinc-600">
          <span>8. jun</span>
          <span>20. sep</span>
        </div>
      </div>

      {/* Plan list */}
      <div className="px-4 space-y-2">
        {PLAN.map((w) => {
          const isCurrent = w.week === currentWeek;
          const isPast = w.week < currentWeek;
          return (
            <div
              key={w.week}
              className={`rounded-xl border p-3 ${
                isCurrent
                  ? 'border-amber-500/60 bg-amber-900/20'
                  : w.light
                  ? 'border-zinc-800 bg-zinc-900/30'
                  : 'border-zinc-800 bg-zinc-900/20'
              } ${isPast ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {isPast && <span className="text-xs text-zinc-600">✓</span>}
                  {isCurrent && <span className="text-xs text-amber-400">▶</span>}
                  {!isCurrent && !isPast && <span className="text-xs text-zinc-700">○</span>}
                  <span className={`text-sm font-semibold ${isCurrent ? 'text-amber-300' : ''}`}>
                    Uke {w.week}
                  </span>
                  {w.light && <span className="text-[10px] text-blue-400 border border-blue-800 rounded px-1">LETT</span>}
                </div>
                <span className="text-sm font-mono text-zinc-400">{w.km} km</span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 ml-4">{w.dates}</p>
              <p className={`text-xs mt-1 ml-4 ${isCurrent ? 'text-zinc-200' : 'text-zinc-500'}`}>{w.key}</p>
            </div>
          );
        })}
      </div>

      {/* Race goal */}
      <div className="mx-4 mt-4 rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Augustdommen</p>
        <div className="space-y-1 text-sm">
          <p><span className="text-emerald-400">drag-median ≤4:08</span> → Sub-41-forsøk (4:06/km)</p>
          <p><span className="text-amber-400">4:09–4:15</span> → Mål 41:30–42:30</p>
          <p><span className="text-red-400">{'>'}4:15</span> → Mål 42:30–43:30, jakt PB</p>
        </div>
      </div>

      <BottomNav active="plan" />
    </div>
  );
}
