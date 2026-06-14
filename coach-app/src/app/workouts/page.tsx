import { createAdminClient } from '@/lib/supabase-server';
import { formatPace } from '@/lib/interval-icu';
import { BottomNav } from '@/components/BottomNav';

export const dynamic = 'force-dynamic';

export default async function WorkoutsPage() {
  const supabase = createAdminClient();
  const { data: workouts } = await supabase
    .from('workouts')
    .select('*, drag_intervals(*)')
    .order('date', { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      <div className="px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold">Treningslogg</h1>
        <p className="text-zinc-500 text-sm mt-1">Siste 20 økter med drag-analyse</p>
      </div>

      <div className="px-4 space-y-3">
        {(workouts || []).length === 0 && (
          <p className="text-zinc-600 text-sm">Ingen økter synkronisert ennå.</p>
        )}
        {(workouts || []).map((w: { id: string; date: string; type: string; name: string; distance_m: number | null; duration_sec: number | null; avg_hr: number | null; avg_pace_sec_per_km: number | null; drag_median_pace_sec: number | null; ai_analysis: string | null; drag_intervals: unknown }) => {
          const drags = (w.drag_intervals as Array<{ avg_pace_sec_per_km: number; avg_hr: number; sequence: number }>) || [];
          const typeEmoji = w.type === 'Run' ? '🏃' : w.type === 'VirtualRide' || w.type === 'Ride' ? '🚴' : '💪';
          return (
            <div key={w.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="mr-2">{typeEmoji}</span>
                  <span className="font-semibold text-sm">{w.name}</span>
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(w.date).toLocaleDateString('no', { day: 'numeric', month: 'short' })}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-zinc-400 mb-2">
                {w.distance_m && <span>{(w.distance_m / 1000).toFixed(1)} km</span>}
                {w.duration_sec && <span>{Math.floor(w.duration_sec / 60)} min</span>}
                {w.avg_hr && <span>{w.avg_hr} bpm</span>}
                {w.avg_pace_sec_per_km && <span>{formatPace(w.avg_pace_sec_per_km)}</span>}
                {w.drag_median_pace_sec && (
                  <span className="text-amber-400 font-medium">drag: {formatPace(w.drag_median_pace_sec)}</span>
                )}
              </div>

              {drags.length > 0 && (
                <div className="mt-2 pt-2 border-t border-zinc-800">
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">
                    {drags.length} drag (puls 167–173)
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {drags.map((d) => (
                      <span key={d.sequence} className="text-xs bg-zinc-800 rounded px-2 py-0.5">
                        {formatPace(d.avg_pace_sec_per_km)} @ {d.avg_hr}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {w.ai_analysis && (
                <div className="mt-3 pt-3 border-t border-zinc-800">
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{w.ai_analysis}</p>
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
