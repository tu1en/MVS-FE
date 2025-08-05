import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

  useEffect(() => {
    fetchCourseDetail();
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await courseService.getPublicCourseDetail(id);
      setCourse(response.data);
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

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchCourseDetail}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Không tìm thấy khóa học
          </h2>
          <p className="text-gray-600 mb-4">
            Khóa học bạn đang tìm kiếm không tồn tại hoặc không được công khai.
          </p>
          <button 
            onClick={() => navigate('/public/courses')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Xem tất cả khóa học
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-8 rounded-lg">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-4">Đã gửi yêu cầu đăng ký!</h2>
            <p className="text-lg mb-6">
              Cảm ơn bạn đã quan tâm đến <strong>{course.name}</strong>. 
              Yêu cầu đăng ký của bạn đã được gửi thành công.
            </p>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Tiếp theo là gì?</h3>
              <ul className="text-left space-y-2">
                <li>• Hệ thống sẽ xem xét yêu cầu của bạn</li>
                <li>• Bạn sẽ nhận được email xác nhận sớm</li>
                <li>• Nếu được duyệt, bạn sẽ nhận hướng dẫn thanh toán và truy cập</li>
              </ul>
            </div>
            <div className="space-x-4">
              <button 
                onClick={() => navigate('/public/courses')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
              >
                Xem thêm khóa học
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded"
              >
                Gửi yêu cầu khác
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm breadcrumbs mb-6">
          <ul className="flex space-x-2 text-gray-600">
            <li>
              <button 
                onClick={() => navigate('/public/courses')}
                className="hover:text-blue-600"
              >
                Tất cả khóa học
              </button>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{course.name}</li>
          </ul>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{course.name}</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Mô tả khóa học</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {course.description || 'Chưa có mô tả cho khóa học này.'}
                  </p>
                </div>
                
                {course.objectives && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Mục tiêu học tập</h2>
                    <p className="text-gray-700 leading-relaxed">{course.objectives}</p>
                  </div>
                )}

                {course.prerequisites && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Yêu cầu đầu vào</h2>
                    <p className="text-gray-700 leading-relaxed">{course.prerequisites}</p>
                  </div>
                )}
              </div>
              
              {/* Enrollment Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-blue-600">
                      {course.enrollmentFee ? 
                        `${course.enrollmentFee.toLocaleString('vi-VN')}đ` : 
                        'Miễn phí'
                      }
                    </span>
                  </div>
                  
                  {/* Course Info */}
                  <div className="mb-6 space-y-3">
                    {course.instructorName && (
                      <p className="flex justify-between">
                        <strong>Giảng viên:</strong> 
                        <span>{course.instructorName}</span>
                      </p>
                    )}
                    {course.duration && (
                      <p className="flex justify-between">
                        <strong>Thời lượng:</strong> 
                        <span>{course.duration} tuần</span>
                      </p>
                    )}
                    {course.maxStudentsPerTemplate && (
                      <p className="flex justify-between">
                        <strong>Tối đa:</strong> 
                        <span>{course.maxStudentsPerTemplate} học viên</span>
                      </p>
                    )}
                    {course.subject && (
                      <p className="flex justify-between">
                        <strong>Môn:</strong> 
                        <span>{course.subject}</span>
                      </p>
                    )}
                  </div>
                  
                  {/* Error Message */}
                  {error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="4"
                      placeholder="Gửi lời nhắn đến trung tâm hoặc giảng viên..."
                      maxLength="500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {message.length}/500 ký tự
                    </p>
                  </div>
                  
                  {/* Enroll Button */}
                  <button
                    onClick={handleEnrollment}
                    disabled={enrolling}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    {enrolling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang gửi...
                      </>
                    ) : (
                      'Đăng ký học qua Messenger'
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Nhấn nút để chuyển đến Messenger và hoàn tất đăng ký.
                  </p>
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
