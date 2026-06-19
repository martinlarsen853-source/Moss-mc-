import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

// POST /api/push-subscribe – save Web Push subscription from browser
export async function POST(req: Request) {
  const { endpoint, keys } = await req.json();
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }

  const supabase = createAdminClient();
  await supabase.from('push_subscriptions').upsert(
    { endpoint, p256dh: keys.p256dh, auth: keys.auth },
    { onConflict: 'endpoint' }
  );

  return NextResponse.json({ ok: true });
}

// DELETE /api/push-subscribe – remove subscription
export async function DELETE(req: Request) {
  const { endpoint } = await req.json();
  const supabase = createAdminClient();
  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
  return NextResponse.json({ ok: true });
}
