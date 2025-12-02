import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import { Button } from '../components/common';

export const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl shadow-xl mb-4 animate-scale-in">
          <Shield className="w-11 h-11 text-white" />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent animate-fade-in">
          ReStore 360
        </h1>

        <p className="text-lg sm:text-xl text-gray-700 max-w-xl mx-auto leading-relaxed animate-slide-up">
          Comprehensive Humanitarian Coordination System for IDPs and Returnees
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-8 py-4 text-lg flex items-center justify-center gap-2"
            size="lg"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Button>

          <Button
            onClick={() => navigate('/learn-more')}
            variant="secondary"
            className="w-full sm:w-auto px-8 py-4 text-lg"
            size="lg"
          >
            Learn More
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-primary-200 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Beneficiary Management</h3>
            <p className="text-sm text-gray-600">Register and track IDPs and returnees with comprehensive profiling</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-success-200 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="w-12 h-12 bg-gradient-to-br from-success-100 to-success-200 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Case Management</h3>
            <p className="text-sm text-gray-600">Track cases and referrals with full workflow management</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-accent-200 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Analytics & Reporting</h3>
            <p className="text-sm text-gray-600">Data-driven insights for better humanitarian response</p>
          </div>
        </div>
      </div>
    </div>
  );
};
