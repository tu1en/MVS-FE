import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { showNotification } from '../../utils/courseManagementUtils';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';

const EnrollCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState({
    paymentMethod: 'credit_card',
    agreeTerms: false,
    agreeRefund: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          redirectTo: `/enroll/${courseId}`,
          message: 'Vui lòng đăng nhập để đăng ký khóa học'
        }
      });
      return;
    }

    loadCourseData();
  }, [courseId, isAuthenticated, navigate]);

  const loadCourseData = async () => {
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
          price: courseData.enrollment_fee || courseData.price || 0,
          originalPrice: courseData.originalPrice || (courseData.enrollment_fee || courseData.price || 0) * 1.3,
          duration: courseData.duration || `${courseData.total_weeks || 0} tuần`,
          students: courseData.max_students_per_template || courseData.students || 0,
          rating: courseData.rating || 4.5,
          level: courseData.level || 'Cơ bản',
          features: courseData.features || [
            `${courseData.total_weeks || 8} tuần học`,
            'Tài liệu đầy đủ',
            'Chứng chỉ hoàn thành',
            'Hỗ trợ 24/7',
            'Truy cập học liệu suốt đời'
          ]
        };
        
        setCourse(transformedCourse);
      } else {
        setCourse(null);
      }
    } catch (error) {
      console.error('Error loading course data:', error);
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

  const handleEnrollment = async () => {
    if (!enrollmentData.agreeTerms) {
      showNotification('Vui lòng đồng ý với điều khoản sử dụng', 'warning');
      return;
    }

    if (!enrollmentData.agreeRefund) {
      showNotification('Vui lòng đồng ý với chính sách hoàn tiền', 'warning');
      return;
    }

    try {
      setEnrolling(true);

      // Real enrollment API call
      const enrollmentRequest = {
        courseId: course.id,
        paymentMethod: enrollmentData.paymentMethod,
        amount: course.price,
        userAgreements: {
          terms: enrollmentData.agreeTerms,
          refundPolicy: enrollmentData.agreeRefund
        }
      };

      console.log('🎯 Enrollment request:', enrollmentRequest);
      
      const response = await enrollmentService.enrollInCourse(enrollmentRequest);
      
      if (response.success || response.data) {
        showNotification(`Đăng ký khóa học "${course.title}" thành công! 🎉`, 'success');
        
        // Redirect to enrolled courses page
        setTimeout(() => {
          navigate('/student/courses');
        }, 1000);
      } else {
        throw new Error(response.message || 'Enrollment failed');
      }

    } catch (error) {
      console.error('Enrollment error:', error);
      showNotification('Lỗi khi đăng ký khóa học: ' + error.message, 'error');
    } finally {
      setEnrolling(false);
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
          <p className="text-gray-600 mb-4">Khóa học bạn muốn đăng ký không tồn tại</p>
          <button
            onClick={() => navigate('/student/courses')}
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-4">
              <button
                onClick={() => navigate(-1)}
                className="text-white hover:text-blue-200 mr-4"
              >
                ← Quay lại
              </button>
              <h1 className="text-3xl font-bold">🎯 Đăng ký khóa học</h1>
            </div>
            <p className="text-blue-100">
              Hoàn tất thông tin để tham gia khóa học
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Course Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  📋 Thông tin khóa học
                </h2>

                <div className="flex items-start space-x-6">
                  <div className="w-32 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-3xl">📚</span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {course.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Gi강사:</span>
                        <div className="font-medium">{course.instructor}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Thời lượng:</span>
                        <div className="font-medium">{course.duration}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Học viên:</span>
                        <div className="font-medium">{course.students.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Đánh giá:</span>
                        <div className="font-medium">⭐ {course.rating}/5</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Features */}
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-semibold mb-3">✨ Khóa học bao gồm:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {course.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <span className="text-green-500 mr-2">✅</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  💳 Phương thức thanh toán
                </h3>

                <div className="space-y-3">
                  {[
                    { id: 'credit_card', label: 'Thẻ tín dụng/Ghi nợ', icon: '💳', desc: 'Visa, Mastercard, JCB' },
                    { id: 'bank_transfer', label: 'Chuyển khoản ngân hàng', icon: '🏦', desc: 'Chuyển khoản trực tiếp' },
                    { id: 'e_wallet', label: 'Ví điện tử', icon: '📱', desc: 'MoMo, ZaloPay, ShopeePay' },
                    { id: 'installment', label: 'Trả góp 0%', icon: '💰', desc: 'Chia 3-6 tháng, không lãi suất' }
                  ].map(method => (
                    <label 
                      key={method.id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        enrollmentData.paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={enrollmentData.paymentMethod === method.id}
                        onChange={(e) => setEnrollmentData(prev => ({
                          ...prev,
                          paymentMethod: e.target.value
                        }))}
                        className="sr-only"
                      />
                      <span className="text-2xl mr-4">{method.icon}</span>
                      <div>
                        <div className="font-medium">{method.label}</div>
                        <div className="text-sm text-gray-600">{method.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📜 Điều khoản và Chính sách
                </h3>

                <div className="space-y-4">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={enrollmentData.agreeTerms}
                      onChange={(e) => setEnrollmentData(prev => ({
                        ...prev,
                        agreeTerms: e.target.checked
                      }))}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium mb-1">Điều khoản sử dụng</div>
                      <p className="text-sm text-gray-600">
                        Tôi đồng ý với <button className="text-blue-600 hover:underline">điều khoản sử dụng</button> và 
                        <button className="text-blue-600 hover:underline ml-1">chính sách bảo mật</button> của nền tảng.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={enrollmentData.agreeRefund}
                      onChange={(e) => setEnrollmentData(prev => ({
                        ...prev,
                        agreeRefund: e.target.checked
                      }))}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium mb-1">Chính sách hoàn tiền</div>
                      <p className="text-sm text-gray-600">
                        Tôi hiểu <button className="text-blue-600 hover:underline">chính sách hoàn tiền</button> trong vòng 7 ngày 
                        kể từ khi đăng ký nếu chưa hoàn thành quá 30% khóa học.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  🧾 Tóm tắt đơn hàng
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá khóa học:</span>
                    <span className="font-medium">{formatPrice(course.originalPrice)}</span>
                  </div>
                  
                  {course.originalPrice > course.price && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{formatPrice(course.originalPrice - course.price)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT (0%):</span>
                    <span className="font-medium">{formatPrice(0)}</span>
                  </div>

                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Tổng cộng:</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatPrice(course.price)}
                      </div>
                      {course.originalPrice > course.price && (
                        <div className="text-sm text-green-600">
                          Tiết kiệm {Math.round((1 - course.price / course.originalPrice) * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enrollment Button */}
                <button
                  onClick={handleEnrollment}
                  disabled={enrolling || !enrollmentData.agreeTerms || !enrollmentData.agreeRefund}
                  className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {enrolling ? '⏳ Đang xử lý...' : '🚀 Đăng ký ngay'}
                </button>

                <div className="mt-4 text-center text-sm text-gray-500">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-green-500 mr-2">🔒</span>
                    Thanh toán được bảo mật 100%
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-blue-500 mr-2">📞</span>
                    Hỗ trợ 24/7: hotline@example.com
                  </div>
                </div>

                {/* Money Back Guarantee */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg text-center">
                  <div className="text-green-600 mb-2">
                    <span className="text-xl">✅</span>
                  </div>
                  <div className="text-sm font-medium text-green-800">
                    Đảm bảo hoàn tiền 100%
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Trong vòng 7 ngày nếu không hài lòng
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

export default EnrollCourse;