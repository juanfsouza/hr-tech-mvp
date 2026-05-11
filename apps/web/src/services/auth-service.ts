import { api } from '@/lib/api';

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    companyId?: string;
    role: string;
  };
}

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
      console.error("[Auth] Erro ao deslogar no backend:", error);
    } finally {
      localStorage.removeItem('@SaaS:token');
      localStorage.removeItem('@SaaS:user');
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

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/reset-password', { token, newPassword });
    return data;
  }
};
