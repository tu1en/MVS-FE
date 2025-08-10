import React, { useEffect, useState } from 'react';
import classManagementService from '../../services/classManagementService';
import { showNotification } from '../../utils/courseManagementUtils';
import { formatVietnameseText } from '../../utils/viTextUtils';

const ClassList = ({ onRefreshTrigger, onClassDetail, onClassEdit }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      }
      
      setClasses(Array.isArray(classesData) ? classesData : []);
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
          Danh sách Lớp học ({classes.length})
        </h3>
        <button 
          onClick={loadClasses}
          className="text-blue-500 hover:text-blue-700 text-sm flex items-center button-vietnamese"
          disabled={loading}
        >
          <span className="mr-1">🔄</span>
          Tải lại
        </button>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => {
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
                      {formatVietnameseText(classItem.teacherName || classItem.teacher_name || 'N/A')}
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
                      {classItem.currentStudents || 0}/{classItem.maxStudents || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 vietnamese-text">Thời gian:</span>
                    <span className="font-medium text-xs vietnamese-text">
                      {formatDate(classItem.startDate)} → {formatDate(classItem.endDate)}
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
                      
                      <button
                        onClick={() => onClassEdit ? onClassEdit(classItem) : console.log('Class edit:', classItem)}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 flex items-center button-vietnamese"
                        title="Chỉnh sửa lớp học"
                      >
                        <span className="mr-1">✏️</span>
                        Sửa
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