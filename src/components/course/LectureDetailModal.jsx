import React, { useState, useEffect } from 'react';
import { showNotification } from '../../utils/courseManagementUtils';

const LectureDetailModal = ({ visible, lecture, classData, onCancel, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [lectureAssignments, setLectureAssignments] = useState([]);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '23:59',
    submissionType: 'file',
    maxScore: 100,
    allowLateSubmission: false,
    maxAttempts: 1
  });

  // Load assignments for this lecture
  useEffect(() => {
    if (visible && lecture) {
      loadLectureAssignments();
    }
  }, [visible, lecture]);

  const loadLectureAssignments = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with real API call
      const mockAssignments = [
        {
          id: 1,
          lectureId: lecture?.id,
          title: `Quiz: ${lecture?.title || 'Bài giảng'}`,
          description: 'Bài kiểm tra nhỏ về nội dung bài giảng',
          dueDate: '2025-08-10',
          dueTime: '23:59',
          submissionType: 'quiz',
          maxScore: 20,
          status: 'active',
          submissionsCount: 5,
          createdAt: '2025-08-06'
        },
        {
          id: 2,
          lectureId: lecture?.id,
          title: `Thực hành: ${lecture?.title || 'Bài giảng'}`,
          description: 'Bài tập thực hành áp dụng kiến thức',
          dueDate: '2025-08-12',
          dueTime: '17:00',
          submissionType: 'file',
          maxScore: 50,
          status: 'active',
          submissionsCount: 3,
          createdAt: '2025-08-06'
        }
      ];

      // Filter assignments for current lecture
      const filtered = mockAssignments.filter(a => a.lectureId === lecture?.id);
      setLectureAssignments(filtered);
      
    } catch (error) {
      console.error('Error loading lecture assignments:', error);
      showNotification('Lỗi khi tải danh sách bài tập', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    // Validation
    if (!newAssignment.title.trim()) {
      showNotification('Vui lòng nhập tiêu đề bài tập', 'warning');
      return;
    }

    if (!newAssignment.description.trim()) {
      showNotification('Vui lòng nhập mô tả bài tập', 'warning');
      return;
    }

    if (!newAssignment.dueDate) {
      showNotification('Vui lòng chọn hạn nộp', 'warning');
      return;
    }

    try {
      setLoading(true);

      const assignmentData = {
        ...newAssignment,
        id: Date.now(),
        lectureId: lecture.id,
        classId: classData.id,
        status: 'active',
        submissionsCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: getCurrentUserId()
      };

      console.log('📝 Creating lecture assignment:', assignmentData);
      
      // TODO: Replace with real API call
      // const response = await assignmentService.createLectureAssignment(lecture.id, assignmentData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add to local state
      setLectureAssignments(prev => [assignmentData, ...prev]);
      
      showNotification(`Tạo bài tập "${newAssignment.title}" thành công!`, 'success');
      
      // Reset form
      setNewAssignment({
        title: '',
        description: '',
        dueDate: '',
        dueTime: '23:59',
        submissionType: 'file',
        maxScore: 100,
        allowLateSubmission: false,
        maxAttempts: 1
      });

      setShowCreateAssignment(false);
      
    } catch (error) {
      console.error('Error creating assignment:', error);
      showNotification('Lỗi khi tạo bài tập: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserId = () => {
    return 1; // TODO: Get from auth context
  };

  const getSubmissionTypeIcon = (type) => {
    const types = {
      'file': '📎',
      'text': '📝',
      'url': '🔗',
      'quiz': '❓'
    };
    return types[type] || '📄';
  };

  const getSubmissionTypeLabel = (type) => {
    const types = {
      'file': 'Upload File',
      'text': 'Text Input',
      'url': 'URL/Link',
      'quiz': 'Trắc nghiệm'
    };
    return types[type] || type;
  };

  const formatDueDate = (date, time) => {
    if (!date) return '';
    const dateObj = new Date(`${date}T${time || '23:59'}`);
    return dateObj.toLocaleDateString('vi-VN') + ' ' + dateObj.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!visible || !lecture) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold flex items-center">
                <span className="text-2xl mr-3">🎓</span>
                {lecture.title}
              </h3>
              <p className="text-blue-100 mt-1">
                Lớp: {classData?.className || classData?.class_name} • 
                Thời lượng: {lecture.duration} phút •
                Loại: {lecture.type}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-white/80 hover:text-white text-3xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: '📋 Tổng quan', count: null },
              { id: 'assignments', label: '📝 Bài tập', count: lectureAssignments.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin bài giảng</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Tiêu đề</label>
                    <p className="mt-1">{lecture.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Thời lượng</label>
                    <p className="mt-1">{lecture.duration} phút</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Loại bài giảng</label>
                    <p className="mt-1">
                      {lecture.type === 'live' && '🔴 Trực tiếp'}
                      {lecture.type === 'recorded' && '🎥 Đã ghi sẵn'}
                      {lecture.type === 'hybrid' && '🔄 Kết hợp'}
                      {lecture.type === 'self_study' && '📚 Tự học'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Trạng thái</label>
                    <p className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        lecture.status === 'active' ? 'bg-green-100 text-green-800' :
                        lecture.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lecture.status === 'active' ? '✅ Đang hoạt động' :
                         lecture.status === 'scheduled' ? '📅 Đã lên lịch' :
                         '📝 Nháp'}
                      </span>
                    </p>
                  </div>
                </div>
                
                {/* Description */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-600">Mô tả</label>
                  <p className="mt-1 text-gray-700">{lecture.description}</p>
                </div>

                {/* Video URL */}
                {lecture.videoUrl && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-600">Video/Link</label>
                    <a href={lecture.videoUrl} target="_blank" rel="noopener noreferrer" 
                       className="mt-1 text-blue-600 hover:text-blue-800 break-all">
                      {lecture.videoUrl}
                    </a>
                  </div>
                )}

                {/* Schedule */}
                {lecture.scheduledDate && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-600">Lịch học</label>
                    <p className="mt-1">{formatDueDate(lecture.scheduledDate, lecture.scheduledTime)}</p>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl text-blue-600 mb-2">📝</div>
                  <div className="text-lg font-semibold text-blue-900">{lectureAssignments.length}</div>
                  <div className="text-sm text-blue-700">Bài tập</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl text-green-600 mb-2">✅</div>
                  <div className="text-lg font-semibold text-green-900">
                    {lectureAssignments.reduce((sum, a) => sum + a.submissionsCount, 0)}
                  </div>
                  <div className="text-sm text-green-700">Bài nộp</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl text-purple-600 mb-2">⭐</div>
                  <div className="text-lg font-semibold text-purple-900">
                    {Math.round(lectureAssignments.reduce((sum, a) => sum + a.maxScore, 0) / Math.max(lectureAssignments.length, 1))}
                  </div>
                  <div className="text-sm text-purple-700">Điểm TB</div>
                </div>
              </div>
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              
              {/* Header with Add Button */}
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">
                  Bài tập cho bài giảng: {lecture.title}
                </h4>
                <button
                  onClick={() => setShowCreateAssignment(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <span className="text-lg mr-2">➕</span>
                  Thêm bài tập
                </button>
              </div>

              {/* Create Assignment Form */}
              {showCreateAssignment && (
                <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium text-blue-900">Tạo bài tập mới</h5>
                    <button
                      onClick={() => setShowCreateAssignment(false)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ❌
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tiêu đề bài tập <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newAssignment.title}
                          onChange={(e) => setNewAssignment(prev => ({...prev, title: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ví dụ: Quiz về React Hooks"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hình thức nộp bài
                        </label>
                        <select
                          value={newAssignment.submissionType}
                          onChange={(e) => setNewAssignment(prev => ({...prev, submissionType: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="file">📎 Upload File</option>
                          <option value="text">📝 Text Input</option>
                          <option value="url">🔗 URL/Link</option>
                          <option value="quiz">❓ Trắc nghiệm</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={newAssignment.description}
                        onChange={(e) => setNewAssignment(prev => ({...prev, description: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Mô tả chi tiết yêu cầu bài tập..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hạn nộp <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={newAssignment.dueDate}
                          onChange={(e) => setNewAssignment(prev => ({...prev, dueDate: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giờ nộp
                        </label>
                        <input
                          type="time"
                          value={newAssignment.dueTime}
                          onChange={(e) => setNewAssignment(prev => ({...prev, dueTime: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Điểm tối đa
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={newAssignment.maxScore}
                          onChange={(e) => setNewAssignment(prev => ({...prev, maxScore: parseInt(e.target.value) || 100}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="allowLate"
                          checked={newAssignment.allowLateSubmission}
                          onChange={(e) => setNewAssignment(prev => ({...prev, allowLateSubmission: e.target.checked}))}
                          className="mr-2"
                        />
                        <label htmlFor="allowLate" className="text-sm text-gray-700">
                          Cho phép nộp muộn
                        </label>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => setShowCreateAssignment(false)}
                          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleCreateAssignment}
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {loading ? 'Đang tạo...' : 'Tạo bài tập'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Assignments List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Đang tải danh sách bài tập...</div>
                </div>
              ) : lectureAssignments.length > 0 ? (
                <div className="space-y-4">
                  {lectureAssignments.map(assignment => (
                    <div key={assignment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 flex items-center">
                          {getSubmissionTypeIcon(assignment.submissionType)}
                          <span className="ml-2">{assignment.title}</span>
                        </h5>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {assignment.submissionsCount} bài nộp
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {assignment.maxScore} điểm
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-3">{assignment.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>📅 Hạn: {formatDueDate(assignment.dueDate, assignment.dueTime)}</span>
                          <span>📝 {getSubmissionTypeLabel(assignment.submissionType)}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700">
                            Xem chi tiết
                          </button>
                          <button className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-red-700">
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h5 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có bài tập nào
                  </h5>
                  <p className="text-gray-500 mb-4">
                    Thêm bài tập đầu tiên cho bài giảng này
                  </p>
                  <button
                    onClick={() => setShowCreateAssignment(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    ➕ Thêm bài tập
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default LectureDetailModal;