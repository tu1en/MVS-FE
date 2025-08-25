import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE } from '../constants/constants';

export default function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== ROLE.ADMIN) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Trang Quản Trị</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/users')}>
          <h2 className="text-xl font-semibold mb-4">Quản lý người dùng</h2>
          <p className="text-gray-600">Xem và quản lý tất cả người dùng trong hệ thống</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/courses')}>
          <h2 className="text-xl font-semibold mb-4">Quản lý lớp học</h2>
          <p className="text-gray-600">Tạo và quản lý các lớp học</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/system-logs')}>
          <h2 className="text-xl font-semibold mb-4">Xem nhật ký hoạt động hệ thống</h2>
          <p className="text-gray-600">Xem logs của các hành động hệ thống</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/system-charts')}>
          <h2 className="text-xl font-semibold mb-4">Quản lý biểu đồ hệ thống</h2>
          <p className="text-gray-600">Quản lý sơ đồ của hệ thống</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/system-settings')}>
          <h2 className="text-xl font-semibold mb-4">Cấu hình cài đặt hệ thống</h2>
          <p className="text-gray-600">Thay đổi cấu hình hệ thống (email, bảo mật...)</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/notifications')}>
          <h2 className="text-xl font-semibold mb-4">Quản lý thông báo</h2>
          <p className="text-gray-600">Tạo và quản lý thông báo hệ thống, lên lịch gửi thông báo</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/test-notifications')}>
          <h2 className="text-xl font-semibold mb-4">🧪 Test Thông Báo Tự Động</h2>
          <p className="text-gray-600">Kiểm tra chức năng gửi thông báo tự động cho phụ huynh qua Zalo/SMS</p>
        </div>
      </div>
    </div>
  );
}