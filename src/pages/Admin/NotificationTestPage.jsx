import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Switch,
  Alert,
  Divider,
  Row,
  Col,
  Typography,
  Space,
  Tag,
  Spin,
  message,
  Tabs,
  Timeline,
  Badge
} from 'antd';
import {
  SendOutlined,
  BellOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  MessageOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import notificationTestService from '../../services/notificationTestService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const NotificationTestPage = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [notificationMethod, setNotificationMethod] = useState('both');
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [classrooms, setClassrooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [notificationStatus, setNotificationStatus] = useState(null);

  // Form instances
  const [attendanceForm] = Form.useForm();
  const [timetableForm] = Form.useForm();

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load classrooms, students, and notification status
      const [classroomsRes, studentsRes, statusRes] = await Promise.allSettled([
        notificationTestService.getAllClassrooms(),
        notificationTestService.getAllStudents(),
        notificationTestService.getNotificationStatus()
      ]);

      if (classroomsRes.status === 'fulfilled') {
        setClassrooms(classroomsRes.value || []);
      }

      if (studentsRes.status === 'fulfilled') {
        setStudents(studentsRes.value || []);
      }

      if (statusRes.status === 'fulfilled') {
        setNotificationStatus(statusRes.value);
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      message.error('Không thể tải dữ liệu ban đầu');
    } finally {
      setLoading(false);
    }
  };

  // Add log entry
  const addLog = (type, message, data = null) => {
    const newLog = {
      id: Date.now(),
      type, // 'success', 'error', 'info', 'warning'
      message,
      data,
      timestamp: new Date().toLocaleString('vi-VN')
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Handle attendance notification test
  const handleAttendanceTest = async (values) => {
    try {
      setLoading(true);
      addLog('info', 'Đang gửi thông báo điểm danh...', values);

      // Prepare attendance data
      const attendanceData = {
        classroomId: values.classroomId,
        lectureId: 1, // Default lecture ID for testing
        records: [{
          studentId: values.studentId,
          status: values.status,
          note: values.note || ''
        }]
      };

      let response;
      if (testMode) {
        // Use custom Zalo notification for test mode
        response = await notificationTestService.sendCustomZaloNotification(attendanceData);
      } else {
        // Use real n8n webhook
        response = await notificationTestService.sendAttendanceNotification(attendanceData);
      }

      if (response.success) {
        addLog('success', 'Thông báo điểm danh đã được gửi thành công!', response);
        message.success('Gửi thông báo thành công!');
        attendanceForm.resetFields();
      } else {
        addLog('error', 'Gửi thông báo điểm danh thất bại', response);
        message.error('Gửi thông báo thất bại!');
      }

    } catch (error) {
      console.error('Error sending attendance notification:', error);
      addLog('error', 'Lỗi khi gửi thông báo điểm danh', error.message);
      message.error('Có lỗi xảy ra khi gửi thông báo');
    } finally {
      setLoading(false);
    }
  };

  // Handle timetable notification test
  const handleTimetableTest = async (values) => {
    try {
      setLoading(true);
      addLog('info', 'Đang gửi thông báo thời khóa biểu...', values);

      // Prepare timetable event data
      const eventData = {
        title: `Thay đổi lịch học - ${values.className}`,
        description: values.changeInfo,
        classroomId: values.classroomId,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
        eventType: 'SCHEDULE_CHANGE'
      };

      const response = await notificationTestService.sendTimetableNotification(eventData);

      if (response.success) {
        addLog('success', 'Thông báo thời khóa biểu đã được gửi thành công!', response);
        message.success('Gửi thông báo thành công!');
        timetableForm.resetFields();
      } else {
        addLog('error', 'Gửi thông báo thời khóa biểu thất bại', response);
        message.error('Gửi thông báo thất bại!');
      }

    } catch (error) {
      console.error('Error sending timetable notification:', error);
      addLog('error', 'Lỗi khi gửi thông báo thời khóa biểu', error.message);
      message.error('Có lỗi xảy ra khi gửi thông báo');
    } finally {
      setLoading(false);
    }
  };

  // Handle quick test notification
  const handleQuickTest = async () => {
    try {
      setLoading(true);
      addLog('info', 'Đang gửi thông báo test nhanh...');

      const response = await notificationTestService.sendTestNotification();

      if (response.success) {
        addLog('success', 'Thông báo test đã được gửi thành công!', response);
        message.success('Gửi thông báo test thành công!');
      } else {
        addLog('error', 'Gửi thông báo test thất bại', response);
        message.error('Gửi thông báo test thất bại!');
      }

    } catch (error) {
      console.error('Error sending quick test:', error);
      addLog('error', 'Lỗi khi gửi thông báo test', error.message);
      message.error('Có lỗi xảy ra khi gửi thông báo test');
    } finally {
      setLoading(false);
    }
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    message.info('Đã xóa tất cả log');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-6 shadow-lg">
          <div className="text-center">
            <Title level={2} className="mb-2">
              <ExperimentOutlined className="mr-3 text-blue-500" />
              Trang Kiểm Tra Thông Báo Tự Động
            </Title>
            <Paragraph className="text-gray-600 text-lg">
              Test chức năng gửi thông báo tự động cho phụ huynh qua Zalo/SMS
            </Paragraph>
            
            {/* Status indicators */}
            <Space size="large" className="mt-4">
              <Badge 
                status={notificationStatus?.zaloNotificationEnabled ? "success" : "error"} 
                text={`Zalo Notification: ${notificationStatus?.zaloNotificationEnabled ? 'Enabled' : 'Disabled'}`}
              />
              <Badge 
                status={testMode ? "processing" : "default"} 
                text={`Test Mode: ${testMode ? 'ON' : 'OFF'}`}
              />
            </Space>
          </div>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Left Column - Test Forms */}
          <Col xs={24} lg={16}>
            <Tabs defaultActiveKey="attendance" size="large">
              <TabPane 
                tab={
                  <span>
                    <MessageOutlined />
                    Test Điểm Danh
                  </span>
                } 
                key="attendance"
              >
                <Card title="Form Test Thông Báo Điểm Danh" className="shadow-md">
                  <Form
                    form={attendanceForm}
                    layout="vertical"
                    onFinish={handleAttendanceTest}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="studentId"
                          label="Chọn học sinh"
                          rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}
                        >
                          <Select
                            placeholder="Chọn học sinh"
                            showSearch
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {students.map(student => (
                              <Option key={student.id} value={student.id}>
                                {student.fullName} - {student.username}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="status"
                          label="Trạng thái điểm danh"
                          rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                        >
                          <Select placeholder="Chọn trạng thái">
                            <Option value="PRESENT">
                              <Tag color="green">Có mặt</Tag>
                            </Option>
                            <Option value="ABSENT">
                              <Tag color="red">Vắng mặt</Tag>
                            </Option>
                            <Option value="LATE">
                              <Tag color="orange">Đi muộn</Tag>
                            </Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="classroomId"
                      label="Lớp học"
                      rules={[{ required: true, message: 'Vui lòng chọn lớp học!' }]}
                    >
                      <Select placeholder="Chọn lớp học">
                        {classrooms.map(classroom => (
                          <Option key={classroom.id} value={classroom.id}>
                            {classroom.name} - {classroom.subject}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="note"
                      label="Ghi chú (tùy chọn)"
                    >
                      <TextArea 
                        rows={3} 
                        placeholder="Nhập ghi chú về điểm danh..."
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        icon={<SendOutlined />}
                        size="large"
                        block
                      >
                        Gửi Thông Báo Điểm Danh
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </TabPane>
            </Tabs>
          </Col>

          {/* Right Column - Configuration & Logs */}
          <Col xs={24} lg={8}>
            {/* Configuration Panel */}
            <Card title="Cấu Hình Test" className="mb-6 shadow-md" extra={<SettingOutlined />}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text strong>Chế độ Test:</Text>
                  <br />
                  <Switch 
                    checked={testMode} 
                    onChange={setTestMode}
                    checkedChildren="ON" 
                    unCheckedChildren="OFF"
                  />
                  <br />
                  <Text type="secondary" className="text-sm">
                    {testMode ? 'Không gửi thông báo thật' : 'Gửi thông báo thật'}
                  </Text>
                </div>

                <div>
                  <Text strong>Phương thức gửi:</Text>
                  <br />
                  <Select 
                    value={notificationMethod} 
                    onChange={setNotificationMethod}
                    style={{ width: '100%' }}
                  >
                    <Option value="zalo">Chỉ Zalo</Option>
                    <Option value="sms">Chỉ SMS</Option>
                    <Option value="both">Cả Zalo và SMS</Option>
                  </Select>
                </div>

                <div>
                  <Text strong>Số điện thoại test:</Text>
                  <br />
                  <Input 
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    placeholder="Nhập số điện thoại test..."
                  />
                </div>

                <Divider />

                <Button 
                  type="dashed" 
                  icon={<ExperimentOutlined />}
                  onClick={handleQuickTest}
                  loading={loading}
                  block
                >
                  Test Nhanh
                </Button>
              </Space>
            </Card>

            {/* Results Log */}
            <Card 
              title="Log Kết Quả" 
              className="shadow-md"
              extra={
                <Button size="small" onClick={clearLogs}>
                  Xóa Log
                </Button>
              }
            >
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {logs.length === 0 ? (
                  <Text type="secondary">Chưa có log nào...</Text>
                ) : (
                  <Timeline>
                    {logs.map(log => (
                      <Timeline.Item
                        key={log.id}
                        dot={
                          log.type === 'success' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                          log.type === 'error' ? <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> :
                          <ClockCircleOutlined style={{ color: '#1890ff' }} />
                        }
                      >
                        <div>
                          <Text strong className={
                            log.type === 'success' ? 'text-green-600' :
                            log.type === 'error' ? 'text-red-600' :
                            'text-blue-600'
                          }>
                            {log.message}
                          </Text>
                          <br />
                          <Text type="secondary" className="text-xs">
                            {log.timestamp}
                          </Text>
                          {log.data && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs text-gray-500">
                                Chi tiết
                              </summary>
                              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default NotificationTestPage;
