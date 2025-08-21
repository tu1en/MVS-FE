import axios from 'axios';
import { BookOpen, Heart, RefreshCw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API_CONFIG from '../../config/api-config';
import { normalizeCourseData } from '../../constants/displayConstants';

const PublicCourseDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [likedCourses, setLikedCourses] = useState(new Set());

  // Load liked courses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('likedCourses');
    if (saved) {
      setLikedCourses(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save liked courses to localStorage
  useEffect(() => {
    localStorage.setItem('likedCourses', JSON.stringify([...likedCourses]));
  }, [likedCourses]);

  useEffect(() => {
    fetchPublicCourses();
  }, []);

  const fetchPublicCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PUBLIC_CLASSES}`);
      const raw = response.data?.data || response.data || [];
      
      const mapped = (Array.isArray(raw) ? raw : [])
        .filter(c => c.isPublic === true)
        .map(c => {
          // Use normalized course data for consistency
          const normalized = normalizeCourseData(c);
          return {
            id: normalized.id,
            title: normalized.name,
            description: normalized.description,
            enrollmentFee: normalized.enrollmentFee,
            maxStudents: normalized.maxStudents,
            currentStudents: normalized.currentStudents,
            subject: normalized.subject,
            instructor: normalized.instructor, // Now consistently uses COURSE_FALLBACKS.instructor
            duration: normalized.duration, // Now consistently uses formatDuration()
            level: normalized.level,
            rating: normalized.rating,
            category: getCategoryFromSubject(normalized.subject),
            color: getColorFromCategory(getCategoryFromSubject(normalized.subject)),
            icon: getIconFromSubject(normalized.subject)
          };
        });
      
      setCourses(mapped);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getCategoryFromSubject = (subject) => {
    const subjectLower = subject.toLowerCase();
    if (subjectLower.includes('toán') || subjectLower.includes('math')) return 'math';
    if (subjectLower.includes('sinh') || subjectLower.includes('hóa') || subjectLower.includes('lý')) return 'science';
    if (subjectLower.includes('anh') || subjectLower.includes('english')) return 'language';
    if (subjectLower.includes('văn') || subjectLower.includes('literature')) return 'literature';
    return 'other';
  };

  const getColorFromCategory = (category) => {
    const colorMap = {
      math: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      science: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      language: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      literature: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      other: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    return colorMap[category] || colorMap.other;
  };

  const getIconFromSubject = (subject) => {
    const category = getCategoryFromSubject(subject);
    const iconMap = {
      math: '📐',
      science: '🔬', 
      language: '🌟',
      literature: '📚',
      other: '🎓'
    };
    return iconMap[category] || iconMap.other;
  };

  const categories = [
    { key: 'all', label: 'Tất cả khóa học', icon: '🌐' },
    { key: 'science', label: 'Khoa học', icon: '🔬' },
    { key: 'math', label: 'Toán học', icon: '📐' },
    { key: 'language', label: 'Ngoại ngữ', icon: '🗣️' },
    { key: 'literature', label: 'Văn học', icon: '📖' },
    // { key: 'other', label: 'Khác', icon: '🎯' }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleLike = (courseId) => {
    setLikedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };



  // Loading Component
  if (loading) {
    return (
      <div 
        className="flex justify-center items-center min-h-screen"
        style={{
          backgroundImage: `url('/blackboard2.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-500 border-t-transparent mx-auto mb-8"></div>
          <h2 className="text-2xl font-bold text-white mb-4">Đang tải khóa học...</h2>
          <p className="text-white">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  // Error Component
  if (error) {
    return (
      <div 
        className="container mx-auto px-4 py-8 min-h-screen"
        style={{
          backgroundImage: `url('/blackboard2.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-4">
          <div className="flex items-center">
            <div className="text-4xl mr-4">😞</div>
            <div>
              <h3 className="font-semibold mb-2">Oops! Có lỗi xảy ra</h3>
              <p className="mb-4">{error}</p>
              <button 
                onClick={fetchPublicCourses}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url('/blackboard2.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Khám phá các khóa học tuyệt vời
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Thay đổi tương lai của bạn với các khóa học tiên tiến được thiết kế bởi các 
              chuyên gia hàng đầu. Bắt đầu hành trình học tập ngay hôm nay và mở khóa tiềm năng vô hạn.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-100 rounded-2xl p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                
                {/* Search */}
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm khóa học, giảng viên hoặc chủ đề..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>

                {/* Category Filter - luôn 1 hàng ngang, có scroll ngang khi tràn */}
                <div className="flex gap-2 flex-nowrap overflow-x-auto w-full no-scrollbar px-1 py-1">
                  {categories.map(category => (
                    <button
                      key={category.key}
                      onClick={() => setFilterCategory(category.key)}
                      className={`shrink-0 min-w-max whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        filterCategory === category.key
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                      }`}
                    >
                      <span>{category.icon}</span>
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                {/* Hiển thị <span className="font-semibold text-gray-900">{filteredCourses.length}</span> khóa học tuyệt vời */}
                {searchTerm && <span> cho "<span className="font-semibold text-blue-600">{searchTerm}</span>"</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Không tìm thấy khóa học</h3>
            <p className="text-gray-500 text-lg">Hãy thử điều chỉnh từ khóa tìm kiếm hoặc khám phá các danh mục khác</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map(course => {
              return (
                <div key={course.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  
                  {/* Course Header with Gradient */}
                  <div 
                    className="relative h-48 flex items-center justify-center"
                    style={{ background: course.color }}
                  >
                    {/* Like Button */}
                    <button
                      onClick={() => toggleLike(course.id)}
                      className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                        likedCourses.has(course.id) 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${likedCourses.has(course.id) ? 'fill-current' : ''}`} />
                    </button>



                    {/* Course Icon */}
                    <div className="text-6xl text-white/90 group-hover:scale-110 transition-transform duration-300">
                      {course.icon}
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-white text-gray-900 px-3 py-1 rounded-full font-bold shadow-lg">
                        <span className="text-emerald-600">
                          {course.enrollmentFee ? `${course.enrollmentFee.toLocaleString('vi-VN')}đ` : 'MIỄN PHÍ'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    {/* Title */}
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Course Meta */}
                    <div className="space-y-2 mb-4 text-sm text-gray-500">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Giảng viên:</span>
                        <span className="text-gray-700">{course.instructor}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Thời lượng:</span>
                        <span className="text-gray-700">{course.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Học viên:</span>
                        <span className="text-gray-700">Tối đa 30 học sinh</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Môn học:</span>
                        <span className="text-gray-700">{course.subject}</span>
                      </div>
                    </div>

                    {/* Student Count Info */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Số học sinh:</span>
                        <span className="text-sm text-gray-600">
                          Tối đa 30 học sinh
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link 
                      to={`${API_CONFIG.ENDPOINTS.PUBLIC_CLASS_DETAIL ? '/public/classes/' + course.id : '/public/courses/' + course.id}`}
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 text-center"
                    >
                      Xem chi tiết và đăng ký
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-16 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              Cần hỗ trợ?
            </h3>
            <p className="text-blue-700 text-lg leading-relaxed">
              Nếu bạn có thắc mắc về các khóa học hoặc cần hỗ trợ đăng ký, 
              vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for line-clamp */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari */
        }
      `}</style>
    </div>
  );
};

export default PublicCourseDashboard;