import React, { useState, useEffect } from 'react';
import {
  Upload,
  List,
  Button,
  message,
  Modal,
  Progress,
  Typography,
  Space,
  Tooltip,
  Badge,
  Card,
  Divider,
  Empty,
  Popconfirm,
  Tag,
  Row,
  Col,
  Spin
} from 'antd';
import {
  InboxOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileImageOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepForwardOutlined,
  StepBackwardOutlined,
  FullscreenOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import axios from 'axios';

const { Dragger } = Upload;
const { Text, Title } = Typography;

/**
 * Document Sharing Panel - Quản lý tài liệu trong live session
 * Hỗ trợ upload, download, preview, presentation control
 */
const DocumentSharingPanel = ({ 
  roomId, 
  userRole, 
  documents = [], 
  currentDocument, 
  onDocumentChange 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [documentList, setDocumentList] = useState(documents);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPresenting, setIsPresenting] = useState(false);

  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    'application/msword',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  useEffect(() => {
    setDocumentList(documents);
  }, [documents]);

  useEffect(() => {
    if (currentDocument) {
      setSelectedDocument(currentDocument);
      setCurrentPage(currentDocument.currentPage || 1);
      setTotalPages(currentDocument.totalPages || 1);
    }
  }, [currentDocument]);

  /**
   * Upload configuration
   */
  const uploadProps = {
    name: 'file',
    multiple: false,
    action: `/api/documents/slots/${roomId}/upload`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    beforeUpload: (file) => {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        message.error(`File type không được hỗ trợ: ${file.type}`);
        return false;
      }

      // Validate file size
      if (file.size > maxFileSize) {
        message.error('File size không được vượt quá 10MB');
        return false;
      }

      return true;
    },
    onChange: (info) => {
      const { status } = info.file;
      
      if (status === 'uploading') {
        setUploading(true);
        setUploadProgress(info.file.percent || 0);
      } else if (status === 'done') {
        setUploading(false);
        setUploadProgress(0);
        message.success(`${info.file.name} upload thành công`);
        
        // Refresh document list
        if (onDocumentChange) {
          onDocumentChange();
        }
        
        // Add to local list immediately
        if (info.file.response?.success) {
          const newDoc = info.file.response.document;
          setDocumentList(prev => [newDoc, ...prev]);
        }
        
      } else if (status === 'error') {
        setUploading(false);
        setUploadProgress(0);
        message.error(`${info.file.name} upload thất bại: ${info.file.error?.message || 'Unknown error'}`);
      }
    },
    onProgress: (progressEvent) => {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      setUploadProgress(percent);
    },
    showUploadList: false,
    disabled: userRole === 'STUDENT' // Only teachers can upload
  };

  /**
   * Download document
   */
  const downloadDocument = async (document) => {
    try {
      setLoading(true);
      
      const response = await axios.get(`/api/documents/${document.id}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.originalFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success('Download thành công');
      
    } catch (error) {
      console.error('Download error:', error);
      message.error('Lỗi download file: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete document
   */
  const deleteDocument = async (documentId) => {
    try {
      setLoading(true);
      
      await axios.delete(`/api/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Remove from local list
      setDocumentList(prev => prev.filter(doc => doc.id !== documentId));
      
      message.success('Xóa tài liệu thành công');
      
      if (onDocumentChange) {
        onDocumentChange();
      }
      
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Lỗi xóa tài liệu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Start presentation mode
   */
  const startPresentation = (document) => {
    if (userRole !== 'TEACHER') {
      message.warning('Chỉ giáo viên mới có thể điều khiển presentation');
      return;
    }

    setSelectedDocument(document);
    setPresentationMode(true);
    setIsPresenting(true);
    setCurrentPage(1);
    
    // Notify other participants
    broadcastPresentationControl(document.id, 1, 'START_PRESENTATION');
    
    message.success(`Bắt đầu trình chiếu: ${document.originalFileName}`);
  };

  /**
   * Stop presentation mode
   */
  const stopPresentation = () => {
    setPresentationMode(false);
    setIsPresenting(false);
    
    if (selectedDocument) {
      broadcastPresentationControl(selectedDocument.id, currentPage, 'STOP_PRESENTATION');
    }
    
    message.info('Đã dừng trình chiếu');
  };

  /**
   * Navigate presentation
   */
  const navigatePresentation = (direction) => {
    if (!selectedDocument || userRole !== 'TEACHER') return;

    let newPage = currentPage;
    
    if (direction === 'next' && currentPage < totalPages) {
      newPage = currentPage + 1;
    } else if (direction === 'prev' && currentPage > 1) {
      newPage = currentPage - 1;
    }
    
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      broadcastPresentationControl(selectedDocument.id, newPage, `NAVIGATE_${direction.toUpperCase()}`);
    }
  };

  /**
   * Broadcast presentation control to other participants
   */
  const broadcastPresentationControl = async (documentId, page, action) => {
    try {
      await axios.post(`/api/documents/${documentId}/presentation/navigate`, null, {
        params: {
          currentPage: page,
          action: action
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error broadcasting presentation control:', error);
    }
  };

  /**
   * Get file icon based on MIME type
   */
  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return <FilePdfOutlined style={{ color: '#f5222d' }} />;
    if (mimeType?.includes('word') || mimeType?.includes('document')) return <FileWordOutlined style={{ color: '#1890ff' }} />;
    if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint')) return <FilePptOutlined style={{ color: '#fa8c16' }} />;
    if (mimeType?.includes('image')) return <FileImageOutlined style={{ color: '#52c41a' }} />;
    return <FileTextOutlined />;
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Format upload time
   */
  const formatUploadTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true, 
      locale: vi 
    });
  };

  /**
   * Check if file is presentation
   */
  const isPresentationFile = (mimeType) => {
    return mimeType?.includes('presentation') || mimeType?.includes('powerpoint');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0',
        background: '#fafafa'
      }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>Tài liệu ({documentList.length})</Text>
          {isPresenting && (
            <Badge status="processing" text="Đang trình chiếu" />
          )}
        </Space>
      </div>

      {/* Upload Area - Only for Teachers */}
      {userRole !== 'STUDENT' && (
        <div style={{ padding: '16px' }}>
          <Dragger {...uploadProps} style={{ marginBottom: '16px' }}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click hoặc kéo file vào đây để upload
            </p>
            <p className="ant-upload-hint">
              Hỗ trợ: PDF, Word, PowerPoint, Image (Max 10MB)
            </p>
          </Dragger>
          
          {uploading && (
            <Progress 
              percent={uploadProgress} 
              status="active"
              showInfo={true}
              format={(percent) => `${percent}%`}
            />
          )}
        </div>
      )}

      {/* Document List */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '0 16px 16px'
      }}>
        {documentList.length === 0 ? (
          <Empty 
            description="Chưa có tài liệu nào"
            style={{ marginTop: '40px' }}
          />
        ) : (
          <List
            dataSource={documentList}
            split={false}
            renderItem={(document) => (
              <Card
                size="small"
                style={{ 
                  marginBottom: '8px',
                  border: selectedDocument?.id === document.id ? '2px solid #1890ff' : '1px solid #f0f0f0'
                }}
                styles={{
                  body: { padding: '12px' }
                }}
              >
                <Row gutter={[8, 8]} align="middle">
                  <Col flex="auto">
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {getFileIcon(document.mimeType)}
                        <Text 
                          strong 
                          style={{ 
                            marginLeft: '8px',
                            fontSize: '13px',
                            wordBreak: 'break-word'
                          }}
                          title={document.originalFileName}
                        >
                          {document.originalFileName.length > 25 
                            ? `${document.originalFileName.substring(0, 25)}...`
                            : document.originalFileName
                          }
                        </Text>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {formatFileSize(document.fileSize)}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          <UserOutlined style={{ marginRight: '2px' }} />
                          {document.uploadedBy}
                        </Text>
                      </div>
                      
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        <ClockCircleOutlined style={{ marginRight: '2px' }} />
                        {formatUploadTime(document.uploadedAt)}
                      </Text>
                      
                      {document.isPresentation && (
                        <Tag color="blue" size="small">Presentation</Tag>
                      )}
                    </Space>
                  </Col>
                  
                  <Col>
                    <Space direction="vertical" size="small">
                      <Tooltip title="Download">
                        <Button
                          type="text"
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => downloadDocument(document)}
                          loading={loading}
                        />
                      </Tooltip>
                      
                      {isPresentationFile(document.mimeType) && userRole === 'TEACHER' && (
                        <Tooltip title={isPresenting ? "Dừng trình chiếu" : "Bắt đầu trình chiếu"}>
                          <Button
                            type={selectedDocument?.id === document.id && isPresenting ? "primary" : "text"}
                            size="small"
                            icon={isPresenting && selectedDocument?.id === document.id ? 
                              <PauseCircleOutlined /> : <PlayCircleOutlined />
                            }
                            onClick={() => {
                              if (isPresenting && selectedDocument?.id === document.id) {
                                stopPresentation();
                              } else {
                                startPresentation(document);
                              }
                            }}
                          />
                        </Tooltip>
                      )}
                      
                      {userRole !== 'STUDENT' && (
                        <Popconfirm
                          title="Bạn có chắc chắn muốn xóa tài liệu này?"
                          onConfirm={() => deleteDocument(document.id)}
                          okText="Có"
                          cancelText="Không"
                        >
                          <Tooltip title="Xóa">
                            <Button
                              type="text"
                              size="small"
                              icon={<DeleteOutlined />}
                              danger
                            />
                          </Tooltip>
                        </Popconfirm>
                      )}
                    </Space>
                  </Col>
                </Row>
              </Card>
            )}
          />
        )}
      </div>

      {/* Presentation Controls */}
      {presentationMode && selectedDocument && userRole === 'TEACHER' && (
        <div style={{ 
          padding: '12px 16px',
          borderTop: '1px solid #f0f0f0',
          background: '#fafafa'
        }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text strong style={{ fontSize: '12px' }}>
              {selectedDocument.originalFileName}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {currentPage} / {totalPages}
            </Text>
          </Space>
          
          <Divider style={{ margin: '8px 0' }} />
          
          <Row gutter={8}>
            <Col span={6}>
              <Button
                size="small"
                icon={<StepBackwardOutlined />}
                onClick={() => navigatePresentation('prev')}
                disabled={currentPage <= 1}
                block
              />
            </Col>
            <Col span={6}>
              <Button
                size="small"
                icon={<StepForwardOutlined />}
                onClick={() => navigatePresentation('next')}
                disabled={currentPage >= totalPages}
                block
              />
            </Col>
            <Col span={6}>
              <Button
                size="small"
                icon={<FullscreenOutlined />}
                onClick={() => setPreviewVisible(true)}
                block
              />
            </Col>
            <Col span={6}>
              <Button
                size="small"
                danger
                onClick={stopPresentation}
                block
              >
                Dừng
              </Button>
            </Col>
          </Row>
        </div>
      )}

      {/* Document Preview Modal */}
      <Modal
        title={`Preview: ${selectedDocument?.originalFileName || ''}`}
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        styles={{
          body: { height: '80vh', padding: 0 }
        }}
      >
        {selectedDocument && (
          <div style={{ 
            width: '100%', 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5'
          }}>
            {selectedDocument.mimeType?.includes('image') ? (
              <img 
                src={`/api/documents/${selectedDocument.id}/download`}
                alt={selectedDocument.originalFileName}
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <div style={{ 
                textAlign: 'center',
                color: '#999'
              }}>
                <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <br />
                Preview không khả dụng cho file này
                <br />
                <Button 
                  type="primary"
                  onClick={() => downloadDocument(selectedDocument)}
                  style={{ marginTop: '16px' }}
                >
                  Download để xem
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentSharingPanel;