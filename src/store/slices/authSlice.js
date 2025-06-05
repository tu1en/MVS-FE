import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') || null,
  userId: localStorage.getItem('userId') || null,
  isLogin: !!localStorage.getItem('token'),
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
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.userId = null;
      state.isLogin = false;

      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
