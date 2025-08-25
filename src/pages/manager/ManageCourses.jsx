import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, message, Modal, Row, Select, Space, Statistic, Table, Tabs, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { managerCourseService } from '../../services/managerCourseService';
import { safeDataSource } from '../../utils/tableUtils';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    fetchCourses();
    fetchStats();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const result = await managerCourseService.getAllCourseTemplates();
      if (result.success) {
        setCourses(Array.isArray(result.data) ? result.data : []);
      } else {
        message.error(result.error || 'Không thể tải danh sách khóa học');
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      message.error('Không thể tải danh sách khóa học');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await managerCourseService.getCourseEnrollmentStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const columns = [
    {
      title: 'Tên Khóa Học',
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
      title: 'Giáo Viên',
      dataIndex: 'instructorName',
      key: 'instructorName',
      render: (instructorName) => instructorName || 'Đang cập nhật'
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price?.toLocaleString() || 0} VNĐ`
    },
    {
      title: 'Thời lượng',
      dataIndex: 'totalWeeks',
      key: 'totalWeeks',
      render: (totalWeeks) => totalWeeks ? `${totalWeeks} tuần` : 'Đang cập nhật'
    },
    {
      title: 'Thao Tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleView = (course) => {
    message.info(`Xem chi tiết khóa học: ${course.title}`);
    // TODO: Implement course detail modal
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    form.setFieldsValue(course);
    setIsModalVisible(true);
  };

  const handleDelete = async (course) => {
    Modal.confirm({
      title: 'Xác nhận xóa khóa học',
      content: 'Bạn có chắc chắn muốn xóa khóa học "' + course.title + '"?',
      onOk: async () => {
        try {
          const result = await managerCourseService.deleteCourseTemplate(course.id);
          if (result.success) {
            message.success('Xóa khóa học thành công');
            fetchCourses();
            fetchStats(); // Refresh stats
          } else {
            message.error(result.error || 'Không thể xóa khóa học');
          }
        } catch (error) {
          console.error('Error deleting course:', error);
          message.error('Không thể xóa khóa học');
        }
      }
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      let result;
      
      if (editingCourse) {
        // Update existing course
        result = await managerCourseService.updateCourseTemplate(editingCourse.id, values);
        if (result.success) {
          message.success('Cập nhật khóa học thành công');
        } else {
          message.error(result.error || 'Không thể cập nhật khóa học');
          return;
        }
      } else {
        // Add new course
        result = await managerCourseService.createCourseTemplate(values);
        if (result.success) {
          message.success('Thêm khóa học thành công');
        } else {
          message.error(result.error || 'Không thể tạo khóa học');
          return;
        }
      }
      
      setIsModalVisible(false);
      form.resetFields();
      setEditingCourse(null);
      fetchCourses();
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error saving course:', error);
      message.error('Không thể lưu thông tin khóa học');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingCourse(null);
  };

  const handleAddNew = () => {
    setEditingCourse(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Quản lý khóa học hệ thống</h1>
        <p className="text-gray-600">Quản lý tất cả khóa học trong hệ thống e-learning</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng khóa học"
              value={courses.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng đăng ký"
              value={stats.totalEnrollments || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Doanh thu"
              value={stats.totalRevenue || 0}
              suffix="VNĐ"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Học viên hoạt động"
              value={stats.activeStudents || 0}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="📚 Danh sách khóa học" key="courses">
            <div className="mb-4">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddNew}
              >
                Thêm khóa học mới
              </Button>
            </div>
            <Table 
              columns={columns} 
              dataSource={safeDataSource(courses, 'ManageCourses')} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="📊 Thống kê" key="analytics">
            <div className="text-center py-8">
              <h3>Thống kê chi tiết</h3>
              <p className="text-gray-600">
                Tính năng thống kê chi tiết sẽ được phát triển trong phiên bản tiếp theo
              </p>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingCourse ? 'Sửa khóa học' : 'Thêm khóa học mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="Tên khóa học"
                rules={[{ required: true, message: 'Vui lòng nhập tên khóa học' }]}
              >
                <Input placeholder="Nhập tên khóa học" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Danh mục"
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
                name="level"
                label="Cấp độ"
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
                name="price"
                label="Giá (VNĐ)"
                rules={[{ required: true, message: 'Vui lòng nhập giá khóa học' }]}
              >
                <Input type="number" placeholder="Nhập giá khóa học" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Thời lượng (giờ)"
                rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}
              >
                <Input type="number" placeholder="Nhập thời lượng" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả khóa học' }]}
              >
                <TextArea rows={4} placeholder="Nhập mô tả khóa học" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="teacherName"
                label="Giáo viên"
                rules={[{ required: true, message: 'Vui lòng nhập tên giáo viên' }]}
              >
                <Input placeholder="Nhập tên giáo viên" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageCourses;
