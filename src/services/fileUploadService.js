import { message } from 'antd';
import axios from 'axios';
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { auth, storage } from '../config/firebase';
import apiClient from './apiClient';

/**
 * Unified File Upload Service
 * Combines Firebase Storage, Backend API, and utility functions
 */

/**
 * Creates a temporary local URL for a file.
 * Useful as a fallback or for previews.
 * @param {File} file - The file object.
 * @returns {Object} - An object representing the local file.
 */
const createLocalFileUrl = (file) => {
    const localUrl = URL.createObjectURL(file);
    console.log(`[Debug] Created local blob URL: ${localUrl}`);
    return {
        name: file.name,
        url: localUrl,
        type: file.type,
        size: file.size,
        isLocalFile: true
    };
};

/**
 * Upload file to backend API (as fallback for CORS issues)
 */
const uploadFileToBackend = async ({ file, onSuccess, onError, onProgress }, path = 'uploads') => {
    console.log(`[Debug] uploadFileToBackend: Starting upload for "${file.name}" to folder "${path}".`);

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', path);

        const response = await axios.post('http://localhost:8088/api/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.lengthComputable) {
                    const progress = (progressEvent.loaded / progressEvent.total) * 100;
                    console.log(`[Debug] Upload progress: ${progress.toFixed(2)}%`);
                    if (onProgress) {
                        onProgress({ percent: progress });
                    }
                }
            }
        });

        if (response.data && response.data.url) {
            console.log(`[Debug] File uploaded successfully: ${response.data.url}`);
            
            const uploadedFileData = {
                name: file.name,
                url: response.data.url,
                type: file.type,
                size: file.size,
                isLocalFile: false,
            };

            message.success(`Tải file "${file.name}" thành công!`);
            if (onSuccess) {
                onSuccess(uploadedFileData, file);
            }
        } else {
            throw new Error('Server không trả về URL file');
        }
    } catch (error) {
        console.error('[Debug] Backend upload error:', error);
        
        let errorMessage = 'Lỗi không xác định khi tải file';
        if (error.response) {
            errorMessage = `Lỗi server: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`;
        } else if (error.request) {
            errorMessage = 'Không thể kết nối tới server';
        } else {
            errorMessage = error.message;
        }
        
        message.error(`Lỗi tải file: ${errorMessage}`);
        
        const localFile = createLocalFileUrl(file);
        if (onError) {
            onError(error, localFile);
        }
    }
};

/**
 * This is the CORE upload function using Firebase Storage with CORS fallback.
 * It is designed to be called by Ant Design's Upload component's `customRequest`.
 * @param {Object} options - The options object from Ant Design's customRequest.
 * @param {File} options.file - The file to upload.
 * @param {Function} options.onSuccess - Callback on successful upload.
 * @param {Function} options.onError - Callback on upload error.
 * @param {Function} options.onProgress - Callback for upload progress.
 * @param {string} path - The destination path in Firebase Storage (e.g., 'lectures/course-123').
 */
