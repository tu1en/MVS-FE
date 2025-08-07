import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import courseService from '../../services/courseService';
import { 
  validateImportForm, 
  parseExcelFile, 
  showNotification, 
  showConfirmDialog,
  formatFileSize,
  getCurrentUserId,
  downloadFile 
} from '../../utils/courseManagementUtils';

const ImportExcelModal = ({ visible, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    courseName: '',
    description: '',
    subject: '',
    section: '',
    file: null,
    preview: [],
    validation: {}
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef(null);

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      validation: { ...prev.validation, [field]: null }
    }));
  };

  // Handle file selection
  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setFormData(prev => ({
        ...prev,
        validation: { ...prev.validation, file: 'File phải có định dạng .xlsx hoặc .xls' }
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setFormData(prev => ({
        ...prev,
        validation: { ...prev.validation, file: 'File không được vượt quá 10MB' }
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      file,
      validation: { ...prev.validation, file: null }
    }));

    // Auto-preview file
    try {
      const previewData = await parseExcelFile(file);
      setFormData(prev => ({
        ...prev,
        preview: previewData
      }));
      setCurrentStep(2);
    } catch (error) {
      console.error('Error parsing file:', error);
      showNotification('Lỗi đọc file: ' + error.message, 'error');
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    const validation = validateImportForm(formData);
    if (Object.keys(validation).length > 0) {
      setFormData(prev => ({ ...prev, validation }));
      showNotification('Vui lòng kiểm tra lại thông tin', 'warning');
      return;
    }

    // Confirm import if preview is available
    if (formData.preview.length > 0) {
      const confirmed = await showConfirmDialog(
        'Xác nhận Import',
        `Bạn sắp import khóa học "${formData.courseName}" với ${formData.preview.length} bài học. Tiếp tục?`
      );
      if (!confirmed) return;
    }

    setLoading(true);
    setCurrentStep(3);

    try {
      // Debug log
      console.log('Starting import with data:', {
        file: formData.file?.name,
        courseName: formData.courseName,
        description: formData.description,
        subject: formData.subject,
        createdBy: getCurrentUserId() || 1
      });

      // Prepare form data
      const uploadData = new FormData();
      uploadData.append('file', formData.file);
      uploadData.append('courseName', formData.courseName);
      uploadData.append('description', formData.description);
      uploadData.append('subject', formData.subject);
      uploadData.append('createdBy', getCurrentUserId() || 1);

      console.log('Form data prepared, calling API...');

      // Submit to API
      const response = await courseService.importFromExcel(uploadData);
      
      console.log('API response received:', response);
      
      showNotification(`Import thành công! Đã tạo khóa học "${formData.courseName}"`, 'success');
      
      // Reset form and close modal
      handleReset();
      onSuccess(response.data);
      
    } catch (error) {
      console.error('Import error:', error);
      showNotification('Lỗi import: ' + (error.response?.data?.message || error.message), 'error');
      setCurrentStep(2); // Go back to preview step
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      courseName: '',
      description: '',
      subject: '',
      section: '',
      file: null,
      preview: [],
      validation: {}
    });
    setCurrentStep(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle cancel
  const handleCancel = () => {
    handleReset();
    onCancel();
  };

  // Handle download template
  const handleDownloadTemplate = () => {
    try {
      showNotification('Đang tạo template mẫu...', 'info');
      
      // Create sample Excel template data
      const templateData = [
        ['Tuần', 'Chủ đề bài học', 'Loại bài học', 'Thời lượng (phút)', 'Mô tả', 'Tài liệu'],
        [1, 'Giới thiệu khóa học', 'Lý thuyết', 60, 'Tổng quan về khóa học và mục tiêu học tập', 'slide01.pdf'],
        [1, 'Cài đặt môi trường', 'Thực hành', 90, 'Hướng dẫn cài đặt các công cụ cần thiết', 'setup_guide.pdf'],
        [2, 'Khái niệm cơ bản', 'Lý thuyết', 75, 'Học các khái niệm nền tảng', 'concept.pdf'],
        [2, 'Bài tập thực hành đầu tiên', 'Thực hành', 120, 'Thực hành với các ví dụ đơn giản', 'exercise01.pdf'],
        [3, 'Chủ đề nâng cao', 'Lý thuyết', 90, 'Tìm hiểu các chủ đề phức tạp hơn', 'advanced.pdf'],
        [3, 'Dự án nhỏ', 'Dự án', 180, 'Làm dự án nhỏ để áp dụng kiến thức', 'project01.pdf']
      ];

      // Create Excel workbook using xlsx library
      const worksheet = XLSX.utils.aoa_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Course Template');

      // Generate Excel file blob
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      downloadFile(blob, 'course_template_sample.xlsx');
      showNotification('Đã tải template Excel mẫu thành công!', 'success');
    } catch (error) {
      console.error('Download template error:', error);
      showNotification('Lỗi tạo template: ' + error.message, 'error');
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">📊</span>
              Advanced Excel Import
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 text-sm">
              {[
                { step: 1, label: 'Thông tin & File', icon: '📝' },
                { step: 2, label: 'Preview & Xác nhận', icon: '👁️' },
                { step: 3, label: 'Đang xử lý', icon: '⚙️' }
              ].map((item, index) => (
                <React.Fragment key={item.step}>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      currentStep >= item.step 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {currentStep > item.step ? '✓' : item.step}
                    </div>
                    <span className={`ml-2 ${currentStep >= item.step ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                      {item.icon} {item.label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`flex-1 h-px ${currentStep > item.step ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step 1: Basic Info & File Upload */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Course Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📚</span>
                  Thông tin khóa học
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên khóa học <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.courseName}
                      onChange={(e) => handleFieldChange('courseName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formData.validation.courseName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Ví dụ: Lập trình Java Spring Boot"
                    />
                    {formData.validation.courseName && (
                      <p className="mt-1 text-sm text-red-600">{formData.validation.courseName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => handleFieldChange('subject', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn môn học</option>
                      <option value="Lập trình">Lập trình</option>
                      <option value="Thiết kế">Thiết kế</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Khoa học dữ liệu">Khoa học dữ liệu</option>
                      <option value="Kinh doanh">Kinh doanh</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lớp/Section</label>
                    <input
                      type="text"
                      value={formData.section}
                      onChange={(e) => handleFieldChange('section', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ví dụ: SE1801, IT001..."
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả khóa học</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mô tả ngắn gọn về nội dung khóa học, mục tiêu học tập..."
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📎</span>
                  File Excel Template
                </h4>
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    formData.validation.file ? 'border-red-300 bg-red-50' : 
                    formData.file ? 'border-green-300 bg-green-50' : 
                    'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  
                  {formData.file ? (
                    <div className="space-y-3">
                      <div className="text-4xl">✅</div>
                      <div>
                        <p className="font-medium text-green-800">{formData.file.name}</p>
                        <p className="text-sm text-green-600">{formatFileSize(formData.file.size)}</p>
                        <p className="text-xs text-gray-500 mt-2">Click để chọn file khác</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-4xl">📊</div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">Kéo thả file Excel vào đây</p>
                        <p className="text-gray-600">hoặc click để chọn file</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Hỗ trợ .xlsx, .xls (tối đa 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {formData.validation.file && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {formData.validation.file}
                  </p>
                )}
              </div>

              {/* Template Download Link */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-blue-600 mr-3 text-xl">💡</span>
                  <div>
                    <h5 className="font-medium text-blue-900 mb-1">Chưa có template?</h5>
                    <p className="text-sm text-blue-700 mb-2">
                      Tải xuống template mẫu để tạo file Excel đúng định dạng
                    </p>
                    <button 
                      type="button"
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      onClick={handleDownloadTemplate}
                    >
                      📥 Tải Template Mẫu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {currentStep === 2 && formData.preview.length > 0 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-green-600 text-xl mr-2">✅</span>
                  <h4 className="font-medium text-green-900">File đã được đọc thành công!</h4>
                </div>
                <p className="text-sm text-green-700">
                  Tìm thấy <strong>{formData.preview.length}</strong> bài học trong file Excel
                </p>
              </div>

              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <h4 className="font-medium text-gray-900">Preview nội dung khóa học</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Tuần</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Chủ đề</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Loại</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Thời lượng</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.preview.slice(0, 5).map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 font-medium">{row.week}</td>
                          <td className="px-4 py-2">{row.topic}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              row.type === 'Thực hành' ? 'bg-blue-100 text-blue-800' :
                              row.type === 'Lý thuyết' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {row.type}
                            </span>
                          </td>
                          <td className="px-4 py-2">{row.duration} phút</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {formData.preview.length > 5 && (
                    <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-600 border-t">
                      ... và {formData.preview.length - 5} bài học khác
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  ← Quay lại chỉnh sửa
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Xác nhận Import →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {currentStep === 3 && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Đang xử lý file Excel...</h4>
              <p className="text-gray-600">
                Vui lòng đợi trong khi hệ thống import khóa học "{formData.courseName}"
              </p>
            </div>
          )}

          {/* Action Buttons for Step 1 */}
          {currentStep === 1 && (
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.file || !formData.courseName.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp tục →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExcelModal;