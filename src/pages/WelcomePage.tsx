import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Users, FileText, BarChart3 } from 'lucide-react';
import { Button } from '../components/common';

export const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 illustration-bg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full">
          <div className="text-center space-y-6 mb-12 lg:mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl shadow-2xl mb-4">
              <Shield className="w-11 h-11 sm:w-14 sm:h-14 text-white" />
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold gradient-text animate-fade-in">
                ReStore 360
              </h1>
            </div>

            <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed animate-slide-up px-4">
              Humanitarian Coordination System for IDPs and Returnees
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-6 sm:pt-8 px-4">
              <Button
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                size="lg"
              >
                Register / Login
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
            <div
              onClick={() => navigate('/learn-more')}
              className="glass-effect rounded-3xl p-6 sm:p-8 card-hover group cursor-pointer"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:rotate-6 transition-transform">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Beneficiary Management</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Register and track IDPs and returnees with comprehensive profiling and real-time updates
              </p>
              <div className="mt-4 sm:mt-6 flex items-center text-primary-600 text-sm font-medium group-hover:gap-2 transition-all">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div
              onClick={() => navigate('/learn-more')}
              className="glass-effect rounded-3xl p-6 sm:p-8 card-hover group cursor-pointer"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:rotate-6 transition-transform">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Case Management</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Track cases and referrals with intelligent workflow management and status updates
              </p>
              <div className="mt-4 sm:mt-6 flex items-center text-success-600 text-sm font-medium group-hover:gap-2 transition-all">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div
              onClick={() => navigate('/learn-more')}
              className="glass-effect rounded-3xl p-6 sm:p-8 card-hover group cursor-pointer sm:col-span-2 lg:col-span-1"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:rotate-6 transition-transform">
                <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Analytics & Reporting</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Data-driven insights with real-time analytics for better humanitarian response decisions
              </p>
              <div className="mt-4 sm:mt-6 flex items-center text-accent-600 text-sm font-medium group-hover:gap-2 transition-all">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          {/* Optional bottom login button */}
          <div className="flex justify-center mt-12">
            <Button
              onClick={() => navigate('/login')}
              variant="secondary"
              className="px-6 py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              size="lg"
            >
              Staff Login
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};
