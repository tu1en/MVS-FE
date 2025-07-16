import React, { useEffect } from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HRDashboard } from '../../components/hr';
import { getUserRole } from '../../utils/authUtils';

/**
 * Trang quản lý HR - chỉ dành cho Manager và Admin
 */
const HRManagementPage = () => {
  const navigate = useNavigate();
  const userRole = getUserRole();

  useEffect(() => {
    // Kiểm tra quyền truy cập
    if (!userRole || (userRole !== 'MANAGER' && userRole !== 'ADMIN')) {
      // Redirect về trang chính nếu không có quyền
      navigate('/');
    }
  }, [userRole, navigate]);

  // Hiển thị thông báo lỗi nếu không có quyền
  if (!userRole || (userRole !== 'MANAGER' && userRole !== 'ADMIN')) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        }
      />
    );
  }

  return <HRDashboard />;
};

export default HRManagementPage;
