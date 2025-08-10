import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import TeacherAttendance from './TeacherAttendance';
import ManagerAttendance from './ManagerAttendance';
import { Alert } from 'antd';

// Main Attendance Module Component
const AttendanceModule = () => {
  const { user, logout } = useAuth();
  
  // State for message box
  const [messageBox, setMessageBox] = useState({ visible: false, title: '', message: '' });

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

  const closeMessageBox = () => {
    setMessageBox({ visible: false, title: '', message: '' });
  };

  const showMessageBox = (title, message) => {
    setMessageBox({ visible: true, title, message });
  };

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Alert
          message="Chưa đăng nhập"
          description="Vui lòng đăng nhập để sử dụng tính năng điểm danh."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  // Determine user role from user object
  const getUserRole = (user) => {
    if (!user) return 'UNKNOWN';
    
    // Check if user has role string (from AuthContext)
    if (user.role) {
      const role = user.role.replace('ROLE_', ''); // Remove ROLE_ prefix if exists
      return role;
    }
    
    // Fallback: check roleId (numeric)
    if (user.roleId) {
      switch (user.roleId) {
        case 1:
          return 'STUDENT';
        case 2:
          return 'TEACHER';
        case 3:
          return 'MANAGER';
        case 4:
          return 'ADMIN';
        case 5:
          return 'ACCOUNTANT';
        default:
          return 'UNKNOWN';
      }
    }
    
    return 'UNKNOWN';
  };

  const userRole = getUserRole(user);
  
  // Debug: log user info and role
  console.log('AttendanceModule - User:', user);
  console.log('AttendanceModule - Determined role:', userRole);

  // Render the appropriate attendance component based on user role
  const renderAttendanceComponent = () => {
    switch (userRole) {
      case 'STUDENT':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Alert
              message="Tính năng đang phát triển"
              description="Tính năng điểm danh cho học sinh đang được phát triển."
              type="info"
              showIcon
            />
          </div>
        );
      case 'TEACHER':
        return (
          <TeacherAttendance 
            onLogout={logout}
            showMessageBox={showMessageBox}
            user={user}
          />
        );
      case 'MANAGER':
      case 'ACCOUNTANT':
        return (
          <ManagerAttendance 
            user={user}
          />
        );
      default:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Alert
              message="Không có quyền truy cập"
              description={`Vai trò ${userRole} không được phép sử dụng tính năng điểm danh.`}
              type="error"
              showIcon
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderAttendanceComponent()}
      
      {/* Message Box Modal */}
      {messageBox.visible && (
        <MessageBox
          title={messageBox.title}
          message={messageBox.message}
          onClose={closeMessageBox}
        />
      )}
    </div>
  );
};

export default AttendanceModule;