import { message } from 'antd';
import axios from 'axios';
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { auth, storage } from '../config/firebase';

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

    // Check if user is authenticated - TEMPORARILY SKIP FOR TESTING
    const user = auth.currentUser;
    if (!user) {
        console.log('[Debug] User not authenticated, but proceeding with Firebase upload anyway for testing');
        // message.warning('Đang sử dụng phương thức upload qua server...');
        // uploadFileToBackend({ file, onSuccess, onError, onProgress }, path);
        // return;
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
            uploadedBy: user ? (user.email || user.uid) : 'anonymous',
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

const FileUploadService = {
    uploadFile: uploadFileToFirebase, // Switch back to Firebase with CORS fixed
};

export default FileUploadService;
