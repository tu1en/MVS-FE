import {
    BellOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    NotificationOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    List,
    message,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Spin,
    Switch,
    Tag,
    Typography
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import AnnouncementService from '../../services/announcementService';
import { ApiService } from '../../services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const TeacherAnnouncementsPage = () => {
  // State management
  const [announcements, setAnnouncements] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Form for announcement
  const [form] = Form.useForm();
  
  // Get teacher info from localStorage
  const teacherId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (teacherId && token) {
      fetchAnnouncements();
      fetchClassrooms();
    }
  }, [teacherId, token]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const allAnnouncements = await AnnouncementService.getAnnouncements();
      // Filter announcements created by this teacher
      const teacherAnnouncements = allAnnouncements.filter(
        announcement => announcement.createdBy === parseInt(teacherId)
      );
      setAnnouncements(teacherAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      message.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassrooms = async () => {
    try {
      const response = await ApiService.GetClasses();
      // Filter classrooms for this teacher
      const teacherClassrooms = response.filter(
        classroom => classroom.teacherId === parseInt(teacherId)
      );
      setClassrooms(teacherClassrooms);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    }
  };

  const createAnnouncement = async (values) => {
    try {
      const announcementData = {
        title: values.title,
        content: values.content,
        classroomId: values.classroomId,
        priority: values.priority || 'NORMAL',
        targetAudience: values.targetAudience || 'ALL',
        scheduledDate: values.scheduledDate ? values.scheduledDate.toISOString() : null,
        expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null,
        status: values.isPublished !== false ? 'ACTIVE' : 'ARCHIVED',
        isPinned: values.isPinned || false,
        createdBy: parseInt(teacherId)
      };

      await AnnouncementService.createAnnouncement(announcementData);

      message.success('Đã tạo thông báo thành công');
      setIsModalVisible(false);
      form.resetFields();
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      message.error('Không thể tạo thông báo');
    }
  };

  const updateAnnouncement = async (values) => {
    try {
      const announcementData = {
        ...editingAnnouncement,
        title: values.title,
        content: values.content,
        classroomId: values.classroomId,
        priority: values.priority,
        targetAudience: values.targetAudience,
        scheduledDate: values.scheduledDate ? values.scheduledDate.toISOString() : null,
        expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null,
        status: values.isPublished ? 'ACTIVE' : 'ARCHIVED',
        isPinned: values.isPinned
      };

      await AnnouncementService.updateAnnouncement(editingAnnouncement.id, announcementData);

      message.success('Đã cập nhật thông báo thành công');
      setIsModalVisible(false);
      setEditingAnnouncement(null);
      form.resetFields();
      fetchAnnouncements();
    } catch (error) {
      console.error('Error updating announcement:', error);
      message.error('Không thể cập nhật thông báo');
    }
  };

  const deleteAnnouncement = async (announcementId) => {
    try {
      await AnnouncementService.deleteAnnouncement(announcementId);

      message.success('Đã xóa thông báo thành công');
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      message.error('Không thể xóa thông báo');
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    form.setFieldsValue({
      title: announcement.title,
      content: announcement.content,
      classroomId: announcement.classroomId,
      priority: announcement.priority,
      targetAudience: announcement.targetAudience,
      scheduledDate: announcement.scheduledDate ? dayjs(announcement.scheduledDate) : null,
      expiryDate: announcement.expiryDate ? dayjs(announcement.expiryDate) : null,
      isPublished: announcement.status === 'ACTIVE',
      isPinned: announcement.isPinned
    });
    setIsModalVisible(true);
  };

  const handleSubmit = (values) => {
    if (editingAnnouncement) {
      updateAnnouncement(values);
    } else {
      createAnnouncement(values);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingAnnouncement(null);
    form.resetFields();
  };

  // Filter announcements
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      announcement.content?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'published' && announcement.status === 'ACTIVE') ||
      (filterStatus === 'draft' && announcement.status === 'ARCHIVED') ||
      (filterStatus === 'pinned' && announcement.isPinned);
    
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'red';
      case 'HIGH': return 'orange';
      case 'NORMAL': return 'blue';
      case 'LOW': return 'green';
      default: return 'blue';
    }
  };

  const getStatusColor = (announcement) => {
    if (announcement.status === 'ARCHIVED') return 'default';
    if (announcement.isPinned) return 'gold';
    return 'green';
  };

  const getStatusText = (announcement) => {
    if (announcement.status === 'ARCHIVED') return 'Nháp';
    if (announcement.isPinned) return 'Đã ghim';
    return 'Đã xuất bản';
  };

  return (
    <div className="p-6">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div className="flex justify-between items-center mb-6">
            <Title level={2}>
              <NotificationOutlined className="mr-2" />
              Quản lý thông báo
            </Title>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Tạo thông báo mới
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchAnnouncements}
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
          </div>
        </Col>

        {/* Filters */}
        <Col span={24}>
          <Card size="small">
            <Row gutter={[16, 16]} align="middle">
              <Col span={8}>
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Tìm kiếm thông báo..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
              <Col span={6}>
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: '100%' }}
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="published">Đã xuất bản</Option>
                  <Option value="draft">Nháp</Option>
                  <Option value="pinned">Đã ghim</Option>
                </Select>
              </Col>
              <Col span={10}>
                <Text type="secondary">
                  Tổng cộng: {filteredAnnouncements.length} thông báo
                </Text>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Announcements List */}
        <Col span={24}>
          <Spin spinning={loading}>
            <List
              grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
              dataSource={filteredAnnouncements}
              renderItem={(announcement) => (
                <List.Item>
                  <Card
                    size="small"
                    actions={[
                      <EyeOutlined key="view" title="Xem chi tiết" />,
                      <EditOutlined 
                        key="edit" 
                        title="Chỉnh sửa"
                        onClick={() => handleEdit(announcement)}
                      />,
                      <Popconfirm
                        title="Bạn có chắc chắn muốn xóa thông báo này?"
                        onConfirm={() => deleteAnnouncement(announcement.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                      >
                        <DeleteOutlined key="delete" title="Xóa" />
                      </Popconfirm>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div className="flex justify-between items-start">
                          <Text strong className="flex-1" ellipsis>
                            {announcement.title}
                          </Text>
                          <div className="flex flex-col gap-1 ml-2">
                            <Tag color={getStatusColor(announcement)}>
                              {getStatusText(announcement)}
                            </Tag>
                            <Tag color={getPriorityColor(announcement.priority)}>
                              {announcement.priority || 'NORMAL'}
                            </Tag>
                          </div>
                        </div>
                      }
                      description={
                        <div>
                          <Paragraph 
                            ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}
                            className="mb-2"
                          >
                            {announcement.content}
                          </Paragraph>
                          
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>
                              <BellOutlined className="mr-1" />
                              Lớp: {classrooms.find(c => c.id === announcement.classroomId)?.name || 'Tất cả'}
                            </div>
                            <div>
                              Đối tượng: {announcement.targetAudience || 'ALL'}
                            </div>
                            <div>
                              Tạo: {new Date(announcement.createdAt).toLocaleString('vi-VN')}
                            </div>
                            {announcement.scheduledDate && (
                              <div>
                                Lên lịch: {new Date(announcement.scheduledDate).toLocaleString('vi-VN')}
                              </div>
                            )}
                            {announcement.expiryDate && (
                              <div>
                                Hết hạn: {new Date(announcement.expiryDate).toLocaleString('vi-VN')}
                              </div>
                            )}
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          </Spin>
        </Col>
      </Row>

      {/* Create/Edit Modal */}
      <Modal
        title={editingAnnouncement ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề thông báo" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <TextArea rows={6} placeholder="Nhập nội dung thông báo" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="classroomId"
                label="Lớp học"
              >
                <Select
                  placeholder="Chọn lớp học (để trống nếu gửi cho tất cả)"
                  allowClear
                >
                  {classrooms.map(classroom => (
                    <Option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Mức độ ưu tiên"
                initialValue="NORMAL"
              >
                <Select>
                  <Option value="LOW">Thấp</Option>
                  <Option value="NORMAL">Bình thường</Option>
                  <Option value="MEDIUM">Trung bình</Option>
                  <Option value="HIGH">Cao</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="targetAudience"
                label="Đối tượng"
                initialValue="ALL"
              >
                <Select>
                  <Option value="ALL">Tất cả</Option>
                  <Option value="STUDENTS">Học sinh</Option>
                  <Option value="TEACHERS">Giảng viên</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Mức độ ưu tiên"
                initialValue="NORMAL"
              >
                <Select>
                  <Option value="LOW">Thấp</Option>
                  <Option value="NORMAL">Bình thường</Option>
                  <Option value="HIGH">Cao</Option>
                  <Option value="URGENT">Khẩn cấp</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="scheduledDate"
                label="Lên lịch xuất bản"
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }}
                  placeholder="Chọn thời gian xuất bản"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="Ngày hết hạn"
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }}
                  placeholder="Chọn ngày hết hạn"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="isPublished"
                label="Xuất bản ngay"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isPinned"
                label="Ghim thông báo"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingAnnouncement ? 'Cập nhật' : 'Tạo thông báo'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherAnnouncementsPage;
