import {
    AlertCircle,
    Bell,
    Calendar,
    ChevronRight,
    Clock,
    Filter,
    Megaphone,
    Pin,
    Search,
    Star,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import AnnouncementService from '../../services/announcementService';
import announcementNotificationService from '../../services/announcementNotificationService';

const TeacherAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await AnnouncementService.getAnnouncementsForTeacher();
      console.log('Raw announcement data:', data);
      if (data && data.length > 0) {
        console.log('First announcement createdAt:', data[0].createdAt);
        console.log('Type of createdAt:', typeof data[0].createdAt);
      }
      setAnnouncements(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Không thể tải thông báo. Vui lòng thử lại.');
      const allAnnouncements = await AnnouncementService.getAnnouncements();
      // Show all announcements for teachers to read
      setAnnouncements(allAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      message.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'Cao';
      case 'MEDIUM':
        return 'Trung bình';
      case 'LOW':
        return 'Thấp';
      default:
        return 'Bình thường';
    }
  };

  const getTargetAudienceIcon = (targetAudience) => {
    switch (targetAudience) {
      case 'STUDENTS':
        return <User className="h-4 w-4" />;
      case 'TEACHERS':
        return <User className="h-4 w-4" />;
      case 'ALL':
        return <Megaphone className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    console.log('formatDate called with:', dateString, 'type:', typeof dateString);
    
    if (!dateString) {
      console.log('No dateString provided, returning empty');
      return '';
    }
    
    // Handle various date formats from backend
    let date;
    if (typeof dateString === 'string') {
      console.log('Processing string date:', dateString);
      // Replace space with 'T' if needed for ISO format
      const isoString = dateString.replace(' ', 'T');
      console.log('ISO string:', isoString);
      date = new Date(isoString);
    } else if (Array.isArray(dateString)) {
      console.log('Date is array format:', dateString);
      // Handle array format [year, month, day, hour, minute, second, nano]
      if (dateString.length >= 3) {
        date = new Date(dateString[0], dateString[1] - 1, dateString[2], 
                       dateString[3] || 0, dateString[4] || 0, dateString[5] || 0);
      } else {
        date = new Date(dateString);
      }
    } else {
      console.log('Processing non-string date:', dateString);
      date = new Date(dateString);
    }
    
    console.log('Parsed date object:', date);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date after parsing:', dateString, 'resulted in:', date);
      return 'Ngày không hợp lệ';
    }
    
    const formatted = date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    console.log('Formatted date:', formatted);
    return formatted;
  };

  const formatContent = (content) => {
    if (!content) return '';
    return content.replace(/\n/g, '<br>');
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'pinned' && announcement.isPinned) ||
                         (filterType === 'high' && announcement.priority === 'HIGH') ||
                         (filterType === 'medium' && announcement.priority === 'MEDIUM') ||
                         (filterType === 'low' && announcement.priority === 'LOW');
    
    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAnnouncements = filteredAnnouncements.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải thông báo...</p>
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
          onClick={fetchAnnouncements}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông Báo</h1>
        <p className="text-gray-600">Xem các thông báo mới nhất từ nhà trường và giáo viên</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Tìm kiếm thông báo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="pinned">Ghim</option>
            <option value="high">Ưu tiên cao</option>
            <option value="medium">Ưu tiên trung bình</option>
            <option value="low">Ưu tiên thấp</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Hiển thị {Math.min((currentPage - 1) * pageSize + 1, filteredAnnouncements.length)} - {Math.min(currentPage * pageSize, filteredAnnouncements.length)} của {filteredAnnouncements.length} thông báo
      </div>

      {/* Announcements List */}
      {paginatedAnnouncements.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Không có thông báo nào</p>
          <p className="text-gray-400">Hãy quay lại sau để xem thông báo mới</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {announcement.isPinned && (
                      <Pin className="h-4 w-4 text-yellow-500" />
                    )}
                    {getTargetAudienceIcon(announcement.targetAudience)}
                    <Badge className={`${getPriorityColor(announcement.priority)} text-white`}>
                      {getPriorityLabel(announcement.priority)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {formatDate(announcement.createdAt)}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {announcement.title}
                </h3>
                
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {announcement.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {announcement.scheduledDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Lên lịch: {formatDate(announcement.scheduledDate)}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={async () => {
                      // Mark announcement as read when viewed
                      try {
                        await announcementNotificationService.markAnnouncementAsRead(announcement.id);
                      } catch (error) {
                        console.error('Error marking announcement as read:', error);
                      }
                      setSelectedAnnouncement(announcement);
                    }}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Xem chi tiết
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {announcement.isPinned && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      <Star className="h-3 w-3 mr-1" />
                      Ghim
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredAnnouncements.length > pageSize && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Trước
            </button>
            
            {Array.from({ length: Math.ceil(filteredAnnouncements.length / pageSize) }, (_, i) => i + 1)
              .filter(page => Math.abs(page - currentPage) <= 2)
              .map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 border rounded-lg ${
                    currentPage === page
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(Math.ceil(filteredAnnouncements.length / pageSize), currentPage + 1))}
              disabled={currentPage === Math.ceil(filteredAnnouncements.length / pageSize)}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedAnnouncement.isPinned && (
                      <Pin className="h-4 w-4 text-yellow-500" />
                    )}
                    {getTargetAudienceIcon(selectedAnnouncement.targetAudience)}
                    <Badge className={`${getPriorityColor(selectedAnnouncement.priority)} text-white`}>
                      {getPriorityLabel(selectedAnnouncement.priority)}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedAnnouncement.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-4">
                <div className="text-sm text-gray-500 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDate(selectedAnnouncement.createdAt)}
                  </div>
                  {selectedAnnouncement.scheduledDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Lên lịch: {formatDate(selectedAnnouncement.scheduledDate)}
                    </div>
                  )}
                </div>
                
                <div className="prose max-w-none">
                  <div 
                    className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatContent(selectedAnnouncement.content) }}
                  />
                </div>

                {selectedAnnouncement.expiryDate && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Thông báo này sẽ hết hạn vào:</span>
                      <span>{formatDate(selectedAnnouncement.expiryDate)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAnnouncementsPage;
