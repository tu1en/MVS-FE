import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE } from '../constants/constants';

export default function StudentDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== ROLE.STUDENT) {
      navigate('/');
    }
  }, [navigate]);

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Trang Học Sinh</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('/student/accomplishments')}
        >
          <h2 className="text-xl font-semibold mb-4">Xem tổng quan học lực</h2>
          <p className="text-gray-600">Hiển thị tổng quát điểm trung bình, xếp loại, học lực theo môn</p>
        </div>
        <div 
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('/student/attendance')}
        >
          <h2 className="text-xl font-semibold mb-4">Xem điểm danh</h2>
          <p className="text-gray-600">Hiển thị % chuyên cần, vắng có phép, không phép</p>
        </div>
        <div 
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('/student/assignments')}
        >
          <h2 className="text-xl font-semibold mb-4">Xem bài tập</h2>
          <p className="text-gray-600">Theo dõi trạng thái các bài tập của cá nhân</p>
        </div>
        <div 
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('/student/exams')}
        >
          <h2 className="text-xl font-semibold mb-4">Xem điểm kiểm tra</h2>
          <p className="text-gray-600">Cho phép theo dõi kết quả các bài kiểm tra</p>
        </div>
      </div>
    </div>
  );
}
