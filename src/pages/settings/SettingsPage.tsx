import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, User as UserIcon, Lock, Bell, Languages } from 'lucide-react';
import { MainLayout } from '../../layouts';
import { Card, Button, Input, BackToDashboard } from '../../components/common';
import { useAuth, useActivityLogger } from '../../hooks';
import { useLanguage } from '../../contexts/LanguageContext';
import { usersApi } from '../../api';

interface ProfileFormData {
  name: string;
  email: string;
  phone?: string;
  department?: string;
}

interface PasswordFormData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export const SettingsPage = () => {
  const { user } = useAuth();
  const { track } = useActivityLogger();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'language'>('profile');

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>();

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    try {
      await usersApi.updateUser(user.id, data);
      await track('update', 'settings', 'Updated profile information');
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!user) return;
    if (data.new_password !== data.confirm_password) {
      alert('Passwords do not match');
      return;
    }
    try {
      await usersApi.changePassword(user.id, data.old_password, data.new_password);
      await track('update', 'settings', 'Changed password');
      passwordForm.reset();
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password');
    }
  };

  const tabs = [
    { id: 'profile' as const, label: t('profile') || 'Profile', icon: UserIcon },
    { id: 'password' as const, label: t('password') || 'Password', icon: Lock },
    { id: 'language' as const, label: t('language_settings') || 'Language', icon: Languages },
    { id: 'notifications' as const, label: t('notifications') || 'Notifications', icon: Bell },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <BackToDashboard />

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        <div className="flex gap-4 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <Card title="Profile Information">
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="p-6 space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                error={profileForm.formState.errors.name?.message}
                {...profileForm.register('name', { required: 'Name is required' })}
              />

              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                error={profileForm.formState.errors.email?.message}
                {...profileForm.register('email', { required: 'Email is required' })}
              />

              <Input
                label="Phone"
                type="tel"
                placeholder="+1234567890"
                error={profileForm.formState.errors.phone?.message}
                {...profileForm.register('phone')}
              />

              <Input
                label="Department"
                placeholder="IT, HR, Operations, etc."
                error={profileForm.formState.errors.department?.message}
                {...profileForm.register('department')}
              />

              <Button type="submit" isLoading={profileForm.formState.isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </form>
          </Card>
        )}

        {activeTab === 'password' && (
          <Card title="Change Password">
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="p-6 space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                error={passwordForm.formState.errors.old_password?.message}
                {...passwordForm.register('old_password', { required: 'Current password is required' })}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                error={passwordForm.formState.errors.new_password?.message}
                {...passwordForm.register('new_password', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                })}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
                error={passwordForm.formState.errors.confirm_password?.message}
                {...passwordForm.register('confirm_password', { required: 'Please confirm your password' })}
              />

              <Button type="submit" isLoading={passwordForm.formState.isSubmitting}>
                <Lock className="w-4 h-4 mr-2" />
                Update Password
              </Button>
            </form>
          </Card>
        )}

        {activeTab === 'language' && (
          <Card title={t('language_settings') || 'Language Settings'}>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('select_language') || 'Select Language'}
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { code: 'en', name: t('english') || 'English' },
                    { code: 'ha', name: t('hausa') || 'Hausa' },
                    { code: 'ig', name: t('igbo') || 'Igbo' },
                    { code: 'yo', name: t('yoruba') || 'Yoruba' },
                    { code: 'pcm', name: t('pidgin') || 'Nigerian Pidgin' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as any)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        language === lang.code
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900">{lang.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card title="Notification Preferences">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive email updates about your cases</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Case Updates</p>
                  <p className="text-sm text-gray-600">Get notified when cases are updated</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Referral Notifications</p>
                  <p className="text-sm text-gray-600">Receive alerts for new referrals</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
              </div>
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};
