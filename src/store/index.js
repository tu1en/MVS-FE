import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import teachersReducer from './slices/teachersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    teachers: teachersReducer,
  },
});
