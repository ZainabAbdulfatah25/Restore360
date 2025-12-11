import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { MainLayout } from '../../layouts';
import { Card, Button, Input, Badge, Modal } from '../../components/common';
import { DataTable } from '../../components/tables';
import { useActivityLogger } from '../../hooks';
import { usersApi } from '../../api';
import { User } from '../../types';

export const UsersListPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { track } = useActivityLogger();

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getUsers({ page: currentPage, limit: 10 });
      setUsers(response.data);
      setTotalPages(response.total_pages);
      await track('view', 'users', 'Viewed users list');
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      admin: 'danger',
      organization: 'warning',
      case_manager: 'success',
      field_worker: 'success',
      viewer: 'default',
    };
    return <Badge variant={variants[role] || 'default'}>{role.replace('_', ' ')}</Badge>;
  };

  const handleDeleteClick = (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      await usersApi.deleteUser(userToDelete.id);
      await track('delete', 'users', `Deleted user: ${userToDelete.name}`, { user_id: userToDelete.id });
      setDeleteModalOpen(false);
      setUserToDelete(null);
      await loadUsers();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      const errorMessage = error?.message || 'Failed to delete user. Please try again.';
      alert(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/users/${userId}/edit`);
  };

  const handleViewClick = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/users/${userId}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-1">Manage system users and permissions</p>
          </div>
          <Button onClick={() => navigate('/users/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        <Card>
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <DataTable
            data={filteredUsers}
            columns={[
              {
                key: 'name',
                label: 'Name',
              },
              {
                key: 'email',
                label: 'Email',
              },
              {
                key: 'role',
                label: 'Role',
                render: (user) => getRoleBadge(user.role),
              },
              {
                key: 'department',
                label: 'Department',
                render: (user) => user.department || '-',
              },
              {
                key: 'status',
                label: 'Status',
                render: (user) => (
                  <Badge variant={user.status === 'active' ? 'success' : 'default'}>
                    {user.status}
                  </Badge>
                ),
              },
              {
                key: 'created_at',
                label: 'Created',
                render: (user) => new Date(user.created_at).toLocaleDateString(),
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (user) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleViewClick(user.id, e)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleEditClick(user.id, e)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit User"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(user, e)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
            onRowClick={(user) => navigate(`/users/${user.id}`)}
            emptyState={
              <div className="text-center py-12 text-gray-500">No users found</div>
            }
          />
        </Card>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setUserToDelete(null);
          }
        }}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteModalOpen(false);
                setUserToDelete(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={deleting}
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};
