import { supabase } from '../lib/supabase';
import { Registration, PaginatedResponse, PaginationParams } from '../types';

export const registrationsApi = {
  getRegistrations: async (params?: PaginationParams & { status?: string; category?: string }): Promise<PaginatedResponse<Registration>> => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('registrations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (params?.status) {
      query = query.eq('status', params.status);
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

  getRegistration: async (id: string): Promise<Registration> => {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createRegistration: async (formData: FormData | any): Promise<Registration> => {
    const data: any = {};

    if (formData instanceof FormData) {
      for (const [key, value] of formData.entries()) {
        if (key === 'location') {
          try {
            data[key] = JSON.parse(value as string);
          } catch {
            data[key] = value;
          }
        } else if (key !== 'attachments') {
          data[key] = value;
        }
      }
    } else {
      Object.assign(data, formData);
    }

    const { data: user } = await supabase.auth.getUser();
    if (user?.user) {
      data.created_by = user.user.id;
    }

    const { data: registration, error } = await supabase
      .from('registrations')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return registration;
  },

  updateRegistration: async (id: string, data: Partial<Registration>): Promise<Registration> => {
    const { data: registration, error } = await supabase
      .from('registrations')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return registration;
  },

  updateStatus: async (id: string, status: Registration['status']): Promise<Registration> => {
    const { data: registration, error } = await supabase
      .from('registrations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return registration;
  },

  deleteRegistration: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  approveRegistration: async (id: string): Promise<Registration> => {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('registrations')
      .update({
        approval_status: 'approved',
        status: 'approved',
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

  rejectRegistration: async (id: string, reason: string): Promise<Registration> => {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('registrations')
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
