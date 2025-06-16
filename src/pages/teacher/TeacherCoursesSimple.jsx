import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateLectureModal from '../../components/teacher/CreateLectureModal';

const TeacherCoursesSimple = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    loadTeacherCourses();
  }, []);

  const loadTeacherCourses = async () => {
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
      
      console.log('Teacher courses response:', response.data);
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error loading teacher courses:', error);
      setError('Không thể tải danh sách khóa học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLecture = (courseId) => {
    setSelectedCourseId(courseId);
    setShowCreateModal(true);
  };

  const handleLectureCreated = () => {
    setShowCreateModal(false);
    setSelectedCourseId(null);
    // Reload courses to get updated data
    loadTeacherCourses();
  };

  const handleViewDetail = (courseId) => {
    navigate(`/teacher/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Quản lý khóa học</h1>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Quản lý khóa học</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={loadTeacherCourses}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý khóa học</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
        >
          <span className="text-sm">📚</span>
          Tạo bài giảng mới
        </button>
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Chưa có khóa học nào được phân công.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md p-6 border">
              <h3 className="text-xl font-semibold mb-2">{course.name}</h3>
              <p className="text-gray-600 mb-3">{course.description}</p>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Môn học:</span> {course.subject}
                </div>
                <div>
                  <span className="font-medium">Lớp:</span> {course.section}
                </div>
                <div>
                  <span className="font-medium">Học viên:</span> {course.enrolledStudents?.length || 0}
                </div>
                <div>
                  <span className="font-medium">Bài tập:</span> {course.assignments?.length || 0}
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={() => handleViewDetail(course.id)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Xem chi tiết
                </button>
                <button className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">
                  Chỉnh sửa
                </button>
                <button className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600">
                  Bài tập
                </button>
                <button 
                  onClick={() => handleCreateLecture(course.id)}
                  className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  Tạo bài giảng
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {courses.length > 0 && (
        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Thống kê tổng quan</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
              <div className="text-sm text-gray-600">Khóa học</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {courses.reduce((total, course) => total + (course.enrolledStudents?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Học viên</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {courses.reduce((total, course) => total + (course.assignments?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Bài tập</div>
            </div>
          </div>
        </div>
      )}

      {/* Create Lecture Modal */}
      <CreateLectureModal
        visible={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          setSelectedCourseId(null);
        }}
        onSuccess={handleLectureCreated}
        courseId={selectedCourseId}
      />
    </div>
  );
};

export default TeacherCoursesSimple;
