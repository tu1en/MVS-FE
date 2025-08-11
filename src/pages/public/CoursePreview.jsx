import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import courseService from '../../services/courseService';

const CoursePreview = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Load course from API
  useEffect(() => {
    loadCourseDetail();
  }, [courseId]);

  const loadCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseById(courseId);
      const courseData = response.data;
      
      if (courseData) {
        // Transform API data to match component expectations
        const transformedCourse = {
          id: courseData.id,
          title: courseData.title || courseData.name,
          description: courseData.description,
          instructor: courseData.instructor || courseData.teacherName || 'Đang cập nhật',
          instructorBio: courseData.instructorBio || '5+ năm kinh nghiệm giảng dạy',
          instructorAvatar: courseData.instructorAvatar || '/api/placeholder/100/100',
          price: courseData.enrollment_fee || courseData.enrollmentFee || courseData.price || 0,
          originalPrice: courseData.originalPrice,
          duration: courseData.duration || `${courseData.total_weeks || 0} tuần`,
          students: courseData.max_students_per_template || courseData.students || 0,
          rating: courseData.rating || 4.5,
          totalRatings: courseData.totalRatings || 50,
          level: courseData.level || 'Cơ bản',
          category: courseData.category || courseData.subject || 'Programming',
          image: courseData.image || '/api/placeholder/800/400',
          tags: courseData.tags || [courseData.subject].filter(Boolean),
          features: courseData.features || [
            `${courseData.total_weeks || 8} tuần học`,
            'Tài liệu đầy đủ',
            'Chứng chỉ hoàn thành',
            'Hỗ trợ 24/7'
          ],
          objectives: courseData.objectives || [
            'Nắm vững kiến thức cơ bản',
            'Thực hành với dự án thực tế',
            'Phát triển kỹ năng chuyên môn'
          ],
          curriculum: courseData.curriculum || [],
          reviews: courseData.reviews || [],
          requirements: courseData.requirements || [
            'Kiến thức cơ bản về máy tính',
            'Máy tính có kết nối internet',
            'Sẵn sàng học hỏi và thực hành'
          ],
          targetAudience: courseData.targetAudience || [
            'Sinh viên muốn học thêm kỹ năng',
            'Người mới bắt đầu',
            'Chuyên viên muốn nâng cao trình độ'
          ]
        };
        
        setCourse(transformedCourse);
      } else {
        setCourse(null);
      }
    } catch (error) {
      console.error('Error loading course detail:', error);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      navigate('/register', { 
        state: { 
          redirectTo: `/course/${courseId}`,
          message: 'Đăng ký tài khoản để tham gia khóa học này'
        }
      });
    } else {
      navigate(`/enroll/${courseId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin khóa học...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy khóa học</h2>
          <p className="text-gray-600 mb-4">Khóa học bạn tìm kiếm không tồn tại hoặc đã bị xóa</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách khóa học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Column - Course Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  course.level === 'Cơ bản' ? 'bg-green-100 text-green-800' :
                  course.level === 'Trung cấp' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {course.level}
                </span>
                <span className="text-blue-200">{course.category}</span>
              </div>

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-blue-100 mb-6">{course.description}</p>

              {/* Instructor */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-xl">👨‍🏫</span>
                </div>
                <div>
                  <p className="font-medium">{course.instructor}</p>
                  <p className="text-blue-200 text-sm">{course.instructorBio}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 mb-6 text-sm">
                <div className="flex items-center">
                  <span className="text-yellow-300 mr-1">⭐</span>
                  <span>{course.rating} ({course.totalRatings} đánh giá)</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-1">👥</span>
                  <span>{course.students.toLocaleString()} học viên</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-1">⏱️</span>
                  <span>{course.duration}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {course.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-white bg-opacity-20 text-white text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column - Enrollment Card */}
            <div className="bg-white rounded-lg shadow-xl p-6 text-gray-900">
              <div className="mb-6">
                <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-6xl">🎓</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-blue-600">
                      {formatPrice(course.price)}
                    </span>
                    {course.originalPrice > course.price && (
                      <span className="text-lg text-gray-500 line-through ml-2">
                        {formatPrice(course.originalPrice)}
                      </span>
                    )}
                  </div>
                  {course.originalPrice > course.price && (
                    <div className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-medium">
                      Giảm {Math.round((1 - course.price / course.originalPrice) * 100)}%
                    </div>
                  )}
                </div>

                <button
                  onClick={handleEnrollClick}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  {isAuthenticated ? '🎯 Đăng ký học ngay' : '🚀 Đăng ký tài khoản để học'}
                </button>

                {!isAuthenticated && (
                  <p className="text-center text-gray-600 text-sm mt-3">
                    Đã có tài khoản? <button 
                      onClick={() => navigate('/login')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Đăng nhập
                    </button>
                  </p>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Khóa học bao gồm:</h4>
                <div className="space-y-2">
                  {course.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <span className="text-green-500 mr-2">✅</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: '📋 Tổng quan' },
                { id: 'curriculum', label: '📚 Nội dung khóa học' },
                { id: 'reviews', label: '⭐ Đánh giá' },
                { id: 'instructor', label: '👨‍🏫 Giảng viên' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* What you'll learn */}
                <div>
                  <h3 className="text-xl font-bold mb-4">🎯 Bạn sẽ học được gì</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.objectives.map((objective, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-green-500 mr-3 mt-0.5">✅</span>
                        <span className="text-gray-700">{objective}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h3 className="text-xl font-bold mb-4">📝 Yêu cầu</h3>
                  <div className="space-y-2">
                    {course.requirements.map((req, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-blue-500 mr-3 mt-0.5">▶️</span>
                        <span className="text-gray-700">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <h3 className="text-xl font-bold mb-4">👥 Khóa học dành cho</h3>
                  <div className="space-y-2">
                    {course.targetAudience.map((audience, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-purple-500 mr-3 mt-0.5">👤</span>
                        <span className="text-gray-700">{audience}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Curriculum Tab */}
            {activeTab === 'curriculum' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">📚 Nội dung khóa học</h3>
                  <div className="text-sm text-gray-600">
                    {course.curriculum.length} modules • {course.duration}
                  </div>
                </div>

                <div className="space-y-4">
                  {course.curriculum.map((module, index) => (
                    <div key={index} className="border rounded-lg">
                      <div className="p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            Module {module.module}: {module.title}
                          </h4>
                          <span className="text-sm text-gray-600">{module.duration}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="space-y-2">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lessonIndex} className="flex items-center">
                              <span className="text-blue-500 mr-3">▶️</span>
                              <span className="text-gray-700">{lesson}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">⭐ Đánh giá của học viên</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-500">{course.rating}/5</div>
                    <div className="text-sm text-gray-600">{course.totalRatings} đánh giá</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {course.reviews.map(review => (
                    <div key={review.id} className="border-b pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-medium">
                              {review.student[0]}
                            </span>
                          </div>
                          <span className="font-medium">{review.student}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-2">
                            {'⭐'.repeat(review.rating)}
                          </span>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>

                {!isAuthenticated && (
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-blue-800 mb-3">
                      Đăng ký để xem tất cả đánh giá và để lại nhận xét của bạn
                    </p>
                    <button
                      onClick={() => navigate('/register')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Đăng ký ngay
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Instructor Tab */}
            {activeTab === 'instructor' && (
              <div className="space-y-6">
                <div className="flex items-start space-x-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl">👨‍🏫</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{course.instructor}</h3>
                    <p className="text-gray-600 mb-4">{course.instructorBio}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="font-bold text-blue-600">5+</div>
                        <div className="text-gray-600">Năm kinh nghiệm</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="font-bold text-green-600">{course.students.toLocaleString()}</div>
                        <div className="text-gray-600">Học viên</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded">
                        <div className="font-bold text-yellow-600">{course.rating}/5</div>
                        <div className="text-gray-600">Đánh giá</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu hành trình học tập?</h2>
          <p className="text-xl text-blue-100 mb-6">
            Tham gia cùng {course.students.toLocaleString()} học viên khác
          </p>
          <button
            onClick={handleEnrollClick}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
          >
            {isAuthenticated ? '🎯 Đăng ký học ngay' : '🚀 Đăng ký tài khoản để học'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;