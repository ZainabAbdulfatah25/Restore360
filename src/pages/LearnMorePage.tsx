import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Users,
  BarChart3,
  FileText,
  MapPin,
  ArrowRightLeft,
  Settings,
  CheckCircle,
  Home,
  Phone,
  Heart,
  BookOpen,
  Briefcase,
  Globe,
  Lock,
  Clock,
  Database,
  Smartphone,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { Button } from '../components/common';

export const LearnMorePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: 'Beneficiary Registration',
      description: 'Comprehensive registration system for IDPs and returnees with biographic data, location capture, and document management. Track household information and individual profiles.',
      details: [
        'Capture full demographic information',
        'Household and family member tracking',
        'Document upload and management',
        'GPS location recording',
        'Photo identification support'
      ]
    },
    {
      icon: FileText,
      title: 'Case Management',
      description: 'Create, assign, and track humanitarian cases with priority levels, status updates, and workflow management. Full audit trail of all case activities.',
      details: [
        'Unique case numbering system',
        'Priority-based categorization',
        'Status workflow tracking',
        'Assignment to case workers',
        'Complete activity history'
      ]
    },
    {
      icon: ArrowRightLeft,
      title: 'Referral System',
      description: 'Seamless referral workflow between field officers and case workers. Track referral status, reasons, and outcomes for better coordination.',
      details: [
        'Multi-organization referrals',
        'Automated referral tracking',
        'Status notifications',
        'Response time monitoring',
        'Outcome documentation'
      ]
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Dashboard with live statistics and activity feeds. Generate custom reports in PDF, Excel, or CSV formats for informed decision-making.',
      details: [
        'Live dashboard updates',
        'Customizable reports',
        'Export to multiple formats',
        'Trend analysis charts',
        'Performance metrics'
      ]
    },
    {
      icon: MapPin,
      title: 'Location Services',
      description: 'Capture and track geographic locations of beneficiaries and cases. Map-based visualization for better resource allocation and response planning.',
      details: [
        'GPS coordinate capture',
        'Geographic distribution maps',
        'Location-based filtering',
        'Area coverage analysis',
        'Mobile-friendly capture'
      ]
    },
    {
      icon: Settings,
      title: 'User Management',
      description: 'Role-based access control with admin, case worker, field officer, and viewer roles. Secure authentication and activity logging.',
      details: [
        'Multi-role support',
        'Granular permissions',
        'Activity audit logs',
        'Secure authentication',
        'Organization management'
      ]
    }
  ];

  const categories = [
    { icon: Home, title: 'Shelter', description: 'Emergency housing and accommodation assistance' },
    { icon: Heart, title: 'Health', description: 'Medical care and health service referrals' },
    { icon: Users, title: 'Food Security', description: 'Food distribution and nutrition programs' },
    { icon: BookOpen, title: 'Education', description: 'School enrollment and educational support' },
    { icon: Shield, title: 'Protection', description: 'Safety, security, and legal assistance' },
    { icon: Briefcase, title: 'Livelihood', description: 'Employment and income generation support' }
  ];

  const benefits = [
    { icon: Clock, title: 'Time Efficient', description: 'Reduce administrative time by 60% with automated workflows' },
    { icon: Database, title: 'Centralized Data', description: 'All information in one secure, accessible database' },
    { icon: Smartphone, title: 'Mobile Ready', description: 'Works seamlessly on smartphones and tablets for field use' },
    { icon: Lock, title: 'Secure & Private', description: 'Enterprise-grade security with data encryption' },
    { icon: TrendingUp, title: 'Scalable', description: 'Grows with your organization from 10 to 10,000+ beneficiaries' },
    { icon: UserCheck, title: 'User Friendly', description: 'Intuitive interface requiring minimal training' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 illustration-bg">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </button>

        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl shadow-2xl mb-6 animate-float">
            <Shield className="w-11 h-11 sm:w-14 sm:h-14 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text mb-4 sm:mb-6">ReStore 360</h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed px-4">
            A comprehensive humanitarian coordination system designed to streamline the management of
            Internally Displaced Persons (IDPs) and returnees, enabling efficient case tracking,
            beneficiary registration, and data-driven decision-making.
          </p>
        </div>

        <div className="glass-effect rounded-3xl p-6 sm:p-10 lg:p-12 mb-12 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">About the Platform</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed text-base sm:text-lg">
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
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="glass-effect rounded-3xl p-6 sm:p-8 card-hover group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{feature.description}</p>
                  </div>
                </div>
                <div className="ml-0 sm:ml-18 mt-4 space-y-2">
                  {feature.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-success-600 flex-shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">Support Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((category, index) => (
              <div key={index} className="glass-effect rounded-2xl p-6 text-center card-hover group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:rotate-6 transition-transform">
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose ReStore 360?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="glass-effect rounded-2xl p-6 card-hover">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 rounded-3xl shadow-2xl p-8 sm:p-12 text-white mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">Who Can Use ReStore 360?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all card-hover">
              <Globe className="w-10 h-10 mb-3" />
              <h3 className="font-bold mb-2 text-lg">Humanitarian Organizations</h3>
              <p className="text-blue-100 text-sm">NGOs and aid agencies managing IDP programs and refugee assistance</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all card-hover">
              <Briefcase className="w-10 h-10 mb-3" />
              <h3 className="font-bold mb-2 text-lg">Government Agencies</h3>
              <p className="text-blue-100 text-sm">Disaster management and social welfare departments at all levels</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all card-hover">
              <Shield className="w-10 h-10 mb-3" />
              <h3 className="font-bold mb-2 text-lg">UN Organizations</h3>
              <p className="text-blue-100 text-sm">UNHCR, IOM, WFP, and other UN humanitarian agencies</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/signup')}
              variant="secondary"
              className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              size="lg"
            >
              Create Free Account
            </Button>
            <Button
              onClick={() => navigate('/login')}
              className="px-8 py-4 text-lg font-semibold bg-white text-primary-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              size="lg"
            >
              Sign In
            </Button>
          </div>
        </div>

        <div className="glass-effect rounded-3xl p-8 sm:p-10 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">Implementation Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-600">1</div>
              <h3 className="font-bold text-gray-900 mb-2">Sign Up</h3>
              <p className="text-sm text-gray-600">Create your organization account in minutes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-600">2</div>
              <h3 className="font-bold text-gray-900 mb-2">Configure</h3>
              <p className="text-sm text-gray-600">Set up users, roles, and workflows</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-600">3</div>
              <h3 className="font-bold text-gray-900 mb-2">Train</h3>
              <p className="text-sm text-gray-600">Quick training for your team members</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-600">4</div>
              <h3 className="font-bold text-gray-900 mb-2">Deploy</h3>
              <p className="text-sm text-gray-600">Start registering and managing cases</p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-6">
          <div className="glass-effect rounded-2xl p-6 inline-block">
            <p className="text-gray-700 text-sm sm:text-base mb-4">
              <span className="font-semibold">Need help getting started?</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@restore360.org"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all"
              >
                <Phone className="w-5 h-5" />
                Contact Support
              </a>
              <button
                onClick={() => navigate('/signup')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-xl font-medium hover:bg-primary-50 transform hover:scale-105 transition-all"
              >
                <Users className="w-5 h-5" />
                Request Demo
              </button>
            </div>
          </div>

          <p className="text-gray-600 text-sm">© 2024 ReStore 360. Comprehensive Humanitarian Coordination System for IDPs and Returnees.</p>
        </div>
      </div>
    </div>
  );
};
