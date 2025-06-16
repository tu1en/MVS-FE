import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Button, 
  Upload, 
  message, 
  Select, 
  Tabs,
  Row,
  Col,
  Card,
  Space,
  Typography
} from 'antd';
import { 
  UploadOutlined, 
  FileTextOutlined, 
  VideoCameraOutlined,
  LinkOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import { storage } from '../../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const CreateLectureModal = ({ visible, onCancel, onSuccess, courseId, editingLecture }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Reset form when modal opens/closes or editingLecture changes
  useEffect(() => {
    if (visible && editingLecture) {
      // Pre-fill form for editing
      form.setFieldsValue({
        title: editingLecture.title,
        description: editingLecture.description,
        content: editingLecture.content || editingLecture.description,
        lectureType: editingLecture.type || 'standard'
      });
      
      // Pre-fill materials if any
      if (editingLecture.materials) {
        const files = editingLecture.materials.filter(m => m.contentType !== 'video/youtube');
        const youtubeVideo = editingLecture.materials.find(m => m.contentType === 'video/youtube');
        
        setUploadedFiles(files.map(f => ({
          name: f.fileName,
          url: f.downloadUrl,
          type: f.contentType
        })));
        
        if (youtubeVideo) {
          const videoId = youtubeVideo.downloadUrl.match(/embed\/([^?]+)/)?.[1];
          if (videoId) {
            setYoutubeUrl(`https://www.youtube.com/watch?v=${videoId}`);
          }
        }
      }
    } else if (visible && !editingLecture) {
      // Reset for new lecture
      form.resetFields();
      setUploadedFiles([]);
      setYoutubeUrl('');
      setUploadProgress(0);
    }
  }, [visible, editingLecture, form]);

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Validate YouTube URL
  const validateYouTubeUrl = (url) => {
    if (!url) return true;
    const videoId = extractYouTubeId(url);
    return videoId !== null;
  };

  // Upload file to Firebase
  const uploadFileToFirebase = async (file) => {
    return new Promise((resolve, reject) => {
      const timestamp = Date.now();
      const fileName = `lectures/${courseId}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          message.error('Lỗi upload file');
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              name: file.name,
              url: downloadURL,
              type: file.type,
              size: file.size
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };

  // Custom upload handler
  const handleUpload = async ({ file, onSuccess, onError }) => {
    try {
      const uploadedFile = await uploadFileToFirebase(file);
      setUploadedFiles(prev => [...prev, uploadedFile]);
      onSuccess(uploadedFile);
      message.success(`${file.name} đã upload thành công`);
    } catch (error) {
      onError(error);
      message.error(`Lỗi upload ${file.name}`);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = (fileToRemove) => {
    setUploadedFiles(prev => prev.filter(file => file.url !== fileToRemove.url));
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Validate YouTube URL if provided
      if (values.youtubeUrl && !validateYouTubeUrl(values.youtubeUrl)) {
        message.error('URL YouTube không hợp lệ');
        return;
      }

      // Create lecture data matching backend LectureDto structure
      const lectureData = {
        title: values.title,
        content: values.content || values.description,
        description: values.description,
        type: values.lectureType || 'ONLINE',
        isRecordingEnabled: values.isRecordingEnabled || false,
        materials: []
      };

      // Add YouTube video as material if provided
      if (values.youtubeUrl && validateYouTubeUrl(values.youtubeUrl)) {
        const videoId = extractYouTubeId(values.youtubeUrl);
        lectureData.materials.push({
          fileName: `YouTube Video: ${values.title}`,
          contentType: 'video/youtube',
          downloadUrl: `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&showinfo=0&controls=1`
        });
      }

      // Add uploaded files as materials
      uploadedFiles.forEach(file => {
        lectureData.materials.push({
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          downloadUrl: file.url
        });
      });

      // Determine if this is create or update
      const isEditing = editingLecture && editingLecture.id;
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing 
        ? `http://localhost:8088/api/courses/${courseId}/lectures/${editingLecture.id}`
        : `http://localhost:8088/api/courses/${courseId}/lectures`;

      // Call API to create or update lecture
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lectureData)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} lecture: ${response.status}`);
      }

      const resultLecture = await response.json();
      console.log(`Lecture ${isEditing ? 'updated' : 'created'} successfully:`, resultLecture);
      
      message.success(`${isEditing ? 'Cập nhật' : 'Tạo'} bài giảng thành công!`);
      form.resetFields();
      setUploadedFiles([]);
      setYoutubeUrl('');
      setUploadProgress(0);
      onSuccess && onSuccess(resultLecture);
      onCancel();
    } catch (error) {
      console.error(`Error ${editingLecture ? 'updating' : 'creating'} lecture:`, error);
      message.error(`Lỗi ${editingLecture ? 'cập nhật' : 'tạo'} bài giảng: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  // File upload props
  const uploadProps = {
    customRequest: handleUpload,
    showUploadList: false,
    multiple: true,
    accept: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.mp4,.avi,.mov,.wmv,.jpg,.jpeg,.png,.gif'
  };

  return (
    <Modal
      title={editingLecture ? "Chỉnh sửa bài giảng nâng cao" : "Thêm bài giảng mới"}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          lectureType: 'standard'
        }}
      >
        {/* Basic Information */}
        <Card title="Thông tin cơ bản" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="Tiêu đề bài giảng"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
              >
                <Input placeholder="Ví dụ: Bài 1: Giới thiệu Java" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
              >
                <TextArea 
                  rows={3} 
                  placeholder="Mô tả ngắn về nội dung bài giảng"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lectureType"
                label="Loại bài giảng"
              >
                <Select>
                  <Option value="standard">Tiêu chuẩn</Option>
                  <Option value="video">Video</Option>
                  <Option value="interactive">Tương tác</Option>
                  <Option value="assignment">Bài tập</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Content Tabs */}
        <Card title="Nội dung bài giảng" size="small">
          <Tabs defaultActiveKey="materials" type="card">
            {/* Upload Materials Tab */}
            <TabPane 
              tab={
                <span>
                  <CloudUploadOutlined />
                  Tài liệu
                </span>
              } 
              key="materials"
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Title level={5}>Upload tài liệu</Title>
                  <Text type="secondary">
                    Hỗ trợ: PDF, Word, PowerPoint, Excel, ZIP, hình ảnh, video
                  </Text>
                </div>

                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />} loading={uploadProgress > 0 && uploadProgress < 100}>
                    {uploadProgress > 0 && uploadProgress < 100 
                      ? `Đang upload... ${Math.round(uploadProgress)}%`
                      : 'Chọn files để upload'
                    }
                  </Button>
                </Upload>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div>
                    <Title level={5}>Files đã upload:</Title>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {uploadedFiles.map((file, index) => (
                        <Card size="small" key={index}>
                          <Row justify="space-between" align="middle">
                            <Col>
                              <Space>
                                <FileTextOutlined />
                                <div>
                                  <div>{file.name}</div>
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </Text>
                                </div>
                              </Space>
                            </Col>
                            <Col>
                              <Button 
                                type="link" 
                                danger
                                onClick={() => handleRemoveFile(file)}
                              >
                                Xóa
                              </Button>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </Space>
                  </div>
                )}
              </Space>
            </TabPane>

            {/* YouTube Video Tab */}
            <TabPane 
              tab={
                <span>
                  <VideoCameraOutlined />
                  Video YouTube
                </span>
              } 
              key="youtube"
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Title level={5}>Nhúng video YouTube</Title>
                  <Text type="secondary">
                    Video sẽ được phát trực tiếp trong ứng dụng, không chuyển hướng sang YouTube
                  </Text>
                </div>

                <Form.Item
                  name="youtubeUrl"
                  label="URL YouTube"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (!value || validateYouTubeUrl(value)) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('URL YouTube không hợp lệ'));
                      }
                    }
                  ]}
                >
                  <Input
                    prefix={<LinkOutlined />}
                    placeholder="https://www.youtube.com/watch?v=..."
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                  />
                </Form.Item>

                {/* YouTube Preview */}
                {youtubeUrl && validateYouTubeUrl(youtubeUrl) && (
                  <div>
                    <Title level={5}>Xem trước:</Title>
                    <div style={{ 
                      position: 'relative', 
                      paddingBottom: '56.25%', 
                      height: 0,
                      overflow: 'hidden',
                      border: '1px solid #d9d9d9',
                      borderRadius: '6px'
                    }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYouTubeId(youtubeUrl)}`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%'
                        }}
                        frameBorder="0"
                        allowFullScreen
                        title="YouTube Preview"
                      />
                    </div>
                  </div>
                )}
              </Space>
            </TabPane>
          </Tabs>
        </Card>

        {/* Form Actions */}
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<CloudUploadOutlined />}
            >
              {editingLecture ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateLectureModal;
