import React, { useState } from 'react';
import { showNotification } from '../../utils/courseManagementUtils';
import FirebaseMaterialService from '../../services/firebaseMaterialService';

const UploadMaterialModal = ({ visible, classData, onCancel, onSuccess }) => {
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    file: null,
    type: 'document'
  });
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

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
  
    setUploading(true);
  
    try {
      // Create FormData for file upload - try real API first
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('classroomId', classData.id);
      formData.append('title', uploadData.title.trim());
      formData.append('description', uploadData.description.trim() || 'Uploaded material');
      formData.append('uploadedBy', getCurrentUserId());
      formData.append('isPublic', 'true'); // Add for CourseMaterialController
  
      console.log('📤 Uploading material:', {
        fileName: uploadData.file.name,
        fileSize: formatFileSize(uploadData.file.size),
        title: uploadData.title,
        type: uploadData.type,
        classId: classData.id
      });
  
      // Get auth token
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
  
      // Try real API first, then fallback to mock API
      let response;
      let uploadEndpoint = 'http://localhost:8088/api/materials/upload';
      
      try {
        console.log('🔄 Trying real materials API...');
        response = await fetch(uploadEndpoint, {
          method: 'POST',
          headers: headers,
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Real API failed: ${response.status}`);
        }
      } catch (realApiError) {
        console.warn('❌ Real materials API failed:', realApiError.message);
        console.log('🔄 Falling back to mock materials API...');
        
        // Create new FormData for mock API (different parameters)
        const mockFormData = new FormData();
        mockFormData.append('file', uploadData.file);
        mockFormData.append('description', uploadData.description.trim() || 'Uploaded material');
        mockFormData.append('category', uploadData.type || 'General');
        mockFormData.append('uploadedBy', 'User ' + getCurrentUserId());
        
        uploadEndpoint = 'http://localhost:8088/api/mock-materials/upload';
        response = await fetch(uploadEndpoint, {
          method: 'POST',
          headers: headers,
          body: mockFormData
        });
      }

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Upload successful:', result);
        console.log('📍 Used endpoint:', uploadEndpoint);
        showNotification(`Tải lên "${uploadData.title}" thành công!`, 'success');
        
        // Reset form
        setUploadData({
          title: '',
          description: '',
          file: null,
          type: 'document'
        });
  
        // Close modal and refresh
        onSuccess && onSuccess();
        onCancel();
      } else {
        const errorData = await response.text();
        console.error('❌ Upload failed:', response.status, errorData);
        throw new Error(`Upload failed: ${response.status}`);
      }
  
    } catch (error) {
      console.error('❌ Upload error:', error);
      showNotification('Lỗi khi tải lên tài liệu: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
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
              <span className="text-2xl mr-3">📤</span>
              Thêm tài liệu - {classData?.className || classData?.class_name}
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
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {uploadData.file ? (
                  <div className="space-y-3">
                    <div className="text-4xl">
                      {selectedFileType?.label.split(' ')[0] || '📁'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{uploadData.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(uploadData.file.size)} • {selectedFileType?.label.split(' ').slice(1).join(' ')}
                      </p>
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
                    <div className="text-4xl text-gray-400">📁</div>
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
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer inline-block"
                    >
                      Chọn file
                    </label>
                    <p className="text-xs text-gray-400">
                      Hỗ trợ: PDF, Word, PowerPoint, Video, Audio, Hình ảnh, File nén (Max 100MB)
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên hiển thị cho tài liệu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại tài liệu</label>
                  <select
                    value={uploadData.type}
                    onChange={(e) => setUploadData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mô tả ngắn về tài liệu này..."
                  />
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
              disabled={!uploadData.file || !uploadData.title.trim() || uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tải lên...
                </>
              ) : (
                <>
                  <span className="mr-2">📤</span>
                  Tải lên
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