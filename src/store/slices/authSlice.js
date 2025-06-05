import { createSlice } from '@reduxjs/toolkit';

const getValidToken = () => {
  // Ưu tiên token từ sessionStorage (phiên hiện tại)
  const sessionToken = sessionStorage.getItem('token');
  if (sessionToken) return sessionToken;
  
  // Nếu không có, kiểm tra localStorage
  const localToken = localStorage.getItem('token');
  if (localToken) {
    // Kiểm tra xem token có hợp lệ không
    try {
      const payload = JSON.parse(atob(localToken.split('.')[1]));
      // Nếu không có thông tin manual_login hoặc token hết hạn, xóa token cũ
      if (!payload.manual_login || new Date(payload.exp * 1000) < new Date()) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        return null;
      }
      return localToken;
    } catch (e) {
      // Token không hợp lệ, xóa
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      return null;
    }
  }
  
  return null;
};

const getValidRole = () => {
  // Ưu tiên lấy từ sessionStorage
  const sessionRole = sessionStorage.getItem('role');
  if (sessionRole) return sessionRole;
  
  // Nếu localStorage có token hợp lệ, lấy role từ localStorage
  const token = getValidToken();
  return token ? localStorage.getItem('role') : null;
};

const getValidUserId = () => {
  // Ưu tiên lấy từ sessionStorage
  const sessionUserId = sessionStorage.getItem('userId');
  if (sessionUserId) return sessionUserId;
  
  // Nếu localStorage có token hợp lệ, lấy userId từ localStorage
  const token = getValidToken();
  return token ? localStorage.getItem('userId') : null;
};

const initialState = {
  token: getValidToken(),
  role: getValidRole(),
  userId: getValidUserId(),
  isLogin: !!getValidToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { token, role, userId, rememberMe = false } = action.payload;
      state.token = token;
      state.role = role;
      state.userId = userId;
      state.isLogin = true;

      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('userId', userId);
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('role', role);
        sessionStorage.setItem('userId', userId);
      }
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.userId = null;
      state.isLogin = false;

      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      sessionStorage.removeItem('userId');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
