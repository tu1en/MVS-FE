/**
 * Utility functions for course management system
 */

/**
 * Validate video URL
 * @param {string} url - Video URL to validate
 * @returns {boolean} Whether URL is valid
 */
export const isValidVideoUrl = (url) => {
  if (!url || !url.trim()) return true; // Empty URL is valid (optional field)
  
  const videoPatterns = [
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]+)/, // YouTube
    /^https?:\/\/youtu\.be\/([\w-]+)/, // YouTube short
    /^https?:\/\/(?:www\.)?vimeo\.com\/\d+/, // Vimeo
    /^https?:\/\/.*\.(mp4|avi|mov|mkv|webm)$/, // Direct video files
    /^https?:\/\/.*zoom\.us\/.+/, // Zoom links
    /^https?:\/\/.*meet\.google\.com\/.+/, // Google Meet
  ];
  
  return videoPatterns.some(pattern => pattern.test(url.trim()));
};

/**
 * Format date to Vietnamese locale
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('vi-VN');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format date and time to Vietnamese locale
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date time string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleString('vi-VN');
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return dateString;
  }
};

/**
 * Get status badge configuration
 * @param {string} status - Status value
 * @returns {Object} Badge configuration with bg, text, and label
 */
export const getStatusBadge = (status) => {
  const statusMap = {
    'ACTIVE': { bg: 'bg-green-100', text: 'text-green-800', label: 'Đang hoạt động' },
    'PLANNING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đang lên kế hoạch' },
    'COMPLETED': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã hoàn thành' },
    'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
    'active': { bg: 'bg-green-100', text: 'text-green-800', label: 'Hoạt động' },
    'draft': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Nháp' },
    'pending': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Chờ duyệt' }
  };
  
  return statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status || 'Không xác định' };
};

/**
 * Show notification toast
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 */
export const showNotification = (message, type = 'info') => {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 transition-all duration-300 transform translate-x-0 ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
  }`;
  
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  
  notification.innerHTML = `
    <div class="flex items-center">
      <span class="mr-2 text-lg">${icon}</span>
      <span class="font-medium">${message}</span>
      <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
        ×
      </button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }
  }, 5000);
};

/**
 * Show confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @returns {Promise<boolean>} User confirmation result
 */
export const showConfirmDialog = (title, message) => {
  return new Promise((resolve) => {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    resolve(confirmed);
  });
};

/**
 * Validate class form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation errors object
 */
export const validateClassForm = (formData) => {
  const validation = {};
  
  if (!formData.className?.trim()) {
    validation.className = 'Tên lớp học là bắt buộc';
  } else if (formData.className.length < 3) {
    validation.className = 'Tên lớp học phải có ít nhất 3 ký tự';
  }

  if (!formData.teacherId) validation.teacherId = 'Vui lòng chọn giáo viên';
  // roomId có thể được tự gán hoặc chọn thủ công, không bắt buộc ở đây
  // if (!formData.roomId) validation.roomId = 'Vui lòng chọn phòng học';
  if (!formData.startDate) validation.startDate = 'Vui lòng chọn ngày bắt đầu';
  // End date có thể để trống: BE sẽ tự tính nếu không nhập
  
  if (formData.startDate && formData.endDate && 
      new Date(formData.startDate) >= new Date(formData.endDate)) {
    validation.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
  }

  if (!formData.schedule?.days?.length) {
    validation.scheduleDays = 'Vui lòng chọn ít nhất 1 ngày học';
  }

  if (!formData.schedule?.startTime || !formData.schedule?.endTime) {
    validation.scheduleTime = 'Vui lòng chọn giờ học';
  }

  if (formData.maxStudents < 1 || formData.maxStudents > 100) {
    validation.maxStudents = 'Số học viên phải từ 1 đến 100';
  }

  // Validate video URL if provided
  if (formData.introVideoUrl && !isValidVideoUrl(formData.introVideoUrl)) {
    validation.introVideoUrl = 'URL video không hợp lệ. Hỗ trợ: YouTube, Vimeo, Zoom, Google Meet';
  }

  return validation;
};

/**
 * Validate import form data
 * @param {Object} formData - Import form data
 * @returns {Object} Validation errors object
 */
