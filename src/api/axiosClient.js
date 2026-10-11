import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

// Session storage limits token persistence to the current browser tab/session.
api.interceptors.request.use((config) => {
  if (!config.skipAuth) {
    const token = sessionStorage.getItem('ap20_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      window.dispatchEvent(new CustomEvent('ap20:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error) {
  if (error?.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  if (!error?.response) return 'Cannot connect to the backend. Check that the server is running and the API URL is correct.';
  const status = error.response.status;
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to access this information.';
  return error.response.data?.message || error.response.data?.error || `Request failed (${status}).`;
}

export default api;
