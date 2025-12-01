import { supabase } from '../lib/supabase';
import { DashboardStats, ReportData } from '../types';

export const reportsApi = {
  getDashboardStats: async (userId?: string, userRole?: string): Promise<DashboardStats> => {
    const isAdmin = userRole === 'admin';

    let casesQuery = supabase.from('cases').select('*', { count: 'exact', head: true });
    let registrationsQuery = supabase.from('registrations').select('*', { count: 'exact', head: true });
    let openCasesQuery = supabase.from('cases').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress']);
    let pendingReferralsQuery = supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    let activityQuery = supabase
      .from('activity_logs')
      .select(`
        *,
        user:users(name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!isAdmin && userId) {
      casesQuery = casesQuery.eq('created_by', userId);
      registrationsQuery = registrationsQuery.eq('created_by', userId);
      openCasesQuery = openCasesQuery.eq('created_by', userId);
      pendingReferralsQuery = pendingReferralsQuery.eq('created_by', userId);
      activityQuery = activityQuery.eq('user_id', userId);
    }

    const [
      { count: totalCases },
      { count: totalRegistrations },
      { count: openCases },
      { count: pendingReferrals },
      { data: recentActivity }
    ] = await Promise.all([
      casesQuery,
      registrationsQuery,
      openCasesQuery,
      pendingReferralsQuery,
      activityQuery
    ]);

    return {
      total_cases: totalCases || 0,
      total_registrations: totalRegistrations || 0,
      open_cases: openCases || 0,
      pending_referrals: pendingReferrals || 0,
      recent_activity: recentActivity || [],
    };
  },

  generateReport: async (reportType: string, params: { start_date: string; end_date: string }): Promise<ReportData> => {
    return {
      report_type: reportType,
      start_date: params.start_date,
      end_date: params.end_date,
      data: {},
      generated_at: new Date().toISOString(),
    };
  },

  exportReport: async (reportType: string, params: { start_date: string; end_date: string; format: 'pdf' | 'excel' | 'csv' }): Promise<Blob> => {
    return new Blob(['Report export not yet implemented'], { type: 'text/plain' });
  },

  getCasesByStatus: async (): Promise<Record<string, number>> => {
    const { data } = await supabase
      .from('cases')
      .select('status');

    const statusCounts: Record<string, number> = {};
    data?.forEach(item => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    });

    return statusCounts;
  },

  getUserActivity: async (startDate: string, endDate: string): Promise<any[]> => {
    const { data } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:users(name, email)
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    return data || [];
  },
};
