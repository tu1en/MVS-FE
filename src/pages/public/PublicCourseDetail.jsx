import {
    Award,
    BookOpen,
    CheckCircle,
    Clock,
    Heart,
    MessageCircle,
    RefreshCw,
    Share2,
    User,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CourseDescription from '../../components/course/CourseDescription';
import YouTubeEmbed from '../../components/ui/YouTubeEmbed';
import API_CONFIG from '../../config/api-config';
import { normalizeCourseData } from '../../constants/displayConstants';
import { useAuth } from '../../context/AuthContext';
import courseService from '../../services/courseService';

const PublicCourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    fetchCourseDetail();
    // Load liked status from localStorage
    const liked = localStorage.getItem(`liked_course_${id}`);
    setIsLiked(liked === 'true');
  }, [id]);

  const normalizeCourse = (raw) => {
    const d = raw?.data ?? raw;

    // Use the standardized normalization function for consistency
    const baseNormalized = normalizeCourseData(d);

    // Add specific fields needed for this component
    const startDate = d.startDate || d.start_date || d.start_time || d.start || null;
    const endDate = d.endDate || d.end_date || d.end_time || d.end || null;
    let totalWeeks = d.totalWeeks || d.total_weeks || d.weeks || d.durationWeeks || null;
    if (!totalWeeks && startDate && endDate) {
      try {
        const s = new Date(startDate);
        const e = new Date(endDate);
        const diffDays = Math.max(0, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
        totalWeeks = Math.max(1, Math.ceil(diffDays / 7));
      } catch (_) { /* noop */ }
    }

    return {
      ...baseNormalized,
      // Override with component-specific fields
      className: d.className,
      startDate,
      endDate,
      totalWeeks,
      // Teacher - now consistently uses COURSE_FALLBACKS.instructor
      teacherName: baseNormalized.instructor,
      instructorName: baseNormalized.instructor,
      // Video intro
      introVideoUrl: d.introVideoUrl || d.videoUrl || null,
      // Lessons
      lessonCount: d.lessonCount || (Array.isArray(d.lessons) ? d.lessons.length : undefined),
      // Ratings (nếu BE không có thì để undefined, không random)
      rating: d.averageRating || d.rating || baseNormalized.rating,
      totalRatings: d.totalRatings || d.reviewsCount
    };
  };

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      // Thử lấy chi tiết lớp công khai trước; nếu không có, fallback sang template public
      let data = null;
      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PUBLIC_CLASS_DETAIL(id)}`);
        if (res.ok) {
          data = await res.json();
        }
      } catch (_) {}
      if (!data) {
        const response = await courseService.getPublicCourseDetail(id);
        data = response.data;
      }
      const normalized = normalizeCourse(data);
      setCourse(normalized);
      // Nếu là route lớp công khai /public/classes/:id hoặc chưa có số bài học, gọi thêm API lessons để bổ sung
      try {
        if (!normalized.lessonCount || normalized.lessonCount === 0) {
          // Dùng endpoint public để tránh 403
          const resLessons = await fetch(`${API_CONFIG.BASE_URL}/public/courses/by-class/${id}/lessons`);
          if (resLessons.ok) {
            const lessonPayload = await resLessons.json();
            const lessons = Array.isArray(lessonPayload?.data) ? lessonPayload.data : (Array.isArray(lessonPayload) ? lessonPayload : []);
            setCourse(prev => ({ ...prev, lessonCount: Array.isArray(lessons) ? lessons.length : prev.lessonCount }));
          }
        }
      } catch (_) {}
      setError(null);
    } catch (error) {
      console.error('Lỗi khi tải khóa học:', error);
      setError('Không thể tải thông tin khóa học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = () => {
    // Khi người dùng nhấn nút, chuyển tới Messenger
    window.location.href = 'https://www.facebook.com/messages/t/544090102127045';
  };

  const toggleLike = () => {
    const newLikedStatus = !isLiked;
    setIsLiked(newLikedStatus);
    localStorage.setItem(`liked_course_${id}`, newLikedStatus.toString());
  };

  const shareHandler = () => {
    if (navigator.share) {
      navigator.share({
        title: course?.name || course?.className,
        text: course?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép link khóa học!');
    }
  };

  // Helper functions (không dùng dữ liệu ngẫu nhiên)
  const getCourseStats = (c) => {
    let durationWeeks;
    // Ưu tiên hiển thị tổng số buổi (slot) nếu đã có danh sách bài học
    if (Number.isFinite(c?.lessonCount) && c.lessonCount > 0) {
      durationWeeks = `${c.lessonCount} buổi`;
    } else if (c?.totalWeeks) {
      durationWeeks = `${c.totalWeeks} tuần`;
    } else if (c?.startDate && c?.endDate) {
      try {
        const s = new Date(c.startDate);
        const e = new Date(c.endDate);
        const diffDays = Math.max(0, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
        durationWeeks = `${Math.max(1, Math.ceil(diffDays / 7))} tuần`;
      } catch (_) {
        durationWeeks = undefined;
      }
    }
    return {
      rating: undefined,
      totalRatings: undefined,
      students: c?.currentStudents ?? 0,
      maxStudents: c?.maxStudents ?? 0,
      duration: durationWeeks,
      lessons: c?.lessonCount ?? 0,
      level: c?.level,
      language: 'Tiếng Việt',
      certificate: Boolean(c?.certificate)
    };
  };

  const getInstructorInfo = (c) => ({
    name: c?.teacherName || c?.instructorName || null
  });

  const getCourseFeatures = () => [
    "Video bài giảng chất lượng cao",
    "Tài liệu học tập đầy đủ", 
    "Bài tập thực hành",
    "Quiz và kiểm tra định kỳ",
    "Hỗ trợ trực tuyến",
    "Chứng chỉ hoàn thành",
    "Cập nhật nội dung mới",
    "Học nhóm và thảo luận"
  ];

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: BookOpen },
    { id: 'instructor', label: 'Giảng viên', icon: User }
  ];

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-500 border-t-transparent mx-auto mb-8"></div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Đang tải khóa học...</h2>
          <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="text-6xl mb-6">😞</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Có lỗi xảy ra</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={fetchCourseDetail}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy khóa học</h2>
            <p className="text-gray-600 mb-6">
              Khóa học bạn đang tìm kiếm không tồn tại hoặc không được công khai.
            </p>
            <button 
              onClick={() => navigate('/public/courses')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Xem tất cả khóa học
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Đã gửi yêu cầu đăng ký!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Cảm ơn bạn đã quan tâm đến <strong>{course.name || course.className}</strong>. 
              Yêu cầu đăng ký của bạn đã được gửi thành công.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Tiếp theo là gì?</h3>
              <ul className="text-left text-gray-700 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Hệ thống sẽ xem xét yêu cầu của bạn
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Bạn sẽ nhận được email xác nhận sớm
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Nếu được duyệt, bạn sẽ nhận hướng dẫn truy cập
                </li>
              </ul>
            </div>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => navigate('/public/courses')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Xem thêm khóa học
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Gửi yêu cầu khác
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getCourseStats(course);
  const instructor = getInstructorInfo(course);
  const features = getCourseFeatures();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-600">
            <button 
              onClick={() => navigate('/public/courses')}
              className="hover:text-blue-600 transition-colors"
            >
              Tất cả khóa học
            </button>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{course.name || course.className}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              
              {/* Course Header */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {stats.level}
                      </span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {stats.language}
                      </span>
                      {stats.certificate && (
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          Chứng chỉ
                        </span>
                      )}
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                      {course.name || course.className}
                    </h1>
                    
                      <div className="flex items-center gap-6 text-sm">
                        {/* Ẩn đánh giá trên header */}
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>Tối đa 30 học sinh</span>
                        </div>
                        {stats.duration && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{stats.duration}</span>
                          </div>
                        )}
                      </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleLike}
                      className={`p-3 rounded-full transition-colors ${
                        isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <button 
                      onClick={shareHandler}
                      className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.lessons ?? 0}</div>
                    <div className="text-sm text-gray-600">Bài học</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.duration || '—'}</div>
                    <div className="text-sm text-gray-600">Thời lượng</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">30</div>
                    <div className="text-sm text-gray-600">Học sinh tối đa</div>
                  </div>
                  {/* Ẩn ô đánh giá trong quick stats */}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="bg-white rounded-2xl shadow-lg mb-8">
                <div className="border-b border-gray-200">
                  <nav className="flex">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                            activeTab === tab.id
                              ? 'text-blue-600 border-b-2 border-blue-600'
                              : 'text-gray-600 hover:text-blue-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="p-8">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Video giới thiệu */}
                      {course.introVideoUrl && (
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-4">🎥 Video giới thiệu</h3>
                          <div className="bg-gray-100 rounded-xl overflow-hidden">
                            <YouTubeEmbed url={course.introVideoUrl} />
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Mô tả khóa học</h3>
                        <div className="prose max-w-none">
                          <CourseDescription 
                            description={course.description} 
                            courseId={course.id || id}
                          />
                          
                          {course.objectives && (
                            <div className="mt-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-3">Mục tiêu học tập</h4>
                              <p className="text-gray-600 leading-relaxed">{course.objectives}</p>
                            </div>
                          )}

                          {course.prerequisites && (
                            <div className="mt-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-3">Yêu cầu đầu vào</h4>
                              <p className="text-gray-600 leading-relaxed">{course.prerequisites}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Bạn sẽ học được gì?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instructor Tab */}
                  {activeTab === 'instructor' && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Giảng viên</h3>
                      <div className="bg-gray-50 rounded-xl p-6">
                        {instructor.name ? (
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-semibold">{instructor.name}</div>
                            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                              <MessageCircle className="w-4 h-4" />
                              Nhắn tin cho giảng viên
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-gray-600">Chưa có giảng viên</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ẩn tab đánh giá */}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                
                {/* Enrollment Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {course.tuitionFee || course.enrollmentFee || course.enrollment_fee ? 
                        `${(course.tuitionFee || course.enrollmentFee || course.enrollment_fee).toLocaleString('vi-VN')}đ` : 
                        'Miễn phí'
                      }
                    </div>
                    <div className="text-sm text-green-600 font-semibold">
                      Đặc biệt ưu đãi!
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                      <p className="text-sm">{error}</p>
                    </div>
                  )}
                  
                  {/* Message Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tin nhắn (tùy chọn)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      rows="4"
                      placeholder="Gửi lời nhắn đến trung tâm hoặc giảng viên..."
                      maxLength="500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {message.length}/500 ký tự
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <button
                      onClick={handleEnrollment}
                      disabled={enrolling}
                      className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 disabled:bg-blue-400 disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {enrolling ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-5 h-5" />
                          Đăng ký học qua Messenger
                        </>
                      )}
                    </button>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        Nhấn nút để chuyển đến Messenger và hoàn tất đăng ký.
                      </p>
                      <p className="text-xs text-gray-500">
                        Tối đa 30 học sinh
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-600 space-y-2">
                      {course.instructorName && (
                        <div className="flex items-center justify-between">
                          <span>Giảng viên:</span>
                          <span className="font-semibold">{course.instructorName}</span>
                        </div>
                      )}
                      {course.duration && (
                        <div className="flex items-center justify-between">
                          <span>Thời lượng:</span>
                          <span className="font-semibold">{course.duration} tuần</span>
                        </div>
                      )}
                      {course.subject && (
                        <div className="flex items-center justify-between">
                          <span>Môn học:</span>
                          <span className="font-semibold">{course.subject}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span>Truy cập:</span>
                        <span className="font-semibold">Trọn đời</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Includes */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Khóa học bao gồm:</h4>
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCourseDetail;