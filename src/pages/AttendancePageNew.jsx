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
    Empty,
    Form,
    Input,
    message,
    Modal,
    Progress,
    Row,
    Select,
    Space,
    Spin,
    Statistic,
    Switch,
    Table,
    Tabs,
    Tag,
    Typography
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * AttendancePageNew component for managing attendance with separate teacher and student views
 * @returns {JSX.Element} AttendancePageNew component
 */
function AttendancePageNew() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [sessionToMark, setSessionToMark] = useState(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    averageAttendance: 0,
    totalStudents: 0,
    attendedSessions: 0,
    totalClasses: 0
  });
  
  // Get user info from localStorage
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Debug logging for role detection
  console.log('AttendancePageNew - Role Debug:', { 
    userId, 
    userRole, 
    roleFromStorage: localStorage.getItem('role'),
    token: localStorage.getItem('token') 
  });

  // Mock data for testing
  const mockClassrooms = [
    { id: 1, name: 'Lớp Toán 10A1', subject: 'Toán học', section: 'Khối 10' },
    { id: 2, name: 'Lớp Ngữ văn 11B2', subject: 'Ngữ văn', section: 'Khối 11' },
    { id: 3, name: 'Lớp Vật lý 12C3', subject: 'Vật lý', section: 'Khối 12' }
  ];

  const mockSessions = [
    {
      id: 1,
      name: 'Buổi học ngày 10/06/2025',
      classroomId: 1,
      classroomName: 'Lớp Toán 10A1',
      startTime: moment().subtract(2, 'hours').toISOString(),
      endTime: moment().add(2, 'hours').toISOString(),
      status: 'ACTIVE',
      requireLocation: true,
      maxDistance: 100,
      teacherId: 2
    },
    {
      id: 2,
      name: 'Buổi học ngày 08/06/2025',
      classroomId: 1,
      classroomName: 'Lớp Toán 10A1',
      startTime: moment().subtract(2, 'days').toISOString(),
      endTime: moment().subtract(2, 'days').add(2, 'hours').toISOString(),
      status: 'ENDED',
      requireLocation: false,
      maxDistance: null,
      teacherId: 2
    },
    {
      id: 3,
      name: 'Buổi học ngày 12/06/2025',
      classroomId: 2,
      classroomName: 'Lớp Ngữ văn 11B2',
      startTime: moment().add(1, 'days').toISOString(),
      endTime: moment().add(1, 'days').add(3, 'hours').toISOString(),
      status: 'PENDING',
      requireLocation: true,
      maxDistance: 200,
      teacherId: 2
    }
  ];

  const mockAttendanceRecords = [
    {
      id: 101,
      sessionId: 2,
      studentId: 1,
      studentName: 'Nguyễn Văn A',
      studentCode: 'SV001',
      status: 'PRESENT',
      checkedAt: moment().subtract(2, 'days').add(15, 'minutes').toISOString(),
      latitude: 21.0245,
      longitude: 105.8412
    },
    {
      id: 102,
      sessionId: 2,
      studentId: 2,
      studentName: 'Trần Thị B',
      studentCode: 'SV002',
      status: 'LATE',
      checkedAt: moment().subtract(2, 'days').add(45, 'minutes').toISOString(),
      latitude: 21.0246,
      longitude: 105.8413
    },
    {
      id: 103,
      sessionId: 2,
      studentId: 3,
      studentName: 'Lê Văn C',
      studentCode: 'SV003',
      status: 'ABSENT',
      checkedAt: null,
      latitude: null,
      longitude: null
    },
    {
      id: 104,
      sessionId: 1,
      studentId: 1,
      studentName: 'Nguyễn Văn A',
      studentCode: 'SV001',
      status: 'PRESENT',
      checkedAt: moment().subtract(30, 'minutes').toISOString(),
      latitude: 21.0245,
      longitude: 105.8412
    }
  ];

  const mockStudentAttendance = {
    totalClasses: 10,
    attendedClasses: 8,
    lateClasses: 1,
    absentClasses: 1,
    bySubject: [
      { subject: 'Toán học', present: 5, late: 0, absent: 0, total: 5 },
      { subject: 'Ngữ văn', present: 3, late: 1, absent: 1, total: 5 }
    ]
  };

  useEffect(() => {
    // Use mock data instead of actual API calls
    setTimeout(() => {
      setClassrooms(mockClassrooms);
      setSessions(mockSessions);
      setAttendanceRecords(mockAttendanceRecords);
      
      // Calculate stats
      if (userRole === '2') { // Teacher
        const activeSessions = mockSessions.filter(s => s.status === 'ACTIVE').length;
        const totalStudents = [...new Set(mockAttendanceRecords.map(a => a.studentId))].length;
        const presentCount = mockAttendanceRecords.filter(a => a.status === 'PRESENT').length;
        const averageAttendance = mockAttendanceRecords.length > 0 ? 
          Math.round((presentCount / mockAttendanceRecords.length) * 100) : 0;

        setStats({
          totalSessions: mockSessions.length,
          activeSessions: activeSessions,
          averageAttendance: averageAttendance,
          totalStudents: totalStudents
        });
      } else { // Student
        setStats({
          totalClasses: mockStudentAttendance.totalClasses,
          attendedSessions: mockStudentAttendance.attendedClasses,
          attendanceRate: Math.round((mockStudentAttendance.attendedClasses / mockStudentAttendance.totalClasses) * 100)
        });
      }
      
      setLoading(false);
    }, 800); // Simulate API delay
  }, [userId, token, userRole]);

  // Teacher functions
  const calculateAttendanceRate = (sessionId) => {
    const sessionAttendances = mockAttendanceRecords.filter(a => a.sessionId === sessionId);
    if (sessionAttendances.length === 0) return 0;
    
    const presentCount = sessionAttendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    return Math.round((presentCount / sessionAttendances.length) * 100);
  };

  const getSessionAttendance = (sessionId) => {
    return mockAttendanceRecords.filter(a => a.sessionId === sessionId);
  };

  const toggleSessionStatus = (sessionId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'ENDED' : 'ACTIVE';
    const updatedSessions = sessions.map(session => 
      session.id === sessionId ? { ...session, status: newStatus } : session
    );
    
    setSessions(updatedSessions);
    message.success(`Phiên điểm danh đã được ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'kết thúc'}`);
  };

  const handleCreateSession = (values) => {
    const startTime = values.timeRange[0].toISOString();
    const endTime = values.timeRange[1].toISOString();
    
    const newSession = {
      id: sessions.length + 1,
      name: values.name,
      classroomId: values.classroomId,
      classroomName: classrooms.find(c => c.id === values.classroomId)?.name || '',
      startTime: startTime,
      endTime: endTime,
      status: moment().isBefore(moment(startTime)) ? 'PENDING' : 'ACTIVE',
      requireLocation: values.requireLocation,
      maxDistance: values.requireLocation ? values.maxDistance : null,
      teacherId: parseInt(userId) || 2
    };
    
    setSessions([...sessions, newSession]);
    setCreateModalVisible(false);
    form.resetFields();
    message.success('Phiên điểm danh mới đã được tạo');
  };

  const viewSessionDetails = (session) => {
    setSelectedSession(session);
    setDetailModalVisible(true);
  };

  // Student functions
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          message.error('Không thể lấy vị trí hiện tại. Vui lòng cho phép truy cập vị trí.');
        }
      );
    } else {
      message.error('Trình duyệt của bạn không hỗ trợ định vị.');
    }
  };

  const markAttendance = async (session) => {
    if (session.requireLocation && !location) {
      setSessionToMark(session);
      setShowLocationPrompt(true);
      return;
    }
    
    setMarkingAttendance(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add new attendance record
      const newRecord = {
        id: Math.floor(Math.random() * 1000) + 200,
        sessionId: session.id,
        studentId: parseInt(userId) || 1,
        studentName: 'Nguyễn Văn A', // Normally would get from user profile
        studentCode: 'SV001',
        status: 'PRESENT',
        checkedAt: new Date().toISOString(),
        latitude: location?.latitude,
        longitude: location?.longitude
      };
      
      setAttendanceRecords([...attendanceRecords, newRecord]);
      message.success('Điểm danh thành công!');
    } catch (error) {
      console.error('Error marking attendance:', error);
      message.error('Không thể điểm danh. Vui lòng thử lại.');
    } finally {
      setMarkingAttendance(false);
      setSessionToMark(null);
      setShowLocationPrompt(false);
    }
  };

  const handleLocationPrompt = () => {
    getCurrentLocation();
    setShowLocationPrompt(false);
    
    // After getting location, try to mark attendance again
    if (sessionToMark) {
      setTimeout(() => {
        if (location) {
          markAttendance(sessionToMark);
        } else {
          message.error('Không thể lấy vị trí. Vui lòng thử lại.');
        }
      }, 1000);
    }
  };

  const isStudentAttended = (sessionId) => {
    return attendanceRecords.some(
      record => record.sessionId === sessionId && record.studentId === (parseInt(userId) || 1)
    );
  };

  // RENDER FUNCTIONS BASED ON USER ROLE

  // Teacher view components
  const renderTeacherDashboard = () => {
    return (
      <div className="teacher-dashboard">
        <div className="header-actions" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            <Tag color="green" style={{ marginRight: 8, fontSize: '14px' }}>GIẢNG VIÊN</Tag>
            Quản lý điểm danh
          </Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              form.resetFields();
              setCreateModalVisible(true);
            }}
          >
            Tạo phiên điểm danh
          </Button>
        </div>
        
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Phiên đang diễn ra"
                value={stats.activeSessions}
                valueStyle={{ color: '#52c41a' }}
                prefix={<PlayCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Phiên điểm danh sắp tới"
                value={stats.upcomingSessions}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tỷ lệ điểm danh trung bình"
                value={stats.averageAttendanceRate}
                precision={2}
                valueStyle={{ color: '#faad14' }}
                suffix="%"
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng số học sinh"
                value={stats.totalStudents}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>          <Tabs 
            defaultActiveKey="active"
            items={[
              {
                key: 'active',
                label: 'Đang diễn ra',
                children: renderTeacherSessionsList(sessions.filter(session => session?.status === 'ACTIVE'))
              },
              {
                key: 'upcoming',
                label: 'Sắp tới',
                children: renderTeacherSessionsList(sessions.filter(session => session?.status === 'PENDING'))
              },
              {
                key: 'ended',
                label: 'Đã kết thúc',
                children: renderTeacherSessionsList(sessions.filter(session => session?.status === 'ENDED'))
              }
            ]}
          />
      </div>
    );
  };

  const renderTeacherSessionsList = (sessionsList) => {
    if (sessionsList.length === 0) {
      return <Empty description="Không có phiên điểm danh nào" />;
    }

    return (
      <Table
        columns={[
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
                <div>{moment(record.startTime).format('DD/MM/YYYY HH:mm')}</div>
                <div style={{ color: '#888' }}>đến {moment(record.endTime).format('DD/MM/YYYY HH:mm')}</div>
              </div>
            ),
          },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => {
              const now = moment();
              const isExpired = status !== 'ENDED' && now.isAfter(moment(record.endTime));
              
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
                  >
                    {record.status === 'ACTIVE' ? 'Kết thúc' : 'Kích hoạt'}
                  </Button>
                )}
              </Space>
            ),
          },
        ]}
        dataSource={sessionsList}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    );
  };

  // Student view components
  const renderStudentDashboard = () => {
    return (
      <div className="student-dashboard">
        <div className="header-actions" style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            <Tag color="blue" style={{ marginRight: 8, fontSize: '14px' }}>HỌC SINH</Tag>
            Điểm danh
          </Title>
        </div>          <Tabs 
            defaultActiveKey="active"
            items={[
              {
                key: 'active',
                label: 'Đang diễn ra',
                children: renderStudentSessionsList(sessions.filter(session => session?.status === 'ACTIVE'))
              },
              {
                key: 'upcoming',
                label: 'Sắp tới',
                children: renderStudentSessionsList(sessions.filter(session => session?.status === 'PENDING'))
              },
              {
                key: 'history',
                label: 'Lịch sử điểm danh',
                children: renderStudentAttendanceHistory()
              }
            ]}
          />
      </div>
    );
  };

  const renderStudentSessionsList = (sessionsList) => {
    if (sessionsList.length === 0) {
      return <Empty description="Không có phiên điểm danh nào" />;
    }

    return (
      <div className="sessions-list">
        {sessionsList.map(session => {
          const attended = isStudentAttended(session.id);
          
          return (
            <Card 
              key={session.id}
              style={{ marginBottom: 16 }}
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  {session.name}
                </div>
              }
              extra={
                <Space>
                  <Tag color="blue">{session.classroomName}</Tag>
                  {attended ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>Đã điểm danh</Tag>
                  ) : (
                    <Tag color="orange" icon={<ClockCircleOutlined />}>Chưa điểm danh</Tag>
                  )}
                </Space>
              }
              actions={[
                attended ? (
                  <Button key="view" disabled>
                    Đã điểm danh
                  </Button>
                ) : (
                  <Button 
                    key="mark" 
                    type="primary" 
                    onClick={() => markAttendance(session)}
                    loading={markingAttendance && sessionToMark?.id === session.id}
                  >
                    Điểm danh ngay
                  </Button>
                )
              ]}
            >
              <div style={{ marginBottom: 16 }}>
                <Text strong>Thời gian: </Text>
                <Text>{moment(session.startTime).format('DD/MM/YYYY HH:mm')} - {moment(session.endTime).format('HH:mm')}</Text>
              </div>
              
              {session.requireLocation && (
                <div>
                  <Tag color="blue" icon={<EnvironmentOutlined />}>
                    Yêu cầu vị trí để điểm danh
                  </Tag>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  const renderStudentAttendanceHistory = () => {
    // Filter attendance records for current student
    const studentRecords = attendanceRecords.filter(
      record => record.studentId === (parseInt(userId) || 1)
    );
    
    if (studentRecords.length === 0) {
      return <Empty description="Chưa có lịch sử điểm danh" />;
    }

    // Get session details for each record
    const recordsWithSessions = studentRecords.map(record => {
      const session = sessions.find(s => s.id === record.sessionId);
      return {
        ...record,
        key: record.id, // Add a key for React list rendering
        sessionName: session?.name || 'Unknown Session',
        classroomName: session?.classroomName || 'Unknown Class',
        date: moment(session?.startTime).format('DD/MM/YYYY'),
        statusDisplay: record.status === 'PRESENT' ? 'Có mặt' : 
                       record.status === 'LATE' ? 'Muộn' : 
                       record.status === 'ABSENT' ? 'Vắng mặt' : 'Vắng có phép',
        statusColor: record.status === 'PRESENT' ? 'green' : 
                     record.status === 'LATE' ? 'orange' : 'red'
      };
    });

    return (
      <Table
        columns={[
          {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
          },
          {
            title: 'Tên phiên',
            dataIndex: 'sessionName',
            key: 'sessionName',
          },
          {
            title: 'Lớp học',
            dataIndex: 'classroomName',
            key: 'classroomName',
          },
          {
            title: 'Thời gian điểm danh',
            dataIndex: 'checkedAt',
            key: 'checkedAt',
            render: time => time ? moment(time).format('DD/MM/YYYY HH:mm:ss') : '-',
            sorter: (a, b) => {
              if (!a.checkedAt) return 1;
              if (!b.checkedAt) return -1;
              return moment(a.checkedAt).unix() - moment(b.checkedAt).unix();
            }
          },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
              <Tag 
                color={record.statusColor}
                icon={status === 'PRESENT' ? <CheckCircleOutlined /> : 
                      status === 'LATE' ? <ClockCircleOutlined /> : <StopOutlined />}
              >
                {record.statusDisplay}
              </Tag>
            ),
            filters: [
              { text: 'Có mặt', value: 'PRESENT' },
              { text: 'Muộn', value: 'LATE' },
              { text: 'Vắng mặt', value: 'ABSENT' }
            ],
            onFilter: (value, record) => record.status === value,
          }
        ]}
        dataSource={recordsWithSessions}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    );
  };

  // Shared UI Components
  const renderSessionCreationModal = () => {
    return (
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
            rules={[{ required: true, message: 'Vui lòng nhập tên phiên điểm danh' }]}
          >
            <Input placeholder="Ví dụ: Buổi học ngày 15/06/2025" />
          </Form.Item>
          
          <Form.Item
            name="classroomId"
            label="Lớp học"
            rules={[{ required: true, message: 'Vui lòng chọn lớp học' }]}
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
            label="Thời gian"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu và kết thúc' }]}
          >
            <RangePicker 
              showTime 
              format="DD/MM/YYYY HH:mm" 
              placeholder={['Thời gian bắt đầu', 'Thời gian kết thúc']}
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="requireLocation"
            label="Yêu cầu vị trí"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="maxDistance"
            label="Khoảng cách tối đa (mét)"
            initialValue={100}
            dependencies={['requireLocation']}
            rules={[
              ({ getFieldValue }) => ({
                required: getFieldValue('requireLocation'),
                message: 'Vui lòng nhập khoảng cách tối đa',
              }),
            ]}
          >
            <Input 
              type="number" 
              min={10} 
              max={1000} 
              disabled={form.getFieldValue('requireLocation') === false}
            />
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button style={{ marginRight: 8 }} onClick={() => setCreateModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tạo phiên
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  const renderSessionDetailModal = () => {
    return (
      <Modal
        title="Chi tiết phiên điểm danh"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedSession(null);
        }}
        width={800}
        footer={[
          <Button key="back" onClick={() => {
            setDetailModalVisible(false);
            setSelectedSession(null);
          }}>
            Đóng
          </Button>
        ]}
      >
        {selectedSession && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Tên phiên">{selectedSession.name}</Descriptions.Item>
              <Descriptions.Item label="Lớp học">{selectedSession.classroomName}</Descriptions.Item>
              <Descriptions.Item label="Thời gian bắt đầu">
                {moment(selectedSession.startTime).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian kết thúc">
                {moment(selectedSession.endTime).format('DD/MM/YYYY HH:mm')}
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
            
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 16 }}>Danh sách điểm danh</Text>
            </div>
            
            <Table
              columns={[
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
                  render: time => time ? moment(time).format('DD/MM/YYYY HH:mm:ss') : '-',
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: status => (
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
              ]}
              dataSource={getSessionAttendance(selectedSession.id)}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </div>
        )}
      </Modal>
    );
  };

  const renderLocationPromptModal = () => {
    return (
      <Modal
        title="Yêu cầu vị trí"
        open={showLocationPrompt}
        onCancel={() => {
          setShowLocationPrompt(false);
          setSessionToMark(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setShowLocationPrompt(false);
            setSessionToMark(null);
          }}>
            Hủy
          </Button>,
          <Button key="allow" type="primary" onClick={handleLocationPrompt}>
            Cho phép truy cập vị trí
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <EnvironmentOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <p>Phiên điểm danh này yêu cầu xác thực vị trí. Vui lòng cho phép truy cập vị trí của bạn để tiếp tục.</p>
        </div>
      </Modal>
    );
  };

  // Main content renderer with comprehensive role validation
  const renderMainContent = () => {
    // Don't render if no valid role or user ID
    if (!userId || !userRole || !token) {
      console.warn('AttendancePageNew: Missing required authentication data:', { userId, userRole, token: !!token });
      return (
        <div className="text-center p-8">
          <h2>⚠️ Lỗi xác thực</h2>
          <p>Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại.</p>
          <Button type="primary" onClick={() => window.location.href = '/login'}>
            Đăng nhập lại
          </Button>
        </div>
      );
    }

    // Student view for role '1' or 'STUDENT'
    if (userRole === '1' || userRole === 'STUDENT') {
      return renderStudentDashboard();
    }
    
    // Teacher view for role '2' or 'TEACHER' 
    if (userRole === '2' || userRole === 'TEACHER') {
      return renderTeacherDashboard();
    }
    
    // Admin view for role '0' or 'ADMIN'
    if (userRole === '0' || userRole === 'ADMIN') {
      return renderTeacherDashboard(); // Admins can see teacher view
    }
    
    // Manager view for role '3' or 'MANAGER'
    if (userRole === '3' || userRole === 'MANAGER') {
      return renderTeacherDashboard(); // Managers can see teacher view
    }
    
    // If role is not recognized, show error
    console.error('AttendancePageNew: Unrecognized role:', userRole);
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="attendance-page">
      {/* Main content based on user role */}
      {renderMainContent()}
      
      {/* Shared UI components */}
      {renderSessionCreationModal()}
      {renderSessionDetailModal()}
      {renderLocationPromptModal()}
    </div>
  );
}

export default AttendancePageNew;