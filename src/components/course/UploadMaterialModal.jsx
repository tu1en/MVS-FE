import React, { useEffect, useState } from 'react';
import FirebaseMaterialService from '../../services/firebaseMaterialService';
import { showNotification } from '../../utils/courseManagementUtils';

const UploadMaterialModal = ({ visible, classData, onCancel, onSuccess }) => {
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    file: null,
    type: 'document',
    lectureId: null, // ✅ NEW: Kết nối với bài giảng cụ thể
    targetType: 'general' // 'general' hoặc 'lecture'
  });
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [lectures, setLectures] = useState([]); // ✅ NEW: Danh sách bài giảng
  const [loadingLectures, setLoadingLectures] = useState(false);

  // ✅ NEW: Load lectures when modal opens
  useEffect(() => {
    if (visible && classData) {
      loadLectures();
    }
  }, [visible, classData]);

  const loadLectures = async () => {
    setLoadingLectures(true);
    try {
      const token = localStorage.getItem('token');

      // First, find the corresponding classroom for this class
      let classroomId = classData.id; // fallback
      try {
        const classroomsResponse = await fetch('http://localhost:8088/api/classrooms', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (classroomsResponse.ok) {
          const classroomsData = await classroomsResponse.json();
          const classrooms = classroomsData.data || classroomsData;

          // Find classroom with matching name
          const matchingClassroom = classrooms.find(classroom =>
            classroom.name === classData.className
          );

          if (matchingClassroom) {
            classroomId = matchingClassroom.id;
            console.log('✅ Found matching classroom ID for lectures:', classroomId);
          }
        }
      } catch (error) {
        console.warn('⚠️ Could not find matching classroom, using class ID:', error);
      }

      const response = await fetch(`http://localhost:8088/api/lectures/classroom/${classroomId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLectures(Array.isArray(data) ? data : data.data || []);
      } else {
        console.warn('Failed to load lectures:', response.status);
        setLectures([]);
      }
    } catch (error) {
      console.error('Error loading lectures:', error);
      setLectures([]);
    }
    setLoadingLectures(false);
  };

  const fileTypes = [
    { value: 'document', label: '📄 Tài liệu', accept: '.pdf,.doc,.docx,.txt' },
    { value: 'presentation', label: '📊 Bài thuyết trình', accept: '.ppt,.pptx' },
    { value: 'video', label: '🎥 Video', accept: '.mp4,.avi,.mov,.mkv' },
    { value: 'audio', label: '🎵 Audio', accept: '.mp3,.wav,.m4a' },
    { value: 'image', label: '🖼️ Hình ảnh', accept: '.jpg,.jpeg,.png,.gif' },
    { value: 'archive', label: '📦 File nén', accept: '.zip,.rar,.7z' }
  ];

  const handleFileSelect = (file) => {
    if (file) {
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        showNotification('File quá lớn! Vui lòng chọn file nhỏ hơn 100MB', 'error');
        return;
      }

      // Auto-detect file type
      const extension = file.name.toLowerCase().split('.').pop();
      let detectedType = 'document';
      
      if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) detectedType = 'document';
      else if (['ppt', 'pptx'].includes(extension)) detectedType = 'presentation';
      else if (['mp4', 'avi', 'mov', 'mkv'].includes(extension)) detectedType = 'video';
      else if (['mp3', 'wav', 'm4a'].includes(extension)) detectedType = 'audio';
      else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) detectedType = 'image';
      else if (['zip', 'rar', '7z'].includes(extension)) detectedType = 'archive';

      setUploadData(prev => ({
        ...prev,
        file,
        type: detectedType,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '') // Remove extension
      }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!uploadData.file) {
      showNotification('Vui lòng chọn file để upload', 'warning');
      return;
    }

    if (!uploadData.title.trim()) {
      showNotification('Vui lòng nhập tên tài liệu', 'warning');
      return;
    }

    // ✅ NEW: Validate lecture selection
    if (uploadData.targetType === 'lecture' && !uploadData.lectureId) {
      showNotification('Vui lòng chọn bài giảng để gắn tài liệu', 'warning');
      return;
    }

    setUploading(true);

    try {
      console.log('🔥 Uploading to Firebase Storage:', {
        fileName: uploadData.file.name,
        fileSize: formatFileSize(uploadData.file.size),
        title: uploadData.title,
        type: uploadData.type,
        classId: classData.id,
        targetType: uploadData.targetType,
        lectureId: uploadData.lectureId
      });

      // Check if Firebase is available
      if (!FirebaseMaterialService.isAvailable()) {
        throw new Error('Firebase Storage is not available');
      }

      // Prepare metadata for Firebase upload
      const metadata = {
        classId: classData.id,
        title: uploadData.title.trim(),
        description: uploadData.description.trim() || 'Uploaded material',
        type: uploadData.type,
        uploadedBy: getCurrentUserId(),
        // ✅ NEW: Include lecture information
        targetType: uploadData.targetType,
        lectureId: uploadData.targetType === 'lecture' ? uploadData.lectureId : null
      };

      // Upload to Firebase Storage
      const result = await FirebaseMaterialService.uploadMaterial(
        uploadData.file, 
        metadata,
        (progress) => {
          console.log(`🔥 Upload progress: ${progress}%`);
          // You can add a progress bar here if needed
        }
      );

      console.log('✅ Firebase upload successful:', result);
      showNotification(`🔥 Tải lên Firebase "${uploadData.title}" thành công!`, 'success');
      
      // Reset form
      setUploadData({
        title: '',
        description: '',
        file: null,
        type: 'document',
        lectureId: null,
        targetType: 'general'
      });

      // Close modal and refresh
      onSuccess && onSuccess(result); // Pass result to parent
      onCancel();

    } catch (firebaseError) {
      console.warn('❌ Firebase upload failed:', firebaseError.message);
      console.log('🔄 Falling back to backend API...');
      
      // Fallback to backend API if Firebase fails
      try {
        await uploadToBackend();
      } catch (backendError) {
        console.error('❌ Both Firebase and backend upload failed');
        showNotification('Lỗi khi tải lên tài liệu: ' + backendError.message, 'error');
      }
    } finally {
      setUploading(false);
    }
  };

  // Fallback backend upload function
  const uploadToBackend = async () => {
    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('title', uploadData.title.trim());
    formData.append('description', uploadData.description.trim() || 'Uploaded material');
    formData.append('category', uploadData.type || 'General');
    formData.append('uploadedBy', 'User ' + getCurrentUserId());
    // ✅ NEW: Include lecture information for backend
    formData.append('targetType', uploadData.targetType);
    if (uploadData.targetType === 'lecture' && uploadData.lectureId) {
      formData.append('lectureId', uploadData.lectureId);
    }
    
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch('http://localhost:8088/api/mock-materials/upload', {
      method: 'POST',
      headers: headers,
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Backend upload failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Backend fallback successful:', result);
    showNotification(`📡 Tải lên backend "${uploadData.title}" thành công!`, 'success');
    
    // Reset form
    setUploadData({
      title: '',
      description: '',
      file: null,
      type: 'document',
      lectureId: null,
      targetType: 'general'
    });

    // Close modal and refresh
    onSuccess && onSuccess(result);
    onCancel();
  };

  // Simple user ID getter (replace with actual implementation)
  const getCurrentUserId = () => {
    // TODO: Get from authentication context/localStorage
    return 1; // Mock user ID
  };

  if (!visible) return null;

  const selectedFileType = fileTypes.find(type => type.value === uploadData.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">🔥</span>
              Firebase Upload - {classData?.className || classData?.class_name}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={uploading}
            >
              ×
            </button>
          </div>

          {/* File Upload Area */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn file</label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {uploadData.file ? (
                  <div className="space-y-3">
                    <div className="text-4xl">
                      🔥 {selectedFileType?.label.split(' ')[0] || '📁'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{uploadData.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(uploadData.file.size)} • {selectedFileType?.label.split(' ').slice(1).join(' ')}
                      </p>
                      <p className="text-xs text-orange-600 font-medium">📡 Sẽ được tải lên Firebase Storage</p>
                    </div>
                    <button
                      onClick={() => setUploadData(prev => ({ ...prev, file: null }))}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Xóa file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-4xl text-orange-400">🔥📁</div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">Kéo thả file vào đây</p>
                      <p className="text-sm text-gray-500">hoặc</p>
                    </div>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.mp4,.avi,.mov,.mkv,.mp3,.wav,.m4a,.jpg,.jpeg,.png,.gif,.zip,.rar,.7z"
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 cursor-pointer inline-block"
                    >
                      🔥 Chọn file cho Firebase
                    </label>
                    <p className="text-xs text-gray-400">
                      Hỗ trợ: PDF, Word, PowerPoint, Video, Audio, Hình ảnh, File nén (Max 100MB)
                    </p>
                    <p className="text-xs text-orange-600 font-medium">
                      📡 Files sẽ được lưu trữ an toàn trên Firebase Storage
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* File Details Form */}
            {uploadData.file && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên tài liệu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Nhập tên hiển thị cho tài liệu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại tài liệu</label>
                  <select
                    value={uploadData.type}
                    onChange={(e) => setUploadData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {fileTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả (tùy chọn)</label>
                  <textarea
                    rows={3}
                    value={uploadData.description}
                    onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Mô tả ngắn về tài liệu này..."
                  />
                </div>

                {/* ✅ NEW: Target Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gắn vào</label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="general"
                          checked={uploadData.targetType === 'general'}
                          onChange={(e) => setUploadData(prev => ({ ...prev, targetType: e.target.value, lectureId: null }))}
                          className="mr-2 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm">📚 Tài liệu chung của lớp</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="lecture"
                          checked={uploadData.targetType === 'lecture'}
                          onChange={(e) => setUploadData(prev => ({ ...prev, targetType: e.target.value }))}
                          className="mr-2 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm">🎓 Tài liệu cho bài giảng cụ thể</span>
                      </label>
                    </div>

                    {/* Lecture Selection */}
                    {uploadData.targetType === 'lecture' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chọn bài giảng <span className="text-red-500">*</span>
                        </label>
                        {loadingLectures ? (
                          <div className="flex items-center text-sm text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
                            Đang tải danh sách bài giảng...
                          </div>
                        ) : lectures.length > 0 ? (
                          <select
                            value={uploadData.lectureId || ''}
                            onChange={(e) => setUploadData(prev => ({ ...prev, lectureId: e.target.value || null }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="">Chọn bài giảng...</option>
                            {lectures.map(lecture => (
                              <option key={lecture.id} value={lecture.id}>
                                🎓 {lecture.title || lecture.name} {lecture.lectureDate ? `(${lecture.lectureDate})` : ''}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                            📝 Chưa có bài giảng nào. Tạo bài giảng trước khi upload tài liệu riêng.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={uploading}
            >
              Hủy
            </button>
            <button
              onClick={handleUpload}
              disabled={!uploadData.file || !uploadData.title.trim() || uploading || 
                       (uploadData.targetType === 'lecture' && !uploadData.lectureId)}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  🔥 Đang tải lên Firebase...
                </>
              ) : (
                <>
                  <span className="mr-2">🔥</span>
                  Tải lên Firebase Storage
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadMaterialModal;