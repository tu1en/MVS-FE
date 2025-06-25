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
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { storage } from '../../config/firebase';

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
        },        (error) => {
          console.error('Upload error:', error);
          // Note: message context may not be available in async callbacks
          try {
            message.error('Lỗi upload file');
          } catch (e) {
            console.error('Lỗi upload file');
          }
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
      message.success(`${file.name} đã upload thành công`);    } catch (error) {
      onError(error);
      try {
        message.error(`Lỗi upload ${file.name}`);
      } catch (e) {
        console.error(`Lỗi upload ${file.name}`);
      }
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
      
      // Debug logging
      console.log('Form submitted with values:', values);
      console.log('Title:', values.title);
      console.log('Description:', values.description);

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
      }      // Create lecture data matching backend LectureDto structure
      const lectureData = {
        title: values.title,
        content: values.description, // Use description as content
        description: values.description,
        type: 'ONLINE', // Default type since we removed the selection field
        isRecordingEnabled: values.isRecordingEnabled || false,
        materials: []
      };

      // Add YouTube video as material if provided
      if (values.youtubeUrl && validateYouTubeUrl(values.youtubeUrl)) {        const videoId = extractYouTubeId(values.youtubeUrl);
        lectureData.materials.push({
          fileName: `YouTube Video: ${values.title}`,
          contentType: 'video/youtube',
          downloadUrl: `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&showinfo=0&controls=1&modestbranding=1&iv_load_policy=3`
        });
      }

      // Add uploaded files as materials
      uploadedFiles.forEach(file => {
        lectureData.materials.push({
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          downloadUrl: file.url
        });
      });      // Determine if this is create or update
      const isEditing = editingLecture && editingLecture.id;
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing 
        ? `http://localhost:8088/api/courses/${selectedCourseId}/lectures/${editingLecture.id}`
        : `http://localhost:8088/api/courses/${selectedCourseId}/lectures`;

      // Call API to create or update lecture
      const token = localStorage.getItem('token');
      console.log('Creating lecture with request:', {
        url,
        method,
        token: token ? `Bearer ${token.substring(0, 10)}...` : 'No token',
        data: JSON.stringify(lectureData)
      });
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lectureData)
      });

      console.log('Server response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        
        // Handle specific error cases
        if (response.status === 404 && isEditing) {
          throw new Error('Bài giảng không tồn tại hoặc đã bị xóa. Vui lòng tải lại trang.');
        } else if (response.status === 403) {
          throw new Error('Bạn không có quyền thực hiện thao tác này.');
        } else if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else {
          throw new Error(`Lỗi server (${response.status}): ${errorText || 'Không thể xử lý yêu cầu'}`);
        }
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
  return (    <Modal
      title={editingLecture ? "Chỉnh sửa bài giảng nâng cao" : "Thêm bài giảng mới"}
      open={open}
      onCancel={onCancel}
      footer={null}
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
                label="Mô tả"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
              >
                <TextArea 
                  rows={3} 
                  placeholder="Mô tả ngắn về nội dung bài giảng"
                />
              </Form.Item>
            </Col>
            {/* Add classroom selection field only if courseId is not provided via props */}
            {!courseId && (
              <Col span={24}>
                <Form.Item
                  name="courseId"
                  label="Chọn lớp học"
                  rules={[{ required: true, message: 'Vui lòng chọn lớp học!' }]}
                >
                  <Select 
                    placeholder="Chọn lớp học để thêm bài giảng"
                    loading={availableCourses.length === 0}
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {availableCourses.map(course => (
                      <Option key={course.id} value={course.id}>
                        {course.name} ({course.subject || course.description})
                      </Option>
                    ))}
                  </Select>                </Form.Item>
              </Col>
            )}
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
                )
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
                    </Form.Item>                    {/* YouTube Preview */}
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
                            src={`https://www.youtube.com/embed/${extractYouTubeId(youtubeUrl)}?autoplay=0&rel=0&showinfo=0&controls=1&modestbranding=1&iv_load_policy=3`}
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
                            onError={() => {
                              console.warn('YouTube iframe failed to load - this is expected with ad blockers');
                            }}
                          />
                        </div>
                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                          💡 Nếu không thấy video preview, đây có thể do ad blocker. Video vẫn sẽ hoạt động bình thường khi lưu.
                        </Text>
                      </div>
                    )}
                  </Space>
                )
              }
            ]}
          />
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
