import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, UserPlus } from 'lucide-react';
import { Card, Button } from '../components/common';
import { HouseholdRegistrationForm } from './registrations/HouseholdRegistrationForm';

export const PublicRegistrationPage = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <HouseholdRegistrationForm
            onSuccess={() => {
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Household Registration
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Register your household to access support services
          </p>
        </div>

        <Card className="shadow-xl">
          <div className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <UserPlus className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">New Registration</h2>
              <p className="text-gray-600">
                Complete the registration form to register your household and receive a unique QR code
                for easy access to services.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-lg space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">What you'll need:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Household head information (name, contact details)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Residential address</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Information about all family members (optional but recommended)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>ID or passport numbers (if available)</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> After registration, you will receive a QR code. Please save or print
                this QR code as it will be used to access your household data in the future.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowForm(true)}
                className="flex-1"
              >
                Start Registration
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already registered?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
