import { TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, Select, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import StudentAttendance from './StudentAttendance';
import TeacherAttendance from './TeacherAttendance';

const { Option } = Select;

// Main Attendance Module Component
const AttendanceModule = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default to true assuming user is already logged in
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [loginError, setLoginError] = useState('');

  // Custom Message Box Component
  const MessageBox = ({ title, message, onClose }) => {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
          <p className="text-gray-700 mb-6">{message}</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  // State for message box
  const [messageBox, setMessageBox] = useState({ visible: false, title: '', message: '' });

  const showMessageBox = (title, message) => {
    setMessageBox({ visible: true, title, message });
  };

  const closeMessageBox = () => {
    setMessageBox({ visible: false, title: '', message: '' });
  };

  // Login Component
  const LoginScreen = ({ onLogin, showMessageBox }) => {
    const [form] = Form.useForm();

    const handleFormSubmit = (values) => {
      if (!values.userId) {
        setLoginError('Vui lòng nhập ID người dùng');
        return;
      }
      onLogin(values.userId, values.role);
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="text-center mb-6">
            <TeamOutlined style={{ fontSize: '3rem', color: '#1890ff' }} />
            <h2 className="text-2xl font-bold text-gray-800 mt-2">Hệ thống Điểm Danh</h2>
            <p className="text-gray-600 mt-2">Đăng nhập vào hệ thống để tiếp tục</p>
          </div>
          
          {loginError && (
            <Alert
              message={loginError}
              type="error"
              showIcon
              closable
              className="mb-4"
              onClose={() => setLoginError('')}
            />
          )}
          
          <Form
            form={form}
            name="login"
            initialValues={{ role: '2' }}
            onFinish={handleFormSubmit}
            layout="vertical"
          >
            <Form.Item
              name="userId"
              label="ID Người dùng"
              rules={[{ required: true, message: 'Vui lòng nhập ID người dùng' }]}
            >
              <Input 
                prefix={<UserOutlined className="site-form-item-icon" />} 
                placeholder="VD: GV001 hoặc SV001"
                size="large"
              />
            </Form.Item>
            
            <Form.Item
              name="role"
              label="Vai trò"
            >
              <Select size="large">
                <Option value="2">Giảng viên</Option>
                <Option value="1">Sinh viên</Option>
              </Select>
            </Form.Item>
            
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                className="bg-blue-500 hover:bg-blue-600 h-12"
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
          
          <div className="text-center mt-4 text-sm text-gray-600">
            <p>Hệ thống điểm danh của MVS Classroom</p>
          </div>
        </div>
      </div>
    );
  };

  // Effect to get user info on component mount
  useEffect(() => {
    // In a real app, get this from localStorage or user context
    const storedUserId = localStorage.getItem('userId');
    const storedUserRole = localStorage.getItem('role');
    
    if (storedUserId && storedUserRole) {
      setUserId(storedUserId);
      setUserRole(storedUserRole);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Handle login
  const handleLogin = (userInfo, role) => {
    setLoading(true);
    setLoginError('');
    
    // Validate input
    if (!userInfo.trim()) {
      setLoginError('ID người dùng không được để trống');
      setLoading(false);
      return;
    }
    
    // Simulate authentication
    setTimeout(() => {
      setUserId(userInfo);
      setUserRole(role);
      setIsLoggedIn(true);
      setLoading(false);
      
      // In a real app, save this to localStorage
      localStorage.setItem('userId', userInfo);
      localStorage.setItem('role', role);
    }, 800);
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId('');
    setUserRole('');
    
    // Clear from localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-3 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} showMessageBox={showMessageBox} />;
  }

  return (
    <>
      <div className="App">
        {userRole === '2' || userRole === 'TEACHER' ? (
          <TeacherAttendance 
            userId={userId} 
            onLogout={handleLogout} 
            showMessageBox={showMessageBox}
          />
        ) : (
          <StudentAttendance 
            userId={userId} 
            onLogout={handleLogout} 
            showMessageBox={showMessageBox}
          />
        )}
        
        {messageBox.visible && (
          <MessageBox
            title={messageBox.title}
            message={messageBox.message}
            onClose={closeMessageBox}
          />
        )}
      </div>
    </>
  );
};

export default AttendanceModule; 