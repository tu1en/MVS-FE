import {
    CloudUploadOutlined,
    FileTextOutlined,
    LinkOutlined,
    UploadOutlined,
    VideoCameraOutlined
} from '@ant-design/icons';
import {
    App,
    Button,
    Card,
    Col,
    Form,
    Input,
    Modal,
    Row,
    Select,
    Space,
    Tabs,
    Typography,
    Upload
} from 'antd';
import { useEffect, useState } from 'react';
import FileUploadService from '../../services/fileUploadService';
import lectureService from '../../services/lectureService';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const CreateLectureModal = ({ open, onCancel, onSuccess, courseId, editingLecture }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  // Get App context for message and modal
  const { message } = App.useApp();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [availableCourses, setAvailableCourses] = useState([]);
  // Load available courses for the teacher
  const loadCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Using fetch instead of axios for better error handling
      const response = await fetch('http://localhost:8088/api/classrooms/current-teacher', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Không thể kết nối đến server (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Available courses for lecture creation:', data);
      setAvailableCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading courses:', error);
      message.error('Không thể tải danh sách khóa học: ' + error.message);
      setAvailableCourses([]);
    }
  };

  // Load courses when modal opens
  useEffect(() => {
    if (open) {
      loadCourses();
    }
  }, [open]);
  // Reset form when modal opens/closes or editingLecture changes
  useEffect(() => {
    if (open && editingLecture) {
      // Pre-fill form for editing
      form.setFieldsValue({
        title: editingLecture.title,
        description: editingLecture.description,
        content: editingLecture.content || editingLecture.description,
        courseId: courseId || editingLecture.courseId // Use provided courseId or from lecture
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
          // Correctly reconstruct the original watch URL for the form
          const videoId = youtubeVideo.downloadUrl.match(/embed\/([^?]+)/)?.[1];
          if (videoId) {
            const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
            setYoutubeUrl(watchUrl); // Update state
            form.setFieldsValue({ youtubeUrl: watchUrl }); // Explicitly set form value
          }
        } else {
          setYoutubeUrl(''); // Clear if no video
        }
      }    } else if (open && !editingLecture) {
      // Reset for new lecture
      form.resetFields();
      // Set default values including courseId if provided
      form.setFieldsValue({
        lectureType: 'standard',
        courseId: courseId
      });
      setUploadedFiles([]);
      setYoutubeUrl('');
      setUploadProgress(0);
    }
  }, [open, editingLecture, form]);

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

  // Handle file upload
  const handleFileUpload = (options) => {
    console.log('[Debug] CreateLectureModal: handleFileUpload triggered.');
    const { file, onSuccess, onError, onProgress } = options;

    const customSuccessHandler = (uploadedFileData) => {
      console.log('[Debug] CreateLectureModal: Upload success callback received.', uploadedFileData);
      setUploadedFiles(prev => [...prev, uploadedFileData]);
      onSuccess(uploadedFileData, file);
    };

    const customErrorHandler = (error, fallbackData) => {
      console.error('[Debug] CreateLectureModal: Upload error callback received.', error);
      if (fallbackData) {
        setUploadedFiles(prev => [...prev, fallbackData]);
      }
      onError(error);
    };

    FileUploadService.uploadFile({
        file,
        onSuccess: customSuccessHandler,
        onError: customErrorHandler,
        onProgress
    }, `lectures/${courseId || 'temp'}`);
  };

  // Remove uploaded file
  const handleRemoveFile = (fileToRemove) => {
    setUploadedFiles(prev => prev.filter(file => file.url !== fileToRemove.url));
  };
  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Debug logging
      console.log('Form submitted with values:', values);
      console.log('Title:', values.title);
      console.log('Description:', values.description);
      console.log('Uploaded files:', uploadedFiles);

      // Basic validation
      if (!values.title || values.title.trim() === '') {
        message.error('Vui lòng nhập tiêu đề bài giảng');
        setLoading(false);
        return;
      }

      if (!values.description || values.description.trim() === '') {
        message.error('Vui lòng nhập mô tả bài giảng');
        setLoading(false);
        return;
      }

      // Validate YouTube URL if provided
      if (values.youtubeUrl && !validateYouTubeUrl(values.youtubeUrl)) {
        message.error('URL YouTube không hợp lệ');
        setLoading(false);
        return;
      }
      
      // Check if we have a course ID either from props or from form selection
      const selectedCourseId = courseId || values.courseId;
      if (!selectedCourseId) {
        message.error('Vui lòng chọn khóa học');
        setLoading(false);
        return;
      }

      const lectureData = {
        title: values.title,
        content: values.description,
      };

      // Add YouTube URL if provided
      if (values.youtubeUrl && values.youtubeUrl.trim() !== '') {
        const videoId = extractYouTubeId(values.youtubeUrl);
        if (videoId) {
          lectureData.youtubeUrl = values.youtubeUrl;
          lectureData.youtubeVideoId = videoId;
          lectureData.youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      }

      // Xử lý tệp đã tải lên
      if (uploadedFiles && uploadedFiles.length > 0) {
        // Kiểm tra nếu có tệp cục bộ (do lỗi Firebase)
        const hasLocalFiles = uploadedFiles.some(file => file.isLocalFile);
        
        if (hasLocalFiles) {
          console.log('Có tệp cục bộ, xử lý đặc biệt');
          
          // Thông báo cho người dùng
          message.warning('Một số tệp đang được sử dụng ở dạng cục bộ do lỗi Firebase Storage. Bạn có thể tiếp tục nhưng tệp có thể không khả dụng sau khi tải lại trang.');
          
          // Vẫn gửi thông tin tệp đến backend
          lectureData.materials = uploadedFiles.map(file => ({
            fileName: file.name,
            fileUrl: file.url,
            fileType: file.type,
            fileSize: file.size,
              localFile: file.isLocalFile || false
          }));
        } else {
          // Xử lý bình thường với tệp từ Firebase
          lectureData.materials = uploadedFiles.map(file => ({
            fileName: file.name,
            fileUrl: file.url,
            fileType: file.type,
            fileSize: file.size,
              localFile: false
          }));
        }
      }
      
      console.log("Submitting to backend:", { selectedCourseId, lectureData });

      await lectureService.createLecture(selectedCourseId, lectureData);

      message.success('Bài giảng đã được tạo thành công!');
      onSuccess(); // Close modal and refresh list
    } catch (error) {
      console.error('Failed to create lecture:', error);
      message.error(error.response?.data?.message || 'Không thể tạo bài giảng.');
    } finally {
      setLoading(false);
    }
  };

  // File upload props
  const uploadProps = {
    customRequest: handleFileUpload,
    showUploadList: false,
    multiple: true,
    accept: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.mp4,.avi,.mov,.wmv,.jpg,.jpeg,.png,.gif'
  };
  return (
    <Modal
      title={editingLecture ? "Chỉnh sửa bài giảng nâng cao" : "Thêm bài giảng mới"}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          {editingLecture ? "Cập nhật bài giảng" : "Thêm bài giảng"}
        </Button>
      ]}
      width={800}
      destroyOnHidden={true}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}        initialValues={{
          lectureType: 'standard',
          courseId: courseId // Pre-fill courseId if provided via props
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
            <Col span={24}>              <Form.Item
                name="description"
                label={<Text strong>Mô tả</Text>}
                rules={[{ required: true, message: 'Vui lòng nhập mô tả bài giảng' }]}
              >
                <TextArea 
                  rows={3} 
                  placeholder="Mô tả ngắn gọn về nội dung chính của bài giảng"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item
                    name="courseId"
                    label={<Text strong>Thuộc khóa học</Text>}
                    rules={[{ required: true, message: 'Vui lòng chọn khóa học' }]}
                >
                    <Select
                        placeholder="Chọn một khóa học"
                        disabled={!!courseId} // Disable if a course is already selected
                        loading={availableCourses.length === 0}
                    >
                        {availableCourses.map(course => (
                            <Option key={course.id} value={course.id}>
                                {course.name} ({course.subject})
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lectureType"
                label="Loại bài giảng"
                rules={[{ required: true, message: 'Vui lòng chọn loại bài giảng!' }]}
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
        </Card>        {/* Content Tabs */}
        <Card title="Nội dung bài giảng" size="small">
          <Tabs 
            defaultActiveKey="materials" 
            type="card"
            items={[
              {
                key: 'materials',
                label: (
                  <span>
                    <CloudUploadOutlined />
                    Tài liệu
                  </span>
                ),
                children: (
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

                    {/* Display uploaded files */}
                    {uploadedFiles.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <Title level={5}>Files đã upload:</Title>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {uploadedFiles.map((file, index) => (
                            <div key={index} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px 12px',
                              border: '1px solid #d9d9d9',
                              borderRadius: '6px',
                              backgroundColor: '#fafafa'
                            }}>
                              <span>
                                <CloudUploadOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                                {file.name}
                              </span>
                              <Button
                                type="text"
                                danger
                                size="small"
                                onClick={() => handleRemoveFile(file)}
                              >
                                Xóa
                              </Button>
                            </div>
                          ))}
                        </Space>
                      </div>
                    )}
                  </Space>
                ),
              },
              {
                key: 'youtube',
                label: (
                  <span>
                    <VideoCameraOutlined />
                    Video YouTube
                  </span>
                ),
                children: (
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <div>
                      <Title level={5}>Video YouTube</Title>
                      <Text type="secondary">
                        Nhập URL của video YouTube để tích hợp vào bài giảng.
                      </Text>
                    </div>
                    <Form.Item
                      name="youtubeUrl"
                      label="URL Video YouTube"
                      rules={[{ required: true, message: 'Vui lòng nhập URL video YouTube!' }]}
                    >
                      <Input
                        placeholder="Ví dụ: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        addonAfter={<LinkOutlined />}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        onBlur={() => form.setFieldsValue({ youtubeUrl: youtubeUrl })}
                      />
                    </Form.Item>
                  </Space>
                ),
              },
              {
                key: 'content',
                label: (
                  <span>
                    <FileTextOutlined />
                    Nội dung bài giảng
                  </span>
                ),
                children: (
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <div>
                      <Title level={5}>Nội dung bài giảng</Title>
                      <Text type="secondary">
                        Nội dung chi tiết của bài giảng, có thể được định dạng bằng HTML.
                      </Text>
                    </div>
                    <Form.Item
                      name="content"
                      label="Nội dung"
                      rules={[{ required: true, message: 'Vui lòng nhập nội dung bài giảng!' }]}
                    >
                      <TextArea
                        rows={10}
                        placeholder="Nội dung bài giảng (có thể định dạng HTML)"
                      />
                    </Form.Item>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      </Form>
    </Modal>
  );
};

export default CreateLectureModal;