import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Mail } from 'lucide-react';
import { AuthLayout } from '../../layouts';
import { Button, Input } from '../../components/common';
import { supabase } from '../../lib/supabase';

interface ForgotPasswordForm {
  email: string;
}

export const ForgotPasswordPage = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>();

  const email = watch('email');

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setError('');

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    }
  };

  if (success) {
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
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-success-500 to-success-600 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
                <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-3 sm:mb-4">Check Your Email</h2>
              <p className="text-gray-600 text-sm sm:text-base mb-2">
                We've sent password reset instructions to:
              </p>
              <p className="text-primary-600 font-semibold text-base sm:text-lg mb-6 sm:mb-8 break-all">{email}</p>
              <p className="text-sm text-gray-500 mb-6 sm:mb-8 leading-relaxed">
                Please check your inbox and click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full py-3 sm:py-4 text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
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
              <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Forgot Password?</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
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

            <Button
              type="submit"
              className="w-full py-3 sm:py-4 text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              isLoading={isSubmitting}
            >
              Send Reset Instructions
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs sm:text-sm text-gray-500">
                You'll receive an email with a link to reset your password.
              </p>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};
