import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401, 403, 500, and Refresh Token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      toast.error('System Failure: 500 Internal Server Error');
      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      toast.error('Access Denied: 403 Forbidden clearance required.');
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized (Token Expiration)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          if (res.status === 200) {
            localStorage.setItem('access_token', res.data.access);
            originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token is expired or invalid
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          toast.error('Session expired. Please reconnect.');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
