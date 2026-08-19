import axios from 'axios';

let inMemoryToken = typeof window !== 'undefined' ? localStorage.getItem('classvault_token') : null;

export const setAuthToken = (token) => {
  inMemoryToken = token;
};

export const getAuthToken = () => {
  return inMemoryToken || (typeof window !== 'undefined' ? localStorage.getItem('classvault_token') : null);
};

const client = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer Token
client.interceptors.request.use(
  (config) => {
    const token = inMemoryToken || (typeof window !== 'undefined' ? localStorage.getItem('classvault_token') : null);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 Unauthorized
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        inMemoryToken = null;
        localStorage.removeItem('classvault_token');
        localStorage.removeItem('classvault_refresh_token');
        localStorage.removeItem('classvault_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
