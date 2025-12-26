import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Filter } from 'lucide-react';
import { MainLayout } from '../../layouts';
import { Card, Button, Input, Select, Modal, Badge, BackToDashboard } from '../../components/common';
import { DataTable } from '../../components/tables';
import { useActivityLogger, useAuth } from '../../hooks';
import { referralsApi, organizationsApi } from '../../api';
import { Referral, Organization } from '../../types';
import { supabase } from '../../lib/supabase';

interface ReferralFormData {
  client_name: string;
  client_phone: string;
  client_email?: string;
  reason: string;
  category: string;
  priority: string;
  notes?: string;
  assigned_organization_id?: string;
}

export const ReferralsPage = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters for Assignment Modal
  const [assignFilterLocation, setAssignFilterLocation] = useState('');
  const [assignFilterSector, setAssignFilterSector] = useState('');

  const { track } = useActivityLogger();
  const { user } = useAuth();

  const isStateAdmin = user?.role === 'admin' || user?.role === 'state_admin';
  const isOrganizationUser = user?.role === 'organization' || user?.role === 'manager';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReferralFormData>({
    defaultValues: {
      priority: 'medium',
      category: 'protection',
    }
  });

  useEffect(() => {
    loadReferrals();
    loadOrganizations();

    const channel = supabase
      .channel('referrals-list-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'referrals' }, () => {
        loadReferrals();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentPage]);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const response = await referralsApi.getReferrals({ page: currentPage, limit: 10 });
      setReferrals(response.data);
      setTotalPages(response.total_pages);
      await track('view', 'referrals', 'Viewed referrals list');
    } catch (error) {
      console.error('Failed to load referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const orgs = await organizationsApi.getOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    }
  };

  const onSubmit = async (data: ReferralFormData) => {
    try {
      let referredTo = 'Pending Assignment';
      if (data.assigned_organization_id) {
        const selectedOrg = organizations.find(org => org.id === data.assigned_organization_id);
        if (selectedOrg) {
          referredTo = selectedOrg.organization_name || selectedOrg.name;
        }
      }

      const referralData: any = {
        ...data,
        referred_to: referredTo,
        status: 'pending',
      };

      if (editingReferral) {
        await referralsApi.updateReferral(editingReferral.id, referralData);
        await track('update', 'referrals', `Updated referral`, {
          referral_id: editingReferral.id,
          referral_number: editingReferral.referral_number,
          client_name: data.client_name,
          category: data.category,
          priority: data.priority
        });
      } else {
        const newReferral = await referralsApi.createReferral(referralData);
        await track('create', 'referrals', `Created referral`, {
          referral_id: newReferral.id,
          referral_number: newReferral.referral_number,
          client_name: data.client_name,
          category: data.category,
          priority: data.priority
        });
      }
      reset();
      setShowModal(false);
      setEditingReferral(null);
      loadReferrals();
    } catch (error) {
      console.error('Failed to save referral:', error);
      alert('Failed to save referral');
    }
  };

  const handleAccept = async (referral: Referral) => {
    if (!confirm(`Accept referral ${referral.referral_number}?`)) return;

    try {
      await referralsApi.acceptReferral(referral.id);
      await track('update', 'referrals', `Accepted referral ${referral.referral_number}`);
      alert('Referral accepted successfully');
      loadReferrals();
    } catch (error) {
      console.error('Failed to accept referral:', error);
      alert('Failed to accept referral');
    }
  };

  const handleDeclineClick = (referral: Referral) => {
    setSelectedReferral(referral);
    setDeclineReason('');
    setShowDeclineModal(true);
  };

  const handleDecline = async () => {
    if (!selectedReferral || !declineReason.trim()) {
      alert('Please provide a decline reason');
      return;
    }

    try {
      await referralsApi.declineReferral(selectedReferral.id, declineReason);
      await track('update', 'referrals', `Declined referral ${selectedReferral.referral_number}`, {
        decline_reason: declineReason
      });
      alert('Referral declined. It is now available for reassignment.');
      setShowDeclineModal(false);
      setSelectedReferral(null);
      setDeclineReason('');
      loadReferrals();
    } catch (error: any) {
      console.error('Failed to decline referral:', error);
      alert(error.message || 'Failed to decline referral');
    }
  };

  const handleAssignClick = (referral: Referral) => {
    setSelectedReferral(referral);
    setSelectedOrgId('');
    setAssignFilterLocation('');
    setAssignFilterSector('');
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    if (!selectedReferral || !selectedOrgId) {
      alert('Please select an organization');
      return;
    }

    try {
      await referralsApi.assignReferral(selectedReferral.id, selectedOrgId);
      await track('update', 'referrals', `Assigned referral ${selectedReferral.referral_number}`);
      alert('Referral assigned successfully');
      setShowAssignModal(false);
      setSelectedReferral(null);
      setSelectedOrgId('');
      loadReferrals();
    } catch (error: any) {
      console.error('Failed to assign referral:', error);
      alert(error.message || 'Failed to assign referral');
    }
  };

  const handleEdit = (referral: Referral) => {
    // Only allow editing if user created it or is admin
    if (referral.created_by !== user?.id && !isStateAdmin) {
      alert('You can only edit referrals you created');
      return;
    }
    setEditingReferral(referral);
    reset({
      client_name: referral.client_name || '',
      client_phone: referral.client_phone || '',
      client_email: referral.client_email || '',
      reason: referral.reason,
      category: referral.category || 'protection',
      priority: referral.priority || 'medium',
      notes: referral.notes || '',
      assigned_organization_id: referral.assigned_organization_id,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this referral?')) return;

    try {
      await referralsApi.deleteReferral(id);
      await track('delete', 'referrals', 'Deleted referral');
      loadReferrals();
    } catch (error) {
      console.error('Failed to delete referral:', error);
      alert('Failed to delete referral');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReferral(null);
    reset();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      pending: 'warning',
      accepted: 'success',
      rejected: 'danger',
      completed: 'success',
      cancelled: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  // Check if referral is assigned to current user's organization
  const isAssignedToMyOrg = (referral: Referral) => {
    if (!isOrganizationUser || !user?.organization_id) return false;
    return referral.assigned_organization_id === user.organization_id;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      low: 'default',
      medium: 'warning',
      high: 'danger',
      urgent: 'danger',
    };
    return <Badge variant={variants[priority] || 'default'}>{priority}</Badge>;
  };

  // Filter organizations for assignment
  const filteredOrganizations = organizations.filter(org => {
    if (!org.is_active) return false;

    const matchesLocation = !assignFilterLocation ||
      org.locations_covered?.some(l => l.toLowerCase().includes(assignFilterLocation.toLowerCase()));

    const matchesSector = !assignFilterSector ||
      org.sectors_provided?.some(s => s.toLowerCase().includes(assignFilterSector.toLowerCase()));

    return matchesLocation && matchesSector;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <BackToDashboard />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Referrals</h1>
            <p className="text-gray-600 mt-1">
              {user?.role === 'admin' ? 'Manage all case referrals between authorities and organizations' : 'Manage your case referrals'}
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Referral
          </Button>
        </div>

        <Card>
          <DataTable
            data={referrals}
            columns={[
              {
                key: 'referral_number',
                label: 'Referral #',
              },
              {
                key: 'client_name',
                label: 'Client Name',
              },
              {
                key: 'referred_to',
                label: 'Referred To',
              },
              {
                key: 'category',
                label: 'Category',
                render: (r) => <span className="capitalize">{r.category}</span>,
              },
              {
                key: 'priority',
                label: 'Priority',
                render: (r) => getPriorityBadge(r.priority),
              },
              {
                key: 'status',
                label: 'Status',
                render: (r) => getStatusBadge(r.status),
              },
              {
                key: 'created_at',
                label: 'Created',
                render: (r) => new Date(r.created_at).toLocaleDateString(),
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (r) => (
                  <div className="flex gap-2">
                    {/* State Admin: Assign button for pending/unassigned referrals */}
                    {isStateAdmin && (r.status === 'pending' || r.can_be_reassigned) && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleAssignClick(r)}
                        title="Assign to Organization"
                      >
                        Assign
                      </Button>
                    )}
                    {/* Organization: Accept/Decline buttons for assigned referrals */}
                    {isOrganizationUser && isAssignedToMyOrg(r) && r.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAccept(r)}
                          title="Accept Referral"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeclineClick(r)}
                          title="Decline Referral"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </>
                    )}
                    {/* Edit/Delete for creator or admin */}
                    {(r.created_by === user?.id || isStateAdmin) && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(r)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(r.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </>
                    )}
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
              <div className="text-center py-12 text-gray-500">No referrals found</div>
            }
          />
        </Card>

        <Modal isOpen={showModal} onClose={handleCloseModal} title={editingReferral ? "Edit Referral" : "Create Referral"}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
              <p className="font-medium">Authority to Authority Referral</p>
              <p className="text-xs mt-1">Refer a client from your authority to another organization or service provider</p>
            </div>

            <Input
              label="Client Name"
              placeholder="Full name of the client"
              error={errors.client_name?.message}
              {...register('client_name', { required: 'Client name is required' })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Client Phone"
                placeholder="+1234567890"
                error={errors.client_phone?.message}
                {...register('client_phone', { required: 'Client phone is required' })}
              />

              <Input
                label="Client Email (Optional)"
                type="email"
                placeholder="client@example.com"
                error={errors.client_email?.message}
                {...register('client_email')}
              />
            </div>

            {isStateAdmin && editingReferral && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                <p className="font-medium">Note: Assignment</p>
                <p className="text-xs mt-1">Use the "Assign" button in the referrals list to assign this referral to an organization</p>
              </div>
            )}
            {!isStateAdmin && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                <p className="font-medium">Referral Submission</p>
                <p className="text-xs mt-1">This referral will be reviewed and assigned by a state-level administrator. You cannot directly assign providers.</p>
              </div>
            )}

            {isStateAdmin && (
              <Select
                label="Assigned Authority/Organization (Optional)"
                options={[
                  { value: '', label: 'Select Organization (Optional)' },
                  ...organizations
                    .filter(org => org.is_active)
                    .map(org => ({
                      value: org.id,
                      label: `${org.organization_name || org.name} (${org.type})`
                    }))
                ]}
                {...register('assigned_organization_id')}
              />
            )}

            <Select
              label="Category"
              options={[
                { value: 'protection', label: 'Protection' },
                { value: 'shelter', label: 'Shelter' },
                { value: 'food', label: 'Food Security' },
                { value: 'health', label: 'Health' },
                { value: 'nutrition', label: 'Nutrition' },
                { value: 'wash', label: 'WASH' },
                { value: 'education', label: 'Education' },
                { value: 'legal', label: 'Legal Assistance' },
                { value: 'psychosocial', label: 'Psychosocial Support (PSS)' },
                { value: 'livelihood', label: 'Livelihood' },
              ]}
              error={errors.category?.message}
              {...register('category', { required: 'Category is required' })}
            />

            <Select
              label="Priority"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
              error={errors.priority?.message}
              {...register('priority', { required: 'Priority is required' })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Referral <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Explain why this client needs to be referred to the selected authority"
                {...register('reason', { required: 'Reason is required' })}
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">External Notes</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Any additional information or special considerations"
                {...register('notes')}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={isSubmitting}>
                {editingReferral ? 'Update Referral' : 'Create Referral'}
              </Button>
              <Button type="button" variant="ghost" onClick={handleCloseModal}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* Decline Reason Modal */}
        <Modal isOpen={showDeclineModal} onClose={() => setShowDeclineModal(false)} title="Decline Referral">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please provide a reason for declining this referral. This information is required and will be used for reassignment.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decline Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Explain why this referral cannot be accepted..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleDecline} disabled={!declineReason.trim()}>
                Decline Referral
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowDeclineModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Assign Referral Modal (State Admin Only) */}
        {isStateAdmin && (
          <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Referral to Organization">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select an active organization to assign this referral. Only active organizations can be assigned.
              </p>

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
                <Input
                  label="Filter by Location"
                  placeholder="e.g. Lagos"
                  value={assignFilterLocation}
                  onChange={(e) => setAssignFilterLocation(e.target.value)}
                />
                <Input
                  label="Filter by Sector"
                  placeholder="e.g. Health"
                  value={assignFilterSector}
                  onChange={(e) => setAssignFilterSector(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                >
                  <option value="">Select Organization</option>
                  {filteredOrganizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.organization_name || org.name} - {org.type}
                      {org.sectors_provided && org.sectors_provided.length > 0 && ` (${org.sectors_provided.join(', ')})`}
                    </option>
                  ))}
                </select>
                {filteredOrganizations.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No matching active organizations found.</p>
                )}
              </div>
              {selectedReferral?.decline_reason && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                  <p className="font-medium">Previous Decline Reason:</p>
                  <p className="text-xs mt-1">{selectedReferral.decline_reason}</p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleAssign} disabled={!selectedOrgId}>
                  Assign Referral
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
};
