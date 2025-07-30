import {
    AlertCircle,
    Archive,
    BookOpen,
    Calendar,
    Download,
    ExternalLink,
    File,
    FileText,
    Filter,
    Image,
    Music,
    RefreshCw,
    Search,
    User,
    Video
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import classroomService from '../../services/classroomService';
import MaterialService from '../../services/materialService';

const StudentMaterials = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingIds, setDownloadingIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchMaterials();
    }
  }, [selectedCourseId]);

  const fetchEnrolledCourses = async () => {
    try {
      const courses = await classroomService.getEnrolledCourses();
      setEnrolledCourses(courses);
      if (courses.length > 0) {
        setSelectedCourseId(courses[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching enrolled courses:', err);
      setError('Không thể tải danh sách khóa học');
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch materials for the selected course
      const courseId = parseInt(selectedCourseId);
      const materialsData = await MaterialService.getMaterialsByCourse(courseId);
      
      setMaterials(materialsData);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Không thể tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      setDownloadingIds(prev => new Set(prev).add(material.id));

      console.log('Bắt đầu tải xuống tài liệu:', {
        id: material.id,
        fileName: material.fileName,
        originalFileName: material.originalFileName,
        fileSize: material.fileSize
      });

      // Download using the material service
      const blob = await MaterialService.downloadMaterial(material.id);

      // Validate blob
      if (!blob || blob.size === 0) {
        throw new Error('File tải xuống rỗng hoặc không có nội dung');
      }

      console.log('Tải xuống thành công, kích thước blob:', blob.size);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Use the best available filename
      const fileName = material.originalFileName || material.fileName || `tai_lieu_${material.id}`;
      link.download = fileName;

      // Add to DOM, click, and cleanup
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Show success message
      console.log(`Đã tải xuống thành công: ${fileName}`);

      // Optional: Show a brief success notification
      const successMsg = document.createElement('div');
      successMsg.textContent = `✅ Đã tải xuống: ${fileName}`;
      successMsg.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        background: #10b981; color: white; padding: 12px 20px;
        border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 14px; max-width: 300px;
      `;
      document.body.appendChild(successMsg);
      setTimeout(() => {
        if (successMsg.parentNode) {
          successMsg.parentNode.removeChild(successMsg);
        }
      }, 3000);

    } catch (err) {
      console.error('Error downloading material:', err);

      // Show detailed error message
      const errorMsg = err.message || 'Không thể tải tài liệu. Vui lòng thử lại.';

      // Create error notification
      const errorNotification = document.createElement('div');
      errorNotification.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px;">❌ Lỗi tải xuống tài liệu</div>
        <div style="font-size: 13px; line-height: 1.4;">${errorMsg}</div>
        <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">
          Tài liệu: ${material.fileName || material.originalFileName || 'Không xác định'}
        </div>
      `;
      errorNotification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        background: #ef4444; color: white; padding: 16px 20px;
        border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 14px; max-width: 350px; cursor: pointer;
      `;

      // Click to dismiss
      errorNotification.onclick = () => {
        if (errorNotification.parentNode) {
          errorNotification.parentNode.removeChild(errorNotification);
        }
      };

      document.body.appendChild(errorNotification);

      // Auto dismiss after 8 seconds
      setTimeout(() => {
        if (errorNotification.parentNode) {
          errorNotification.parentNode.removeChild(errorNotification);
        }
      }, 8000);

    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(material.id);
        return newSet;
      });
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <File className="h-5 w-5" />;
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-5 w-5 text-purple-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="h-5 w-5 text-pink-500" />;
      case 'mp3':
      case 'wav':
        return <Music className="h-5 w-5 text-indigo-500" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="h-5 w-5 text-yellow-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileType = (fileName) => {
    if (!fileName) return 'unknown';
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    const types = {
      'pdf': 'PDF',
      'doc': 'DOC',
      'docx': 'DOCX',
      'xls': 'XLS',
      'xlsx': 'XLSX',
      'ppt': 'PPT',
      'pptx': 'PPTX',
      'jpg': 'JPG',
      'jpeg': 'JPEG',
      'png': 'PNG',
      'gif': 'GIF',
      'mp4': 'MP4',
      'avi': 'AVI',
      'mov': 'MOV',
      'mp3': 'MP3',
      'wav': 'WAV',
      'zip': 'ZIP',
      'rar': 'RAR',
      '7z': '7Z',
    };

    return types[extension] || 'FILE';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.fileName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'pdf' && material.fileName?.toLowerCase().endsWith('.pdf')) ||
                         (filterType === 'doc' && (material.fileName?.toLowerCase().endsWith('.doc') || material.fileName?.toLowerCase().endsWith('.docx'))) ||
                         (filterType === 'image' && /\.(jpg|jpeg|png|gif)$/i.test(material.fileName)) ||
                         (filterType === 'video' && /\.(mp4|avi|mov)$/i.test(material.fileName));
    
    return matchesSearch && matchesFilter;
  });

  const getSelectedCourse = () => {
    return enrolledCourses.find(course => course.id.toString() === selectedCourseId);
  };

  if (loading && !materials.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải tài liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-2">
          <AlertCircle className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-medium">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!enrolledCourses.length) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-500 mb-2">
          <BookOpen className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg">Bạn chưa đăng ký khóa học nào</p>
        </div>
      </div>
    );
  }

  const selectedCourse = getSelectedCourse();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <BookOpen className="h-8 w-8 mr-3 text-blue-600" />
          Tài Liệu Học Tập
        </h1>
        <p className="text-gray-600">
          Tải xuống tài liệu từ các khóa học của bạn
        </p>
      </div>

      {/* Course Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn khóa học
        </label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {enrolledCourses.map((course) => (
            <option key={course.id} value={course.id.toString()}>
              {course.classroomName} - {course.teacherName}
            </option>
          ))}
        </select>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="pdf">PDF</option>
            <option value="doc">Document</option>
            <option value="image">Hình ảnh</option>
            <option value="video">Video</option>
          </select>
        </div>
        <button
          onClick={fetchMaterials}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Course Info */}
      {selectedCourse && (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                {selectedCourse.classroomName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {selectedCourse.teacherName}
                </div>
                <div className="flex items-center gap-1">
                  <File className="h-4 w-4" />
                  {filteredMaterials.length} tài liệu
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Materials List */}
      {filteredMaterials.length === 0 ? (
        <div className="text-center py-12">
          <File className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-xl text-gray-500 mb-2">Không có tài liệu nào</p>
          <p className="text-gray-400">
            {searchTerm || filterType !== 'all' 
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' 
              : 'Khóa học này chưa có tài liệu nào'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(material.fileName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-medium truncate">
                      {material.title || material.fileName}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {getFileType(material.fileName)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatFileSize(material.fileSize)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {material.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {material.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {formatDate(material.createdAt)}
                  </div>
                  {material.downloadCount > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Download className="h-4 w-4" />
                      {material.downloadCount}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(material)}
                    disabled={downloadingIds.has(material.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {downloadingIds.has(material.id) ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Đang tải...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Tải xuống
                      </>
                    )}
                  </button>
                  
                  {material.downloadUrl && (
                    <button
                      onClick={() => window.open(material.downloadUrl, '_blank')}
                      className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
                      title="Xem trực tuyến"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentMaterials;
