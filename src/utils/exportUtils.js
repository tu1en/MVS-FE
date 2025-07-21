/**
 * Utility functions for exporting data to various formats
 */

// Function to convert data to CSV format
export const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
        // Header row
        headers.join(','),
        // Data rows
        ...data.map(row => 
            headers.map(header => {
                let value = row[header];
                
                // Handle null/undefined values
                if (value === null || value === undefined) {
                    value = '';
                }
                
                // Handle objects (convert to JSON string)
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                
                // Handle strings with commas, quotes, or newlines
                if (typeof value === 'string') {
                    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                        value = `"${value.replace(/"/g, '""')}"`;
                    }
                }
                
                return value;
            }).join(',')
        )
    ].join('\n');

    // Create and download file
    downloadFile(csvContent, filename || 'export.csv', 'text/csv;charset=utf-8;');
};

// Function to export audit logs to CSV with proper formatting
export const exportAuditLogsToCSV = (auditLogs, filename = 'audit_logs.csv') => {
    if (!auditLogs || auditLogs.length === 0) {
        console.warn('No audit logs to export');
        return;
    }

    // Format audit logs for CSV export
    const formattedLogs = auditLogs.map(log => ({
        'ID': log.id,
        'Thời gian': formatDateTime(log.timestamp),
        'Người dùng': log.username || 'Anonymous',
        'Hành động': log.action,
        'Danh mục': log.category,
        'Mức độ': log.severity,
        'Mô tả': log.description,
        'Trạng thái': log.success ? 'Thành công' : 'Thất bại',
        'IP Address': log.ipAddress || '',
        'User Agent': log.userAgent || '',
        'Request URL': log.requestUrl || '',
        'Request Method': log.requestMethod || '',
        'Thời gian thực hiện (ms)': log.executionTimeMs || '',
        'Entity Type': log.entityType || '',
        'Entity ID': log.entityId || '',
        'Entity Name': log.entityName || '',
        'Session ID': log.sessionId || '',
        'Module': log.module || '',
        'Thông điệp lỗi': log.errorMessage || ''
    }));

    exportToCSV(formattedLogs, filename);
};

// Function to export data in JSON format
export const exportToJSON = (data, filename) => {
    if (!data) {
        console.warn('No data to export');
        return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, filename || 'export.json', 'application/json;charset=utf-8;');
};

// Function to create Excel-compatible CSV (with BOM for UTF-8)
export const exportToExcelCSV = (data, filename) => {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content with BOM for Excel UTF-8 support
    const BOM = '\uFEFF';
    const csvContent = BOM + [
        // Header row
        headers.join(','),
        // Data rows
        ...data.map(row => 
            headers.map(header => {
                let value = row[header];
                
                // Handle null/undefined values
                if (value === null || value === undefined) {
                    value = '';
                }
                
                // Handle objects (convert to JSON string)
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                
                // Handle strings with commas, quotes, or newlines
                if (typeof value === 'string') {
                    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                        value = `"${value.replace(/"/g, '""')}"`;
                    }
                }
                
                return value;
            }).join(',')
        )
    ].join('\n');

    // Create and download file
    downloadFile(csvContent, filename || 'export.csv', 'text/csv;charset=utf-8;');
};

// Helper function to download file
const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
};

// Helper function to format date time for export
const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Export statistics to CSV
export const exportStatisticsToCSV = (statistics, filename = 'audit_statistics.csv') => {
    if (!statistics) {
        console.warn('No statistics to export');
        return;
    }

    const statsData = [
        { 'Metric': 'Tổng số logs', 'Value': statistics.totalLogs || 0 },
        { 'Metric': 'Logs thành công', 'Value': statistics.successfulLogs || 0 },
        { 'Metric': 'Logs thất bại', 'Value': statistics.failedLogs || 0 },
        { 'Metric': 'Người dùng duy nhất', 'Value': statistics.uniqueUsers || 0 },
        { 'Metric': 'IP duy nhất', 'Value': statistics.uniqueIPs || 0 }
    ];

    // Add action counts if available
    if (statistics.actionCounts) {
        Object.entries(statistics.actionCounts).forEach(([action, count]) => {
            statsData.push({ 'Metric': `Actions: ${action}`, 'Value': count });
        });
    }

    // Add category counts if available
    if (statistics.categoryCounts) {
        Object.entries(statistics.categoryCounts).forEach(([category, count]) => {
            statsData.push({ 'Metric': `Categories: ${category}`, 'Value': count });
        });
    }

    exportToCSV(statsData, filename);
};

export default {
    exportToCSV,
    exportToJSON,
    exportToExcelCSV,
    exportAuditLogsToCSV,
    exportStatisticsToCSV
};