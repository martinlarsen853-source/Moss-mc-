import { NextResponse } from 'next/server';
import { analyzeFood } from '@/lib/anthropic';
import { createAdminClient } from '@/lib/supabase-server';

// POST /api/food-photo – upload base64 image, get calorie analysis, log it
export async function POST(req: Request) {
  const body = await req.json();
  const { imageBase64, mimeType = 'image/jpeg', logImmediately = false } = body;

  if (!imageBase64) {
    return NextResponse.json({ error: 'imageBase64 required' }, { status: 400 });
  }

  const result = await analyzeFood(imageBase64, mimeType);

  if (logImmediately) {
    const supabase = createAdminClient();
    await supabase.from('nutrition_logs').insert({
      logged_at: new Date().toISOString(),
      description: result.description,
      kcal: result.kcal,
      protein_g: result.protein_g,
      carbs_g: result.carbs_g,
      fat_g: result.fat_g,
      source: 'photo',
    });
  }

  return NextResponse.json(result);
}
