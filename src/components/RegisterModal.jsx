import { Modal, Tabs } from 'antd';
import React, { useState } from 'react';
import StudentRequestForm from './StudentRequestForm';

const RegisterModal = ({ open, onClose, initialEmail = '' }) => {
  return (
    <Modal
      title="Đăng ký tham gia học tập"
      open={open}
      onCancel={onClose}
      width={700}
      footer={null}
      destroyOnHidden
    >
      <div className="p-2">
        {initialEmail && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md">
            <p className="font-medium">Tài khoản Google của bạn chưa được đăng ký trong hệ thống.</p>
            <p>Vui lòng hoàn thành form đăng ký dưới đây để tiếp tục.</p>
          </div>
        )}
        
        <p className="mb-4 text-gray-600">
          Hãy hoàn thành form dưới đây để tham gia Minh Việt Education
        </p>
        <p className="mb-4 text-red-500 text-sm">
          Chỉ dành cho học sinh chưa có tài khoản trong hệ thống.
        </p>
        
        <StudentRequestForm onClose={onClose} initialEmail={initialEmail} />
      </div>
    </Modal>
  );
};

export default RegisterModal; 