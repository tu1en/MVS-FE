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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quản lý người dùng</h2>
          <p className="text-gray-600">Xem và quản lý tất cả người dùng trong hệ thống</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quản lý lớp học</h2>
          <p className="text-gray-600">Tạo và quản lý các lớp học</p>
        </div>
      </div>
    </div>
  );
}