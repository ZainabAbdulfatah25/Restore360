import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Upload, X, Edit, Trash2 } from 'lucide-react';
import { MainLayout } from '../../layouts';
import { Card, Button, Input, Select, Badge, BackToDashboard } from '../../components/common';
import { DataTable } from '../../components/tables';
import { useActivityLogger, useAuth } from '../../hooks';
import { registrationsApi } from '../../api';
import { Registration } from '../../types';
import { supabase } from '../../lib/supabase';

interface RegistrationFormData {
  full_name: string;
  email?: string;
  phone: string;
  id_number?: string;
  address: string;
  category: string;
  description: string;
}

export const RegistrationsPage = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const { track } = useActivityLogger();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>();

  useEffect(() => {
    loadRegistrations();

    const channel = supabase
      .channel('registrations-list-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        loadRegistrations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentPage, categoryFilter]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 10 };
      if (categoryFilter) params.category = categoryFilter;
      const response = await registrationsApi.getRegistrations(params);
      setRegistrations(response.data);
      setTotalPages(response.total_pages);
      await track('view', 'registrations', 'Viewed registrations list');
    } catch (error) {
      console.error('Failed to load registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const captureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          alert('Location captured successfully!');
        },
        (error) => {
          console.error('Failed to capture location:', error);
          alert('Failed to capture location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      if (location) {
        formData.append('location', JSON.stringify(location));
      }

      files.forEach((file) => {
        formData.append('attachments', file);
      });

      if (editingId) {
        await registrationsApi.updateRegistration(editingId, data);
        await track('update', 'registrations', `Updated household registration for ${data.full_name}`, {
          registration_id: editingId,
          full_name: data.full_name,
          category: data.category,
          phone: data.phone
        });
      } else {
        const newRegistration = await registrationsApi.createRegistration(formData);
        await track('create', 'registrations', `Created household registration for ${data.full_name}`, {
          registration_id: newRegistration.id,
          full_name: data.full_name,
          category: data.category,
          phone: data.phone
        });
      }

      reset();
      setFiles([]);
      setLocation(null);
      setShowForm(false);
      setEditingId(null);
      loadRegistrations();
    } catch (error) {
      console.error('Failed to save registration:', error);
      alert('Failed to save registration');
    }
  };

  const handleEdit = (registration: Registration) => {
    reset(registration);
    setEditingId(registration.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration?')) return;

    try {
      await registrationsApi.deleteRegistration(id);
      await track('delete', 'registrations', 'Deleted registration');
      loadRegistrations();
    } catch (error) {
      console.error('Failed to delete registration:', error);
      alert('Failed to delete registration');
    }
  };

  const canEdit = (registration: Registration) => {
    return user?.id === registration.created_by || user?.role === 'admin' || user?.role === 'case_worker';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <BackToDashboard />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Registrations</h1>
            <p className="text-gray-600 mt-1">
              {user?.role === 'admin' ? 'Manage all registration submissions' : 'Manage your registration submissions'}
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="general">General</option>
              <option value="emergency">Emergency</option>
              <option value="support">Support</option>
              <option value="complaint">Complaint</option>
            </select>
            <Button onClick={() => { setShowForm(!showForm); setEditingId(null); reset({}); }}>
              {showForm ? 'View List' : 'New Registration'}
            </Button>
          </div>
        </div>

        {showForm ? (
          <Card title="Registration Form">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                error={errors.full_name?.message}
                {...register('full_name', { required: 'Name is required' })}
              />

              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Phone"
                type="tel"
                placeholder="+1234567890"
                error={errors.phone?.message}
                {...register('phone', { required: 'Phone is required' })}
              />

              <Input
                label="ID Number"
                placeholder="ID/Passport Number"
                error={errors.id_number?.message}
                {...register('id_number')}
              />

              <Input
                label="Address"
                placeholder="Full address"
                error={errors.address?.message}
                {...register('address', { required: 'Address is required' })}
              />

              <Select
                label="Category"
                options={[
                  { value: 'general', label: 'General' },
                  { value: 'emergency', label: 'Emergency' },
                  { value: 'support', label: 'Support' },
                  { value: 'complaint', label: 'Complaint' },
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
                  placeholder="Provide detailed information"
                  {...register('description', { required: 'Description is required' })}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <Button type="button" variant="secondary" size="sm" onClick={captureLocation}>
                  <MapPin className="w-4 h-4 mr-2" />
                  {location ? 'Update Location' : 'Capture Location'}
                </Button>
                {location && (
                  <p className="text-sm text-gray-600 mt-2">
                    Location captured: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <span className="inline-block">
                      <Button type="button" variant="secondary" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Files
                      </Button>
                    </span>
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button type="button" onClick={() => removeFile(index)}>
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" isLoading={isSubmitting}>
                  {editingId ? 'Update Registration' : 'Submit Registration'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card>
            <DataTable
              data={registrations}
              columns={[
                {
                  key: 'full_name',
                  label: 'Name',
                },
                {
                  key: 'phone',
                  label: 'Phone',
                },
                {
                  key: 'category',
                  label: 'Category',
                },
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
                  render: (r) => canEdit(r) ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(r)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ) : null,
                },
              ]}
              loading={loading}
              pagination={{
                currentPage,
                totalPages,
                onPageChange: setCurrentPage,
              }}
              emptyState={
                <div className="text-center py-12 text-gray-500">No registrations found</div>
              }
            />
          </Card>
        )}
      </div>
    </MainLayout>
  );
};
