import { useState, useEffect } from 'react';
import { Plus, QrCode, Eye, Edit, Trash2 } from 'lucide-react';
import { MainLayout } from '../../layouts';
import { Card, Button, Badge, BackToDashboard, QRScanner } from '../../components/common';
import { DataTable } from '../../components/tables';
import { useActivityLogger, useAuth } from '../../hooks';
import { supabase } from '../../lib/supabase';
import { HouseholdRegistrationForm } from './HouseholdRegistrationForm';

interface Registration {
  id: string;
  household_head: string;
  full_name: string;
  phone: string;
  address: string;
  category: string;
  household_size: number;
  qr_code: string;
  status: string;
  created_at: string;
}

interface HouseholdMember {
  id: string;
  full_name: string;
  relationship: string;
  gender: string;
  age: number;
  phone: string;
}

export const RegistrationsPage = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState<Registration | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { track } = useActivityLogger();
  const { user } = useAuth();

  useEffect(() => {
    loadRegistrations();

    const channel = supabase
      .channel('registrations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        loadRegistrations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentPage]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const limit = 10;
      const offset = (currentPage - 1) * limit;

      const { data, error, count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      setRegistrations(data || []);
      setTotalPages(Math.ceil((count || 0) / limit));
      await track('view', 'registrations', 'Viewed registrations list');
    } catch (error) {
      console.error('Failed to load registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('qr_code', code)
        .single();

      if (error) throw error;

      if (data) {
        await viewHousehold(data);
        setShowScanner(false);
      } else {
        alert('No household found with this QR code');
      }
    } catch (error) {
      console.error('QR scan error:', error);
      alert('Failed to load household data');
    }
  };

  const viewHousehold = async (household: Registration) => {
    try {
      setSelectedHousehold(household);

      const { data, error } = await supabase
        .from('household_members')
        .select('*')
        .eq('registration_id', household.id);

      if (error) throw error;

      setHouseholdMembers(data || []);
      setShowDetails(true);
    } catch (error) {
      console.error('Failed to load household members:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this household registration?')) return;

    try {
      const { error } = await supabase.from('registrations').delete().eq('id', id);

      if (error) throw error;

      await track('delete', 'registrations', 'Deleted household registration');
      loadRegistrations();
    } catch (error) {
      console.error('Failed to delete registration:', error);
      alert('Failed to delete registration');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (showForm) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <BackToDashboard />
          <HouseholdRegistrationForm
            onSuccess={() => {
              setShowForm(false);
              loadRegistrations();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </MainLayout>
    );
  }

  if (showDetails && selectedHousehold) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <BackToDashboard />

          <Card>
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Household Details</h2>
                  <p className="text-gray-600 mt-1">Household ID: {selectedHousehold.qr_code}</p>
                </div>
                <Button onClick={() => setShowDetails(false)} variant="ghost">
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Household Head</p>
                  <p className="font-semibold text-gray-900">{selectedHousehold.household_head || selectedHousehold.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{selectedHousehold.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold text-gray-900">{selectedHousehold.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold text-gray-900 capitalize">{selectedHousehold.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Household Size</p>
                  <p className="font-semibold text-gray-900">{selectedHousehold.household_size} members</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedHousehold.status)}</div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-4">Family Members ({householdMembers.length})</h3>
                {householdMembers.length > 0 ? (
                  <div className="space-y-3">
                    {householdMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{member.full_name}</p>
                            <p className="text-sm text-gray-600">
                              {member.relationship} • {member.gender} • {member.age} years
                            </p>
                            {member.phone && (
                              <p className="text-sm text-gray-500 mt-1">Phone: {member.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No family members registered</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <BackToDashboard />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Household Registrations</h1>
            <p className="text-gray-600 mt-1">
              Register and manage household information with QR code access
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowScanner(true)} variant="ghost">
              <QrCode className="w-4 h-4 mr-2" />
              Scan QR Code
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Registration
            </Button>
          </div>
        </div>

        <Card>
          <DataTable
            data={registrations}
            columns={[
              {
                key: 'qr_code',
                label: 'QR Code',
                render: (r) => (
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {r.qr_code}
                  </span>
                ),
              },
              {
                key: 'household_head',
                label: 'Household Head',
                render: (r) => r.household_head || r.full_name,
              },
              {
                key: 'phone',
                label: 'Phone',
              },
              {
                key: 'address',
                label: 'Address',
              },
              {
                key: 'household_size',
                label: 'Members',
                render: (r) => `${r.household_size} members`,
              },
              {
                key: 'category',
                label: 'Category',
                render: (r) => <span className="capitalize">{r.category}</span>,
              },
              {
                key: 'status',
                label: 'Status',
                render: (r) => getStatusBadge(r.status),
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (r) => (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => viewHousehold(r)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ),
              },
            ]}
            loading={loading}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage,
            }}
            emptyState={
              <div className="text-center py-12 text-gray-500">
                No household registrations found
              </div>
            }
          />
        </Card>

        {showScanner && <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />}
      </div>
    </MainLayout>
  );
};
