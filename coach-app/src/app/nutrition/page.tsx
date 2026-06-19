import { createAdminClient } from '@/lib/supabase-server';
import { NutritionClient } from '@/components/NutritionClient';

export const dynamic = 'force-dynamic';

export default async function NutritionPage() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split('T')[0];
  const past7 = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  const [logsRes, presetsRes, weekRes] = await Promise.all([
    supabase.from('nutrition_logs').select('*').gte('logged_at', `${today}T00:00:00`).order('logged_at', { ascending: false }),
    supabase.from('meal_presets').select('*').order('sort_order'),
    supabase.from('nutrition_logs').select('logged_at,kcal,protein_g').gte('logged_at', `${past7}T00:00:00`),
  ]);

  const logs = logsRes.data || [];
  const presets = presetsRes.data || [];
  const weekLogs = weekRes.data || [];

  const todayTotals = logs.reduce((acc: { kcal: number; protein: number }, l: { kcal: number; protein_g: number }) => ({
    kcal: acc.kcal + l.kcal, protein: acc.protein + l.protein_g,
  }), { kcal: 0, protein: 0 });

  // Group week logs by day
  const byDay: Record<string, { kcal: number; protein: number }> = {};
  for (const l of weekLogs as Array<{ logged_at: string; kcal: number; protein_g: number }>) {
    const d = l.logged_at.split('T')[0];
    if (!byDay[d]) byDay[d] = { kcal: 0, protein: 0 };
    byDay[d].kcal += l.kcal;
    byDay[d].protein += l.protein_g;
  }

  return (
    <NutritionClient
      logs={logs.map((l: { id: string; description: string; kcal: number; protein_g: number; logged_at: string; source: string }) => ({ id: l.id, desc: l.description, kcal: l.kcal, protein: l.protein_g, time: l.logged_at, source: l.source }))}
      presets={presets.map((p: { id: string; name: string; emoji: string; kcal: number; protein_g: number; description: string }) => ({ id: p.id, name: p.name, emoji: p.emoji, kcal: p.kcal, protein: p.protein_g, desc: p.description }))}
      todayKcal={Math.round(todayTotals.kcal)}
      todayProtein={Math.round(todayTotals.protein)}
      proteinGoal={180}
      weekByDay={byDay}
    />
  );
}
