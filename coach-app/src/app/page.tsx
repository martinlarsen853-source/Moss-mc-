import { createAdminClient } from '@/lib/supabase-server';
import { formatPace } from '@/lib/interval-icu';
import { HomeClient } from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split('T')[0];
  const past7 = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  const [metricsRes, workoutsRes, latestCoachRes, nutritionRes, presetsRes] = await Promise.all([
    supabase.from('daily_metrics').select('*').gte('date', past7).order('date', { ascending: false }),
    supabase.from('workouts').select('*').order('date', { ascending: false }).limit(5),
    supabase.from('coaching_messages').select('*').order('created_at', { ascending: false }).limit(3),
    supabase.from('nutrition_logs').select('*').gte('logged_at', `${today}T00:00:00`).order('logged_at', { ascending: false }),
    supabase.from('meal_presets').select('*').order('sort_order'),
  ]);

  const metrics = metricsRes.data ?? [];
  const workouts = workoutsRes.data ?? [];
  const coachMessages = latestCoachRes.data ?? [];
  const nutritionToday = nutritionRes.data ?? [];
  const presets = presetsRes.data ?? [];

  const todayMetrics = metrics[0] ?? null;
  const hrvTrend = metrics.map((m: { hrv: number | null }) => m.hrv).filter((v): v is number => v !== null).reverse();

  const proteinGoal = 180;
  const proteinToday = nutritionToday.reduce((sum: number, l: { protein_g: number }) => sum + l.protein_g, 0);
  const kcalToday = nutritionToday.reduce((sum: number, l: { kcal: number }) => sum + l.kcal, 0);

  const hrv = todayMetrics?.hrv;
  const tsb = todayMetrics?.tsb;
  let formStatus: 'god' | 'nøytral' | 'sliten' = 'nøytral';
  if (hrv && hrv > 65 && tsb && tsb > -5) formStatus = 'god';
  else if ((hrv && hrv < 45) || (tsb && tsb < -20)) formStatus = 'sliten';

  const latestWorkout = workouts[0] || null;
  const weekStart = new Date('2026-06-08');
  const currentWeek = Math.max(1, Math.ceil((Date.now() - weekStart.getTime()) / (7 * 86400000)));

  return (
    <HomeClient
      todayMetrics={todayMetrics ? {
        hrv: todayMetrics.hrv,
        restingHr: todayMetrics.resting_hr,
        sleepMin: todayMetrics.sleep_duration_min,
        bodyBattery: todayMetrics.body_battery_start,
        stress: todayMetrics.stress_avg,
        ctl: todayMetrics.ctl,
        atl: todayMetrics.atl,
        tsb: todayMetrics.tsb,
      } : null}
      formStatus={formStatus}
      hrvTrend={hrvTrend}
      latestCoachMessage={coachMessages[0]?.message || null}
      latestCoachType={coachMessages[0]?.type || null}
      latestWorkout={latestWorkout ? {
        date: latestWorkout.date,
        name: latestWorkout.name,
        type: latestWorkout.type,
        distanceKm: latestWorkout.distance_m ? latestWorkout.distance_m / 1000 : null,
        avgPace: latestWorkout.avg_pace_sec_per_km ? formatPace(latestWorkout.avg_pace_sec_per_km) : null,
        avgHr: latestWorkout.avg_hr,
        dragMedian: latestWorkout.drag_median_pace_sec ? formatPace(latestWorkout.drag_median_pace_sec) : null,
        analysis: latestWorkout.ai_analysis,
      } : null}
      proteinToday={Math.round(proteinToday)}
      proteinGoal={proteinGoal}
      kcalToday={Math.round(kcalToday)}
      nutritionLogs={nutritionToday.map((l: { id: string; description: string; kcal: number; protein_g: number; logged_at: string }) => ({ id: l.id, desc: l.description, kcal: l.kcal, protein: l.protein_g, time: l.logged_at }))}
      presets={presets.map((p: { id: string; name: string; emoji: string; kcal: number; protein_g: number }) => ({ id: p.id, name: p.name, emoji: p.emoji, kcal: p.kcal, protein: p.protein_g }))}
      currentWeek={currentWeek}
    />
  );
}
