import { usePreventBackNavigation } from '../hooks/usePreventBackNavigation';

/**
 * Component để ngăn người dùng back lại trang login khi đã đăng nhập
 * Thay vì hiển thị popup xác nhận đăng xuất, sẽ chuyển về dashboard chính
 */
const PreventBackNavigation = () => {
  // Sử dụng custom hook với logic mới
  usePreventBackNavigation();
  
  // Không còn render modal nữa
  return null;
};

export default PreventBackNavigation; 