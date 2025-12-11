import { supabase } from '../lib/supabase';
import { ActivityLog, PaginatedResponse, PaginationParams } from '../types';

export interface ActivityLogPayload {
  user_id: string;
  action: string;
  module: string;
  description: string;
  device_id?: string;
  metadata?: Record<string, any>;
  resource_id?: string;
}

export const activityApi = {
  logActivity: async (data: ActivityLogPayload): Promise<ActivityLog> => {
    const { data: log, error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: data.user_id,
        action: data.action,
        resource_type: data.module,
        resource_id: data.resource_id,
        description: data.description,
        metadata: data.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return log as ActivityLog;
  },

  getActivityLogs: async (params?: PaginationParams & { user_id?: string; module?: string }): Promise<PaginatedResponse<ActivityLog>> => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (params?.user_id) {
      query = query.eq('user_id', params.user_id);
    }
    if (params?.module) {
      query = query.eq('resource_type', params.module);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data as ActivityLog[],
      page,
      limit,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / limit),
    };
  },

  getUserActivity: async (userId: string, params?: PaginationParams): Promise<PaginatedResponse<ActivityLog>> => {
    return activityApi.getActivityLogs({ ...params, user_id: userId });
  },
};
