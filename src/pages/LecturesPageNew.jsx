import {
    CheckOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    LinkOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PlusOutlined,
    UploadOutlined,
    VideoCameraOutlined
} from '@ant-design/icons';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Button,
    Card,
    Col,
    Collapse,
    Dropdown,
    Empty,
    Form,
    Input,
    List,
    Menu,
    message,
    Modal,
    Progress,
    Row,
    Space,
    Spin,
    Statistic,
    Tag,
    Typography,
    Upload
} from 'antd';
import { useEffect, useState } from 'react';

const { Title, Text, Paragraph } = Typography;
// const { TabPane } = Tabs; // Unused
const { Panel } = Collapse;
const { TextArea } = Input;

/**
 * Draggable panel component for lecture items
 */
const SortablePanel = ({ lecture, children, onEdit, onDelete, isTeacher }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: lecture.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Panel
        key={lecture.id}
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {isTeacher && <MenuUnfoldOutlined style={{ marginRight: 8, cursor: 'grab' }} />}
              <span>{lecture.title}</span>
            </div>
            <Space>
              <Tag color="blue">📄 {lecture.materials.filter(m => m.type === 'pdf' || m.type === 'doc').length}</Tag>
              <Tag color="green">🎬 {lecture.materials.filter(m => m.type === 'video').length}</Tag>
              {isTeacher && (
                <Space>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(lecture);
                    }}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(lecture);
                    }}
                  />
                </Space>
              )}
            </Space>
          </div>
        }
      >
        {children}
      </Panel>
    </div>
  );
};

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
  // const [courseList, setCourseList] = useState([]); // Unused
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [form] = Form.useForm();
  const [materialForm] = Form.useForm();
  const [viewMaterialVisible, setViewMaterialVisible] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  
  // Get user info from localStorage
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Debug logging for role detection
  console.log('LecturesPageNew - Role Debug:', { 
    userId, 
    userRole, 
    roleFromStorage: localStorage.getItem('role'),
    token: localStorage.getItem('token') 
  });

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Mock data for testing
  const mockCourses = [
    { id: 1, name: 'Nhập môn lập trình Java', code: 'JAVA101' },
    { id: 2, name: 'Cơ sở dữ liệu', code: 'DB101' },
    { id: 3, name: 'Lập trình Web', code: 'WEB101' },
  ];

  const mockLectures = [
    {
      id: 1,
      title: 'Bài 1: Giới thiệu về Java',
      description: 'Tổng quan về ngôn ngữ lập trình Java và môi trường phát triển',
      courseId: 1,
      order: 1,
      materials: [
        {
          id: 101,
          name: 'Slide giới thiệu Java',
          type: 'pdf',
          url: 'https://example.com/slides.pdf',
          uploadedAt: '2023-06-10T10:00:00Z',
          viewed: false
        },
        {
          id: 102,
          name: 'Video bài giảng Java cơ bản',
          type: 'video',
          url: 'https://example.com/video.mp4',
          uploadedAt: '2023-06-10T11:00:00Z',
          viewed: false
        }
      ]
    },
    {
      id: 2,
      title: 'Bài 2: Biến và Kiểu dữ liệu',
      description: 'Học về các loại biến và kiểu dữ liệu trong Java',
      courseId: 1,
      order: 2,
      materials: [
        {
          id: 103,
          name: 'Slide về biến và kiểu dữ liệu',
          type: 'pdf',
          url: 'https://example.com/variables.pdf',
          uploadedAt: '2023-06-12T10:00:00Z',
          viewed: false
        },
        {
          id: 104,
          name: 'Bài tập thực hành',
          type: 'doc',
          url: 'https://example.com/practice.docx',
          uploadedAt: '2023-06-12T11:00:00Z',
          viewed: false
        }
      ]
    },
    {
      id: 3,
      title: 'Bài 3: Cấu trúc điều khiển',
      description: 'Học về các cấu trúc điều khiển như if-else, switch, vòng lặp',
      courseId: 1,
      order: 3,
      materials: [
        {
          id: 105,
          name: 'Slide về cấu trúc điều khiển',
          type: 'pdf',
          url: 'https://example.com/control.pdf',
          uploadedAt: '2023-06-14T10:00:00Z',
          viewed: false
        }
      ]
    }
  ];

  useEffect(() => {
    // Use mock data instead of actual API calls
    setTimeout(() => {
      // setCourseList(mockCourses); // Unused
      setLectures(mockLectures);
      setSelectedCourse(mockCourses[0]);
      setLoading(false);
    }, 800); // Simulate API delay
  }, [userId, token, userRole]);

  // ===== Lecture Management Functions =====
  const handleAddLecture = () => {
    setEditingLecture(null);
    setLectureModalVisible(true);
    form.resetFields();
  };

  const handleEditLecture = (lecture) => {
    setEditingLecture(lecture);
    setLectureModalVisible(true);
    form.setFieldsValue({
      title: lecture.title,
      description: lecture.description
    });
  };

  const handleDeleteLecture = (lecture) => {
    Modal.confirm({
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
    Modal.confirm({
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

  // Handle DnD sorting
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setLectures((items) => {
        const oldIndex = items.findIndex(item => item.id.toString() === active.id);
        const newIndex = items.findIndex(item => item.id.toString() === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  // View material
  const handleViewMaterial = (material) => {
    setSelectedMaterial(material);
    setViewMaterialVisible(true);
    
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

  // ===== RENDER FUNCTIONS BASED ON USER ROLE =====
  
  // Teacher view components
  const renderTeacherView = () => {
    return (
      <div className="teacher-lectures-view">
        <div className="header-actions" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Quản lý bài giảng</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddLecture}
          >
            Thêm bài giảng mới
          </Button>
        </div>
        
        <Card title={selectedCourse?.name} style={{ marginBottom: 16 }}>
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={lectures.map(l => l.id.toString())} strategy={verticalListSortingStrategy}>
              <Collapse>
                {lectures.map((lecture) => (
                  <SortablePanel 
                    key={lecture.id} 
                    lecture={lecture} 
                    onEdit={() => handleEditLecture(lecture)} 
                    onDelete={() => handleDeleteLecture(lecture)}
                    isTeacher={true}
                  >
                    {lecture.description && (
                      <Paragraph style={{ marginBottom: 16 }}>
                        {lecture.description}
                      </Paragraph>
                    )}
                    
                    <div style={{ marginBottom: 16 }}>
                      <Button 
                        type="primary" 
                        icon={<UploadOutlined />} 
                        onClick={() => handleAddMaterial(lecture.id)}
                      >
                        Tải lên tài liệu
                      </Button>
                    </div>
                    
                    <List
                      itemLayout="horizontal"
                      dataSource={lecture.materials}
                      locale={{ emptyText: <Empty description="Chưa có tài liệu" /> }}
                      renderItem={material => (
                        <List.Item
                          actions={[
                            <Button 
                              key="view" 
                              icon={<EyeOutlined />} 
                              onClick={() => handleViewMaterial(material)}
                            >
                              Xem
                            </Button>,
                            <Button 
                              key="edit" 
                              icon={<EditOutlined />} 
                              onClick={() => handleEditMaterial(lecture.id, material)}
                            >
                              Sửa
                            </Button>,
                            <Button 
                              key="delete" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => handleDeleteMaterial(lecture.id, material.id)}
                            >
                              Xóa
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
                            description={`Đã tải lên: ${new Date(material.uploadedAt).toLocaleDateString()}`}
                          />
                        </List.Item>
                      )}
                    />
                  </SortablePanel>
                ))}
              </Collapse>
            </SortableContext>
          </DndContext>
        </Card>
      </div>
    );
  };
  
  // Student view components
  const renderStudentView = () => {
    const progress = calculateStudentProgress();
    
    return (
      <div className="student-lectures-view">
        <Title level={4}>Bài giảng và tài liệu</Title>
        
        {/* Progress overview */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={18}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Tiến độ học tập</Text>
              </div>
              <Progress 
                percent={progress.percentage} 
                status={progress.percentage === 100 ? "success" : "active"}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="Đã xem" 
                value={progress.viewedCount} 
                suffix={`/${progress.totalCount}`} 
              />
            </Col>
          </Row>
        </Card>
        
        <Card title={selectedCourse?.name}>
          <Collapse>
            {lectures.map((lecture) => (
              <Panel 
                key={lecture.id} 
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{lecture.title}</span>
                    <Space>
                      <Tag color="blue">📄 {lecture.materials.filter(m => m.type === 'pdf' || m.type === 'doc').length}</Tag>
                      <Tag color="green">🎬 {lecture.materials.filter(m => m.type === 'video').length}</Tag>
                    </Space>
                  </div>
                }
              >
                {lecture.description && (
                  <Paragraph style={{ marginBottom: 16 }}>
                    {lecture.description}
                  </Paragraph>
                )}
                
                <List
                  itemLayout="horizontal"
                  dataSource={lecture.materials}
                  locale={{ emptyText: <Empty description="Chưa có tài liệu" /> }}
                  renderItem={material => (
                    <List.Item
                      actions={[
                        <Button 
                          type="primary"
                          key="view" 
                          icon={<EyeOutlined />} 
                          onClick={() => handleViewMaterial(material)}
                        >
                          {material.viewed ? 'Xem lại' : 'Xem'}
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
                        title={
                          <Space>
                            {material.name}
                            {material.viewed && <CheckOutlined style={{ color: 'green' }} />}
                          </Space>
                        }
                        description={`Đã tải lên: ${new Date(material.uploadedAt).toLocaleDateString()}`}
                      />
                    </List.Item>
                  )}
                />
              </Panel>
            ))}
          </Collapse>
        </Card>
      </div>
    );
  };
  
  // Shared modals and forms
  const renderLectureModal = () => {
    return (
      <Modal
        title={editingLecture ? "Chỉnh sửa bài giảng" : "Thêm bài giảng mới"}
        visible={lectureModalVisible}
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
    return (
      <Modal
        title={materialModalMode === 'add' ? "Thêm tài liệu mới" : "Chỉnh sửa tài liệu"}
        visible={materialModalVisible}
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
            <Dropdown
              overlay={
                <Menu
                  onClick={({ key }) => materialForm.setFieldsValue({ type: key })}
                  selectedKeys={[materialForm.getFieldValue('type')]}
                >
                  <Menu.Item key="pdf" icon={<UploadOutlined />}>Tài liệu PDF</Menu.Item>
                  <Menu.Item key="doc" icon={<UploadOutlined />}>Tài liệu Word/Excel</Menu.Item>
                  <Menu.Item key="video" icon={<VideoCameraOutlined />}>Video</Menu.Item>
                  <Menu.Item key="link" icon={<LinkOutlined />}>Đường dẫn</Menu.Item>
                </Menu>
              }
              trigger={['click']}
            >
              <Button style={{ width: '100%', textAlign: 'left' }}>
                {materialForm.getFieldValue('type') === 'pdf' ? 'Tài liệu PDF' :
                 materialForm.getFieldValue('type') === 'doc' ? 'Tài liệu Word/Excel' :
                 materialForm.getFieldValue('type') === 'video' ? 'Video' :
                 materialForm.getFieldValue('type') === 'link' ? 'Đường dẫn' : 'Chọn loại tài liệu'}
                <MenuFoldOutlined style={{ float: 'right', marginTop: 4 }} />
              </Button>
            </Dropdown>
          </Form.Item>
          
          {materialForm.getFieldValue('type') === 'link' ? (
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
          ) : (
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
          )}
          
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
    if (!selectedMaterial) return null;
    
    return (
      <Modal
        title={selectedMaterial.name}
        visible={viewMaterialVisible}
        onCancel={() => setViewMaterialVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setViewMaterialVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center' }}>
          {selectedMaterial.type === 'pdf' && (
            <iframe
              src={selectedMaterial.url}
              title={selectedMaterial.name}
              width="100%"
              height="500px"
              style={{ border: 'none' }}
            />
          )}
          
          {selectedMaterial.type === 'video' && (
            <video
              src={selectedMaterial.url}
              controls
              width="100%"
              height="auto"
              style={{ maxHeight: '500px' }}
            />
          )}
          
          {selectedMaterial.type === 'link' && (
            <div>
              <p>Mở liên kết trong tab mới:</p>
              <Button type="primary" icon={<LinkOutlined />} onClick={() => window.open(selectedMaterial.url, '_blank')}>
                Mở liên kết
              </Button>
            </div>
          )}
          
          {selectedMaterial.type === 'doc' && (
            <div>
              <p>Tài liệu Word/Excel cần được tải về để xem:</p>
              <Button type="primary" icon={<UploadOutlined />} onClick={() => window.open(selectedMaterial.url, '_blank')}>
                Tải xuống
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
    // If no role is detected, show error message
    if (!userRole || !userId) {
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
      return renderStudentView();
    }
    
    // Teacher view for role '2' or 'TEACHER' 
    if (userRole === '2' || userRole === 'TEACHER') {
      return renderTeacherView();
    }
    
    // Admin view for role '0' or 'ADMIN'
    if (userRole === '0' || userRole === 'ADMIN') {
      return renderTeacherView(); // Admins can see teacher view
    }
    
    // Manager view for role '3' or 'MANAGER'
    if (userRole === '3' || userRole === 'MANAGER') {
      return renderTeacherView(); // Managers can see teacher view
    }
    
    // If role is not recognized, show error
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

  return (
    <div className="lectures-page">
      {/* Main content based on user role */}
      {renderMainContent()}
      
      {/* Shared modals */}
      {renderLectureModal()}
      {renderMaterialModal()}
      {renderViewMaterialModal()}
    </div>
  );
}

export default LecturesPageNew; 