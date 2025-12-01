import axiosInstance from './axiosInstance';
import { User, PaginatedResponse, PaginationParams } from '../types';

export const usersApi = {
  getUsers: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const response = await axiosInstance.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  getUser: async (id: string): Promise<User> => {
    const response = await axiosInstance.get<User>(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: Partial<User>): Promise<User> => {
    const response = await axiosInstance.post<User>('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await axiosInstance.put<User>(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },

  changePassword: async (id: string, oldPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post(`/users/${id}/change-password`, {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};
