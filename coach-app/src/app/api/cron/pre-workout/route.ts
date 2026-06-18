import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { askCoach } from '@/lib/anthropic';
import { sendPushToAll } from '@/lib/push';
import { formatPace } from '@/lib/interval-icu';

// Workout schedule – 1 hour before each session a pre-workout push is sent
// Times in UTC+2 (Norway summer time = UTC+2)
const SCHEDULE: Array<{ day: number; hourLocal: number; label: string; type: string }> = [
  { day: 1, hourLocal: 6,  label: 'Rolig mandag + bakkesprint',  type: 'easy' },
  { day: 2, hourLocal: 18, label: 'Askim-intervall (Roar)',       type: 'interval' },
  { day: 3, hourLocal: 6,  label: 'Rolig onsdag',                 type: 'easy' },
  { day: 4, hourLocal: 18, label: 'Hyrox torsdag 19:00',          type: 'hyrox' },
  { day: 5, hourLocal: 6,  label: 'Rolig fredag + stigningsløp',  type: 'easy' },
  { day: 6, hourLocal: 9,  label: 'Hyrox lørdag 10:30',           type: 'hyrox-hard' },
  { day: 0, hourLocal: 7,  label: 'Langtur søndag',               type: 'long' },
];

// GET /api/cron/pre-workout – Vercel cron calls this every hour
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const utcHour = now.getUTCHours();
  const dayOfWeek = now.getUTCDay();
  // Norway is UTC+2 in summer
  const localHour = (utcHour + 2) % 24;

  const match = SCHEDULE.find((s) => s.day === dayOfWeek && s.hourLocal === localHour);
  if (!match) return NextResponse.json({ ok: true, skipped: true });

  const supabase = createAdminClient();
  const today = now.toISOString().split('T')[0];
  const past7 = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  const { data: metrics } = await supabase
    .from('daily_metrics')
    .select('*')
    .gte('date', past7)
    .order('date', { ascending: false });

  const { data: recentWorkouts } = await supabase
    .from('workouts')
    .select('date,type,name,avg_pace_sec_per_km,avg_hr,drag_median_pace_sec,ai_analysis')
    .order('date', { ascending: false })
    .limit(7);

  const todayMetrics = metrics?.[0];
  const hrvTrend = (metrics?.map((m: { hrv: number | null }) => m.hrv).filter((v): v is number => v !== null).reverse()) ?? [];

  // Current week number (uke 1 = 8. juni 2026)
  const weekStart = new Date('2026-06-08');
  const weekNumber = Math.ceil((now.getTime() - weekStart.getTime()) / (7 * 86400000));

  const coachContext = {
    type: 'pre-økt-briefing',
    question: `Gir briefing for: ${match.label} (type: ${match.type}). Hva er form-status og hvordan bør Martin utføre denne økta? Vær spesifikk med puls-tall og fart. Maks 5 linjer.`,
    todayMetrics: {
      hrv: todayMetrics?.hrv ?? undefined,
      restingHr: todayMetrics?.resting_hr ?? undefined,
      sleepMin: todayMetrics?.sleep_duration_min ?? undefined,
      bodyBattery: todayMetrics?.body_battery_start ?? undefined,
      stress: todayMetrics?.stress_avg ?? undefined,
    },
    trainingLoad: {
      ctl: todayMetrics?.ctl ?? undefined,
      atl: todayMetrics?.atl ?? undefined,
      tsb: todayMetrics?.tsb ?? undefined,
    },
    hrvTrend,
    recentWorkouts: recentWorkouts?.map((w: { date: string; type: string; name: string; avg_pace_sec_per_km: number | null; avg_hr: number | null; drag_median_pace_sec: number | null }) => ({
      date: w.date,
      type: w.type,
      name: w.name,
      avgPace: w.avg_pace_sec_per_km ? formatPace(w.avg_pace_sec_per_km) : undefined,
      avgHr: w.avg_hr ?? undefined,
      dragMedian: w.drag_median_pace_sec ? formatPace(w.drag_median_pace_sec) : undefined,
    })),
    currentWeek: weekNumber,
  };

  const briefing = await askCoach(coachContext);

  await supabase.from('coaching_messages').insert({
    type: 'pre-workout',
    message: briefing,
    data_snapshot: coachContext as unknown as Record<string, unknown>,
  });

  const { data: subs } = await supabase.from('push_subscriptions').select('*');
  if (subs?.length) {
    await sendPushToAll(subs, {
      title: `1t til: ${match.label}`,
      body: briefing.split('\n')[0].substring(0, 120),
      tag: 'pre-workout',
      url: '/coaching',
      requireInteraction: true,
    });
  }

  return NextResponse.json({ ok: true, sent: match.label });
}
