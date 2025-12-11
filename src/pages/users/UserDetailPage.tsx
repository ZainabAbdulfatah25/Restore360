import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';
import { MainLayout } from '../../layouts';
import { Card, Button, Badge, Spinner } from '../../components/common';
import { useActivityLogger } from '../../hooks';
import { usersApi } from '../../api';
import { User } from '../../types';

export const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { track } = useActivityLogger();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadUser(id);
    }
  }, [id]);

  const loadUser = async (userId: string) => {
    try {
      const data = await usersApi.getUser(userId);
      setUser(data);
      await track('view', 'users', `Viewed user: ${data.name}`, { user_id: userId });
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !id) return;
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;

    try {
      await usersApi.deleteUser(id);
      await track('delete', 'users', `Deleted user: ${user.name}`, { user_id: id });
      navigate('/users');
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      const errorMessage = error?.message || 'Failed to delete user. Please try again.';
      alert(errorMessage);
    }
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

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">User not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/users')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate(`/users/${id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="User Information" className="lg:col-span-2">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900 mt-1">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 mt-1">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900 mt-1">{user.phone || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <p className="text-gray-900 mt-1 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-900 mt-1">{user.department || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge variant={user.status === 'active' ? 'success' : 'default'}>
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {user.description && (
                <div className="pt-4 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900 mt-2 whitespace-pre-line">{user.description}</p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Account Details">
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900 mt-1">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900 mt-1">
                  {new Date(user.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="text-gray-900 mt-1 text-xs font-mono">{user.id}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
