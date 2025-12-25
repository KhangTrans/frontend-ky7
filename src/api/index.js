import axiosInstance from './axiosConfig';

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },
  
  refreshToken: async () => {
    const response = await axiosInstance.post('/auth/refresh');
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
};

// User API (mẫu cho các API khác)
export const userAPI = {
  getProfile: async (userId) => {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  },
  
  updateProfile: async (userId, data) => {
    const response = await axiosInstance.put(`/users/${userId}`, data);
    return response.data;
  },
};

// Product API
export const productAPI = {
  getAll: async () => {
    const response = await axiosInstance.get('/products');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (productData) => {
    const response = await axiosInstance.post('/products', productData);
    return response.data;
  },
  
  update: async (id, productData) => {
    const response = await axiosInstance.put(`/products/${id}`, productData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  },
};

export default axiosInstance;
