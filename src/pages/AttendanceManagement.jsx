import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    EyeOutlined,
    PlayCircleOutlined,
    PlusOutlined,
    StopOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Descriptions,
    Form,
    Input,
    message,
    Modal,
    Progress,
    Row,
    Select,
    Space,
    Statistic,
    Switch,
    Table,
    Tabs,
    Tag
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import api from '../services/api';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function AttendanceManagement() {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    averageAttendance: 0,
    totalStudents: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, classroomsRes, attendanceRes] = await Promise.all([
        api.get('/attendance/sessions/teacher'),
        api.get('/classrooms/current-teacher'),
        api.get('/attendance/teacher')
      ]);

      const sessionData = sessionsRes.data.data || [];
      const attendanceData = attendanceRes.data.data || [];
      
      setSessions(sessionData);
      setClassrooms(classroomsRes.data.data || []);
      setAttendanceRecords(attendanceData);

      // Calculate stats
      const activeSessions = sessionData.filter(s => s.status === 'ACTIVE').length;
      const totalStudents = attendanceData.length > 0 ? 
        [...new Set(attendanceData.map(a => a.studentId))].length : 0;
      const presentCount = attendanceData.filter(a => a.status === 'PRESENT').length;
      const averageAttendance = attendanceData.length > 0 ? 
        Math.round((presentCount / attendanceData.length) * 100) : 0;

      setStats({
        totalSessions: sessionData.length,
        activeSessions: activeSessions,
        averageAttendance: averageAttendance,
        totalStudents: totalStudents
      });

    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (values) => {
    try {
      setLoading(true);
      
      const sessionData = {
        ...values,
        startTime: values.timeRange[0].format('YYYY-MM-DD HH:mm:ss'),
        endTime: values.timeRange[1].format('YYYY-MM-DD HH:mm:ss'),
        requireLocation: values.requireLocation || false,
        maxDistance: values.requireLocation ? (values.maxDistance || 100) : null
      };
      
      delete sessionData.timeRange;
      
      await api.post('/attendance/sessions', sessionData);
      message.success('Tạo phiên điểm danh thành công!');
      setCreateModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      console.error('Error creating session:', error);
      message.error('Không thể tạo phiên điểm danh');
    } finally {
      setLoading(false);
    }
  };

  const toggleSessionStatus = async (sessionId, currentStatus) => {
    try {
      setLoading(true);
      const newStatus = currentStatus === 'ACTIVE' ? 'ENDED' : 'ACTIVE';
      await api.put(`/attendance/sessions/${sessionId}/status`, { status: newStatus });
      message.success(`${newStatus === 'ACTIVE' ? 'Kích hoạt' : 'Kết thúc'} phiên điểm danh thành công!`);
      loadData();
    } catch (error) {
      console.error('Error toggling session status:', error);
      message.error('Không thể thay đổi trạng thái phiên');
    } finally {
      setLoading(false);
    }
  };

  const getSessionAttendance = (sessionId) => {
    return attendanceRecords.filter(record => record.sessionId === sessionId);
  };

  const calculateAttendanceRate = (sessionId) => {
    const attendance = getSessionAttendance(sessionId);
    if (attendance.length === 0) return 0;
    const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
    return Math.round((presentCount / attendance.length) * 100);
  };

  const viewSessionDetails = (session) => {
    setSelectedSession(session);
    setDetailModalVisible(true);
  };

  const sessionColumns = [
    {
      title: 'Tên phiên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Lớp học',
      dataIndex: 'classroomName',
      key: 'classroomName',
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => (
        <div>
          <div>{dayjs(record.startTime).format('DD/MM/YYYY HH:mm')}</div>
          <div className="text-gray-500">đến {dayjs(record.endTime).format('DD/MM/YYYY HH:mm')}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const now = dayjs();
        const isExpired = status !== 'ENDED' && now.isAfter(dayjs(status.endTime));
        
        if (isExpired) {
          return <Tag color="red">Đã hết hạn</Tag>;
        }
        
        return (
          <Tag color={status === 'ACTIVE' ? 'green' : status === 'PENDING' ? 'orange' : 'red'}>
            {status === 'ACTIVE' ? 'Đang hoạt động' : 
             status === 'PENDING' ? 'Chờ bắt đầu' : 'Đã kết thúc'}
          </Tag>
        );
      },
    },
    {
      title: 'Tỷ lệ có mặt',
      key: 'attendanceRate',
      render: (_, record) => {
        const rate = calculateAttendanceRate(record.id);
        return (
          <Progress 
            percent={rate} 
            size="small" 
            status={rate >= 80 ? 'success' : rate >= 60 ? 'normal' : 'exception'}
          />
        );
      },
    },
    {
      title: 'Vị trí',
      dataIndex: 'requireLocation',
      key: 'requireLocation',
      render: (requireLocation) => (
        requireLocation ? 
          <Tag color="blue" icon={<EnvironmentOutlined />}>Bắt buộc</Tag> : 
          <Tag>Không yêu cầu</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => viewSessionDetails(record)}
          >
            Chi tiết
          </Button>
          {record.status !== 'ENDED' && (
            <Button 
              type={record.status === 'ACTIVE' ? 'danger' : 'default'}
              icon={record.status === 'ACTIVE' ? <StopOutlined /> : <PlayCircleOutlined />}
              onClick={() => toggleSessionStatus(record.id, record.status)}
              loading={loading}
            >
              {record.status === 'ACTIVE' ? 'Kết thúc' : 'Kích hoạt'}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const attendanceColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Mã số',
      dataIndex: 'studentCode',
      key: 'studentCode',
    },
    {
      title: 'Thời gian điểm danh',
      dataIndex: 'checkedAt',
      key: 'checkedAt',
      render: (time) => time ? dayjs(time).format('DD/MM/YYYY HH:mm:ss') : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={status === 'PRESENT' ? 'green' : status === 'LATE' ? 'orange' : 'red'}
          icon={status === 'PRESENT' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
        >
          {status === 'PRESENT' ? 'Có mặt' : 
           status === 'LATE' ? 'Muộn' : 
           status === 'ABSENT' ? 'Vắng mặt' : 'Vắng có phép'}
        </Tag>
      ),
    },
    {
      title: 'Vị trí',
      key: 'location',
      render: (_, record) => (
        record.latitude && record.longitude ? (
          <Tag color="blue" icon={<EnvironmentOutlined />}>
            Đã xác thực
          </Tag>
        ) : (
          <Tag>Không có</Tag>
        )
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Quản lý điểm danh</h1>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng phiên"
              value={stats.totalSessions}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.activeSessions}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tỷ lệ chuyên cần"
              value={stats.averageAttendance}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: stats.averageAttendance >= 80 ? '#52c41a' : '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng học sinh"
              value={stats.totalStudents}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs 
        defaultActiveKey="sessions"
        items={[
          {
            key: 'sessions',
            label: 'Phiên điểm danh',
            children: (
              <Card 
                title="Danh sách phiên điểm danh" 
                extra={
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setCreateModalVisible(true)}
                  >
                    Tạo phiên mới
                  </Button>
                }
              >
                <Table
                  columns={sessionColumns}
                  dataSource={sessions}
                  loading={loading}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            )
          },
          {
            key: 'history',
            label: 'Lịch sử điểm danh',
            children: (
              <Card title="Lịch sử điểm danh">
                <Table
                  columns={attendanceColumns}
                  dataSource={attendanceRecords}
                  loading={loading}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            )
          }
        ]}
      />

      {/* Create Session Modal */}
      <Modal
        title="Tạo phiên điểm danh mới"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSession}
        >
          <Form.Item
            name="name"
            label="Tên phiên điểm danh"
            rules={[{ required: true, message: 'Vui lòng nhập tên phiên!' }]}
          >
            <Input placeholder="Ví dụ: Điểm danh buổi sáng - Toán 10A1" />
          </Form.Item>

          <Form.Item
            name="classroomId"
            label="Lớp học"
            rules={[{ required: true, message: 'Vui lòng chọn lớp học!' }]}
          >
            <Select placeholder="Chọn lớp học">
              {classrooms.map(classroom => (
                <Option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="Thời gian điểm danh"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
          >
            <RangePicker 
              showTime={{ format: 'HH:mm' }}
              format="DD/MM/YYYY HH:mm"
              placeholder={['Thời gian bắt đầu', 'Thời gian kết thúc']}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="requireLocation"
            label="Yêu cầu vị trí"
            valuePropName="checked"
          >
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>

          <Form.Item
            name="maxDistance"
            label="Khoảng cách tối đa (mét)"
            dependencies={['requireLocation']}
          >
            <Input 
              type="number" 
              min={10} 
              max={1000} 
              placeholder="100" 
              disabled={!form.getFieldValue('requireLocation')}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={3} placeholder="Mô tả thêm về phiên điểm danh (tùy chọn)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo phiên
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Session Detail Modal */}
      <Modal
        title={`Chi tiết phiên: ${selectedSession?.name}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={1000}
        footer={null}
      >
        {selectedSession && (
          <div>
            <Descriptions bordered column={2} className="mb-4">
              <Descriptions.Item label="Tên phiên">{selectedSession.name}</Descriptions.Item>
              <Descriptions.Item label="Lớp học">{selectedSession.classroomName}</Descriptions.Item>
              <Descriptions.Item label="Thời gian bắt đầu">
                {dayjs(selectedSession.startTime).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian kết thúc">
                {dayjs(selectedSession.endTime).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Yêu cầu vị trí">
                {selectedSession.requireLocation ? 'Có' : 'Không'}
              </Descriptions.Item>
              <Descriptions.Item label="Khoảng cách tối đa">
                {selectedSession.maxDistance ? `${selectedSession.maxDistance} mét` : 'Không giới hạn'}
              </Descriptions.Item>
              <Descriptions.Item label="Tỷ lệ có mặt" span={2}>
                <Progress 
                  percent={calculateAttendanceRate(selectedSession.id)} 
                  status={calculateAttendanceRate(selectedSession.id) >= 80 ? 'success' : 'normal'}
                />
              </Descriptions.Item>
            </Descriptions>
            
            <h3 className="text-lg font-semibold mb-4">Danh sách điểm danh</h3>
            <Table
              columns={attendanceColumns}
              dataSource={getSessionAttendance(selectedSession.id)}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
