/**
 * Retry một async function với số lần thử lại
 * @param {Function} fn - Async function cần retry
 * @param {number} retries - Số lần thử lại
 * @param {number} delay - Thời gian chờ giữa các lần thử (ms)
 */
export const retryAsync = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryAsync(fn, retries - 1, delay);
    }
    throw error;
  }
};

/**
 * Debounce function để tránh gọi API quá nhiều lần
 * @param {Function} func - Function cần debounce
 * @param {number} wait - Thời gian chờ (ms)
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function để giới hạn số lần gọi function
 * @param {Function} func - Function cần throttle
 * @param {number} limit - Thời gian giới hạn (ms)
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Format error message từ API response
 * @param {Object} error - Error object
 */
export const formatErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Có lỗi xảy ra. Vui lòng thử lại.';
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export default {
  retryAsync,
  debounce,
  throttle,
  formatErrorMessage,
  isTokenExpired,
};
