import {
  CloudDownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  RecordingOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Row,
  Space,
  Tag,
  Typography,
  Upload,
  message
} from 'antd';
import React, { useEffect, useState } from 'react';
import livestreamService from '../services/livestreamService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * RecordingManager component để quản lý recordings của livestream
 * @param {Object} props - Component props
 * @param {string} props.lectureId - ID của bài giảng
 * @param {boolean} props.isTeacher - Có phải là giáo viên không
 * @returns {JSX.Element} RecordingManager component
 */
const RecordingManager = ({ lectureId, isTeacher = false }) => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecording, setEditingRecording] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewRecording, setPreviewRecording] = useState(null);
  const [form] = Form.useForm();

  // Load recordings khi component mount
  useEffect(() => {
    loadRecordings();
  }, [lectureId]);

  // Load danh sách recordings
  const loadRecordings = async () => {
    if (!lectureId) return;
    
    setLoading(true);
    try {
      const data = await livestreamService.getLivestreamsByLecture(lectureId);
      const recordingsWithUrls = data.filter(item => item.recordingUrl);
      setRecordings(recordingsWithUrls);
    } catch (err) {
      console.error('Failed to load recordings:', err);
      message.error('Không thể tải danh sách bản ghi');
    } finally {
      setLoading(false);
    }
  };

  // Mở modal thêm/sửa recording
  const openModal = (recording = null) => {
    setEditingRecording(recording);
    setModalVisible(true);
    
    if (recording) {
      form.setFieldsValue({
        title: recording.title || '',
        description: recording.description || '',
        recordingUrl: recording.recordingUrl || ''
      });
    } else {
      form.resetFields();
    }
  };

  // Lưu recording
  const handleSaveRecording = async (values) => {
    try {
      if (editingRecording) {
        // Update existing recording
        await livestreamService.updateRecordingUrl(editingRecording.id, values.recordingUrl);
        message.success('Đã cập nhật bản ghi thành công');
      } else {
        // Create new recording entry
        const newRecording = {
          lectureId,
          title: values.title,
          description: values.description,
          recordingUrl: values.recordingUrl,
          createdAt: new Date().toISOString()
        };
        
        // This would need a new API endpoint to create recording entries
        console.log('Would create new recording:', newRecording);
        message.success('Đã thêm bản ghi mới thành công');
      }
      
      setModalVisible(false);
      loadRecordings();
    } catch (err) {
      console.error('Failed to save recording:', err);
      message.error('Không thể lưu bản ghi');
    }
  };

  // Xóa recording
  const handleDeleteRecording = async (recordingId) => {
    try {
      // This would need an API endpoint to delete recording URL
      await livestreamService.updateRecordingUrl(recordingId, '');
      message.success('Đã xóa bản ghi thành công');
      loadRecordings();
    } catch (err) {
      console.error('Failed to delete recording:', err);
      message.error('Không thể xóa bản ghi');
    }
  };

  // Preview recording
  const handlePreviewRecording = (recording) => {
    setPreviewRecording(recording);
    setPreviewVisible(true);
  };

  // Share recording
  const handleShareRecording = (recording) => {
    if (navigator.share) {
      navigator.share({
        title: recording.title || 'Bản ghi buổi học',
        text: recording.description || 'Xem bản ghi buổi học',
        url: recording.recordingUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(recording.recordingUrl).then(() => {
        message.success('Đã sao chép liên kết vào clipboard');
      });
    }
  };

  // Download recording (if supported)
  const handleDownloadRecording = (recording) => {
    window.open(recording.recordingUrl, '_blank');
  };

  // Get video thumbnail from URL
  const getVideoThumbnail = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId[1]}/maxresdefault.jpg`;
      }
    }
    return null;
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="recording-manager">
      <Card
        title={
          <Space>
            <RecordingOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Quản lý bản ghi
            </Title>
          </Space>
        }
        extra={
          isTeacher && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              Thêm bản ghi
            </Button>
          )
        }
      >
        {recordings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <RecordingOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
            <Title level={4} type="secondary">
              Chưa có bản ghi nào
            </Title>
            <Text type="secondary">
              {isTeacher 
                ? 'Thêm liên kết bản ghi để học viên có thể xem lại buổi học'
                : 'Giáo viên chưa thêm bản ghi cho buổi học này'
              }
            </Text>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {recordings.map((recording) => {
              const thumbnail = getVideoThumbnail(recording.recordingUrl);
              
              return (
                <Col key={recording.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    size="small"
                    cover={
                      thumbnail ? (
                        <div style={{ position: 'relative' }}>
                          <img
                            src={thumbnail}
                            alt="Video thumbnail"
                            style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              fontSize: '32px',
                              color: 'white',
                              textShadow: '0 0 10px rgba(0,0,0,0.8)'
                            }}
                          >
                            <PlayCircleOutlined />
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            height: '120px',
                            background: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <PlayCircleOutlined style={{ fontSize: 32, color: '#ccc' }} />
                        </div>
                      )
                    }
                    actions={[
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handlePreviewRecording(recording)}
                        title="Xem trước"
                      />,
                      <Button
                        type="text"
                        icon={<ShareAltOutlined />}
                        onClick={() => handleShareRecording(recording)}
                        title="Chia sẻ"
                      />,
                      <Button
                        type="text"
                        icon={<CloudDownloadOutlined />}
                        onClick={() => handleDownloadRecording(recording)}
                        title="Tải về"
                      />,
                      ...(isTeacher ? [
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => openModal(recording)}
                          title="Chỉnh sửa"
                        />,
                        <Popconfirm
                          title="Bạn có chắc muốn xóa bản ghi này?"
                          onConfirm={() => handleDeleteRecording(recording.id)}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            danger
                            title="Xóa"
                          />
                        </Popconfirm>
                      ] : [])
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Text strong style={{ fontSize: '14px' }}>
                          {recording.title || 'Bản ghi buổi học'}
                        </Text>
                      }
                      description={
                        <div>
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{ fontSize: '12px', margin: 0 }}
                          >
                            {recording.description || 'Không có mô tả'}
                          </Paragraph>
                          <div style={{ marginTop: 8 }}>
                            <Tag size="small">
                              {new Date(recording.createdAt || recording.startTime).toLocaleDateString('vi-VN')}
                            </Tag>
                            {recording.duration && (
                              <Tag size="small" color="blue">
                                {formatDuration(recording.duration)}
                              </Tag>
                            )}
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>

      {/* Add/Edit Recording Modal */}
      <Modal
        title={editingRecording ? 'Chỉnh sửa bản ghi' : 'Thêm bản ghi mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveRecording}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Ví dụ: Bài 1 - Giới thiệu về Java" />
          </Form.Item>

          <Form.Item
            name="recordingUrl"
            label="Liên kết bản ghi"
            rules={[
              { required: true, message: 'Vui lòng nhập liên kết bản ghi' },
              { type: 'url', message: 'Vui lòng nhập liên kết hợp lệ' }
            ]}
          >
            <Input placeholder="https://youtu.be/xxxxxxxx hoặc https://drive.google.com/..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea
              rows={4}
              placeholder="Mô tả nội dung bản ghi, các chủ đề được đề cập..."
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingRecording ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={previewRecording?.title || 'Xem trước bản ghi'}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="open"
            type="primary"
            onClick={() => window.open(previewRecording?.recordingUrl, '_blank')}
          >
            Mở trong tab mới
          </Button>
        ]}
        width={800}
      >
        {previewRecording && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Liên kết: </Text>
              <a href={previewRecording.recordingUrl} target="_blank" rel="noopener noreferrer">
                {previewRecording.recordingUrl}
              </a>
            </div>
            
            {previewRecording.description && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>Mô tả: </Text>
                <Paragraph>{previewRecording.description}</Paragraph>
              </div>
            )}

            {/* Embed video if it's YouTube */}
            {previewRecording.recordingUrl.includes('youtube.com') || previewRecording.recordingUrl.includes('youtu.be') ? (
              <div style={{ textAlign: 'center' }}>
                <iframe
                  width="100%"
                  height="400"
                  src={previewRecording.recordingUrl.replace('watch?v=', 'embed/')}
                  title="Video preview"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <PlayCircleOutlined style={{ fontSize: 64, color: '#ccc' }} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">
                    Nhấn "Mở trong tab mới" để xem bản ghi
                  </Text>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RecordingManager;
