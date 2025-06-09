// Form validation rules and utilities
import { validateEmail, validatePhoneNumber } from './validation';

// Common validation rules
export const commonValidationRules = {
  required: {
    required: true,
    message: 'Trường này là bắt buộc'
  },
  email: {
    validator: validateEmail,
    message: 'Email không hợp lệ'
  },
  phone: {
    validator: validatePhoneNumber,
    message: 'Số điện thoại không hợp lệ'
  },
  name: {
    required: true,
    min: 2,
    max: 50,
    message: 'Họ tên phải từ 2-50 ký tự'
  },
  text: {
    max: 500,
    message: 'Không được vượt quá 500 ký tự'
  },
  numeric: {
    pattern: /^[0-9]*$/,
    message: 'Chỉ được nhập số'
  },
  score: {
    required: true,
    type: 'number',
    min: 0,
    max: 10,
    message: 'Điểm phải từ 0-10'
  }
};

// Form error handler for API errors
export const handleFormErrors = (error, form, message) => {
  if (error.response) {
    const { data, status } = error.response;
    
    // Handle validation errors from backend
    if (status === 400 && data.errors) {
      // Set field-specific errors
      Object.keys(data.errors).forEach(field => {
        form.setFields([{
          name: field,
          errors: [data.errors[field]]
        }]);
      });
    } else if (data.message) {
      // Show general error message
      message.error(data.message);
    } else {
      message.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  } else {
    message.error('Không thể kết nối đến máy chủ.');
  }
};

// Form field validators
export const validators = {
  // Name validator
  validateName: (_, value) => {
    if (!value) {
      return Promise.reject('Vui lòng nhập họ tên');
    }
    if (value.length < 2) {
      return Promise.reject('Họ tên phải có ít nhất 2 ký tự');
    }
    if (value.length > 50) {
      return Promise.reject('Họ tên không được vượt quá 50 ký tự');
    }
    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
      return Promise.reject('Họ tên chỉ được chứa chữ cái và khoảng trắng');
    }
    return Promise.resolve();
  },

  // Student/Teacher ID validator
  validateId: (_, value) => {
    if (!value) {
      return Promise.reject('Vui lòng nhập mã số');
    }
    if (!/^[0-9]{5,10}$/.test(value)) {
      return Promise.reject('Mã số phải có từ 5-10 chữ số');
    }
    return Promise.resolve();
  },

  // Score validator
  validateScore: (_, value) => {
    if (value === null || value === undefined || value === '') {
      return Promise.reject('Vui lòng nhập điểm');
    }
    const score = parseFloat(value);
    if (isNaN(score)) {
      return Promise.reject('Điểm phải là số');
    }
    if (score < 0 || score > 10) {
      return Promise.reject('Điểm phải từ 0-10');
    }
    // Kiểm tra chỉ cho phép 2 chữ số thập phân
    if (value.toString().includes('.')) {
      const decimals = value.toString().split('.')[1];
      if (decimals.length > 2) {
        return Promise.reject('Điểm chỉ được có tối đa 2 chữ số thập phân');
      }
    }
    return Promise.resolve();
  },

  // Feedback validator
  validateFeedback: (_, value) => {
    if (!value) {
      return Promise.reject('Vui lòng nhập nhận xét');
    }
    if (value.length < 10) {
      return Promise.reject('Nhận xét phải có ít nhất 10 ký tự');
    }
    if (value.length > 500) {
      return Promise.reject('Nhận xét không được vượt quá 500 ký tự');
    }
    return Promise.resolve();
  }
};
