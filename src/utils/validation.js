/**
 * Validation rules for MVS application
 */

// Custom validator cho số điện thoại
export const validatePhoneNumber = (_, value) => {
  if (!value) {
    return Promise.reject('Vui lòng nhập số điện thoại');
  }

  if (!/^[0-9]+$/.test(value)) {
    return Promise.reject('Số điện thoại chỉ được chứa chữ số');
  }

  if (value.length < 10 || value.length > 11) {
    return Promise.reject('Số điện thoại phải có 10 hoặc 11 chữ số');
  }

  if (!/^0(3|5|7|8|9)/.test(value)) {
    return Promise.reject('Số điện thoại phải bắt đầu bằng 03, 05, 07, 08 hoặc 09');
  }

  return Promise.resolve();
};

// Custom validator cho email
export const validateEmail = (_, value) => {
  if (!value) {
    return Promise.reject('Vui lòng nhập email');
  }
  // Kiểm tra định dạng email cơ bản
  if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
    return Promise.reject('Email không hợp lệ. Phải có dạng example@domain.com');
  }
  // Kiểm tra khoảng trắng
  if (value.includes(' ')) {
    return Promise.reject('Email không được chứa khoảng trắng');
  }
  // Kiểm tra ký tự đặc biệt không hợp lệ
  if (/[(),:;<>\[\]\\]/.test(value)) {
    return Promise.reject('Email không được chứa ký tự đặc biệt không hợp lệ');
  }
  return Promise.resolve();
};
