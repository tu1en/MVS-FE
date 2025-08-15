import { Modal, Tabs } from 'antd';
import React, { useState } from 'react';
import StudentRequestForm from './StudentRequestForm';
import ParentRequestForm from './ParentRequestForm';

const RegisterModal = ({ open, onClose, initialEmail = '' }) => {
  const items = [
    {
      key: 'student',
      label: 'Tài khoản học sinh',
      children: <StudentRequestForm onClose={onClose} initialEmail={initialEmail} />,
    },
    {
      key: 'parent',
      label: 'Tài khoản phụ huynh',
      children: <ParentRequestForm onClose={onClose} initialEmail={initialEmail} />,
    },
  ];

  return (
    <Modal
      title="Đăng ký tài khoản"
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
        
        <Tabs defaultActiveKey="student" items={items} />
      </div>
    </Modal>
  );
};

export default RegisterModal; 