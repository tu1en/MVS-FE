import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component để bảo vệ routes dựa trên role
 * Sử dụng role-based access control (RBAC) cho hệ thống HR
 * 
 * @param {React.ReactNode} children - Component con được bảo vệ
 * @param {string[]} allowedRoles - Danh sách các role được phép truy cập
 * @returns {React.ReactElement} Component được bảo vệ hoặc redirect
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Hiển thị loading spinner khi đang kiểm tra authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px'
      }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  // Chuyển hướng về login nếu chưa đăng nhập
  if (!user) {
    console.log('ProtectedRoute: Người dùng chưa xác thực, chuyển hướng về login');
    return <Navigate to="/login" replace />;
  }

  // Xử lý role: loại bỏ prefix "ROLE_" để so sánh
  const userRoleName = user.role?.replace('ROLE_', '');

  // Kiểm tra quyền truy cập dựa trên role
  if (allowedRoles && !allowedRoles.includes(userRoleName)) {
    console.log(`ProtectedRoute: Role ${userRoleName} không được phép. Roles cho phép:`, allowedRoles);
    
    // Chuyển hướng về dashboard tương ứng với role
    switch (userRoleName) {
      case "STUDENT":
        return <Navigate to="/student" replace />;
      case "TEACHER": 
        return <Navigate to="/teacher" replace />;
      case "MANAGER":
        return <Navigate to="/manager" replace />;
      case "ADMIN":
        return <Navigate to="/admin" replace />;
      case "ACCOUNTANT":
        return <Navigate to="/accountant" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // Render component con nếu có quyền truy cập
  return children;
};

export default ProtectedRoute;