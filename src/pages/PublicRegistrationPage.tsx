import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, UserPlus, Users, User } from 'lucide-react';
import { Card, Button } from '../components/common';
import { HouseholdRegistrationForm } from './registrations/HouseholdRegistrationForm';
import { IndividualRegistrationForm } from './registrations/IndividualRegistrationForm';

type RegistrationType = 'household' | 'individual' | null;

export const PublicRegistrationPage = () => {
  const navigate = useNavigate();
  const [registrationType, setRegistrationType] = useState<RegistrationType>(null);

  if (registrationType === 'household') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <HouseholdRegistrationForm
            onSuccess={() => {
              setRegistrationType(null);
            }}
            onCancel={() => setRegistrationType(null)}
          />
        </div>
      </div>
    );
  }

  if (registrationType === 'individual') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <IndividualRegistrationForm
            onSuccess={() => {
              setRegistrationType(null);
            }}
            onCancel={() => setRegistrationType(null)}
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

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-xl hover:shadow-2xl transition-shadow cursor-pointer" onClick={() => setRegistrationType('household')}>
            <div className="p-8 space-y-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Household Registration</h2>
                <p className="text-gray-600">
                  Register your entire household with all family members
                </p>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Register household head</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Add all family members</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Single QR code for whole family</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Track household size</span>
                </div>
              </div>

              <Button className="w-full" onClick={() => setRegistrationType('household')}>
                <Users className="w-4 h-4 mr-2" />
                Register Household
              </Button>
            </div>
          </Card>

          <Card className="shadow-xl hover:shadow-2xl transition-shadow cursor-pointer" onClick={() => setRegistrationType('individual')}>
            <div className="p-8 space-y-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Individual Registration</h2>
                <p className="text-gray-600">
                  Register yourself as a single individual
                </p>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Quick registration process</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Personal information only</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Individual QR code</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Ideal for single persons</span>
                </div>
              </div>

              <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => setRegistrationType('individual')}>
                <User className="w-4 h-4 mr-2" />
                Register Individual
              </Button>
            </div>
          </Card>
        </div>

        <div className="text-center">
          <Button onClick={() => navigate('/')} variant="ghost" size="sm">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

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
