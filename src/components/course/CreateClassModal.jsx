import React, { useState, useEffect, useCallback } from 'react';
import classManagementService from '../../services/classManagementService';
import { 
  validateClassForm, 
  showNotification, 
  showConfirmDialog,
  getCurrentUserId,
  formatSchedule,
  debounce 
} from '../../utils/courseManagementUtils';

const CreateClassModal = ({ visible, template, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    className: '',
    description: '',
    teacherId: null,
    roomId: null,
    startDate: '',
    endDate: '', 
    schedule: {
      days: [],
      startTime: '',
      endTime: '',
      duration: 120
    },
    maxStudents: 30,
    settings: {
      allowLateEnrollment: true,
      requireApproval: false,
      isPublic: true
    },
    validation: {}
  });

  const [state, setState] = useState({
    teachers: [],
    rooms: [],
    conflicts: [],
    loading: {
      teachers: false,
      rooms: false,
      conflicts: false,
      submit: false
    },
    errors: {}
  });

  // Debounced conflict check
  const debouncedConflictCheck = useCallback(
    debounce((data) => {
      checkScheduleConflicts(data);
    }, 1000),
    []
  );

  // Load teachers and rooms
  useEffect(() => {
    if (visible) {
      loadTeachers();
      loadRooms();
    }
  }, [visible]);

  // Auto-conflict check when relevant fields change
  useEffect(() => {
    if (formData.roomId && formData.schedule.days.length > 0 && formData.startDate && formData.endDate) {
      debouncedConflictCheck({
        roomId: formData.roomId,
        teacherId: formData.teacherId,
        schedule: formData.schedule,
        startDate: formData.startDate,
        endDate: formData.endDate
      });
    } else {
      setState(prev => ({ ...prev, conflicts: [] }));
    }
  }, [formData.roomId, formData.teacherId, formData.schedule, formData.startDate, formData.endDate]);

  // Load teachers
  const loadTeachers = async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, teachers: true } }));
    
    try {
      const response = await classManagementService.getAllTeachers();
      setState(prev => ({
        ...prev,
        teachers: response.data || [],
        loading: { ...prev.loading, teachers: false }
      }));
    } catch (error) {
      console.error('Error loading teachers:', error);
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, teachers: error.message },
        loading: { ...prev.loading, teachers: false }
      }));
    }
  };

  // Load rooms
  const loadRooms = async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, rooms: true } }));
    
    try {
      const response = await classManagementService.getAllRooms();
      setState(prev => ({
        ...prev,
        rooms: response.data || [],
        loading: { ...prev.loading, rooms: false }
      }));
    } catch (error) {
      console.error('Error loading rooms:', error);
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, rooms: error.message },
        loading: { ...prev.loading, rooms: false }
      }));
    }
  };

  // Check schedule conflicts
  const checkScheduleConflicts = async (scheduleData) => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, conflicts: true } }));
    
    try {
      const response = await classManagementService.checkScheduleConflicts(scheduleData);
      setState(prev => ({
        ...prev,
        conflicts: response.data || [],
        loading: { ...prev.loading, conflicts: false }
      }));
    } catch (error) {
      console.error('Error checking conflicts:', error);
      setState(prev => ({
        ...prev,
        conflicts: [],
        loading: { ...prev.loading, conflicts: false }
      }));
    }
  };

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
        validation: { ...prev.validation, [field]: null }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        validation: { ...prev.validation, [field]: null }
      }));
    }
  };

  // Handle schedule days change
  const handleScheduleDaysChange = (day) => {
    const newDays = formData.schedule.days.includes(day)
      ? formData.schedule.days.filter(d => d !== day)
      : [...formData.schedule.days, day];
    
    setFormData(prev => ({
      ...prev,
      schedule: { ...prev.schedule, days: newDays },
      validation: { ...prev.validation, scheduleDays: null }
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form 
    const validation = validateClassForm(formData);
    if (Object.keys(validation).length > 0) {
      setFormData(prev => ({ ...prev, validation }));
      showNotification('Vui lòng kiểm tra lại thông tin', 'warning');
      return;
    }

    // Check conflicts and confirm if needed
    if (state.conflicts.length > 0) {
      const confirmed = await showConfirmDialog(
        'Phát hiện xung đột lịch học',
        `Có ${state.conflicts.length} xung đột lịch được phát hiện. Bạn có muốn tiếp tục tạo lớp học?`
      );
      if (!confirmed) return;
    }

    setState(prev => ({ ...prev, loading: { ...prev.loading, submit: true } }));

    try {
      const classData = {
        courseTemplateId: template.id,
        className: formData.className,
        description: formData.description,
        teacherId: formData.teacherId,
        roomId: formData.roomId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        schedule: JSON.stringify(formData.schedule),
        maxStudents: formData.maxStudents,
        settings: formData.settings,
        createdBy: getCurrentUserId()
      };

      const response = await classManagementService.createClass(classData);
      
      showNotification(`Tạo lớp học "${formData.className}" thành công!`, 'success');
      
      // Reset form and close modal
      handleReset();
      onSuccess(response.data);
      
    } catch (error) {
      console.error('Create class error:', error);
      showNotification('Lỗi tạo lớp học: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, submit: false } }));
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      className: '',
      description: '',
      teacherId: null,
      roomId: null,
      startDate: '',
      endDate: '',
      schedule: {
        days: [],
        startTime: '',
        endTime: '',
        duration: 120
      },
      maxStudents: 30,
      settings: {
        allowLateEnrollment: true,
        requireApproval: false,
        isPublic: true
      },
      validation: {}
    });
    setState(prev => ({ ...prev, conflicts: [] }));
  };

  // Handle cancel
  const handleCancel = () => {
    handleReset();
    onCancel();
  };

  if (!visible || !template) return null;

  const dayNames = [
    { key: 'monday', label: 'Thứ 2' },
    { key: 'tuesday', label: 'Thứ 3' },
    { key: 'wednesday', label: 'Thứ 4' },
    { key: 'thursday', label: 'Thứ 5' },
    { key: 'friday', label: 'Thứ 6' },
    { key: 'saturday', label: 'Thứ 7' },
    { key: 'sunday', label: 'Chủ nhật' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="text-2xl mr-3">🏫</span>
                Tạo lớp học từ: {template.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {template.description}
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Schedule Conflicts Alert */}
          {state.conflicts.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-red-600 mr-2 text-xl">⚠️</span>
                <h4 className="text-red-800 font-medium">
                  Phát hiện {state.conflicts.length} xung đột lịch học!
                </h4>
              </div>
              <div className="space-y-1">
                {state.conflicts.map((conflict, index) => (
                  <div key={index} className="flex items-start text-sm text-red-700">
                    <span className="mr-2 mt-0.5">•</span>
                    <span>{conflict.details || conflict.message || 'Xung đột lịch học'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📝</span>
                  Thông tin cơ bản
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên lớp học <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.className}
                      onChange={(e) => handleFieldChange('className', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formData.validation.className ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Ví dụ: Java-Spring-2024-K1"
                    />
                    {formData.validation.className && (
                      <p className="mt-1 text-sm text-red-600">{formData.validation.className}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số học viên tối đa</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.maxStudents}
                      onChange={(e) => handleFieldChange('maxStudents', parseInt(e.target.value) || 30)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formData.validation.maxStudents ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {formData.validation.maxStudents && (
                      <p className="mt-1 text-sm text-red-600">{formData.validation.maxStudents}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả lớp học</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mô tả về lớp học, yêu cầu đầu vào, mục tiêu..."
                  />
                </div>
              </div>

              {/* Teacher & Room Assignment */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">👨‍🏫</span>
                  Phân công giảng dạy
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giáo viên <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.teacherId || ''}
                      onChange={(e) => handleFieldChange('teacherId', parseInt(e.target.value) || null)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formData.validation.teacherId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={state.loading.teachers}
                    >
                      <option value="">
                        {state.loading.teachers ? 'Đang tải...' : 'Chọn giáo viên'}
                      </option>
                      {state.teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.fullName} - {teacher.specialization || 'Chưa có chuyên môn'}
                        </option>
                      ))}
                    </select>
                    {formData.validation.teacherId && (
                      <p className="mt-1 text-sm text-red-600">{formData.validation.teacherId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phòng học <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.roomId || ''}
                      onChange={(e) => handleFieldChange('roomId', parseInt(e.target.value) || null)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formData.validation.roomId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={state.loading.rooms}
                    >
                      <option value="">
                        {state.loading.rooms ? 'Đang tải...' : 'Chọn phòng học'}
                      </option>
                      {state.rooms.map(room => (
                        <option key={room.id} value={room.id}>
                          {room.roomCode} - {room.roomName} (Sức chứa: {room.capacity})
                        </option>
                      ))}
                    </select>
                    {formData.validation.roomId && (
                      <p className="mt-1 text-sm text-red-600">{formData.validation.roomId}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule Configuration */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📅</span>
                  Lịch học
                  {state.loading.conflicts && (
                    <span className="ml-2 text-sm text-blue-600">
                      <span className="animate-spin inline-block">⟳</span> Đang kiểm tra xung đột...
                    </span>
                  )}
                </h4>
                
                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleFieldChange('startDate', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formData.validation.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {formData.validation.startDate && (
                      <p className="mt-1 text-sm text-red-600">{formData.validation.startDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleFieldChange('endDate', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formData.validation.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {formData.validation.endDate && (
                      <p className="mt-1 text-sm text-red-600">{formData.validation.endDate}</p>
                    )}
                  </div>
                </div>

                {/* Days of Week */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày học trong tuần <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                    {dayNames.map(day => (
                      <label key={day.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.schedule.days.includes(day.key)}
                          onChange={() => handleScheduleDaysChange(day.key)}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{day.label}</span>
                      </label>
                    ))}
                  </div>
                  {formData.validation.scheduleDays && (
                    <p className="mt-1 text-sm text-red-600">{formData.validation.scheduleDays}</p>
                  )}
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giờ bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.schedule.startTime}
                      onChange={(e) => handleFieldChange('schedule.startTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giờ kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.schedule.endTime}
                      onChange={(e) => handleFieldChange('schedule.endTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thời lượng (phút)</label>
                    <input
                      type="number"
                      min="30"
                      max="480"
                      step="30"
                      value={formData.schedule.duration}
                      onChange={(e) => handleFieldChange('schedule.duration', parseInt(e.target.value) || 120)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {formData.validation.scheduleTime && (
                  <p className="mt-1 text-sm text-red-600">{formData.validation.scheduleTime}</p>
                )}
              </div>

              {/* Advanced Settings */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">⚙️</span>
                  Cài đặt nâng cao
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.settings.allowLateEnrollment}
                      onChange={(e) => handleFieldChange('settings.allowLateEnrollment', e.target.checked)}
                      className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Cho phép đăng ký muộn</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.settings.requireApproval}
                      onChange={(e) => handleFieldChange('settings.requireApproval', e.target.checked)}
                      className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Yêu cầu duyệt khi đăng ký</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.settings.isPublic}
                      onChange={(e) => handleFieldChange('settings.isPublic', e.target.checked)}
                      className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Công khai lớp học</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Sidebar - Template Info & Preview */}
            <div className="space-y-6">
              {/* Template Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                  <span className="mr-2">📚</span>
                  Template: {template.name}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Tổng số tuần:</span>
                    <span className="font-medium">{template.totalWeeks || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Số bài học:</span>
                    <span className="font-medium">{template.lessonCount || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Môn học:</span>
                    <span className="font-medium">{template.subject || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Schedule Preview */}
              {(formData.schedule.days.length > 0 && formData.schedule.startTime && formData.schedule.endTime) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-3 flex items-center">
                    <span className="mr-2">📅</span>
                    Xem trước lịch học
                  </h4>
                  <div className="text-sm text-green-800">
                    <p className="mb-2">
                      <strong>Lịch:</strong> {formatSchedule(formData.schedule)}
                    </p>
                    {formData.startDate && formData.endDate && (
                      <p className="mb-2">
                        <strong>Thời gian:</strong><br />
                        {formData.startDate} → {formData.endDate}
                      </p>
                    )}
                    <p>
                      <strong>Thời lượng mỗi buổi:</strong> {formData.schedule.duration} phút
                    </p>
                  </div>
                </div>
              )}

              {/* Conflict Status */}
              <div className={`border rounded-lg p-4 ${
                state.conflicts.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              }`}>
                <h4 className={`font-medium mb-2 flex items-center ${
                  state.conflicts.length > 0 ? 'text-red-900' : 'text-green-900'
                }`}>
                  <span className="mr-2">{state.conflicts.length > 0 ? '⚠️' : '✅'}</span>
                  Trạng thái xung đột
                </h4>
                <p className={`text-sm ${
                  state.conflicts.length > 0 ? 'text-red-800' : 'text-green-800'
                }`}>
                  {state.loading.conflicts ? 'Đang kiểm tra...' :
                   state.conflicts.length > 0 ? 
                   `${state.conflicts.length} xung đột được phát hiện` :
                   'Không có xung đột lịch học'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={state.loading.submit}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {state.loading.submit ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <span className="mr-2">🏫</span>
                  Tạo lớp học
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClassModal;