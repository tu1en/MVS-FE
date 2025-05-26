import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeacherDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'TEACHER') {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Trang Giáo Viên</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Lớp học của tôi</h2>
          <p className="text-gray-600">Xem và quản lý các lớp học bạn phụ trách</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Bài tập</h2>
          <p className="text-gray-600">Tạo và quản lý bài tập cho học sinh</p>
        </div>
      </div>
    </div>
  );
}