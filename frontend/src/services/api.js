import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const message =
      status === 429
        ? '429: Too many requests — slowing down polling'
        : err.response?.data?.error ||
          err.response?.data?.detail ||
          err.message ||
          'An unexpected error occurred';
    const error = new Error(message);
    error.status = status;
    return Promise.reject(error);
  }
);

export const analyzeUrl = (url) =>
  api.post('/analyze/', { url }).then((r) => r.data.data);

export const startDownload = (url, quality, format) =>
  api.post('/download/', { url, quality, format }).then((r) => r.data);

export const getProgress = (taskId) =>
  api.get(`/progress/${taskId}/`).then((r) => r.data);

export const cancelDownload = (taskId) =>
  api.post(`/cancel/${taskId}/`).then((r) => r.data);

export const getHistory = () =>
  api.get('/history/').then((r) => r.data.data);

export const deleteHistory = (id) =>
  api.delete(`/history/${id}/`).then((r) => r.data);

export const getFileUrl = (taskId) => `/api/file/${taskId}/`;

export default api;