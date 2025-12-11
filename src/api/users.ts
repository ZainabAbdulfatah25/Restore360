import { supabase } from '../lib/supabase';
import { User, PaginatedResponse, PaginationParams } from '../types';

export const usersApi = {
  getUsers: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    // Use the helper function to get all users (admin only)
    const { data, error } = await supabase.rpc('get_all_users');

    if (error) {
      throw new Error(error.message);
    }

    const users = (data || []) as User[];
    const total = users.length;
    const paginatedUsers = users.slice(offset, offset + limit);

    return {
      data: paginatedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  getUser: async (id: string): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('User not found');
    }

    return data as User;
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email!,
      password: userData.password || Math.random().toString(36).slice(-12),
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          name: userData.name,
          role: userData.role,
        }
      }
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Failed to create user');
    }

    // Then create/update the user profile using the admin function
    const { data, error } = await supabase.rpc('admin_create_user', {
      p_id: authData.user.id,
      p_email: userData.email!,
      p_name: userData.name!,
      p_role: userData.role!,
      p_phone: userData.phone || null,
      p_department: userData.department || null,
      p_organization_name: userData.organization_name || null,
      p_organization_type: userData.organization_type || null,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data as User;
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as User;
  },

  deleteUser: async (id: string): Promise<void> => {
    // Call RPC function to delete user (requires admin permissions)
    const { error } = await supabase.rpc('admin_delete_user', {
      user_id: id
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  changePassword: async (id: string, oldPassword: string, newPassword: string): Promise<{ message: string }> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Password changed successfully' };
  },
};
