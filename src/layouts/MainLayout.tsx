import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  FileText,
  ArrowRightLeft,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  Building2,
} from 'lucide-react';
import { useAuth } from '../hooks';
import { useLanguage } from '../contexts/LanguageContext';
import { WelcomeMessage } from '../components/common';

interface MainLayoutProps {
  children: ReactNode;
}

const getNavigation = (t: (key: string) => string) => [
  { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
  { name: 'Admin', href: '/admin', icon: Shield, roles: ['admin', 'state_admin'] },
  { name: 'Organization', href: '/organization', icon: Building2, roles: ['organization', 'manager'] },
  { name: t('users'), href: '/users', icon: Users, roles: ['admin'] },
  { name: t('cases'), href: '/cases', icon: FolderOpen },
  { name: t('registrations'), href: '/registrations', icon: FileText },
  { name: t('referrals'), href: '/referrals', icon: ArrowRightLeft },
  { name: t('reports'), href: '/reports', icon: BarChart3, roles: ['admin', 'case_worker', 'organization'] },
  { name: t('settings'), href: '/settings', icon: Settings },
];

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const navigation = getNavigation(t);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredNavigation = navigation.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/20">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-primary-600 to-accent-600 shadow-lg px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-white" />
          <span className="text-lg font-bold text-white">Restore 360</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:bg-white/10 rounded-lg p-2 transition-colors">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="hidden lg:flex items-center gap-2 px-6 py-5 bg-gradient-to-r from-primary-600 to-accent-600">
            <FolderOpen className="w-7 h-7 text-white" />
            <span className="text-xl font-bold text-white">{t('app.name')}</span>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md transform scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white font-bold shadow-md">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t('logout')}
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="lg:pl-64 pt-14 lg:pt-0">
        <WelcomeMessage />
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
};
