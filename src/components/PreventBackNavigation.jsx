import { usePreventBackNavigation } from '../hooks/usePreventBackNavigation';

/**
 * Component để ngăn người dùng back lại trang login khi đã đăng nhập
 */
const PreventBackNavigation = () => {
  // Sử dụng custom hook
  usePreventBackNavigation();
  
  return null; // Component này không render gì
};

export default PreventBackNavigation; 