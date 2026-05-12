import { api } from '@/lib/api';
import { User, LoginResponse, AuthMessageResponse } from '@/types/auth';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
    
    if (data.user) {
      localStorage.setItem('@SaaS:user', JSON.stringify(data.user));
    }
    
    return data;
  },

  async register(name: string, email: string, password: string): Promise<{ userId: string; message: string }> {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Erro silenciado para o usuário final em logout
    } finally {
      localStorage.removeItem('@SaaS:token');
      localStorage.removeItem('@SaaS:user');
      localStorage.removeItem('@SaaS:onboarding-storage');
      localStorage.removeItem('@SaaS:chat-history');
      window.location.href = '/login';
    }
  },

  getUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('@SaaS:user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  async forgotPassword(email: string): Promise<AuthMessageResponse> {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, newPassword: string): Promise<AuthMessageResponse> {
    const { data } = await api.post('/auth/reset-password', { token, newPassword });
    return data;
  },

  async refreshToken(): Promise<string> {
    const { data } = await api.post('/auth/refresh');
    if (data.accessToken) {
      localStorage.setItem('@SaaS:token', data.accessToken);
    }
    return data.accessToken;
  }
};

export type { User, LoginResponse, AuthMessageResponse };
