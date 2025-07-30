import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Tag, Card, message, Divider, Image, Typography } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined, FileOutlined, DownloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

/**
 * Component xem xét giải trình vi phạm cho Manager
 */
const ExplanationReview = () => {
  const [explanations, setExplanations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState({
    visible: false,
    explanation: null,
    action: null
  });
  const [evidenceModal, setEvidenceModal] = useState({
    visible: false,
    files: []
  });
  const [form] = Form.useForm();

  // Load pending explanations
  useEffect(() => {
    loadPendingExplanations();
  }, []);

  const loadPendingExplanations = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/hr/explanations/pending-review');
      setExplanations(response.data.content);
    } catch (error) {
      console.error('Error loading explanations:', error);
      message.error('Lỗi khi tải danh sách giải trình');
    } finally {
      setLoading(false);
    }
  };

  // Handle review action
  const handleReviewAction = (explanation, action) => {
    setReviewModal({
      visible: true,
      explanation: explanation,
      action: action
    });
    form.resetFields();
  };

  // Submit review
  const handleSubmitReview = async (values) => {
    try {
      const { explanation, action } = reviewModal;
      const endpoint = `/api/hr/explanations/${explanation.id}/${action}`;
      
      await axios.patch(endpoint, values.reviewNotes, {
        headers: {
          'Content-Type': 'text/plain'
        }
      });

      message.success(`${action === 'approve' ? 'Phê duyệt' : 'Từ chối'} giải trình thành công!`);
      setReviewModal({ visible: false, explanation: null, action: null });
      loadPendingExplanations();
    } catch (error) {
      console.error('Error submitting review:', error);
      message.error('Lỗi khi xem xét giải trình');
    }
  };

  // View evidence files
  const handleViewEvidence = async (explanationId) => {
    try {
      const response = await axios.get(`/api/hr/evidence/explanation/${explanationId}`);
      setEvidenceModal({
        visible: true,
        files: response.data
      });
    } catch (error) {
      console.error('Error loading evidence files:', error);
      message.error('Lỗi khi tải file bằng chứng');
    }
  };

  // Download evidence file
  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const response = await axios.get(`/api/hr/evidence/${fileId}/download-url`);
      const downloadUrl = response.data;
      
      // Create temporary link to download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      message.error('Lỗi khi tải file');
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'SUBMITTED': 'blue',
      'UNDER_REVIEW': 'orange',
      'APPROVED': 'green',
      'REJECTED': 'red',
      'REQUIRES_MORE_INFO': 'purple'
    };
    return colors[status] || 'default';
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

  // Get file type icon
  const getFileTypeIcon = (fileType) => {
    if (fileType?.startsWith('image/')) {
      return <Image width={50} src={`data:${fileType};base64,placeholder`} />;
    }
    return <FileOutlined style={{ fontSize: 24 }} />;
  };

  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'submittedByName',
      key: 'submittedByName',
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <small style={{ color: '#666' }}>{record.submittedByEmail}</small>
        </div>
      )
    },
    {
      title: 'Vi phạm',
      key: 'violation',
      render: (_, record) => (
        <div>
          <div>{getViolationTypeDescription(record.violation?.violationType)}</div>
          <small style={{ color: '#666' }}>
            {moment(record.violation?.violationDate).format('DD/MM/YYYY')}
          </small>
        </div>
      )
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: true
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Tag color={getStatusColor(status)}>
          {record.statusDescription}
        </Tag>
      )
    },
    {
      title: 'Bằng chứng',
      dataIndex: 'evidenceCount',
      key: 'evidenceCount',
      render: (count, record) => (
        <div>
          {count > 0 ? (
            <Button 
              type="link" 
              onClick={() => handleViewEvidence(record.id)}
            >
              {count} file
            </Button>
          ) : (
            <Text type="secondary">Không có</Text>
          )}
        </div>
      )
    },
    {
      title: 'Quá hạn',
      key: 'overdue',
      render: (_, record) => (
        record.isOverdueForReview ? (
          <Tag color="red">Quá hạn</Tag>
        ) : (
          <Tag color="green">Đúng hạn</Tag>
        )
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<CheckOutlined />}
            size="small"
            onClick={() => handleReviewAction(record, 'approve')}
          >
            Phê duyệt
          </Button>
          <Button 
            danger 
            icon={<CloseOutlined />}
            size="small"
            onClick={() => handleReviewAction(record, 'reject')}
          >
            Từ chối
          </Button>
          <Button 
            type="default" 
            size="small"
            onClick={() => handleReviewAction(record, 'request-more-info')}
          >
            Yêu cầu bổ sung
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card title="Xem xét giải trình vi phạm chấm công">
        <div style={{ marginBottom: 16 }}>
          <Button onClick={loadPendingExplanations}>
            Làm mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={explanations}
          rowKey="id"
          loading={loading}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: 16, backgroundColor: '#fafafa' }}>
                <h4>Nội dung giải trình:</h4>
                <Paragraph>{record.explanationText}</Paragraph>
                
                <Divider />
                
                <h4>Thông tin vi phạm:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <p><strong>Loại vi phạm:</strong> {getViolationTypeDescription(record.violation?.violationType)}</p>
                    <p><strong>Ngày vi phạm:</strong> {moment(record.violation?.violationDate).format('DD/MM/YYYY')}</p>
                    <p><strong>Độ nghiêm trọng:</strong> {record.violation?.severity}</p>
                  </div>
                  <div>
                    <p><strong>Thời gian dự kiến:</strong> {record.violation?.expectedTime}</p>
                    <p><strong>Thời gian thực tế:</strong> {record.violation?.actualTime || 'Không có'}</p>
                    <p><strong>Chênh lệch:</strong> {record.violation?.deviationMinutes} phút</p>
                  </div>
                </div>
                
                <p><strong>Mô tả hệ thống:</strong> {record.violation?.systemDescription}</p>
              </div>
            ),
            rowExpandable: () => true
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Review Modal */}
      <Modal
        title={
          reviewModal.action === 'approve' ? 'Phê duyệt giải trình' :
          reviewModal.action === 'reject' ? 'Từ chối giải trình' :
          'Yêu cầu bổ sung thông tin'
        }
        visible={reviewModal.visible}
        onCancel={() => setReviewModal({ visible: false, explanation: null, action: null })}
        footer={null}
        width={600}
      >
        {reviewModal.explanation && (
          <div>
            <Card type="inner" title="Thông tin giải trình" style={{ marginBottom: 16 }}>
              <p><strong>Nhân viên:</strong> {reviewModal.explanation.submittedByName}</p>
              <p><strong>Ngày gửi:</strong> {moment(reviewModal.explanation.submittedAt).format('DD/MM/YYYY HH:mm')}</p>
              <Divider />
              <p><strong>Nội dung giải trình:</strong></p>
              <Paragraph>{reviewModal.explanation.explanationText}</Paragraph>
            </Card>

            <Form form={form} onFinish={handleSubmitReview} layout="vertical">
              <Form.Item
                name="reviewNotes"
                label={
                  reviewModal.action === 'approve' ? 'Ghi chú phê duyệt (tùy chọn)' :
                  reviewModal.action === 'reject' ? 'Lý do từ chối' :
                  'Thông tin cần bổ sung'
                }
                rules={
                  reviewModal.action !== 'approve' ? [
                    { required: true, message: 'Vui lòng nhập lý do' }
                  ] : []
                }
              >
                <TextArea 
                  rows={4} 
                  placeholder={
                    reviewModal.action === 'approve' ? 'Nhập ghi chú (tùy chọn)...' :
                    reviewModal.action === 'reject' ? 'Nhập lý do từ chối...' :
                    'Nhập thông tin cần bổ sung...'
                  }
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {reviewModal.action === 'approve' ? 'Phê duyệt' :
                     reviewModal.action === 'reject' ? 'Từ chối' :
                     'Yêu cầu bổ sung'}
                  </Button>
                  <Button onClick={() => setReviewModal({ visible: false, explanation: null, action: null })}>
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* Evidence Modal */}
      <Modal
        title="File bằng chứng"
        visible={evidenceModal.visible}
        onCancel={() => setEvidenceModal({ visible: false, files: [] })}
        footer={null}
        width={800}
      >
        <div>
          {evidenceModal.files.length > 0 ? (
            evidenceModal.files.map((file, index) => (
              <Card 
                key={index}
                size="small"
                style={{ marginBottom: 8 }}
                actions={[
                  <Button 
                    type="link" 
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownloadFile(file.id, file.originalFilename)}
                  >
                    Tải xuống
                  </Button>
                ]}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {getFileTypeIcon(file.mimeType)}
                  <div style={{ flex: 1 }}>
                    <p><strong>Tên file:</strong> {file.originalFilename}</p>
                    <p><strong>Kích thước:</strong> {file.formattedFileSize}</p>
                    <p><strong>Loại:</strong> {file.evidenceTypeDescription}</p>
                    {file.description && (
                      <p><strong>Mô tả:</strong> {file.description}</p>
                    )}
                    <p><strong>Trạng thái:</strong> 
                      <Tag color={file.isVerified ? 'green' : 'orange'} style={{ marginLeft: 8 }}>
                        {file.verificationStatus}
                      </Tag>
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p>Không có file bằng chứng</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ExplanationReview;