const uploadFileToFirebase = ({ file, onSuccess, onError, onProgress }, path) => {
    // Check if the file object is valid
    if (!file || typeof file.name === 'undefined') {
        console.error('[Debug] uploadFileToFirebase: Invalid file object received.', file);
        message.error('Lỗi: File không hợp lệ để tải lên.');
        if (onError) {
            onError(new Error("Invalid file object provided."));
        }
        return;
    }

    console.log(`[Debug] uploadFileToFirebase: Starting upload for "${file.name}" to path "${path}".`);

    // Check if user is authenticated
    const user = auth.currentUser;
    if (!user) {
        console.log('[Debug] User not authenticated, falling back to backend upload');
        message.warning('Đang sử dụng phương thức upload qua server...');
        uploadFileToBackend({ file, onSuccess, onError, onProgress }, path);
        return;
    }

    console.log('[Debug] User authenticated, proceeding with Firebase upload');

    try {
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storagePath = `${path}/${uniqueFileName}`;
        const storageRef = ref(storage, storagePath);

        console.log(`[Debug] Firebase storage path: ${storagePath}`);
        
        const metadata = {
            contentType: file.type,
            customMetadata: {
                uploadedBy: user.email || user.uid,
                uploadTimestamp: new Date().toISOString(),
                originalFileName: file.name
            }
        };

        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`[Debug] Upload progress: ${progress.toFixed(2)}%`);
                if (onProgress) {
                    onProgress({ percent: progress });
                }
            },
            (error) => {
                console.error('[Debug] Firebase upload error:', error);
                
                // Enhanced error detection for CORS and other issues
                const isCorsError = error.message.includes('CORS') || 
                                  error.message.includes('cors') ||
                                  error.message.includes('Access-Control-Allow-Origin') ||
                                  error.code === 'storage/unauthorized' ||
                                  error.code === 'storage/unknown';
                
                if (isCorsError) {
                    console.log('[Debug] CORS/Network error detected, falling back to backend upload');
                    message.warning('Đang chuyển sang phương thức upload khác...');
                    uploadFileToBackend({ file, onSuccess, onError, onProgress }, path);
                    return;
                }
                
                message.error(`Lỗi tải file lên Firebase: ${error.code || error.message}`);
                const localFile = createLocalFileUrl(file);
                if (onError) {
                    onError(error, localFile);
                }
            },
            async () => {
                try {
                    console.log('[Debug] Upload complete. Getting download URL...');
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log(`[Debug] File available at: ${downloadURL}`);
                    
                    const uploadedFileData = {
                        name: file.name,
                        url: downloadURL,
                        type: file.type,
                        size: file.size,
                        isLocalFile: false,
                    };

                    message.success(`Tải file "${file.name}" thành công!`);
                    if (onSuccess) {
                        onSuccess(uploadedFileData, file);
                    }
                } catch (getUrlError) {
                    console.error('[Debug] Error getting download URL:', getUrlError);
                    message.error('Lỗi lấy URL file sau khi tải lên.');
                    if (onError) {
                        onError(getUrlError, createLocalFileUrl(file));
                    }
                }
            }
        );
    } catch (setupError) {
        console.error('[Debug] Error setting up upload task:', setupError);
        
        // Fallback to backend upload if setup fails
        console.log('[Debug] Setup error, falling back to backend upload');
        uploadFileToBackend({ file, onSuccess, onError, onProgress }, path);
    }
};

/**
 * Helper function for file size formatting
 */
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Unified File Upload Service
 */
