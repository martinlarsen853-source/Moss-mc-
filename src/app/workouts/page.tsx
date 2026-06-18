import { createAdminClient } from '@/lib/supabase-server';
import { BottomNav } from '@/components/BottomNav';

export const dynamic = 'force-dynamic';

function formatPace(secPerKm: number | null): string {
  if (!secPerKm) return '–';
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDuration(sec: number | null): string {
  if (!sec) return '–';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}t ${m}m`;
  return `${m}m`;
}

function formatDist(m: number | null): string {
  if (!m) return '–';
  return `${(m / 1000).toFixed(1)} km`;
}

type Workout = {
  id: string;
  date: string;
  type: string;
  name: string;
  duration_sec: number | null;
  distance_m: number | null;
  avg_hr: number | null;
  drag_median_pace_sec: number | null;
  ai_analysis: string | null;
};

type DragInterval = {
  id: string;
  workout_id: string;
  sequence: number;
  duration_sec: number;
  avg_pace_sec_per_km: number;
  avg_hr: number;
  hr_drop_in_rest: number | null;
};

type DailyMetric = {
  date: string;
  hrv: number | null;
};

export default async function WorkoutsPage() {
  const supabase = createAdminClient();

  const [{ data: workouts }, { data: drags }, { data: metrics }] = await Promise.all([
    supabase
      .from('workouts')
      .select('id,date,type,name,duration_sec,distance_m,avg_hr,drag_median_pace_sec,ai_analysis')
      .order('date', { ascending: false })
      .limit(15),
    supabase
      .from('drag_intervals')
      .select('id,workout_id,sequence,duration_sec,avg_pace_sec_per_km,avg_hr,hr_drop_in_rest')
      .order('sequence'),
    supabase
      .from('daily_metrics')
      .select('date,hrv')
      .order('date', { ascending: false })
      .limit(30),
  ]);

  const dragsByWorkout = (drags || []).reduce<Record<string, DragInterval[]>>((acc, d) => {
    if (!acc[d.workout_id]) acc[d.workout_id] = [];
    acc[d.workout_id].push(d);
    return acc;
  }, {});

  const hrvByDate = (metrics || []).reduce<Record<string, number | null>>((acc, m) => {
    acc[m.date] = m.hrv;
    return acc;
  }, {});

  function nextDay(date: string): string {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      <div className="px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold">Øktlogg</h1>
        <p className="text-zinc-500 text-sm mt-1">Drag-analyse og pulssoner</p>
      </div>

      <div className="px-4 space-y-4">
        {(workouts || []).length === 0 && (
          <p className="text-zinc-600 text-sm">Ingen økter ennå. Koble Interval.icu for å starte synk.</p>
        )}
        {(workouts as Workout[]).map((w) => {
          const intervals = dragsByWorkout[w.id] || [];
          const hrvNext = hrvByDate[nextDay(w.date)];
          const isRun = w.type === 'Run' || w.type === 'run';
          return (
            <div key={w.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-sm">{w.name}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {new Date(w.date).toLocaleDateString('no', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{w.type}</span>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: 'Distanse', val: formatDist(w.distance_m) },
                  { label: 'Tid', val: formatDuration(w.duration_sec) },
                  { label: 'Snitt HR', val: w.avg_hr ? `${w.avg_hr}` : '–' },
                  { label: isRun ? 'Drag-med.' : 'Snittfart', val: isRun ? formatPace(w.drag_median_pace_sec) : formatPace(w.drag_median_pace_sec) },
                ].map(({ label, val }) => (
                  <div key={label} className="rounded-xl bg-zinc-800/60 p-2 text-center">
                    <p className="text-[10px] text-zinc-500">{label}</p>
                    <p className="text-sm font-semibold mt-0.5">{val}</p>
                  </div>
                ))}
              </div>

              {intervals.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Drag-intervaller</p>
                  <div className="space-y-1">
                    {intervals.map((d, i) => (
                      <div key={d.id} className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-600 w-5">#{i + 1}</span>
                        <span className="font-mono font-semibold text-emerald-400">{formatPace(d.avg_pace_sec_per_km)}/km</span>
                        <span className="text-zinc-500">{d.avg_hr} bpm</span>
                        {d.hr_drop_in_rest && (
                          <span className="text-zinc-600">↓{d.hr_drop_in_rest} bpm</span>
                        )}
                        <span className="text-zinc-700 ml-auto">{formatDuration(d.duration_sec)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hrvNext !== undefined && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-3">
                  <span>HRV natt etter:</span>
                  <span className={`font-semibold ${
                    hrvNext === null ? 'text-zinc-500' :
                    hrvNext >= 50 ? 'text-emerald-400' :
                    hrvNext >= 40 ? 'text-yellow-400' : 'text-red-400'
                  }`}>{hrvNext ?? '–'} ms</span>
                </div>
              )}

              {w.ai_analysis && (
                <div className="rounded-xl bg-zinc-800/40 p-3">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Coach</p>
                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">{w.ai_analysis}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <BottomNav active="workouts" />
    </div>
  );
}
