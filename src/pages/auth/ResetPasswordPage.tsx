import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '../../layouts';
import { Button, Input } from '../../components/common';
import { supabase } from '../../lib/supabase';

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export const ResetPasswordPage = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>();

  const password = watch('password');

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setLoading(false);
      } else if (event === 'SIGNED_IN') {
        setLoading(false);
      }
    });

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      setError('');

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password reset successfully! Please sign in with your new password.' }
        });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    }
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md">
          <div className="glass-effect rounded-3xl p-6 sm:p-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md">
          <div className="glass-effect rounded-3xl p-6 sm:p-10 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-success-500 to-success-600 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-3">Password Reset Successful!</h2>
              <p className="text-gray-600 text-sm sm:text-base mb-6">
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
              <p className="text-sm text-gray-500">Redirecting to sign in...</p>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 sm:mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Sign In</span>
        </button>

        <div className="glass-effect rounded-3xl p-6 sm:p-10 animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl mb-4 sm:mb-6 shadow-2xl">
              <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Reset Your Password</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="relative">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                    message: 'Password must contain uppercase, lowercase, and a number',
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
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
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
              Reset Password
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs sm:text-sm text-gray-500">
                Password must be at least 8 characters with uppercase, lowercase, and numbers.
              </p>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};
