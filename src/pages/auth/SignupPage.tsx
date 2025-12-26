import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserPlus, ArrowLeft, Building, User, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '../../layouts';
import { Button, Input } from '../../components/common';
import { supabase } from '../../lib/supabase';

interface SignupFormData {
  email: string;
  password: string;
  confirm_password: string;
  user_type: 'individual' | 'organization';
  organization_name?: string;
  organization_type?: string;
  full_name?: string;
  department?: string;
  sectors?: string[];
  locations?: string;
}

const SECTORS = [
  'Protection',
  'Health',
  'Education',
  'WASH',
  'Shelter',
  'Food Security',
  'Nutrition',
  'Legal Assistance',
  'Psychosocial Support (PSS)',
  'Livelihood'
];

export const SignupPage = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<'individual' | 'organization'>('individual');
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    defaultValues: {
      user_type: 'individual',
      sectors: []
    }
  });

  const password = watch('password');
  const selectedSectors = watch('sectors') || [];

  const handleSectorChange = (sector: string, checked: boolean) => {
    if (checked) {
      setValue('sectors', [...selectedSectors, sector]);
    } else {
      setValue('sectors', selectedSectors.filter(s => s !== sector));
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError('');
      setSuccess('');

      if (data.password !== data.confirm_password) {
        setError('Passwords do not match');
        return;
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (!authData.user) {
        setError('Failed to create account. Please try again.');
        return;
      }

      let displayName = data.email.split('@')[0];
      let userRole = 'viewer';
      let orgId = null;

      if (data.user_type === 'organization') {
        displayName = data.organization_name || displayName;
        userRole = 'organization';

        // Create Organization Entity
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: data.organization_name,
            organization_name: data.organization_name,
            type: data.organization_type,
            contact_email: data.email,
            sectors_provided: data.sectors,
            locations_covered: data.locations ? data.locations.split(',').map(l => l.trim()) : [],
            is_active: true,
            created_by: authData.user.id
          })
          .select()
          .single();

        if (orgError) {
          console.error('Organization creation error:', orgError);
          // Fallback: continue creating user but warn? Or fail?
          // We should probably fail or at least log it.
          // For now, we proceed but without orgId if it failed, which might be bad.
          // Let's throw to stop.
          throw new Error('Failed to create organization profile: ' + orgError.message);
        }

        orgId = orgData.id;
      } else if (data.user_type === 'individual') {
        displayName = data.full_name || displayName;
        userRole = 'viewer';
      }

      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          name: displayName,
          role: userRole,
          user_type: data.user_type,
          organization_name: data.organization_name,
          organization_type: data.organization_type,
          organization_id: orgId,
          department: data.department,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('Failed to create user profile: ' + profileError.message);
      }

      navigate('/login', {
        state: { message: 'Account created successfully! Please sign in.' }
      });
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-2xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 sm:mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        <div className="glass-effect rounded-3xl p-6 sm:p-10 animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl mb-4 sm:mb-6 shadow-2xl">
              <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Join ReStore 360</h2>
            <p className="text-gray-600 text-sm sm:text-base">Start making a difference today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4">Choose Account Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setUserType('individual')}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all transform hover:scale-105 ${userType === 'individual'
                      ? 'border-primary-500 bg-primary-50 shadow-lg'
                      : 'border-gray-200 hover:border-primary-300 bg-white'
                    }`}
                >
                  <div className="text-center">
                    <User className={`w-8 h-8 mx-auto mb-2 ${userType === 'individual' ? 'text-primary-600' : 'text-gray-400'
                      }`} />
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Individual</p>
                    <p className="text-xs text-gray-600 mt-1">Student/Personal</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('organization')}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all transform hover:scale-105 ${userType === 'organization'
                      ? 'border-success-500 bg-success-50 shadow-lg'
                      : 'border-gray-200 hover:border-success-300 bg-white'
                    }`}
                >
                  <div className="text-center">
                    <Building className={`w-8 h-8 mx-auto mb-2 ${userType === 'organization' ? 'text-success-600' : 'text-gray-400'
                      }`} />
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Organization</p>
                    <p className="text-xs text-gray-600 mt-1">NGO/Agency</p>
                  </div>
                </button>
              </div>
            </div>

            {userType === 'individual' && (
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                error={errors.full_name?.message}
                {...register('full_name', {
                  required: userType === 'individual' ? 'Full name is required' : false
                })}
              />
            )}

            {userType === 'organization' && (
              <>
                <Input
                  label="Organization Name"
                  placeholder="Enter organization name"
                  error={errors.organization_name?.message}
                  {...register('organization_name', {
                    required: userType === 'organization' ? 'Organization name is required' : false
                  })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('organization_type', {
                      required: userType === 'organization' ? 'Organization type is required' : false
                    })}
                  >
                    <option value="">Select type</option>
                    <option value="NGO">NGO</option>
                    <option value="Government">Government Agency</option>
                    <option value="International">International Organization</option>
                    <option value="Community">Community Group</option>
                    <option value="Religious">Religious Organization</option>
                  </select>
                  {errors.organization_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.organization_type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Services / Sectors Provided</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTORS.map((sector) => (
                      <label key={sector} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          value={sector}
                          checked={selectedSectors.includes(sector)}
                          onChange={(e) => handleSectorChange(sector, e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{sector}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Input
                  label="Locations Covered"
                  placeholder="e.g. Lagos, Abuja, Kano (comma separated)"
                  error={errors.locations?.message}
                  {...register('locations')}
                />
              </>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="name@organization.org"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                error={errors.confirm_password?.message}
                {...register('confirm_password', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full py-3 sm:py-4 text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              isLoading={isSubmitting}
            >
              Create Account
            </Button>

            <div className="relative my-6 sm:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 sm:px-4 bg-white text-gray-500 font-medium">Already have an account?</span>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary-600 hover:text-primary-700 font-semibold text-sm sm:text-base hover:underline transition-colors inline-flex items-center gap-2"
              >
                Sign in instead
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};
