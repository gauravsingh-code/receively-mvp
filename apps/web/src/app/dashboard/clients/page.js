/**
 * Clients List Page
 * Display, add, edit, and archive clients
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ClientForm from '@/components/ClientForm';
import api from '@/lib/api/client';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ClientsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  // Don't fetch if still checking auth
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchClients();
    }
  }, [showArchived, authLoading, isAuthenticated]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching clients...', { showArchived });
      const response = await api.get(`/api/clients?includeArchived=${showArchived}`);
      console.log('API response:', response);
      setClients(response.data || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
      // Don't show error if it's authentication-related (already redirecting)
      if(!err.message?.includes('Authentication') && !err.message?.includes('Session expired')){
        setError(err.message || 'Failed to fetch clients');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (formData) => {
    try {
      await api.post('/api/clients', formData);
      setShowForm(false);
      fetchClients();
    } catch (err) {
      alert(err.message || 'Failed to create client');
      throw err;
    }
  };

  const handleUpdateClient = async (formData) => {
    try {
      await api.put(`/api/clients/${editingClient.client_id}`, formData);
      setEditingClient(null);
      setShowForm(false);
      fetchClients();
    } catch (err) {
      alert(err.message || 'Failed to update client');
      throw err;
    }
  };

  const handleArchiveClient = async (clientId) => {
    if (!confirm('Are you sure you want to archive this client? You can restore it later.')) {
      return;
    }

    try {
      await api.post(`/api/clients/${clientId}/archive`);
      fetchClients();
    } catch (err) {
      alert(err.message || 'Failed to archive client');
    }
  };

  const handleRestoreClient = async (clientId) => {
    try {
      await api.post(`/api/clients/${clientId}/restore`);
      fetchClients();
    } catch (err) {
      alert(err.message || 'Failed to restore client');
    }
  };

  const handleEditClick = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  const handleAddNewClick = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  // Active clients (not archived)
  const activeClients = clients.filter(c => !c.archived_at);
  // Archived clients
  const archivedClients = clients.filter(c => c.archived_at);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-600 mt-1">Manage your client information and billing details</p>
      </div>

      {/* Add New Client Button */}
      {!showForm && (
        <div className="mb-6 flex justify-between items-center">
          <Button onClick={handleAddNewClick} variant="primary">
            + Add New Client
          </Button>
          <Button
            onClick={() => setShowArchived(!showArchived)}
            variant="outline"
            size="sm"
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
        </div>
      )}

      {/* Client Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h2>
          </CardHeader>
          <CardContent>
            <ClientForm
              client={editingClient}
              onSubmit={editingClient ? handleUpdateClient : handleCreateClient}
              onCancel={handleCancelForm}
            />
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading clients...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-300 bg-red-50">
          <CardContent>
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchClients} variant="outline" size="sm" className="mt-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Clients List */}
      {!loading && !error && (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Active Clients ({activeClients.length})
            </h2>
          </div>

          {activeClients.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-600">No clients yet. Add your first client to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeClients.map((client) => (
                <Card key={client.client_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <Link
                          href={`/dashboard/clients/${client.client_id}`}
                          className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {client.name}
                        </Link>
                        {client.company_name && (
                          <p className="text-sm text-gray-600">{client.company_name}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {client.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Currency:</span> {client.default_currency}
                      </p>
                    </div>

                    {client.notes && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {client.notes}
                      </p>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <Button
                        onClick={() => router.push(`/dashboard/clients/${client.client_id}`)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleEditClick(client)}
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleArchiveClient(client.client_id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Archive
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Archived Clients Section */}
          {showArchived && archivedClients.length > 0 && (
            <div className="mt-8">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Archived Clients ({archivedClients.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedClients.map((client) => (
                  <Card key={client.client_id} className="opacity-60 border-gray-300">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-700">
                            {client.name}
                          </h3>
                          {client.company_name && (
                            <p className="text-sm text-gray-500">{client.company_name}</p>
                          )}
                        </div>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          Archived
                        </span>
                      </div>
                      
                      <div className="space-y-1 mb-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span> {client.email}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        <Button
                          onClick={() => handleRestoreClient(client.client_id)}
                          variant="primary"
                          size="sm"
                          className="flex-1"
                        >
                          Restore
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
