import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Users, Activity } from 'lucide-react';
import { MainLayout } from '../../layouts';
import { Card, Badge, Button } from '../../components/common';
import { DataTable } from '../../components/tables';
import { registrationsApi, casesApi, referralsApi } from '../../api';
import { useAuth } from '../../hooks';
import { Registration, Case, Referral } from '../../types';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingRegistrations, setPendingRegistrations] = useState<Registration[]>([]);
  const [pendingCases, setPendingCases] = useState<Case[]>([]);
  const [pendingReferrals, setPendingReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'registrations' | 'cases' | 'referrals'>('registrations');

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'case_worker') {
      navigate('/dashboard');
      return;
    }
    loadPendingItems();
  }, [user, navigate]);

  const loadPendingItems = async () => {
    try {
      setLoading(true);
      const [regs, cases, refs] = await Promise.all([
        registrationsApi.getRegistrations({ status: 'pending', limit: 50, page: 1 }),
        casesApi.getCases({ status: 'open', limit: 50, page: 1 }),
        referralsApi.getReferrals({ status: 'pending', limit: 50, page: 1 }),
      ]);
      setPendingRegistrations(regs.data);
      setPendingCases(cases.data);
      setPendingReferrals(refs.data);
    } catch (error) {
      console.error('Failed to load pending items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, type: 'registration' | 'case' | 'referral') => {
    try {
      if (type === 'registration') {
        await registrationsApi.updateStatus(id, 'approved');
      } else if (type === 'case') {
        await casesApi.updateStatus(id, 'in_progress');
      } else {
        await referralsApi.updateStatus(id, 'accepted');
      }
      loadPendingItems();
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('Failed to approve item');
    }
  };

  const handleReject = async (id: string, type: 'registration' | 'case' | 'referral') => {
    try {
      if (type === 'registration') {
        await registrationsApi.updateStatus(id, 'rejected');
      } else if (type === 'case') {
        await casesApi.updateStatus(id, 'closed');
      } else {
        await referralsApi.updateStatus(id, 'rejected');
      }
      loadPendingItems();
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('Failed to reject item');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      pending: 'warning',
      open: 'warning',
      approved: 'success',
      in_progress: 'default',
      rejected: 'danger',
      closed: 'danger',
      cancelled: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Review and approve pending submissions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Registrations</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{pendingRegistrations.length}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Cases</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{pendingCases.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Referrals</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{pendingReferrals.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex gap-4 border-b border-gray-200">
          {[
            { id: 'registrations' as const, label: 'Registrations', count: pendingRegistrations.length },
            { id: 'cases' as const, label: 'Cases', count: pendingCases.length },
            { id: 'referrals' as const, label: 'Referrals', count: pendingReferrals.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <Card>
          {activeTab === 'registrations' && (
            <DataTable
              data={pendingRegistrations}
              columns={[
                { key: 'full_name', label: 'Name' },
                { key: 'phone', label: 'Phone' },
                { key: 'category', label: 'Category' },
                {
                  key: 'status',
                  label: 'Status',
                  render: (r) => getStatusBadge(r.status),
                },
                {
                  key: 'created_at',
                  label: 'Submitted',
                  render: (r) => new Date(r.created_at).toLocaleDateString(),
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (r) => (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleApprove(r.id, 'registration')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReject(r.id, 'registration')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  ),
                },
              ]}
              loading={loading}
              emptyState={
                <div className="text-center py-12 text-gray-500">
                  No pending registrations
                </div>
              }
            />
          )}

          {activeTab === 'cases' && (
            <DataTable
              data={pendingCases}
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'category', label: 'Category' },
                { key: 'priority', label: 'Priority' },
                {
                  key: 'status',
                  label: 'Status',
                  render: (c) => getStatusBadge(c.status),
                },
                {
                  key: 'created_at',
                  label: 'Created',
                  render: (c) => new Date(c.created_at).toLocaleDateString(),
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (c) => (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleApprove(c.id, 'case')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReject(c.id, 'case')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Close
                      </Button>
                    </div>
                  ),
                },
              ]}
              loading={loading}
              emptyState={
                <div className="text-center py-12 text-gray-500">
                  No open cases
                </div>
              }
            />
          )}

          {activeTab === 'referrals' && (
            <DataTable
              data={pendingReferrals}
              columns={[
                { key: 'client_name', label: 'Client' },
                { key: 'referred_to', label: 'Referred To' },
                { key: 'category', label: 'Category' },
                { key: 'priority', label: 'Priority' },
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
                        variant="secondary"
                        onClick={() => handleApprove(r.id, 'referral')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Process
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReject(r.id, 'referral')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  ),
                },
              ]}
              loading={loading}
              emptyState={
                <div className="text-center py-12 text-gray-500">
                  No pending referrals
                </div>
              }
            />
          )}
        </Card>
      </div>
    </MainLayout>
  );
};
