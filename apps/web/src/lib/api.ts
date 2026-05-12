import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // O token agora vai via Cookie (HttpOnly), então não precisamos injetar manualmente o Authorization Header
  // a menos que o token ainda esteja no localStorage por transição.
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('@SaaS:token');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  }
  return config;
});

// Flag para evitar múltiplas chamadas simultâneas de refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success && response.data.data) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Se erro for 401 e não for uma tentativa de refresh ou login
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh token attempt silent
        // Tentamos o refresh (o cookie refresh_token será enviado automaticamente)
        const { data } = await api.post('/auth/refresh');
        
        // Se o backend ainda retornar o accessToken no body (para compatibilidade/migração)
        if (data.accessToken) {
          localStorage.setItem('@SaaS:token', data.accessToken);
          originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        }

        processQueue(null, data.accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed silent
        processQueue(refreshError, null);
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('@SaaS:token');
          localStorage.removeItem('@SaaS:user');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
