import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { MainLayout } from '../../layouts';
import { Card, Button, Input, Badge } from '../../components/common';
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
      case_worker: 'success',
      field_officer: 'warning',
      viewer: 'default',
    };
    return <Badge variant={variants[role] || 'default'}>{role}</Badge>;
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
    </MainLayout>
  );
};
