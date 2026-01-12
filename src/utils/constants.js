// Constants cho API
export const API_BASE_URL = 'https://backend-node-5re9.onrender.com/api';
export const API_TIMEOUT = 10000; // 10 seconds

// Frontend config - Sử dụng environment variables
export const API_CONFIG = {
  REST_URL: import.meta.env.VITE_API_REST_URL || 'https://backend-node-5re9.onrender.com',
  SOCKET_URL: import.meta.env.VITE_API_SOCKET_URL || 'https://backend-node-5re9.onrender.com'
};

// Constants cho authentication
export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

// Constants cho HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Constants cho error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền truy cập tài nguyên này.',
  NOT_FOUND: 'Không tìm thấy tài nguyên.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  DEFAULT: 'Có lỗi xảy ra. Vui lòng thử lại.',
};

// Constants cho routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  API_CONFIG,
  TOKEN_KEY,
  USER_KEY,
  HTTP_STATUS,
  ERROR_MESSAGES,
  ROUTES,
};
