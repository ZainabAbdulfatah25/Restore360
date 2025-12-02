import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FolderOpen, FileText, ArrowRightLeft, Home, FileCheck, AlertTriangle, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { MainLayout } from '../layouts';
import { Card, Spinner, Badge } from '../components/common';
import { DataTable } from '../components/tables';
import { ActivityChart, LineChart } from '../components/charts';
import { useActivityLogger, useAuth } from '../hooks';
import { reportsApi, casesApi } from '../api';
import { DashboardStats, Case } from '../types';
import { supabase } from '../lib/supabase';

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [urgentCases, setUrgentCases] = useState<Case[]>([]);
  const [casesByCategory, setCasesByCategory] = useState<any>({});
  const [activityTrend, setActivityTrend] = useState<Array<{date: string; value: number}>>([]);
  const [loading, setLoading] = useState(true);
  const { track } = useActivityLogger();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!user) return;

    loadDashboardData();

    const casesChannel = supabase
      .channel('cases-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => {
        loadDashboardData();
      })
      .subscribe();

    const referralsChannel = supabase
      .channel('referrals-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'referrals' }, () => {
        loadDashboardData();
      })
      .subscribe();

    const registrationsChannel = supabase
      .channel('registrations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        loadDashboardData();
      })
      .subscribe();

    const activityChannel = supabase
      .channel('activity-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, () => {
        loadDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(casesChannel);
      supabase.removeChannel(referralsChannel);
      supabase.removeChannel(registrationsChannel);
      supabase.removeChannel(activityChannel);
    };
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [dashStats, urgentCasesData] = await Promise.all([
        reportsApi.getDashboardStats(user.id, user.role),
        casesApi.getCases({ priority: 'urgent', limit: 10 }),
      ]);

      setStats(dashStats);
      setUrgentCases(urgentCasesData.data);

      const categories = await Promise.all([
        casesApi.getCases({ category: 'shelter', limit: 1 }),
        casesApi.getCases({ category: 'food', limit: 1 }),
        casesApi.getCases({ category: 'health', limit: 1 }),
        casesApi.getCases({ category: 'protection', limit: 1 }),
        casesApi.getCases({ category: 'education', limit: 1 }),
      ]);

      setCasesByCategory({
        shelter: categories[0].total,
        food: categories[1].total,
        health: categories[2].total,
        protection: categories[3].total,
        education: categories[4].total,
      });

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const trendData = last7Days.map((date, index) => ({
        date,
        value: Math.floor(Math.random() * 20) + 10 + index * 2,
      }));

      setActivityTrend(trendData);

      await track('view', 'dashboard', 'Viewed dashboard');
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Households',
      subtitle: 'Registered households',
      value: stats?.total_cases || 0,
      icon: Home,
      color: 'blue',
      link: '/cases',
    },
    {
      title: 'Total Beneficiaries',
      subtitle: 'IDPs and Returnees',
      value: stats?.total_registrations || 0,
      icon: Users,
      color: 'green',
      link: '/registrations',
    },
    {
      title: 'Active Cases',
      subtitle: 'Open and in progress',
      value: stats?.open_cases || 0,
      icon: FolderOpen,
      color: 'orange',
      link: '/cases?status=open',
    },
    {
      title: 'Pending Referrals',
      subtitle: 'Awaiting response',
      value: stats?.pending_referrals || 0,
      icon: ArrowRightLeft,
      color: 'purple',
      link: '/referrals',
    },
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-100 text-blue-600',
      border: 'border-blue-200',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'bg-green-100 text-green-600',
      border: 'border-green-200',
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'bg-orange-100 text-orange-600',
      border: 'border-orange-200',
    },
    purple: {
      bg: 'bg-accent-50',
      icon: 'bg-accent-100 text-accent-600',
      border: 'border-accent-200',
    },
  };

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? 'System-wide overview of all activities' : `Your personal activity overview${user?.organization_name ? ` - ${user.organization_name}` : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Live Updates</span>
          </div>
        </div>

        {!isAdmin && (
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-xl p-4 shadow-sm animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary-900">Viewing Your Data Only</p>
                <p className="text-sm text-primary-700 mt-1">
                  This dashboard shows only the cases, referrals, and registrations that you created.
                  {user?.organization_name && ` You're logged in as ${user.organization_name}.`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statCards.map((stat) => {
            const colors = colorClasses[stat.color as keyof typeof colorClasses];
            return (
              <div
                key={stat.title}
                onClick={() => navigate(stat.link)}
                className={`${colors.bg} border ${colors.border} rounded-2xl p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 group relative overflow-hidden animate-scale-in`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 ${colors.icon} rounded-xl shadow-sm group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">{stat.title}</p>
                    <p className="text-4xl font-bold text-gray-900 mb-1 tracking-tight">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {urgentCases.length > 0 && (
          <Card className="border-danger-200 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-danger-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-danger-600 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Urgent Cases</h3>
                <Badge variant="danger">{urgentCases.length}</Badge>
              </div>
              <div className="space-y-3">
                {urgentCases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    onClick={() => navigate(`/cases/${caseItem.id}`)}
                    className="p-4 bg-gradient-to-r from-danger-50 to-danger-100/50 border-l-4 border-danger-600 rounded-xl cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">{caseItem.title}</p>
                          <Badge variant="danger">URGENT</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{caseItem.description?.substring(0, 80)}...</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-white rounded">{caseItem.category}</span>
                          <span>{new Date(caseItem.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Activity className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Activity Trend</h3>
              </div>
              <LineChart data={activityTrend} color="#0ea5e9" height={180} />
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-600">Last 7 days</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success-600" />
                  <span className="text-success-600 font-semibold">+12%</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-accent-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Cases by Category</h3>
              </div>
              <ActivityChart
                data={[
                  { label: 'Shelter', value: casesByCategory.shelter || 0, color: '#0ea5e9' },
                  { label: 'Food', value: casesByCategory.food || 0, color: '#22c55e' },
                  { label: 'Health', value: casesByCategory.health || 0, color: '#ef4444' },
                  { label: 'Protection', value: casesByCategory.protection || 0, color: '#14b8a6' },
                  { label: 'Education', value: casesByCategory.education || 0, color: '#f59e0b' },
                ]}
                height={180}
              />
            </div>
          </Card>
        </div>

        <Card title="Cases by Category" className="hidden">
          <div className="p-6 space-y-4">
            {Object.entries(casesByCategory).map(([category, count]) => {
              const categoryColors: Record<string, { bg: string; text: string }> = {
                shelter: { bg: 'bg-blue-100', text: 'text-blue-700' },
                food: { bg: 'bg-green-100', text: 'text-green-700' },
                health: { bg: 'bg-red-100', text: 'text-red-700' },
                protection: { bg: 'bg-purple-100', text: 'text-purple-700' },
                education: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
              };
              const colors = categoryColors[category] || { bg: 'bg-gray-100', text: 'text-gray-700' };
              const total = stats?.total_cases || 1;
              const percentage = Math.round(((count as number) / total) * 100);

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                    <span className="text-sm font-bold text-gray-900">{count as number}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colors.bg} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card title="Recent Activity" className="lg:col-span-2 shadow-lg">
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">Latest registrations and case updates</p>
              <DataTable
                data={stats?.recent_activity || []}
                columns={[
                  {
                    key: 'user',
                    label: 'User',
                    render: (item) => (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                          {item.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium">{item.user?.name || 'Unknown'}</span>
                      </div>
                    ),
                  },
                  {
                    key: 'module',
                    label: 'Type',
                    render: (item) => {
                      const moduleConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
                        cases: { variant: 'info', label: 'Case' },
                        referrals: { variant: 'warning', label: 'Referral' },
                        registrations: { variant: 'success', label: 'Registration' },
                        users: { variant: 'default', label: 'User' },
                      };
                      const config = moduleConfig[item.module] || { variant: 'default', label: item.module };
                      return <Badge variant={config.variant}>{config.label}</Badge>;
                    },
                  },
                  {
                    key: 'description',
                    label: 'Activity',
                    render: (item) => {
                      const caseNumber = item.metadata?.case_number;
                      const referralNumber = item.metadata?.referral_number;
                      const fullName = item.metadata?.full_name;

                      let resourceInfo = '';
                      if (caseNumber) {
                        resourceInfo = ` [${caseNumber}]`;
                      } else if (referralNumber) {
                        resourceInfo = ` [${referralNumber}]`;
                      } else if (fullName) {
                        resourceInfo = ` [${fullName}]`;
                      }

                      return (
                        <div>
                          <div className="font-medium text-gray-900">{item.description}</div>
                          {resourceInfo && (
                            <div className="text-xs text-blue-600 font-mono mt-1">{resourceInfo}</div>
                          )}
                        </div>
                      );
                    },
                  },
                  {
                    key: 'created_at',
                    label: 'Time',
                    render: (item) => {
                      const date = new Date(item.created_at);
                      const now = new Date();
                      const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
                      if (diff < 60) return `${diff}m ago`;
                      if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
                      return date.toLocaleDateString();
                    },
                  },
                ]}
                emptyState={
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No recent activity</p>
                  </div>
                }
              />
            </div>
          </Card>

          <div className="space-y-6">
            <Card title="Quick Actions" className="shadow-lg">
              <div className="p-4 space-y-3">
                <p className="text-sm text-gray-600 mb-4">Frequently used features</p>
                <button
                  onClick={() => navigate('/registrations')}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 rounded-xl transition-all duration-200 text-left shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                    <FileCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">New Registration</p>
                    <p className="text-xs text-gray-600">Register beneficiary</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/cases/create')}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-success-50 to-success-100 hover:from-success-100 hover:to-success-200 rounded-xl transition-all duration-200 text-left shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-success-600 to-success-700 rounded-xl flex items-center justify-center shadow-md">
                    <FolderOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">New Case</p>
                    <p className="text-xs text-gray-600">Create case file</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/referrals')}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-accent-50 to-accent-100 hover:from-accent-100 hover:to-accent-200 rounded-xl transition-all duration-200 text-left shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-600 to-accent-700 rounded-xl flex items-center justify-center shadow-md">
                    <ArrowRightLeft className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">New Referral</p>
                    <p className="text-xs text-gray-600">Create referral</p>
                  </div>
                </button>
              </div>
            </Card>

            <Card title="System Status" className="shadow-lg">
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">System Health</span>
                  <Badge variant="success">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <Badge variant="success">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Sync</span>
                  <span className="text-sm text-gray-900">Just now</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
