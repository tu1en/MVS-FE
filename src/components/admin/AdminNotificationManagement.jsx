import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Space,
  Tag,
  Popconfirm,
  Card,
  Statistic,
  Row,
  Col,
  Tabs
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axiosInstance from '../../config/axiosInstance';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const AdminNotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/notifications/admin/all');
      setNotifications(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách thông báo');
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/api/notifications/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateOrUpdate = async (values) => {
    try {
      const notificationData = {
        ...values,
        scheduledAt: values.scheduledAt ? values.scheduledAt.format('YYYY-MM-DDTHH:mm:ss') : null,
        createdBy: 'Admin' // Replace with actual admin user info
      };

      if (editingNotification) {
        await axiosInstance.put(`/api/notifications/admin/${editingNotification.id}`, notificationData);
        message.success('Cập nhật thông báo thành công!');
      } else {
        await axiosInstance.post('/api/notifications/admin/create', notificationData);
        message.success('Tạo thông báo thành công!');
      }

      setModalVisible(false);
      setEditingNotification(null);
      form.resetFields();
      fetchNotifications();
      fetchStats();
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu thông báo');
      console.error('Error saving notification:', error);
    }
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    form.setFieldsValue({
      ...notification,
      scheduledAt: notification.scheduledAt ? moment(notification.scheduledAt) : null
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/notifications/admin/${id}`);
      message.success('Xóa thông báo thành công!');
      fetchNotifications();
      fetchStats();
    } catch (error) {
      message.error('Không thể xóa thông báo');
      console.error('Error deleting notification:', error);
    }
  };

  const handleSendNow = async (id) => {
    try {
      await axiosInstance.post(`/api/notifications/admin/${id}/send-now`);
      message.success('Gửi thông báo thành công!');
      fetchNotifications();
      fetchStats();
    } catch (error) {
      message.error('Không thể gửi thông báo');
      console.error('Error sending notification:', error);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      PENDING: { color: 'orange', text: 'Chờ gửi' },
      SCHEDULED: { color: 'blue', text: 'Đã lên lịch' },
      SENT: { color: 'green', text: 'Đã gửi' },
      FAILED: { color: 'red', text: 'Thất bại' }
    };
    const config = statusConfig[status] || { color: 'gray', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getPriorityTag = (priority) => {
    const priorityConfig = {
      LOW: { color: 'gray', text: 'Thấp' },
      NORMAL: { color: 'blue', text: 'Bình thường' },
      HIGH: { color: 'orange', text: 'Cao' },
      URGENT: { color: 'red', text: 'Khẩn cấp' }
    };
    const config = priorityConfig[priority] || { color: 'blue', text: 'Bình thường' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getAudienceText = (audience) => {
    const audienceMap = {
      ALL: 'Tất cả',
      STUDENTS: 'Học sinh',
      PARENTS: 'Phụ huynh',
      TEACHERS: 'Giáo viên',
      ACCOUNTANTS: 'Kế toán',
      MANAGERS: 'Quản lý',
      SPECIFIC_USER: 'Người dùng cụ thể',
      SPECIFIC_CLASS: 'Lớp học cụ thể'
    };
    return audienceMap[audience] || audience;
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Đối tượng',
      dataIndex: 'targetAudience',
      key: 'targetAudience',
      render: (audience) => getAudienceText(audience),
      width: 120,
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => getPriorityTag(priority),
      width: 100,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      width: 100,
    },
    {
      title: 'Thời gian lên lịch',
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
      render: (scheduledAt) => scheduledAt ? moment(scheduledAt).format('DD/MM/YYYY HH:mm') : 'Ngay lập tức',
      width: 150,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => moment(createdAt).format('DD/MM/YYYY HH:mm'),
      width: 150,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {(record.status === 'PENDING' || record.status === 'SCHEDULED') && (
            <>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                size="small"
              >
                Sửa
              </Button>
              <Button
                type="link"
                icon={<SendOutlined />}
                onClick={() => handleSendNow(record.id)}
                size="small"
              >
                Gửi ngay
              </Button>
              <Popconfirm
                title="Bạn có chắc muốn xóa thông báo này?"
                onConfirm={() => handleDelete(record.id)}
                okText="Có"
                cancelText="Không"
              >
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                >
                  Xóa
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
      width: 200,
    },
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'scheduled') return notification.status === 'SCHEDULED';
    if (activeTab === 'sent') return notification.status === 'SENT';
    if (activeTab === 'pending') return notification.status === 'PENDING';
    return true;
  });

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng thông báo"
              value={stats.total || 0}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã gửi"
              value={stats.sent || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã lên lịch"
              value={stats.scheduled || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Thất bại"
              value={stats.failed || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Quản lý thông báo"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingNotification(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Tạo thông báo mới
          </Button>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }}>
          <TabPane tab="Tất cả" key="all" />
          <TabPane tab="Chờ gửi" key="pending" />
          <TabPane tab="Đã lên lịch" key="scheduled" />
          <TabPane tab="Đã gửi" key="sent" />
        </Tabs>

        <Table
          columns={columns}
          dataSource={filteredNotifications}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thông báo`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingNotification ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingNotification(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdate}
          initialValues={{
            priority: 'NORMAL',
            targetAudience: 'ALL'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
              >
                <Input placeholder="Nhập tiêu đề thông báo" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Độ ưu tiên"
                rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên!' }]}
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

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập nội dung thông báo"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="targetAudience"
                label="Đối tượng nhận"
                rules={[{ required: true, message: 'Vui lòng chọn đối tượng!' }]}
              >
                <Select>
                  <Option value="ALL">Tất cả</Option>
                  <Option value="STUDENTS">Học sinh</Option>
                  <Option value="PARENTS">Phụ huynh</Option>
                  <Option value="TEACHERS">Giáo viên</Option>
                  <Option value="ACCOUNTANTS">Kế toán</Option>
                  <Option value="MANAGERS">Quản lý</Option>
                  <Option value="SPECIFIC_USER">Người dùng cụ thể</Option>
                  <Option value="SPECIFIC_CLASS">Lớp học cụ thể</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="targetDetails"
                label="Chi tiết đối tượng"
                tooltip="ID của người dùng hoặc lớp học cụ thể (nếu có)"
              >
                <Input placeholder="Nhập ID (nếu chọn đối tượng cụ thể)" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="scheduledAt"
            label="Thời gian gửi"
            tooltip="Để trống để gửi ngay lập tức"
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              placeholder="Chọn thời gian gửi (để trống để gửi ngay)"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingNotification(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingNotification ? 'Cập nhật' : 'Tạo thông báo'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminNotificationManagement;