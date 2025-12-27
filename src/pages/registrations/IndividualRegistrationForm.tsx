import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, User, QrCode, Camera } from 'lucide-react';
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
  nationality?: string;
  ethnicity?: string;
  religion?: string;
  marital_status?: string;
  education_level?: string;
  occupation?: string;
  disabilities?: string;
  medical_conditions?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  displacement_status?: string;
  displacement_date?: string;
  place_of_origin?: string;
  place_of_origin_district?: string;
  place_of_origin_region?: string;
  current_location?: string;
  current_location_district?: string;
  current_location_region?: string;
  displacement_reason?: string;
  displacement_duration?: string;
  shelter_type?: string;
  has_documentation?: boolean;
  documentation_types?: string;
}

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export const IndividualRegistrationForm = ({ onSuccess, onCancel }: Props) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const { track } = useActivityLogger();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: IndividualFormData) => {
    try {
      setError('');

      let photoUrl = null;

      // Upload photo if exists
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, photoFile);

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          // Continue without photo if upload fails, but warn user? 
          // For now, let's just log it and proceed without the photo
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(filePath);
          photoUrl = publicUrl;
        }
      }

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
        household_head: null, // Individual registration has no household head
        is_head_of_household: false, // Explicitly mark as not head of household
        qr_code: generatedQrCode,
        status: 'pending',
        approval_status: 'pending',
        nationality: data.nationality,
        ethnicity: data.ethnicity,
        religion: data.religion,
        marital_status: data.marital_status,
        education_level: data.education_level,
        occupation: data.occupation,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
        emergency_contact_relationship: data.emergency_contact_relationship,
        displacement_status: data.displacement_status,
        displacement_date: data.displacement_date,
        place_of_origin: data.place_of_origin,
        place_of_origin_district: data.place_of_origin_district,
        place_of_origin_region: data.place_of_origin_region,
        current_location: data.current_location,
        current_location_district: data.current_location_district,
        current_location_region: data.current_location_region,
        displacement_reason: data.displacement_reason,
        displacement_duration: data.displacement_duration,
        shelter_type: data.shelter_type,
        has_documentation: data.has_documentation || false,
        photo_url: photoUrl,
      };

      if (data.disabilities) {
        registrationData.disabilities = data.disabilities.split(',').map(d => d.trim());
      }
      if (data.medical_conditions) {
        registrationData.medical_conditions = data.medical_conditions.split(',').map(c => c.trim());
      }
      if (data.documentation_types) {
        registrationData.documentation_types = data.documentation_types.split(',').map(t => t.trim());
      }

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
        const memberData: any = {
          registration_id: registration.id,
          full_name: data.full_name,
          relationship: 'self',
          gender: data.gender || 'other',
          date_of_birth: data.date_of_birth,
          age: data.age,
          phone: data.phone,
          id_number: data.id_number,
          nationality: data.nationality,
          ethnicity: data.ethnicity,
          religion: data.religion,
          marital_status: data.marital_status,
          education_level: data.education_level,
          occupation: data.occupation,
        };

        if (data.disabilities) {
          memberData.disabilities = data.disabilities.split(',').map(d => d.trim());
        }
        if (data.medical_conditions) {
          memberData.medical_conditions = data.medical_conditions.split(',').map(c => c.trim());
        }

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
            <p className="text-sm text-gray-600">Complete all sections for registration</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => setCurrentStep(step)}
              className={`flex-1 h-2 rounded-full transition-colors ${currentStep === step ? 'bg-blue-600' : currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                }`}
            />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Personal Information</h4>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">Upload a clear face photo</p>
              </div>
            </div>

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
              label="Date of Birth"
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
              label="Nationality"
              placeholder="Your nationality"
              error={errors.nationality?.message}
              {...register('nationality')}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Ethnicity (Optional)"
                placeholder="Your ethnic group"
                error={errors.ethnicity?.message}
                {...register('ethnicity')}
              />

              <Input
                label="Religion (Optional)"
                placeholder="Your religion"
                error={errors.religion?.message}
                {...register('religion')}
              />
            </div>

            <Select
              label="Marital Status"
              options={[
                { value: '', label: 'Select status' },
                { value: 'single', label: 'Single' },
                { value: 'married', label: 'Married' },
                { value: 'divorced', label: 'Divorced' },
                { value: 'widowed', label: 'Widowed' },
              ]}
              error={errors.marital_status?.message}
              {...register('marital_status')}
            />

            <Select
              label="Education Level"
              options={[
                { value: '', label: 'Select level' },
                { value: 'none', label: 'No formal education' },
                { value: 'primary', label: 'Primary' },
                { value: 'secondary', label: 'Secondary' },
                { value: 'tertiary', label: 'Tertiary/University' },
                { value: 'vocational', label: 'Vocational Training' },
              ]}
              error={errors.education_level?.message}
              {...register('education_level')}
            />

            <Input
              label="Occupation (Optional)"
              placeholder="Your occupation or profession"
              error={errors.occupation?.message}
              {...register('occupation')}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Contact & Address</h4>

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

            <div className="space-y-3 pt-4 border-t">
              <h5 className="font-medium text-gray-900">Emergency Contact</h5>

              <Input
                label="Emergency Contact Name"
                placeholder="Name of emergency contact person"
                error={errors.emergency_contact_name?.message}
                {...register('emergency_contact_name')}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Emergency Contact Phone"
                  placeholder="Phone number"
                  error={errors.emergency_contact_phone?.message}
                  {...register('emergency_contact_phone')}
                />

                <Input
                  label="Relationship"
                  placeholder="e.g., Spouse, Parent, Sibling"
                  error={errors.emergency_contact_relationship?.message}
                  {...register('emergency_contact_relationship')}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Displacement History</h4>

            <Select
              label="Displacement Status"
              options={[
                { value: '', label: 'Select status' },
                { value: 'refugee', label: 'Refugee' },
                { value: 'idp', label: 'Internally Displaced Person (IDP)' },
                { value: 'returnee', label: 'Returnee' },
                { value: 'host_community', label: 'Host Community' },
              ]}
              error={errors.displacement_status?.message}
              {...register('displacement_status')}
            />

            <Input
              label="Date of Displacement"
              type="date"
              error={errors.displacement_date?.message}
              {...register('displacement_date')}
            />

            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">Place of Origin</h5>

              <Input
                label="Village/Town/City"
                placeholder="Place of origin"
                error={errors.place_of_origin?.message}
                {...register('place_of_origin')}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="District"
                  placeholder="District of origin"
                  error={errors.place_of_origin_district?.message}
                  {...register('place_of_origin_district')}
                />

                <Input
                  label="Region/State"
                  placeholder="Region or state"
                  error={errors.place_of_origin_region?.message}
                  {...register('place_of_origin_region')}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">Current Location</h5>

              <Input
                label="Village/Town/City"
                placeholder="Current place of residence"
                error={errors.current_location?.message}
                {...register('current_location')}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="District"
                  placeholder="Current district"
                  error={errors.current_location_district?.message}
                  {...register('current_location_district')}
                />

                <Input
                  label="Region/State"
                  placeholder="Current region or state"
                  error={errors.current_location_region?.message}
                  {...register('current_location_region')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Displacement
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe the reason for displacement"
                {...register('displacement_reason')}
              />
            </div>

            <Input
              label="Duration of Displacement"
              placeholder="e.g., 2 years, 6 months"
              error={errors.displacement_duration?.message}
              {...register('displacement_duration')}
            />

            <Select
              label="Current Shelter Type"
              options={[
                { value: '', label: 'Select shelter type' },
                { value: 'camp', label: 'Camp' },
                { value: 'host_family', label: 'Host Family' },
                { value: 'rented', label: 'Rented Accommodation' },
                { value: 'owned', label: 'Owned House' },
                { value: 'temporary', label: 'Temporary Shelter' },
                { value: 'collective_center', label: 'Collective Center' },
              ]}
              error={errors.shelter_type?.message}
              {...register('shelter_type')}
            />
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Medical & Documentation</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disabilities (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="List any disabilities, separated by commas"
                {...register('disabilities')}
              />
              <p className="text-xs text-gray-500 mt-1">Example: Visual impairment, Mobility issues</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical Conditions (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="List any medical conditions, separated by commas"
                {...register('medical_conditions')}
              />
              <p className="text-xs text-gray-500 mt-1">Example: Diabetes, Hypertension, Asthma</p>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h5 className="font-medium text-gray-900">Documentation</h5>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="has_documentation"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  {...register('has_documentation')}
                />
                <label htmlFor="has_documentation" className="text-sm text-gray-700">
                  I have identification documents
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Types (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="List document types you have, separated by commas"
                  {...register('documentation_types')}
                />
                <p className="text-xs text-gray-500 mt-1">Example: National ID, Passport, Birth Certificate</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h5 className="font-medium text-gray-900">Category & Description</h5>

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
          </div>
        )}

        <div className="flex justify-between gap-3 pt-4 border-t">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button type="button" variant="ghost" onClick={() => setCurrentStep(currentStep - 1)}>
                Previous
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>

          <div className="flex gap-2">
            {currentStep < 4 ? (
              <Button type="button" onClick={() => setCurrentStep(currentStep + 1)}>
                Next
              </Button>
            ) : (
              <Button type="submit" isLoading={isSubmitting}>
                Register Individual
              </Button>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
};
