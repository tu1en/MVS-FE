import { Alert, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ClassroomService from '../../services/classroomService';

const { Title, Text } = Typography;

const EnrolledCourses = () => {
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('my-courses'); // 'my-courses' or 'all-courses'
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatPrice = (price) => {
    const n = typeof price === 'number' ? price : Number(price);
    const safe = Number.isFinite(n) ? n : 0;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(safe);
  };

  const formatStudents = (value) => {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n.toLocaleString('vi-VN') : '0';
  };

  const fallback = (v, d) => (v === null || v === undefined || v === '' ? d : v);

  const fetchCourses = async () => {
    try {
      setLoading(true);

      // Fetch enrolled courses
      const enrolledData = await ClassroomService.getMyStudentCourses();
      const enrolled = Array.isArray(enrolledData?.data) ? enrolledData.data : (Array.isArray(enrolledData) ? enrolledData : []);
      setCourses(enrolled);

      // Load all available public courses
      try {
        const allCoursesResponse = await fetch('/api/courses/public');
        if (allCoursesResponse.ok) {
          const allCoursesData = await allCoursesResponse.json();
          const list = allCoursesData?.data || allCoursesData || [];
          const transformedCourses = (Array.isArray(list) ? list : []).map((course) => ({
            id: course.id ?? course.course_id ?? course.class_id,
            className: fallback(course.name ?? course.title, 'Khóa học'),
            description: fallback(course.description, 'Đang cập nhật'),
            teacherName: fallback(course.teacherName ?? course.instructor, 'Đang cập nhật'),
            price: course.enrollment_fee ?? course.price ?? 0,
            duration:
              course.duration ??
              (Number.isFinite(Number(course.total_weeks)) ? `${Number(course.total_weeks)} tuần` : '—'),
            students:
              Number.isFinite(Number(course.max_students_per_template))
                ? Number(course.max_students_per_template)
                : Number.isFinite(Number(course.students))
                ? Number(course.students)
                : 0,
            rating: Number.isFinite(Number(course.rating)) ? Number(course.rating) : 4.5,
            level: fallback(course.level, 'Cơ bản'),
            isEnrolled: false,
            progress: 0,
            subject: course.subject,
          }));

          setAllCourses(transformedCourses);
        } else {
          console.error('Failed to fetch all courses');
          setAllCourses([]);
        }
      } catch (error) {
        console.error('Error loading all courses:', error);
        setAllCourses([]);
      }

      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (course) => {
    navigate(`/enroll/${course.id}`);
  };

  const normalizeEnrolled = (enrolledCourse) => {
    const id = enrolledCourse?.id ?? enrolledCourse?.courseId ?? enrolledCourse?.classId;
    const durationWeeks = Number(enrolledCourse?.total_weeks);
    return {
      ...enrolledCourse,
      id,
      className: fallback(enrolledCourse?.className ?? enrolledCourse?.name ?? enrolledCourse?.title, 'Khóa học'),
      description: fallback(enrolledCourse?.description, 'Đang cập nhật'),
      teacherName: fallback(enrolledCourse?.teacherName ?? enrolledCourse?.instructor, 'Đang cập nhật'),
      students: Number.isFinite(Number(enrolledCourse?.students)) ? Number(enrolledCourse?.students) : 0,
      rating: Number.isFinite(Number(enrolledCourse?.rating)) ? Number(enrolledCourse?.rating) : 4.5,
      level: fallback(enrolledCourse?.level, 'Cơ bản'),
      duration:
        enrolledCourse?.duration ??
        (Number.isFinite(durationWeeks) ? `${durationWeeks} tuần` : '—'),
      isEnrolled: true,
      progress: Number.isFinite(Number(enrolledCourse?.progress))
        ? Number(enrolledCourse?.progress)
        : Math.floor(Math.random() * 100), // TODO: replace with real progress
      price: 0, // already paid
    };
  };

  const getCurrentCourses = () => {
    if (activeView === 'my-courses') {
      return (Array.isArray(courses) ? courses : []).map(normalizeEnrolled);
    }
    const enrolledIds = new Set((Array.isArray(courses) ? courses : []).map((c) => c?.id ?? c?.courseId ?? c?.classId));
    return (Array.isArray(allCourses) ? allCourses : []).map((course) => ({
      ...course,
      isEnrolled: enrolledIds.has(course.id),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto">
          <Alert message={error} type="error" showIcon />
        </div>
      </div>
    );
  }

  const currentCourses = getCurrentCourses();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">🎓 Khóa Học Của Tôi</h1>
          <p className="text-xl text-center text-blue-100">Quản lý và theo dõi tiến độ học tập của bạn</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Toggle Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {activeView === 'my-courses' ? '📚 Khóa học đã đăng ký' : '🌟 Tất cả khóa học'}
              </h2>
              <p className="text-gray-600">
                {activeView === 'my-courses'
                  ? `Bạn đã đăng ký ${currentCourses.length} khóa học`
                  : `Khám phá ${currentCourses.length} khóa học chất lượng`}
              </p>
            </div>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveView('my-courses')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeView === 'my-courses' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📚 Khóa học của tôi
              </button>
              <button
                onClick={() => setActiveView('all-courses')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeView === 'all-courses' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🌟 Tất cả khóa học
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
              <div className="text-sm text-gray-600">Đã đăng ký</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {courses.length > 0 ? Math.round(Math.random() * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Tiến độ TB</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.max((allCourses?.length || 0) - (courses?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Chưa đăng ký</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{Math.floor((courses?.length || 0) * 0.3)}</div>
              <div className="text-sm text-gray-600">Hoàn thành</div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {currentCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCourses.map((course) => (
              <div key={course.id || Math.random()} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                {/* Course Header */}
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-purple-500 rounded-t-lg flex items-center justify-center">
                    <span className="text-white text-6xl">📚</span>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        (course.level ?? 'Cơ bản') === 'Cơ bản'
                          ? 'bg-green-100 text-green-800'
                          : (course.level ?? '') === 'Trung cấp'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {fallback(course.level, 'Cơ bản')}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center bg-white bg-opacity-90 rounded px-2 py-1">
                      <span className="text-yellow-500 text-sm">⭐</span>
                      <span className="text-sm font-medium ml-1">
                        {Number.isFinite(Number(course?.rating)) ? Number(course.rating) : 4.5}
                      </span>
                    </div>
                  </div>
                  {course.isEnrolled && (
                    <div className="absolute bottom-4 right-4">
                      <span className="px-2 py-1 bg-green-500 text-white rounded text-xs font-medium">✅ Đã đăng ký</span>
                    </div>
                  )}
                </div>

                {/* Course Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{fallback(course?.className, 'Khóa học')}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{fallback(course?.description, 'Đang cập nhật')}</p>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">👨‍🏫 {fallback(course?.teacherName, 'Đang cập nhật')}</p>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>⏱️ {fallback(course?.duration, '—')}</span>
                      <span>👥 {formatStudents(course?.students)}</span>
                    </div>
                  </div>

                  {/* Progress for enrolled courses */}
                  {course.isEnrolled && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Tiến độ học tập:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {Number.isFinite(Number(course?.progress)) ? Number(course.progress) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                          style={{ width: `${Math.max(0, Math.min(100, Number(course?.progress) || 0))}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Price for non-enrolled courses */}
                  {!course.isEnrolled && (
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-blue-600">{formatPrice(course?.price)}</span>
                    </div>
                  )}

                  {/* Action Button */}
                  {course.isEnrolled ? (
                    <button
                      onClick={() => navigate(`/student/courses/${course.id}`)}
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      📖 Tiếp tục học
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => navigate(`/course-preview/${course.id}`)}
                        className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        👀 Xem chi tiết
                      </button>
                      <button
                        onClick={() => handleEnrollClick(course)}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                      >
                        🎯 Đăng ký học
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">{activeView === 'my-courses' ? '📚' : '🔍'}</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {activeView === 'my-courses' ? 'Chưa có khóa học nào' : 'Không tìm thấy khóa học'}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeView === 'my-courses'
                ? 'Hãy khám phá và đăng ký khóa học đầu tiên của bạn!'
                : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'}
            </p>
            {activeView === 'my-courses' && (
              <button
                onClick={() => setActiveView('all-courses')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🌟 Xem tất cả khóa học
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrolledCourses;
