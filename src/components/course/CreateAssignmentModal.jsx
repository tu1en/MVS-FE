import React, { useState } from 'react';
import { showNotification } from '../../utils/courseManagementUtils';
import WysiwygEditor from '../common/WysiwygEditor';

const CreateAssignmentModal = ({ visible, classData, onCancel, onSuccess }) => {
  const [assignmentData, setAssignmentData] = useState({
    title: '',
    description: '',
    instructions: '',
    richTextContent: '',
    dueDate: '',
    dueTime: '23:59',
    maxScore: 100,
    submissionType: 'file',
    allowLateSubmission: true,
    latePenalty: 10,
    maxAttempts: 1,
    showGradeImmediately: false,
    attachments: []
  });
  const [creating, setCreating] = useState(false);

  const submissionTypes = [
    { value: 'file', label: '📎 Upload File', desc: 'Học viên upload file làm bài' },
    { value: 'text', label: '📝 Nhập văn bản', desc: 'Học viên nhập trực tiếp trên web' },
    { value: 'url', label: '🔗 Link/URL', desc: 'Học viên gửi link (GitHub, Google Docs...)' },
    { value: 'quiz', label: '❓ Trắc nghiệm', desc: 'Bài kiểm tra trắc nghiệm online' }
  ];

  const handleFieldChange = (field, value) => {
    setAssignmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreate = async () => {
    // Validation
    if (!assignmentData.title.trim()) {
      showNotification('Vui lòng nhập tiêu đề bài tập', 'warning');
      return;
    }

    if (!assignmentData.description.trim()) {
      showNotification('Vui lòng nhập mô tả bài tập', 'warning');
      return;
    }

    if (!assignmentData.dueDate) {
      showNotification('Vui lòng chọn hạn nộp bài', 'warning');
      return;
    }

    // Check if due date is not in the past
    const dueDateTime = new Date(`${assignmentData.dueDate}T${assignmentData.dueTime}`);
    if (dueDateTime < new Date()) {
      showNotification('Hạn nộp bài không thể là thời gian trong quá khứ', 'warning');
      return;
    }

    if (assignmentData.maxScore < 1 || assignmentData.maxScore > 1000) {
      showNotification('Điểm tối đa phải từ 1-1000', 'warning');
      return;
    }

    setCreating(true);

    try {
      const newAssignment = {
        id: Date.now(), // Mock ID
        classId: classData.id,
        title: assignmentData.title.trim(),
        description: assignmentData.description.trim(),
        instructions: assignmentData.instructions.trim(),
        dueDate: dueDateTime.toISOString(),
        maxScore: assignmentData.maxScore,
        submissionType: assignmentData.submissionType,
        allowLateSubmission: assignmentData.allowLateSubmission,
        latePenalty: assignmentData.latePenalty,
        maxAttempts: assignmentData.maxAttempts,
        showGradeImmediately: assignmentData.showGradeImmediately,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: getCurrentUserId(),
        submissions: []
      };

      console.log('📝 Creating assignment:', newAssignment);
      
      // TODO: Replace with actual API call
      // const response = await assignmentService.createAssignment(classData.id, newAssignment);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      showNotification(`Tạo bài tập "${assignmentData.title}" thành công!`, 'success');
      
      // Reset form
      setAssignmentData({
        title: '',
        description: '',
        instructions: '',
        dueDate: '',
        dueTime: '23:59',
        maxScore: 100,
        submissionType: 'file',
        allowLateSubmission: true,
        latePenalty: 10,
        maxAttempts: 1,
        showGradeImmediately: false,
        attachments: []
      });

      // Close modal and refresh
      onSuccess && onSuccess(newAssignment);
      onCancel();

    } catch (error) {
      console.error('❌ Create assignment error:', error);
      showNotification('Lỗi khi tạo bài tập: ' + error.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const getCurrentUserId = () => {
    // TODO: Get from authentication context
    return 1;
  };

  const formatDueDate = () => {
    if (assignmentData.dueDate && assignmentData.dueTime) {
      const date = new Date(`${assignmentData.dueDate}T${assignmentData.dueTime}`);
      return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    return '';
  };

  const getDaysUntilDue = () => {
    if (assignmentData.dueDate && assignmentData.dueTime) {
      const dueDateTime = new Date(`${assignmentData.dueDate}T${assignmentData.dueTime}`);
      const now = new Date();
      const diffTime = dueDateTime - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'Đã quá hạn';
      if (diffDays === 0) return 'Hôm nay';
      if (diffDays === 1) return 'Ngày mai';
      return `${diffDays} ngày nữa`;
    }
    return '';
  };

  if (!visible) return null;

  const selectedSubmissionType = submissionTypes.find(type => type.value === assignmentData.submissionType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">📝</span>
              Tạo bài tập mới - {classData?.className || classData?.class_name}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề bài tập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={assignmentData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: Bài tập 1: Tạo ứng dụng React cơ bản"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={assignmentData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả tổng quan về bài tập..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hướng dẫn chi tiết (Rich Text Editor)
                </label>
                <WysiwygEditor
                  value={assignmentData.richTextContent}
                  onChange={(content) => handleFieldChange('richTextContent', content)}
                  placeholder="Nhập hướng dẫn chi tiết với formatting, hình ảnh, file đính kèm..."
                  height="250px"
                  allowFileUpload={true}
                  allowImageUpload={true}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hướng dẫn plain text (tùy chọn)
                </label>
                <textarea
                  rows={3}
                  value={assignmentData.instructions}
                  onChange={(e) => handleFieldChange('instructions', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Hướng dẫn chi tiết dạng text thuần (backup)..."
                />
              </div>
            </div>

            {/* Submission Settings */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-4">
              <h4 className="font-medium text-blue-900 mb-3">Cài đặt nộp bài</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình thức nộp bài
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {submissionTypes.map(type => (
                    <label
                      key={type.value}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        assignmentData.submissionType === type.value
                          ? 'border-blue-500 bg-blue-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="submissionType"
                        value={type.value}
                        checked={assignmentData.submissionType === type.value}
                        onChange={(e) => handleFieldChange('submissionType', e.target.value)}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hạn nộp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={assignmentData.dueDate}
                    onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ hạn nộp
                  </label>
                  <input
                    type="time"
                    value={assignmentData.dueTime}
                    onChange={(e) => handleFieldChange('dueTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lần nộp tối đa
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={assignmentData.maxAttempts}
                    onChange={(e) => handleFieldChange('maxAttempts', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {formatDueDate() && (
                <div className="p-3 bg-blue-100 rounded text-sm">
                  <strong>Hạn nộp:</strong> {formatDueDate()} ({getDaysUntilDue()})
                </div>
              )}
            </div>

            {/* Grading Settings */}
            <div className="bg-green-50 p-4 rounded-lg space-y-4">
              <h4 className="font-medium text-green-900 mb-3">Cài đặt chấm điểm</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm tối đa
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={assignmentData.maxScore}
                    onChange={(e) => handleFieldChange('maxScore', parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phạt nộp muộn (% mỗi ngày)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={assignmentData.latePenalty}
                    onChange={(e) => handleFieldChange('latePenalty', parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={!assignmentData.allowLateSubmission}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={assignmentData.allowLateSubmission}
                    onChange={(e) => handleFieldChange('allowLateSubmission', e.target.checked)}
                    className="mr-3 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">Cho phép nộp muộn (có phạt điểm)</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={assignmentData.showGradeImmediately}
                    onChange={(e) => handleFieldChange('showGradeImmediately', e.target.checked)}
                    className="mr-3 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">Hiển thị điểm ngay sau khi nộp</span>
                </label>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Xem trước</h4>
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">
                    {assignmentData.title || 'Tiêu đề bài tập'}
                  </h5>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {selectedSubmissionType?.label}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {assignmentData.maxScore} điểm
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {assignmentData.description || 'Mô tả bài tập'}
                </p>
                {assignmentData.instructions && (
                  <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-50 rounded">
                    <strong>Hướng dẫn:</strong> {assignmentData.instructions}
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    Hạn nộp: {formatDueDate() || 'Chưa thiết lập'}
                    {getDaysUntilDue() && ` (${getDaysUntilDue()})`}
                  </span>
                  <span>
                    Nộp tối đa: {assignmentData.maxAttempts} lần
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
              disabled={!assignmentData.title.trim() || !assignmentData.description.trim() || !assignmentData.dueDate || creating}
              className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <span className="mr-2">📝</span>
                  Tạo bài tập
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;