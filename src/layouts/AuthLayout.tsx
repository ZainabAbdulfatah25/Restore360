import { ReactNode } from 'react';
import { Shield, Users, TrendingUp } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 illustration-bg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 p-8 lg:p-12 flex-col justify-between relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>

          <div className="relative z-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl animate-float">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white">ReStore 360</h1>
                <p className="text-blue-100 text-sm font-medium">IDP Management System</p>
              </div>
            </div>

            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
              Humanitarian Coordination System
            </h2>
            <p className="text-blue-100 text-base lg:text-lg leading-relaxed">
              Comprehensive platform for managing and coordinating support for IDPs and Returnees
            </p>
          </div>

          <div className="relative z-10 space-y-4 animate-slide-up">
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/20 transition-all card-hover">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1 text-base">Easy Beneficiary Management</h3>
                <p className="text-blue-100 text-sm leading-relaxed">Simple tools to register and track IDPs with comprehensive profiling</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/20 transition-all card-hover">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1 text-base">Real-Time Analytics</h3>
                <p className="text-blue-100 text-sm leading-relaxed">Data-driven insights to understand impact and improve humanitarian response</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
};
