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
    
    if (data.accessToken) {
      localStorage.setItem('@SaaS:token', data.accessToken);
      localStorage.setItem('@SaaS:user', JSON.stringify(data.user));
    }
    
    return data;
  },

  async register(name: string, email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/register', { name, email, password });
    
    if (data.accessToken) {
      localStorage.setItem('@SaaS:token', data.accessToken);
      localStorage.setItem('@SaaS:user', JSON.stringify(data.user));
    }
    
    return data;
  },

  logout() {
    localStorage.removeItem('@SaaS:token');
    localStorage.removeItem('@SaaS:user');
    window.location.href = '/login';
  },

  getUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('@SaaS:user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }
};
