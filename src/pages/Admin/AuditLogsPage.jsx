import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE } from '../../constants/constants';
import adminService from '../../services/adminService';
import { exportAuditLogsToCSV, exportStatisticsToCSV, exportToJSON } from '../../utils/exportUtils';

const AuditLogsPage = () => {
    const navigate = useNavigate();
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLog, setSelectedLog] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    // Pagination and filtering states
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    
    // Filter states
    const [filters, setFilters] = useState({
        searchTerm: '',
        action: '',
        category: '',
        severity: '',
        success: '',
        startDate: '',
        endDate: ''
    });
    
    // Statistics
    const [statistics, setStatistics] = useState(null);

    // Check authentication
    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== ROLE.ADMIN) {
            navigate('/');
            return;
        }
        
        fetchAuditLogs();
        fetchStatistics();
    }, [navigate, currentPage, pageSize, filters]);

    const fetchAuditLogs = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = {
                page: currentPage,
                size: pageSize,
                sortBy: 'timestamp',
                sortDir: 'desc',
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== '')
                )
            };
            
            const response = await adminService.getAuditLogs(params);
            
            if (response.data) {
                setAuditLogs(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
                setTotalElements(response.data.totalElements || 0);
            }
        } catch (err) {
            console.error('Error fetching audit logs:', err);
            setError('Không thể tải dữ liệu audit logs. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await adminService.getAuditStatistics(7);
            setStatistics(response.data);
        } catch (err) {
            console.error('Error fetching statistics:', err);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setCurrentPage(0); // Reset to first page when filtering
    };

    const handleClearFilters = () => {
        setFilters({
            searchTerm: '',
            action: '',
            category: '',
            severity: '',
            success: '',
            startDate: '',
            endDate: ''
        });
        setCurrentPage(0);
    };

    const handleViewDetail = async (logId) => {
        try {
            const response = await adminService.getAuditLogById(logId);
            setSelectedLog(response.data);
            setShowModal(true);
        } catch (err) {
            console.error('Error fetching log detail:', err);
            setError('Không thể tải chi tiết log.');
        }
    };

    const handleExportCSV = () => {
        if (auditLogs.length === 0) {
            setError('Không có dữ liệu để xuất.');
            return;
        }
        
        const filename = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        exportAuditLogsToCSV(auditLogs, filename);
    };

    const handleExportJSON = () => {
        if (auditLogs.length === 0) {
            setError('Không có dữ liệu để xuất.');
            return;
        }
        
        const filename = `audit_logs_${new Date().toISOString().split('T')[0]}.json`;
        exportToJSON(auditLogs, filename);
    };

    const handleExportStatistics = () => {
        if (!statistics) {
            setError('Không có thống kê để xuất.');
            return;
        }
        
        const filename = `audit_statistics_${new Date().toISOString().split('T')[0]}.csv`;
        exportStatisticsToCSV(statistics, filename);
    };

    const handleExportAll = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch all audit logs without pagination
            const params = {
                page: 0,
                size: 10000, // Large number to get all records
                sortBy: 'timestamp',
                sortDir: 'desc',
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== '')
                )
            };
            
            const response = await adminService.getAuditLogs(params);
            const allLogs = response.data.content || [];
            
            if (allLogs.length === 0) {
                setError('Không có dữ liệu để xuất.');
                return;
            }
            
            const filename = `all_audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
            exportAuditLogsToCSV(allLogs, filename);
        } catch (err) {
            console.error('Error exporting all logs:', err);
            setError('Không thể xuất tất cả dữ liệu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        const colors = {
            'LOW': 'text-blue-600 bg-blue-100',
            'MEDIUM': 'text-yellow-600 bg-yellow-100',
            'HIGH': 'text-orange-600 bg-orange-100',
            'CRITICAL': 'text-red-600 bg-red-100',
            'INFO': 'text-gray-600 bg-gray-100',
            'WARNING': 'text-yellow-600 bg-yellow-100',
            'ERROR': 'text-red-600 bg-red-100'
        };
        return colors[severity] || 'text-gray-600 bg-gray-100';
    };

    const getActionColor = (action) => {
        const colors = {
            'LOGIN': 'text-green-600 bg-green-100',
            'LOGOUT': 'text-blue-600 bg-blue-100',
            'LOGIN_FAILED': 'text-red-600 bg-red-100',
            'CREATE': 'text-green-600 bg-green-100',
            'UPDATE': 'text-yellow-600 bg-yellow-100',
            'DELETE': 'text-red-600 bg-red-100',
            'READ': 'text-blue-600 bg-blue-100'
        };
        return colors[action] || 'text-gray-600 bg-gray-100';
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return '';
        return new Date(dateTime).toLocaleString('vi-VN');
    };

    if (loading && auditLogs.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="text-gray-600 mt-1">Quản lý và theo dõi hoạt động hệ thống</p>
                </div>
                <div className="flex gap-3">
                    {/* Export Dropdown */}
                    <div className="relative group">
                        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            Xuất dữ liệu
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            <div className="py-1">
                                <button
                                    onClick={handleExportCSV}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Xuất trang hiện tại (CSV)
                                </button>
                                <button
                                    onClick={handleExportJSON}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Xuất trang hiện tại (JSON)
                                </button>
                                <button
                                    onClick={handleExportAll}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Xuất tất cả (CSV)
                                </button>
                                <hr className="my-1" />
                                <button
                                    onClick={handleExportStatistics}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Xuất thống kê (CSV)
                                </button>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/admin')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        ← Quay lại Dashboard
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Tổng số logs</h3>
                        <p className="text-2xl font-bold text-blue-600">{statistics.totalLogs || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Thành công</h3>
                        <p className="text-2xl font-bold text-green-600">{statistics.successfulLogs || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Thất bại</h3>
                        <p className="text-2xl font-bold text-red-600">{statistics.failedLogs || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Người dùng duy nhất</h3>
                        <p className="text-2xl font-bold text-purple-600">{statistics.uniqueUsers || 0}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold mb-4">Bộ lọc</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                        <input
                            type="text"
                            value={filters.searchTerm}
                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                            placeholder="Tìm kiếm trong mô tả, user..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hành động</label>
                        <select
                            value={filters.action}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tất cả</option>
                            <option value="LOGIN">Đăng nhập</option>
                            <option value="LOGOUT">Đăng xuất</option>
                            <option value="LOGIN_FAILED">Đăng nhập thất bại</option>
                            <option value="CREATE">Tạo mới</option>
                            <option value="UPDATE">Cập nhật</option>
                            <option value="DELETE">Xóa</option>
                            <option value="READ">Đọc</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ</label>
                        <select
                            value={filters.severity}
                            onChange={(e) => handleFilterChange('severity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tất cả</option>
                            <option value="INFO">Thông tin</option>
                            <option value="WARNING">Cảnh báo</option>
                            <option value="ERROR">Lỗi</option>
                            <option value="CRITICAL">Nghiêm trọng</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                        <select
                            value={filters.success}
                            onChange={(e) => handleFilterChange('success', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tất cả</option>
                            <option value="true">Thành công</option>
                            <option value="false">Thất bại</option>
                        </select>
                    </div>
                </div>
                
                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleClearFilters}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Audit Logs Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thời gian
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Người dùng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hành động
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mức độ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mô tả
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
                            {auditLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDateTime(log.timestamp)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {log.username || 'Anonymous'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(log.severity)}`}>
                                            {log.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                        {log.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            log.success ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                                        }`}>
                                            {log.success ? 'Thành công' : 'Thất bại'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleViewDetail(log.id)}
                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                        >
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                            disabled={currentPage >= totalPages - 1}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Hiển thị <span className="font-medium">{currentPage * pageSize + 1}</span> đến{' '}
                                <span className="font-medium">
                                    {Math.min((currentPage + 1) * pageSize, totalElements)}
                                </span>{' '}
                                trong <span className="font-medium">{totalElements}</span> kết quả
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                    disabled={currentPage === 0}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Trước
                                </button>
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    Trang {currentPage + 1} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                    disabled={currentPage >= totalPages - 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Sau
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showModal && selectedLog && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Chi tiết Audit Log</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">ID</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedLog.id}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Thời gian</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatDateTime(selectedLog.timestamp)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Người dùng</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedLog.username || 'Anonymous'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">IP Address</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedLog.ipAddress || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Hành động</label>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(selectedLog.action)}`}>
                                            {selectedLog.action}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Mức độ</label>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(selectedLog.severity)}`}>
                                            {selectedLog.severity}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            selectedLog.success ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                                        }`}>
                                            {selectedLog.success ? 'Thành công' : 'Thất bại'}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Thời gian thực hiện</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedLog.executionTimeMs ? `${selectedLog.executionTimeMs}ms` : 'N/A'}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedLog.description}</p>
                                </div>
                                
                                {selectedLog.errorMessage && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Thông điệp lỗi</label>
                                        <p className="mt-1 text-sm text-red-600">{selectedLog.errorMessage}</p>
                                    </div>
                                )}
                                
                                {selectedLog.requestUrl && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">URL Request</label>
                                        <p className="mt-1 text-sm text-gray-900 break-all">{selectedLog.requestUrl}</p>
                                    </div>
                                )}
                                
                                {selectedLog.userAgent && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">User Agent</label>
                                        <p className="mt-1 text-sm text-gray-900 break-all">{selectedLog.userAgent}</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogsPage;