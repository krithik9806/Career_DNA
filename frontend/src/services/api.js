import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000 // 60s timeout for live LLM generation
});

// Interceptor to attach Bearer Token instantly
api.interceptors.request.use((config) => {
  const savedUserJson = localStorage.getItem('career_dna_demo_user');
  if (savedUserJson) {
    config.headers.Authorization = `Bearer demo-token-123`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
