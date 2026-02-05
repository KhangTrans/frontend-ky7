import axios from 'axios';
import { API_CONFIG } from '../utils/constants';

// Sử dụng proxy khi dev, full URL khi production
// Sử dụng biến môi trường hoặc proxy
const API_BASE_URL = import.meta.env.VITE_API_REST_URL || '/api';

// Tạo axios instance với config mặc định
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor - Tự động thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi tập trung
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Xử lý token hết hạn (401) - nhưng không phải khi login hoặc chatbot/notification (để tránh loop cho guest)
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/chatbot') && !originalRequest.url.includes('/notifications')) {
      originalRequest._retry = true;
      
      // Xóa token và chuyển về login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      
      return Promise.reject(error);
    }

    // Xử lý các lỗi khác - giữ nguyên structure để dễ xử lý
    if (error.response) {
      // Server trả về response với status code khác 2xx
      const backendMsg = error.response.data?.message || 'Có lỗi xảy ra!';
      const backendError = error.response.data?.error || '';
      const fullMessage = backendError ? `${backendMsg} (${backendError})` : backendMsg;
      
      // Throw error với message để dễ xử lý
      const customError = new Error(fullMessage);
      customError.response = error.response;
      customError.status = error.response.status;
      customError.config = error.config; // Attach config to debug URL
      return Promise.reject(customError);
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      const customError = new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      return Promise.reject(customError);
    } else {
      // Lỗi khác trong quá trình setup request
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;
