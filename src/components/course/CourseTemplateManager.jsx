import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import classManagementService from '../../services/classManagementService';
import courseService from '../../services/courseService';
import {
  debounce,
  downloadFile,
  getStatusBadge,
  showConfirmDialog,
  showNotification
} from '../../utils/courseManagementUtils';
import CourseDescription from './CourseDescription';

const CourseTemplateManager = forwardRef(({ 
  onCreateClass, 
  onImportTemplate, 
  onViewTemplate 
}, ref) => {
  const [state, setState] = useState({
    templates: [],
    classes: [],
    loading: {
      templates: false,
      export: false
    },
    errors: {},
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    filters: {
      search: '',
      subject: '',
      status: ''
    }
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      loadTemplates({ 
        ...state.filters, 
        search: searchTerm, 
        page: 1 
      });
    }, 500),
    [state.filters]
  );

  // Load templates with filters and pagination
  const loadTemplates = useCallback(async (params = {}) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, templates: true },
      errors: { ...prev.errors, templates: null }
    }));

    try {
      // Thu thập params hiện tại
      const currentPage = params.page || state.pagination.current;
      const pageSize = params.size || state.pagination.pageSize;
      const search = (params.search ?? state.filters.search ?? '').toString().trim().toLowerCase();
      const subject = params.subject ?? state.filters.subject ?? '';
      const status = params.status ?? state.filters.status ?? '';

      // Backend hiện trả toàn bộ danh sách (không hỗ trợ filter). Lọc & phân trang ở FE.
      const response = await courseService.getAllTemplates({});
      const raw = response.data;
      const list = Array.isArray(raw) ? raw : (raw.data || raw.content || []);

      // Lọc theo search/subject/status ở FE
      const filtered = list.filter((t) => {
        const name = (t.name || '').toString().toLowerCase();
        const subj = (t.subject || '').toString().toLowerCase();
        const stt = (t.status || '').toString().toLowerCase();
        const matchSearch = !search || name.includes(search) || subj.includes(search);
        const matchSubject = !subject || t.subject === subject;
        const matchStatus = !status || stt === status.toLowerCase();
        return matchSearch && matchSubject && matchStatus;
      });

      const total = filtered.length;
      const start = (currentPage - 1) * pageSize;
      const pageItems = filtered.slice(start, start + pageSize);

      // Debug logging
      console.log('CourseTemplateManager - total templates:', list.length, 'filtered:', total);

      setState(prev => ({
        ...prev,
        templates: pageItems,
        pagination: {
          current: currentPage,
          pageSize,
          total
        },
        loading: { ...prev.loading, templates: false }
      }));
    } catch (error) {
      console.error('Error loading templates:', error);
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, templates: error.message },
        loading: { ...prev.loading, templates: false }
      }));
      showNotification('Lỗi tải dữ liệu: ' + error.message, 'error');
    }
  }, [state.pagination.current, state.pagination.pageSize, state.filters]);

  // Load classes for statistics
  const loadClasses = useCallback(async () => {
    try {
      const response = await classManagementService.getAllClasses();
      setState(prev => ({
        ...prev,
        classes: Array.isArray(response.data) ? response.data : response.data.content || []
      }));
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  }, []);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...state.filters, [filterType]: value };
    setState(prev => ({
      ...prev,
      filters: newFilters,
      pagination: { ...prev.pagination, current: 1 }
    }));

    if (filterType === 'search') {
      debouncedSearch(value);
    } else {
      loadTemplates({ ...newFilters, page: 1 });
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, current: page }
    }));
    loadTemplates({ page });
  };

  // Handle export
  const handleExport = async (template) => {
    setState(prev => ({ 
      ...prev, 
      loading: { ...prev.loading, export: true } 
    }));

    try {
      const blob = await courseService.exportTemplate(template.id);
      downloadFile(blob, `${template.name}.xlsx`);
      showNotification('Export thành công!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showNotification('Lỗi export: ' + error.message, 'error');
    } finally {
      setState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, export: false } 
      }));
    }
  };

  // Handle delete template
  const handleDelete = async (template) => {
    const confirmed = await showConfirmDialog(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa template "${template.name}"? Hành động này không thể hoàn tác.`
    );

    if (!confirmed) return;

    try {
      await courseService.deleteTemplate(template.id);
      showNotification('Xóa template thành công!', 'success');
      loadTemplates();
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Lỗi xóa template: ' + error.message, 'error');
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    refreshTemplates: () => {
      loadTemplates();
      loadClasses();
    }
  }));

  // Initial load
  useEffect(() => {
    loadTemplates();
    loadClasses();
  }, []);

  // Render filter section
  const renderFilters = () => (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={state.filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
        </div>
        
        <select
          value={state.filters.subject}
          onChange={(e) => handleFilterChange('subject', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tất cả môn học</option>
          <option value="Toán">Toán</option>
          <option value="Vật lý">Vật lý</option>
          <option value="Hóa học">Hóa học</option>
          <option value="Ngữ văn">Ngữ văn</option>
          <option value="Tiếng Anh">Tiếng Anh</option>
          <option value="Sinh học">Sinh học</option>
        </select>

        {/* <select
          value={state.filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="draft">Nháp</option>
          <option value="pending">Chờ duyệt</option>
        </select> */}

        <div className="flex space-x-2">
          <button
            onClick={() => loadTemplates()}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
            title="Làm mới danh sách templates"
          >
            <span className="mr-2">🔄</span>
            Làm mới
          </button>
          <button
            onClick={onImportTemplate}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
          >
            <span className="mr-2">⬆️</span>
            Import Excel
          </button>
        </div>
      </div>
    </div>
  );

  // Render templates table
  const renderTemplatesTable = () => {
    if (state.loading.templates) {
      return (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      );
    }

    if (state.errors.templates) {
      return (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">❌</div>
            <p className="text-red-600 mb-4">{state.errors.templates}</p>
            <button
              onClick={() => loadTemplates()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      );
    }

    if (state.templates.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-4">📚</div>
            <p className="text-gray-600 mb-4">
              {state.filters.search || state.filters.subject || state.filters.status 
                ? 'Không tìm thấy template nào phù hợp với bộ lọc' 
                : 'Chưa có template nào. Hãy import từ Excel để bắt đầu!'}
            </p>
            {(!state.filters.search && !state.filters.subject && !state.filters.status) && (
              <button
                onClick={onImportTemplate}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Import Template đầu tiên
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6">
        {state.templates.map((template) => (
          <div key={template.id} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-6">
              {/* Header Section */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                    <span className="mr-2 text-2xl">
                      {template.subject === 'Computer Science' && '💻'}
                      {template.subject === 'Web Development' && '🌐'}
                      {template.subject === 'Database Technology' && '🗄️'}
                      {template.subject === 'Mobile Development' && '📱'}
                      {template.subject?.includes('Data') && '🧠'}
                    </span>
                    {template.name}
                  </div>
                  
                  {/* Price and Stats Row */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {template.enrollmentFee && (
                      <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                        💰 {new Intl.NumberFormat('vi-VN').format(template.enrollmentFee)} VNĐ
                      </span>
                    )}
                    <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      📅 {template.totalWeeks || 0} tuần
                    </span>
                    <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                      📚 {template.lessonCount || 0} bài học
                    </span>
                    <span className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full">
                      👥 Tối đa {template.maxStudentsPerTemplate || '40'} học viên
                    </span>
                  </div>
                </div>
                
                <div className="ml-4 flex flex-col items-end">
                  {(() => {
                    const statusConfig = getStatusBadge(template.status);
                    return (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text} mb-2`}>
                        {statusConfig.label}
                      </span>
                    );
                  })()}
                  <span className="text-xs text-gray-500">
                    {state.classes.filter(c => c.courseTemplateId === template.id).length} lớp đã tạo
                  </span>
                </div>
              </div>

              {/* Course Description */}
              <div className="mb-4">
                <CourseDescription 
                  description={template.description} 
                  courseId={template.id} 
                />
              </div>

              {/* Subject */}
              <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    📂 {template.subject || 'Chưa phân loại'}
                  </span>
                </div>
                {/* ĐÃ LOẠI BỎ: công khai/học phí ở Templates. Việc công khai và giá sẽ quản lý tại tab Lớp học. */}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onCreateClass(template)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  title="Tạo lớp học từ template này"
                >
                  <span className="mr-2">➕</span>
                  Tạo lớp học
                </button>
                <button
                  onClick={() => onViewTemplate(template)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  title="Xem chi tiết template"
                >
                  <span className="mr-2">👁️</span>
                  Xem chi tiết
                </button>
                {/* <button
                  onClick={() => handleExport(template)}
                  disabled={state.loading.export}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Export template ra Excel"
                >
                  <span className="mr-2">
                    {state.loading.export ? '⏳' : '⬇️'}
                  </span>
                  Export Excel
                </button> */}
                <button
                  onClick={() => handleDelete(template)}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  title="Xóa template"
                >
                  <span className="mr-2">🗑️</span>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Pagination */}
        {state.pagination.total > state.pagination.pageSize && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {((state.pagination.current - 1) * state.pagination.pageSize) + 1} đến{' '}
                {Math.min(state.pagination.current * state.pagination.pageSize, state.pagination.total)} trong{' '}
                {state.pagination.total} kết quả
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(state.pagination.current - 1)}
                  disabled={state.pagination.current <= 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ← Trước
                </button>
                <span className="px-3 py-1 text-sm font-medium">
                  {state.pagination.current} / {Math.ceil(state.pagination.total / state.pagination.pageSize)}
                </span>
                <button
                  onClick={() => handlePageChange(state.pagination.current + 1)}
                  disabled={state.pagination.current >= Math.ceil(state.pagination.total / state.pagination.pageSize)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Khóa học
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý templates, tạo lớp học và theo dõi thống kê
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Tổng: {state.pagination.total} templates
        </div>
      </div>

      {renderFilters()}
      {renderTemplatesTable()}
    </div>
  );
});

export default CourseTemplateManager;