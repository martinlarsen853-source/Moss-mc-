import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { askCoach } from '@/lib/anthropic';
import { sendPushToAll } from '@/lib/push';
import { formatPace } from '@/lib/interval-icu';

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { workoutId } = await req.json();
  const supabase = createAdminClient();

  const { data: workout } = await supabase.from('workouts').select('*').eq('id', workoutId).single();
  if (!workout) return NextResponse.json({ error: 'Workout not found' }, { status: 404 });

  const { data: drags } = await supabase.from('drag_intervals').select('*').eq('workout_id', workoutId).order('sequence');

  const past7 = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const { data: metrics } = await supabase.from('daily_metrics').select('*').gte('date', past7).order('date', { ascending: false });
  const { data: recentWorkouts } = await supabase.from('workouts').select('date,type,name,avg_pace_sec_per_km,avg_hr,drag_median_pace_sec').order('date', { ascending: false }).limit(7);

  const today = metrics?.[0];
  const hrvTrend = (metrics?.map((m: { hrv: number | null }) => m.hrv).filter((v): v is number => v !== null).reverse()) ?? [];

  const coachContext = {
    type: 'post-økt-analyse',
    todayMetrics: {
      hrv: today?.hrv ?? undefined,
      restingHr: today?.resting_hr ?? undefined,
      sleepMin: today?.sleep_duration_min ?? undefined,
      bodyBattery: today?.body_battery_start ?? undefined,
      stress: today?.stress_avg ?? undefined,
    },
    trainingLoad: { ctl: today?.ctl ?? undefined, atl: today?.atl ?? undefined, tsb: today?.tsb ?? undefined },
    hrvTrend,
    recentWorkouts: recentWorkouts?.map((w: { date: string; type: string; name: string; avg_pace_sec_per_km: number | null; avg_hr: number | null; drag_median_pace_sec: number | null }) => ({
      date: w.date, type: w.type, name: w.name,
      avgPace: w.avg_pace_sec_per_km ? formatPace(w.avg_pace_sec_per_km) : undefined,
      avgHr: w.avg_hr ?? undefined,
      dragMedian: w.drag_median_pace_sec ? formatPace(w.drag_median_pace_sec) : undefined,
    })),
    workout: {
      name: workout.name, type: workout.type,
      duration_min: workout.duration_sec ? Math.round(workout.duration_sec / 60) : null,
      distance_km: workout.distance_m ? (workout.distance_m / 1000).toFixed(1) : null,
      avg_hr: workout.avg_hr,
      avg_pace: workout.avg_pace_sec_per_km ? formatPace(workout.avg_pace_sec_per_km) : null,
      drag_median: workout.drag_median_pace_sec ? formatPace(workout.drag_median_pace_sec) : null,
      drag_count: drags?.length || 0,
      drags: drags?.map((d: { sequence: number; avg_pace_sec_per_km: number; avg_hr: number; hr_drop_in_rest: number | null }) => ({
        seq: d.sequence, pace: formatPace(d.avg_pace_sec_per_km), hr: d.avg_hr, hr_drop: d.hr_drop_in_rest,
      })),
    },
  };

  const analysis = await askCoach(coachContext);

  await supabase.from('coaching_messages').insert({
    type: 'post-workout', message: analysis, workout_id: workoutId,
    data_snapshot: coachContext as unknown as Record<string, unknown>,
  });
  await supabase.from('workouts').update({ ai_analysis: analysis }).eq('id', workoutId);

  const { data: subs } = await supabase.from('push_subscriptions').select('*');
  if (subs?.length) {
    const shortMsg = analysis.split('\n')[0].substring(0, 100);
    await sendPushToAll(subs, { title: `Økt-analyse: ${workout.name}`, body: shortMsg, tag: 'post-workout', url: `/workouts` });
  }

  return NextResponse.json({ ok: true, analysis });
}
