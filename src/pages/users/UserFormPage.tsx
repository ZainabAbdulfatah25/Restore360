import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MainLayout } from '../../layouts';
import { Card, Button, Input, Select } from '../../components/common';
import { useActivityLogger, useAuth } from '../../hooks';
import { usersApi } from '../../api';
import { User } from '../../types';

type UserFormData = Omit<User, 'id' | 'created_at' | 'updated_at'>;

export const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { track } = useActivityLogger();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!id;
  const isAdmin = currentUser?.role === 'admin';
  const isOrgAdmin = currentUser?.role === 'organization' || currentUser?.role === 'manager';

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>();

  useEffect(() => {
    if (isEdit && id) {
      loadUser(id);
    } else if (isOrgAdmin && currentUser) {
      // Auto-fill organization details for new users created by Org Admin
      setValue('organization_name', currentUser.organization_name);
      setValue('organization_type', currentUser.organization_type);
      setValue('organization_id', currentUser.organization_id);
    }
  }, [id, isEdit, isOrgAdmin, currentUser, setValue]);

  const loadUser = async (userId: string) => {
    try {
      setLoading(true);
      const user = await usersApi.getUser(userId);
      reset(user);
    } catch (error) {
      console.error('Failed to load user:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setError('');

      // Enforce organization details for Org Admin
      if (isOrgAdmin && currentUser) {
        data.organization_name = currentUser.organization_name;
        data.organization_type = currentUser.organization_type;
        data.organization_id = currentUser.organization_id;
      }

      if (isEdit && id) {
        await usersApi.updateUser(id, data);
        await track('update', 'users', `Updated user: ${data.name}`, { user_id: id });
      } else {
        await usersApi.createUser(data);
        await track('create', 'users', `Created user: ${data.name}`);
      }
      navigate('/users');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };

  const getRoleOptions = () => {
    if (isAdmin) {
      return [
        { value: 'admin', label: 'Admin' },
        { value: 'state_admin', label: 'State Admin' },
        { value: 'organization', label: 'Organization Account' },
        { value: 'case_worker', label: 'Case Worker' },
        { value: 'field_officer', label: 'Field Officer' },
        { value: 'viewer', label: 'Viewer' },
      ];
    }

    if (isOrgAdmin) {
      return [
        { value: 'manager', label: 'Manager' },
        { value: 'field_worker', label: 'Field Worker' },
        { value: 'ordinary_user', label: 'Ordinary User' },
      ];
    }

    return [];
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit User' : 'Create User'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update user information' : 'Add a new user to the system'}
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />

            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />

            <Input
              label="Phone"
              type="tel"
              placeholder="+1234567890"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Select
              label="Role"
              options={getRoleOptions()}
              error={errors.role?.message}
              {...register('role', { required: 'Role is required' })}
            />
            {!isAdmin && !isOrgAdmin && (
              <p className="text-sm text-gray-500 -mt-2">
                You do not have permission to create users.
              </p>
            )}

            <Input
              label="Department"
              placeholder="IT, HR, Operations, etc."
              error={errors.department?.message}
              {...register('department')}
            />

            {/* Organization fields - hidden or read-only for Org Admins */}
            {(isAdmin || (isOrgAdmin && !isEdit)) && (
              <>
                <Input
                  label="Organization Name"
                  placeholder="e.g., UNHCR, Red Cross, etc."
                  error={errors.organization_name?.message}
                  {...register('organization_name')}
                  disabled={isOrgAdmin}
                  className={isOrgAdmin ? 'bg-gray-100' : ''}
                />

                <Select
                  label="Organization Type"
                  options={[
                    { value: '', label: 'Select type...' },
                    { value: 'ngo', label: 'NGO' },
                    { value: 'government', label: 'Government' },
                    { value: 'un_agency', label: 'UN Agency' },
                    { value: 'private', label: 'Private' },
                  ]}
                  error={errors.organization_type?.message}
                  {...register('organization_type')}
                  disabled={isOrgAdmin}
                  className={isOrgAdmin ? 'bg-gray-100' : ''}
                />
              </>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                placeholder="Add notes or description about this user..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={isSubmitting}>
                {isEdit ? 'Update User' : 'Create User'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/users')}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};
