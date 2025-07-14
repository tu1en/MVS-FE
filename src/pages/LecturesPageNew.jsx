import {
  CheckOutlined,
  EyeOutlined,
  LinkOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  Upload
} from 'antd';
import { useEffect, useState } from 'react';
import CreateLectureModal from '../components/teacher/CreateLectureModal';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * LecturesPageNew component for managing course lectures and materials with separate teacher and student views
 * @returns {JSX.Element} LecturesPageNew component
 */
function LecturesPageNew() {
  const [loading, setLoading] = useState(true);
  const [lectures, setLectures] = useState([]);
  const [editingLecture, setEditingLecture] = useState(null);
  const [lectureModalVisible, setLectureModalVisible] = useState(false);
  const [materialModalVisible, setMaterialModalVisible] = useState(false);
  const [currentLectureId, setCurrentLectureId] = useState(null);
  const [currentMaterial, setCurrentMaterial] = useState(null);  
  const [materialModalMode, setMaterialModalMode] = useState('add'); // 'add' or 'edit'
  const [fileList, setFileList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [form] = Form.useForm();
  const [materialForm] = Form.useForm();
  const [viewMaterialVisible, setViewMaterialVisible] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Get App context for message and modal
  const { message, modal } = App.useApp();
  
  // Get user info from the AuthContext
  const { user } = useAuth();
  const userId = user?.id;
  // The role from context is prefixed (e.g., "ROLE_TEACHER"), so we extract the simple name.
  const userRole = user?.role?.replace('ROLE_', '');

  // Helper function to preview file with JWT authentication
  const previewFile = async (fileUrl, contentType, fileName = 'document') => {
    try {
      if (!fileUrl) {
        message.error('Không có đường dẫn để mở tài liệu');
        return;
      }

      console.log('🔄 Downloading file with authentication:', fileUrl);
      
      // Use the configured apiClient which already includes JWT token
      const response = await apiClient.get(fileUrl, {
        responseType: 'blob',
        timeout: 30000 // 30 second timeout for large files
      });

      console.log('✅ File downloaded successfully, creating blob URL');
      
      // Create blob with correct content type
      const blob = new Blob([response.data], { 
        type: contentType || 'application/octet-stream' 
      });
      
      // Create temporary URL and open in new tab
      const blobUrl = URL.createObjectURL(blob);
      const newWindow = window.open(blobUrl, '_blank');
      
      if (!newWindow) {
        message.warning('Popup bị chặn. Vui lòng cho phép popup cho trang này.');
        return;
      }
      
      // Clean up blob URL after 10 seconds to free memory
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        console.log('🧹 Blob URL cleaned up');
      }, 10000);
      
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        message.error('Không có quyền truy cập tài liệu này. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 404) {
        message.error('Không tìm thấy tài liệu. File có thể đã bị xóa.');
      } else if (error.code === 'ECONNABORTED') {
        message.error('Tải file quá lâu. Vui lòng thử lại.');
      } else {
        message.error('Không thể tải tài liệu. Vui lòng thử lại sau.');
      }
    }
  };

  // Debug logging for role detection
  console.log('LecturesPageNew - Role Debug (from Context):', {
    userId,
    userRole,
    originalRole: user?.role,
    userFromContext: user
  });

  // Add state for courses and lectures with loading states
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [courseError, setCourseError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isLoadingLectures, setIsLoadingLectures] = useState(false);
  const [lectureError, setLectureError] = useState(null);

  // Add useEffect to fetch courses when component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      console.log('LecturesPageNew: Starting to fetch courses...', { userId, userRole });

      setIsLoadingCourses(true);
      setCourseError(null);

      try {
        // The endpoint is now determined by the role from the context
        const endpoint = userRole === 'STUDENT'
          ? `classrooms/student/me`
          : `classrooms/current-teacher`;

        console.log(`LecturesPageNew: Fetching courses from: /api/${endpoint}`);
        const response = await apiClient.get(endpoint, { timeout: 15000 });

        console.log('LecturesPageNew: Courses fetched:', response.data);
        setCourses(response.data || []);

        // Select first course automatically if available
        if (response.data && response.data.length > 0) {
          console.log('LecturesPageNew: Auto-selecting first course:', response.data[0]);
          setSelectedCourse(response.data[0]);
        }
      } catch (error) {
        console.error('LecturesPageNew: Error fetching courses:', error);
        setCourseError('Không thể tải danh sách khóa học. Vui lòng thử lại.');
      } finally {
        setIsLoadingCourses(false);
      }
    };

    // Fetch only if we have a valid user
    if (userId && userRole) {
      console.log('LecturesPageNew: Valid user detected, fetching courses...');
      fetchCourses();
    } else {
      console.log('LecturesPageNew: No valid user, skipping course fetch', { userId, userRole });
    }
  }, [userId, userRole]);

  // Add useEffect to fetch lectures when selectedCourse changes
  useEffect(() => {
    const fetchLectures = async () => {
      if (!selectedCourse || !selectedCourse.id) return;
      
      setLoading(true);
      setLectures([]);
      
      try {
        console.log(`🔍 LecturesPageNew: Fetching lectures for course ${selectedCourse.id}`);
        const response = await apiClient.get(`/courses/${selectedCourse.id}/lectures`, { timeout: 15000 });
        console.log(`📚 LecturesPageNew: Received ${response.data?.length || 0} lectures:`, response.data);

        // Debug first lecture materials
        if (response.data && response.data.length > 0) {
          const firstLecture = response.data[0];
          console.log(`🔍 First lecture materials:`, {
            id: firstLecture.id,
            title: firstLecture.title,
            materialsCount: firstLecture.materials?.length || 0,
            materials: firstLecture.materials
          });
        }

        setLectures(response.data || []);
      } catch (error) {
        console.error('❌ Error fetching lectures:', error);
        setLectures([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLectures();
  }, [selectedCourse]);

  // Set form values when editing lecture
  useEffect(() => {
    if (editingLecture && lectureModalVisible) {
      form.setFieldsValue({
        title: editingLecture.title,
        description: editingLecture.description
      });
    } else if (!editingLecture && lectureModalVisible) {
      form.resetFields();
    }
  }, [editingLecture, lectureModalVisible, form]);

  // ===== Lecture Management Functions =====
  const handleEditLecture = (lecture) => {
    // Check if this is a mock lecture (ID <= 10 are considered mock for demo purposes)
    if (lecture.id <= 10) {
      message.warning('Đây là dữ liệu mẫu, không thể chỉnh sửa. Vui lòng tạo bài giảng mới.');
      return;
    }
    setEditingLecture(lecture);
    setShowAdvancedModal(true); // Use advanced modal for editing too
  };  
  
  const handleDeleteLecture = (lecture) => {
    // Check if this is a mock lecture (ID <= 10 are considered mock for demo purposes)
    if (lecture.id <= 10) {
      message.warning('Đây là dữ liệu mẫu, không thể xóa. Chỉ có thể xóa bài giảng thực tế.');
      return;
    }
    
    modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa bài giảng "${lecture.title}"? Tất cả tài liệu bên trong cũng sẽ bị xóa.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        setLectures(lectures.filter(l => l.id !== lecture.id));
        message.success('Đã xóa bài giảng thành công');
      }
    });
  };

  const handleLectureFormSubmit = (values) => {
    if (editingLecture) {
      // Update existing lecture
      const updatedLectures = lectures.map(lecture => 
        lecture.id === editingLecture.id ? 
          { ...lecture, title: values.title, description: values.description } : 
          lecture
      );
      setLectures(updatedLectures);
      message.success('Đã cập nhật bài giảng thành công');
    } else {
      // Add new lecture
      const newLecture = {
        id: Math.max(...lectures.map(l => l.id), 0) + 1,
        title: values.title,
        description: values.description,
        courseId: selectedCourse.id,
        order: lectures.filter(l => l.courseId === selectedCourse.id).length + 1,
        materials: []
      };
      setLectures([...lectures, newLecture]);
      message.success('Đã thêm bài giảng mới thành công');
    }
    setLectureModalVisible(false);
  };
  // Handle advanced lecture creation
  const handleAdvancedLectureCreated = async (lectureData) => {
    try {
      // In a real app, you would reload from the server
      // For now, we'll add to local state and then try to reload from API
      
      if (editingLecture) {
        // Update existing lecture in local state
        const updatedLectures = lectures.map(lecture => 
          lecture.id === editingLecture.id ? 
            { 
              ...lecture, 
              title: lectureData.title,
              description: lectureData.description || lectureData.content,
              materials: lectureData.materials || lecture.materials
            } : 
            lecture
        );
        setLectures(updatedLectures);
        message.success('Đã cập nhật bài giảng nâng cao thành công!');
      } else {
        // Create new lecture in local state
        const newLecture = {
          id: lectureData.id || (Math.max(...lectures.map(l => l.id), 0) + 1),
          title: lectureData.title,
          description: lectureData.description || lectureData.content,
          courseId: selectedCourse?.id,
          materials: lectureData.materials || []
        };
        setLectures(prev => [...prev, newLecture]);
        message.success('Đã tạo bài giảng nâng cao thành công!');
      }
      
      // Close modal
      setShowAdvancedModal(false);
      setEditingLecture(null);
      
    } catch (error) {
      console.error('Error handling advanced lecture creation:', error);
      message.error('Đã xảy ra lỗi khi tạo bài giảng.');
    }
  };

  // ===== Material Management Functions =====
  const handleAddMaterial = (lectureId) => {
    setCurrentLectureId(lectureId);
    setMaterialModalMode('add');
    setCurrentMaterial(null);
    setMaterialModalVisible(true);
    setFileList([]);
    materialForm.resetFields();
  };

  const handleEditMaterial = (lectureId, material) => {
    setCurrentLectureId(lectureId);
    setMaterialModalMode('edit');
    setCurrentMaterial(material);
    setMaterialModalVisible(true);
    materialForm.setFieldsValue({
      name: material.name,
      type: material.type,
      url: material.type === 'link' ? material.url : undefined
    });
    setFileList([]);
  };
  const handleDeleteMaterial = (lectureId, materialId) => {
    modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa tài liệu này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        const updatedLectures = lectures.map(lecture => {
          if (lecture.id === lectureId) {
            return {
              ...lecture,
              materials: lecture.materials.filter(m => m.id !== materialId)
            };
          }
          return lecture;
        });
        setLectures(updatedLectures);
        message.success('Đã xóa tài liệu thành công');
      }
    });
  };

  const handleMaterialFormSubmit = (values) => {
    if (materialModalMode === 'add') {
      // Add new material
      const newMaterial = {
        id: Math.floor(Math.random() * 1000) + 200,
        name: values.name,
        type: values.type,
        url: values.type === 'link' ? values.url : 
             fileList.length > 0 ? URL.createObjectURL(fileList[0].originFileObj) : '',
        uploadedAt: new Date().toISOString(),
        viewed: false
      };
      
      const updatedLectures = lectures.map(lecture => {
        if (lecture.id === currentLectureId) {
          return {
            ...lecture,
            materials: [...lecture.materials, newMaterial]
          };
        }
        return lecture;
      });
      
      setLectures(updatedLectures);
      message.success('Đã thêm tài liệu mới thành công');
    } else {
      // Update existing material
      const updatedLectures = lectures.map(lecture => {
        if (lecture.id === currentLectureId) {
          return {
            ...lecture,
            materials: lecture.materials.map(material => {
              if (material.id === currentMaterial.id) {
                return {
                  ...material,
                  name: values.name,
                  type: values.type,
                  url: values.type === 'link' ? values.url : 
                       fileList.length > 0 ? URL.createObjectURL(fileList[0].originFileObj) : material.url
                };
              }
              return material;
            })
          };
        }
        return lecture;
      });
      
      setLectures(updatedLectures);
      message.success('Đã cập nhật tài liệu thành công');
    }
    
    setMaterialModalVisible(false);
  };

  // View material
  const handleViewMaterial = (material) => {
    console.log("🔍 handleViewMaterial called with:", material);

    // Create a consistent material object regardless of the source format
    const normalizedMaterial = {
      id: material.id,
      name: material.name || material.fileName || material.title || "Tài liệu",
      // ưu tiên loại do bạn đã set (pdf, doc, link, video), hoặc suy từ contentType/fileType
      type: material.type 
          || (material.fileType?.includes('pdf')      ? 'pdf'
          : material.contentType?.includes('pdf')   ? 'pdf'
          : material.fileType?.includes('doc')      ? 'doc'
          : material.contentType?.includes('doc')   ? 'doc'
          : material.fileType?.includes('video')    ? 'video'
          : material.contentType?.includes('video') ? 'video'
          : material.contentType?.startsWith('image/') ? 'image'
          : material.fileType?.startsWith('image/')    ? 'image'
          : 'link'),
      // *** Enhanced fallback for multiple backend field names
      url: material.url 
         || material.downloadUrl
         || material.fileUrl      // Spring Boot FileUploadResponse.fileUrl
         || material.file_path    // Alternative field name
         || material.filePath     // CamelCase variant
         || material.attachment?.fileUrl  // Nested attachment object
         || material.attachment?.url      // Nested attachment url
         || (material.id ? `/files/download/${material.id}` : null), // Generate from ID - avoid /api duplication
      downloadUrl: material.downloadUrl
                || material.url
                || material.fileUrl
                || material.file_path
                || material.filePath
                || material.attachment?.fileUrl
                || material.attachment?.url
                || (material.id ? `/files/download/${material.id}` : null), // Avoid /api duplication
      contentType: material.contentType
               || material.fileType
               || material.mimeType,   // Another common field name
      viewed: material.viewed || false
    };

    console.table(normalizedMaterial);
    console.log("📋 Normalized material details:");
    console.log("  - Name:", normalizedMaterial.name);
    console.log("  - Type:", normalizedMaterial.type);
    console.log("  - URL:", normalizedMaterial.url);
    console.log("  - Content Type:", normalizedMaterial.contentType);
    console.log("🎯 Setting viewMaterialVisible to true");

    setSelectedMaterial(normalizedMaterial);
    setViewMaterialVisible(true);
    setIframeError(false); // Reset iframe error state
    setForceUpdate(prev => prev + 1); // Force re-render

    console.log("✅ Modal state should be updated");

    // Additional debug - check if modal will render
    setTimeout(() => {
      console.log("🔍 Post-update check:", {
        viewMaterialVisible: true,
        selectedMaterial: normalizedMaterial,
        forceUpdate: forceUpdate + 1
      });
    }, 100);

    // Mark as viewed in our local state
    if (!material.viewed) {
      const updatedLectures = lectures.map(lecture => ({
        ...lecture,
        materials: lecture.materials.map(m =>
          m.id === material.id ? { ...m, viewed: true } : m
        )
      }));

      setLectures(updatedLectures);
    }
  };
  
  // Student statistics
  const calculateStudentProgress = () => {
    const allMaterials = lectures.flatMap(lecture => lecture.materials);
    const viewedCount = allMaterials.filter(m => m.viewed).length;
    const totalCount = allMaterials.length;
    
    return {
      viewedCount,
      totalCount,
      percentage: totalCount > 0 ? Math.round((viewedCount / totalCount) * 100) : 0
    };
  };
  
  // Helper function to generate Collapse items for student view
  const generateStudentCollapseItems = () => {
    return lectures.map(lecture => ({
      key: lecture.id,
      label: (
        <Space>
          <Text strong>{lecture.title}</Text>
          {lecture.isCompleted && <Tag color="green" icon={<CheckOutlined />}>Đã hoàn thành</Tag>}
        </Space>
      ),
      children: (
        <div>
          <MarkdownRenderer content={lecture.description || lecture.content} />
          {lecture.materials && lecture.materials.length > 0 && (
            <>
              <Title level={5} style={{ marginTop: 20 }}>Tài liệu bài giảng:</Title>
              <List
                dataSource={lecture.materials}
                renderItem={material => (
                  <List.Item
                    actions={[
                      <Button 
                        type="primary"
                        key="view" 
                        icon={<EyeOutlined />} 
                        onClick={() => handleViewMaterial(material)}
                      >
                        Xem
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        material.type === 'pdf' ? (
                          <span style={{ fontSize: 24 }}>📄</span>
                        ) : material.type === 'video' ? (
                          <span style={{ fontSize: 24 }}>🎬</span>
                        ) : material.type === 'link' ? (
                          <span style={{ fontSize: 24 }}>🔗</span>
                        ) : (
                          <span style={{ fontSize: 24 }}>📝</span>
                        )
                      }
                      title={material.name}
                      description={material.contentType === 'video/youtube' ? 'Video YouTube' : 'Tài liệu'}
                    />
                  </List.Item>
                )}
              />
            </>
          )}
        </div>
      )
    }));
  };

  // Teacher view components
  const renderTeacherView = () => {
    return (
      <div className="teacher-lectures-view">
        <div style={{ marginBottom: 16 }}>
          <Title level={4}>Quản lý bài giảng</Title>
          
          {/* Course selection */}
          <Card title="Chọn khóa học" style={{ marginBottom: 16 }}>
            {isLoadingCourses ? (
              <Spin tip="Đang tải khóa học..." />
            ) : courseError ? (
              <div style={{ color: 'red' }}>{courseError}</div>
            ) : courses.length > 0 ? (
              <Space wrap>
                {courses.map(course => (
                  <Button
                    key={course.id}
                    type={selectedCourse?.id === course.id ? 'primary' : 'default'}
                    onClick={() => setSelectedCourse(course)}
                  >
                    {course.name}
                  </Button>
                ))}
              </Space>
            ) : (
              <Empty description="Không có khóa học nào" />
            )}
          </Card>
          
          {/* Create lecture buttons */}
          {selectedCourse && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 }}>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setLectureModalVisible(true)}
                >
                  Thêm bài giảng đơn giản
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setShowAdvancedModal(true)}
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                >
                  Tạo bài giảng nâng cao
                </Button>
              </Space>
            </div>
          )}
        </div>
        
        {/* Display lectures for selected course */}
        {selectedCourse ? (
          <Card title={`Bài giảng cho: ${selectedCourse.name}`} style={{ marginBottom: 16 }}>
            {isLoadingLectures ? (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <Spin tip="Đang tải bài giảng..." />
              </div>
            ) : lectureError ? (
              <div style={{ color: 'red', textAlign: 'center', padding: 16 }}>{lectureError}</div>
            ) : lectures.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={lectures}
                renderItem={lecture => (
                  <List.Item
                    key={lecture.id}
                    actions={[
                      <Button onClick={() => handleEditLecture(lecture)}>Sửa</Button>,
                      <Button danger onClick={() => handleDeleteLecture(lecture)}>Xóa</Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={lecture.title}
                      description={
                        <div>
                          <div style={{ marginBottom: 12 }}>
                            <MarkdownRenderer content={lecture.description || lecture.content} />
                          </div>
                          {lecture.materials && lecture.materials.length > 0 && (
                            <div>
                              <Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>
                                Tài liệu bài giảng ({lecture.materials.length}):
                              </Title>
                              <List
                                size="small"
                                dataSource={lecture.materials}
                                renderItem={material => (
                                  <List.Item
                                    actions={[
                                      <Button
                                        size="small"
                                        type="primary"
                                        icon={<EyeOutlined />}
                                        onClick={() => handleViewMaterial(material)}
                                      >
                                        Xem
                                      </Button>
                                    ]}
                                  >
                                    <List.Item.Meta
                                      avatar={
                                        material.contentType?.includes('video') || material.type === 'video' ? (
                                          <span style={{ fontSize: 20 }}>🎬</span>
                                        ) : material.contentType?.includes('pdf') || material.type === 'pdf' ? (
                                          <span style={{ fontSize: 20 }}>📄</span>
                                        ) : material.type === 'link' ? (
                                          <span style={{ fontSize: 20 }}>🔗</span>
                                        ) : (
                                          <span style={{ fontSize: 20 }}>📝</span>
                                        )
                                      }
                                      title={material.fileName || material.name}
                                      description={
                                        material.contentType === 'video/youtube' ? 'Video YouTube' :
                                        material.contentType || 'Tài liệu'
                                      }
                                    />
                                  </List.Item>
                                )}
                              />
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Không có bài giảng nào cho khóa học này" />
            )}
          </Card>
        ) : (
          <Card>
            <Empty description="Vui lòng chọn một khóa học" />
          </Card>
        )}
      </div>
    );
  };
  
  // Student view components
  const renderStudentView = () => {
    return (
      <div className="student-lectures-view">
        <div style={{ marginBottom: 16 }}>
          <Title level={4}>Bài giảng và Tài liệu</Title>
          
          {/* Course selection */}
          <Card title="Chọn khóa học" style={{ marginBottom: 16 }}>
            {isLoadingCourses ? (
              <Spin tip="Đang tải khóa học..." />
            ) : courseError ? (
              <div style={{ color: 'red' }}>{courseError}</div>
            ) : courses.length > 0 ? (
              <Space wrap>
                {courses.map(course => (
                  <Button
                    key={course.id}
                    type={selectedCourse?.id === course.id ? 'primary' : 'default'}
                    onClick={() => setSelectedCourse(course)}
                  >
                    {course.name}
                  </Button>
                ))}
              </Space>
            ) : (
              <Empty description="Không có khóa học nào" />
            )}
          </Card>
        </div>
        
        {/* Display lectures for selected course */}
        {selectedCourse ? (
          <Card title={`Bài giảng cho: ${selectedCourse.name}`} style={{ marginBottom: 16 }}>
            {isLoadingLectures ? (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <Spin tip="Đang tải bài giảng..." />
              </div>
            ) : lectureError ? (
              <div style={{ color: 'red', textAlign: 'center', padding: 16 }}>{lectureError}</div>
            ) : lectures.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={lectures}
                renderItem={lecture => (
                  <List.Item key={lecture.id}>
                    <List.Item.Meta
                      title={lecture.title}
                      description={lecture.description}
                    />
                    
                    {/* Display materials for this lecture */}
                    {lecture.materials && lecture.materials.length > 0 ? (
                      <div style={{ marginTop: 16 }}>
                        <Text strong>Tài liệu:</Text>
                        <List
                          itemLayout="horizontal"
                          dataSource={lecture.materials}
                          renderItem={material => {
                            // Determine material type icon
                            let icon;
                            if (material.contentType === 'video/youtube' || material.type === 'video') {
                              icon = <span style={{ fontSize: 24 }}>🎬</span>;
                            } else if (material.contentType?.includes('pdf') || material.type === 'pdf') {
                              icon = <span style={{ fontSize: 24 }}>📄</span>;
                            } else if (material.contentType?.includes('doc') || material.type === 'doc') {
                              icon = <span style={{ fontSize: 24 }}>📝</span>;
                            } else {
                              icon = <span style={{ fontSize: 24 }}>🔗</span>;
                            }
                            
                            return (
                              <List.Item
                                actions={[
                                  <Button 
                                    type="primary"
                                    key="view" 
                                    icon={<EyeOutlined />} 
                                    onClick={() => handleViewMaterial(material)}
                                  >
                                    Xem
                                  </Button>
                                ]}
                              >
                                <List.Item.Meta
                                  avatar={icon}
                                  title={material.fileName || material.name}
                                  description={material.contentType === 'video/youtube' ? 'Video YouTube' : 'Tài liệu'}
                                />
                              </List.Item>
                            );
                          }}
                        />
                      </div>
                    ) : (
                      <Text type="secondary">Chưa có tài liệu cho bài giảng này</Text>
                    )}
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Không có bài giảng nào cho khóa học này" />
            )}
          </Card>
        ) : (
          <Card>
            <Empty description="Vui lòng chọn một khóa học" />
          </Card>
        )}
      </div>
    );
  };  // Shared modals and forms
  const renderLectureModal = () => {
    return (<Modal
        title={editingLecture ? "Chỉnh sửa bài giảng" : "Thêm bài giảng mới"}
        open={lectureModalVisible}
        onCancel={() => setLectureModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLectureFormSubmit}
        >
          <Form.Item
            name="title"
            label="Tiêu đề bài giảng"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài giảng' }]}
          >
            <Input placeholder="Ví dụ: Bài 1: Giới thiệu Java" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea 
              rows={4} 
              placeholder="Mô tả ngắn về nội dung bài giảng"
            />
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button style={{ marginRight: 8 }} onClick={() => setLectureModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingLecture ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    );
  };
  
  const renderMaterialModal = () => {
    return (      <Modal
        title={materialModalMode === 'add' ? "Thêm tài liệu mới" : "Chỉnh sửa tài liệu"}
        open={materialModalVisible}
        onCancel={() => setMaterialModalVisible(false)}
        footer={null}
      >
        <Form
          form={materialForm}
          layout="vertical"
          onFinish={handleMaterialFormSubmit}
        >
          <Form.Item
            name="name"
            label="Tên tài liệu"
            rules={[{ required: true, message: 'Vui lòng nhập tên tài liệu' }]}
          >
            <Input placeholder="Ví dụ: Slide bài giảng tuần 1" />
          </Form.Item>
            <Form.Item
            name="type"
            label="Loại tài liệu"
            rules={[{ required: true, message: 'Vui lòng chọn loại tài liệu' }]}
            initialValue="pdf"
          >
            <Select
              style={{ width: '100%' }}
              options={[
                { value: 'pdf', label: '📄 Tài liệu PDF' },
                { value: 'doc', label: '📝 Tài liệu Word/Excel' },
                { value: 'video', label: '🎬 Video' },
                { value: 'link', label: '🔗 Đường dẫn' }
              ]}
            />
          </Form.Item>            <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              if (type === 'link') {
                return (
                  <Form.Item
                    name="url"
                    label="Đường dẫn"
                    rules={[
                      { required: true, message: 'Vui lòng nhập đường dẫn' },
                      { type: 'url', message: 'Vui lòng nhập đường dẫn hợp lệ' }
                    ]}
                  >
                    <Input placeholder="https://example.com/resource" />
                  </Form.Item>
                );
              } else {
                return (
                  <Form.Item
                    name="file"
                    label="Tải lên tệp"
                    valuePropName="fileList"
                    getValueFromEvent={e => {
                      if (Array.isArray(e)) {
                        return e;
                      }
                      return e && e.fileList;
                    }}
                    rules={[{ required: materialModalMode === 'add', message: 'Vui lòng tải lên tệp' }]}
                  >
                    <Upload
                      beforeUpload={() => false}
                      fileList={fileList}
                      onChange={({ fileList }) => setFileList(fileList)}
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />}>Chọn tệp</Button>
                    </Upload>
                  </Form.Item>
                );
              }
            }}
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button style={{ marginRight: 8 }} onClick={() => setMaterialModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {materialModalMode === 'add' ? "Thêm" : "Cập nhật"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    );
  };
  const renderViewMaterialModal = () => {
    console.log("🔺 renderViewMaterialModal — open:", viewMaterialVisible);
    console.log("🎭 renderViewMaterialModal called");
    console.log("📋 selectedMaterial:", selectedMaterial);
    console.log("👁️ viewMaterialVisible:", viewMaterialVisible);

    if (!selectedMaterial) {
      console.log("❌ No selectedMaterial, returning null");
      return null;
    }

    const handleIframeError = () => {
      setIframeError(true);
      message.warning('Không thể hiển thị tài liệu trong cửa sổ này. Vui lòng mở trong tab mới.');
    };

    // Check if the material is a YouTube video
    const isYoutubeVideo = selectedMaterial.contentType === 'video/youtube';
    console.log("🎬 isYoutubeVideo:", isYoutubeVideo);

    // Chỉ coi là markdown khi bạn thực sự muốn hiển thị mô tả text,
    // không phải file:
    const isMarkdownContent = selectedMaterial.type === 'markdown';

    // PDF nhúng
    const isPdf = selectedMaterial.type === 'pdf';
    // Video YouTube
    const isYoutube = selectedMaterial.contentType === 'video/youtube';
    // Video file (mp4, mkv…)
    const isVideo = selectedMaterial.type === 'video' && !isYoutube;
    // Image files
    const isImage = selectedMaterial.contentType?.startsWith('image/') || selectedMaterial.type === 'image';
    
    console.log("📝 isMarkdownContent:", isMarkdownContent);
    console.log("📄 isPdf:", isPdf);
    console.log("🎬 isYoutube:", isYoutube);
    console.log("🎥 isVideo:", isVideo);
    console.log("🖼️ isImage:", isImage);
    console.log("🏷️ Material type:", selectedMaterial.type);
    console.log("🔗 Material URL:", selectedMaterial.url || selectedMaterial.downloadUrl);

    // Special handling for markdown text content from lecture description
    if (isMarkdownContent) {
        console.log("📝 Rendering markdown modal");
        return (
            <Modal
                title={selectedMaterial.title || "Nội dung bài giảng"}
                open={viewMaterialVisible}
                onCancel={() => {
                  console.log("🚪 Markdown modal onCancel called");
                  setViewMaterialVisible(false);
                }}
                footer={null}
                width="80vw"
                style={{ top: 20, zIndex: 1000 }}
                maskStyle={{ zIndex: 999 }}
            >
                <MarkdownRenderer content={selectedMaterial.description} />
            </Modal>
        );
    }
    
    console.log("🎭 Rendering main modal with viewMaterialVisible:", viewMaterialVisible);

    return (      <Modal
        title={selectedMaterial.name}
        open={viewMaterialVisible}
        onCancel={() => {
          console.log("🚪 Modal onCancel called");
          setViewMaterialVisible(false);
          setIframeError(false);
        }}
        width={800}
        style={{ zIndex: 1000 }}
        maskStyle={{ zIndex: 999 }}
        footer={[
          <Button key="open-new" type="primary" icon={<LinkOutlined />} onClick={() => {
            const url = selectedMaterial.url || selectedMaterial.downloadUrl;
            if (url) {
              // For relative URLs starting with /api/ or /files/, use authenticated download
              if (url.startsWith('/api/') || url.startsWith('/files/')) {
                previewFile(url, selectedMaterial.contentType, selectedMaterial.name);
              } else {
                // For external URLs (http/https), open directly
                const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
                console.log("🔗 Opening external URL:", fullUrl);
                window.open(fullUrl, '_blank');
              }
            } else {
              message.error('Không có đường dẫn để mở tài liệu');
            }
          }}>
            Mở trong tab mới
          </Button>,
          <Button key="close" onClick={() => {
            console.log("🚪 Modal close button clicked");
            setViewMaterialVisible(false);
            setIframeError(false);
          }}>
            Đóng
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center' }}>
          {isPdf && (
            <div>
              {!iframeError ? (
                <iframe
                  src={selectedMaterial.url || selectedMaterial.downloadUrl}
                  title={selectedMaterial.name}
                  width="100%"
                  height="500px"
                  style={{ border: 'none' }}
                  onError={handleIframeError}
                  onLoad={(e) => {
                    // Check if iframe loaded successfully
                    try {
                      const iframeDoc = e.target.contentDocument || e.target.contentWindow?.document;
                      if (!iframeDoc || iframeDoc.title === 'Example Domain' || 
                          iframeDoc.body?.textContent?.includes('Example Domain')) {
                        handleIframeError();
                      }
                    } catch (error) {
                      // Cross-origin error - this is expected for external PDFs
                      console.log('Cross-origin iframe access (expected for external PDFs)');
                    }
                  }}
                />
              ) : (
                <div className="p-8">
                  <p className="mb-4">❌ Không thể hiển thị PDF trong cửa sổ này</p>
                  <p className="mb-4">Tài liệu PDF yêu cầu xác thực hoặc có hạn chế bảo mật.</p>
                  <p className="mb-4">💡 <strong>Giải pháp:</strong> Sử dụng nút "Mở PDF trong tab mới" bên dưới để xem file với xác thực.</p>
                  <Button type="primary" size="large" icon={<LinkOutlined />} onClick={() => {
                    const url = selectedMaterial.url || selectedMaterial.downloadUrl;
                    if (url?.startsWith('/api/') || url?.startsWith('/files/')) {
                      previewFile(url, selectedMaterial.contentType, selectedMaterial.name);
                    } else {
                      const fullUrl = url?.startsWith('http') ? url : `${window.location.origin}${url}`;
                      window.open(fullUrl, '_blank');
                    }
                  }}>
                    Mở PDF trong tab mới
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* Special case for YouTube videos */}
          {isYoutube && (
            <>
              <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>
                Nếu video không hiển thị, có thể do trình chặn quảng cáo. Vui lòng thử "Mở trong tab mới".
              </Typography.Text>
              <iframe
                key={selectedMaterial.id}
                width="100%"
                height="450px"
                style={{ border: 'none' }}
                allowFullScreen
                src={selectedMaterial.downloadUrl}
                title={selectedMaterial.name || "YouTube Video"}
                onError={() => {
                  message.error('Không thể tải video YouTube. Vui lòng thử mở trong tab mới.');
                }}
              />
            </>
          )}
          
          {/* Regular videos */}
          {isVideo && (
            <video
              src={selectedMaterial.url || selectedMaterial.downloadUrl}
              controls
              width="100%"
              height="auto"
              style={{ maxHeight: '500px' }}
              onError={() => {
                message.error('Không thể tải video. Vui lòng thử mở trong tab mới.');
              }}
            />
          )}
          
          {/* Image files */}
          {isImage && (
            <div>
              <img
                src={selectedMaterial.url || selectedMaterial.downloadUrl}
                alt={selectedMaterial.name}
                style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                onError={() => {
                  message.error('Không thể tải hình ảnh. Vui lòng thử mở trong tab mới.');
                }}
              />
            </div>
          )}
          
          {selectedMaterial.type === 'link' && (
            <div>
              <p>📄 Tài liệu trực tuyến</p>
              <p className="mb-4">Nhấn để mở tài liệu trong tab mới:</p>
              <Button type="primary" size="large" icon={<LinkOutlined />} onClick={() => {
                const url = selectedMaterial.url || selectedMaterial.downloadUrl;
                if (url?.startsWith('/api/') || url?.startsWith('/files/')) {
                  previewFile(url, selectedMaterial.contentType, selectedMaterial.name);
                } else {
                  const fullUrl = url?.startsWith('http') ? url : `${window.location.origin}${url}`;
                  window.open(fullUrl, '_blank');
                }
              }}>
                Mở liên kết
              </Button>
            </div>
          )}
          
          {selectedMaterial.type === 'doc' && (
            <div>
              <p>📄 Tài liệu văn bản</p>
              <p className="mb-4">Nhấn để mở hoặc tải xuống tài liệu:</p>
              <Button type="primary" size="large" icon={<UploadOutlined />} onClick={() => {
                const url = selectedMaterial.url || selectedMaterial.downloadUrl;
                if (url?.startsWith('/api/') || url?.startsWith('/files/')) {
                  previewFile(url, selectedMaterial.contentType, selectedMaterial.name);
                } else {
                  const fullUrl = url?.startsWith('http') ? url : `${window.location.origin}${url}`;
                  window.open(fullUrl, '_blank');
                }
              }}>
                Mở tài liệu
              </Button>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Render appropriate view based on user role
  const renderMainContent = () => {
    console.log('LecturesPageNew: Rendering main content with role:', userRole);

    // If no role is detected, show error message
    if (!userRole || !userId) {
      console.log('LecturesPageNew: No role or userId detected', { userRole, userId });
      return (
        <div className="text-center p-8">
          <h2>⚠️ Lỗi phân quyền</h2>
          <p>Không thể xác định vai trò người dùng. Vui lòng đăng nhập lại.</p>
          <Button type="primary" onClick={() => window.location.href = '/login'}>
            Đăng nhập lại
          </Button>
        </div>
      );
    }

    // Student view for role '1' or 'STUDENT'
    if (userRole === '1' || userRole === 'STUDENT') {
      console.log('LecturesPageNew: Rendering student view');
      return renderStudentView();
    }

    // Teacher view for role '2' or 'TEACHER'
    if (userRole === '2' || userRole === 'TEACHER') {
      console.log('LecturesPageNew: Rendering teacher view');
      return renderTeacherView();
    }

    // Admin view for role '0' or 'ADMIN'
    if (userRole === '0' || userRole === 'ADMIN') {
      console.log('LecturesPageNew: Rendering admin view (teacher interface)');
      return renderTeacherView(); // Admins can see teacher view
    }

    // Manager view for role '3' or 'MANAGER'
    if (userRole === '3' || userRole === 'MANAGER') {
      console.log('LecturesPageNew: Rendering manager view (teacher interface)');
      return renderTeacherView(); // Managers can see teacher view
    }

    // If role is not recognized, show error
    console.log('LecturesPageNew: Unrecognized role:', userRole);
    return (
      <div className="text-center p-8">
        <h2>⚠️ Vai trò không được hỗ trợ</h2>
        <p>Vai trò "{userRole}" không được hỗ trợ cho trang này.</p>
        <Button type="primary" onClick={() => window.location.href = '/login'}>
          Đăng nhập lại
        </Button>
      </div>
    );
  };

  // Debug all modal states
  console.log("🎭 All modal states:", {
    viewMaterialVisible,
    materialModalVisible,
    lectureModalVisible,
    showAdvancedModal,
    selectedMaterial: !!selectedMaterial
  });

  return (
    <div className="lectures-page">
      {/* Main content based on user role */}
      {renderMainContent()}

      {/* Shared modals */}
      {renderLectureModal()}
      {renderMaterialModal()}
      {renderViewMaterialModal()}
        {/* Advanced Lecture Creation Modal */}
      <CreateLectureModal
        open={showAdvancedModal}
        onCancel={() => {
          setShowAdvancedModal(false);
          setEditingLecture(null);
        }}
        onSuccess={handleAdvancedLectureCreated}
        courseId={selectedCourse?.id}
        editingLecture={editingLecture}
      />
    </div>
  );
}

export default LecturesPageNew;