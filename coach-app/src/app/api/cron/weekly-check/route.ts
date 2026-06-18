import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { askCoach } from '@/lib/anthropic';
import { sendPushToAll } from '@/lib/push';
import { formatPace } from '@/lib/interval-icu';

// GET /api/cron/weekly-check – runs Thursday+Friday at 17:00 local (15:00 UTC)
// Proactively evaluates if Saturday Hyrox should be changed
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 4=Thursday, 5=Friday
  if (dayOfWeek !== 4 && dayOfWeek !== 5) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const supabase = createAdminClient();
  const past14 = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];

  const { data: metrics } = await supabase
    .from('daily_metrics')
    .select('*')
    .gte('date', past14)
    .order('date', { ascending: false });

  const { data: recentWorkouts } = await supabase
    .from('workouts')
    .select('date,type,name,avg_pace_sec_per_km,avg_hr,drag_median_pace_sec,ai_analysis')
    .order('date', { ascending: false })
    .limit(10);

  const todayMetrics = metrics?.[0];
  const hrvTrend = (metrics?.slice(0, 7).map((m: { hrv: number | null }) => m.hrv).filter((v): v is number => v !== null).reverse()) ?? [];

  const weekStart = new Date('2026-06-08');
  const weekNumber = Math.ceil((now.getTime() - weekStart.getTime()) / (7 * 86400000));

  const coachContext = {
    type: 'ukessjekk',
    question: `Det er ${dayOfWeek === 4 ? 'torsdag' : 'fredag'}. Martin har Hyrox lørdag kl 10:30 (hard økt, RPE 8). Bør han kjøre Hyrox som planlagt, ta det ned til RPE 6-7, eller bytte til et annet format (f.eks. lange løpeintervaller)? Forklar med tall-begrunnelse og hva valget gir på kort og lang sikt. Maks 6 linjer.`,
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

  const analysis = await askCoach(coachContext);

  await supabase.from('coaching_messages').insert({
    type: 'weekly-check',
    message: analysis,
    data_snapshot: coachContext as unknown as Record<string, unknown>,
  });

  const { data: subs } = await supabase.from('push_subscriptions').select('*');
  if (subs?.length) {
    const day = dayOfWeek === 4 ? 'Torsdag' : 'Fredag';
    await sendPushToAll(subs, {
      title: `${day}: Vurdering av lørdag`,
      body: analysis.split('\n')[0].substring(0, 130),
      tag: 'weekly-check',
      url: '/coaching',
      requireInteraction: true,
    });
  }

  return NextResponse.json({ ok: true, analysis });
}
