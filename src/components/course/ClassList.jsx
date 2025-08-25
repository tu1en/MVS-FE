import { useEffect, useState } from 'react';
import { normalizeCourseData } from '../../constants/displayConstants';
import classManagementService from '../../services/classManagementService';
import { showNotification } from '../../utils/courseManagementUtils';
import { formatVietnameseText } from '../../utils/viTextUtils';

const ClassList = ({ onRefreshTrigger, onClassDetail, onClassEdit, onReschedule, onQuickEdit }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // ✅ NEW: Search and sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('className');
  const [sortOrder, setSortOrder] = useState('asc');

  // Load classes on mount and when refresh is triggered
  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (onRefreshTrigger) {
      loadClasses();
    }
  }, [onRefreshTrigger]);

  const loadClasses = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading classes...');
      const response = await classManagementService.getAllClasses();
      const classesData = response.data?.data || response.data || [];

      console.log('✅ Classes loaded:', classesData);

      // Debug: Log first class structure if exists
      if (classesData.length > 0) {
        console.log('🔍 First class structure:', Object.keys(classesData[0]));
        console.log('🔍 First class full data:', classesData[0]);

        // ✅ FIX: Normalize data for consistency with PublicCourseDetail
        const normalizedFirst = normalizeCourseData(classesData[0]);
        console.log('🔧 Normalized first class:', normalizedFirst);
        console.log('🔧 Teacher from normalized:', normalizedFirst.teacherName);
        console.log('🔧 Duration from normalized:', normalizedFirst.duration);
        console.log('🔧 ClassLessons length:', classesData[0].classLessons?.length || 0);
      }

      // ✅ FIX: Apply normalization to all classes for consistent data structure
      const normalizedClasses = Array.isArray(classesData)
        ? classesData.map(classItem => ({
            ...classItem,
            // Add normalized fields for consistency
            lessonCount: classItem.classLessons?.length || 0,
            normalized: normalizeCourseData(classItem)
          }))
        : [];

      console.log('🔧 Normalized classes with lesson counts:', normalizedClasses.map(c => ({
        id: c.id,
        className: c.className,
        lessonCount: c.lessonCount
      })));

      setClasses(normalizedClasses);
    } catch (error) {
      console.error('❌ Error loading classes:', error);
      setError(error.message || 'Lỗi khi tải danh sách lớp học');
      showNotification('Lỗi khi tải danh sách lớp học', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Format status for display (chuẩn hóa 100% tiếng Việt)
  const getStatusDisplay = (status) => {
    const raw = (status || '').toString();
    const upper = raw.toUpperCase();

    // Map cho các trạng thái viết HOA từ BE
    const upperMap = {
      'ACTIVE': { text: 'Đang hoạt động', color: 'bg-green-100 text-green-800', icon: '🟢' },
      'PLANNING': { text: 'Đang lên kế hoạch', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
      'COMPLETED': { text: 'Đã hoàn thành', color: 'bg-blue-100 text-blue-800', icon: '🔵' },
      'CANCELLED': { text: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: '🔴' },
      'INACTIVE': { text: 'Không hoạt động', color: 'bg-gray-100 text-gray-800', icon: '⚪' }
    };

    if (upperMap[upper]) return upperMap[upper];

    // Map cho các trạng thái viết thường từ FE
    const lowerMap = {
      'active': { text: 'Đang hoạt động', color: 'bg-green-100 text-green-800', icon: '🟢' },
      'planning': { text: 'Đang lên kế hoạch', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
      'completed': { text: 'Đã hoàn thành', color: 'bg-blue-100 text-blue-800', icon: '🔵' },
      'cancelled': { text: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: '🔴' },
      'inactive': { text: 'Không hoạt động', color: 'bg-gray-100 text-gray-800', icon: '⚪' }
    };

    if (lowerMap[raw]) return lowerMap[raw];

    return { text: 'Không xác định', color: 'bg-gray-100 text-gray-800', icon: '❓' };
  };

  // Chuẩn hóa status về các key cố định để đếm/lọc
  const normalizeStatusKey = (status) => {
    const s = (status || '').toString();
    const u = s.toUpperCase();
    if (['ACTIVE'].includes(u)) return 'ACTIVE';
    if (['PLANNING', 'PLANNED'].includes(u)) return 'PLANNING';
    if (['COMPLETED', 'DONE', 'FINISHED', 'ENDED'].includes(u)) return 'COMPLETED';
    if (['CANCELLED', 'CANCELED'].includes(u)) return 'CANCELLED';
    if (['INACTIVE', 'DISABLED'].includes(u)) return 'INACTIVE';
    return 'UNKNOWN';
  };

  // Loại bỏ 'INACTIVE' vì lớp học không có trạng thái này ở BE
  const STATUS_KEYS = ['ACTIVE', 'PLANNING', 'COMPLETED', 'CANCELLED'];

  // Tính bộ đếm theo trạng thái
  const statusCounts = classes.reduce(
    (acc, c) => {
      const key = normalizeStatusKey(c.status);
      if (STATUS_KEYS.includes(key)) {
        acc[key] = (acc[key] || 0) + 1;
      } else {
        acc.UNKNOWN = (acc.UNKNOWN || 0) + 1;
      }
      acc.ALL += 1;
      return acc;
    },
    { ALL: 0 }
  );

  const filteredClasses = classes.filter((c) => {
    if (activeFilter === 'all') return true;
    return normalizeStatusKey(c.status) === activeFilter;
  });

  // ✅ NEW: Enhanced filtering with search and additional filters
  const enhancedFilteredClasses = filteredClasses.filter((c) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const className = (c.className || c.class_name || '').toLowerCase();
      const teacherName = (c.normalized?.teacherName || c.teacherName || c.teacher_name || '').toLowerCase();
      const roomName = (c.roomName || c.room_name || '').toLowerCase();
      const templateName = (c.courseTemplateName || c.template_name || '').toLowerCase();
      const subject = (c.subject || '').toLowerCase();
      
      if (!className.includes(searchLower) && 
          !teacherName.includes(searchLower) && 
          !roomName.includes(searchLower) && 
          !templateName.includes(searchLower) && 
          !subject.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });

  // ✅ NEW: Sorting logic
  const sortedClasses = [...enhancedFilteredClasses].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'className':
        aValue = (a.className || a.class_name || '').toLowerCase();
        bValue = (b.className || b.class_name || '').toLowerCase();
        break;
      case 'teacherName':
        aValue = (a.normalized?.teacherName || a.teacherName || a.teacher_name || '').toLowerCase();
        bValue = (b.normalized?.teacherName || b.teacherName || b.teacher_name || '').toLowerCase();
        break;
      case 'roomName':
        aValue = (a.roomName || a.room_name || '').toLowerCase();
        bValue = (b.roomName || b.room_name || '').toLowerCase();
        break;
      case 'startDate':
        aValue = new Date(a.startDate || 0);
        bValue = new Date(b.startDate || 0);
        break;
      case 'currentStudents':
        aValue = a.currentStudents || 0;
        bValue = b.currentStudents || 0;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt || 0);
        bValue = new Date(b.createdAt || 0);
        break;
      default:
        aValue = (a.className || a.class_name || '').toLowerCase();
        bValue = (b.className || b.class_name || '').toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // ✅ NEW: Utility functions
  const clearAllFilters = () => {
    setSearchTerm('');
  };

  const hasActiveFilters = searchTerm;

  // Các lớp đang hoạt động nhưng chưa public (để đồng bộ Online)
  const activeNotPublic = classes.filter(
    (c) => normalizeStatusKey(c.status) === 'ACTIVE' && !Boolean(c.isPublic)
  );

  const bulkSyncOnline = async (limit = 6) => {
    try {
      const targets = activeNotPublic.slice(0, limit);
      if (targets.length === 0) {
        showNotification('Không có lớp Đang hoạt động cần đồng bộ', 'info');
        return;
      }
      showNotification(`Đang đồng bộ ${targets.length} lớp lên Công khai...`, 'info');

      const results = await Promise.allSettled(
        targets.map((c) =>
          import('../../services/classManagementService').then(({ default: svc }) =>
            svc.updateClassPublic(c.id, true)
          )
        )
      );

      const success = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.length - success;
      if (success > 0) showNotification(`Đồng bộ thành công ${success} lớp`, 'success');
      if (failed > 0) showNotification(`Đồng bộ thất bại ${failed} lớp`, 'warning');
      await loadClasses();
      setActiveFilter('ACTIVE');
    } catch (e) {
      console.error(e);
      showNotification('Lỗi khi đồng bộ lớp Online', 'error');
    }
  };

  // Format date for display
  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    
    try {
      let date;
      if (Array.isArray(dateInput)) {
        // Handle array format [year, month, day] - month is 0-indexed
        date = new Date(dateInput[0], dateInput[1] - 1, dateInput[2]);
      } else {
        date = new Date(dateInput);
      }
      
      return date.toLocaleDateString('vi-VN');
    } catch {
      return String(dateInput);
    }
  };

  if (loading) {
    return (
    <div className="bg-white border border-gray-200 rounded-lg vietnamese-text">
        <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 vietnamese-heading">Danh sách Lớp học</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500 vietnamese-body">Đang tải danh sách lớp học...</p>
        </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg vietnamese-text">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 vietnamese-heading">Danh sách Lớp học</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-red-500">
            <div className="text-4xl mb-2">❌</div>
            <p className="vietnamese-body">{error}</p>
            <button 
              onClick={loadClasses}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 button-vietnamese"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg vietnamese-text">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 vietnamese-heading">Danh sách Lớp học</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🏢</div>
            <p className="vietnamese-body">Chưa có lớp học nào. Chọn template để tạo lớp học!</p>
            <button 
              onClick={loadClasses}
              className="mt-2 text-blue-500 hover:text-blue-700 text-sm button-vietnamese"
            >
              🔄 Tải lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg vietnamese-text crisp-text">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 vietnamese-heading">
          Danh sách Lớp học ({sortedClasses.length}/{classes.length})
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => bulkSyncOnline(6)}
            className="text-white bg-green-600 hover:bg-green-700 text-sm flex items-center px-3 py-1.5 rounded button-vietnamese disabled:opacity-50"
            disabled={activeNotPublic.length === 0}
            title="Đồng bộ tối đa 6 lớp đang hoạt động lên Công khai (isPublic=true)"
          >
            <span className="mr-1">🌐</span>
            Đồng bộ Công khai ({Math.min(6, activeNotPublic.length)})
          </button>
          <button 
            onClick={loadClasses}
            className="text-blue-500 hover:text-blue-700 text-sm flex items-center button-vietnamese"
            disabled={loading}
          >
            <span className="mr-1">🔄</span>
            Tải lại
          </button>
        </div>
      </div>
      {/* Tabs lọc trạng thái */}
      <div className="px-6 pt-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Tất cả', count: statusCounts.ALL, color: 'bg-gray-100 text-gray-800', icon: '📚' },
            ...STATUS_KEYS.map((k) => {
              const info = getStatusDisplay(k);
              return { key: k, label: info.text, count: statusCounts[k] || 0, color: info.color, icon: info.icon };
            })
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1 ${
                activeFilter === tab.key
                  ? 'border-blue-500 ring-2 ring-blue-100'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              title={`Lọc: ${tab.label}`}
            >
              <span className="mr-0.5">{tab.icon}</span>
              <span className="truncate max-w-[140px]">{tab.label}</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded-full ${activeFilter === tab.key ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                {tab.count ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ✅ NEW: Search and Sort Section */}
      <div className="px-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm lớp học, giáo viên, phòng học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="className">Tên lớp học</option>
              <option value="teacherName">Tên giáo viên</option>
              <option value="roomName">Phòng học</option>
              <option value="startDate">Ngày bắt đầu</option>
              <option value="currentStudents">Số học viên</option>
              <option value="createdAt">Ngày tạo</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm ${
                sortOrder === 'asc' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
              }`}
              title={`Sắp xếp ${sortOrder === 'asc' ? 'tăng dần' : 'giảm dần'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-center mb-4">
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              🗑️ Xóa bộ lọc
            </button>
          </div>
        )}

        {/* Results Summary */}
        <div className="text-center text-sm text-gray-600 mb-4">
          Hiển thị {sortedClasses.length} trong tổng số {classes.length} lớp học
          {searchTerm && ` (tìm kiếm: "${searchTerm}")`}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedClasses.map((classItem) => {
            const statusInfo = getStatusDisplay(classItem.status);
            
            return (
              <div key={classItem.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow vietnamese-text">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-semibold text-gray-900 truncate vietnamese-heading crisp-text fix-vietnamese-diacritics">
                    {formatVietnameseText(classItem.className || classItem.class_name || 'Unnamed Class')}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} flex items-center`}>
                    <span className="mr-1">{statusInfo.icon}</span>
                    {statusInfo.text}
                  </span>
                </div>

                <div className="space-y-2 text-sm vietnamese-body">
                  <div className="flex justify-between">
                    <span className="text-gray-600 vietnamese-text">Template:</span>
                    <span className="font-medium vietnamese-text crisp-text fix-vietnamese-diacritics">
                      {formatVietnameseText(classItem.courseTemplateName || classItem.template_name || 'N/A')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 vietnamese-text">Giáo viên:</span>
                    <span className="font-medium vietnamese-text crisp-text fix-vietnamese-diacritics">
                      {formatVietnameseText(classItem.normalized?.teacherName || classItem.teacherName || classItem.teacher_name || 'N/A')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 vietnamese-text">Phòng học:</span>
                    <span className="font-medium vietnamese-text crisp-text fix-vietnamese-diacritics">
                      {formatVietnameseText(classItem.roomName || classItem.room_name || 'N/A')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 vietnamese-text">Học viên:</span>
                    <span className="font-medium vietnamese-text">
                      {classItem.currentStudents || "Tối đa 30 học sinh"}/{classItem.maxStudents || "Tối đa 30 học sinh"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 vietnamese-text">Thời gian:</span>
                    <span className="font-medium text-xs vietnamese-text">
                      {formatDate(classItem.startDate)} → {formatDate(classItem.endDate)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 vietnamese-text">Thời lượng:</span>
                    <span className="font-medium vietnamese-text">
                      {classItem.normalized?.duration || 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 vietnamese-text">Số bài học:</span>
                    <span className="font-medium vietnamese-text">
                      {classItem.lessonCount || 0} bài
                    </span>
                  </div>
                </div>

                {classItem.description && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-600 line-clamp-2 vietnamese-body crisp-text fix-vietnamese-diacritics">
                      {formatVietnameseText(classItem.description)}
                    </p>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      <div>ID: {classItem.id}</div>
                      <div>
                        {classItem.createdAt ? 
                          `Tạo: ${formatDate(classItem.createdAt)}` : 
                          'Mới tạo'
                        }
                      </div>
                    </div>
                    {/* Gọn: chỉ còn hành động */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onQuickEdit ? onQuickEdit(classItem) : onClassEdit?.(classItem)}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200 flex items-center button-vietnamese"
                        title="Chỉnh sửa nhanh"
                      >
                        <span className="mr-1">⚙️</span>
                        Sửa
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onClassDetail ? onClassDetail(classItem) : console.log('Class detail:', classItem)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 flex items-center button-vietnamese"
                        title="Quản lý chi tiết lớp học"
                      >
                        <span className="mr-1">📚</span>
                        Chi tiết
                      </button>
                      
                      {/* Nút Sửa gọn đã chuyển vào góc trên */}
                      <button
                        onClick={() => onReschedule ? onReschedule(classItem) : console.log('Reschedule:', classItem)}
                        className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 flex items-center button-vietnamese"
                        title="Đổi lịch lớp học"
                      >
                        <span className="mr-1">🗓️</span>
                        Đổi lịch
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClassList;