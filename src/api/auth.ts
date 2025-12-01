import axiosInstance from './axiosInstance';
import { AuthResponse, LoginCredentials, User } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  signup: async (data: any): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/auth/reset-password', { token, password });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<User>('/auth/me');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },
};
