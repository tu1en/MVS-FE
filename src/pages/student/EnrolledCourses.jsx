import { BookOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Progress, Row, Spin, Typography } from 'antd';
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
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Fetch enrolled courses
      const enrolledData = await ClassroomService.getMyStudentCourses();
      setCourses(enrolledData.data || []);

      // Mock all available courses data
      const mockAllCourses = [
        {
          id: 1,
          className: 'React.js Cơ Bản',
          description: 'Học React.js từ cơ bản đến nâng cao',
          teacherName: 'Nguyễn Văn A',
          price: 1500000,
          duration: '40 giờ',
          students: 1250,
          rating: 4.8,
          level: 'Cơ bản',
          isEnrolled: true,
          progress: 65
        },
        {
          id: 2,
          className: 'Node.js & Express Backend',
          description: 'Phát triển API và backend mạnh mẽ',
          teacherName: 'Trần Thị B',
          price: 1800000,
          duration: '50 giờ',
          students: 980,
          rating: 4.7,
          level: 'Trung cấp',
          isEnrolled: false,
          progress: 0
        },
        {
          id: 3,
          className: 'Full-Stack JavaScript',
          description: 'Trở thành Full-Stack Developer',
          teacherName: 'Lê Văn C',
          price: 2500000,
          duration: '80 giờ',
          students: 750,
          rating: 4.9,
          level: 'Nâng cao',
          isEnrolled: false,
          progress: 0
        },
        {
          id: 4,
          className: 'Python Data Science',
          description: 'Khai phá dữ liệu và Machine Learning',
          teacherName: 'Phạm Văn D',
          price: 2000000,
          duration: '60 giờ',
          students: 890,
          rating: 4.6,
          level: 'Trung cấp',
          isEnrolled: true,
          progress: 25
        },
        {
          id: 5,
          className: 'Vue.js Modern Development',
          description: 'Phát triển ứng dụng với Vue.js 3',
          teacherName: 'Hoàng Thị E',
          price: 1600000,
          duration: '45 giờ',
          students: 650,
          rating: 4.5,
          level: 'Cơ bản',
          isEnrolled: false,
          progress: 0
        },
        {
          id: 6,
          className: 'Mobile App với React Native',
          description: 'Xây dựng app mobile đa nền tảng',
          teacherName: 'Đặng Văn F',
          price: 2200000,
          duration: '70 giờ',
          students: 420,
          rating: 4.7,
          level: 'Nâng cao',
          isEnrolled: false,
          progress: 0
        }
      ];

      setAllCourses(mockAllCourses);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Spin size="large" />
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  const handleEnrollClick = (course) => {
    // Navigate to enrollment page
    navigate(`/enroll/${course.id}`);
  };

  const getCurrentCourses = () => {
    if (activeView === 'my-courses') {
      return allCourses.filter(course => course.isEnrolled);
    }
    return allCourses;
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
          <h1 className="text-4xl font-bold text-center mb-4">
            🎓 Khóa Học Của Tôi
          </h1>
          <p className="text-xl text-center text-blue-100">
            Quản lý và theo dõi tiến độ học tập của bạn
          </p>
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
                  activeView === 'my-courses'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📚 Khóa học của tôi
              </button>
              <button
                onClick={() => setActiveView('all-courses')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeView === 'all-courses'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🌟 Tất cả khóa học
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {allCourses.filter(c => c.isEnrolled).length}
              </div>
              <div className="text-sm text-gray-600">Đã đăng ký</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(allCourses.filter(c => c.isEnrolled).reduce((sum, c) => sum + c.progress, 0) / Math.max(allCourses.filter(c => c.isEnrolled).length, 1))}%
              </div>
              <div className="text-sm text-gray-600">Tiến độ TB</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {allCourses.filter(c => !c.isEnrolled).length}
              </div>
              <div className="text-sm text-gray-600">Chưa đăng ký</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {allCourses.filter(c => c.isEnrolled && c.progress >= 80).length}
              </div>
              <div className="text-sm text-gray-600">Hoàn thành</div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {currentCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCourses.map(course => (
              <div 
                key={course.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Course Header */}
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-purple-500 rounded-t-lg flex items-center justify-center">
                    <span className="text-white text-6xl">📚</span>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      course.level === 'Cơ bản' ? 'bg-green-100 text-green-800' :
                      course.level === 'Trung cấp' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {course.level}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center bg-white bg-opacity-90 rounded px-2 py-1">
                      <span className="text-yellow-500 text-sm">⭐</span>
                      <span className="text-sm font-medium ml-1">{course.rating}</span>
                    </div>
                  </div>
                  {course.isEnrolled && (
                    <div className="absolute bottom-4 right-4">
                      <span className="px-2 py-1 bg-green-500 text-white rounded text-xs font-medium">
                        ✅ Đã đăng ký
                      </span>
                    </div>
                  )}
                </div>

                {/* Course Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {course.className}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {course.description}
                  </p>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">
                      👨‍🏫 {course.teacherName}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>⏱️ {course.duration}</span>
                      <span>👥 {course.students.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Progress for enrolled courses */}
                  {course.isEnrolled && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Tiến độ học tập:</span>
                        <span className="text-sm font-medium text-gray-900">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Price for non-enrolled courses */}
                  {!course.isEnrolled && (
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(course.price)}
                      </span>
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
            <div className="text-6xl mb-4">
              {activeView === 'my-courses' ? '📚' : '🔍'}
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {activeView === 'my-courses' 
                ? 'Chưa có khóa học nào' 
                : 'Không tìm thấy khóa học'}
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
