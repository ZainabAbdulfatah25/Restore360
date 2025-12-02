import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, User, QrCode } from 'lucide-react';
import { Card, Button, Input, Select } from '../../components/common';
import { supabase } from '../../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { useActivityLogger } from '../../hooks';

interface IndividualFormData {
  full_name: string;
  phone: string;
  email?: string;
  id_number?: string;
  address: string;
  category: string;
  description: string;
  gender: string;
  date_of_birth?: string;
  age?: number;
}

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export const IndividualRegistrationForm = ({ onSuccess, onCancel }: Props) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { track } = useActivityLogger();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IndividualFormData>();

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

  const onSubmit = async (data: IndividualFormData) => {
    try {
      setError('');
      setSuccess('');

      const generatedQrCode = `IND-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      const registrationData: any = {
        full_name: data.full_name,
        phone: data.phone,
        email: data.email,
        id_number: data.id_number,
        address: data.address,
        category: data.category,
        description: data.description,
        household_size: 1,
        qr_code: generatedQrCode,
        status: 'pending',
        approval_status: 'pending',
      };

      if (location) {
        registrationData.location = location;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        registrationData.created_by = user.id;
      }

      const { data: registration, error: regError } = await supabase
        .from('registrations')
        .insert(registrationData)
        .select()
        .single();

      if (regError) {
        console.error('Registration error details:', regError);
        throw new Error(regError.message || 'Failed to create registration');
      }

      if (registration?.id && (data.gender || data.date_of_birth || data.age)) {
        const memberData = {
          registration_id: registration.id,
          full_name: data.full_name,
          relationship: 'self',
          gender: data.gender || 'other',
          date_of_birth: data.date_of_birth,
          age: data.age,
          phone: data.phone,
          id_number: data.id_number,
        };

        const { error: memberError } = await supabase
          .from('household_members')
          .insert(memberData);

        if (memberError) {
          console.error('Member error:', memberError);
        }
      }

      await track('create', 'registrations', `Individual registered: ${data.full_name}`, {
        registration_id: registration.id,
        qr_code: generatedQrCode,
        category: data.category
      });

      setQrCode(generatedQrCode);
      setSuccess('Individual registered successfully!');

      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register individual. Please try again.');
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
          <p className="text-gray-600">Scan this QR code to access your data</p>

          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
            <QRCodeSVG value={qrCode} size={200} />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Individual ID</p>
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
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">Individual Registration</h3>
            <p className="text-sm text-gray-600">Register as an individual</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Your full name"
            error={errors.full_name?.message}
            {...register('full_name', { required: 'Full name is required' })}
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

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Gender"
              options={[
                { value: '', label: 'Select gender' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
              error={errors.gender?.message}
              {...register('gender', { required: 'Gender is required' })}
            />

            <Input
              label="Age"
              type="number"
              placeholder="Your age"
              error={errors.age?.message}
              {...register('age')}
            />
          </div>

          <Input
            label="Date of Birth (Optional)"
            type="date"
            error={errors.date_of_birth?.message}
            {...register('date_of_birth')}
          />

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
              { value: '', label: 'Select category' },
              { value: 'refugee', label: 'Refugee' },
              { value: 'displaced', label: 'Internally Displaced' },
              { value: 'vulnerable', label: 'Vulnerable Individual' },
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
              placeholder="Brief description of your situation"
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={isSubmitting}>
            Register Individual
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};
