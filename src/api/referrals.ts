import { supabase } from '../lib/supabase';
import { Referral, PaginatedResponse, PaginationParams } from '../types';

export const referralsApi = {
  getReferrals: async (params?: PaginationParams & { status?: string }): Promise<PaginatedResponse<Referral>> => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('referrals')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (params?.status) {
      query = query.eq('status', params.status);
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

  getReferral: async (id: string): Promise<Referral> => {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createReferral: async (referralData: Partial<Referral>): Promise<Referral> => {
    const { data: user } = await supabase.auth.getUser();

    const referralNumber = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const dataToInsert: any = {
      ...referralData,
      referral_number: referralNumber,
      status: referralData.status || 'pending',
      priority: referralData.priority || 'medium',
      referred_from: referralData.referred_from || 'Internal',
    };

    if (user?.user) {
      dataToInsert.created_by = user.user.id;
    }

    const { data, error } = await supabase
      .from('referrals')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error('Referral creation error:', error);
      throw error;
    }
    return data;
  },

  updateReferral: async (id: string, referralData: Partial<Referral>): Promise<Referral> => {
    const { data, error } = await supabase
      .from('referrals')
      .update({ ...referralData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateStatus: async (id: string, status: Referral['status']): Promise<Referral> => {
    const { data, error } = await supabase
      .from('referrals')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteReferral: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('referrals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // RENAMED from approveReferral to reflect 'Accept' terminology
  acceptReferral: async (id: string): Promise<Referral> => {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('referrals')
      .update({
        approval_status: 'accepted', // Updated from 'approved'
        status: 'accepted',
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

  // RENAMED from rejectReferral to reflect 'Decline' terminology
  declineReferral: async (id: string, reason: string): Promise<Referral> => {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('referrals')
      .update({
        approval_status: 'rejected',
        status: 'rejected',
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