import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MainLayout } from '../../layouts';
import { Card, Button, Input, Select, BackToDashboard } from '../../components/common';
import { useActivityLogger } from '../../hooks';
import { casesApi, usersApi, organizationsApi, Organization } from '../../api';
import { Case, User } from '../../types';

type CaseFormData = {
  title: string;
  description: string;
  category?: string;
  status: 'open' | 'in_progress' | 'closed' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  assigned_to_type?: string;
};

export const CaseFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { track } = useActivityLogger();
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isEdit = !!id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CaseFormData>({
    defaultValues: {
      status: 'open',
      priority: 'medium',
      category: 'protection',
    }
  });

  useEffect(() => {
    loadUsers();
    loadOrganizations();
    if (isEdit && id) {
      loadCase(id);
    }
  }, [id, isEdit]);

  const loadUsers = async () => {
    try {
      const response = await usersApi.getUsers({ page: 1, limit: 100 });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadOrganizations = async () => {
    try {
      const orgs = await organizationsApi.getOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    }
  };

  const loadCase = async (caseId: string) => {
    try {
      const caseData = await casesApi.getCase(caseId);
      reset(caseData);
    } catch (error) {
      console.error('Failed to load case:', error);
      setError('Failed to load case data');
    }
  };

  const onSubmit = async (data: CaseFormData) => {
    try {
      setError('');
      setSuccess('');

      const submitData: any = {
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status,
        priority: data.priority,
      };

      if (data.assigned_to && data.assigned_to !== '') {
        const assignValue = data.assigned_to;
        submitData.assigned_to = assignValue;

        if (assignValue.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          submitData.assigned_to_type = 'user';
        } else {
          submitData.assigned_to_type = 'organization';
        }
      }

      if (isEdit && id) {
        await casesApi.updateCase(id, submitData);
        await track('update', 'cases', `Updated case: ${data.title}`, { case_id: id });
        setSuccess('Case updated successfully!');
        setTimeout(() => navigate('/cases'), 1500);
      } else {
        const newCase = await casesApi.createCase(submitData);
        await track('create', 'cases', `Created case: ${data.title}`, {
          case_id: newCase.id,
          case_number: newCase.case_number,
          title: data.title,
          category: data.category,
          priority: data.priority
        });
        setSuccess('Case created successfully!');
        setTimeout(() => navigate('/cases'), 1500);
      }
    } catch (err: any) {
      console.error('Error saving case:', err);
      setError(err.message || 'Failed to save case. Please try again.');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <BackToDashboard />

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Case' : 'Create Case'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update case information' : 'Create a new case in the system'}
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <Input
              label="Title"
              placeholder="Brief description of the case"
              error={errors.title?.message}
              {...register('title', { required: 'Title is required' })}
            />

            <Select
              label="Category"
              options={[
                { value: 'protection', label: 'Protection' },
                { value: 'shelter', label: 'Shelter' },
                { value: 'food', label: 'Food Security' },
                { value: 'health', label: 'Health' },
                { value: 'education', label: 'Education' },
                { value: 'livelihood', label: 'Livelihood' },
                { value: 'other', label: 'Other' },
              ]}
              error={errors.category?.message}
              {...register('category', { required: 'Category is required' })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Detailed description of the case"
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <Select
              label="Status"
              options={[
                { value: 'open', label: 'Open' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'closed', label: 'Closed' },
                { value: 'pending', label: 'Pending' },
              ]}
              error={errors.status?.message}
              {...register('status', { required: 'Status is required' })}
            />

            <Select
              label="Priority"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
              error={errors.priority?.message}
              {...register('priority', { required: 'Priority is required' })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to Authorities/Organizations (Optional)
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('assigned_to')}
              >
                <option value="">Unassigned</option>
                <optgroup label="Organizations">
                  {organizations.map((org) => (
                    <option key={org.id} value={org.name}>
                      {org.name} - {org.type}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Government Agencies">
                  <option value="Ministry of Health">Ministry of Health</option>
                  <option value="Ministry of Education">Ministry of Education</option>
                  <option value="Social Services Department">Social Services Department</option>
                  <option value="Child Protection Services">Child Protection Services</option>
                  <option value="Immigration Services">Immigration Services</option>
                </optgroup>
                <optgroup label="International Organizations">
                  <option value="UNHCR">UNHCR</option>
                  <option value="UNICEF">UNICEF</option>
                  <option value="WFP">World Food Programme</option>
                  <option value="WHO">World Health Organization</option>
                  <option value="IOM">International Organization for Migration</option>
                  <option value="ICRC">International Committee of the Red Cross (ICRC)</option>
                </optgroup>
                <optgroup label="System Users">
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={isSubmitting}>
                {isEdit ? 'Update Case' : 'Create Case'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/cases')}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};
