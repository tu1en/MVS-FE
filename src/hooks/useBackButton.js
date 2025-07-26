import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE } from '../constants/constants';

export const useBackButton = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = (event) => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      // Nếu đã login và đang ở dashboard, không cho phép back về login
      if (token && role) {
        event.preventDefault();
        
        // Xác định dashboard route dựa trên role
        let dashboardRoute = '/';
        switch (role) {
          case ROLE.ADMIN:
            dashboardRoute = '/admin';
            break;
          case ROLE.TEACHER:
            dashboardRoute = '/teacher';
            break;
          case ROLE.MANAGER:
            dashboardRoute = '/manager';
            break;
          case ROLE.STUDENT:
            dashboardRoute = '/student';
            break;
          case ROLE.ACCOUNTANT:
            dashboardRoute = '/accountant';
            break;
          default:
            dashboardRoute = '/';
        }
        
        // Nếu đang ở dashboard, giữ nguyên vị trí
        if (window.location.pathname === dashboardRoute) {
          return;
        }
        
        // Nếu không ở dashboard, chuyển về dashboard
        navigate(dashboardRoute, { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);
}; 