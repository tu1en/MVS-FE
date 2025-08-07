import { useRef, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useWebSocketNotifications from '../../hooks/useWebSocketNotifications';
import { showNotification } from '../../utils/courseManagementUtils';
import CourseManagementDashboard from './CourseManagementDashboard';
import CourseTemplateManager from './CourseTemplateManager';
import CreateClassModal from './CreateClassModal';
import ImportExcelModal from './ImportExcelModal';
import ClassList from './ClassList';
import ScheduleCalendar from './ScheduleCalendar';
import ClassDetailModal from './ClassDetailModal';
import courseService from '../../services/courseService';

const CourseManagementSystem = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modals, setModals] = useState({
    import: false,
    createClass: false,
    viewTemplate: false,
    scheduleCalendar: false,
    classDetail: false
  });
  const [selectedItems, setSelectedItems] = useState({
    template: null,
    class: null
  });
  
  const [templateLessons, setTemplateLessons] = useState([]);

  // Ref for ClassList and ScheduleCalendar refresh
  const [classListRefreshTrigger, setClassListRefreshTrigger] = useState(0);
  const [scheduleRefreshTrigger, setScheduleRefreshTrigger] = useState(0);
  
  // ✅ FIX: Use real WebSocket notifications instead of mock
  const { 
    isConnected, 
    connectionStatus, 
    notifications,
    clearNotifications 
  } = useWebSocketNotifications({
    // ✅ FIX: Handle CLASS_CREATED with full data
    onClassCreated: (classData) => {
      console.log('🎓 CLASS_CREATED received with full data:', classData);
      
      // Check if we have valid data
      if (classData && classData.id && classData.className) {
        // Show success notification with actual class name
        showNotification(
          `Lớp học "${classData.className}" được tạo thành công!`, 
          'success'
        );
        
        // Also show toast for better UX
        toast.success(
          `🎓 Lớp học "${classData.className}" đã được tạo!`,
          {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          }
        );

        // Log full data for debugging
        console.log('✅ Full class data:', {
          id: classData.id,
          className: classData.className,
          courseTemplateName: classData.courseTemplateName,
          teacherName: classData.teacherName,
          roomName: classData.roomName,
          startDate: classData.startDate,
          endDate: classData.endDate,
          status: classData.status,
          maxStudents: classData.maxStudents,
          currentStudents: classData.currentStudents
        });

        // Refresh data if on classes tab
        refreshClassData();

        // Optionally switch to classes tab to show the new class
        setTimeout(() => {
          setActiveTab('classes');
        }, 2000);

      } else {
        console.error('❌ Invalid class data received:', classData);
        showNotification('Tạo lớp học thành công nhưng thiếu thông tin chi tiết', 'warning');
      }
    },

    // ✅ FIX: Handle CLASS_UPDATED with full data  
    onClassUpdated: (classData) => {
      console.log('📝 CLASS_UPDATED received:', classData);
      
      if (classData && classData.id && classData.className) {
        showNotification(`Lớp học "${classData.className}" đã được cập nhật`, 'info');
        
        // Refresh class data
        refreshClassData();
      }
    },

    // ✅ FIX: Handle CLASS_DELETED with data
    onClassDeleted: (deleteData) => {
      console.log('🗑️ CLASS_DELETED received:', deleteData);
      
      if (deleteData && deleteData.className) {
        showNotification(`Lớp học "${deleteData.className}" đã bị xóa`, 'warning');
        
        // Refresh class data
        refreshClassData();
      }
    },

    // Handle template imported (if backend sends this)
    onNotification: (notification) => {
      console.log('📢 General notification:', notification);
      
      if (notification.type === 'TEMPLATE_IMPORTED') {
        showNotification('Template mới được import thành công', 'info');
        
        // Refresh templates
        if (templateManagerRef.current && templateManagerRef.current.refreshTemplates) {
          setTimeout(() => {
            templateManagerRef.current.refreshTemplates();
          }, 1000);
        }
      }
    }
  });
  
  // Reference to CourseTemplateManager for refreshing data
  const templateManagerRef = useRef(null);

  // ✅ FIX: Real data refresh function
  const refreshClassData = async () => {
    try {
      console.log('🔄 Refreshing class data...');
      
      // Trigger ClassList component refresh
      setClassListRefreshTrigger(prev => prev + 1);
      
      // Also refresh schedule since it depends on classes
      setScheduleRefreshTrigger(prev => prev + 1);
      
    } catch (error) {
      console.error('❌ Error refreshing class data:', error);
    }
  };

  // Modal management functions
  const openModal = (modalName, item = null) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
    if (item) {
      const itemType = modalName === 'createClass' ? 'template' : 'class';
      setSelectedItems(prev => ({ ...prev, [itemType]: item }));
    }
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    // Clear selected items when closing modals
    if (modalName === 'createClass') {
      setSelectedItems(prev => ({ ...prev, template: null }));
    }
  };

  // ✅ FIX: Handle successful operations - Remove manual WebSocket triggers
  const handleImportSuccess = (templateData) => {
    closeModal('import');
    showNotification('Import template thành công!', 'success');
    
    // ✅ FIX: Don't manually trigger WebSocket - let backend send real notification
    // The backend should send TEMPLATE_IMPORTED notification automatically
    
    // Refresh templates after a short delay
    setTimeout(() => {
      if (templateManagerRef.current && templateManagerRef.current.refreshTemplates) {
        templateManagerRef.current.refreshTemplates();
      }
    }, 1000);
    
    // Switch to templates tab
    setActiveTab('templates');
  };

  const handleCreateClassSuccess = (classData) => {
    closeModal('createClass');
    
    // ✅ FIX: Don't show notification here - WebSocket will handle it
    // The real notification will come via WebSocket with full data
    console.log('✅ Class creation API successful, waiting for WebSocket notification...');
    
    // Show a temporary loading message
    toast.info('🔄 Đang tạo lớp học...', {
      position: 'top-right',
      autoClose: 2000
    });
    
    // ✅ FIX: Don't manually trigger - backend will send real CLASS_CREATED notification
    // WebSocket notification will handle the success message and data
  };

  const handleViewTemplate = async (template) => {
    setSelectedItems(prev => ({ ...prev, template }));
    
    // Fetch lesson details for the template
    try {
      const response = await courseService.getTemplateLessons(template.id);
      setTemplateLessons(response.data.data || []);
    } catch (error) {
      console.error('Error fetching template lessons:', error);
      setTemplateLessons([]);
      showNotification('Không thể tải chi tiết bài học', 'error');
    }
    
    openModal('viewTemplate');
  };

  const handleClassDetail = (classData) => {
    setSelectedItems(prev => ({ ...prev, class: classData }));
    openModal('classDetail');
  };

  const handleClassEdit = (classData) => {
    // TODO: Implement class edit functionality
    console.log('Edit class:', classData);
    showNotification('Chức năng chỉnh sửa lớp học đang phát triển', 'info');
  };

  // Tab data with counts
  const tabData = [
    { key: 'dashboard', label: '🏠 Dashboard', count: null },
    { key: 'templates', label: '📚 Templates', count: null },
    { key: 'classes', label: '👥 Lớp học', count: null },
    { key: 'schedule', label: '📅 Lịch học', count: null }
  ];

  // ✅ FIX: Enhanced connection status display
  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return { color: 'bg-green-500', text: 'Connected', icon: '🟢' };
      case 'disconnected':
        return { color: 'bg-red-500', text: 'Disconnected', icon: '🔴' };
      case 'error':
        return { color: 'bg-red-500', text: 'Error', icon: '❌' };
      default:
        return { color: 'bg-yellow-500', text: 'Connecting...', icon: '🟡' };
    }
  };

  const connectionInfo = getConnectionStatusInfo();

  // Render tab navigation
  const renderTabNavigation = () => (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-8">
        {tabData.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <CourseManagementDashboard
            onImportTemplate={() => openModal('import')}
            onManageTemplates={() => setActiveTab('templates')}
            onViewSchedule={() => setActiveTab('schedule')}
          />
        );
      
      case 'templates':
        return (
          <CourseTemplateManager
            ref={templateManagerRef}
            onCreateClass={(template) => openModal('createClass', template)}
            onImportTemplate={() => openModal('import')}
            onViewTemplate={handleViewTemplate}
          />
        );
      
      case 'classes':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Quản lý Lớp học</h2>
              <button
                onClick={() => setActiveTab('templates')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                <span className="mr-2">➕</span>
                Tạo Lớp Mới
              </button>
            </div>
            
            {/* Real ClassList Component */}
            <ClassList 
              onRefreshTrigger={classListRefreshTrigger}
              onClassDetail={handleClassDetail}
              onClassEdit={handleClassEdit}
            />
          </div>
        );
      
      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Lịch học Tổng thể</h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => setActiveTab('classes')}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Quản lý Lớp
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Templates
                </button>
              </div>
            </div>
            
            {/* Real Schedule Calendar Component */}
            <ScheduleCalendar onRefreshTrigger={scheduleRefreshTrigger} />
          </div>
        );
      
      default:
        return <CourseManagementDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ FIX: Enhanced Header with real WebSocket connection status */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🎓</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Advanced Course Management System
                </h1>
                <p className="text-gray-500 text-sm">
                  Real-time WebSocket integration với full data notifications
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* ✅ FIX: Real-time connection status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${connectionInfo.color}`}></div>
                <span className="text-xs text-gray-500">
                  {connectionInfo.icon} {connectionInfo.text}
                </span>
                {isConnected && (
                  <span className="text-xs text-green-600 font-medium">
                    Real-time ✓
                  </span>
                )}
              </div>
              
              {/* Notifications counter */}
              {notifications.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    📨 {notifications.length} notifications
                  </span>
                  <button
                    onClick={clearNotifications}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    Clear
                  </button>
                </div>
              )}
              
              {/* User profile */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  👤
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">Manager</div>
                  <div className="text-xs text-gray-500">WebSocket Admin</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ FIX: Development debug panel for WebSocket notifications */}
      {process.env.NODE_ENV === 'development' && notifications.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-yellow-800">
                🔧 Debug: Recent WebSocket Notifications ({notifications.length})
              </summary>
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {notifications.slice(0, 5).map((notification, index) => (
                  <div key={notification.id || index} className="bg-white p-2 rounded text-xs">
                    <div className="font-semibold text-blue-600">{notification.type}</div>
                    <div className="text-gray-700">{notification.message}</div>
                    {notification.data && (
                      <div className="text-gray-500 mt-1">
                        Data: {JSON.stringify(notification.data, null, 2)}
                      </div>
                    )}
                    <div className="text-gray-400 text-xs">
                      {notification.timestamp?.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Tab Navigation */}
          <div className="px-6 pt-6">
            {renderTabNavigation()}
          </div>

          {/* Tab Content */}
          <div className="px-6 pb-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ImportExcelModal
        visible={modals.import}
        onCancel={() => closeModal('import')}
        onSuccess={handleImportSuccess}
      />

      <CreateClassModal
        visible={modals.createClass}
        template={selectedItems.template}
        onCancel={() => closeModal('createClass')}
        onSuccess={handleCreateClassSuccess}
      />

      {/* Template View Modal */}
      {modals.viewTemplate && selectedItems.template && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  📚 Chi tiết Template: {selectedItems.template.name}
                </h3>
                <button
                  onClick={() => closeModal('viewTemplate')}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Thông tin cơ bản</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tên:</span>
                      <span className="ml-2 font-medium">{selectedItems.template.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Môn học:</span>
                      <span className="ml-2 font-medium">{selectedItems.template.subject || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Số tuần:</span>
                      <span className="ml-2 font-medium">{selectedItems.template.totalWeeks || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Số bài học:</span>
                      <span className="ml-2 font-medium">{selectedItems.template.lessonCount || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Mô tả</h4>
                  <p className="text-sm text-gray-700">
                    {selectedItems.template.description || 'Chưa có mô tả'}
                  </p>
                </div>

                {/* Lesson Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Chi tiết bài học ({templateLessons.length} bài)</h4>
                  {templateLessons.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {templateLessons.map((lesson, index) => (
                        <div key={lesson.id || index} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                                Tuần {lesson.weekNumber}
                              </span>
                              <h5 className="font-medium text-gray-900 inline">{lesson.topicName}</h5>
                            </div>
                            <span className="text-xs text-gray-500">{lesson.durationMinutes || 120} phút</span>
                          </div>
                          {lesson.lessonType && (
                            <div className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Loại:</span> {lesson.lessonType}
                            </div>
                          )}
                          {lesson.objectives && (
                            <div className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Mục đích:</span> {lesson.objectives}
                            </div>
                          )}
                          {lesson.requirements && (
                            <div className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Yêu cầu:</span> {lesson.requirements}
                            </div>
                          )}
                          {lesson.preparations && (
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Chuẩn bị:</span> {lesson.preparations}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Không có bài học nào hoặc đang tải...</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    closeModal('viewTemplate');
                    openModal('createClass', selectedItems.template);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Tạo lớp học
                </button>
                <button
                  onClick={() => closeModal('viewTemplate')}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Detail Modal */}
      <ClassDetailModal
        visible={modals.classDetail}
        classData={selectedItems.class}
        onCancel={() => closeModal('classDetail')}
      />
    </div>
  );
};

export default CourseManagementSystem;