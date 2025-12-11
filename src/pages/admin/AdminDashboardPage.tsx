import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Users, Activity, Eye, FolderOpen, UserPlus, AlertCircle, FileCheck } from 'lucide-react';
import { MainLayout } from '../../layouts';
import { Card, Badge, Button, Modal } from '../../components/common';
import { DataTable } from '../../components/tables';
import { registrationsApi, casesApi, referralsApi, organizationsApi } from '../../api';
import { useAuth } from '../../hooks';
import { Registration, Case, Referral } from '../../types';
import { supabase } from '../../lib/supabase';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingRegistrations, setPendingRegistrations] = useState<Registration[]>([]);
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [pendingReferrals, setPendingReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'registrations' | 'cases' | 'referrals'>('registrations');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState('');

  const isAdmin = user?.role === 'admin' || user?.role === 'organization';
  const userOrganization = user?.organization_name;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }

    loadOrganizations();
    loadPendingItems();
  }, [user, navigate, isAdmin]);

  const loadOrganizations = async () => {
    try {
      const orgs = await organizationsApi.getOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    }
  };

  const loadPendingItems = async () => {
    try {
      setLoading(true);
      const [regs, cases, refs] = await Promise.all([
        registrationsApi.getRegistrations({ limit: 1000, page: 1 }),
        casesApi.getCases({ limit: 1000, page: 1 }),
        referralsApi.getReferrals({ limit: 1000, page: 1 }),
      ]);

      let filteredRegs = regs.data;
      let filteredCases = cases.data;
      let filteredRefs = refs.data;

      if (user?.role === 'admin') {
        filteredRegs = regs.data;
        filteredCases = cases.data;
        filteredRefs = refs.data;
      } else if (userOrganization && user?.role === 'organization') {
        const orgNameLower = userOrganization.toLowerCase();

        filteredRegs = regs.data.filter(r => {
          if (!r.assigned_organization) return true;
          return r.assigned_organization.toLowerCase() === orgNameLower ||
                 r.assigned_organization.toLowerCase().includes(orgNameLower) ||
                 orgNameLower.includes(r.assigned_organization.toLowerCase());
        });

        filteredCases = cases.data.filter(c => {
          if (!c.assigned_to) return true;
          return c.assigned_to.toLowerCase() === orgNameLower ||
                 c.assigned_to.toLowerCase().includes(orgNameLower) ||
                 orgNameLower.includes(c.assigned_to.toLowerCase());
        });

        filteredRefs = refs.data.filter(r => {
          if (!r.referred_to) return false;
          return r.referred_to.toLowerCase() === orgNameLower ||
                 r.referred_to.toLowerCase().includes(orgNameLower) ||
                 orgNameLower.includes(r.referred_to.toLowerCase());
        });
      }

      setPendingRegistrations(filteredRegs);
      setAllCases(filteredCases);
      setPendingReferrals(filteredRefs);
    } catch (error) {
      console.error('Failed to load pending items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, type: 'registration' | 'case' | 'referral') => {
    try {
      if (type === 'registration') {
        await supabase
          .from('registrations')
          .update({
            approval_status: 'approved',
            status: 'approved',
            approved_by: user?.id,
            approved_at: new Date().toISOString()
          })
          .eq('id', id);
      } else if (type === 'case') {
        // FIX: Case approval status is set to 'approved' but status is set to 'approved' (from cases.ts fix)
        await supabase
          .from('cases')
          .update({
            approval_status: 'approved',
            status: 'approved', // Use 'approved' status
            approved_by: user?.id,
            approved_at: new Date().toISOString()
          })
          .eq('id', id);
      } else {
        await supabase
          .from('referrals')
          .update({
            approval_status: 'approved',
            status: 'accepted',
            approved_by: user?.id,
            approved_at: new Date().toISOString()
          })
          .eq('id', id);
      }
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} approved successfully!`);
      loadPendingItems();
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('Failed to approve item');
    }
  };

  const handleReject = async () => {
    if (!selectedItem || !rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const { type, id } = selectedItem;

      if (type === 'registration') {
        await supabase
          .from('registrations')
          .update({
            approval_status: 'rejected',
            status: 'rejected',
            approved_by: user?.id,
            approved_at: new Date().toISOString(),
            rejection_reason: rejectReason
          })
          .eq('id', id);
      } else if (type === 'case') {
        await supabase
          .from('cases')
          .update({
            approval_status: 'rejected',
            status: 'closed',
            approved_by: user?.id,
            approved_at: new Date().toISOString(),
            rejection_reason: rejectReason
          })
          .eq('id', id);
      } else {
        await supabase
          .from('referrals')
          .update({
            approval_status: 'rejected',
            status: 'rejected',
            approved_by: user?.id,
            approved_at: new Date().toISOString(),
            rejection_reason: rejectReason
          })
          .eq('id', id);
      }

      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} rejected successfully!`);
      setShowRejectModal(false);
      setSelectedItem(null);
      setRejectReason('');
      loadPendingItems();
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('Failed to reject item');
    }
  };

  const handleAssignToOrg = async () => {
    if (!selectedItem || !selectedOrg) {
      alert('Please select an organization');
      return;
    }

    try {
      const { type, id } = selectedItem;

      if (type === 'registration') {
        await supabase
          .from('registrations')
          .update({
            assigned_organization: selectedOrg,
            assignment_date: new Date().toISOString()
          })
          .eq('id', id);
      } else if (type === 'case') {
        await supabase
          .from('cases')
          .update({
            assigned_to: selectedOrg,
            assigned_to_type: 'organization'
          })
          .eq('id', id);
      }

      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} assigned to ${selectedOrg} successfully!`);
      setShowAssignModal(false);
      setSelectedItem(null);
      setSelectedOrg('');
      loadPendingItems();
    } catch (error) {
      console.error('Failed to assign:', error);
      alert('Failed to assign item');
    }
  };

  const openRejectModal = (id: string, type: 'registration' | 'case' | 'referral') => {
    setSelectedItem({ id, type });
    setShowRejectModal(true);
  };

  const openAssignModal = (id: string, type: 'registration' | 'case') => {
    setSelectedItem({ id, type });
    setShowAssignModal(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      pending: 'warning',
      open: 'warning',
      approved: 'info', // Using 'info' for approved to differentiate from 'in_progress'
      in_progress: 'default',
      rejected: 'danger',
      closed: 'success', // Using success for closed (resolved) cases
      cancelled: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const stats = {
    pending: pendingRegistrations.filter(r => r.approval_status === 'pending').length,
    openCases: allCases.filter(c => c.status === 'open').length,
    // ADDED: New approved cases count for dashboard stat
    approvedCases: allCases.filter(c => c.status === 'approved').length,
    inProgress: allCases.filter(c => c.status === 'in_progress').length,
    pendingReferrals: pendingReferrals.filter(r => r.approval_status === 'pending').length,
    totalCases: allCases.length,
    closedCases: allCases.filter(c => c.status === 'closed').length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            {user?.role === 'admin' ? 'Admin Dashboard - All System Data' : userOrganization ? `${userOrganization} Dashboard` : 'Admin Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'admin'
              ? 'View and manage all user inputs across the entire system'
              : 'Monitor, approve, and manage activities for your organization'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/registrations?status=pending')} // Functional link for pending registrations
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Beneficiaries</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pending}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/cases?status=open')} // Functional link for open cases
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Cases</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.openCases}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </Card>
          
          {/* ADDED/FIXED: Card for Approved Cases with functional link */}
          <Card>
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/cases?status=approved')} // Functional link for approved cases
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Cases</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.approvedCases}</p>
                  <p className="text-xs text-gray-500 mt-1">Ready for work assignment</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/cases?status=in_progress')} // Functional link for in progress cases
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ongoing Cases</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
                  <p className="text-xs text-gray-500 mt-1">Active work in progress</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/cases?status=closed')} // Functional link for closed cases
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Closed Cases</p>
                  <p className="text-3xl font-bold text-gray-600 mt-2">{stats.closedCases}</p>
                  <p className="text-xs text-gray-500 mt-1">Of {stats.totalCases} total</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <FolderOpen className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {user?.role === 'admin' && (
          <div className="flex gap-3">
            <Button onClick={() => navigate('/registrations')}>
              <UserPlus className="w-4 h-4 mr-2" />
              Register Beneficiary
            </Button>
            <Button variant="secondary" onClick={() => navigate('/cases/create')}>
              Create Case
            </Button>
          </div>
        )}

        <div className="flex gap-4 border-b border-gray-200">
          {[
            { id: 'registrations' as const, label: 'Beneficiary Registrations', count: stats.pending },
            { id: 'cases' as const, label: 'All Cases', count: stats.totalCases },
            { id: 'referrals' as const, label: 'Referrals', count: stats.pendingReferrals },
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
                {
                  key: 'category',
                  label: 'Category',
                  render: (r) => (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded capitalize">
                      {r.category}
                    </span>
                  )
                },
                {
                  key: 'nationality',
                  label: 'Nationality',
                  render: (r) => r.nationality || 'N/A'
                },
                {
                  key: 'displacement_status',
                  label: 'Status',
                  render: (r) => r.displacement_status ? (
                    <span className="text-xs capitalize">{r.displacement_status}</span>
                  ) : 'N/A'
                },
                {
                  key: 'assigned_organization',
                  label: 'Assigned To',
                  render: (r) => r.assigned_organization ? (
                    <span className="text-xs font-medium text-blue-600">{r.assigned_organization}</span>
                  ) : <span className="text-xs text-gray-400">Unassigned</span>
                },
                {
                  key: 'approval_status',
                  label: 'Status',
                  render: (r) => getStatusBadge(r.approval_status || 'pending'),
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
                        onClick={() => navigate(`/registrations?view=${r.id}`)}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {r.approval_status === 'pending' && (
                        <>
                          {user?.role === 'admin' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openAssignModal(r.id, 'registration')}
                              title="Assign to Organization"
                            >
                              <Users className="w-4 h-4 text-blue-600" />
                            </Button>
                          )}
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
                            onClick={() => openRejectModal(r.id, 'registration')}
                          >
                            <XCircle className="w-4 h-4 mr-1 text-red-600" />
                            Reject
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
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No beneficiary registrations</p>
                </div>
              }
            />
          )}

          {activeTab === 'cases' && (
            <DataTable
              data={allCases}
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
                  label: 'Category',
                  render: (c) => (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded capitalize">
                      {c.category || 'N/A'}
                    </span>
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
                  key: 'assigned_to',
                  label: 'Assigned To',
                  render: (c) => c.assigned_to ? (
                    <span className="text-xs font-medium text-blue-600">{c.assigned_to}</span>
                  ) : <span className="text-xs text-gray-400">Unassigned</span>
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
                      {user?.role === 'admin' && !c.assigned_to && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openAssignModal(c.id, 'case')}
                          title="Assign to Organization"
                        >
                          <Users className="w-4 h-4 text-blue-600" />
                        </Button>
                      )}
                      {(c.status === 'open' || c.status === 'pending') && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleApprove(c.id, 'case')}
                            title="Approve & Start Working"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openRejectModal(c.id, 'case')}
                            title="Reject Case"
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
                { key: 'referral_number', label: 'Ref #' },
                { key: 'client_name', label: 'Client' },
                { key: 'referred_from', label: 'From' },
                { key: 'referred_to', label: 'To' },
                { key: 'category', label: 'Category' },
                {
                  key: 'priority',
                  label: 'Priority',
                  render: (r) => {
                    const colors: Record<string, string> = {
                      low: 'bg-gray-100 text-gray-700',
                      medium: 'bg-yellow-100 text-yellow-700',
                      high: 'bg-orange-100 text-orange-700',
                      urgent: 'bg-red-100 text-red-700',
                    };
                    return (
                      <span className={`px-2 py-1 text-xs font-semibold rounded uppercase ${colors[r.priority || 'medium'] || 'bg-gray-100 text-gray-700'}`}>
                        {r.priority || 'medium'}
                      </span>
                    );
                  }
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
                      {r.approval_status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleApprove(r.id, 'referral')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openRejectModal(r.id, 'referral')}
                          >
                            <XCircle className="w-4 h-4 mr-1 text-red-600" />
                            Reject
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
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No referrals</p>
                </div>
              }
            />
          )}
        </Card>
      </div>

      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedItem(null);
          setRejectReason('');
        }}
        title="Reject Item"
      >
        <div className="space-y-4 p-4">
          <p className="text-sm text-gray-600">
            Please provide a reason for rejecting this item. This will be recorded and visible to relevant parties.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Enter detailed rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setShowRejectModal(false);
                setSelectedItem(null);
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedItem(null);
          setSelectedOrg('');
        }}
        title="Assign to Organization"
      >
        <div className="space-y-4 p-4">
          <p className="text-sm text-gray-600">
            Select an organization to assign this item to. The organization will receive full access to manage this case.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
            >
              <option value="">Select organization...</option>
              <optgroup label="Registered Organizations">
                {organizations.map((org) => (
                  <option key={org.id} value={org.name}>
                    {org.name} - {org.type}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Default Organizations">
                <option value="MyIT Consult Ltd">MyIT Consult Ltd</option>
                <option value="NCRFMI">NCRFMI</option>
              </optgroup>
            </select>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setShowAssignModal(false);
                setSelectedItem(null);
                setSelectedOrg('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignToOrg}
              disabled={!selectedOrg}
            >
              Assign Organization
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};