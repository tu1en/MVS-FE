import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import courseService from '../../services/courseService';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Load courses from API
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading public courses...');
      const response = await courseService.getPublicCourses();
      console.log('📊 API Response:', response);
      const courseData = response.data || [];
      console.log('📚 Course Data:', courseData);
      console.log('📈 Courses count:', courseData.length);
      
      setCourses(courseData);
      setFilteredCourses(courseData);
    } catch (error) {
      console.error('❌ Error loading courses:', error);
      // Fallback to empty array instead of mock data
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Danh mục chuẩn cho cấp 3
  const categories = [
    { id: 'all', name: 'Tất cả khóa học', count: courses.length },
    { id: 'Toán', name: 'Toán', count: courses.filter(c => (c.subject||'').toLowerCase()==='toán' || (c.subject||'').toLowerCase()==='toan').length },
    { id: 'Vật lý', name: 'Vật lý', count: courses.filter(c => (c.subject||'').toLowerCase().includes('vật') || (c.subject||'').toLowerCase().includes('vat')).length },
    { id: 'Hóa học', name: 'Hóa học', count: courses.filter(c => (c.subject||'').toLowerCase().includes('hóa') || (c.subject||'').toLowerCase().includes('hoa')).length },
    { id: 'Ngữ văn', name: 'Ngữ văn', count: courses.filter(c => (c.subject||'').toLowerCase().includes('văn') || (c.subject||'').toLowerCase().includes('van')).length },
    { id: 'Tiếng Anh', name: 'Tiếng Anh', count: courses.filter(c => (c.subject||'').toLowerCase().includes('anh')).length },
    { id: 'Sinh học', name: 'Sinh học', count: courses.filter(c => (c.subject||'').toLowerCase().includes('sinh')).length }
  ].filter(cat => cat.count > 0 || cat.id === 'all');

  useEffect(() => {
    let filtered = courses;

    // Filter by category
    if (selectedCategory !== 'all') {
      const sel = selectedCategory.toLowerCase();
      filtered = filtered.filter(course => (course.subject||'').toLowerCase().includes(sel));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course => 
        (course.title || course.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.instructor || course.teacherName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.tags && course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    setFilteredCourses(filtered);
  }, [selectedCategory, searchTerm, courses]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  const handleCourseClick = (course) => {
    if (isAuthenticated) {
      // If logged in, go to course detail page
      navigate(`/student/course/${course.id}`);
    } else {
      // If not logged in, go to public course preview
      navigate(`/course-preview/${course.id}`);
    }
  };

  const handleEnrollClick = (e, course) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Redirect to login/register
      navigate('/register', { 
        state: { 
          redirectTo: `/course/${course.id}`,
          message: 'Đăng ký tài khoản để tham gia khóa học'
        }
      });
    } else {
      // Go to enrollment page
      navigate(`/enroll/${course.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải khóa học...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">
            🎓 Khóa Học Lập Trình
          </h1>
          <p className="text-xl text-center text-blue-100">
            Nâng cao kỹ năng với các khóa học chất lượng từ chuyên gia hàng đầu
          </p>
          
          {!isAuthenticated && (
            <div className="text-center mt-6">
              <p className="text-blue-100 mb-4">
                🎯 Đăng ký tài khoản để truy cập đầy đủ và theo dõi tiến độ học tập
              </p>
              <div className="space-x-4">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800"
                >
                  Đăng ký ngay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Tìm thấy {filteredCourses.length} khóa học
            {searchTerm && ` cho "${searchTerm}"`}
            {selectedCategory !== 'all' && ` trong danh mục "${categories.find(c => c.id === selectedCategory)?.name}"`}
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <div 
                key={course.id}
                onClick={() => handleCourseClick(course)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Course Image */}
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
                </div>

                {/* Course Info */}
                <div className="p-6">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {course.title || course.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">
                      👨‍🏫 {course.createdByName || 'Đang cập nhật'}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>⏱️ {course.totalWeeks || 0} tuần</span>
                      <span>👥 {course.maxStudentsPerTemplate || 0} học viên</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {course.subject && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {course.subject}
                        </span>
                      )}
                      {course.tags && course.tags.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">
                        {course.enrollmentFee === 0
                          ? 'Miễn phí'
                          : formatPrice(course.enrollmentFee || 0)}
                      </span>
                      {course.originalPrice && course.originalPrice > course.enrollmentFee && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {formatPrice(course.originalPrice)}
                        </span>
                      )}
                    </div>
                      {course.originalPrice && course.originalPrice > course.enrollmentFee && (
                        <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                          Giảm {Math.round((1 - course.enrollmentFee / course.originalPrice) * 100)}%
                        </div>
                      )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={(e) => handleEnrollClick(e, course)}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      isAuthenticated
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    }`}
                  >
                    {isAuthenticated ? '🎯 Đăng ký học' : '🚀 Đăng ký để học'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Không tìm thấy khóa học nào
            </h3>
            <p className="text-gray-600 mb-4">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Xem tất cả khóa học
            </button>
          </div>
        )}

        {/* Stats */}
        {filteredCourses.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              📊 Thống kê nền tảng
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
                <div className="text-sm text-gray-600">Khóa học</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {courses.reduce((sum, course) => sum + course.students, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Học viên</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {(courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Đánh giá TB</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">24/7</div>
                <div className="text-sm text-gray-600">Hỗ trợ</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCatalog;