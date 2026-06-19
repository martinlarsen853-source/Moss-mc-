import { NextResponse } from 'next/server';
import { getActivities, getWellness, extractDragIntervals, dragMedian, formatPace } from '@/lib/interval-icu';
import { createAdminClient } from '@/lib/supabase-server';

// GET /api/sync-interval  – called by Vercel cron every 15 min
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().split('T')[0];
  const past7 = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  let synced = { activities: 0, wellness: 0, errors: [] as string[] };

  // Sync wellness (HRV, sleep, stress, body battery, CTL/ATL/TSB)
  try {
    const wellness: Array<Record<string, unknown>> = await getWellness(past7, today);
    for (const day of wellness) {
      const date = day.id as string;
      const row = {
        date,
        hrv: (day.hrv as number) || null,
        resting_hr: (day.restingHR as number) || null,
        sleep_duration_min: (day.sleepSecs as number) ? Math.round((day.sleepSecs as number) / 60) : null,
        sleep_score: (day.sleepScore as number) || null,
        body_battery_start: (day.bodyBattery as number) || null,
        stress_avg: (day.avgStress as number) || null,
        steps: (day.steps as number) || null,
        ctl: (day.ctl as number) || null,
        atl: (day.atl as number) || null,
        tsb: (day.tsb as number) || null,
      };
      await supabase.from('daily_metrics').upsert(row, { onConflict: 'date' });
      synced.wellness++;
    }
  } catch (e) {
    synced.errors.push(`wellness: ${e}`);
  }

  // Sync activities
  try {
    const activities: Array<Record<string, unknown>> = await getActivities(past7, today);
    for (const act of activities) {
      const existing = await supabase
        .from('workouts')
        .select('id')
        .eq('interval_id', act.id as string)
        .single();
      if (existing.data) continue;

      const paceSecPerKm =
        (act.moving_time as number) && (act.distance as number)
          ? ((act.moving_time as number) / ((act.distance as number) / 1000))
          : null;

      const workoutRow: {
        interval_id: string; date: string; type: string; name: string;
        duration_sec: number | null; distance_m: number | null; avg_hr: number | null;
        max_hr: number | null; avg_pace_sec_per_km: number | null; avg_cadence: number | null;
        training_load: number | null; hr_zone_1_min: null; hr_zone_2_min: null;
        hr_zone_3_min: null; hr_zone_4_min: null; hr_zone_5_min: null;
        drag_median_pace_sec: number | null;
      } = {
        interval_id: act.id as string,
        date: (act.start_date_local as string)?.split('T')[0],
        type: (act.type as string) || 'Unknown',
        name: (act.name as string) || 'Økt',
        duration_sec: (act.moving_time as number) || null,
        distance_m: (act.distance as number) || null,
        avg_hr: (act.average_heartrate as number) || null,
        max_hr: (act.max_heartrate as number) || null,
        avg_pace_sec_per_km: paceSecPerKm,
        avg_cadence: (act.average_cadence as number) || null,
        training_load: (act.load as number) || null,
        hr_zone_1_min: null,
        hr_zone_2_min: null,
        hr_zone_3_min: null,
        hr_zone_4_min: null,
        hr_zone_5_min: null,
        drag_median_pace_sec: null,
      };

      // Extract drag intervals for running workouts
      if (workoutRow.type === 'Run' && act.streams) {
        const streams = act.streams as { time: number[]; heartrate: number[]; speed: number[] };
        const drags = extractDragIntervals(streams);
        const median = dragMedian(drags);
        workoutRow.drag_median_pace_sec = median ?? null;

        const { data: workout } = await supabase
          .from('workouts')
          .insert(workoutRow)
          .select()
          .single();

        if (workout && drags.length) {
          await supabase.from('drag_intervals').insert(
            drags.map((d, i) => ({ ...d, workout_id: workout.id, sequence: i + 1 }))
          );
        }
      } else {
        await supabase.from('workouts').insert(workoutRow);
      }

      synced.activities++;
    }
  } catch (e) {
    synced.errors.push(`activities: ${e}`);
  }

  return NextResponse.json({ ok: true, ...synced });
}
