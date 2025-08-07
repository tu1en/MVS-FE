import React, { useState } from 'react';
import { showNotification } from '../../utils/courseManagementUtils';

const CreateLectureModal = ({ visible, classData, onCancel, onSuccess }) => {
  const [lectureData, setLectureData] = useState({
    title: '',
    description: '',
    duration: 45,
    videoUrl: '',
    materials: [],
    scheduledDate: '',
    scheduledTime: '',
    type: 'live'
  });
  const [creating, setCreating] = useState(false);

  const lectureTypes = [
    { value: 'live', label: '🔴 Trực tiếp', desc: 'Bài giảng trực tuyến theo thời gian thực' },
    { value: 'recorded', label: '🎥 Đã ghi sẵn', desc: 'Video bài giảng đã được ghi trước' },
    { value: 'hybrid', label: '🔄 Kết hợp', desc: 'Kết hợp trực tiếp và tài liệu' },
    { value: 'self_study', label: '📚 Tự học', desc: 'Tài liệu cho học viên tự nghiên cứu' }
  ];

  const handleFieldChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setLectureData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setLectureData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleCreate = async () => {
    // Validation
    if (!lectureData.title.trim()) {
      showNotification('Vui lòng nhập tiêu đề bài giảng', 'warning');
      return;
    }

    if (!lectureData.description.trim()) {
      showNotification('Vui lòng nhập mô tả bài giảng', 'warning');
      return;
    }

    if (lectureData.duration < 10 || lectureData.duration > 300) {
      showNotification('Thời lượng bài giảng phải từ 10-300 phút', 'warning');
      return;
    }

    setCreating(true);

    try {
      const newLecture = {
        id: Date.now(), // Mock ID
        classId: classData.id,
        title: lectureData.title.trim(),
        description: lectureData.description.trim(),
        duration: lectureData.duration,
        type: lectureData.type,
        videoUrl: lectureData.videoUrl.trim(),
        scheduledDate: lectureData.scheduledDate,
        scheduledTime: lectureData.scheduledTime,
        status: lectureData.scheduledDate ? 'scheduled' : 'draft',
        createdAt: new Date().toISOString(),
        createdBy: getCurrentUserId()
      };

      console.log('🎓 Creating lecture:', newLecture);
      
      // TODO: Replace with actual API call
      // const response = await lectureService.createLecture(classData.id, newLecture);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      showNotification(`Tạo bài giảng "${lectureData.title}" thành công!`, 'success');
      
      // Reset form
      setLectureData({
        title: '',
        description: '',
        duration: 45,
        videoUrl: '',
        materials: [],
        scheduledDate: '',
        scheduledTime: '',
        type: 'live'
      });

      // Close modal and refresh
      onSuccess && onSuccess(newLecture);
      onCancel();

    } catch (error) {
      console.error('❌ Create lecture error:', error);
      showNotification('Lỗi khi tạo bài giảng: ' + error.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const getCurrentUserId = () => {
    // TODO: Get from authentication context
    return 1;
  };

  const formatDateTime = () => {
    if (lectureData.scheduledDate && lectureData.scheduledTime) {
      const date = new Date(`${lectureData.scheduledDate}T${lectureData.scheduledTime}`);
      return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    return '';
  };

  if (!visible) return null;

  const selectedType = lectureTypes.find(type => type.value === lectureData.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">🎓</span>
              Tạo bài giảng mới - {classData?.className || classData?.class_name}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={creating}
            >
              ×
            </button>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề bài giảng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lectureData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ví dụ: Bài 1: Giới thiệu về React"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời lượng (phút) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={lectureData.duration}
                    onChange={(e) => handleFieldChange('duration', parseInt(e.target.value) || 45)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={lectureData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả nội dung bài giảng, mục tiêu học tập..."
                />
              </div>
            </div>

            {/* Lecture Type */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">Loại bài giảng</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lectureTypes.map(type => (
                  <label
                    key={type.value}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      lectureData.type === type.value
                        ? 'border-blue-500 bg-blue-100'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lectureType"
                      value={type.value}
                      checked={lectureData.type === type.value}
                      onChange={(e) => handleFieldChange('type', e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-gray-600">{type.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Video URL (if recorded type) */}
            {(lectureData.type === 'recorded' || lectureData.type === 'hybrid') && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3">Video/Link</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Video hoặc Meeting Link
                  </label>
                  <input
                    type="url"
                    value={lectureData.videoUrl}
                    onChange={(e) => handleFieldChange('videoUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://www.youtube.com/watch?v=... hoặc https://zoom.us/j/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Hỗ trợ YouTube, Vimeo, Google Meet, Zoom, v.v.
                  </p>
                </div>
              </div>
            )}

            {/* Schedule (if live type) */}
            {(lectureData.type === 'live' || lectureData.type === 'hybrid') && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-3">Lên lịch bài giảng</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày giảng dạy
                    </label>
                    <input
                      type="date"
                      value={lectureData.scheduledDate}
                      onChange={(e) => handleFieldChange('scheduledDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giờ bắt đầu
                    </label>
                    <input
                      type="time"
                      value={lectureData.scheduledTime}
                      onChange={(e) => handleFieldChange('scheduledTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>
                
                {formatDateTime() && (
                  <div className="mt-3 p-2 bg-yellow-100 rounded text-sm">
                    <strong>Thời gian:</strong> {formatDateTime()}
                  </div>
                )}
              </div>
            )}

            {/* Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Xem trước</h4>
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">
                    {lectureData.title || 'Tiêu đề bài giảng'}
                  </h5>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedType?.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {lectureData.description || 'Mô tả bài giảng'}
                </p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Thời lượng: {lectureData.duration} phút</span>
                  <span>
                    {formatDateTime() || 
                     (lectureData.type === 'self_study' ? 'Tự học' : 'Chưa lên lịch')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={creating}
            >
              Hủy
            </button>
            <button
              onClick={handleCreate}
              disabled={!lectureData.title.trim() || !lectureData.description.trim() || creating}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <span className="mr-2">🎓</span>
                  Tạo bài giảng
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLectureModal;