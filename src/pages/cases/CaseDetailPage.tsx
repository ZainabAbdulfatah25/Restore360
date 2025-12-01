import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, Trash2, ArrowLeft, MapPin, AlertTriangle } from 'lucide-react';
import { MainLayout } from '../../layouts';
import { Card, Button, Badge, Spinner, BackToDashboard } from '../../components/common';
import { useActivityLogger, useAuth } from '../../hooks';
import { casesApi } from '../../api';
import { Case } from '../../types';

export const CaseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { track } = useActivityLogger();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCase(id);
    }
  }, [id]);

  const loadCase = async (caseId: string) => {
    try {
      const data = await casesApi.getCase(caseId);
      setCaseData(data);
      await track('view', 'cases', `Viewed case: ${data.title}`, { case_id: caseId });
    } catch (error) {
      console.error('Failed to load case:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!caseData || !id) return;
    if (!confirm(`Are you sure you want to delete case ${caseData.case_number}?\n\nThis action cannot be undone.`)) return;

    try {
      await casesApi.deleteCase(id);
      await track('delete', 'cases', `Deleted case: ${caseData.title}`, { case_id: id });
      navigate('/cases');
    } catch (error) {
      console.error('Failed to delete case:', error);
      alert('Failed to delete case. You may not have permission to delete this case.');
    }
  };

  const canEdit = () => {
    if (!user || !caseData) return false;
    return user.id === caseData.created_by || user.role === 'admin';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
      open: 'warning',
      in_progress: 'info',
      closed: 'default',
      pending: 'warning',
    };
    return variants[status] || 'default';
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      low: 'default',
      medium: 'warning',
      high: 'danger',
      urgent: 'danger',
    };
    return variants[priority] || 'default';
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

  if (!caseData) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Case not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <BackToDashboard />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/cases')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{caseData.case_number}</h1>
                <Badge variant={getStatusBadge(caseData.status)}>
                  {caseData.status}
                </Badge>
                {caseData.priority === 'urgent' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium">
                    <AlertTriangle className="w-4 h-4" />
                    URGENT
                  </div>
                )}
              </div>
              <p className="text-gray-600 mt-1">{caseData.title}</p>
            </div>
          </div>
          {canEdit() && (
            <div className="flex gap-2">
              <Button onClick={() => navigate(`/cases/${id}/edit`)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Case Details" className="lg:col-span-2">
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900 mt-1">{caseData.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-gray-900 mt-1 capitalize">{caseData.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <div className="mt-1">
                    <Badge variant={getPriorityBadge(caseData.priority)}>
                      {caseData.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned To</label>
                  <p className="text-gray-900 mt-1">
                    {caseData.assigned_to || 'Unassigned'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(caseData.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {caseData.location && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <p className="text-gray-900 mt-1">
                    {caseData.location.address || `${caseData.location.latitude}, ${caseData.location.longitude}`}
                  </p>
                </div>
              )}
              {caseData.tags && caseData.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {caseData.tags.map((tag, index) => (
                      <Badge key={index}>{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Case Information">
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Case Number</label>
                <p className="text-gray-900 mt-1 font-mono">{caseData.case_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900 mt-1">
                  {new Date(caseData.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Case ID</label>
                <p className="text-gray-900 mt-1 text-xs font-mono break-all">{caseData.id}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
