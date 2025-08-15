import { Modal } from 'antd';
import React from 'react';
import StudentRequestForm from './StudentRequestForm';

const RegisterModal = ({ open, onClose, initialEmail = '' }) => {
  return (
    <Modal
      title="Đăng ký tài khoản học sinh"
      open={open}
      onCancel={onClose}
      width={700}
      footer={null}
      destroyOnHidden
    >
      <div className="p-2">
        <p className="mb-4 text-gray-600">
          Hãy hoàn thành form dưới đây để tham gia Minh Việt Education. 
          Bạn cần cung cấp thông tin của mình và thông tin phụ huynh.
        </p>
        <StudentRequestForm onClose={onClose} initialEmail={initialEmail} />
      </div>
    </Modal>
  );
};

export default RegisterModal; 