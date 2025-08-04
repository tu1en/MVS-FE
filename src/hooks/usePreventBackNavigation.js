import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { isUserLoggedIn } from '../utils/authUtils';

/**
 * Custom hook để ngăn back navigation khi đã đăng nhập
 * Thay vì hiển thị popup xác nhận đăng xuất, sẽ chuyển về dashboard chính
 */
export const usePreventBackNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLogin } = useSelector((state) => state.auth);

  useEffect(() => {
    const isLoggedIn = isUserLoggedIn() && isLogin;
    const isHomepage = location.pathname === '/';

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

    // Nếu là guest ở trang chủ, cho phép back navigation bình thường
    if (!isLoggedIn && isHomepage) {
      return;
    }

    // Ngăn back navigation chỉ khi đã đăng nhập và không ở trang login
    if (isLoggedIn && location.pathname !== '/login') {
      // Thêm entry vào history để ngăn back
      window.history.pushState(null, null, location.pathname);
      
      const handlePopState = (event) => {
        if (isLoggedIn) {
          window.history.pushState(null, null, location.pathname);
          
          // Thay vì hiển thị popup, chuyển về dashboard chính
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
          
          // Chỉ chuyển về dashboard nếu không đang ở dashboard
          if (location.pathname !== dashboardPath) {
            navigate(dashboardPath, { replace: true });
          }
        }
      };

      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [navigate, location, isLogin]);

  return {};
}; 