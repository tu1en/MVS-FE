import React from 'react';
import ChangePassword from '../components/ChangePassword';

const ChangePasswordPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Đổi Mật Khẩu</h1>
      <div className="flex justify-center">
        <ChangePassword />
      </div>
    </div>
  );
};

export default ChangePasswordPage; 