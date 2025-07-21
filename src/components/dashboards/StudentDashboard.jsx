import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Tabs, 
  Alert,
  Calendar,
  Badge,
  Progress,
  Statistic,
  message,
  Typography,
  List,
  Avatar
} from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import DashboardLayout, { DashboardIcons, DashboardColors } from '../common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { StudentService } from '../../services/studentService';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

/**
 * Dashboard dành cho Student
 * Hiển thị thông tin học tập và lịch học
 */
const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({});
  const [myCourses, setMyCourses] = useState([]);
  const [mySchedule, setMySchedule] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load student courses
      const coursesResponse = await StudentService.getStudentCourses();
      setMyCourses(coursesResponse || []);
      
      // Mock data for other sections (replace with actual API calls)
      setDashboardStats({
        totalCourses: 5,
        attendanceRate: 92,
        completedAssignments: 8,
        pendingAssignments: 3,
        averageGrade: 8.5
      });

      setMySchedule([
        {
          id: 1,
          courseName: 'Lập trình Java',
          time: '08:00 - 10:00',
          date: '2024-01-15',
          room: 'Phòng A101',
          teacher: 'Nguyễn Văn A',
          status: 'scheduled'
        },
        {
          id: 2,
          courseName: 'Cơ sở dữ liệu',
          time: '14:00 - 16:00',
          date: '2024-01-15',
          room: 'Phòng B202',
          teacher: 'Trần Thị B',
          status: 'scheduled'
        }
      ]);

      setAttendanceRecords([
        {
          id: 1,
          courseName: 'Lập trình Java',
          date: '2024-01-14',
          status: 'present',
          time: '08:00 - 10:00'
        },
        {
          id: 2,
          courseName: 'Cơ sở dữ liệu',
          date: '2024-01-13',
          status: 'absent',
          time: '14:00 - 16:00'
        },
        {
          id: 3,
          courseName: 'Mạng máy tính',
          date: '2024-01-12',
          status: 'late',
          time: '10:00 - 12:00'
        }
      ]);

      setAssignments([
        {
          id: 1,
          title: 'Bài tập Java - OOP',
          courseName: 'Lập trình Java',
          dueDate: '2024-01-20',
          status: 'pending',
          priority: 'high'
        },
        {
          id: 2,
          title: 'Thiết kế CSDL',
          courseName: 'Cơ sở dữ liệu',
          dueDate: '2024-01-18',
          status: 'submitted',
          priority: 'medium',
          grade: 8.5
        }
      ]);

    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
      message.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Statistics for dashboard
  const stats = [
    {
      title: 'Môn học đang theo',
      value: dashboardStats.totalCourses || 0,
      icon: DashboardIcons.document,
      color: DashboardColors.primary
    },
    {
      title: 'Tỷ lệ điểm danh',
      value: dashboardStats.attendanceRate || 0,
      suffix: '%',
      icon: DashboardIcons.success,
      color: DashboardColors.success
    },
    {
      title: 'Bài tập chờ nộp',
      value: dashboardStats.pendingAssignments || 0,
      icon: DashboardIcons.warning,
      color: DashboardColors.warning
    },
    {
      title: 'Điểm trung bình',
      value: dashboardStats.averageGrade || 0,
      suffix: '/10',
      icon: DashboardIcons.success,
      color: DashboardColors.info
    }
  ];

  // Columns for schedule table
  const scheduleColumns = [
    {
      title: 'Môn học',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time'
    },
    {
      title: 'Phòng học',
      dataIndex: 'room',
      key: 'room'
    },
    {
      title: 'Giảng viên',
      dataIndex: 'teacher',
      key: 'teacher'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' : 
          status === 'scheduled' ? 'blue' : 
          status === 'cancelled' ? 'red' : 'orange'
        }>
          {status === 'completed' ? 'Đã học' : 
           status === 'scheduled' ? 'Đã lên lịch' : 
           status === 'cancelled' ? 'Đã hủy' : 'Đang diễn ra'}
        </Tag>
      )
    }
  ];

  // Columns for attendance table
  const attendanceColumns = [
    {
      title: 'Môn học',
      dataIndex: 'courseName',
      key: 'courseName'
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'present' ? 'green' : 
          status === 'absent' ? 'red' : 
          status === 'late' ? 'orange' : 'blue'
        }>
          {status === 'present' ? 'Có mặt' : 
           status === 'absent' ? 'Vắng mặt' : 
           status === 'late' ? 'Đi muộn' : 'Khác'}
        </Tag>
      )
    }
  ];

  // Columns for assignments table
  const assignmentsColumns = [
    {
      title: 'Bài tập',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Môn học',
      dataIndex: 'courseName',
      key: 'courseName'
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'submitted' ? 'green' : 
          status === 'pending' ? 'orange' : 
          status === 'overdue' ? 'red' : 'blue'
        }>
          {status === 'submitted' ? 'Đã nộp' : 
           status === 'pending' ? 'Chờ nộp' : 
           status === 'overdue' ? 'Quá hạn' : 'Đang làm'}
        </Tag>
      )
    },
    {
      title: 'Điểm',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade) => grade ? `${grade}/10` : '-'
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={
          priority === 'high' ? 'red' : 
          priority === 'medium' ? 'orange' : 'green'
        }>
          {priority === 'high' ? 'Cao' : 
           priority === 'medium' ? 'Trung bình' : 'Thấp'}
        </Tag>
      )
    }
  ];

  const dashboardActions = (
    <Space>
      <Button 
        type="primary" 
        icon={<CalendarOutlined />}
        onClick={() => window.location.href = '/student/schedule'}
      >
        Xem thời khóa biểu
      </Button>
      <Button 
        icon={<BookOutlined />}
        onClick={() => window.location.href = '/student/courses'}
      >
        Môn học của tôi
      </Button>
    </Space>
  );

  return (
    <DashboardLayout
      title="Dashboard Học viên"
      subtitle={`Chào mừng ${user?.fullName || user?.username}, hôm nay là ${new Date().toLocaleDateString('vi-VN')}`}
      stats={stats}
      actions={dashboardActions}
      loading={loading}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              Tổng quan
            </span>
          } 
          key="overview"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <span>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    Lịch học hôm nay
                  </span>
                }
                extra={
                  <Button 
                    type="link" 
                    onClick={() => setActiveTab('schedule')}
                  >
                    Xem tất cả
                  </Button>
                }
              >
                <Table
                  dataSource={mySchedule.slice(0, 3)}
                  columns={scheduleColumns}
                  pagination={false}
                  size="small"
                  loading={loading}
                  locale={{ emptyText: 'Không có lịch học hôm nay' }}
                />
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <span>
                    <FileTextOutlined style={{ marginRight: 8 }} />
                    Bài tập cần làm
                  </span>
                }
                extra={
                  <Button 
                    type="link"
                    onClick={() => setActiveTab('assignments')}
                  >
                    Xem tất cả
                  </Button>
                }
              >
                <List
                  dataSource={assignments.filter(a => a.status === 'pending').slice(0, 3)}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<FileTextOutlined />} />}
                        title={item.title}
                        description={
                          <Space>
                            <Text type="secondary">{item.courseName}</Text>
                            <Tag color={item.priority === 'high' ? 'red' : 'orange'}>
                              Hạn: {new Date(item.dueDate).toLocaleDateString('vi-VN')}
                            </Tag>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: 'Không có bài tập nào cần làm' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <span>
                    <TrophyOutlined style={{ marginRight: 8 }} />
                    Tiến độ học tập
                  </span>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text>Tỷ lệ điểm danh</Text>
                    <Progress 
                      percent={dashboardStats.attendanceRate} 
                      status={dashboardStats.attendanceRate >= 80 ? 'success' : 'exception'}
                    />
                  </div>
                  <div>
                    <Text>Bài tập hoàn thành</Text>
                    <Progress 
                      percent={Math.round((dashboardStats.completedAssignments / (dashboardStats.completedAssignments + dashboardStats.pendingAssignments)) * 100)} 
                      status="active"
                    />
                  </div>
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card 
                title={
                  <span>
                    <BarChartOutlined style={{ marginRight: 8 }} />
                    Thống kê nhanh
                  </span>
                }
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Môn học"
                      value={dashboardStats.totalCourses}
                      prefix={<BookOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Điểm TB"
                      value={dashboardStats.averageGrade}
                      suffix="/10"
                      precision={1}
                      prefix={<TrophyOutlined />}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <CalendarOutlined />
              Thời khóa biểu
            </span>
          } 
          key="schedule"
        >
          <Card>
            <Table
              dataSource={mySchedule}
              columns={scheduleColumns}
              loading={loading}
              locale={{ emptyText: 'Không có lịch học nào' }}
            />
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <CheckCircleOutlined />
              Điểm danh
            </span>
          } 
          key="attendance"
        >
          <Card>
            <Table
              dataSource={attendanceRecords}
              columns={attendanceColumns}
              loading={loading}
              locale={{ emptyText: 'Chưa có dữ liệu điểm danh' }}
            />
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              Bài tập
            </span>
          } 
          key="assignments"
        >
          <Card>
            <Table
              dataSource={assignments}
              columns={assignmentsColumns}
              loading={loading}
              locale={{ emptyText: 'Chưa có bài tập nào' }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </DashboardLayout>
  );
};

export default StudentDashboard;
