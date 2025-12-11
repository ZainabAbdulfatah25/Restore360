import { supabase } from '../lib/supabase';
import { DashboardStats, ReportData } from '../types';

export const reportsApi = {
  getDashboardStats: async (userId?: string, userRole?: string): Promise<DashboardStats> => {
    const isAdmin = userRole === 'admin' || userRole === 'organization';

    let casesQuery = supabase.from('cases').select('*', { count: 'exact', head: true });
    let registrationsQuery = supabase.from('registrations').select('*', { count: 'exact', head: true });
    // UPDATED: Include 'approved' status in the 'open_cases' count for the dashboard
    let openCasesQuery = supabase.from('cases').select('*', { count: 'exact', head: true }).in('status', ['open', 'approved', 'in_progress']);
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
      // NOTE: This filter applies to the newly expanded 'openCasesQuery' too
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
    let data: any = {};

    switch (reportType) {
      case 'cases_summary':
        data = await reportsApi.getCasesSummaryData(params.start_date, params.end_date);
        break;
      case 'user_activity':
        data = await reportsApi.getUserActivity(params.start_date, params.end_date);
        break;
      case 'registrations':
        data = await reportsApi.getRegistrationsData(params.start_date, params.end_date);
        break;
      case 'referrals':
        data = await reportsApi.getReferralsData(params.start_date, params.end_date);
        break;
      default:
        data = { message: 'Unknown report type' };
    }

    return {
      report_type: reportType,
      start_date: params.start_date,
      end_date: params.end_date,
      data,
      generated_at: new Date().toISOString(),
    };
  },

  exportReport: async (reportType: string, params: { start_date: string; end_date: string; format: 'pdf' | 'excel' | 'csv' }): Promise<Blob> => {
    const report = await reportsApi.generateReport(reportType, params);

    if (params.format === 'csv') {
      return reportsApi.generateCSV(report);
    } else if (params.format === 'excel') {
      return reportsApi.generateCSV(report);
    } else {
      return reportsApi.generateCSV(report);
    }
  },

  getCasesSummaryData: async (startDate: string, endDate: string) => {
    const { data: cases } = await supabase
      .from('cases')
      .select(`
        *,
        assigned_user:users!cases_assigned_to_fkey(name, email),
        creator:users!cases_created_by_fkey(name, email)
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    const statusBreakdown = cases?.reduce((acc: any, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    const priorityBreakdown = cases?.reduce((acc: any, c) => {
      acc[c.priority] = (acc[c.priority] || 0) + 1;
      return acc;
    }, {});

    return {
      total: cases?.length || 0,
      cases,
      statusBreakdown,
      priorityBreakdown,
    };
  },

  getRegistrationsData: async (startDate: string, endDate: string) => {
    const { data: registrations } = await supabase
      .from('registrations')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    const statusBreakdown = registrations?.reduce((acc: any, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    const categoryBreakdown = registrations?.reduce((acc: any, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {});

    return {
      total: registrations?.length || 0,
      registrations,
      statusBreakdown,
      categoryBreakdown,
    };
  },

  getReferralsData: async (startDate: string, endDate: string) => {
    const { data: referrals } = await supabase
      .from('referrals')
      .select(`
        *,
        from_user:users!referrals_referred_by_fkey(name, email),
        to_user:users!referrals_referred_to_fkey(name, email)
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    const statusBreakdown = referrals?.reduce((acc: any, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: referrals?.length || 0,
      referrals,
      statusBreakdown,
    };
  },

  generateCSV: (report: ReportData): Blob => {
    let csvContent = '';

    csvContent += `Report Type: ${report.report_type}\n`;
    csvContent += `Generated At: ${new Date(report.generated_at).toLocaleString()}\n`;
    csvContent += `Date Range: ${report.start_date} to ${report.end_date}\n\n`;

    if (report.report_type === 'cases_summary' && report.data.cases) {
      csvContent += 'Cases Summary\n';
      csvContent += 'ID,Title,Status,Priority,Created At,Assigned To,Creator\n';
      report.data.cases.forEach((c: any) => {
        csvContent += `"${c.id}","${c.title}","${c.status}","${c.priority}","${c.created_at}","${c.assigned_user?.name || 'Unassigned'}","${c.creator?.name || 'Unknown'}"\n`;
      });
      csvContent += '\nStatus Breakdown\n';
      Object.entries(report.data.statusBreakdown || {}).forEach(([status, count]) => {
        csvContent += `"${status}","${count}"\n`;
      });
    } else if (report.report_type === 'registrations' && report.data.registrations) {
      csvContent += 'Registrations Report\n';
      csvContent += 'ID,Full Name,Phone,Category,Status,Created At\n';
      report.data.registrations.forEach((r: any) => {
        csvContent += `"${r.id}","${r.full_name}","${r.phone}","${r.category}","${r.status}","${r.created_at}"\n`;
      });
      csvContent += '\nStatus Breakdown\n';
      Object.entries(report.data.statusBreakdown || {}).forEach(([status, count]) => {
        csvContent += `"${status}","${count}"\n`;
      });
    } else if (report.report_type === 'referrals' && report.data.referrals) {
      csvContent += 'Referrals Report\n';
      csvContent += 'ID,From,To,Status,Notes,Created At\n';
      report.data.referrals.forEach((r: any) => {
        csvContent += `"${r.id}","${r.from_user?.name || 'Unknown'}","${r.to_user?.name || 'Unknown'}","${r.status}","${r.notes || ''}","${r.created_at}"\n`;
      });
    } else if (report.report_type === 'user_activity' && Array.isArray(report.data)) {
      csvContent += 'User Activity Report\n';
      csvContent += 'User,Action,Entity Type,Description,Timestamp\n';
      report.data.forEach((a: any) => {
        csvContent += `"${a.user?.name || 'Unknown'}","${a.action}","${a.entity_type}","${a.description || ''}","${a.created_at}"\n`;
      });
    }

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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