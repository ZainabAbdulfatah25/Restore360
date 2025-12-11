import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2 } from 'lucide-react';
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
  referred_to: string;
  reason: string;
  category: string;
  priority: string;
  notes?: string;
}

export const ReferralsPage = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { track } = useActivityLogger();
  const { user } = useAuth();

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
      if (editingReferral) {
        await referralsApi.updateReferral(editingReferral.id, data);
        await track('update', 'referrals', `Updated referral to ${data.referred_to}`, {
          referral_id: editingReferral.id,
          referral_number: editingReferral.referral_number,
          client_name: data.client_name,
          referred_to: data.referred_to,
          category: data.category,
          priority: data.priority
        });
      } else {
        const newReferral = await referralsApi.createReferral(data);
        await track('create', 'referrals', `Created referral to ${data.referred_to}`, {
          referral_id: newReferral.id,
          referral_number: newReferral.referral_number,
          client_name: data.client_name,
          referred_to: data.referred_to,
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

  const handleEdit = (referral: Referral) => {
    setEditingReferral(referral);
    reset({
      client_name: referral.client_name,
      client_phone: referral.client_phone,
      client_email: referral.client_email || '',
      referred_to: referral.referred_to,
      reason: referral.reason,
      category: referral.category,
      priority: referral.priority,
      notes: referral.notes || '',
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
      in_progress: 'info',
      completed: 'success',
      cancelled: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refer To Authority/Organization <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('referred_to', { required: 'Please select an authority' })}
              >
                <option value="">Select Authority/Organization</option>
                <optgroup label="Organizations">
                  {organizations.map((org) => (
                    <option key={org.id} value={org.name}>
                      {org.name} - {org.type}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Government Agencies">
                  <option value="Ministry of Health">Ministry of Health</option>
                  <option value="Ministry of Education">Ministry of Education</option>
                  <option value="Social Services Department">Social Services Department</option>
                  <option value="Child Protection Services">Child Protection Services</option>
                  <option value="Immigration Services">Immigration Services</option>
                </optgroup>
                <optgroup label="International Organizations">
                  <option value="UNHCR">UNHCR</option>
                  <option value="UNICEF">UNICEF</option>
                  <option value="WFP">World Food Programme</option>
                  <option value="WHO">World Health Organization</option>
                  <option value="IOM">International Organization for Migration</option>
                </optgroup>
              </select>
              {errors.referred_to && (
                <p className="mt-1 text-sm text-red-600">{errors.referred_to.message}</p>
              )}
            </div>

            <Select
              label="Category"
              options={[
                { value: 'protection', label: 'Protection' },
                { value: 'shelter', label: 'Shelter' },
                { value: 'food', label: 'Food Security' },
                { value: 'health', label: 'Health' },
                { value: 'education', label: 'Education' },
                { value: 'legal', label: 'Legal Assistance' },
                { value: 'psychosocial', label: 'Psychosocial Support' },
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
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
      </div>
    </MainLayout>
  );
};
