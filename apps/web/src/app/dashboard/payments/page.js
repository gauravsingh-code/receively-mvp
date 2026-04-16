'use client';

import ComingSoon from '@/components/ComingSoon';

export default function PaymentsPage() {
  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <h2 className="text-lg font-semibold text-gray-800">Payments</h2>
      </header>

      <main className="flex-1 overflow-y-auto px-8 py-6">
        <ComingSoon 
          icon="💳"
          title="Payments Module"
          description="Payment tracking and management features will be available here."
        />
      </main>
    </>
  );
}