const FileUploadService = {
    // Main upload function (Firebase with fallback)
    uploadFile: uploadFileToFirebase,

    // Direct backend upload
    uploadFileToBackend,

    // Create local file URL for preview
    createLocalFileUrl,

    // API-based file operations using apiClient
    api: {
        /**
         * Upload single file via API
         */
        uploadFile: async (formData, options = {}) => {
            const response = await apiClient.post('/api/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                ...options
            });
            return response.data;
        },

        /**
         * Upload multiple files via API
         */
        uploadMultipleFiles: async (formData, options = {}) => {
            const response = await apiClient.post('/api/files/upload-multiple', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                ...options
            });
            return response.data;
        },

        /**
         * Download file
         */
        downloadFile: async (fileId) => {
            const response = await apiClient.get(`/api/files/download/${fileId}`, {
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Get filename from response headers
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'download';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            return response.data;
        },

        /**
         * Get file info
         */
        getFileInfo: async (fileId) => {
            const response = await apiClient.get(`/api/files/${fileId}`);
            return response.data;
        },

        /**
         * Delete file
         */
        deleteFile: async (fileId) => {
            const response = await apiClient.delete(`/api/files/${fileId}`);
            return response.data;
        },

        /**
         * Get files by category
         */
        getFilesByCategory: async (category) => {
            const response = await apiClient.get(`/api/files/category/${category}`);
            return response.data;
        },

        /**
         * Get my files
         */
        getMyFiles: async () => {
            const response = await apiClient.get('/api/files/my-files');
            return response.data;
        },

        /**
         * Search files with filters
         */
        searchFiles: async (params = {}) => {
            const response = await apiClient.get('/api/files/search', { params });
            return response.data;
        },

        /**
         * Get security report for file
         */
        getSecurityReport: async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await apiClient.post('/api/files/security-report', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            return response.data;
        },

        /**
         * Get storage statistics
         */
        getStorageStatistics: async () => {
            const response = await apiClient.get('/api/files/statistics');
            return response.data;
        },

        /**
         * Cleanup old files (Admin only)
         */
        cleanupOldFiles: async (daysOld = 30) => {
            const response = await apiClient.post('/api/files/cleanup', null, {
                params: { daysOld }
            });
            return response.data;
        }
    },

    // Utility functions
    utils: {
        /**
         * Get file URL for serving
         */
        getFileUrl: (category, filename) => {
            return `/api/files/serve/${category}/${filename}`;
        },

        /**
         * Validate file before upload
         */
        validateFile: (file, category = 'document') => {
            const errors = [];

            // File size limits by category
            const sizeLimits = {
                image: 5 * 1024 * 1024,      // 5MB
                document: 10 * 1024 * 1024,  // 10MB
                video: 100 * 1024 * 1024,    // 100MB
                audio: 20 * 1024 * 1024,     // 20MB
                archive: 50 * 1024 * 1024    // 50MB
            };

            // Allowed extensions by category
            const allowedExtensions = {
                image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
                document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
                video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
                audio: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
                archive: ['zip', 'rar', '7z', 'tar', 'gz']
            };

            // Check file size
            const maxSize = sizeLimits[category] || sizeLimits.document;
            if (file.size > maxSize) {
                errors.push(`File quá lớn. Kích thước tối đa: ${formatFileSize(maxSize)}`);
            }

            // Check file extension
            const extension = file.name.split('.').pop().toLowerCase();
            const allowed = allowedExtensions[category] || allowedExtensions.document;
            if (!allowed.includes(extension)) {
                errors.push(`Định dạng file không được hỗ trợ: .${extension}`);
            }

            // Check filename length
            if (file.name.length > 255) {
                errors.push('Tên file quá dài (tối đa 255 ký tự)');
            }

            // Check for dangerous patterns
            const dangerousPatterns = [
                /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|sh)$/i,
                /\.php/i,
                /\.jsp/i,
                /\.asp/i
            ];

            if (dangerousPatterns.some(pattern => pattern.test(file.name))) {
                errors.push('File có định dạng nguy hiểm không được phép');
            }

            return {
                valid: errors.length === 0,
                errors
            };
        },

        /**
         * Format file size
         */
        formatFileSize,

        /**
         * Get file type from extension
         */
        getFileType: (filename) => {
            const extension = filename.split('.').pop().toLowerCase();
            
            if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
                return 'image';
            }
            if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(extension)) {
                return 'document';
            }
            if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) {
                return 'video';
            }
            if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(extension)) {
                return 'audio';
            }
            if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
                return 'archive';
            }
            
            return 'document';
        },

        /**
         * Check if file is image
         */
        isImage: (file) => {
            return file.type && file.type.startsWith('image/');
        },

        /**
         * Check if file is video
         */
        isVideo: (file) => {
            return file.type && file.type.startsWith('video/');
        },

        /**
         * Check if file is audio
         */
        isAudio: (file) => {
            return file.type && file.type.startsWith('audio/');
        },

        /**
         * Generate thumbnail URL
         */
        getThumbnailUrl: (file, size = '150x150') => {
            if (file.thumbnails && file.thumbnails.length > 0) {
                const thumbnail = file.thumbnails.find(t => t.includes(size));
                return thumbnail ? `/api/files/serve/thumbnails/${thumbnail}` : null;
            }
            return null;
        },

        /**
         * Create file preview URL
         */
        createPreviewUrl: (file) => {
            if (file.isPublic) {
                return `/api/files/serve/${file.category}/${file.filename}`;
            }
            return null;
        }
    },

    /**
     * Batch upload files
     */
    batchUpload: async (files, category, onProgress) => {
        const results = [];
        const total = files.length;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', category);
            
            try {
                const result = await FileUploadService.api.uploadFile(formData);
                results.push({ success: true, file, result: result.data });
                
                if (onProgress) {
                    onProgress({
                        completed: i + 1,
                        total,
                        percent: Math.round(((i + 1) / total) * 100),
                        currentFile: file.name
                    });
                }
            } catch (error) {
                results.push({ success: false, file, error });
                
                if (onProgress) {
                    onProgress({
                        completed: i + 1,
                        total,
                        percent: Math.round(((i + 1) / total) * 100),
                        currentFile: file.name,
                        error: error.message
                    });
                }
            }
        }
        
        return results;
    }
};

export default FileUploadService;