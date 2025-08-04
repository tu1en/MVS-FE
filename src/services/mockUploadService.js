import { message } from 'antd';

/**
 * Mock upload service using base64 encoding
 * Completely bypasses backend file upload issues
 * Stores images as base64 data URLs for immediate display
 */
const MockUploadService = {
  /**
   * Mock upload file using base64 encoding
   * @param {File} file - The file to upload
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<string>} - The base64 data URL
   */
  async uploadFile(file, onProgress = null) {
    try {
      console.log('Starting mock base64 upload:', file.name);
      
      // Validate file type - accept all image types
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
        'image/bmp', 'image/webp', 'image/svg+xml', 'image/tiff'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Loại file không được hỗ trợ: ${file.type}. Chỉ chấp nhận các file ảnh.`);
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File quá lớn. Kích thước tối đa là 5MB.');
      }
      
      // Simulate upload progress
      if (onProgress) {
        onProgress(20);
        await new Promise(resolve => setTimeout(resolve, 200));
        onProgress(50);
        await new Promise(resolve => setTimeout(resolve, 200));
        onProgress(80);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Convert file to base64
      const base64 = await this.fileToBase64(file);
      
      if (onProgress) {
        onProgress(100);
      }
      
      console.log('Mock base64 upload successful, size:', base64.length);
      message.success(`Tải file "${file.name}" thành công! (Chế độ tạm thời)`);
      
      return base64;
      
    } catch (error) {
      console.error('Mock upload error:', error);
      message.error(`Lỗi tải file: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Convert file to base64 data URL
   * @param {File} file - The file to convert
   * @returns {Promise<string>} - Base64 data URL
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Không thể đọc file'));
      };
      
      reader.readAsDataURL(file);
    });
  }
};

export default MockUploadService;
