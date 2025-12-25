import { message } from 'antd';
import axiosInstance from '../api/axiosConfig';

/**
 * Convert file to base64 string
 * @param {File} file - File object to convert
 * @returns {Promise<string>} Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Upload single image to Cloudinary using base64
 * @param {File} file - Image file to upload
 * @param {string} folder - Cloudinary folder name (default: 'products')
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Object|null>} Upload result with url and publicId
 */
export const uploadImage = async (file, folder = 'products', onProgress = null) => {
  try {
    if (onProgress) onProgress(true);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      message.error('Chỉ được upload file ảnh!');
      if (onProgress) onProgress(false);
      return null;
    }

    // Validate file size (max 4MB cho Vercel free)
    const maxSize = 4 * 1024 * 1024; // 4MB
    if (file.size > maxSize) {
      message.error('Ảnh phải nhỏ hơn 4MB (giới hạn Vercel)!');
      if (onProgress) onProgress(false);
      return null;
    }
    
    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    const response = await axiosInstance.post('/upload/base64', {
      image: base64,
      folder: folder
    });

    if (onProgress) onProgress(false);
    
    if (response.data.success) {
      message.success('Upload ảnh thành công!');
      return {
        url: response.data.data.url,
        publicId: response.data.data.publicId,
        width: response.data.data.width,
        height: response.data.data.height,
        format: response.data.data.format,
        size: response.data.data.size,
      };
    }
    return null;
  } catch (error) {
    if (onProgress) onProgress(false);
    const errorMsg = error.response?.data?.message || error.message || 'Upload ảnh thất bại!';
    message.error(errorMsg);
    console.error('Upload image error:', error);
    return null;
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {File[]} fileList - Array of image files
 * @param {string} folder - Cloudinary folder name (default: 'products')
 * @param {Function} onProgress - Optional progress callback with (current, total)
 * @returns {Promise<Array|null>} Array of upload results
 */
export const uploadMultipleImages = async (fileList, folder = 'products', onProgress = null) => {
  try {
    const results = [];
    const total = fileList.length;
    
    // Upload từng ảnh một
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      if (onProgress) onProgress(i + 1, total);

      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          message.error(`${file.name} không phải file ảnh!`);
          continue;
        }

        // Validate file size (4MB cho Vercel)
        const maxSize = 4 * 1024 * 1024;
        if (file.size > maxSize) {
          message.error(`${file.name} quá lớn (>4MB)!`);
          continue;
        }

        // Convert to base64
        const base64 = await fileToBase64(file);
        
        const response = await axiosInstance.post('/upload/base64', {
          image: base64,
          folder: folder
        });

        if (response.data.success) {
          results.push({
            imageUrl: response.data.data.url,
            publicId: response.data.data.publicId,
            isPrimary: i === 0, // Ảnh đầu tiên là primary
            order: i,
            width: response.data.data.width,
            height: response.data.data.height,
            format: response.data.data.format,
          });
          message.success(`Upload ${file.name} thành công!`);
        }
      } catch (error) {
        console.error(`Upload ${file.name} failed:`, error);
        message.error(`Không thể upload ${file.name}: ${error.response?.data?.message || error.message}`);
      }
    }

    if (onProgress) onProgress(total, total);
    return results.length > 0 ? results : null;
  } catch (error) {
    console.error('Upload multiple images error:', error);
    return null;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteImage = async (publicId) => {
  try {
    const encodedPublicId = encodeURIComponent(publicId);
    const response = await axiosInstance.delete(`/upload/image/${encodedPublicId}`);
    
    if (response.data.success) {
      message.success('Xóa ảnh thành công!');
      return true;
    }
    return false;
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Xóa ảnh thất bại!';
    message.error(errorMsg);
    console.error('Delete image error:', error);
    return false;
  }
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Max size in MB (default: 4 cho Vercel)
 * @returns {Object} Validation result
 */
export const validateImageFile = (file, maxSizeMB = 4) => {
  const isImage = file.type.startsWith('image/');
  const isValidSize = file.size / 1024 / 1024 < maxSizeMB;

  return {
    valid: isImage && isValidSize,
    error: !isImage ? 'Chỉ được upload file ảnh!' : 
           !isValidSize ? `Ảnh phải nhỏ hơn ${maxSizeMB}MB!` : null
  };
};

export default {
  fileToBase64,
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  validateImageFile,
};
