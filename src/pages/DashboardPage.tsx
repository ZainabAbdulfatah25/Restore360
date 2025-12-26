import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FolderOpen, FileText, ArrowRightLeft, Home, FileCheck, AlertTriangle, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { MainLayout } from '../layouts';
import { Card, Spinner, Badge } from '../components/common';
import { DataTable } from '../components/tables';
import { ActivityChart } from '../components/charts';
import { useActivityLogger, useAuth } from '../hooks';
import { reportsApi, casesApi } from '../api';
import { DashboardStats, Case } from '../types';
import { supabase } from '../lib/supabase';

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [urgentCases, setUrgentCases] = useState<Case[]>([]);
  const [casesByCategory, setCasesByCategory] = useState<any>({});
  const [activityTrend, setActivityTrend] = useState<Array<{ date: string; cases: number; referrals: number; registrations: number; label: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const { track } = useActivityLogger();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const canSeeAll = user?.role === 'admin' || user?.role === 'organization';

  useEffect(() => {
    if (!user) return;

    loadDashboardData();

    const casesChannel = supabase
      .channel('cases-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => {
        setIsLive(false);
        setTimeout(() => setIsLive(true), 1000);
        loadDashboardData();
      })
      .subscribe();

    const referralsChannel = supabase
      .channel('referrals-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'referrals' }, () => {
        setIsLive(false);
        setTimeout(() => setIsLive(true), 1000);
        loadDashboardData();
      })
      .subscribe();

    const registrationsChannel = supabase
      .channel('registrations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        setIsLive(false);
        setTimeout(() => setIsLive(true), 1000);
        loadDashboardData();
      })
      .subscribe();

    const activityChannel = supabase
      .channel('activity-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, () => {
        setIsLive(false);
        setTimeout(() => setIsLive(true), 1000);
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
        casesApi.getCases({ priority: 'urgent', limit: 10, page: 1, filterByUser: !canSeeAll }),
      ]);

      setStats(dashStats);
      setUrgentCases(urgentCasesData.data);

      const categories = await Promise.all([
        casesApi.getCases({ category: 'shelter', limit: 1, page: 1, filterByUser: !canSeeAll }),
        casesApi.getCases({ category: 'food', limit: 1, page: 1, filterByUser: !canSeeAll }),
        casesApi.getCases({ category: 'health', limit: 1, page: 1, filterByUser: !canSeeAll }),
        casesApi.getCases({ category: 'protection', limit: 1, page: 1, filterByUser: !canSeeAll }),
        casesApi.getCases({ category: 'education', limit: 1, page: 1, filterByUser: !canSeeAll }),
      ]);

      setCasesByCategory({
        shelter: categories[0].total,
        food: categories[1].total,
        health: categories[2].total,
        protection: categories[3].total,
        education: categories[4].total,
      });

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      let casesActivityQuery = supabase
        .from('cases')
        .select('created_at')
        .gte('created_at', sevenDaysAgo);

      let registrationsActivityQuery = supabase
        .from('registrations')
        .select('created_at')
        .gte('created_at', sevenDaysAgo);

      let referralsActivityQuery = supabase
        .from('referrals')
        .select('created_at')
        .gte('created_at', sevenDaysAgo);

      if (!canSeeAll) {
        casesActivityQuery = casesActivityQuery.eq('created_by', user.id);
        registrationsActivityQuery = registrationsActivityQuery.eq('created_by', user.id);
        referralsActivityQuery = referralsActivityQuery.eq('created_by', user.id);
      }

      const [
        { data: casesActivity },
        { data: registrationsActivity },
        { data: referralsActivity }
      ] = await Promise.all([
        casesActivityQuery,
        registrationsActivityQuery,
        referralsActivityQuery
      ]);

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const activityByDay = last7Days.map(date => {
        const cases = casesActivity?.filter(item =>
          item.created_at.split('T')[0] === date
        ).length || 0;

        const referrals = referralsActivity?.filter(item =>
          item.created_at.split('T')[0] === date
        ).length || 0;

        const registrations = registrationsActivity?.filter(item =>
          item.created_at.split('T')[0] === date
        ).length || 0;

        return {
          date,
          cases,
          referrals,
          registrations,
          label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
        };
      });

      setActivityTrend(activityByDay);

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
      description: 'Total number of registered households in the system',
      value: stats?.total_cases || 0,
      icon: Home,
      color: 'blue',
      link: '/cases',
    },
    {
      title: 'Total Beneficiaries',
      subtitle: 'IDPs and Returnees',
      description: 'Internally displaced persons and returnees registered',
      value: stats?.total_registrations || 0,
      icon: Users,
      color: 'green',
      link: '/registrations',
    },
    {
      title: 'Active Cases',
      // UPDATED: Description to include approved cases
      subtitle: 'Open, Approved, and In Progress',
      description: 'Cases currently being processed or awaiting action',
      value: stats?.open_cases || 0,
      icon: FolderOpen,
      color: 'orange',
      link: '/cases?status=open',
    },
    {
      title: 'Pending Referrals',
      subtitle: 'Awaiting response',
      description: 'Referrals sent to organizations awaiting response',
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
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                {isAdmin ? 'System-wide overview of all activities' : `Your personal activity overview${user?.organization_name ? ` - ${user.organization_name}` : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-xs font-medium text-gray-600">
                {isLive ? 'Live' : 'Updating...'}
              </span>
            </div>
          </div>
        </div>


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
                    <p className="text-xs text-gray-500 mb-2">{stat.subtitle}</p>
                    <p className="text-xs text-gray-600 mt-2">{stat.description}</p>
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
                <div className="p-2 bg-accent-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-accent-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Cases by Category</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">Distribution of cases across support categories</p>
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

            <Card className="shadow-lg">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Activity Trend</h3>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-600">Live</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">Real-time user activity over the last 7 days</p>

                <div className="space-y-3">
                  {activityTrend.map((day, index) => {
                    const total = day.cases + day.referrals + day.registrations;
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{day.label}</span>
                          <span className="text-sm font-bold text-gray-900">{total}</span>
                        </div>
                        <div className="flex w-full h-8 rounded-lg overflow-hidden bg-gray-200">
                          {day.cases > 0 && (
                            <div
                              className="bg-blue-500 flex items-center justify-center text-xs text-white font-medium"
                              style={{ width: `${(day.cases / Math.max(total, 1)) * 100}%` }}
                              title={`Cases: ${day.cases}`}
                            >
                              {day.cases > 0 && day.cases}
                            </div>
                          )}
                          {day.referrals > 0 && (
                            <div
                              className="bg-teal-500 flex items-center justify-center text-xs text-white font-medium"
                              style={{ width: `${(day.referrals / Math.max(total, 1)) * 100}%` }}
                              title={`Referrals: ${day.referrals}`}
                            >
                              {day.referrals > 0 && day.referrals}
                            </div>
                          )}
                          {day.registrations > 0 && (
                            <div
                              className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                              style={{ width: `${(day.registrations / Math.max(total, 1)) * 100}%` }}
                              title={`Registrations: ${day.registrations}`}
                            >
                              {day.registrations > 0 && day.registrations}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-600">Last 7 days</span>
                    <span className="text-gray-900 font-medium">
                      Total: {activityTrend.reduce((sum, item) => sum + item.cases + item.referrals + item.registrations, 0)} activities
                    </span>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-500"></div>
                      <span className="text-xs text-gray-600">Cases ({activityTrend.reduce((sum, item) => sum + item.cases, 0)})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-teal-500"></div>
                      <span className="text-xs text-gray-600">Referrals ({activityTrend.reduce((sum, item) => sum + item.referrals, 0)})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500"></div>
                      <span className="text-xs text-gray-600">Registrations ({activityTrend.reduce((sum, item) => sum + item.registrations, 0)})</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Activity List */}
            <Card title="Recent Activity" className="shadow-lg">
              <div className="p-4">
                <div className="space-y-4">
                  {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                    stats.recent_activity.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <Activity className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {log.user?.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {log.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                  <button
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    onClick={() => navigate('/reports')} // Assuming reports page has full logs
                  >
                    View Full History
                  </button>
                </div>
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