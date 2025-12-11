import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Case } from '../../types';
import { casesApi } from '../../api';
import { MainLayout } from '../../layouts';
// REMOVED BackToDashboard from imports
import { Card, Spinner, Button, Badge, Select } from '../../components/common'; 
import { Edit, Trash2, Clock, CheckCircle, ArrowLeft } from 'lucide-react'; // Added ArrowLeft for the back button
import { useAuth, useActivityLogger } from '../../hooks';
import { supabase } from '../../lib/supabase';

export const CaseDetailPage = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const { user } = useAuth();
  const { track } = useActivityLogger();

  const [caseDetail, setCaseDetail] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<Case['status']>('open'); // State for the status dropdown

  useEffect(() => {
    if (id) {
      loadCaseDetails(id);
    } else {
      navigate('/cases');
    }

    const channel = supabase
      .channel(`case-${id}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases', filter: `id=eq.${id}` }, () => {
        if (id) loadCaseDetails(id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, navigate]);

  const loadCaseDetails = async (caseId: string) => {
    try {
      setLoading(true);
      const data = await casesApi.getCase(caseId);
      setCaseDetail(data);
      setNewStatus(data.status); // Initialize dropdown with current status
      await track('view', 'case', `Viewed case details for ${data.case_number}`);
    } catch (err) {
      console.error('Failed to load case details:', err);
      setError('Failed to load case details. You may not have permission.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!caseDetail || !confirm(`Are you sure you want to delete Case ${caseDetail.case_number}?`)) return;

    try {
      await casesApi.deleteCase(caseDetail.id);
      await track('delete', 'case', `Deleted case ${caseDetail.case_number}`);
      alert('Case deleted successfully.');
      navigate('/cases');
    } catch (err) {
      console.error('Failed to delete case:', err);
      alert('Failed to delete case.');
    }
  };

  const handleApprove = async () => {
    if (!caseDetail || !confirm(`Approve Case ${caseDetail.case_number}? This will set the status to 'approved'.`)) return;
    try {
      const updatedCase = await casesApi.approveCase(caseDetail.id);
      setCaseDetail(updatedCase);
      setNewStatus(updatedCase.status);
      await track('update', 'case', `Approved case ${caseDetail.case_number}`);
      alert('Case approved successfully.');
    } catch (err) {
      console.error('Failed to approve case:', err);
      alert('Failed to approve case.');
    }
  };

  const handleStatusUpdate = async () => {
    if (!caseDetail || newStatus === caseDetail.status) return;

    if (!confirm(`Are you sure you want to change the status of Case ${caseDetail.case_number} to '${newStatus}'?`)) return;

    try {
      // NOTE: For 'closed' status, you might want to add logic for required resolution notes later.
      const updatedCase = await casesApi.updateStatus(caseDetail.id, newStatus);
      setCaseDetail(updatedCase);
      await track('update', 'case', `Changed status of case ${caseDetail.case_number} to ${newStatus}`);
      alert(`Case status updated to '${newStatus}' successfully.`);
    } catch (err) {
      console.error('Failed to update case status:', err);
      alert('Failed to update case status.');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
      open: 'warning',
      pending: 'warning',
      approved: 'info',
      in_progress: 'default',
      closed: 'success',
      rejected: 'danger',
    };
    return <Badge variant={variants[status] || 'default'} className="capitalize">{status}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'urgent' || priority === 'high') return 'text-red-600';
    if (priority === 'medium') return 'text-orange-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Card title="Error">
          <p className="text-red-600 p-4">{error}</p>
          <Button onClick={() => navigate('/cases')}>Back to Cases</Button>
        </Card>
      </MainLayout>
    );
  }
  
  if (!caseDetail) {
    return (
      <MainLayout>
        <Card title="Case Not Found">
          <p className="text-gray-600 p-4">The requested case could not be found.</p>
          <Button onClick={() => navigate('/cases')}>Back to Cases</Button>
        </Card>
      </MainLayout>
    );
  }

  const isEditable = user?.role === 'admin' || user?.role === 'case_worker' || user?.id === caseDetail.created_by;
  const isAdminOrCaseWorker = user?.role === 'admin' || user?.role === 'case_worker';
  const isPendingOrOpen = caseDetail.status === 'open' || caseDetail.status === 'pending';
  const isApprovedOrInProgress = caseDetail.status === 'approved' || caseDetail.status === 'in_progress';
  const isClosed = caseDetail.status === 'closed';

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* REPLACED BackToDashboard with a dedicated Back to Cases button */}
        <Button 
          onClick={() => navigate('/cases')} 
          variant="ghost" 
          size="sm"
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Cases List
        </Button>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Case Details: {caseDetail.case_number}
          </h1>
          <div className="flex gap-3">
            {isEditable && !isClosed && (
              <Button onClick={() => navigate(`/cases/edit/${caseDetail.id}`)} variant="secondary">
                <Edit className="w-4 h-4 mr-2" />
                Edit Case
              </Button>
            )}
            {user?.role === 'admin' && ( // Only Admins can fully delete
              <Button onClick={handleDelete} variant="danger">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Case
              </Button>
            )}
          </div>
        </div>
        
        {/* Status & Priority Section */}
        <Card className={`border-l-4 p-4 ${isClosed ? 'border-success-500' : caseDetail.status === 'approved' ? 'border-info-500' : caseDetail.status === 'in_progress' ? 'border-primary-500' : 'border-warning-500'}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">Case Workflow Management</h3>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Column 1: Current Status & Priority */}
            <div>
              <p className="text-sm font-medium text-gray-500">Current Status</p>
              {getStatusBadge(caseDetail.status)}
            </div>

            {/* Column 2: Status Action (Approve) */}
            <div>
              <p className="text-sm font-medium text-gray-500">Quick Actions</p>
              {isPendingOrOpen && isAdminOrCaseWorker ? (
                <Button onClick={handleApprove} size="sm" className="mt-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Case
                </Button>
              ) : isClosed ? (
                <Badge variant="success" className="mt-1">Resolved</Badge>
              ) : (
                <Badge variant="default" className="mt-1">Awaiting Progress</Badge>
              )}
            </div>

            {/* Column 3: Status Changer (For Active Cases) */}
            {isApprovedOrInProgress && isAdminOrCaseWorker && (
              <div>
                <p className="text-sm font-medium text-gray-500">Update Status</p>
                <div className="flex gap-2 items-end mt-1">
                  <Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as Case['status'])}
                    options={[
                      { value: 'approved', label: 'Approved (Ready)' },
                      { value: 'in_progress', label: 'In Progress' },
                      { value: 'closed', label: 'Closed (Resolved)' }, // Option to close the case
                    ]}
                    className="w-full"
                  />
                  <Button 
                    onClick={handleStatusUpdate} 
                    size="sm" 
                    disabled={newStatus === caseDetail.status || !isApprovedOrInProgress}
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}

          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Priority Level</p>
            <p className={`font-semibold capitalize ${getPriorityColor(caseDetail.priority)}`}>
              {caseDetail.priority}
            </p>
          </div>
        </Card>


        {/* Core Case Information */}
        <Card title="Case Information" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Case Title</p>
              <p className="font-medium text-gray-900">{caseDetail.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Category / Sector</p>
              <p className="font-medium text-gray-900 capitalize">{caseDetail.category}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Client/Beneficiary ID</p>
              <p className="font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => navigate(`/registrations?view=${caseDetail.registration_id}`)}>
                {caseDetail.registration_id}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Assigned To (User/Org)</p>
              <p className="font-medium text-gray-900">{caseDetail.assigned_to || 'Unassigned'}</p>
            </div>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="text-gray-700 whitespace-pre-wrap">{caseDetail.description}</p>
          </div>
        </Card>

        {/* Timeline/Activity Section (Placeholder) */}
        <Card title="Case Timeline & Activity">
          <p className="text-gray-600">Timeline and activity logs will be displayed here.</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Created on: {new Date(caseDetail.created_at).toLocaleDateString()}</span>
          </div>
        </Card>

      </div>
    </MainLayout>
  );
};