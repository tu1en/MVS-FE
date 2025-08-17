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
  Tabs,
  AutoComplete
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
import adminNotificationService from '../../services/adminNotificationService';

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
  const [targetOptions, setTargetOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState('');

  // Helper function to parse date from backend
  const parseBackendDate = (dateString) => {
    if (!dateString) return null;
    
    // Backend sends in format: yyyy-MM-dd HH:mm:ss with timezone Asia/Ho_Chi_Minh
    let date = moment(dateString, 'YYYY-MM-DD HH:mm:ss');
    
    // If that fails, try other common formats
    if (!date.isValid()) {
      date = moment(dateString, 'YYYY-MM-DDTHH:mm:ss');
    }
    if (!date.isValid()) {
      date = moment(dateString, moment.ISO_8601);
    }
    if (!date.isValid()) {
      date = moment(dateString, 'YYYY-MM-DDTHH:mm:ss.SSS');
    }
    if (!date.isValid()) {
      date = moment(dateString); // Default moment parsing
    }
    
    return date.isValid() ? date : null;
  };

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/notifications/admin/all');
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
      const response = await axiosInstance.get('/notifications/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Handle audience change and load target options
  const handleAudienceChange = async (value) => {
    setSelectedAudience(value);
    form.setFieldsValue({ targetDetails: '', targetDetailsId: '' }); // Clear target details
    
    // Map audience types to API endpoints
    const audienceTypeMap = {
      'ALL': 'students', // Default to students for "all", user can search for any type
      'STUDENTS': 'students',
      'PARENTS': 'parents', 
      'TEACHERS': 'teachers',
      'ACCOUNTANTS': 'accountants',
      'MANAGERS': 'managers',
      'SPECIFIC_USER': 'students',
      'SPECIFIC_CLASS': 'classes'
    };
    
    if (audienceTypeMap[value]) {
      try {
        setSearchLoading(true);
        const options = await adminNotificationService.getTargetOptions(audienceTypeMap[value]);
        
        const formattedOptions = options.map(item => ({
          value: item.id.toString(),
          label: value === 'SPECIFIC_CLASS' 
            ? `${item.name} (${item.studentCount || 0} học sinh)`
            : `${item.name} - ${item.email}`,
          key: item.id.toString(),
          data: item
        }));
        
        setTargetOptions(formattedOptions);
      } catch (error) {
        console.error('Error loading target options:', error);
        message.error('Không thể tải danh sách đối tượng');
      } finally {
        setSearchLoading(false);
      }
    } else {
      setTargetOptions([]);
    }
  };

  // Handle search in autocomplete
  const handleSearch = async (searchText) => {
    if (!searchText || searchText.length < 2) {
      return;
    }

    try {
      setSearchLoading(true);
      
      // Determine search type based on selected audience
      let searchType = '';
      switch (selectedAudience) {
        case 'STUDENTS':
        case 'SPECIFIC_USER':
          searchType = 'STUDENTS';
          break;
        case 'TEACHERS':
          searchType = 'TEACHERS';
          break;
        case 'PARENTS':
          searchType = 'PARENTS';
          break;
        case 'MANAGERS':
          searchType = 'MANAGERS';
          break;
        case 'ACCOUNTANTS':
          searchType = 'ACCOUNTANTS';
          break;
        case 'ALL':
        default:
          searchType = ''; // Search all types
          break;
      }
      
      const results = await adminNotificationService.searchUsers(searchText, searchType);
      
      const formattedOptions = results.map(item => ({
        value: item.id.toString(),
        label: `${item.name} - ${item.email} (${item.type})`,
        key: item.id.toString(),
        data: item
      }));
      
      setTargetOptions(formattedOptions);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCreateOrUpdate = async (values) => {
    try {
      // Validate data using service
      const validation = adminNotificationService.validateNotificationData(values);
      if (!validation.isValid) {
        validation.errors.forEach(error => message.error(error));
        return;
      }

      const notificationData = {
        ...values,
        // Sử dụng ID thay vì tên để gửi cho backend
        targetDetails: values.targetDetailsId || values.targetDetails,
        scheduledAt: values.scheduledAt ? values.scheduledAt.format('YYYY-MM-DDTHH:mm:ss') : null,
        createdBy: 'Admin' // Replace with actual admin user info
      };
      
      // Xóa field không cần thiết
      delete notificationData.targetDetailsId;

      if (editingNotification) {
        await axiosInstance.put(`/notifications/admin/${editingNotification.id}`, notificationData);
        message.success('Cập nhật thông báo thành công!');
      } else {
        await axiosInstance.post('/notifications/admin/create', notificationData);
        message.success('Tạo thông báo thành công!');
      }

      setModalVisible(false);
      setEditingNotification(null);
      setSelectedAudience('');
      setTargetOptions([]);
      form.resetFields();
      fetchNotifications();
      fetchStats();
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu thông báo');
      console.error('Error saving notification:', error);
    }
  };

  // Helper function để tìm tên từ ID
  const findNameFromId = async (audienceType, targetId) => {
    if (!targetId) return '';
    
    try {
      const audienceTypeMap = {
        'ALL': 'students',
        'STUDENTS': 'students',
        'PARENTS': 'parents', 
        'TEACHERS': 'teachers',
        'ACCOUNTANTS': 'accountants',
        'MANAGERS': 'managers',
        'SPECIFIC_USER': 'students',
        'SPECIFIC_CLASS': 'classes'
      };
      
      const options = await adminNotificationService.getTargetOptions(audienceTypeMap[audienceType]);
      const found = options.find(item => item.id.toString() === targetId.toString());
      
      if (found) {
        return audienceType === 'SPECIFIC_CLASS' 
          ? `${found.name} (${found.studentCount || 0} học sinh)`
          : `${found.name} - ${found.email}`;
      }
    } catch (error) {
      console.error('Error finding name from ID:', error);
    }
    
    return targetId; // Fallback to ID if name not found
  };

  const handleEdit = async (notification) => {
    setEditingNotification(notification);
    setSelectedAudience(notification.targetAudience || '');
    
    // Tìm tên để hiển thị thay vì ID
    let displayName = '';
    if (notification.targetDetails && 
        ['ALL', 'STUDENTS', 'PARENTS', 'TEACHERS', 'ACCOUNTANTS', 'MANAGERS', 'SPECIFIC_USER', 'SPECIFIC_CLASS'].includes(notification.targetAudience)) {
      displayName = await findNameFromId(notification.targetAudience, notification.targetDetails);
    }
    
    form.setFieldsValue({
      ...notification,
      targetDetails: displayName || notification.targetDetails,
      targetDetailsId: notification.targetDetails, // Lưu ID gốc
      scheduledAt: notification.scheduledAt ? parseBackendDate(notification.scheduledAt) : null
    });
    setModalVisible(true);
    
    // Load target options if editing specific user/class notification
    if (['SPECIFIC_USER', 'SPECIFIC_CLASS'].includes(notification.targetAudience)) {
      handleAudienceChange(notification.targetAudience);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/notifications/admin/${id}`);
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
      await axiosInstance.post(`/notifications/admin/${id}/send-now`);
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
      render: (scheduledAt) => {
        if (!scheduledAt) return 'Ngay lập tức';
        
        const date = parseBackendDate(scheduledAt);
        if (!date) {
          console.error('Invalid date format for scheduledAt:', scheduledAt);
          return 'Ngày không hợp lệ';
        }
        
        return date.format('DD/MM/YYYY HH:mm');
      },
      width: 150,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => {
        if (!createdAt) return 'Chưa có';
        
        const date = parseBackendDate(createdAt);
        if (!date) {
          console.error('Invalid date format for createdAt:', createdAt);
          return 'Ngày không hợp lệ';
        }
        
        return date.format('DD/MM/YYYY HH:mm');
      },
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
                <Select 
                  placeholder="Chọn đối tượng nhận"
                  onChange={handleAudienceChange}
                >
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
                tooltip="Chọn hoặc nhập tên để tìm kiếm đối tượng cụ thể. Để trống để gửi cho tất cả đối tượng đã chọn."
                rules={[
                  {
                    validator: (_, value) => {
                      // Nếu có giá trị nhưng không có ID tương ứng, báo lỗi
                      if (value && value.trim()) {
                        const targetDetailsId = form.getFieldValue('targetDetailsId');
                        if (!targetDetailsId) {
                          return Promise.reject(new Error('Vui lòng chọn từ danh sách gợi ý'));
                        }
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <AutoComplete
                  options={targetOptions}
                  onSearch={handleSearch}
                  onSelect={(value, option) => {
                    // Khi chọn, set label thay vì value để hiển thị tên
                    form.setFieldsValue({ targetDetails: option.label });
                    // Lưu ID vào hidden field hoặc biến riêng để submit
                    form.setFieldsValue({ targetDetailsId: value });
                  }}
                  onChange={(value) => {
                    // Nếu người dùng xóa hết hoặc nhập tự do
                    if (!value) {
                      form.setFieldsValue({ targetDetailsId: '' });
                    }
                  }}
                  placeholder={
                    selectedAudience === 'SPECIFIC_CLASS' 
                      ? "Tìm kiếm lớp học cụ thể..." 
                      : selectedAudience === 'STUDENTS'
                      ? "Tìm kiếm học sinh cụ thể..."
                      : selectedAudience === 'TEACHERS'
                      ? "Tìm kiếm giáo viên cụ thể..."
                      : selectedAudience === 'PARENTS'
                      ? "Tìm kiếm phụ huynh cụ thể..."
                      : selectedAudience === 'MANAGERS'
                      ? "Tìm kiếm quản lý cụ thể..."
                      : selectedAudience === 'ACCOUNTANTS'
                      ? "Tìm kiếm kế toán cụ thể..."
                      : "Tìm kiếm đối tượng cụ thể..."
                  }
                  loading={searchLoading}
                  filterOption={false}
                  allowClear
                />
              </Form.Item>
              
              {/* Hidden field để lưu ID */}
              <Form.Item name="targetDetailsId" style={{ display: 'none' }}>
                <Input type="hidden" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="scheduledAt"
            label="Thời gian gửi"
            tooltip="Để trống để gửi ngay lập tức. Nếu chọn thời gian, phải sau ít nhất 10 phút từ bây giờ."
            rules={[
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve(); // Allow empty for immediate send
                  
                  const now = moment();
                  const minAllowedTime = now.clone().add(10, 'minutes');
                  
                  if (value.isBefore(minAllowedTime)) {
                    return Promise.reject(new Error('Thời gian gửi phải sau ít nhất 10 phút từ bây giờ'));
                  }
                  
                  return Promise.resolve();
                }
              }
            ]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              placeholder="Chọn thời gian gửi (để trống để gửi ngay)"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < moment().startOf('day')}
              disabledTime={(current) => {
                if (!current) return {};
                
                const now = moment();
                const isToday = current.isSame(now, 'day');
                
                if (isToday) {
                  const currentHour = now.hour();
                  const currentMinute = now.minute();
                  
                  return {
                    disabledHours: () => Array.from({ length: currentHour }, (_, i) => i),
                    disabledMinutes: (selectedHour) => {
                      if (selectedHour === currentHour) {
                        // Disable minutes until current minute + 10
                        const minAllowedMinute = currentMinute + 10;
                        return Array.from({ length: Math.min(60, minAllowedMinute) }, (_, i) => i);
                      }
                      return [];
                    }
                  };
                }
                
                return {};
              }}
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