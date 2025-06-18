import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateLectureModal from '../../components/teacher/CreateLectureModal';
import LectureList from '../../components/teacher/LectureList';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('lectures');
  const [editingLecture, setEditingLecture] = useState(null);

  useEffect(() => {
    if (courseId) {
      loadCourseDetail();
    }
  }, [courseId]);

  const loadCourseDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8088/api/classrooms/current-teacher', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      const courses = response.data || [];
      const foundCourse = courses.find(c => c.id === parseInt(courseId));
      
      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        setError('Không tìm thấy khóa học.');
      }
    } catch (error) {
      console.error('Error loading course detail:', error);
      setError('Không thể tải thông tin khóa học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleLectureCreated = () => {
    setShowCreateModal(false);
    setEditingLecture(null);
    // Refresh course detail and lectures list
    loadCourseDetail();
  };

  const handleEditLecture = (lecture) => {
    setEditingLecture(lecture);
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Chi tiết khóa học</h1>
        <p>Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Chi tiết khóa học</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Không tìm thấy khóa học.'}</p>
          <div className="mt-4 space-x-2">
            <button 
              onClick={loadCourseDetail}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Thử lại
            </button>
            <button 
              onClick={() => navigate('/teacher/courses')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <button 
              onClick={() => navigate('/teacher/courses')}
              className="text-blue-500 hover:text-blue-700 mb-2 flex items-center"
            >
              ← Quay lại danh sách khóa học
            </button>
            <h1 className="text-3xl font-bold mb-2">{course.name}</h1>
            <p className="text-gray-600 mb-4">{course.description}</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
          >
            <span>📚</span>
            Tạo bài giảng mới
          </button>
        </div>

        {/* Course Info Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{course.enrolledStudents?.length || 0}</div>
            <div className="text-sm text-blue-800">Học viên</div>
          </div>
          <div className="bg-green-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{course.assignments?.length || 0}</div>
            <div className="text-sm text-green-800">Bài tập</div>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{course.subject}</div>
            <div className="text-sm text-purple-800">Môn học</div>
          </div>
          <div className="bg-orange-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{course.section}</div>
            <div className="text-sm text-orange-800">Lớp</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('lectures')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'lectures'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bài giảng
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'students'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Học viên
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assignments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bài tập
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cài đặt
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'lectures' && (
          <LectureList 
            courseId={courseId} 
            courseName={course.name} 
            onEditLecture={handleEditLecture}
          />
        )}
        
        {activeTab === 'students' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Danh sách học viên</h3>
            {course.enrolledStudents && course.enrolledStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Tên</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Trạng thái</th>
                      <th className="px-4 py-2 text-left">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.enrolledStudents.map((student, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{student.name || `Học viên ${index + 1}`}</td>
                        <td className="px-4 py-2">{student.email || 'N/A'}</td>
                        <td className="px-4 py-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            Đang học
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <button className="text-blue-500 hover:text-blue-700 text-sm">
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Chưa có học viên nào đăng ký khóa học này.</p>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Bài tập</h3>
            {course.assignments && course.assignments.length > 0 ? (
              <div className="space-y-4">
                {course.assignments.map((assignment, index) => (
                  <div key={index} className="border rounded p-4">
                    <h4 className="font-semibold">{assignment.title || `Bài tập ${index + 1}`}</h4>
                    <p className="text-gray-600 text-sm">{assignment.description || 'Chưa có mô tả'}</p>
                    <div className="mt-2 flex space-x-2">
                      <button className="text-blue-500 hover:text-blue-700 text-sm">Chỉnh sửa</button>
                      <button className="text-green-500 hover:text-green-700 text-sm">Xem bài nộp</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Chưa có bài tập nào cho khóa học này.</p>
            )}
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Tạo bài tập mới
            </button>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Cài đặt khóa học</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên khóa học
                </label>
                <input 
                  type="text" 
                  defaultValue={course.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea 
                  defaultValue={course.description}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div className="flex space-x-2">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Lưu thay đổi
                </button>
                <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Lecture Modal */}
      <CreateLectureModal
        visible={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          setEditingLecture(null);
        }}
        onSuccess={handleLectureCreated}
        courseId={parseInt(courseId)}
        editingLecture={editingLecture}
      />
    </div>
  );
};

export default CourseDetail;
