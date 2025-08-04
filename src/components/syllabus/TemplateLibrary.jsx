// src/components/syllabus/TemplateLibrary.jsx
import {
  Archive,
  BookOpen,
  Calendar,
  Edit,
  Eye,
  Grid,
  List,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { useSyllabusApi } from '../../hooks/useSyllabusApi';
import { ErrorMessage, LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';

const TemplateCard = ({ template, onView, onEdit, onDelete, onUpdateStatus }) => {
  const [showActions, setShowActions] = useState(false);

  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-800',
    DRAFT: 'bg-yellow-100 text-yellow-800',
    ARCHIVED: 'bg-gray-100 text-gray-800',
  };

  const statusLabels = {
    ACTIVE: 'Đang sử dụng',
    DRAFT: 'Bản nháp',
    ARCHIVED: 'Đã lưu trữ',
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {template.courseName} - Lớp {template.grade}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              📅 {template.academicYear} • 📚 {template.totalTopics} chủ đề
            </p>
          </div>
          
          <div className="relative ml-2">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => { onView(template); setShowActions(false); }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Eye className="w-4 h-4 mr-3" />
                    Xem chi tiết
                  </button>
                  <button
                    onClick={() => { onEdit(template); setShowActions(false); }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 mr-3" />
                    Chỉnh sửa
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => { 
                      onUpdateStatus(template.id, template.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE'); 
                      setShowActions(false); 
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Archive className="w-4 h-4 mr-3" />
                    {template.status === 'ACTIVE' ? 'Lưu trữ' : 'Kích hoạt'}
                  </button>
                  <button
                    onClick={() => { onDelete(template); setShowActions(false); }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Xóa template
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[template.status]}`}>
              {statusLabels[template.status]}
            </span>
            <span className="text-xs text-gray-500">
              ID: {template.code || template.id}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              <span>{template.totalWeeks} tuần</span>
            </div>
            <div className="flex items-center text-gray-600">
              <BookOpen className="w-4 h-4 mr-2 text-green-500" />
              <span>{template.totalTopics} chủ đề</span>
            </div>
          </div>

          {/* Created Date */}
          <div className="text-xs text-gray-500 border-t pt-3">
            Tạo: {new Date(template.createdDate).toLocaleDateString('vi-VN')} bởi {template.createdBy}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(template)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-1" />
              Xem
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(template)}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-1" />
              Sửa
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TemplateLibrary = ({ onCreateNew, onTemplateSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { getTemplates, deleteTemplate, updateTemplateStatus, error } = useSyllabusApi();
  const { showSuccess, showError } = useNotification();

  // Load templates
  const loadTemplates = async (searchFilters = {}) => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 12,
        search: searchTerm,
        status: selectedStatus,
        subject: selectedSubject,
        ...searchFilters,
      };

      const response = await getTemplates(params);
      setTemplates(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadTemplates();
  }, [page, selectedStatus, selectedSubject]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page === 0) {
        loadTemplates();
      } else {
        setPage(0);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Get unique subjects for filter
  const uniqueSubjects = useMemo(() => {
    const subjects = templates.map(t => t.courseName).filter(Boolean);
    return [...new Set(subjects)];
  }, [templates]);

  // Handle template actions
  const handleView = (template) => {
    onTemplateSelect?.(template, 'view');
  };

  const handleEdit = (template) => {
    onTemplateSelect?.(template, 'edit');
  };

  const handleDelete = async (template) => {
    if (window.confirm(`Bạn có chắc muốn xóa template "${template.courseName}"?`)) {
      try {
        await deleteTemplate(template.id);
        showSuccess('Template đã được xóa thành công!');
        loadTemplates();
      } catch (error) {
        showError('Không thể xóa template. Vui lòng thử lại.');
      }
    }
  };

  const handleUpdateStatus = async (templateId, newStatus) => {
    try {
      await updateTemplateStatus(templateId, newStatus);
      showSuccess('Trạng thái template đã được cập nhật!');
      loadTemplates();
    } catch (error) {
      showError('Không thể cập nhật trạng thái. Vui lòng thử lại.');
    }
  };

  const handleRefresh = () => {
    loadTemplates();
  };

  if (error && !loading) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={handleRefresh}
        className="max-w-2xl mx-auto mt-8"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📚 Thư viện Template</h2>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý các template kế hoạch dạy học
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo mới
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo tên môn học, lớp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang sử dụng</option>
              <option value="DRAFT">Bản nháp</option>
              <option value="ARCHIVED">Đã lưu trữ</option>
            </select>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả môn học</option>
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            {/* View Mode */}
            <div className="flex items-center space-x-1 border border-gray-300 rounded-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid/List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có template nào
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedStatus || selectedSubject
                ? 'Không tìm thấy template phù hợp với bộ lọc.'
                : 'Tạo template đầu tiên để bắt đầu quản lý kế hoạch dạy học.'
              }
            </p>
            {!searchTerm && !selectedStatus && !selectedSubject && (
              <Button onClick={onCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo template đầu tiên
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Trước
              </Button>
              
              <span className="text-sm text-gray-600">
                Trang {page + 1} / {totalPages}
              </span>
              
              <Button
                variant="outline"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TemplateLibrary;