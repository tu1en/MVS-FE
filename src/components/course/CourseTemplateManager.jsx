import React, { useState, useEffect, useCallback } from 'react';
import courseService from '../../services/courseService';
import classManagementService from '../../services/classManagementService';
import { 
  formatDate, 
  getStatusBadge, 
  showNotification, 
  showConfirmDialog,
  downloadFile,
  debounce 
} from '../../utils/courseManagementUtils';

const CourseTemplateManager = ({ 
  onCreateClass, 
  onImportTemplate, 
  onViewTemplate 
}) => {
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
      const queryParams = {
        page: params.page || state.pagination.current,
        size: params.size || state.pagination.pageSize,
        search: params.search || state.filters.search,
        subject: params.subject || state.filters.subject,
        status: params.status || state.filters.status
      };

      // Remove empty parameters
      Object.keys(queryParams).forEach(key => {
        if (!queryParams[key] && queryParams[key] !== 0) {
          delete queryParams[key];
        }
      });

      const response = await courseService.getAllTemplates(queryParams);
      const data = response.data;

      setState(prev => ({
        ...prev,
        templates: Array.isArray(data) ? data : data.content || [],
        pagination: {
          current: (data.number || 0) + 1,
          pageSize: data.size || prev.pagination.pageSize,
          total: data.totalElements || (Array.isArray(data) ? data.length : 0)
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
            placeholder="🔍 Tìm kiếm khóa học..."
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
          <option value="Lập trình">Lập trình</option>
          <option value="Thiết kế">Thiết kế</option>
          <option value="Marketing">Marketing</option>
          <option value="Khoa học dữ liệu">Khoa học dữ liệu</option>
          <option value="Kinh doanh">Kinh doanh</option>
        </select>

        <select
          value={state.filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="draft">Nháp</option>
          <option value="pending">Chờ duyệt</option>
        </select>

        <button
          onClick={onImportTemplate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
        >
          <span className="mr-2">⬆️</span>
          Import Excel
        </button>
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
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khóa học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Môn học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thống kê
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {state.templates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {template.name}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate mb-1">
                        {template.description}
                      </div>
                      <div className="text-xs text-gray-400">
                        Tạo: {formatDate(template.createdAt)} • {template.createdBy || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {template.subject || 'Chưa phân loại'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="space-y-1">
                      <div>
                        <span className="font-medium">{template.totalWeeks || 0}</span> tuần • 
                        <span className="font-medium ml-1">{template.lessonCount || 0}</span> bài
                      </div>
                      <div className="text-xs text-gray-500">
                        {state.classes.filter(c => c.courseTemplateId === template.id).length} lớp đã tạo
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const statusConfig = getStatusBadge(template.status);
                      return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onCreateClass(template)}
                        className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors"
                        title="Tạo lớp học từ template này"
                      >
                        <span className="mr-1">➕</span>
                        Tạo lớp
                      </button>
                      <button
                        onClick={() => onViewTemplate(template)}
                        className="inline-flex items-center px-3 py-1 border border-green-300 rounded-md text-green-600 hover:bg-green-50 hover:border-green-400 transition-colors"
                        title="Xem chi tiết template"
                      >
                        <span className="mr-1">👁️</span>
                        Xem
                      </button>
                      <button
                        onClick={() => handleExport(template)}
                        disabled={state.loading.export}
                        className="inline-flex items-center px-3 py-1 border border-purple-300 rounded-md text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Export template ra Excel"
                      >
                        <span className="mr-1">
                          {state.loading.export ? '⏳' : '⬇️'}
                        </span>
                        Export
                      </button>
                      <button
                        onClick={() => handleDelete(template)}
                        className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors"
                        title="Xóa template"
                      >
                        <span className="mr-1">🗑️</span>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {state.pagination.total > state.pagination.pageSize && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
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
            Quản lý Templates Khóa học
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
};

export default CourseTemplateManager;