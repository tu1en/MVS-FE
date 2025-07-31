import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { isUserLoggedIn, performLogout } from '../utils/authUtils';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Custom hook để ngăn back navigation khi đã đăng nhập
 * @param {Function} onShowLogoutModal - Callback để hiển thị modal đăng xuất
 */
export const usePreventBackNavigation = (onShowLogoutModal) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { isLogin } = useSelector((state) => state.auth);

  const handleLogout = useCallback(() => {
    performLogout(dispatch, navigate, signOut, auth);
  }, [dispatch, navigate]);

  useEffect(() => {
    const isLoggedIn = isUserLoggedIn() && isLogin;
    const isHomepage = location.pathname === '/';
    const isGuest = !isLoggedIn;

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
    if (isGuest && isHomepage) {
      return;
    }

    // Ngăn back navigation chỉ khi đã đăng nhập và không ở trang login
    if (isLoggedIn && location.pathname !== '/login') {
      // Thêm entry vào history để ngăn back
      window.history.pushState(null, null, location.pathname);
      
      const handlePopState = (event) => {
        if (isLoggedIn) {
          window.history.pushState(null, null, location.pathname);
          
          // Hiển thị modal xác nhận thay vì alert
          if (onShowLogoutModal) {
            onShowLogoutModal(handleLogout);
          }
        }
      };

      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isLogin, navigate, location.pathname, onShowLogoutModal, handleLogout]);

  return { handleLogout };
}; 