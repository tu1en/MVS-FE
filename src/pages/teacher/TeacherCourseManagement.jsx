import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Table, 
  Tag, 
  Statistic, 
  Tabs, 
  Alert,
  Modal,
  Form,
  Input,
  Select,
  message,
  Spin
} from 'antd';
import {
  PlusOutlined,
  BookOutlined,
  EditOutlined,
  EyeOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { teacherCourseService } from '../../services/teacherCourseService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const TeacherCourseManagement = () => {
  const [loading, setLoading] = useState(false);
  const [courseTemplates, setCourseTemplates] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState({});
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesResult, enrollmentsResult] = await Promise.all([
        teacherCourseService.getCourseTemplates(),
        teacherCourseService.getCourseEnrollments()
      ]);

      if (templatesResult.success) {
        setCourseTemplates(templatesResult.data);
      }

      if (enrollmentsResult.success) {
        setEnrollmentData(enrollmentsResult.data);
      }
    } catch (error) {
      console.error('Error loading teacher course data:', error);
      message.error('Không thể tải dữ liệu khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (values) => {
    try {
      const result = await teacherCourseService.createCourseTemplate(values);
      if (result.success) {
        message.success('Tạo khóa học thành công!');
        setCreateModalVisible(false);
        form.resetFields();
        loadData(); // Reload data
      } else {
        message.error(result.error || 'Không thể tạo khóa học');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      message.error('Đã xảy ra lỗi khi tạo khóa học');
    }
  };

  const handleEditCourse = async (values) => {
    try {
      const result = await teacherCourseService.updateCourseTemplate(selectedCourse.id, values);
      if (result.success) {
        message.success('Cập nhật khóa học thành công!');
        setEditModalVisible(false);
        setSelectedCourse(null);
        form.resetFields();
        loadData(); // Reload data
      } else {
        message.error(result.error || 'Không thể cập nhật khóa học');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      message.error('Đã xảy ra lỗi khi cập nhật khóa học');
    }
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    form.setFieldsValue(course);
    setEditModalVisible(true);
  };

  const courseColumns = [
    {
      title: 'Tên khóa học',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        const colors = {
          'Frontend': 'blue',
          'Backend': 'green', 
          'Full-Stack': 'purple',
          'Data Science': 'orange'
        };
        return <Tag color={colors[category] || 'default'}>{category}</Tag>;
      }
    },
    {
      title: 'Cấp độ',
      dataIndex: 'level',
      key: 'level',
      render: (level) => {
        const colors = {
          'Beginner': 'green',
          'Intermediate': 'orange',
          'Advanced': 'red'
        };
        return <Tag color={colors[level] || 'default'}>{level}</Tag>;
      }
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price?.toLocaleString() || 0} VNĐ`
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <div>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => message.info(`Xem chi tiết khóa học: ${record.title}`)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Sửa
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" tip="Đang tải dữ liệu khóa học..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Quản lý khóa học</h1>
        <p className="text-gray-600">Tạo và quản lý các khóa học mà bạn giảng dạy</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng khóa học"
              value={courseTemplates.length}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Học viên đã đăng ký"
              value={enrollmentData.totalEnrollments || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Khóa học đang hoạt động"
              value={enrollmentData.totalCourses || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs defaultActiveKey="courses">
          <TabPane tab="📚 Khóa học của tôi" key="courses">
            <div className="mb-4">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                Tạo khóa học mới
              </Button>
            </div>
            
            {courseTemplates.length === 0 ? (
              <Alert
                message="Chưa có khóa học nào"
                description="Bạn chưa tạo khóa học nào. Hãy tạo khóa học đầu tiên của bạn!"
                type="info"
                showIcon
              />
            ) : (
              <Table
                columns={courseColumns}
                dataSource={courseTemplates}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            )}
          </TabPane>

          <TabPane tab="👥 Học viên đăng ký" key="enrollments">
            <Alert
              message="Tính năng đang phát triển"
              description="Chức năng quản lý học viên đăng ký sẽ được hoàn thiện trong phiên bản tiếp theo."
              type="warning"
              showIcon
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Create Course Modal */}
      <Modal
        title="Tạo khóa học mới"
        visible={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateCourse}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Tên khóa học"
                name="title"
                rules={[{ required: true, message: 'Vui lòng nhập tên khóa học' }]}
              >
                <Input placeholder="Nhập tên khóa học" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Danh mục"
                name="category"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select placeholder="Chọn danh mục">
                  <Option value="Frontend">Frontend</Option>
                  <Option value="Backend">Backend</Option>
                  <Option value="Full-Stack">Full-Stack</Option>
                  <Option value="Data Science">Data Science</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Cấp độ"
                name="level"
                rules={[{ required: true, message: 'Vui lòng chọn cấp độ' }]}
              >
                <Select placeholder="Chọn cấp độ">
                  <Option value="Beginner">Beginner</Option>
                  <Option value="Intermediate">Intermediate</Option>
                  <Option value="Advanced">Advanced</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giá (VNĐ)"
                name="price"
                rules={[{ required: true, message: 'Vui lòng nhập giá khóa học' }]}
              >
                <Input type="number" placeholder="Nhập giá khóa học" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Thời lượng (giờ)"
                name="duration"
                rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}
              >
                <Input type="number" placeholder="Nhập thời lượng" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Mô tả"
                name="description"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả khóa học' }]}
              >
                <TextArea rows={4} placeholder="Nhập mô tả khóa học" />
              </Form.Item>
            </Col>
          </Row>
          <div className="text-right">
            <Button onClick={() => setCreateModalVisible(false)} className="mr-2">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Tạo khóa học
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        title="Chỉnh sửa khóa học"
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedCourse(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleEditCourse}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Tên khóa học"
                name="title"
                rules={[{ required: true, message: 'Vui lòng nhập tên khóa học' }]}
              >
                <Input placeholder="Nhập tên khóa học" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Danh mục"
                name="category"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select placeholder="Chọn danh mục">
                  <Option value="Frontend">Frontend</Option>
                  <Option value="Backend">Backend</Option>
                  <Option value="Full-Stack">Full-Stack</Option>
                  <Option value="Data Science">Data Science</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Cấp độ"
                name="level"
                rules={[{ required: true, message: 'Vui lòng chọn cấp độ' }]}
              >
                <Select placeholder="Chọn cấp độ">
                  <Option value="Beginner">Beginner</Option>
                  <Option value="Intermediate">Intermediate</Option>
                  <Option value="Advanced">Advanced</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giá (VNĐ)"
                name="price"
                rules={[{ required: true, message: 'Vui lòng nhập giá khóa học' }]}
              >
                <Input type="number" placeholder="Nhập giá khóa học" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Thời lượng (giờ)"
                name="duration"
                rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}
              >
                <Input type="number" placeholder="Nhập thời lượng" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Mô tả"
                name="description"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả khóa học' }]}
              >
                <TextArea rows={4} placeholder="Nhập mô tả khóa học" />
              </Form.Item>
            </Col>
          </Row>
          <div className="text-right">
            <Button onClick={() => setEditModalVisible(false)} className="mr-2">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherCourseManagement;