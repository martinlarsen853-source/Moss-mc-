import { BottomNav } from '@/components/BottomNav';
import { SettingsClient } from '@/components/SettingsClient';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      <div className="px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold">Innstillinger</h1>
      </div>
      <SettingsClient />
      <BottomNav active="hjem" />
    </div>
  );
}
