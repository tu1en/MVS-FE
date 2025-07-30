import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from '../utils/authUtils';

/**
 * Custom hook để ngăn back navigation khi đã đăng nhập
 */
export const usePreventBackNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLogin } = useSelector((state) => state.auth);

  useEffect(() => {
    const isLoggedIn = isUserLoggedIn() && isLogin;

    // Nếu đã đăng nhập và đang ở trang login, redirect về dashboard
    if (isLoggedIn && location.pathname === '/login') {
      const role = localStorage.getItem('role');
      let dashboardPath = '/';
      
      switch (role) {
        case 'ADMIN':
        case '0':
          dashboardPath = '/admin';
          break;
        case 'STUDENT':
        case '1':
          dashboardPath = '/student';
          break;
        case 'TEACHER':
        case '2':
          dashboardPath = '/teacher';
          break;
        case 'MANAGER':
        case '3':
          dashboardPath = '/manager';
          break;
        case 'ACCOUNTANT':
        case '5':
          dashboardPath = '/accountant';
          break;
        default:
          dashboardPath = '/';
      }
      
      navigate(dashboardPath, { replace: true });
      return;
    }

    // Ngăn back navigation chỉ khi đã đăng nhập và không ở trang login
    if (isLoggedIn && location.pathname !== '/login') {
      // Thêm entry vào history để ngăn back
      window.history.pushState(null, null, location.pathname);
      
      const handlePopState = (event) => {
        if (isLoggedIn) {
          window.history.pushState(null, null, location.pathname);
          
          // Hiển thị thông báo xác nhận
          if (window.confirm('Bạn đã đăng nhập. Bạn có muốn đăng xuất không?')) {
            localStorage.clear();
            window.location.href = '/login';
          }
        }
      };

      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isLogin, navigate, location.pathname]);
}; 