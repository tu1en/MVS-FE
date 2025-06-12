import {
    CalendarOutlined,
    ClockCircleOutlined,
    CopyOutlined,
    DeleteOutlined,
    EditOutlined,
    LinkOutlined,
    PlusOutlined,
    TeamOutlined,
    VideoCameraOutlined
} from '@ant-design/icons';
import {
    Badge,
    Button,
    Calendar,
    Card,
    Col,
    DatePicker,
    Divider,
    Empty,
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
    Statistic,
    Tabs,
    Tag,
    TimePicker,
    Tooltip,
    Typography
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * OnlineClassesPage component for managing online class sessions with separate teacher and student views
 * @returns {JSX.Element} OnlineClassesPage component
 */
function OnlineClassesPage() {
  const [loading, setLoading] = useState(true);
  const [classSessions, setClassSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [form] = Form.useForm();
  const [calendarView, setCalendarView] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  
  // Get user info from localStorage
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Debug logging for role detection
  console.log('OnlineClassesPage - Role Debug:', { 
    userId, 
    userRole, 
    roleFromStorage: localStorage.getItem('role'),
    token: localStorage.getItem('token') 
  });

  // Mock data for testing
  const mockCourses = [
    { id: 1, name: 'Nhập môn lập trình Java', code: 'JAVA101' },
    { id: 2, name: 'Cơ sở dữ liệu', code: 'DB101' },
    { id: 3, name: 'Lập trình Web', code: 'WEB101' },
  ];

  const mockClassSessions = [
    {
      id: 1,
      title: 'Lập trình hướng đối tượng trong Java',
      courseId: 1,
      courseName: 'Nhập môn lập trình Java',
      startTime: moment().add(1, 'day').hour(9).minute(0).second(0).toISOString(),
      endTime: moment().add(1, 'day').hour(11).minute(0).second(0).toISOString(),
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      meetingId: 'abc-defg-hij',
      meetingPassword: '123456',
      description: 'Buổi học về OOP trong Java, các bạn chuẩn bị IDE trước khi tham gia',
      status: 'UPCOMING',
      teacherId: 2
    },
    {
      id: 2,
      title: 'Thực hành Java với Collections',
      courseId: 1,
      courseName: 'Nhập môn lập trình Java',
      startTime: moment().subtract(2, 'days').hour(14).minute(0).second(0).toISOString(),
      endTime: moment().subtract(2, 'days').hour(16).minute(0).second(0).toISOString(),
      meetingUrl: 'https://meet.google.com/xyz-abcd-123',
      meetingId: 'xyz-abcd-123',
      meetingPassword: '654321',
      description: 'Buổi thực hành về Collections trong Java',
      status: 'ENDED',
      recordingUrl: 'https://example.com/recording1',
      teacherId: 2
    },
    {
      id: 3,
      title: 'Hỏi đáp và giải bài tập Java',
      courseId: 1,
      courseName: 'Nhập môn lập trình Java',
      startTime: moment().hour(18).minute(30).second(0).toISOString(),
      endTime: moment().hour(20).minute(0).second(0).toISOString(),
      meetingUrl: 'https://zoom.us/j/123456789',
      meetingId: '123456789',
      meetingPassword: 'java123',
      description: 'Buổi hỏi đáp và giải bài tập cuối chương 3',
      status: 'ACTIVE',
      teacherId: 2
    }
  ];

  useEffect(() => {
    // Use mock data instead of actual API calls
    setTimeout(() => {
      setCourses(mockCourses);
      setClassSessions(mockClassSessions);
      setSelectedCourse(mockCourses[0]);
      setLoading(false);
    }, 800); // Simulate API delay
  }, [userId, token, userRole]);

  // ===== Session Management Functions =====
  
  const handleCreateSession = () => {
    setEditingSession(null);
    setCreateModalVisible(true);
    form.resetFields();
    form.setFieldsValue({
      courseId: selectedCourse?.id,
      date: moment(),
      timeRange: [moment().hour(9).minute(0), moment().hour(11).minute(0)]
    });
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setCreateModalVisible(true);
    
    form.setFieldsValue({
      title: session.title,
      courseId: session.courseId,
      date: moment(session.startTime),
      timeRange: [
        moment(session.startTime),
        moment(session.endTime)
      ],
      meetingUrl: session.meetingUrl,
      meetingId: session.meetingId,
      meetingPassword: session.meetingPassword,
      description: session.description
    });
  };

  const handleDeleteSession = (sessionId) => {
    setClassSessions(classSessions.filter(session => session.id !== sessionId));
    message.success('Đã hủy buổi học thành công');
  };

  const handleSubmitSessionForm = (values) => {
    const startTime = moment(values.date)
      .hour(values.timeRange[0].hour())
      .minute(values.timeRange[0].minute())
      .second(0)
      .toISOString();
      
    const endTime = moment(values.date)
      .hour(values.timeRange[1].hour())
      .minute(values.timeRange[1].minute())
      .second(0)
      .toISOString();
    
    const course = courses.find(c => c.id === values.courseId);
    
    if (editingSession) {
      // Update existing session
      const updatedSessions = classSessions.map(session => 
        session.id === editingSession.id ? 
        {
          ...session,
          title: values.title,
          courseId: values.courseId,
          courseName: course?.name || 'Unknown Course',
          startTime,
          endTime,
          meetingUrl: values.meetingUrl,
          meetingId: values.meetingId || '',
          meetingPassword: values.meetingPassword || '',
          description: values.description || ''
        } : 
        session
      );
      
      setClassSessions(updatedSessions);
      message.success('Đã cập nhật buổi học trực tuyến thành công');
    } else {
      // Create new session
      const now = moment();
      const sessionStart = moment(startTime);
      
      let status = 'UPCOMING';
      if (now.isAfter(sessionStart) && now.isBefore(moment(endTime))) {
        status = 'ACTIVE';
      } else if (now.isAfter(moment(endTime))) {
        status = 'ENDED';
      }
      
      const newSession = {
        id: Math.max(...classSessions.map(s => s.id), 0) + 1,
        title: values.title,
        courseId: values.courseId,
        courseName: course?.name || 'Unknown Course',
        startTime,
        endTime,
        meetingUrl: values.meetingUrl,
        meetingId: values.meetingId || '',
        meetingPassword: values.meetingPassword || '',
        description: values.description || '',
        status,
        teacherId: parseInt(userId) || 2
      };
      
      setClassSessions([...classSessions, newSession]);
      message.success('Đã tạo buổi học trực tuyến mới thành công');
    }
    
    setCreateModalVisible(false);
  };

  // Join a class session
  const handleJoinSession = (session) => {
    setSelectedSession(session);
    setJoinModalVisible(true);
  };

  const joinClassSession = () => {
    if (selectedSession) {
      window.open(selectedSession.meetingUrl, '_blank');
      setJoinModalVisible(false);
    }
  };
  
  // Copy meeting info to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        message.success('Đã sao chép vào clipboard');
      },
      () => {
        message.error('Không thể sao chép. Vui lòng thử lại.');
      }
    );
  };
  
  // Add recording URL to a session
  const handleAddRecording = (sessionId, recordingUrl) => {
    if (!recordingUrl) return;
    
    const updatedSessions = classSessions.map(session => 
      session.id === sessionId ? { ...session, recordingUrl } : session
    );
    
    setClassSessions(updatedSessions);
    message.success('Đã thêm đường dẫn bản ghi thành công');
  };

  // ===== Calendar Functions =====
  
  const getSessionListData = (value) => {
    const sessionDate = value.format('YYYY-MM-DD');
    return classSessions.filter(session => 
      moment(session.startTime).format('YYYY-MM-DD') === sessionDate
    );
  };

  const dateCellRender = (value) => {
    const listData = getSessionListData(value);
    return (
      <ul className="events" style={{ listStyle: 'none', padding: 0 }}>
        {listData.map(item => (
          <li key={item.id}>
            <Badge 
              status={
                item.status === 'ACTIVE' ? 'processing' : 
                item.status === 'UPCOMING' ? 'warning' : 'default'
              } 
              text={
                <Tooltip title={`${item.title} (${moment(item.startTime).format('HH:mm')} - ${moment(item.endTime).format('HH:mm')})`}>
                  <span style={{ fontSize: '0.8em' }}>{item.title.length > 14 ? `${item.title.substring(0, 14)}...` : item.title}</span>
                </Tooltip>
              } 
            />
          </li>
        ))}
      </ul>
    );
  };

  // ===== RENDER FUNCTIONS BASED ON USER ROLE =====

  // Teacher view components
  const renderTeacherView = () => {
    return (
      <div className="teacher-online-classes-view">
        <div className="header-actions" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Quản lý lớp học trực tuyến</Title>
          <Space>
            <Button 
              icon={calendarView ? <TeamOutlined /> : <CalendarOutlined />}
              onClick={() => setCalendarView(!calendarView)}
            >
              {calendarView ? 'Xem dạng danh sách' : 'Xem lịch'}
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleCreateSession}
            >
              Lên lịch buổi học mới
            </Button>
          </Space>
        </div>
        
        {calendarView ? (
          <Card>
            <Calendar dateCellRender={dateCellRender} />
          </Card>
        ) : (
          <Tabs defaultActiveKey="upcoming">
            <TabPane tab="Sắp diễn ra" key="upcoming">
              {renderSessionsList(classSessions.filter(session => session.status === 'UPCOMING'))}
            </TabPane>
            <TabPane tab="Đang diễn ra" key="active">
              {renderSessionsList(classSessions.filter(session => session.status === 'ACTIVE'))}
            </TabPane>
            <TabPane tab="Đã kết thúc" key="ended">
              {renderSessionsList(classSessions.filter(session => session.status === 'ENDED'))}
            </TabPane>
            <TabPane tab="Tất cả buổi học" key="all">
              {renderSessionsList(classSessions)}
            </TabPane>
          </Tabs>
        )}
      </div>
    );
  };

  const renderSessionsList = (sessions) => {
    if (sessions.length === 0) {
      return <Empty description="Không có buổi học nào" />;
    }

    return (
      <List
        itemLayout="vertical"
        dataSource={sessions}
        renderItem={session => {
          const isActive = session.status === 'ACTIVE';
          const isUpcoming = session.status === 'UPCOMING';
          const isEnded = session.status === 'ENDED';
          
          const now = moment();
          const startTime = moment(session.startTime);
          const endTime = moment(session.endTime);
          
          // Calculate if session is starting soon (within 15 minutes)
          const startingSoon = isUpcoming && now.isAfter(startTime.clone().subtract(15, 'minutes'));
          
          return (
            <Card 
              style={{ marginBottom: 16 }}
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <VideoCameraOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  {session.title}
                </div>
              }
              extra={
                <Space>
                  <Tag color="blue">{session.courseName}</Tag>
                  {isActive && <Tag color="green">Đang diễn ra</Tag>}
                  {startingSoon && <Tag color="orange">Sắp bắt đầu</Tag>}
                  {isUpcoming && !startingSoon && <Tag color="orange">Sắp diễn ra</Tag>}
                  {isEnded && <Tag color="red">Đã kết thúc</Tag>}
                </Space>
              }
              actions={[
                isActive || startingSoon ? (
                  <Button 
                    type="primary" 
                    icon={<VideoCameraOutlined />} 
                    onClick={() => handleJoinSession(session)}
                  >
                    {isActive ? 'Tham gia ngay' : 'Bắt đầu buổi học'}
                  </Button>
                ) : isUpcoming ? (
                  <Button 
                    disabled 
                    icon={<ClockCircleOutlined />}
                  >
                    Chưa đến giờ
                  </Button>
                ) : (
                  <Button 
                    disabled={!session.recordingUrl}
                    icon={<VideoCameraOutlined />}
                    onClick={() => session.recordingUrl && window.open(session.recordingUrl, '_blank')}
                  >
                    {session.recordingUrl ? 'Xem bản ghi' : 'Không có bản ghi'}
                  </Button>
                ),
                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => handleEditSession(session)}
                  disabled={isEnded}
                >
                  Chỉnh sửa
                </Button>,
                <Popconfirm
                  title="Bạn có chắc muốn hủy buổi học này?"
                  onConfirm={() => handleDeleteSession(session.id)}
                  okText="Đồng ý"
                  cancelText="Hủy"
                  disabled={isEnded}
                >
                  <Button 
                    danger 
                    icon={<DeleteOutlined />}
                    disabled={isEnded}
                  >
                    {isEnded ? 'Đã kết thúc' : 'Hủy buổi học'}
                  </Button>
                </Popconfirm>
              ]}
            >
              <div style={{ marginBottom: 16 }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text>
                    <ClockCircleOutlined style={{ marginRight: 8 }} />
                    <Text strong>Thời gian: </Text>
                    {startTime.format('DD/MM/YYYY HH:mm')} - {endTime.format('HH:mm')}
                  </Text>
                  
                  <Text>
                    <LinkOutlined style={{ marginRight: 8 }} />
                    <Text strong>Đường dẫn: </Text>
                    <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer">
                      {session.meetingUrl}
                    </a>
                    <Button 
                      type="text" 
                      icon={<CopyOutlined />} 
                      onClick={() => copyToClipboard(session.meetingUrl)}
                      size="small"
                    />
                  </Text>
                  
                  {session.meetingId && (
                    <Text>
                      <Text strong>ID: </Text>
                      {session.meetingId}
                      <Button 
                        type="text" 
                        icon={<CopyOutlined />} 
                        onClick={() => copyToClipboard(session.meetingId)}
                        size="small"
                      />
                    </Text>
                  )}
                  
                  {session.meetingPassword && (
                    <Text>
                      <Text strong>Mật khẩu: </Text>
                      {session.meetingPassword}
                      <Button 
                        type="text" 
                        icon={<CopyOutlined />} 
                        onClick={() => copyToClipboard(session.meetingPassword)}
                        size="small"
                      />
                    </Text>
                  )}
                  
                  {session.description && (
                    <Paragraph>
                      <Text strong>Mô tả: </Text>
                      {session.description}
                    </Paragraph>
                  )}
                  
                  {isEnded && (
                    <div style={{ marginTop: 16 }}>
                      <Space.Compact style={{ width: '100%' }}>
                        <Input
                          style={{ width: 'calc(100% - 100px)' }}
                          placeholder="Thêm đường dẫn bản ghi"
                          defaultValue={session.recordingUrl || ''}
                          id={`recording-url-${session.id}`}
                        />
                        <Button
                          type="primary"
                          onClick={() => handleAddRecording(
                            session.id, 
                            document.getElementById(`recording-url-${session.id}`).value
                          )}
                        >
                          Lưu
                        </Button>
                      </Space.Compact>
                    </div>
                  )}
                </Space>
              </div>
            </Card>
          );
        }}
      />
    );
  };

  // Student view components
  const renderStudentView = () => {
    const upcomingCount = classSessions.filter(s => s.status === 'UPCOMING').length;
    const activeCount = classSessions.filter(s => s.status === 'ACTIVE').length;
    
    return (
      <div className="student-online-classes-view">
        <Title level={4}>Lớp học trực tuyến</Title>
        
        {/* Quick stats */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Đang diễn ra"
                value={activeCount}
                valueStyle={{ color: activeCount > 0 ? '#52c41a' : undefined }}
                prefix={<VideoCameraOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Sắp diễn ra"
                value={upcomingCount}
                valueStyle={{ color: upcomingCount > 0 ? '#faad14' : undefined }}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng số buổi học"
                value={classSessions.length}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>
        
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            icon={calendarView ? <TeamOutlined /> : <CalendarOutlined />}
            onClick={() => setCalendarView(!calendarView)}
          >
            {calendarView ? 'Xem dạng danh sách' : 'Xem lịch'}
          </Button>
        </div>
        
        {calendarView ? (
          <Card>
            <Calendar dateCellRender={dateCellRender} />
          </Card>
        ) : (
          <Tabs defaultActiveKey="active">
            <TabPane tab="Đang diễn ra" key="active">
              {renderStudentSessionsList(classSessions.filter(session => session.status === 'ACTIVE'))}
            </TabPane>
            <TabPane tab="Sắp diễn ra" key="upcoming">
              {renderStudentSessionsList(classSessions.filter(session => session.status === 'UPCOMING'))}
            </TabPane>
            <TabPane tab="Đã kết thúc" key="ended">
              {renderStudentSessionsList(classSessions.filter(session => session.status === 'ENDED'))}
            </TabPane>
          </Tabs>
        )}
      </div>
    );
  };

  const renderStudentSessionsList = (sessions) => {
    if (sessions.length === 0) {
      return <Empty description="Không có buổi học nào" />;
    }

    return (
      <List
        itemLayout="vertical"
        dataSource={sessions}
        renderItem={session => {
          const isActive = session.status === 'ACTIVE';
          const isUpcoming = session.status === 'UPCOMING';
          const isEnded = session.status === 'ENDED';
          
          const now = moment();
          const startTime = moment(session.startTime);
          const endTime = moment(session.endTime);
          
          // Calculate if session is starting soon (within 15 minutes)
          const startingSoon = isUpcoming && now.isAfter(startTime.clone().subtract(15, 'minutes'));
          
          // Calculate countdown or elapsed time
          let timeDisplay = '';
          let timeColor = '';
          
          if (isActive) {
            const elapsed = moment.duration(now.diff(startTime));
            timeDisplay = `Đang diễn ra (${elapsed.hours()}h ${elapsed.minutes()}m)`;
            timeColor = 'green';
          } else if (isUpcoming) {
            const remaining = moment.duration(startTime.diff(now));
            if (startingSoon) {
              timeDisplay = `Bắt đầu sau ${remaining.minutes()}m`;
              timeColor = 'orange';
            } else {
              timeDisplay = `Diễn ra sau ${remaining.days() > 0 ? `${remaining.days()} ngày ` : ''}${remaining.hours()}h ${remaining.minutes()}m`;
              timeColor = 'blue';
            }
          } else {
            timeDisplay = 'Đã kết thúc';
            timeColor = 'gray';
          }
          
          return (
            <Card 
              style={{ marginBottom: 16 }}
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <VideoCameraOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  {session.title}
                </div>
              }
              extra={
                <Space>
                  <Tag color="blue">{session.courseName}</Tag>
                  <Tag color={
                    isActive ? 'green' : 
                    startingSoon ? 'orange' : 
                    isUpcoming ? 'blue' : 'red'
                  }>
                    {timeDisplay}
                  </Tag>
                </Space>
              }
              actions={[
                isActive || startingSoon ? (
                  <Button 
                    type="primary" 
                    icon={<VideoCameraOutlined />} 
                    onClick={() => handleJoinSession(session)}
                  >
                    Tham gia ngay
                  </Button>
                ) : isUpcoming ? (
                  <Button 
                    disabled 
                    icon={<ClockCircleOutlined />}
                  >
                    Chưa đến giờ
                  </Button>
                ) : (
                  <Button 
                    disabled={!session.recordingUrl}
                    icon={<VideoCameraOutlined />}
                    onClick={() => session.recordingUrl && window.open(session.recordingUrl, '_blank')}
                  >
                    {session.recordingUrl ? 'Xem bản ghi' : 'Không có bản ghi'}
                  </Button>
                )
              ]}
            >
              <div style={{ marginBottom: 16 }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text>
                    <ClockCircleOutlined style={{ marginRight: 8 }} />
                    <Text strong>Thời gian: </Text>
                    {startTime.format('DD/MM/YYYY HH:mm')} - {endTime.format('HH:mm')}
                  </Text>
                  
                  {(isActive || startingSoon) && (
                    <>
                      <Text>
                        <LinkOutlined style={{ marginRight: 8 }} />
                        <Text strong>Đường dẫn: </Text>
                        <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer">
                          {session.meetingUrl}
                        </a>
                        <Button 
                          type="text" 
                          icon={<CopyOutlined />} 
                          onClick={() => copyToClipboard(session.meetingUrl)}
                          size="small"
                        />
                      </Text>
                      
                      {session.meetingId && (
                        <Text>
                          <Text strong>ID: </Text>
                          {session.meetingId}
                          <Button 
                            type="text" 
                            icon={<CopyOutlined />} 
                            onClick={() => copyToClipboard(session.meetingId)}
                            size="small"
                          />
                        </Text>
                      )}
                      
                      {session.meetingPassword && (
                        <Text>
                          <Text strong>Mật khẩu: </Text>
                          {session.meetingPassword}
                          <Button 
                            type="text" 
                            icon={<CopyOutlined />} 
                            onClick={() => copyToClipboard(session.meetingPassword)}
                            size="small"
                          />
                        </Text>
                      )}
                    </>
                  )}
                  
                  {session.description && (
                    <Paragraph>
                      <Text strong>Mô tả: </Text>
                      {session.description}
                    </Paragraph>
                  )}
                </Space>
              </div>
            </Card>
          );
        }}
      />
    );
  };

  // Shared modals and forms
  const renderSessionFormModal = () => {
    return (
      <Modal
        title={editingSession ? "Chỉnh sửa buổi học trực tuyến" : "Lên lịch buổi học trực tuyến mới"}
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitSessionForm}
        >
          <Form.Item
            name="title"
            label="Tiêu đề buổi học"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề buổi học' }]}
          >
            <Input placeholder="Ví dụ: Thực hành Java với Collections" />
          </Form.Item>
          
          <Form.Item
            name="courseId"
            label="Khóa học"
            rules={[{ required: true, message: 'Vui lòng chọn khóa học' }]}
          >
            <Select placeholder="Chọn khóa học">
              {courses.map(course => (
                <Option key={course.id} value={course.id}>
                  {course.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Ngày"
                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="timeRange"
                label="Thời gian"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu và kết thúc' }]}
              >
                <TimePicker.RangePicker 
                  style={{ width: '100%' }} 
                  format="HH:mm"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="meetingUrl"
            label="Đường dẫn phòng học"
            rules={[
              { required: true, message: 'Vui lòng nhập đường dẫn phòng học' },
              { type: 'url', message: 'Vui lòng nhập đường dẫn hợp lệ' }
            ]}
          >
            <Input placeholder="https://meet.google.com/abc-defg-hij" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="meetingId"
                label="ID phòng học (nếu có)"
              >
                <Input placeholder="abc-defg-hij" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="meetingPassword"
                label="Mật khẩu (nếu có)"
              >
                <Input placeholder="123456" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea 
              rows={4} 
              placeholder="Mô tả nội dung buổi học, yêu cầu chuẩn bị,..."
            />
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button style={{ marginRight: 8 }} onClick={() => setCreateModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingSession ? "Cập nhật" : "Tạo buổi học"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  const renderJoinClassModal = () => {
    if (!selectedSession) return null;
    
    return (
      <Modal
        title="Tham gia lớp học trực tuyến"
        open={joinModalVisible}
        onCancel={() => setJoinModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setJoinModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="join" type="primary" onClick={joinClassSession}>
            Tham gia ngay
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <VideoCameraOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <Title level={4} style={{ marginTop: 16 }}>{selectedSession.title}</Title>
        </div>
        
        <Divider />
        
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>Khóa học: </Text>
            <Text>{selectedSession.courseName}</Text>
          </div>
          
          <div>
            <Text strong>Thời gian: </Text>
            <Text>{moment(selectedSession.startTime).format('DD/MM/YYYY HH:mm')} - {moment(selectedSession.endTime).format('HH:mm')}</Text>
          </div>
          
          <div>
            <Text strong>Đường dẫn: </Text>
            <Text copyable>{selectedSession.meetingUrl}</Text>
          </div>
          
          {selectedSession.meetingId && (
            <div>
              <Text strong>ID: </Text>
              <Text copyable>{selectedSession.meetingId}</Text>
            </div>
          )}
          
          {selectedSession.meetingPassword && (
            <div>
              <Text strong>Mật khẩu: </Text>
              <Text copyable>{selectedSession.meetingPassword}</Text>
            </div>
          )}
          
          {selectedSession.description && (
            <div>
              <Text strong>Mô tả: </Text>
              <Paragraph>{selectedSession.description}</Paragraph>
            </div>
          )}
        </Space>
        
        <Divider />
        
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Khi nhấn "Tham gia ngay", bạn sẽ được chuyển đến trang web của nền tảng học trực tuyến.
          </Text>
        </div>
      </Modal>
    );
  };

  // Main content renderer with comprehensive role validation
  const renderMainContent = () => {
    // Don't render if no valid role or user ID
    if (!userId || !userRole || !token) {
      console.warn('OnlineClassesPage: Missing required authentication data:', { userId, userRole, token: !!token });
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
    console.error('OnlineClassesPage: Unrecognized role:', userRole);
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
    <div className="online-classes-page">
      {/* Main content based on user role */}
      {renderMainContent()}
      
      {/* Shared modals */}
      {renderSessionFormModal()}
      {renderJoinClassModal()}
    </div>
  );
}

export default OnlineClassesPage; 