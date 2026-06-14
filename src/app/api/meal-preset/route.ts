import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  const { name, kcal, protein_g, carbs_g, fat_g, emoji, description } = await req.json();
  const supabase = createAdminClient();
  const { data: max } = await supabase.from('meal_presets').select('sort_order').order('sort_order', { ascending: false }).limit(1).single();
  await supabase.from('meal_presets').insert({
    name, kcal, protein_g, carbs_g: carbs_g || null, fat_g: fat_g || null,
    emoji: emoji || '🍽️', description: description || name,
    sort_order: (max?.sort_order || 0) + 1,
  });
  return NextResponse.json({ ok: true });
}
