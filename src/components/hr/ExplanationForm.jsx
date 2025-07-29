import React, { useState, useEffect } from 'react';
import { Form, Input, Upload, Button, Card, message, Space, Tag, Divider, Alert } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { TextArea } = Input;

/**
 * Component form gửi giải trình vi phạm chấm công
 */
const ExplanationForm = ({ violationId, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [violation, setViolation] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Load violation details
  useEffect(() => {
    if (violationId) {
      loadViolationDetails();
    }
  }, [violationId]);

  const loadViolationDetails = async () => {
    try {
      const response = await axios.get(`/api/hr/violations/${violationId}`);
      setViolation(response.data);
    } catch (error) {
      console.error('Error loading violation details:', error);
      message.error('Lỗi khi tải thông tin vi phạm');
    }
  };

  // Handle form submit
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('violationId', violationId);
      formData.append('explanationText', values.explanationText);

      // Add evidence files
      fileList.forEach((file, index) => {
        if (file.originFileObj) {
          formData.append('evidenceFiles', file.originFileObj);
          if (file.description) {
            formData.append('evidenceDescriptions', file.description);
          }
          formData.append('evidenceTypes', file.evidenceType || 'DOCUMENT');
        }
      });

      const response = await axios.post('/api/hr/explanations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      message.success('Gửi giải trình thành công!');
      form.resetFields();
      setFileList([]);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Error submitting explanation:', error);
      message.error('Lỗi khi gửi giải trình: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileChange = ({ fileList: newFileList }) => {
    // Validate file size and type
    const validFiles = newFileList.filter(file => {
      if (file.size && file.size > 2 * 1024 * 1024) {
        message.error(`File ${file.name} vượt quá 2MB`);
        return false;
      }
      
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (file.type && !allowedTypes.includes(file.type)) {
        message.error(`File ${file.name} không đúng định dạng cho phép`);
        return false;
      }
      
      return true;
    });

    // Check total size
    const totalSize = validFiles.reduce((sum, file) => sum + (file.size || 0), 0);
    if (totalSize > 5 * 1024 * 1024) {
      message.error('Tổng dung lượng file không được vượt quá 5MB');
      return;
    }

    setFileList(validFiles);
  };

  // Handle file description change
  const handleFileDescriptionChange = (index, description) => {
    const newFileList = [...fileList];
    newFileList[index] = {
      ...newFileList[index],
      description: description
    };
    setFileList(newFileList);
  };

  // Handle evidence type change
  const handleEvidenceTypeChange = (index, evidenceType) => {
    const newFileList = [...fileList];
    newFileList[index] = {
      ...newFileList[index],
      evidenceType: evidenceType
    };
    setFileList(newFileList);
  };

  // Get violation type description
  const getViolationTypeDescription = (type) => {
    const descriptions = {
      'LATE_ARRIVAL': 'Đi trễ',
      'EARLY_DEPARTURE': 'Về sớm',
      'MISSING_CHECK_IN': 'Thiếu chấm công vào',
      'MISSING_CHECK_OUT': 'Thiếu chấm công ra',
      'ABSENT_WITHOUT_LEAVE': 'Vắng không phép'
    };
    return descriptions[type] || type;
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    const colors = {
      'MINOR': 'blue',
      'MODERATE': 'orange',
      'MAJOR': 'red',
      'CRITICAL': 'purple'
    };
    return colors[severity] || 'default';
  };

  const uploadProps = {
    multiple: true,
    fileList: fileList,
    onChange: handleFileChange,
    beforeUpload: () => false, // Prevent auto upload
    accept: '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt'
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Card title="Gửi giải trình vi phạm chấm công">
        {violation && (
          <Card 
            type="inner" 
            title="Thông tin vi phạm"
            style={{ marginBottom: 24 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p><strong>Ngày vi phạm:</strong> {moment(violation.violationDate).format('DD/MM/YYYY')}</p>
                <p><strong>Loại vi phạm:</strong> {getViolationTypeDescription(violation.violationType)}</p>
                <p><strong>Độ nghiêm trọng:</strong> 
                  <Tag color={getSeverityColor(violation.severity)} style={{ marginLeft: 8 }}>
                    {violation.severity}
                  </Tag>
                </p>
              </div>
              <div>
                <p><strong>Thời gian dự kiến:</strong> {violation.expectedTime}</p>
                <p><strong>Thời gian thực tế:</strong> {violation.actualTime || 'Không có'}</p>
                <p><strong>Chênh lệch:</strong> {violation.deviationMinutes} phút</p>
              </div>
            </div>
            <Divider />
            <p><strong>Mô tả hệ thống:</strong> {violation.systemDescription}</p>
          </Card>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="explanationText"
            label="Lý do giải trình"
            rules={[
              { required: true, message: 'Vui lòng nhập lý do giải trình' },
              { min: 10, message: 'Lý do giải trình phải có ít nhất 10 ký tự' },
              { max: 2000, message: 'Lý do giải trình không được vượt quá 2000 ký tự' }
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Vui lòng mô tả chi tiết lý do dẫn đến vi phạm chấm công..."
              showCount
              maxLength={2000}
            />
          </Form.Item>

          <Form.Item label="File bằng chứng (tùy chọn)">
            <Alert
              message="Hướng dẫn tải file"
              description={
                <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                  <li>Định dạng cho phép: JPG, PNG, GIF, PDF, DOC, DOCX, TXT</li>
                  <li>Kích thước tối đa mỗi file: 2MB</li>
                  <li>Tổng dung lượng tất cả file: 5MB</li>
                  <li>Có thể tải lên nhiều file cùng lúc</li>
                </ul>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>
                Chọn file bằng chứng
              </Button>
            </Upload>

            {fileList.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>Danh sách file đã chọn:</h4>
                {fileList.map((file, index) => (
                  <Card 
                    key={index}
                    size="small"
                    style={{ marginBottom: 8 }}
                    actions={[
                      <Button 
                        type="link" 
                        icon={<EyeOutlined />}
                        onClick={() => {
                          // Preview file logic
                          message.info('Tính năng xem trước đang phát triển');
                        }}
                      >
                        Xem trước
                      </Button>,
                      <Button 
                        type="link" 
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          const newFileList = fileList.filter((_, i) => i !== index);
                          setFileList(newFileList);
                        }}
                      >
                        Xóa
                      </Button>
                    ]}
                  >
                    <div>
                      <p><strong>Tên file:</strong> {file.name}</p>
                      <p><strong>Kích thước:</strong> {(file.size / 1024).toFixed(1)} KB</p>
                      
                      <Input
                        placeholder="Mô tả file bằng chứng (tùy chọn)"
                        value={file.description || ''}
                        onChange={(e) => handleFileDescriptionChange(index, e.target.value)}
                        style={{ marginTop: 8 }}
                      />
                    </div>
                  </Card>
                ))}
                
                <p style={{ marginTop: 8, color: '#666' }}>
                  Tổng dung lượng: {(fileList.reduce((sum, file) => sum + (file.size || 0), 0) / 1024).toFixed(1)} KB / 5120 KB
                </p>
              </div>
            )}
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
              >
                Gửi giải trình
              </Button>
              <Button 
                onClick={onCancel}
                size="large"
              >
                Hủy bỏ
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ExplanationForm;
