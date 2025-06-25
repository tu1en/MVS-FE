import { message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCreationModal from '../../components/teacher/CourseCreationModal';
import CreateLectureModal from '../../components/teacher/CreateLectureModal';

const TeacherCoursesSimple = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    loadTeacherCourses();
  }, []);

  const loadTeacherCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      // Using fetch instead of axios for better error handling
      const response = await fetch('http://localhost:8088/api/classrooms/current-teacher', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', response.status, errorData);
        throw new Error(`Không thể kết nối đến server (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Teacher courses response:', data);
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading teacher courses:', error);
      setError('Không thể tải danh sách khóa học. Vui lòng thử lại: ' + error.message);
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
  
  const handleCourseSuggested = (newCourse) => {
    setShowCreateCourseModal(false);
    
    // Show a success message
    message.success(`Đề xuất khóa học "${newCourse.name}" đã được gửi thành công!`);
    
    // Optional: Reload all courses to ensure data consistency
    setTimeout(() => {
      loadTeacherCourses();
    }, 500);
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
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCreateCourseModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <span className="text-sm">📝</span>
            Đề xuất khóa học mới
          </button>
          <button 
            onClick={() => {
              if (courses.length === 0) {
                message.warning("Bạn cần có khóa học trước khi tạo bài giảng!");
              } else if (courses.length === 1) {
                // If there's only one course, select it automatically
                setSelectedCourseId(courses[0].id);
                setShowCreateModal(true);
              } else {
                // If multiple courses, require selection
                setSelectedCourseId(null); // Clear any previous selection
                setShowCreateModal(true);
              }
            }}
            className={`${
              courses.length === 0 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-green-500 hover:bg-green-600"
            } text-white px-4 py-2 rounded flex items-center gap-2`}
            disabled={courses.length === 0}
          >
            <span className="text-sm">📚</span>
            Tạo bài giảng mới
          </button>
        </div>
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Chưa có khóa học nào được phân công.</p>
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg max-w-lg mx-auto">
            <h3 className="text-lg font-semibold text-yellow-700 mb-2">Thông báo</h3>
            <p className="text-yellow-600">
              Giáo viên không thể trực tiếp tạo khóa học. Bạn có thể gửi đề xuất khóa học mới kèm theo thời gian không thể dạy để nhà trường xem xét và sắp xếp lịch phù hợp.
            </p>
            <button 
              onClick={() => setShowCreateCourseModal(true)}
              className="mt-3 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Đề xuất khóa học mới
            </button>
          </div>
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
                <button 
                  onClick={() => navigate(`/teacher/courses/${course.id}/edit`)}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Chỉnh sửa
                </button>
                <button 
                  onClick={() => navigate(`/teacher/courses/${course.id}/assignments`)}
                  className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
                >
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

      <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-700 mb-2">Lưu ý về đề xuất khóa học</h3>
        <p className="text-blue-600">
          Giáo viên không thể trực tiếp tạo khóa học. Khi bạn đề xuất khóa học mới, vui lòng cung cấp thông tin về thời gian không thể dạy để nhà trường xem xét và sắp xếp lịch phù hợp.
        </p>
      </div>

      {/* Create Lecture Modal */}
      <CreateLectureModal
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          setSelectedCourseId(null);
        }}
        onSuccess={handleLectureCreated}
        courseId={selectedCourseId}
      />
      
      {/* Suggest Course Modal */}
      <CourseCreationModal
        visible={showCreateCourseModal}
        onCancel={() => setShowCreateCourseModal(false)}
        onSuccess={handleCourseSuggested}
      />
    </div>
  );
};

export default TeacherCoursesSimple;
