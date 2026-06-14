import { createAdminClient } from '@/lib/supabase-server';
import { BottomNav } from '@/components/BottomNav';

export const dynamic = 'force-dynamic';

const PHASE_COLORS: Record<string, string> = {
  'Grunntrening': 'text-blue-400',
  'Oppbygging': 'text-yellow-400',
  'Spesifikk': 'text-orange-400',
  'Toppform': 'text-emerald-400',
  'Konkurranse': 'text-red-400',
  'Restitusjon': 'text-zinc-400',
};

type PlanWeek = {
  id: string;
  week_number: number;
  date_start: string;
  date_end: string;
  target_km: number;
  phase: string;
  key_session: string;
  is_light_week: boolean;
};

export default async function PlanPage() {
  const supabase = createAdminClient();
  const { data: plan } = await supabase
    .from('training_plan')
    .select('*')
    .order('week_number');

  const today = new Date().toISOString().slice(0, 10);
  const weeks = (plan || []) as PlanWeek[];

  const currentWeek = weeks.find(
    (w) => w.date_start <= today && w.date_end >= today
  );
  const completedWeeks = weeks.filter((w) => w.date_end < today).length;
  const totalWeeks = weeks.length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold">16-ukers plan</h1>
        <p className="text-zinc-500 text-sm mt-1">Mot Hyrox august 2026</p>
      </div>

      {totalWeeks > 0 && (
        <div className="mx-4 mb-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">Fremdrift</span>
            <span className="text-sm text-zinc-400">{completedWeeks}/{totalWeeks} uker</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.round((completedWeeks / totalWeeks) * 100)}%` }}
            />
          </div>
          {currentWeek && (
            <p className="text-xs text-zinc-500 mt-2">
              Uke {currentWeek.week_number}: <span className="text-white">{currentWeek.key_session}</span>
            </p>
          )}
        </div>
      )}

      <div className="px-4 space-y-2">
        {weeks.length === 0 && (
          <p className="text-zinc-600 text-sm">Ingen plan lagt inn ennå.</p>
        )}
        {weeks.map((w) => {
          const isPast = w.date_end < today;
          const isCurrent = currentWeek?.id === w.id;
          const phaseColor = PHASE_COLORS[w.phase] || 'text-zinc-400';
          return (
            <div
              key={w.id}
              className={`rounded-2xl border p-3 ${
                isCurrent
                  ? 'border-emerald-600 bg-emerald-950/30'
                  : isPast
                  ? 'border-zinc-800/50 bg-zinc-900/20'
                  : 'border-zinc-800 bg-zinc-900/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold w-7 ${
                    isCurrent ? 'text-emerald-400' : isPast ? 'text-zinc-600' : 'text-zinc-400'
                  }`}>
                    U{w.week_number}
                  </span>
                  <div>
                    <p className={`text-sm font-medium ${
                      isPast ? 'text-zinc-600' : 'text-white'
                    }`}>
                      {w.key_session}
                      {w.is_light_week && <span className="ml-1 text-[10px] text-blue-400">lett</span>}
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      {new Date(w.date_start).toLocaleDateString('no', { day: 'numeric', month: 'short' })} –{' '}
                      {new Date(w.date_end).toLocaleDateString('no', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${
                    isPast ? 'text-zinc-600' : 'text-white'
                  }`}>{w.target_km} km</p>
                  <p className={`text-[10px] mt-0.5 ${phaseColor}`}>{w.phase}</p>
                </div>
              </div>
              {isCurrent && (
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400">Nåværende uke</span>
                </div>
              )}
              {isPast && (
                <div className="mt-1">
                  <span className="text-[10px] text-zinc-700">Gjennomfort</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <BottomNav active="plan" />
    </div>
  );
}
