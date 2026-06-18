'use client';
import Link from 'next/link';

const NAV = [
  { href: '/', label: 'Hjem', icon: '🏠', key: 'hjem' },
  { href: '/coaching', label: 'Coach', icon: '🧠', key: 'coaching' },
  { href: '/workouts', label: 'Økter', icon: '🏃', key: 'workouts' },
  { href: '/nutrition', label: 'Mat', icon: '🥗', key: 'nutrition' },
  { href: '/plan', label: 'Plan', icon: '📅', key: 'plan' },
];

export function BottomNav({ active }: { active: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-zinc-800 flex safe-area-pb">
      {NAV.map((item) => (
        <Link key={item.key} href={item.href} className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${active === item.key ? 'text-white' : 'text-zinc-600'}`}>
          <span className="text-xl">{item.icon}</span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
