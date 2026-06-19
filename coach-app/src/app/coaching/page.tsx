import { createAdminClient } from '@/lib/supabase-server';
import { BottomNav } from '@/components/BottomNav';

export const dynamic = 'force-dynamic';

const TYPE_LABELS: Record<string, string> = {
  'post-workout': 'Økt-analyse',
  'pre-workout': 'Pre-økt',
  'weekly-check': 'Ukesvurdering',
  'form-status': 'Form-status',
};

export default async function CoachingPage() {
  const supabase = createAdminClient();
  const { data: messages } = await supabase
    .from('coaching_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      <div className="px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold">Coach-historikk</h1>
        <p className="text-zinc-500 text-sm mt-1">Alle analyser og råd</p>
      </div>

      <div className="px-4 space-y-3">
        {(messages || []).length === 0 && (
          <p className="text-zinc-600 text-sm">Ingen meldinger ennå. Synk første økt for å starte.</p>
        )}
        {(messages || []).map((msg: { id: string; type: string; message: string; created_at: string }) => (
          <div key={msg.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                {TYPE_LABELS[msg.type] || msg.type}
              </span>
              <span className="text-[10px] text-zinc-600">
                {new Date(msg.created_at).toLocaleDateString('no', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">{msg.message}</p>
          </div>
        ))}
      </div>

      <BottomNav active="coaching" />
    </div>
  );
}
