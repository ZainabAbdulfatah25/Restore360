import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Shield } from 'lucide-react';
import { AuthLayout } from '../../layouts';
import { Button, Input } from '../../components/common';
import { supabase } from '../../lib/supabase';

interface SignupFormData {
  email: string;
  password: string;
  confirm_password: string;
  user_type: 'individual' | 'organization' | 'admin';
  organization_name?: string;
  organization_type?: string;
  full_name?: string;
  department?: string;
}

export const SignupPage = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userType, setUserType] = useState<'individual' | 'organization' | 'admin'>('individual');
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    defaultValues: {
      user_type: 'individual'
    }
  });

  const password = watch('password');

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

      if (data.user_type === 'organization') {
        displayName = data.organization_name || displayName;
      } else if (data.user_type === 'admin') {
        displayName = data.full_name || displayName;
        userRole = 'admin';
      } else if (data.user_type === 'individual') {
        displayName = data.full_name || displayName;
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
          department: data.department,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      if (data.user_type === 'admin') {
        setSuccess('Admin account created! You now have administrative access.');
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Admin account created successfully! Please sign in.' }
          });
        }, 2000);
      } else {
        navigate('/login', {
          state: { message: 'Account created successfully! Please sign in.' }
        });
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 text-sm mt-2">Choose your account type and get started</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-3">Account Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setUserType('individual')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  userType === 'individual'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <p className="font-medium text-gray-900">Individual</p>
                  <p className="text-xs text-gray-600 mt-1">Personal</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setUserType('organization')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  userType === 'organization'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <p className="font-medium text-gray-900">Organization</p>
                  <p className="text-xs text-gray-600 mt-1">NGO/Agency</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setUserType('admin')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  userType === 'admin'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <p className="font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-600 mt-1">Staff</p>
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
            </>
          )}

          {userType === 'admin' && (
            <>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                error={errors.full_name?.message}
                {...register('full_name', {
                  required: userType === 'admin' ? 'Full name is required' : false
                })}
              />
              <Input
                label="Department"
                placeholder="e.g., Case Management, Operations"
                error={errors.department?.message}
                {...register('department')}
              />
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                <p className="font-medium">Admin Account</p>
                <p className="text-xs mt-1">You will have full administrative access to manage users, approve submissions, and view all data.</p>
              </div>
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

          <Input
            label="Password"
            type="password"
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

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            error={errors.confirm_password?.message}
            {...register('confirm_password', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Sign Up
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};
