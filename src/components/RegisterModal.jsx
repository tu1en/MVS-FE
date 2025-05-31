import React, { useState } from 'react';
import { Modal, Tabs } from 'antd';
import TeacherRequestForm from './TeacherRequestForm';
import StudentRequestForm from './StudentRequestForm';

const RegisterModal = ({ open, onClose }) => {
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
              children: <TeacherRequestForm onClose={onClose} />
            },
            {
              key: 'student',
              label: 'Đăng ký học sinh',
              children: <StudentRequestForm onClose={onClose} />
            }
          ]}
        />
      </div>
    </Modal>
  );
};

export default RegisterModal; 