export const validateImportForm = (formData) => {
  const validation = {};
  
  if (!formData.courseName?.trim()) {
    validation.courseName = 'Tên khóa học là bắt buộc';
  }
  
  if (!formData.file) {
    validation.file = 'Vui lòng chọn file Excel';
  } else if (!formData.file.name.match(/\.(xlsx|xls)$/)) {
    validation.file = 'File phải có định dạng .xlsx hoặc .xls';
  } else if (formData.file.size > 10 * 1024 * 1024) { // 10MB
    validation.file = 'File không được vượt quá 10MB';
  }

  return validation;
};

/**
 * Parse Excel file preview - Fixed implementation with proper Excel reading
 * @param {File} file - Excel file
 * @returns {Promise<Array>} Parsed data preview
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Không có file được chọn'));
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      reject(new Error('File phải có định dạng Excel (.xlsx, .xls)'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      // Real Excel parsing using SheetJS
      // Install: npm install xlsx
      try {
        // Import SheetJS - use dynamic import with .then()
        import('xlsx').then((XLSX) => {
          try {
            const arrayBuffer = e.target.result;
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            // Get first worksheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON with headers
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              header: 1, // Use first row as headers
              defval: '', // Default value for empty cells
              raw: false // Format all cells as text
            });
            
            if (jsonData.length === 0) {
              reject(new Error('File Excel trống hoặc không có dữ liệu'));
              return;
            }
            
            // Process the data
            const headers = jsonData[0];
            const rows = jsonData.slice(1);
            
            const processedData = rows
              .filter(row => row.some(cell => cell && cell.toString().trim())) // Remove empty rows
              .map((row, index) => {
                const rowData = {};
                headers.forEach((header, colIndex) => {
                  if (header) {
                    const cellValue = row[colIndex] || '';
                    // Map common Vietnamese Excel headers to expected format
                    let fieldName = header.toString().toLowerCase().trim();
                    
                    // Common field mappings
                    if (fieldName.includes('tuần') || fieldName.includes('week')) {
                      fieldName = 'week';
                    } else if (fieldName.includes('chủ đề') || fieldName.includes('topic')) {
                      fieldName = 'topic';
                    } else if (fieldName.includes('loại') || fieldName.includes('type')) {
                      fieldName = 'type';
                    } else if (fieldName.includes('thời gian') || fieldName.includes('duration')) {
                      fieldName = 'duration';
                    }
                    
                    rowData[fieldName] = cellValue.toString().trim();
                  }
                });
                
                // Ensure required fields exist with defaults
                return {
                  week: rowData.week || index + 1,
                  topic: rowData.topic || `Chủ đề tuần ${index + 1}`,
                  type: rowData.type || 'Lý thuyết',
                  duration: parseInt(rowData.duration) || 120,
                  ...rowData
                };
              });
            
            if (processedData.length === 0) {
              reject(new Error('Không tìm thấy dữ liệu hợp lệ trong file Excel'));
              return;
            }
            
            console.log('Excel parsing successful:', processedData);
            resolve(processedData);
            
          } catch (parseError) {
            console.error('Excel parsing error:', parseError);
            reject(new Error(`Lỗi đọc file Excel: ${parseError.message}`));
          }
        }).catch(importError => {
          console.error('Error importing XLSX:', importError);
          reject(new Error('Không thể tải thư viện đọc Excel. Vui lòng cài đặt package xlsx.'));
        });
        
      } catch (error) {
        reject(new Error('Không thể xử lý file Excel: ' + error.message));
      }
    };
    
    reader.onerror = () => reject(new Error('Không thể đọc file'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Download file from blob
 * @param {Blob} blob - File blob
 * @param {string} filename - File name
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * Get current user ID from localStorage
 * @returns {number|null} User ID
 */
export const getCurrentUserId = () => {
  try {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
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
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate schedule display text
 * @param {Object} schedule - Schedule object
 * @returns {string} Schedule display text
 */
export const formatSchedule = (schedule) => {
  if (!schedule) return '';
  
  const dayNames = {
    'monday': 'Thứ 2',
    'tuesday': 'Thứ 3', 
    'wednesday': 'Thứ 4',
    'thursday': 'Thứ 5',
    'friday': 'Thứ 6',
    'saturday': 'Thứ 7',
    'sunday': 'Chủ nhật'
  };
  
  const days = schedule.days?.map(day => dayNames[day] || day).join(', ') || '';
  const time = schedule.startTime && schedule.endTime ? 
    `${schedule.startTime} - ${schedule.endTime}` : '';
  
  return `${days} (${time})`;
};