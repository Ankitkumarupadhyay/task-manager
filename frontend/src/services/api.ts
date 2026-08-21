import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 (only redirect if NOT on login endpoint)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail: string }>) => {
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail: string | { msg: string }[] }>;
    const detail = axiosError.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((d) => (typeof d === 'object' ? d.msg : d)).join(', ');
    }
    if (axiosError.response?.status === 400) return 'Invalid request format or credentials.';
    if (axiosError.response?.status === 401) return 'Invalid email or password.';
    if (axiosError.response?.status === 403) return 'You do not have permission to perform this action.';
    if (axiosError.response?.status === 404) return 'The requested resource was not found.';
    if (axiosError.response?.status === 503) return 'External service unavailable. Please try again later.';
  }
  return 'An unexpected error occurred. Please try again.';
}

export default api;
