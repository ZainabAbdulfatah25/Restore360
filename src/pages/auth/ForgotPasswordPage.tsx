import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Mail } from 'lucide-react';
import { AuthLayout } from '../../layouts';
import { Button, Input } from '../../components/common';
import { authApi } from '../../api';
import { useActivityLogger } from '../../hooks';

interface ForgotPasswordForm {
  email: string;
}

export const ForgotPasswordPage = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { track } = useActivityLogger();
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
      await authApi.forgotPassword(data.email);
      await track('forgot_password', 'auth', `Password reset requested for ${data.email}`);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-600 mb-2">
              We've sent password reset instructions to:
            </p>
            <p className="text-blue-600 font-medium mb-6">{email}</p>
            <p className="text-sm text-gray-500 mb-6">
              Please check your inbox and follow the instructions to reset your password.
            </p>
            <Link to="/login">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <Link to="/login" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
          <p className="text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Send Reset Instructions
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};
