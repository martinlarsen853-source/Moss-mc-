const BASE = 'https://intervals.icu/api/v1';

function headers() {
  const key = process.env.INTERVAL_ICU_API_KEY!;
  const athleteId = process.env.INTERVAL_ICU_ATHLETE_ID!;
  const encoded = Buffer.from(`API:${key}`).toString('base64');
  return { Authorization: `Basic ${encoded}`, 'Content-Type': 'application/json', 'X-Athlete-Id': athleteId };
}

const athleteId = () => process.env.INTERVAL_ICU_ATHLETE_ID!;

export async function getActivities(oldest: string, newest: string) {
  const res = await fetch(`${BASE}/athlete/${athleteId()}/activities?oldest=${oldest}&newest=${newest}`, { headers: headers() });
  if (!res.ok) throw new Error(`Interval.icu activities: ${res.status}`);
  return res.json();
}

export async function getActivity(activityId: string) {
  const res = await fetch(`${BASE}/activity/${activityId}`, { headers: headers() });
  if (!res.ok) throw new Error(`Interval.icu activity: ${res.status}`);
  return res.json();
}

export async function getWellness(startDate: string, endDate: string) {
  const res = await fetch(`${BASE}/athlete/${athleteId()}/wellness?oldest=${startDate}&newest=${endDate}`, { headers: headers() });
  if (!res.ok) throw new Error(`Interval.icu wellness: ${res.status}`);
  return res.json();
}

export async function getWellnessDay(date: string) {
  const res = await fetch(`${BASE}/athlete/${athleteId()}/wellness/${date}`, { headers: headers() });
  if (!res.ok) return null;
  return res.json();
}

export async function getTrainingLoad() {
  const today = new Date().toISOString().split('T')[0];
  const past = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
  const data = await getWellness(past, today);
  const sorted = [...data].sort((a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date));
  return sorted[0] || null;
}

export function formatPace(secPerKm: number): string {
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${sec.toString().padStart(2, '0')}/km`;
}

export function extractDragIntervals(streams: { time: number[]; heartrate: number[]; speed: number[] }) {
  const drags: Array<{ duration_sec: number; avg_pace_sec_per_km: number; avg_hr: number; max_hr: number }> = [];
  if (!streams.heartrate || !streams.speed) return drags;
  const MIN_DURATION = 180;
  const HR_LOW = 167;
  const HR_HIGH = 173;
  let start: number | null = null;
  for (let i = 0; i < streams.time.length; i++) {
    const hr = streams.heartrate[i];
    const inZone = hr >= HR_LOW && hr <= HR_HIGH;
    if (inZone && start === null) { start = i; }
    else if (!inZone && start !== null) {
      const duration = streams.time[i] - streams.time[start];
      if (duration >= MIN_DURATION) {
        const segment = { hrs: streams.heartrate.slice(start, i), speeds: streams.speed.slice(start, i) };
        const avgHr = segment.hrs.reduce((a, b) => a + b, 0) / segment.hrs.length;
        const avgSpeed = segment.speeds.reduce((a, b) => a + b, 0) / segment.speeds.length;
        const avgPace = avgSpeed > 0 ? 1000 / avgSpeed : 0;
        drags.push({ duration_sec: duration, avg_pace_sec_per_km: avgPace, avg_hr: Math.round(avgHr), max_hr: Math.max(...segment.hrs) });
      }
      start = null;
    }
  }
  return drags;
}

export function dragMedian(drags: Array<{ avg_pace_sec_per_km: number }>): number | null {
  if (!drags.length) return null;
  const sorted = [...drags].sort((a, b) => a.avg_pace_sec_per_km - b.avg_pace_sec_per_km);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid].avg_pace_sec_per_km : (sorted[mid - 1].avg_pace_sec_per_km + sorted[mid].avg_pace_sec_per_km) / 2;
}
