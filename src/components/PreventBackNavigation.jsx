import { useState } from 'react';
import { Modal } from 'antd';
import { usePreventBackNavigation } from '../hooks/usePreventBackNavigation';

/**
 * Component để ngăn người dùng back lại trang login khi đã đăng nhập
 */
const PreventBackNavigation = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutCallback, setLogoutCallback] = useState(null);

  const handleShowLogoutModal = (callback) => {
    setLogoutCallback(() => callback);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    if (logoutCallback) {
      logoutCallback();
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
    setLogoutCallback(null);
  };

  // Sử dụng custom hook với callback
  usePreventBackNavigation(handleShowLogoutModal);
  
  return (
    <Modal
      title="Xác nhận đăng xuất"
      open={showLogoutModal}
      onOk={handleLogoutConfirm}
      onCancel={handleLogoutCancel}
      okText="Đăng xuất"
      cancelText="Hủy"
      okButtonProps={{ danger: true }}
    >
      <p>Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?</p>
    </Modal>
  );
};

export default PreventBackNavigation; 