import React, { useState } from 'react';
import { Upload, Button, message, Card, Space, Typography, Progress, List } from 'antd';
import { UploadOutlined, FileTextOutlined, DeleteOutlined } from '@ant-design/icons';
import FileUploadService from '../services/fileUploadService';

const { Title, Text } = Typography;

const TestUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (options) => {
    const { file, onSuccess, onError, onProgress } = options;
    
    console.log('[TestUpload] Starting upload for:', file.name);
    setUploading(true);
    
    const customSuccessHandler = (uploadedFileData) => {
      console.log('[TestUpload] Upload success:', uploadedFileData);
      setUploadedFiles(prev => [...prev, uploadedFileData]);
      setUploading(false);
      setUploadProgress(0);
      onSuccess(uploadedFileData, file);
    };

    const customErrorHandler = (error, fallbackData) => {
      console.error('[TestUpload] Upload error:', error);
      setUploading(false);
      setUploadProgress(0);
      if (fallbackData) {
        setUploadedFiles(prev => [...prev, fallbackData]);
        message.warning('Upload failed but file is available locally');
      }
      onError(error);
    };

    const customProgressHandler = (progress) => {
      console.log('[TestUpload] Upload progress:', progress.percent);
      setUploadProgress(progress.percent);
      onProgress(progress);
    };

    FileUploadService.uploadFile({
      file,
      onSuccess: customSuccessHandler,
      onError: customErrorHandler,
      onProgress: customProgressHandler
    }, 'test-uploads');
  };

  const handleRemoveFile = (fileToRemove) => {
    setUploadedFiles(prev => prev.filter(file => file.url !== fileToRemove.url));
  };

  const uploadProps = {
    customRequest: handleFileUpload,
    showUploadList: false,
    multiple: true,
    accept: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.mp4,.avi,.mov,.wmv,.jpg,.jpeg,.png,.gif,.txt'
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>Test File Upload</Title>
      <Text type="secondary">
        This page tests the file upload functionality using Firebase Storage with backend fallback.
      </Text>
      
      <Card title="Upload Files" style={{ marginTop: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Upload Test Files</Text>
            <br />
            <Text type="secondary">
              Supports: PDF, Word, PowerPoint, Excel, ZIP, images, videos, text files
            </Text>
          </div>

          <Upload {...uploadProps}>
            <Button 
              icon={<UploadOutlined />} 
              loading={uploading}
              disabled={uploading}
            >
              {uploading 
                ? `Uploading... ${Math.round(uploadProgress)}%`
                : 'Select Files to Upload'
              }
            </Button>
          </Upload>

          {uploading && (
            <Progress 
              percent={uploadProgress} 
              status="active"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          )}

          {uploadedFiles.length > 0 && (
            <Card title="Uploaded Files" size="small">
              <List
                size="small"
                dataSource={uploadedFiles}
                renderItem={(file, index) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="link" 
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveFile(file)}
                      >
                        Remove
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<FileTextOutlined />}
                      title={file.name}
                      description={
                        <Space>
                          <Text type="secondary">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Text>
                          {file.isLocalFile && (
                            <Text type="warning">(Local file)</Text>
                          )}
                          {file.url && (
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              View/Download
                            </a>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Space>
      </Card>

      <Card title="Debug Information" style={{ marginTop: 24 }}>
        <Space direction="vertical">
          <Text strong>Expected Behavior:</Text>
          <ul>
            <li>If authenticated: Files should upload to Firebase Storage</li>
            <li>If not authenticated or CORS error: Files should fallback to backend API</li>
            <li>Progress should be shown during upload</li>
            <li>Success/error messages should appear</li>
          </ul>
          
          <Text strong>Current State:</Text>
          <ul>
            <li>Frontend: http://localhost:3000</li>
            <li>Backend: http://localhost:8088</li>
            <li>Firebase Storage: mve-1-ad9e3.firebasestorage.app</li>
            <li>Upload Service: FileUploadService with Firebase + Backend fallback</li>
          </ul>
        </Space>
      </Card>
    </div>
  );
};

export default TestUpload;
