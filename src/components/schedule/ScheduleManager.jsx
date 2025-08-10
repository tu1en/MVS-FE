import React, { useEffect, useState } from 'react';
import useScheduleValidation from '../../hooks/useScheduleValidation';
import classManagementService from '../../services/classManagementService';
import roomService from '../../services/roomService';
import { showNotification } from '../../utils/courseManagementUtils';
import RoomAvailabilityCalendar from '../room/RoomAvailabilityCalendar';
import RoomSelector from '../room/RoomSelector';

const ScheduleManager = ({ 
  classData = null, 
  existingSchedule = [],
  onScheduleChange = null,
  onScheduleValidate = null,
  mode = 'create', // 'create' | 'edit' | 'view'
  // Thông tin bổ sung để kiểm tra GV và auto-assign phòng
  teacherId = null,
  startDate = null,
  endDate = null,
  weeklySchedule = null
}) => {
  const [state, setState] = useState({
    scheduleItems: [],
    selectedItem: null,
    selectedRoom: null,
    showRoomCalendar: false,
    showRoomSelector: false,
    activeTab: 'list' // 'list' | 'calendar' | 'validation'
  });

  const {
    validationState,
    validateScheduleSlot,
    validateMultipleSlots,
    getAlternativeSlots,
    clearValidation,
    showValidationResults
  } = useScheduleValidation();

  // Initialize schedule from existing data
  useEffect(() => {
    if (existingSchedule && existingSchedule.length > 0) {
      setState(prev => ({ ...prev, scheduleItems: existingSchedule }));
    } else if (classData && classData.template) {
      // Generate schedule from class template
      generateScheduleFromTemplate();
    }
  }, [classData, existingSchedule]);

  // Generate initial schedule from template
  const generateScheduleFromTemplate = () => {
    if (!classData?.template?.lessons) return;

    const scheduleItems = classData.template.lessons.map((lesson, index) => ({
      id: `temp-${index}`,
      lessonId: lesson.id,
      lessonName: lesson.topicName,
      week: lesson.weekNumber || (index + 1),
      date: null, // To be set by user
      startTime: '07:30', // Default start time (slot 1)
      endTime: '09:30', // Default end time (120 phút)
      room: null,
      status: 'draft',
      duration: lesson.durationMinutes || 120
    }));

    setState(prev => ({ ...prev, scheduleItems }));
  };

  // Add new schedule item
  const addScheduleItem = () => {
    const newItem = {
      id: `new-${Date.now()}`,
      lessonName: 'Bài học mới',
      week: state.scheduleItems.length + 1,
      date: null,
      startTime: '07:30',
      endTime: '09:30',
      room: null,
      status: 'draft'
    };

    setState(prev => ({
      ...prev,
      scheduleItems: [...prev.scheduleItems, newItem],
      selectedItem: newItem
    }));
  };

  // Update schedule item
  const updateScheduleItem = (itemId, updates) => {
    setState(prev => ({
      ...prev,
      scheduleItems: prev.scheduleItems.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    }));

    // Notify parent component
    if (onScheduleChange) {
      const updatedItems = state.scheduleItems.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      onScheduleChange(updatedItems);
    }
  };

  // Delete schedule item
  const deleteScheduleItem = (itemId) => {
    setState(prev => ({
      ...prev,
      scheduleItems: prev.scheduleItems.filter(item => item.id !== itemId),
      selectedItem: prev.selectedItem?.id === itemId ? null : prev.selectedItem
    }));
  };

  // Handle room selection for schedule item
  const handleRoomSelect = (room) => {
    if (state.selectedItem) {
      updateScheduleItem(state.selectedItem.id, { room });
    }
    setState(prev => ({ ...prev, selectedRoom: room, showRoomSelector: false }));
  };

  // Handle time slot selection from calendar
  const handleTimeSlotSelect = (timeSlotData) => {
    if (state.selectedItem) {
      updateScheduleItem(state.selectedItem.id, {
        room: timeSlotData.room,
        date: timeSlotData.date,
        startTime: timeSlotData.startTime,
        endTime: timeSlotData.endTime
      });
    }
    setState(prev => ({ ...prev, showRoomCalendar: false }));
  };

  // Validate single schedule item
  const validateSingleItem = async (item) => {
    if (!item.room || !item.date || !item.startTime || !item.endTime) {
      showNotification('Vui lòng điền đầy đủ thông tin lịch học', 'warning');
      return false;
    }

    const result = await validateScheduleSlot({
      roomId: item.room.id,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      classId: classData?.id
    });

    showValidationResults(result);
    return result.isValid;
  };

  // Validate entire schedule
  const validateAllItems = async () => {
    const scheduleSlots = state.scheduleItems
      .filter(item => item.room && item.date && item.startTime && item.endTime)
      .map(item => ({
        roomId: item.room.id,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
        classId: classData?.id
      }));

    if (scheduleSlots.length === 0) {
      showNotification('Không có lịch học nào để kiểm tra', 'warning');
      return false;
    }

    const result = await validateMultipleSlots(scheduleSlots);
    showValidationResults(result);

    if (onScheduleValidate) {
      onScheduleValidate(result);
    }

    return result.isValid;
  };

  // Get alternative suggestions for conflicted item
  const getAlternatives = async (item) => {
    const result = await getAlternativeSlots({
      roomId: item.room?.id,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime
    }, {
      preferredBuilding: item.room?.building,
      preferredRoomType: item.room?.type,
      minCapacity: classData?.expectedStudents || 0,
      flexibleTime: true,
      flexibleDate: false
    });

    if (result.success && result.alternatives.length > 0) {
      // Show alternatives in a modal or dropdown
      showNotification(`Tìm thấy ${result.alternatives.length} lựa chọn thay thế`, 'info');
      // TODO: Implement alternative selection UI
    } else {
      showNotification('Không tìm thấy lựa chọn thay thế phù hợp', 'warning');
    }
  };

  const renderScheduleList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Danh sách lịch học</h3>
        {mode !== 'view' && (
          <div className="flex gap-2">
            <button
              onClick={addScheduleItem}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              ➕ Thêm tiết học
            </button>
            <button
              onClick={autoAssignRooms}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              title="Tự gán phòng trống theo từng tiết"
            >
              🏫 Tự gán phòng
            </button>
          </div>
        )}
      </div>

      {state.scheduleItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          📅 Chưa có lịch học nào
        </div>
      ) : (
        <div className="space-y-3">
          {state.scheduleItems.map((item, index) => (
            <div
              key={item.id}
              className={`
                p-4 border rounded-lg transition-colors
                ${state.selectedItem?.id === item.id ? 
                  'border-blue-500 bg-blue-50' : 
                  'border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium">Tuần {item.week}</span>
                    <span className="text-gray-500">•</span>
                    <span>{item.lessonName}</span>
                    {item.room && item.date && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        ✓ Đã có phòng
                      </span>
                    )}
                  </div>

                  {mode !== 'view' ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="date"
                        value={item.date || ''}
                        onChange={(e) => updateScheduleItem(item.id, { date: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="time"
                        value={item.startTime || ''}
                        onChange={(e) => updateScheduleItem(item.id, { startTime: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="time"
                        value={item.endTime || ''}
                        onChange={(e) => updateScheduleItem(item.id, { endTime: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setState(prev => ({ 
                              ...prev, 
                              selectedItem: item, 
                              showRoomSelector: true 
                            }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                        >
                          {item.room ? `${item.room.building}-${item.room.number}` : 'Chọn phòng'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      📅 {item.date || 'Chưa có ngày'} • 
                      🕒 {item.startTime || 'N/A'} - {item.endTime || 'N/A'} • 
                      🏢 {item.room ? `${item.room.building}-${item.room.number}` : 'Chưa có phòng'}
                    </div>
                  )}
                </div>

                <div className="ml-4 flex items-center space-x-2">
                  {mode !== 'view' && (
                    <>
                      <button
                        onClick={() => validateSingleItem(item)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 text-sm"
                        title="Kiểm tra xung đột"
                      >
                        🔍
                      </button>
                      <button
                        onClick={() => getAlternatives(item)}
                        disabled={!item.room || !item.date}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 text-sm disabled:opacity-50"
                        title="Tìm phòng khác"
                      >
                        🔄
                      </button>
                      <button
                        onClick={() => deleteScheduleItem(item.id)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm"
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Auto-assign rooms for each schedule item
  const autoAssignRooms = async () => {
    if (!Array.isArray(state.scheduleItems) || state.scheduleItems.length === 0) {
      showNotification('Chưa có tiết học để gán phòng', 'warning');
      return;
    }
    try {
      const updated = await Promise.all(
        state.scheduleItems.map(async (item) => {
          if (!item.date || !item.startTime || !item.endTime) return item;
          try {
            const res = await roomService.getAvailableRooms({
              date: item.date,
              startTime: item.startTime,
              endTime: item.endTime,
              minCapacity: classData?.expectedStudents || 0,
              building: item.room?.building,
              type: item.room?.type,
              classId: classData?.id || undefined
            });
            const rooms = res.data?.data || res.data || [];
            if (Array.isArray(rooms) && rooms.length > 0) {
              return { ...item, room: rooms[0] };
            }
          } catch (e) {
            // ignore item level errors, continue others
          }
          return item;
        })
      );
      setState(prev => ({ ...prev, scheduleItems: updated }));
      if (onScheduleChange) onScheduleChange(updated);
      showNotification('Đã tự gán phòng cho các tiết khả dụng', 'success');
    } catch (error) {
      console.error('Auto-assign rooms error:', error);
      showNotification('Lỗi khi tự gán phòng', 'error');
    }
  };

  // Check teacher availability against current weekly schedule
  const checkTeacherAvailability = async () => {
    if (!teacherId) {
      showNotification('Vui lòng chọn giáo viên ở bước trước', 'warning');
      return;
    }
    if (!weeklySchedule || !startDate || !endDate) {
      showNotification('Thiếu thông tin lịch để kiểm tra giáo viên', 'warning');
      return;
    }
    try {
      const payload = {
        subject: classData?.template?.subject || '',
        schedule: JSON.stringify(weeklySchedule),
        startDate,
        endDate
      };
      const res = await classManagementService.getAvailableTeachers(payload);
      const list = res.data?.data || res.data || [];
      const ok = list.some(t => String(t.id) === String(teacherId));
      if (ok) {
        showNotification('Giáo viên không bị trùng lịch trong khoảng thời gian đã chọn', 'success');
      } else {
        showNotification('Giáo viên đang bận trong một hoặc nhiều buổi. Vui lòng chọn giáo viên khác hoặc đổi lịch.', 'error');
      }
    } catch (error) {
      console.error('Check teacher availability error:', error);
      showNotification('Không kiểm tra được lịch giáo viên', 'error');
    }
  };

  const renderValidationTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Kiểm tra lịch học</h3>
        <button
          onClick={validateAllItems}
          disabled={validationState.isValidating || state.scheduleItems.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {validationState.isValidating ? '⏳ Đang kiểm tra...' : '🔍 Kiểm tra tất cả'}
        </button>
      </div>

      {validationState.conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">⚠️ Xung đột lịch học</h4>
          <div className="space-y-2">
            {validationState.conflicts.map((conflict, index) => (
              <div key={index} className="text-sm text-red-700">
                • {conflict.message || conflict}
              </div>
            ))}
          </div>
        </div>
      )}

      {validationState.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">⚠️ Cảnh báo</h4>
          <div className="space-y-2">
            {validationState.warnings.map((warning, index) => (
              <div key={index} className="text-sm text-yellow-700">
                • {warning.message || warning}
              </div>
            ))}
          </div>
        </div>
      )}

      {validationState.conflicts.length === 0 && validationState.warnings.length === 0 && !validationState.isValidating && (
        <div className="text-center py-8 text-gray-500">
          ✅ Chưa phát hiện vấn đề nào
        </div>
      )}
    </div>
  );

  return (
    <div className="schedule-manager">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['list', 'calendar', 'validation'].map(tab => (
            <button
              key={tab}
              onClick={() => setState(prev => ({ ...prev, activeTab: tab }))}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                state.activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'list' && '📋 Danh sách'}
              {tab === 'calendar' && '📅 Xem lịch phòng'}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {state.activeTab === 'list' && renderScheduleList()}
      {state.activeTab === 'calendar' && (
        <RoomAvailabilityCalendar
          roomId={state.selectedRoom?.id}
          onTimeSlotSelect={handleTimeSlotSelect}
        />
      )}
      {state.activeTab === 'validation' && renderValidationTab()}

      {/* Room Selector Modal */}
      {state.showRoomSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Chọn phòng học</h3>
              <button
                onClick={() => setState(prev => ({ ...prev, showRoomSelector: false }))}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <RoomSelector
              selectedRoom={state.selectedRoom}
              onRoomSelect={handleRoomSelect}
              scheduleData={state.selectedItem ? {
                date: state.selectedItem.date,
                startTime: state.selectedItem.startTime,
                endTime: state.selectedItem.endTime,
                classId: classData?.id
              } : null}
              minCapacity={classData?.expectedStudents || 0}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManager;