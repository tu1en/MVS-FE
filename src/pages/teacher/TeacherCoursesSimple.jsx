import { message } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ClassroomCreationModal from '../../components/teacher/ClassroomCreationModal';
import CreateLectureModal from '../../components/teacher/CreateLectureModal';
import Pagination from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { teacherClassroomService } from '../../services/teacherClassroomService';

const TeacherCoursesSimple = () => {
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [showCreateLectureModal, setShowCreateLectureModal] = useState(false);
  const [showCreateClassroomModal, setShowCreateClassroomModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Pagination hook - 6 courses per page
  const pagination = usePagination(courses, 6);

  useEffect(() => {
    loadTeacherCourses();
  }, []);

  const loadTeacherCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await teacherClassroomService.getMyClassrooms();
      console.log('Teacher courses response:', data);
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading teacher courses:', error);
      // Don't show error message for canceled requests
      if (error.code !== 'ERR_CANCELED') {
        setError('Không thể tải danh sách khóa học. Vui lòng thử lại: ' + error.message);
      } else {
        // If it was canceled but we got data in the console log, try once more
        try {
          const retryData = await teacherClassroomService.getMyClassrooms();
          setCourses(retryData || []);
        } catch (retryError) {
          if (retryError.code !== 'ERR_CANCELED') {
            setError('Không thể tải danh sách khóa học. Vui lòng thử lại: ' + retryError.message);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLecture = (courseId) => {
    setSelectedCourseId(courseId);
    setShowCreateLectureModal(true);
  };

  const handleLectureCreated = () => {
    setShowCreateLectureModal(false);
    setSelectedCourseId(null);
    // Reload courses to get updated data
    loadTeacherCourses();
  };
  
  const handleClassroomCreated = (newClassroom) => {
    setShowCreateClassroomModal(false);
    
    // Show a success message
    message.success(`Lớp học "${newClassroom.name}" đã được tạo thành công!`);
    
    // Reload all courses to ensure data consistency
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
        <h1 className="text-2xl font-bold">Quản lý lớp học</h1>
        <div className="flex gap-2">
          {role !== 'TEACHER' && (
          <button 
            onClick={() => setShowCreateClassroomModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <span className="text-sm">📝</span>
              Tạo lớp học mới
          </button>
          )}
          <button 
            onClick={() => {
              if (courses.length === 0) {
                message.warning("Bạn cần có khóa học trước khi tạo bài giảng!");
              } else if (courses.length === 1) {
                // If there's only one course, select it automatically
                setSelectedCourseId(courses[0].id);
                setShowCreateLectureModal(true);
              } else {
                // If multiple courses, require selection
                setSelectedCourseId(null); // Clear any previous selection
                setShowCreateLectureModal(true);
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
          <p className="text-gray-500 mb-4">Chưa có lớp học nào được phân công.</p>
          {role !== 'TEACHER' && (
          <button 
            onClick={() => setShowCreateClassroomModal(true)}
            className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
              Tạo lớp học mới
          </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pagination.currentData.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md p-6 border">
              <h3 className="text-xl font-semibold mb-2">{course.classroomName}</h3>
              <p className="text-gray-600 mb-3">{course.description}</p>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Môn học:</span> {course.description || course.section || 'N/A'}
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
              
              <div className="course-action-buttons">
                <button
                  onClick={() => handleViewDetail(course.id)}
                  className="course-action-button primary"
                >
                  Xem chi tiết
                </button>
                <button
                  onClick={() => navigate(`/teacher/courses/${course.id}/edit`)}
                  className="course-action-button success"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => navigate(`/teacher/courses/${course.id}/assignments`)}
                  className="course-action-button secondary"
                >
                  Bài tập
                </button>
                <button
                  onClick={() => handleCreateLecture(course.id)}
                  className="course-action-button warning"
                >
                  Tạo bài giảng
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {courses.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          pageNumbers={pagination.pageNumbers}
          onPageChange={pagination.goToPage}
          onNextPage={pagination.goToNextPage}
          onPreviousPage={pagination.goToPreviousPage}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          itemName="khóa học"
        />
      )}

      {courses.length > 0 && (
        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Thống kê tổng quan</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
              <div className="text-sm text-gray-600">Lớp học</div>
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

      {role !== 'TEACHER' && (
      <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-700 mb-2">Lưu ý về đề xuất khóa học</h3>
        <p className="text-blue-600">
          Giáo viên không thể trực tiếp tạo khóa học. Khi bạn đề xuất khóa học mới, vui lòng cung cấp thông tin về thời gian không thể dạy để nhà trường xem xét và sắp xếp lịch phù hợp.
        </p>
      </div>
      )}

      {/* Create Lecture Modal */}
      <CreateLectureModal
        open={showCreateLectureModal}
        onCancel={() => {
          setShowCreateLectureModal(false);
          setSelectedCourseId(null);
        }}
        onSuccess={handleLectureCreated}
        courseId={selectedCourseId}
        courses={courses}
      />
      
      {/* Create Classroom Modal */}
      <ClassroomCreationModal
        visible={showCreateClassroomModal}
        onCancel={() => setShowCreateClassroomModal(false)}
        onSuccess={handleClassroomCreated}
      />
    </div>
  );
};

export default TeacherCoursesSimple;
