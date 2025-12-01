import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Users, BarChart3, FileText, MapPin, ArrowRightLeft, Settings } from 'lucide-react';
import { Button } from '../components/common';

export const LearnMorePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: 'Beneficiary Registration',
      description: 'Comprehensive registration system for IDPs and returnees with biographic data, location capture, and document management. Track household information and individual profiles.'
    },
    {
      icon: FileText,
      title: 'Case Management',
      description: 'Create, assign, and track humanitarian cases with priority levels, status updates, and workflow management. Full audit trail of all case activities.'
    },
    {
      icon: ArrowRightLeft,
      title: 'Referral System',
      description: 'Seamless referral workflow between field officers and case workers. Track referral status, reasons, and outcomes for better coordination.'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Dashboard with live statistics and activity feeds. Generate custom reports in PDF, Excel, or CSV formats for informed decision-making.'
    },
    {
      icon: MapPin,
      title: 'Location Services',
      description: 'Capture and track geographic locations of beneficiaries and cases. Map-based visualization for better resource allocation and response planning.'
    },
    {
      icon: Settings,
      title: 'User Management',
      description: 'Role-based access control with admin, case worker, field officer, and viewer roles. Secure authentication and activity logging.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl shadow-lg mb-6">
            <Shield className="w-11 h-11 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">ReStore 360</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive humanitarian coordination system designed to streamline the management of
            Internally Displaced Persons (IDPs) and returnees, enabling efficient case tracking,
            beneficiary registration, and data-driven decision-making.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About the Platform</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              ReStore 360 is a cutting-edge platform developed to address the complex challenges
              faced by humanitarian organizations in managing displaced populations. Built with
              modern web technologies, it provides a unified solution for registration, case
              management, and reporting.
            </p>
            <p>
              The system enables field officers to register beneficiaries on-site with mobile
              devices, capture geographic coordinates, and upload supporting documents. Case
              workers can then track cases, make referrals, and monitor progress through an
              intuitive dashboard.
            </p>
            <p>
              With built-in analytics and reporting capabilities, administrators gain real-time
              insights into operations, helping them allocate resources effectively and respond
              to emerging needs promptly.
            </p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl p-8 md:p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Who Can Use ReStore 360?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <h3 className="font-semibold mb-2 text-blue-100">Humanitarian Organizations</h3>
              <p className="text-blue-50">NGOs and aid agencies managing IDP programs</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-blue-100">Government Agencies</h3>
              <p className="text-blue-50">Disaster management and social welfare departments</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-blue-100">UN Organizations</h3>
              <p className="text-blue-50">UNHCR, IOM, and other UN bodies</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/login')}
            variant="secondary"
            className="w-full md:w-auto"
            size="lg"
          >
            Get Started Now
          </Button>
        </div>

        <div className="text-center mt-12 text-gray-600">
          <p>© 2024 ReStore 360. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
