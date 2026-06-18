import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );
}

// A chainable stub used when Supabase env vars are missing, so pages render an
// empty state instead of throwing a 500. Every query method returns the stub
// and awaiting it resolves to an empty result.
function createStubClient() {
  const result = { data: null, error: { message: 'Supabase not configured' } };
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop) {
      if (prop === 'then') {
        return (resolve: (v: typeof result) => unknown) => resolve(result);
      }
      return () => proxy;
    },
  };
  const proxy: Record<string, unknown> = new Proxy({}, handler);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return proxy as any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAdminClient(): ReturnType<typeof createClient<any>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return createStubClient();
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
