import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook for document synchronization
 * Handles document listing, current document state, and navigation sync
 */
export const useDocumentSync = (roomId) => {
  const [documents, setDocuments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch documents for the room
   */
  const fetchDocuments = useCallback(async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/documents/slots/${roomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data) {
        setDocuments(response.data);
        
        // Find current presentation document
        const currentPresentation = response.data.find(doc => 
          doc.isPresentation && doc.lastPresentationControlAt
        );
        
        if (currentPresentation) {
          setCurrentDocument(currentPresentation);
          setCurrentPage(currentPresentation.currentPage || 1);
        }
      }

    } catch (error) {
      console.error('Error fetching documents:', error);
      setError(error.response?.data?.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  /**
   * Refresh documents list
   */
  const refreshDocuments = useCallback(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  /**
   * Sync document navigation from WebSocket message
   */
  const syncDocumentNavigation = useCallback((navigationData) => {
    try {
      const { documentId, currentPage: newPage, action, controlledBy } = navigationData;
      
      // Update current document if it matches
      if (currentDocument && currentDocument.id === documentId) {
        setCurrentPage(newPage);
        
        // Update the document in the list
        setDocuments(prevDocs => 
          prevDocs.map(doc => 
            doc.id === documentId 
              ? { 
                  ...doc, 
                  currentPage: newPage,
                  lastPresentationControlBy: controlledBy,
                  lastPresentationControlAt: new Date().toISOString()
                }
              : doc
          )
        );
        
        // Update current document
        setCurrentDocument(prev => prev ? {
          ...prev,
          currentPage: newPage,
          lastPresentationControlBy: controlledBy,
          lastPresentationControlAt: new Date().toISOString()
        } : null);
      }
      
      console.log(`Document navigation synced: ${action} to page ${newPage} by ${controlledBy}`);
      
    } catch (error) {
      console.error('Error syncing document navigation:', error);
    }
  }, [currentDocument]);

  /**
   * Set current document for presentation
   */
  const setCurrentPresentationDocument = useCallback((document) => {
    setCurrentDocument(document);
    setCurrentPage(document?.currentPage || 1);
  }, []);

  /**
   * Navigate to specific page (for teachers)
   */
  const navigateToPage = useCallback(async (documentId, pageNumber, action = 'NAVIGATE') => {
    try {
      await axios.post(`/api/documents/${documentId}/presentation/navigate`, null, {
        params: {
          currentPage: pageNumber,
          action: action
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Update local state
      setCurrentPage(pageNumber);
      
    } catch (error) {
      console.error('Error navigating presentation:', error);
      throw error;
    }
  }, []);

  /**
   * Get presentation state for a document
   */
  const getPresentationState = useCallback(async (documentId) => {
    try {
      const response = await axios.get(`/api/documents/${documentId}/presentation/state`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return response.data;
      
    } catch (error) {
      console.error('Error getting presentation state:', error);
      throw error;
    }
  }, []);

  /**
   * Upload new document
   */
  const uploadDocument = useCallback(async (file, documentType = 'PRESENTATION', isPresentation = false) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      formData.append('isPresentation', isPresentation);

      const response = await axios.post(`/api/documents/slots/${roomId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        // Add new document to list
        setDocuments(prev => [response.data.document, ...prev]);
        return response.data.document;
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }

    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  /**
   * Delete document
   */
  const deleteDocument = useCallback(async (documentId) => {
    try {
      await axios.delete(`/api/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Remove from local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      // Clear current document if it was deleted
      if (currentDocument && currentDocument.id === documentId) {
        setCurrentDocument(null);
        setCurrentPage(1);
      }

    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }, [currentDocument]);

  /**
   * Listen for document-related WebSocket messages
   */
  useEffect(() => {
    const handleDocumentMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'document-navigation':
          case 'document-sync':
            syncDocumentNavigation(data);
            break;
            
          case 'document-uploaded':
            if (data.slotId === roomId) {
              refreshDocuments();
            }
            break;
            
          case 'document-deleted':
            if (data.slotId === roomId) {
              setDocuments(prev => prev.filter(doc => doc.id !== data.documentId));
              if (currentDocument && currentDocument.id === data.documentId) {
                setCurrentDocument(null);
                setCurrentPage(1);
              }
            }
            break;
            
          default:
            break;
        }
      } catch (error) {
        console.error('Error handling document WebSocket message:', error);
      }
    };

    // Listen for WebSocket messages
    if (typeof window !== 'undefined') {
      window.addEventListener('websocket-message', handleDocumentMessage);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('websocket-message', handleDocumentMessage);
      }
    };
  }, [roomId, syncDocumentNavigation, refreshDocuments, currentDocument]);

  // Fetch documents on mount and when roomId changes
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    currentDocument,
    currentPage,
    loading,
    error,
    
    // Actions
    refreshDocuments,
    syncDocumentNavigation,
    setCurrentPresentationDocument,
    navigateToPage,
    getPresentationState,
    uploadDocument,
    deleteDocument,
    
    // Computed values
    hasDocuments: documents.length > 0,
    presentationDocuments: documents.filter(doc => doc.isPresentation),
    isDocumentActive: (docId) => currentDocument?.id === docId
  };
};