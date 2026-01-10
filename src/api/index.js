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

// Category API
export const categoryAPI = {
  getAll: async (params) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await axiosInstance.get(`/categories${queryString}`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axiosInstance.get(`/categories/${id}`);
    return response.data;
  },
  
  create: async (categoryData) => {
    const response = await axiosInstance.post('/categories', categoryData);
    return response.data;
  },
  
  update: async (id, categoryData) => {
    const response = await axiosInstance.put(`/categories/${id}`, categoryData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axiosInstance.delete(`/categories/${id}`);
    return response.data;
  },
};

// Cart API
export const cartAPI = {
  // Lấy giỏ hàng của user hiện tại
  getCart: async () => {
    const response = await axiosInstance.get('/cart');
    return response.data;
  },
  
  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (productId, quantity = 1) => {
    const response = await axiosInstance.post('/cart', { productId, quantity });
    return response.data;
  },
  
  // Cập nhật số lượng sản phẩm trong giỏ
  updateCartItem: async (productId, quantity) => {
    const response = await axiosInstance.put(`/cart/${productId}`, { quantity });
    return response.data;
  },
  
  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: async (productId) => {
    const response = await axiosInstance.delete(`/cart/${productId}`);
    return response.data;
  },
  
  // Xóa toàn bộ giỏ hàng
  clearCart: async () => {
    const response = await axiosInstance.delete('/cart');
    return response.data;
  },
};

// Address API
export const addressAPI = {
  getAll: async () => {
    const response = await axiosInstance.get('/addresses');
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post('/addresses', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await axiosInstance.put(`/addresses/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/addresses/${id}`);
    return response.data;
  },
};

// Order API
export const orderAPI = {
  create: async (orderData) => {
    const response = await axiosInstance.post('/orders', orderData);
    return response.data;
  },
  getAll: async () => {
    const response = await axiosInstance.get('/orders/my');
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data;
  },
};

// Payment API
export const paymentAPI = {
  createVNPayUrl: async (amount, orderId, orderInfo) => {
    const response = await axiosInstance.post('/payment/vnpay/create', { 
        amount, 
        orderId, 
        orderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
        locale: 'vn' 
    });
    return response.data;
  },
  createZaloPayUrl: async (amount, orderId, orderInfo) => {
    const response = await axiosInstance.post('/payment/zalopay/create', { 
        amount, 
        orderId, 
        orderInfo: orderInfo || `Thanh toan don hang ${orderId}`
    });
    return response.data;
  },
};

export default axiosInstance;
