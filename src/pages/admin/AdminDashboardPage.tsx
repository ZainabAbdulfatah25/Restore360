import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Users, Activity, Eye, FolderOpen } from 'lucide-react';
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
        registrationsApi.getRegistrations({ status: 'pending', limit: 100, page: 1 }),
        casesApi.getCases({ limit: 100, page: 1 }),
        referralsApi.getReferrals({ status: 'pending', limit: 100, page: 1 }),
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor, approve, and manage all system activities</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Cases</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{pendingCases.length}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {pendingCases.filter(c => c.status === 'open').length} open
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FolderOpen className="w-6 h-6 text-blue-600" />
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
            { id: 'registrations' as const, label: 'Pending Registrations', count: pendingRegistrations.length },
            { id: 'cases' as const, label: 'All Cases', count: pendingCases.length },
            { id: 'referrals' as const, label: 'Pending Referrals', count: pendingReferrals.length },
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
                {
                  key: 'case_number',
                  label: 'Case #',
                  render: (c) => (
                    <span className="font-mono text-sm font-medium text-gray-900">{c.case_number}</span>
                  ),
                },
                {
                  key: 'title',
                  label: 'Title',
                  render: (c) => (
                    <div>
                      <p className="font-medium text-gray-900">{c.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{c.description}</p>
                    </div>
                  ),
                },
                {
                  key: 'category',
                  label: 'Categories',
                  render: (c) => (
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(c.category) ? (
                        c.category.map((cat, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded capitalize">
                            {cat}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded capitalize">
                          {c.category || 'N/A'}
                        </span>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'priority',
                  label: 'Priority',
                  render: (c) => {
                    const colors: Record<string, string> = {
                      low: 'bg-gray-100 text-gray-700',
                      medium: 'bg-yellow-100 text-yellow-700',
                      high: 'bg-orange-100 text-orange-700',
                      urgent: 'bg-red-100 text-red-700',
                    };
                    return (
                      <span className={`px-2 py-1 text-xs font-semibold rounded uppercase ${colors[c.priority] || 'bg-gray-100 text-gray-700'}`}>
                        {c.priority}
                      </span>
                    );
                  },
                },
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
                        onClick={() => navigate(`/cases/${c.id}`)}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {c.status === 'open' && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleApprove(c.id, 'case')}
                            title="Start Working"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReject(c.id, 'case')}
                            title="Close Case"
                          >
                            <XCircle className="w-4 h-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  ),
                },
              ]}
              loading={loading}
              emptyState={
                <div className="text-center py-12 text-gray-500">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No cases to display</p>
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
