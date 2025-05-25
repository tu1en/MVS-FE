import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

/**
 * LearningHistoryPage component displays a student's learning history
 * @returns {JSX.Element} LearningHistoryPage component
 */
function LearningHistoryPage() {
  const { studentId } = useParams();

  // Mock data for demonstration
  const [student] = useState({
    id: studentId,
    name: 'Nguyễn Văn An',
    grade: 'Lớp 10',
    totalCourses: 15,
    completedCourses: 12
  });

  const [courseProgress] = useState([
    { subject: "Toán Học 101", progress: 80 },
    { subject: "Vật Lý Cơ Bản", progress: 65 },
    { subject: "Văn Học Nhập Môn", progress: 90 }
  ]);

  const [activities] = useState([
    {
      id: 1,
      courseName: 'Toán Học 101',
      date: '2024-05-20',
      status: 'Hoàn thành'
    },
    {
      id: 2,
      courseName: 'Vật Lý Cơ Bản',
      type: 'assignment',
      assignmentName: 'Bài tập về nhà số 3',
      date: '2024-05-18',
      status: 'Đã nộp'
    },
    {
      id: 3,
      courseName: 'Văn Học Nhập Môn',
      type: 'exam',
      examName: 'Kiểm tra giữa kỳ',
      date: '2024-05-15',
      status: 'Hoàn thành'
    }
  ]);

  const [history] = useState([
    {
      subject: "Toán Học 101",
      score: 9.2,
      status: "Đang học",
      date: "",
    },
    {
      subject: "Vật Lý Cơ Bản",
      score: 7.5,
      status: "Đang học",
      date: "",
    },
    {
      subject: "Văn Học Nhập Môn",
      score: 8.0,
      status: "Đang học",
      date: "",
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Student Overview Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{student.name} - Lịch Sử Học Tập</h1>
            <p className="text-gray-600 mt-1">{student.grade}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Tổng số khóa học</div>
            <div className="text-2xl font-bold text-primary">
              {student.completedCourses}/{student.totalCourses}
            </div>
          </div>
        </div>

        {/* Progress Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-600 text-sm font-medium">Khóa học đã hoàn thành</div>
            <div className="text-2xl font-bold text-blue-700">{student.completedCourses}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-purple-600 text-sm font-medium">Bài tập đã nộp</div>
            <div className="text-2xl font-bold text-purple-700">45/50</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-600 text-sm font-medium">Số môn đang học</div>
            <div className="text-2xl font-bold text-green-700">{courseProgress.length}</div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Hoạt Động Gần Đây</h2>
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-800">
                    {activity.courseName}
                    {activity.type === 'assignment' && ` - ${activity.assignmentName}`}
                    {activity.type === 'exam' && ` - ${activity.examName}`}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(activity.date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{activity.status}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Progress */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tiến Độ Các Khóa Học</h2>
        <div className="space-y-4">
          {courseProgress.map((course, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-800">{course.subject}</h3>
                <span className="text-blue-600">{course.progress}% hoàn thành</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning History */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Lịch Sử Học Tập</h2>
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Môn học</th>
              <th className="border px-4 py-2">Điểm số</th>
              <th className="border px-4 py-2">Trạng thái</th>
              <th className="border px-4 py-2">Ngày hoàn thành</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, idx) => (
              <tr key={idx}>
                <td className="border px-4 py-2">{item.subject}</td>
                <td className="border px-4 py-2">{item.score}</td>
                <td className="border px-4 py-2">{item.status}</td>
                <td className="border px-4 py-2">{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LearningHistoryPage;
