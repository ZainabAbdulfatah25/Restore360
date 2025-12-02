import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, X, MapPin, User, Users, QrCode } from 'lucide-react';
import { Card, Button, Input, Select } from '../../components/common';
import { supabase } from '../../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { useActivityLogger } from '../../hooks';

interface FamilyMember {
  full_name: string;
  relationship: string;
  gender: string;
  date_of_birth?: string;
  age?: number;
  id_number?: string;
  phone?: string;
  special_needs?: string;
}

interface HouseholdFormData {
  household_head: string;
  phone: string;
  email?: string;
  id_number?: string;
  address: string;
  category: string;
  description: string;
}

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export const HouseholdRegistrationForm = ({ onSuccess, onCancel }: Props) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { track } = useActivityLogger();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HouseholdFormData>();

  const {
    register: registerMember,
    handleSubmit: handleMemberSubmit,
    reset: resetMember,
    formState: { errors: memberErrors },
  } = useForm<FamilyMember>();

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

  const addFamilyMember = (member: FamilyMember) => {
    setFamilyMembers([...familyMembers, member]);
    resetMember();
    setShowMemberForm(false);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: HouseholdFormData) => {
    try {
      setError('');
      setSuccess('');

      const generatedQrCode = `HH-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      const householdData: any = {
        full_name: data.household_head,
        household_head: data.household_head,
        phone: data.phone,
        email: data.email,
        id_number: data.id_number,
        address: data.address,
        category: data.category,
        description: data.description,
        household_size: familyMembers.length + 1,
        qr_code: generatedQrCode,
        status: 'pending',
        approval_status: 'pending',
      };

      if (location) {
        householdData.location = location;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        householdData.created_by = user.id;
      }

      const { data: registration, error: regError } = await supabase
        .from('registrations')
        .insert(householdData)
        .select()
        .single();

      if (regError) {
        console.error('Registration error details:', regError);
        throw new Error(regError.message || 'Failed to create registration');
      }

      if (familyMembers.length > 0 && registration?.id) {
        const membersData = familyMembers.map(member => ({
          registration_id: registration.id,
          ...member,
        }));

        const { error: membersError } = await supabase
          .from('household_members')
          .insert(membersData);

        if (membersError) {
          console.error('Members error:', membersError);
        }
      }

      await track('create', 'registrations', `Household registered: ${data.household_head}`, {
        registration_id: registration.id,
        qr_code: generatedQrCode,
        household_size: familyMembers.length + 1,
        category: data.category
      });

      setQrCode(generatedQrCode);
      setSuccess('Household registered successfully!');

      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register household. Please try again.');
    }
  };

  if (qrCode) {
    return (
      <Card className="max-w-md mx-auto">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <QrCode className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Registration Successful!</h3>
          <p className="text-gray-600">Scan this QR code to access household data</p>

          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
            <QRCodeSVG value={qrCode} size={200} />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Household ID</p>
            <p className="font-mono text-sm font-bold text-gray-900">{qrCode}</p>
          </div>

          <div className="flex gap-3 justify-center pt-4">
            <Button onClick={() => window.print()} variant="ghost">
              Print QR Code
            </Button>
            <Button onClick={() => setQrCode(null)}>
              Register Another
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Household Registration</h3>
              <p className="text-sm text-gray-600">Register household with all family members</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4" />
              Household Head Information
            </h4>

            <Input
              label="Full Name (Household Head)"
              placeholder="Name of household head"
              error={errors.household_head?.message}
              {...register('household_head', { required: 'Household head name is required' })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone Number"
                placeholder="+1234567890"
                error={errors.phone?.message}
                {...register('phone', { required: 'Phone number is required' })}
              />

              <Input
                label="Email (Optional)"
                type="email"
                placeholder="email@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <Input
              label="ID/Passport Number"
              placeholder="ID or passport number"
              error={errors.id_number?.message}
              {...register('id_number')}
            />

            <Input
              label="Address"
              placeholder="Full residential address"
              error={errors.address?.message}
              {...register('address', { required: 'Address is required' })}
            />

            <div className="flex gap-3">
              <Button type="button" variant="ghost" size="sm" onClick={captureLocation}>
                <MapPin className="w-4 h-4 mr-2" />
                {location ? 'Location Captured' : 'Capture GPS Location'}
              </Button>
              {location && (
                <span className="text-xs text-green-600 flex items-center">
                  ✓ Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </span>
              )}
            </div>

            <Select
              label="Category"
              options={[
                { value: 'refugee', label: 'Refugee' },
                { value: 'displaced', label: 'Internally Displaced' },
                { value: 'vulnerable', label: 'Vulnerable Household' },
                { value: 'emergency', label: 'Emergency Case' },
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
                rows={3}
                placeholder="Brief description of household situation"
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Family Members ({familyMembers.length})
              </h4>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowMemberForm(!showMemberForm)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Member
              </Button>
            </div>

            {showMemberForm && (
              <Card className="bg-gray-50">
                <form
                  onSubmit={handleMemberSubmit(addFamilyMember)}
                  className="p-4 space-y-3"
                >
                  <Input
                    label="Full Name"
                    placeholder="Family member name"
                    error={memberErrors.full_name?.message}
                    {...registerMember('full_name', { required: 'Name is required' })}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="Relationship"
                      options={[
                        { value: 'spouse', label: 'Spouse' },
                        { value: 'child', label: 'Child' },
                        { value: 'parent', label: 'Parent' },
                        { value: 'sibling', label: 'Sibling' },
                        { value: 'other', label: 'Other Relative' },
                      ]}
                      error={memberErrors.relationship?.message}
                      {...registerMember('relationship', { required: 'Relationship is required' })}
                    />

                    <Select
                      label="Gender"
                      options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' },
                      ]}
                      error={memberErrors.gender?.message}
                      {...registerMember('gender', { required: 'Gender is required' })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Date of Birth"
                      type="date"
                      error={memberErrors.date_of_birth?.message}
                      {...registerMember('date_of_birth')}
                    />

                    <Input
                      label="Age"
                      type="number"
                      placeholder="Age in years"
                      error={memberErrors.age?.message}
                      {...registerMember('age')}
                    />
                  </div>

                  <Input
                    label="Phone (Optional)"
                    placeholder="Phone number"
                    error={memberErrors.phone?.message}
                    {...registerMember('phone')}
                  />

                  <Input
                    label="Special Needs (Optional)"
                    placeholder="Medical conditions, disabilities, etc."
                    error={memberErrors.special_needs?.message}
                    {...registerMember('special_needs')}
                  />

                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      Add Member
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowMemberForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {familyMembers.length > 0 && (
              <div className="space-y-2">
                {familyMembers.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{member.full_name}</p>
                      <p className="text-sm text-gray-600">
                        {member.relationship} • {member.gender} • {member.age ? `${member.age} years` : 'Age not specified'}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFamilyMember(index)}
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isSubmitting}>
              Register Household
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
