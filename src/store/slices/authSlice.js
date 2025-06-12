import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: (() => {
    const token = localStorage.getItem('token');
    return (token && token.trim() !== '' && token !== 'null' && token !== 'undefined') ? token : null;
  })(),
  role: (() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    return (token && token.trim() !== '' && token !== 'null' && token !== 'undefined') ? role : null;
  })(),
  userId: (() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    return (token && token.trim() !== '' && token !== 'null' && token !== 'undefined') ? userId : null;
  })(),
  isLogin: (() => {
    const token = localStorage.getItem('token');
    return !!(token && token.trim() !== '' && token !== 'null' && token !== 'undefined');
  })(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { token, role, userId } = action.payload;
      state.token = token;
      state.role = role;
      state.userId = userId;
      state.isLogin = true;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);
    },    logout: (state) => {
      state.token = null;
      state.role = null;
      state.userId = null;
      state.isLogin = false;

      // Clean up all authentication-related localStorage items
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('email');      localStorage.removeItem('user');
    },
    syncFromLocalStorage: (state) => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const userId = localStorage.getItem('userId');
      
      // Only set login state if token exists and is not empty
      const isValidToken = token && token.trim() !== '' && token !== 'null' && token !== 'undefined';
      
      state.token = isValidToken ? token : null;
      state.role = isValidToken ? role : null;
      state.userId = isValidToken ? userId : null;
      state.isLogin = isValidToken;
      
      // If token is invalid, clean up localStorage
      if (!isValidToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');        localStorage.removeItem('email');
      }
    },
    clearAuthState: (state) => {
      // Force clear all authentication state
      state.token = null;
      state.role = null;
      state.userId = null;
      state.isLogin = false;
      
      // Clear localStorage completely
      localStorage.clear();
    },
  },
});

export const { loginSuccess, logout, syncFromLocalStorage, clearAuthState } = authSlice.actions;
export default authSlice.reducer;
