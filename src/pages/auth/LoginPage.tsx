import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Shield, LogIn, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '../../layouts';
import { Button, Input } from '../../components/common';
import { useAuth } from '../../hooks';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const successMessage = (location.state as any)?.message;

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      const user = await login(data.email, data.password);

      if (user?.role === 'admin' || user?.role === 'state_admin') {
        navigate('/admin');
      } else if (user?.role === 'organization' || user?.role === 'manager') {
        navigate('/organization');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
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
              <LogIn className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Welcome Back</h2>
            <p className="text-gray-600 text-sm sm:text-base">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
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

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full py-3 sm:py-4 text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              isLoading={isSubmitting}
            >
              Sign In to Dashboard
            </Button>
          </form>

          <div className="relative my-6 sm:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 sm:px-4 bg-white text-gray-500 font-medium">New to ReStore 360?</span>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-primary-600 hover:text-primary-700 font-semibold text-sm sm:text-base hover:underline transition-colors inline-flex items-center gap-2"
            >
              Create a free account
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
