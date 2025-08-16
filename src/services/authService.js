import apiClient from '../config/axiosInstance';
import { getNormalizedRole } from '../utils/authUtils';

const login = async (username, password) => {
  console.log('AuthService: Logging in with:', username);
  try {
    const response = await apiClient.post('/auth/login', { username, password });
    console.log('AuthService: Login response data:', response.data);

    const data = response.data;
  if (!data.token || !data.role) {
    throw new Error('Đăng nhập thất bại: Thiếu thông tin từ server');
  }

  const normalizedRole = getNormalizedRole(data.role);

  return {
    token: data.token,
    role: normalizedRole,
    id: data.userId,
    email: data.email || username,
    username: data.username || username,
  };
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Tài khoản hoặc mật khẩu không đúng');
    }
    throw error;
  }
};

const googleLogin = async (idToken, user) => {
    console.log('AuthService: Google login with token...');
  try {
    const response = await apiClient.post('/auth/google-login', {
            idToken,
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL
    }, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });

    const data = response.data;
    console.log('AuthService: Google login response:', data);
    
    if (!data.token || !data.roleId) {
        throw new Error('Đăng nhập thất bại: Thiếu thông tin từ server');
    }

    // Use roleId instead of role string for consistency
    const normalizedRole = getNormalizedRole(data.roleId);

    return {
        token: data.token,
        role: normalizedRole,
        id: data.userId,
        email: data.email || user.email,
        username: data.username || user.email
    };
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};


const changePassword = async (oldPassword, newPassword) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Bạn cần đăng nhập để thực hiện chức năng này');
    }
    const response = await apiClient.post(`/auth/change-password`, {
        oldPassword,
        newPassword
    });
    
    // Đảm bảo luôn trả về string
    if (typeof response.data === 'string') {
        return response.data;
    } else if (response.data && typeof response.data === 'object') {
        // Nếu server trả về object, lấy message hoặc chuyển đổi thành string
        return response.data.message || JSON.stringify(response.data);
    } else {
        return 'Đổi mật khẩu thành công';
    }
};


const authService = {
  login,
  googleLogin,
  changePassword
};

export default authService;