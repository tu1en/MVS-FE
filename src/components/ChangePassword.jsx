import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE } from '../constants/constants';
const baseUrl = process.env.REACT_APP_BASE_URL;

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      // Redirect based on user role
      const userRole = localStorage.getItem('role');
      
      switch (userRole) {
        case ROLE.ADMIN:
          navigate('/admin');
          break;
        case ROLE.TEACHER:
          navigate('/teacher');
          break;
        case ROLE.MANAGER:
          navigate('/manager');
          break;
        case ROLE.STUDENT:
          navigate('/student');
          break;
        default:
          navigate('/');
      }
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setMessage('');
    setIsSuccess(false);
    setCountdown(null);
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setMessage('Mật khẩu mới không khớp với mật khẩu xác nhận');
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    
    if (newPassword === oldPassword) {
      setMessage('Mật khẩu mới không được trùng với mật khẩu cũ');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Bạn cần đăng nhập để thực hiện chức năng này');
        return;
      }
      
      const response = await fetch(`${baseUrl}/auth/change-password?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          oldPassword,
          newPassword
        }),
      });
      
      const data = await response.text();
      
      if (response.ok) {
        setIsSuccess(true);
        setMessage(data);
        // Reset form
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Start countdown for redirect
        setCountdown(3);
      } else {
        setMessage(data || 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Đã xảy ra lỗi khi đổi mật khẩu');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu cũ
          </label>
          <input
            id="oldPassword"
            name="oldPassword"
            type="password"
            required
            maxLength={50}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu mới
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            maxLength={50}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
          {newPassword === oldPassword && newPassword && (
            <p className="text-sm text-red-500 mt-1">Mật khẩu mới không được trùng với mật khẩu cũ</p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Xác nhận mật khẩu mới
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            maxLength={50}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-sm text-red-500 mt-1">Mật khẩu xác nhận không khớp</p>
          )}
        </div>
        
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Đổi Mật Khẩu
          </button>
        </div>
      </form>
      
      {message && (
        <div className={`mt-4 p-3 rounded-md text-sm ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
          {countdown !== null && (
            <div className="mt-2 font-medium">
              Tự động chuyển hướng sau {countdown} giây...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChangePassword; 