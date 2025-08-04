import { useState, useCallback } from 'react';
import { useNotification } from './useNotification';
import syllabusApi from '../services/syllabusApi';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const { showError } = useNotification();

  const uploadFile = useCallback(async (file) => {
    setUploading(true);
    setError(null);
    setProgress(0);
    setParsedData(null);

    try {
      // Validate file
      if (!file) {
        throw new Error('Vui lòng chọn file để upload');
      }

      const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File phải là định dạng Excel (.xlsx, .xls)');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File không được vượt quá 5MB');
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await syllabusApi.importExcel(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      setParsedData(result);

      return result;

    } catch (err) {
      setError(err.message);
      showError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [showError]);

  const saveImportedData = useCallback(async (data) => {
    setUploading(true);
    setError(null);

    try {
      const result = await syllabusApi.saveImported(data);
      setParsedData(null);
      return result;
    } catch (err) {
      setError(err.message);
      showError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [showError]);

  const resetUpload = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setParsedData(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    parsedData,
    uploadFile,
    saveImportedData,
    resetUpload,
  };
};

export default useFileUpload;