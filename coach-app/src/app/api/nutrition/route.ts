import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

// POST /api/nutrition – log a preset meal or manual entry
export async function POST(req: Request) {
  const body = await req.json();
  const { presetId, description, kcal, protein_g, carbs_g, fat_g } = body;

  const supabase = createAdminClient();

  if (presetId) {
    const { data: preset } = await supabase
      .from('meal_presets')
      .select('*')
      .eq('id', presetId)
      .single();
    if (!preset) return NextResponse.json({ error: 'Preset not found' }, { status: 404 });

    await supabase.from('nutrition_logs').insert({
      logged_at: new Date().toISOString(),
      description: preset.name,
      kcal: preset.kcal,
      protein_g: preset.protein_g,
      carbs_g: preset.carbs_g,
      fat_g: preset.fat_g,
      source: 'preset',
      preset_id: presetId,
    });
    return NextResponse.json({ ok: true, logged: preset.name });
  }

  // Manual entry
  await supabase.from('nutrition_logs').insert({
    logged_at: new Date().toISOString(),
    description: description || 'Ukjent måltid',
    kcal: kcal || 0,
    protein_g: protein_g || 0,
    carbs_g: carbs_g || null,
    fat_g: fat_g || null,
    source: 'manual',
  });

  return NextResponse.json({ ok: true });
}

// GET /api/nutrition – today's summary
export async function GET() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: logs } = await supabase
    .from('nutrition_logs')
    .select('*')
    .gte('logged_at', `${today}T00:00:00`)
    .order('logged_at', { ascending: false });

  const totals = (logs || []).reduce(
    (acc: { kcal: number; protein_g: number; carbs_g: number; fat_g: number }, log: { kcal: number; protein_g: number; carbs_g: number | null; fat_g: number | null }) => ({
      kcal: acc.kcal + log.kcal,
      protein_g: acc.protein_g + log.protein_g,
      carbs_g: acc.carbs_g + (log.carbs_g || 0),
      fat_g: acc.fat_g + (log.fat_g || 0),
    }),
    { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  return NextResponse.json({ logs, totals });
}
