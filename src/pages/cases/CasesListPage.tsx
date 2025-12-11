import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { MainLayout } from '../../layouts';
import { Card, Button, Input, Badge, Select, BackToDashboard } from '../../components/common';
import { useActivityLogger, useAuth } from '../../hooks';
import { casesApi } from '../../api';
import { Case } from '../../types';
import { supabase } from '../../lib/supabase';

export const CasesListPage = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { track } = useActivityLogger();
  const { user } = useAuth();

  useEffect(() => {
    // FIX: Read status filter from URL params if available (handles dashboard clicks)
    const urlParams = new URLSearchParams(window.location.search);
    const initialStatus = urlParams.get('status') || '';
    if (initialStatus && initialStatus !== statusFilter) {
      setStatusFilter(initialStatus);
    }
    
    // Original load cases logic remains the same
    loadCases();

    const channel = supabase
      .channel('cases-list-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => {
        loadCases();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentPage, statusFilter, categoryFilter, priorityFilter]); // statusFilter added to dependency array

  const loadCases = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (priorityFilter) params.priority = priorityFilter;

      if (user?.role !== 'admin') {
        params.filterByUser = true;
      }

      const response = await casesApi.getCases(params);
      setCases(response.data);
      setTotalPages(response.total_pages);
      await track('view', 'cases', 'Viewed cases list');
    } catch (error) {
      console.error('Failed to load cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case?')) return;

    try {
      await casesApi.deleteCase(id);
      await track('delete', 'cases', 'Deleted case');
      loadCases();
    } catch (error) {
      console.error('Failed to delete case:', error);
      alert('Failed to delete case');
    }
  };

  const canEdit = (caseItem: Case) => {
    return user?.id === caseItem.created_by || user?.role === 'admin' || user?.role === 'case_worker';
  };

  const filteredCases = cases.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.case_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
      open: 'warning',
      approved: 'success', // <--- FIX: Added approved status with a success badge
      in_progress: 'info',
      closed: 'default',
      pending: 'warning',
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

  // Handler to update the filter and navigation bar
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset to page 1 on filter change
    navigate(newStatus ? `/cases?status=${newStatus}` : '/cases'); // Update URL
  };


  return (
    <MainLayout>
      <div className="space-y-6">
        <BackToDashboard />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cases</h1>
            <p className="text-gray-600 mt-1">
              {user?.role === 'admin' ? 'Manage and track all cases' : 'Manage and track your cases'}
            </p>
          </div>
          <Button onClick={() => navigate('/cases/create')}>
            <Plus className="w-4 h-4 mr-2" />
            New Case
          </Button>
        </div>

        <Card>
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'open', label: 'Open' },
                  { value: 'approved', label: 'Approved' }, // <--- FIX: Added approved status
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'closed', label: 'Closed' },
                  { value: 'pending', label: 'Pending' },
                ]}
                value={statusFilter}
                onChange={handleStatusFilterChange} // Use the new handler
              />
              <Select
                options={[
                  { value: '', label: 'All Categories' },
                  { value: 'shelter', label: 'Shelter' },
                  { value: 'food', label: 'Food Security' },
                  { value: 'health', label: 'Health' },
                  { value: 'protection', label: 'Protection' },
                  { value: 'education', label: 'Education' },
                  { value: 'wash', label: 'WASH' },
                ]}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              />
              <Select
                options={[
                  { value: '', label: 'All Priorities' },
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                    </td>
                  </tr>
                ) : filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No cases found</td>
                  </tr>
                ) : (
                  filteredCases.map((c) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        c.priority === 'urgent' ? 'bg-red-50 hover:bg-red-100 border-l-4 border-red-600' : ''
                      }`}
                      onClick={() => navigate(`/cases/${c.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {c.priority === 'urgent' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                          <span className="text-sm font-medium text-gray-900">{c.case_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{c.title}</div>
                        {c.priority === 'urgent' && (
                          <div className="text-xs text-red-600 font-medium mt-1">URGENT ATTENTION REQUIRED</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">{c.category || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(c.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getPriorityBadge(c.priority)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {canEdit(c) && (
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="secondary" onClick={() => navigate(`/cases/${c.id}/edit`)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};