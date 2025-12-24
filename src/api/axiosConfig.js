import axios from 'axios';

const API_BASE_URL = 'https://backend-node-lilac-seven.vercel.app/api';

// Tạo axios instance với config mặc định
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
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

    // Xử lý token hết hạn (401) - nhưng không phải khi login
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
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
      const errorMessage = error.response.data?.message || 'Có lỗi xảy ra!';
      // Throw error với message để dễ xử lý
      const customError = new Error(errorMessage);
      customError.response = error.response;
      customError.status = error.response.status;
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
