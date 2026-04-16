/**
 * Client Detail Page
 * Shows client information and all associated invoices with financial summary
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import api from '@/lib/api/client';

export default function ClientDetailPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const clientId = unwrappedParams.id;
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/clients/${clientId}`);
      setClient(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch client details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-200 text-gray-700',
      sent: 'bg-blue-200 text-blue-700',
      paid: 'bg-green-200 text-green-700',
      overdue: 'bg-red-200 text-red-700',
      cancelled: 'bg-gray-300 text-gray-600',
    };
    return colors[status] || 'bg-gray-200 text-gray-700';
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="border-red-300 bg-red-50">
          <CardContent>
            <p className="text-red-600">{error}</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={fetchClientDetails} variant="outline" size="sm">
                Try Again
              </Button>
              <Button onClick={() => router.push('/dashboard/clients')} variant="outline" size="sm">
                Back to Clients
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">Client not found</p>
            <Button onClick={() => router.push('/dashboard/clients')} variant="outline" className="mt-4">
              Back to Clients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/clients"
          className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
        >
          ← Back to Clients
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
        {client.company_name && (
          <p className="text-lg text-gray-600 mt-1">{client.company_name}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Client Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Client Information</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <a href={`mailto:${client.email}`} className="text-blue-600 hover:text-blue-800">
                    {client.email}
                  </a>
                </div>

                {client.billing_address && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Billing Address</p>
                    <p className="text-gray-900 whitespace-pre-line">{client.billing_address}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500">Default Currency</p>
                  <p className="text-gray-900">{client.default_currency}</p>
                </div>

                {client.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="text-gray-900 whitespace-pre-line">{client.notes}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Client since {formatDate(client.created_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary Card */}
          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">Financial Summary</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Billed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(client.summary?.totalBilled, client.default_currency)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(client.summary?.totalPaid, client.default_currency)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(client.summary?.outstanding, client.default_currency)}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    {client.summary?.invoiceCount || 0} invoice(s)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Invoices */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Invoices</h2>
                <Button
                  onClick={() => router.push(`/dashboard/invoices/new?client=${client.client_id}`)}
                  variant="primary"
                  size="sm"
                >
                  + New Invoice
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!client.invoices || client.invoices.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No invoices yet for this client</p>
                  <Button
                    onClick={() => router.push(`/dashboard/invoices/new?client=${client.client_id}`)}
                    variant="outline"
                    className="mt-4"
                  >
                    Create First Invoice
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Invoice #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Due Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Paid
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {client.invoices.map((invoice) => {
                        const balance = (parseFloat(invoice.total_amount) || 0) - (parseFloat(invoice.paid_amount) || 0);
                        return (
                          <tr key={invoice.invoice_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <Link
                                href={`/dashboard/invoices/${invoice.invoice_id}`}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {invoice.invoice_number}
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {formatDate(invoice.created_at)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {formatDate(invoice.due_date)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(invoice.status)}`}>
                                {invoice.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium">
                              {formatCurrency(invoice.total_amount, client.default_currency)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-green-600">
                              {formatCurrency(invoice.paid_amount, client.default_currency)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium">
                              <span className={balance > 0 ? 'text-red-600' : 'text-gray-600'}>
                                {formatCurrency(balance, client.default_currency)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
