import React, { useEffect, useState } from "react";
import { accomplishmentService } from "../services/accomplishmentService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const StudentAccomplishments = () => {
  const [accomplishments, setAccomplishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccomplishments = async () => {
      try {
        // Get authentication data from localStorage
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const userId = localStorage.getItem('userId');
        
        // Check if user is logged in and is a student
        if (!token || !role || role !== 'STUDENT') {
          const errorMsg = "Vui lòng đăng nhập với tài khoản học sinh để xem thành tích học tập.";
          setError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          navigate('/login');
          return;
        }

        if (!userId) {
          const errorMsg = "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.";
          setError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          navigate('/login');
          return;
        }

        // Use userId directly instead of email
        const data = await accomplishmentService.getStudentAccomplishments(userId);
        if (Array.isArray(data)) {
          // Sort accomplishments by completion date in descending order (newest first)
          const sortedAccomplishments = data.sort((a, b) => 
            new Date(b.completionDate) - new Date(a.completionDate)
          );
          setAccomplishments(sortedAccomplishments);
          if (sortedAccomplishments.length === 0) {
            toast.info("Chưa có thành tích học tập nào.");
          }
        } else {
          setAccomplishments([]);
          toast.info("Chưa có thành tích học tập nào.");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching accomplishments:", err);
        const errorMsg = "Không thể tải dữ liệu thành tích học tập. Vui lòng thử lại sau.";
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
      }
    };

    fetchAccomplishments();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] bg-[#e7f6e7]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-[#e7f6e7]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#e7f6e7] min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🏆</span>
        <h1 className="text-2xl font-bold text-gray-800">Thành tựu</h1>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên khóa học
              </th>
              <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Môn học
              </th>
              <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giáo viên
              </th>
              <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Điểm
              </th>
              <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày hoàn thành
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accomplishments.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Chưa có thành tựu nào
                </td>
              </tr>
            ) : (
              accomplishments.map((accomplishment) => (
                <tr key={accomplishment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {accomplishment.courseTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {accomplishment.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {accomplishment.teacherName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          accomplishment.grade >= 8.5
                            ? "bg-green-100 text-green-800"
                            : accomplishment.grade >= 7.0
                            ? "bg-blue-100 text-blue-800"
                            : accomplishment.grade >= 5.0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                    >
                      {accomplishment.grade.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(accomplishment.completionDate), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentAccomplishments;
