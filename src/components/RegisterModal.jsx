import React, { useState } from 'react';
import { Modal, Tabs } from 'antd';
import TeacherRequestForm from './TeacherRequestForm';
import StudentRequestForm from './StudentRequestForm';

const RegisterModal = ({ open, onClose, initialEmail = '' }) => {
  const [activeTab, setActiveTab] = useState('teacher');

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <Modal
      title="Đăng ký tài khoản"
      open={open}
      onCancel={onClose}
      width={700}
      footer={null}
      destroyOnClose
    >
      <div className="p-2">
        {initialEmail && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md">
            <p className="font-medium">Tài khoản Google của bạn chưa được đăng ký trong hệ thống.</p>
            <p>Vui lòng hoàn thành form đăng ký dưới đây để tiếp tục.</p>
          </div>
        )}
        
        <p className="mb-4 text-gray-600">
          Vui lòng điền thông tin để đăng ký tài khoản. Yêu cầu của bạn sẽ được xem xét và phản hồi qua email.
        </p>
        
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          centered
          items={[
            {
              key: 'teacher',
              label: 'Đăng ký giáo viên',
              children: <TeacherRequestForm onClose={onClose} initialEmail={initialEmail} />
            },
            {
              key: 'student',
              label: 'Đăng ký học sinh',
              children: <StudentRequestForm onClose={onClose} initialEmail={initialEmail} />
            }
          ]}
        />
      </div>
    </Modal>
  );
};

export default RegisterModal; 