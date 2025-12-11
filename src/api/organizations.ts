import { supabase } from '../lib/supabase';

export interface Organization {
  id: string;
  name: string;
  type: string;
  email: string;
  phone?: string;
  address?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  // New fields for Service Provider Management
  sectors_provided?: string[]; // Services/sectors offered
  locations_covered?: string[]; // List of locations covered
  is_active?: boolean; // Active/inactive status
}

export const organizationsApi = {
  getOrganizations: async (): Promise<Organization[]> => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  getOrganization: async (id: string): Promise<Organization> => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createOrganization: async (orgData: Partial<Organization>): Promise<Organization> => {
    const { data: user } = await supabase.auth.getUser();
    const dataToInsert: any = { ...orgData };

    if (user?.user) {
      dataToInsert.created_by = user.user.id;
    }

    const { data, error } = await supabase
      .from('organizations')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};