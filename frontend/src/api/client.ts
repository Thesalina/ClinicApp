import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Runs before every request — attaches the JWT from localStorage if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever says the token is invalid/expired (401), clear it
// and bounce to login rather than leaving the user stuck on a broken page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;