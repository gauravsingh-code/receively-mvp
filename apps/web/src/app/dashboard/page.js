'use client';

import { formatCurrency } from '@/lib/utils';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useDashboard } from './layout';

export default function DashboardPage() {
  const { user } = useDashboard();

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-8 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.self_name?.split(' ')[0]}!
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Here&apos;s an overview of your business.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Invoices" value="0" icon="📄" color="blue" />
          <StatCard
            label="Paid"
            value={formatCurrency(0, user?.currency || 'USD')}
            icon="✅"
            color="green"
          />
          <StatCard
            label="Pending"
            value={formatCurrency(0, user?.currency || 'USD')}
            icon="⏳"
            color="yellow"
          />
          <StatCard
            label="Overdue"
            value={formatCurrency(0, user?.currency || 'USD')}
            icon="⚠️"
            color="red"
          />
        </div>

        {/* Quick Actions + Account Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h4 className="font-semibold text-gray-800">Quick Actions</h4>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" disabled title="Coming soon">
                + New Invoice
              </Button>
              <Button variant="outline" className="w-full" disabled title="Coming soon">
                + Add Client
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h4 className="font-semibold text-gray-800">Account Details</h4>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DetailRow label="Name" value={user?.self_name} />
              <DetailRow label="Email" value={user?.user_email} />
              {user?.business_name && (
                <DetailRow label="Business" value={user.business_name} />
              )}
              <DetailRow label="Currency" value={user?.currency || 'USD'} />
              {user?.payment_method && (
                <DetailRow label="Payment Method" value={user.payment_method} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <Card>
      <CardContent className="py-5">
        <div className="mb-3">
          <span
            className={`w-10 h-10 rounded-lg inline-flex items-center justify-center text-xl ${colorMap[color]}`}
          >
            {icon}
          </span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 truncate ml-4 max-w-[60%] text-right">{value}</span>
    </div>
  );
}
