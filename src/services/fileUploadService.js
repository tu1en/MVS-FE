import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import axios from 'axios';

/**
 * Service for file upload operations
 */
class FileUploadService {
  /**
   * Upload a file to Firebase Storage
   * 
   * @param {File} file The file to upload
   * @param {string} folder The folder to store the file in
   * @returns {Promise<string>} The URL of the uploaded file
   */
  static async uploadFile(file, folder = 'uploads') {
    const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:8088';
    
    try {
      console.log(`Starting file upload: ${file.name}, size: ${file.size}, type: ${file.type}`);
      
      // For small images, convert to base64 and use uploadString
      if (file.type.startsWith('image/') && file.size < 1024 * 1024) {
        try {
          console.log("Using base64 upload for small image");
          return await this.uploadBase64(file, folder);
        } catch (base64Error) {
          console.error("Base64 upload failed:", base64Error);
          // Fall through to other methods
        }
      }
      
      // Method 1: Upload directly to Firebase Storage (frontend)
      try {
        console.log("Attempting direct Firebase Storage upload...");
        const timestamp = new Date().getTime();
        const uniqueFilename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const fullPath = `${folder}/${uniqueFilename}`;
        
        console.log(`Uploading to path: ${fullPath}`);
        const storageRef = ref(storage, fullPath);
        
        const metadata = {
          contentType: file.type,
          customMetadata: {
            'uploaded-by': 'teacher-form',
            'original-filename': file.name
          }
        };
        
        const uploadResult = await uploadBytes(storageRef, file, metadata);
        console.log("Upload successful, getting download URL...", uploadResult);
        
        const downloadURL = await getDownloadURL(uploadResult.ref);
        console.log(`Download URL obtained: ${downloadURL}`);
        
        return downloadURL;
      } catch (firebaseError) {
        console.error("Firebase direct upload failed:", firebaseError);
        console.log("Falling back to backend API upload...");
        
        // Method 2: Upload through backend API (only as fallback)
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        
        console.log(`Uploading via backend API: ${baseUrl}/api/files/upload`);
        
        const response = await axios({
          method: 'post',
          url: `${baseUrl}/api/files/upload`,
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: false
        });
        
        console.log("Backend API upload response:", response.data);
        return response.data.url;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
  
  /**
   * Upload a small image as base64 string
   * @param {File} file Image file to upload
   * @param {string} folder Destination folder
   * @returns {Promise<string>} Download URL
   */
  static async uploadBase64(file, folder) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const base64String = e.target.result;
          console.log(`Base64 conversion complete. Length: ${base64String.length}`);
          
          const timestamp = new Date().getTime();
          const uniqueFilename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
          const fullPath = `${folder}/${uniqueFilename}`;
          
          const storageRef = ref(storage, fullPath);
          
          // Upload as base64 data URL
          const result = await uploadString(storageRef, base64String, 'data_url');
          console.log("Base64 upload successful:", result);
          
          const downloadURL = await getDownloadURL(result.ref);
          console.log("Base64 download URL:", downloadURL);
          
          resolve(downloadURL);
        } catch (error) {
          console.error("Error in base64 upload:", error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error);
      };
      
      reader.readAsDataURL(file);
    });
  }
}

export default FileUploadService; 