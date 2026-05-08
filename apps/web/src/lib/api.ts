import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const allKeys = Object.keys(window.localStorage);
    console.log(`[API] Chaves no localStorage: ${allKeys.join(', ')}`);
    
    const token = window.localStorage.getItem('@SaaS:token');
    if (token) {
      console.log(`[API] Token encontrado: Bearer ${token.substring(0, 10)}...`);
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.warn(`[API] Requisição para ${config.url} SEM TOKEN no localStorage.`);
    }
  }
  return config;
});

// Interceptor para tratar erros globais (ex: 401 Unauthorized)
// Interceptor para tratar respostas e erros globais
api.interceptors.response.use(
  (response) => {
    // Se a resposta segue o padrão { success: true, data: ... }
    if (response.data && response.data.success && response.data.data) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      console.warn("[API] Recebido 401 do servidor. Removendo token do localStorage para segurança.");
      window.localStorage.removeItem('@SaaS:token');
    }
    return Promise.reject(error);
  }
);
