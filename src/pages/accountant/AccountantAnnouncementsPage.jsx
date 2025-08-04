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

const AccountantAnnouncementsPage = () => {
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
      const data = await AnnouncementService.getAnnouncementsForAccountant();
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
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (announcementId) => {
    try {
      await announcementNotificationService.markAnnouncementAsRead(announcementId);
      // Refresh announcements to update read status
      fetchAnnouncements();
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await announcementNotificationService.markAllAnnouncementsAsRead();
      // Refresh announcements to update read status
      fetchAnnouncements();
    } catch (error) {
      console.error('Error marking all announcements as read:', error);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <Star className="h-4 w-4 text-orange-500" />;
      case 'normal':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'low':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      let date;
      if (typeof dateString === 'string') {
        // Handle both ISO format and space-separated format
        const isoString = dateString.includes('T') ? dateString : dateString.replace(' ', 'T');
        date = new Date(isoString);
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return 'N/A';
      }
      
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Vừa xong';
      if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
      if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  // Filter announcements based on search term and filter type
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' ||
                         (filterType === 'urgent' && announcement.priority === 'URGENT') ||
                         (filterType === 'high' && announcement.priority === 'HIGH') ||
                         (filterType === 'medium' && announcement.priority === 'NORMAL') ||
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
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="font-semibold">Có lỗi xảy ra</p>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchAnnouncements}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Megaphone className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Thông báo Kế toán</h1>
              <p className="text-gray-600">Xem và quản lý các thông báo dành cho kế toán viên</p>
            </div>
          </div>
          {announcements.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span>Đánh dấu tất cả đã đọc</span>
            </button>
          )}
        </div>
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
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="urgent">Khẩn cấp</option>
            <option value="high">Cao</option>
            <option value="medium">Bình thường</option>
            <option value="low">Thấp</option>
          </select>
        </div>
      </div>

      {/* Announcements List */}
      {paginatedAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có thông báo</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' 
                ? 'Không tìm thấy thông báo phù hợp với bộ lọc của bạn.'
                : 'Hiện tại chưa có thông báo nào dành cho kế toán viên.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {paginatedAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getPriorityIcon(announcement.priority)}
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {announcement.title}
                      </h3>
                      <Badge className={`${getPriorityColor(announcement.priority)} text-xs`}>
                        {announcement.priority === 'URGENT' ? 'Khẩn cấp' :
                         announcement.priority === 'HIGH' ? 'Cao' :
                         announcement.priority === 'NORMAL' ? 'Bình thường' : 'Thấp'}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {announcement.content}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{announcement.creatorName || 'Hệ thống'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(announcement.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedAnnouncement(announcement)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <span className="text-sm">Xem chi tiết</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredAnnouncements.length > pageSize && (
        <div className="mt-6 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Trước
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-600">
              Trang {currentPage} / {Math.ceil(filteredAnnouncements.length / pageSize)}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredAnnouncements.length / pageSize), prev + 1))}
              disabled={currentPage >= Math.ceil(filteredAnnouncements.length / pageSize)}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getPriorityIcon(selectedAnnouncement.priority)}
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedAnnouncement.title}
                  </h2>
                  <Badge className={`${getPriorityColor(selectedAnnouncement.priority)} text-xs`}>
                    {selectedAnnouncement.priority === 'URGENT' ? 'Khẩn cấp' :
                     selectedAnnouncement.priority === 'HIGH' ? 'Cao' :
                     selectedAnnouncement.priority === 'NORMAL' ? 'Bình thường' : 'Thấp'}
                  </Badge>
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{selectedAnnouncement.creatorName || 'Hệ thống'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(selectedAnnouncement.createdAt)}</span>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedAnnouncement.content}
                </p>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    handleMarkAsRead(selectedAnnouncement.id);
                    setSelectedAnnouncement(null);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Đánh dấu đã đọc
                </button>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
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

export default AccountantAnnouncementsPage;
