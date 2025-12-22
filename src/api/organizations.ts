import { supabase } from '../lib/supabase';
import { Organization } from '../types';

export interface OrganizationFilterParams {
  location?: string;
  sector?: string;
  is_active?: boolean;
  state?: string;
}

export const organizationsApi = {
  getOrganizations: async (filters?: OrganizationFilterParams): Promise<Organization[]> => {
    let query = supabase
      .from('organizations')
      .select('*')
      .order('name', { ascending: true });

    // Apply filters
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    if (filters?.state) {
      query = query.eq('state', filters.state);
    }

    // Filter by location (array contains)
    if (filters?.location) {
      query = query.contains('locations_covered', [filters.location]);
    }

    // Filter by sector (array contains)
    if (filters?.sector) {
      query = query.contains('sectors_provided', [filters.sector]);
    }

    const { data, error } = await query;

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

  getActiveOrganizations: async (filters?: OrganizationFilterParams): Promise<Organization[]> => {
    return organizationsApi.getOrganizations({ ...filters, is_active: true });
  },

  // Filter organizations for referral matching
  getMatchingOrganizations: async (params: {
    location?: string;
    sector?: string;
    state?: string;
  }): Promise<Organization[]> => {
    return organizationsApi.getOrganizations({
      ...params,
      is_active: true, // Only active organizations can be assigned
    });
  },

  createOrganization: async (orgData: Partial<Organization>): Promise<Organization> => {
    const { data: user } = await supabase.auth.getUser();
    const dataToInsert: any = { ...orgData };

    // Ensure organization_name is set (use name if not provided)
    if (!dataToInsert.organization_name && dataToInsert.name) {
      dataToInsert.organization_name = dataToInsert.name;
    }

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

  updateOrganization: async (id: string, orgData: Partial<Organization>): Promise<Organization> => {
    const { data, error } = await supabase
      .from('organizations')
      .update({ ...orgData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  toggleActiveStatus: async (id: string, isActive: boolean): Promise<Organization> => {
    const { data, error } = await supabase
      .from('organizations')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};