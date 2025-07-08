import { message } from 'antd';
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from '../config/firebase';

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
 * This is the CORE upload function using Firebase Storage.
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

    try {
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storagePath = `${path}/${uniqueFileName}`;
        const storageRef = ref(storage, storagePath);

        console.log(`[Debug] Firebase storage path: ${storagePath}`);
        
        const metadata = {
          contentType: file.type,
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
                message.error(`Lỗi tải file lên Firebase: ${error.code}`);
                
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
        message.error('Lỗi không xác định khi bắt đầu tải file.');
        if (onError) {
            onError(setupError, createLocalFileUrl(file));
        }
    }
};

const FileUploadService = {
    uploadFile: uploadFileToFirebase, // Export the function with a clear name
};

export default FileUploadService;
