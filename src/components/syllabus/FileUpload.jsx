// src/components/syllabus/FileUpload.jsx
import { AlertCircle, CheckCircle, Upload, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { fileValidation } from '../../services/fileValidation';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const FileUpload = ({ onUploadSuccess, onCancel }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validation, setValidation] = useState(null);
  const fileInputRef = useRef(null);
  
  const { uploadFile, uploading, progress, error } = useFileUpload();

  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    if (!file) return;

    const validationResult = fileValidation.validateExcelFile(file);
    setValidation(validationResult);
    setSelectedFile(file);
  }, []);

  // Handle drag events
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || !validation?.isValid) return;

    try {
      const result = await uploadFile(selectedFile);
      onUploadSuccess?.(result);
    } catch (error) {
      // Error already handled by hook
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedFile(null);
    setValidation(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Upload Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : selectedFile 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {!selectedFile ? (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    📤 Upload File Excel
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Kéo thả file vào đây hoặc click để chọn file
                  </p>
                  <Button variant="outline" size="sm">
                    📁 Chọn File
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Chỉ chấp nhận file .xlsx (tối đa 5MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    ✅ File đã chọn
                  </h3>
                  <p className="text-sm text-gray-600">
                    Sẵn sàng để upload và xử lý
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Info */}
      {selectedFile && validation && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">
                  📄 Thông tin file
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                >
                  <X className="w-4 h-4 mr-1" />
                  Xóa
                </Button>
              </div>

              {/* File Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Tên file:</span>
                    <p className="text-gray-900 break-all">{validation.fileInfo.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Kích thước:</span>
                    <p className="text-gray-900">{validation.fileInfo.sizeFormatted}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Loại file:</span>
                    <p className="text-gray-900">
                      {validation.fileInfo.type || 'Excel Spreadsheet'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Cập nhật cuối:</span>
                    <p className="text-gray-900">{validation.fileInfo.lastModified}</p>
                  </div>
                </div>
              </div>

              {/* Validation Results */}
              {validation.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-red-900 mb-2">❌ Lỗi validation:</h5>
                      <ul className="text-sm text-red-800 space-y-1">
                        {validation.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-yellow-900 mb-2">⚠️ Cảnh báo:</h5>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        {validation.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {validation.isValid && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <p className="text-sm font-medium text-green-900">
                      ✅ File hợp lệ và sẵn sàng để upload!
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Đang upload...</span>
                    <span className="text-gray-700">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-red-900 mb-1">Lỗi upload:</h5>
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={uploading}
        >
          ⬅️ Quay lại
        </Button>
        
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !validation?.isValid || uploading}
          loading={uploading}
          size="lg"
        >
          🚀 Upload & Parse
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;