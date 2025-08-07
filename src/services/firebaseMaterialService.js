import { deleteObject, getDownloadURL, getMetadata, listAll, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Firebase Material Service for handling course materials with Firebase Storage
 */
class FirebaseMaterialService {

  /**
   * Upload a file to Firebase Storage
   * @param {File} file - The file to upload
   * @param {Object} metadata - Material metadata
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Upload result with download URL
   */
  static async uploadMaterial(file, metadata, onProgress = null) {
    try {
      const { classId, title, description, type, uploadedBy } = metadata;
      
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Create Firebase Storage reference
      const storagePath = `materials/classroom_${classId}/${filename}`;
      const storageRef = ref(storage, storagePath);
      
      console.log('🔄 Uploading to Firebase Storage:', storagePath);
      
      // Add custom metadata
      const fileMetadata = {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          title: title,
          description: description || '',
          type: type || 'document',
          uploadedBy: uploadedBy?.toString() || '1',
          classId: classId?.toString() || '1',
          uploadDate: new Date().toISOString()
        }
      };

      // Upload file to Firebase Storage
      const uploadResult = await uploadBytes(storageRef, file, fileMetadata);
      
      // Get download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      console.log('✅ Firebase upload successful');
      console.log('📍 Download URL:', downloadURL);
      
      // Return material data in the format expected by the frontend
      return {
        id: timestamp, // Use timestamp as ID for Firebase materials
        name: title,
        fileName: file.name,
        fileType: fileExtension.toUpperCase(),
        downloadUrl: downloadURL,
        firebaseRef: storagePath, // Store Firebase path for deletion
        uploadDate: new Date().toISOString(),
        uploadedBy: uploadedBy,
        fileSize: file.size,
        description: description || '',
        type: type || 'document',
        classId: classId,
        isFirebase: true // Flag to identify Firebase materials
      };
      
    } catch (error) {
      console.error('❌ Firebase upload error:', error);
      throw new Error(`Firebase upload failed: ${error.message}`);
    }
  }

  /**
   * Get all materials for a classroom from Firebase Storage
   * @param {number} classId - Classroom ID
   * @returns {Promise<Array>} List of materials
   */
  static async getMaterialsByClassroom(classId) {
    try {
      const folderPath = `materials/classroom_${classId}`;
      const folderRef = ref(storage, folderPath);
      
      console.log('🔄 Fetching Firebase materials from:', folderPath);
      
      // List all items in the folder
      const listResult = await listAll(folderRef);
      
      // Get metadata and download URLs for each file
      const materials = await Promise.all(
        listResult.items.map(async (itemRef) => {
          try {
            // ✅ FIX: Use getMetadata from firebase/storage import
            const metadata = await getMetadata(itemRef);
            const downloadURL = await getDownloadURL(itemRef);
            
            const customMeta = metadata.customMetadata || {};
            
            return {
              id: customMeta.uploadDate ? new Date(customMeta.uploadDate).getTime() : Date.now(),
              name: customMeta.title || customMeta.originalName || itemRef.name,
              fileName: customMeta.originalName || itemRef.name,
              fileType: (customMeta.originalName || itemRef.name).split('.').pop()?.toUpperCase() || 'UNKNOWN',
              downloadUrl: downloadURL,
              firebaseRef: itemRef.fullPath,
              uploadDate: customMeta.uploadDate || metadata.timeCreated,
              uploadedBy: customMeta.uploadedBy || 'Unknown',
              fileSize: metadata.size || 0,
              description: customMeta.description || '',
              type: customMeta.type || 'document',
              classId: parseInt(customMeta.classId) || classId,
              isFirebase: true
            };
          } catch (error) {
            console.warn('Error getting metadata for item:', itemRef.name, error);
            return null;
          }
        })
      );

      // Filter out failed items and sort by upload date
      const validMaterials = materials
        .filter(item => item !== null)
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
      
      console.log('✅ Firebase materials loaded:', validMaterials.length);
      return validMaterials;
      
    } catch (error) {
      console.error('❌ Error fetching Firebase materials:', error);
      // Return empty array instead of throwing to allow graceful fallback
      return [];
    }
  }

  /**
   * Delete a material from Firebase Storage
   * @param {Object} material - Material object with firebaseRef
   * @returns {Promise<void>}
   */
  static async deleteMaterial(material) {
    try {
      if (!material.firebaseRef) {
        throw new Error('No Firebase reference found for this material');
      }
      
      const storageRef = ref(storage, material.firebaseRef);
      await deleteObject(storageRef);
      
      console.log('✅ Firebase material deleted:', material.firebaseRef);
      
    } catch (error) {
      console.error('❌ Firebase delete error:', error);
      throw new Error(`Firebase delete failed: ${error.message}`);
    }
  }

  /**
   * Download a material (Firebase handles this via download URL)
   * @param {Object} material - Material object
   * @returns {Promise<void>}
   */
  static async downloadMaterial(material) {
    try {
      if (!material.downloadUrl) {
        throw new Error('No download URL found for this material');
      }
      
      // Create download link
      const link = document.createElement('a');
      link.href = material.downloadUrl;
      link.download = material.fileName || material.name || 'download';
      link.target = '_blank'; // Open in new tab as backup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Firebase download initiated for:', material.name);
      
    } catch (error) {
      console.error('❌ Firebase download error:', error);
      throw new Error(`Firebase download failed: ${error.message}`);
    }
  }

  /**
   * Get file type icon based on extension
   * @param {string} type - File type or extension
   * @returns {string} Icon emoji
   */
  static getFileTypeIcon(type) {
    const typeMap = {
      'pdf': '📄',
      'doc': '📄',
      'docx': '📄',
      'txt': '📄',
      'ppt': '📊',
      'pptx': '📊',
      'xls': '📊',
      'xlsx': '📊',
      'mp4': '🎥',
      'avi': '🎥',
      'mov': '🎥',
      'mkv': '🎥',
      'mp3': '🎵',
      'wav': '🎵',
      'm4a': '🎵',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'png': '🖼️',
      'gif': '🖼️',
      'zip': '📦',
      'rar': '📦',
      '7z': '📦'
    };
    
    const lowerType = (type || '').toLowerCase();
    return typeMap[lowerType] || '📁';
  }

  /**
   * Check if Firebase is available and configured
   * @returns {boolean}
   */
  static isAvailable() {
    try {
      return !!storage;
    } catch {
      return false;
    }
  }
}

export default FirebaseMaterialService;