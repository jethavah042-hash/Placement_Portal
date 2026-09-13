import axios from 'axios';

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
const normalizedBaseUrl = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

const api = axios.create({
  baseURL: normalizedBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let queue = [];

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          queue.push({ resolve, reject })
        ).then(() => api(original));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');

        queue.forEach((p) => p.resolve());
        queue = [];

        return api(original);
      } catch (err) {
        queue.forEach((p) => p.reject(err));
        queue = [];

        window.location.href = '/login';

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;