import { supabase } from '../lib/supabase';
import { Case, PaginatedResponse, PaginationParams } from '../types';

export const casesApi = {
  getCases: async (params?: PaginationParams & { status?: string; priority?: string; category?: string; filterByUser?: boolean }): Promise<PaginatedResponse<Case>> => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('cases')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (params?.filterByUser) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        query = query.eq('created_by', user.id);
      }
    }

    if (params?.status) {
      query = query.eq('status', params.status);
    }
    if (params?.priority) {
      query = query.eq('priority', params.priority);
    }
    if (params?.category) {
      query = query.eq('category', params.category);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    };
  },

  getCase: async (id: string): Promise<Case> => {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createCase: async (caseData: Partial<Case>): Promise<Case> => {
    const { data: user } = await supabase.auth.getUser();

    const caseNumber = `CASE-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const dataToInsert: any = {
      ...caseData,
      case_number: caseNumber,
      status: caseData.status || 'open',
      priority: caseData.priority || 'medium',
    };

    if (user?.user) {
      dataToInsert.created_by = user.user.id;
    }

    const { data, error } = await supabase
      .from('cases')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error('Case creation error:', error);
      throw error;
    }
    return data;
  },

  updateCase: async (id: string, caseData: Partial<Case>): Promise<Case> => {
    const { data, error } = await supabase
      .from('cases')
      .update({ ...caseData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteCase: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  assignCase: async (id: string, userId: string): Promise<Case> => {
    const { data, error } = await supabase
      .from('cases')
      .update({ assigned_to: userId, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateStatus: async (id: string, status: Case['status']): Promise<Case> => {
    const { data, error } = await supabase
      .from('cases')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  approveCase: async (id: string): Promise<Case> => {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('cases')
      .update({
        approval_status: 'approved',
        status: 'approved', // <--- FIX: Added status update here for counting
        approved_by: user?.user?.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  rejectCase: async (id: string, reason: string): Promise<Case> => {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('cases')
      .update({
        approval_status: 'rejected',
        approved_by: user?.user?.id,
        approved_at: new Date().toISOString(),
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};