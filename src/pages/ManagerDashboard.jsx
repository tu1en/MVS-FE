import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE } from '../constants/constants';

export default function ManagerDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== ROLE.MANAGER) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Trang Quản Lý</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quản lý yêu cầu đăng ký</h2>
          <p className="text-gray-600">Xem và quản lý các yêu cầu đăng ký trong hệ thống</p>
          <button 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={() => navigate('/request-list')}
          >
            Xem danh sách yêu cầu
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quản lý khóa học</h2>
          <p className="text-gray-600">Quản lý thông tin khóa học và lớp học</p>
          <button 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={() => navigate('/manager/courses')}
          >
            Quản lý khóa học
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quản lý lịch học</h2>
          <p className="text-gray-600">Quản lý lịch học các lớp trong hệ thống</p>
          <button 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={() => navigate('/manager/schedule')}
          >
            Quản lý lịch học
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quản lý thông báo</h2>
          <p className="text-gray-600">Tạo và quản lý thông báo trong hệ thống</p>
          <button 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={() => navigate('/manager/announcements')}
          >
            Quản lý thông báo
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Báo cáo & Thống kê</h2>
          <p className="text-gray-600">Xem thống kê và báo cáo hệ thống</p>
          <button 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={() => navigate('/manager/reports')}
          >
            Xem báo cáo
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quản lý tin nhắn</h2>
          <p className="text-gray-600">Quản lý tin nhắn và giao tiếp người dùng</p>
          <button 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={() => navigate('/manager/messages')}
          >
            Quản lý tin nhắn
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quản lý tài khoản</h2>
          <p className="text-gray-600">Quản lý tài khoản người dùng trong hệ thống</p>
          <button 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={() => navigate('/manager/users')}
          >
            Quản lý tài khoản
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
          <p className="text-gray-600">Xem và chỉnh sửa thông tin cá nhân của bạn</p>
          <button 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={() => navigate('/manager/profile')}
          >
            Thông tin cá nhân
          </button>
        </div>
      </div>
    </div>
  );
}