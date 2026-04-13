'use client';

import { useDashboard } from '../layout';

export default function InvoicesPage() {
  const { user } = useDashboard();

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Invoices</h2>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-5xl mb-4">📝</span>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No invoices yet</h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Create your first invoice to start tracking payments from your clients.
          </p>
        </div>
      </main>
    </>
  );
}
