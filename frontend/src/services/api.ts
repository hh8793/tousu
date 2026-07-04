import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: { username: string; password: string }) =>
    api.post('/users/login', data).then((res) => res.data),
  register: (data: any) => api.post('/users/register', data).then((res) => res.data),
  getProfile: () => api.get('/users/profile').then((res) => res.data)
};

export const complaintApi = {
  create: (data: any) => api.post('/complaints', data).then((res) => res.data),
  list: (params: any) => api.get('/complaints', { params }).then((res) => res.data),
  get: (id: string) => api.get(`/complaints/${id}`).then((res) => res.data),
  updateStatus: (id: string, data: any) =>
    api.put(`/complaints/${id}/status`, data).then((res) => res.data),
  addReply: (id: string, data: any) =>
    api.post(`/complaints/${id}/reply`, data).then((res) => res.data),
  submitSatisfaction: (id: string, data: any) =>
    api.post(`/complaints/${id}/satisfaction`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/complaints/${id}`).then((res) => res.data)
};

export const templateApi = {
  create: (data: any) => api.post('/reply-templates', data).then((res) => res.data),
  list: (params?: any) => api.get('/reply-templates', { params }).then((res) => res.data),
  get: (id: string) => api.get(`/reply-templates/${id}`).then((res) => res.data),
  update: (id: string, data: any) =>
    api.put(`/reply-templates/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/reply-templates/${id}`).then((res) => res.data),
  toggleStatus: (id: string) =>
    api.patch(`/reply-templates/${id}/toggle`).then((res) => res.data)
};

export const statisticsApi = {
  get: () => api.get('/statistics').then((res) => res.data)
};

export const userApi = {
  list: (params?: any) => api.get('/users', { params }).then((res) => res.data),
  update: (id: string, data: any) =>
    api.put(`/users/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/users/${id}`).then((res) => res.data)
};

export default api;