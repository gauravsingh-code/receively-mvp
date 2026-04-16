'use client';

import ComingSoon from '@/components/ComingSoon';

export default function SettingsPage() {
  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
      </header>

      <main className="flex-1 overflow-y-auto px-8 py-6">
        <ComingSoon 
          icon="⚙️"
          title="Account Settings"
          description="Account settings and preferences will be available here."
        />
      </main>
    </>
  );
}