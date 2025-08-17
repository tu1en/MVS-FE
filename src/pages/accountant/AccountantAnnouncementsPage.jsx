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
import announcementNotificationService from '../../services/announcementNotificationService';
import AnnouncementService from '../../services/announcementService';

const AccountantAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

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

  const getTargetAudienceIcon = (targetAudience) => {
    switch (targetAudience) {
      case 'STUDENTS':
        return <User className="h-4 w-4" />;
      case 'ALL':
        return <Megaphone className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return '';
    }
    let date;
    if (typeof dateString === 'string') {
      const isoString = dateString.replace(' ', 'T');
      date = new Date(isoString);
    } else if (Array.isArray(dateString)) {
      if (dateString.length >= 3) {
        date = new Date(dateString[0], dateString[1] - 1, dateString[2], dateString[3] || 0, dateString[4] || 0, dateString[5] || 0);
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }
    if (isNaN(date.getTime())) {
      return 'Ngày không hợp lệ';
    }
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatContent = (content) => {
    if (!content) return '';
    return content.replace(/\n/g, '<br>');
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || (filterType === 'pinned' && announcement.isPinned);
    return matchesSearch && matchesFilter;
  });

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
          <Bell className="h-8 w-8 mx-auto mb-2" />
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Bell className="h-8 w-8 mr-3 text-blue-600" />
          Thông Báo
        </h1>
        <p className="text-gray-600">Xem các thông báo mới nhất</p>
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
            <option value="pinned">Được ghim</option>
          </select>
        </div>
      </div>

      {/* Announcements Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Hiển thị {filteredAnnouncements.length} / {announcements.length} thông báo
        </p>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-xl text-gray-500 mb-2">Không có thông báo nào</p>
          <p className="text-gray-400">
            {searchTerm || filterType !== 'all' 
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' 
              : 'Bạn chưa có thông báo nào'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <Card 
              key={announcement.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 ${
                announcement.isPinned 
                  ? 'border-l-yellow-500 bg-yellow-50' 
                  : 'border-l-blue-500'
              }`}
              onClick={async () => {
                try {
                  await announcementNotificationService.markAnnouncementAsRead(announcement.id);
                } catch (error) {
                  console.error('Error marking announcement as read:', error);
                }
                setSelectedAnnouncement(announcement);
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {announcement.isPinned && (
                        <Pin className="h-4 w-4 text-yellow-500" />
                      )}
                      {getTargetAudienceIcon(announcement.targetAudience)}
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {announcement.title}
                    </CardTitle>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <p className="text-gray-700 line-clamp-2">
                    {announcement.content}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDate(announcement.createdAt)}
                    </div>
                    {announcement.scheduledDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Đã lên lịch
                      </div>
                    )}
                  </div>
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

export default AccountantAnnouncementsPage;