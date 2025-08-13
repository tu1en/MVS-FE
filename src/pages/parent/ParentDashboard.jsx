import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Select, 
  Badge, 
  Timeline, 
  Statistic, 
  Button,
  Alert,
  Spin,
  Empty
} from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  BookOutlined, 
  TrophyOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  MessageOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import ChildSwitcher from '../../components/parent/ChildSwitcher';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Parent Dashboard Component
 * Based on PARENT_ROLE_SPEC.md - Main dashboard for parents
 * Features: Multi-child overview, quick stats, notifications, timeline
 */
const ParentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [children, setChildren] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    attendanceThisWeek: { present: 0, total: 0 },
    upcomingAssignments: [],
    recentGrades: [],
    notifications: [],
    pendingLeaveNotices: 0
  });

  // Mock data - will be replaced with API calls
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Mock children data
        const mockChildren = [
          {
            id: 1,
            name: 'Nguyễn Minh An',
            grade: 'Lớp 11A',
            avatar: null,
            teacherName: 'Cô Hoàng Thị Mai'
          },
          {
            id: 2,
            name: 'Nguyễn Minh Hằng',
            grade: 'Lớp 9B',
            avatar: null,
            teacherName: 'Thầy Trần Văn Bình'
          }
        ];

        // Mock dashboard stats
        const mockDashboardData = {
          attendanceThisWeek: { present: 8, total: 10 },
          upcomingAssignments: [
            {
              id: 1,
              title: 'Bài tập Toán chương 3',
              subject: 'Toán học',
              dueDate: '2025-08-15',
              status: 'pending'
            },
            {
              id: 2,
              title: 'Thuyết trình Lịch sử',
              subject: 'Lịch sử',
              dueDate: '2025-08-17',
              status: 'pending'
            }
          ],
          recentGrades: [
            {
              id: 1,
              subject: 'Văn học',
              assignment: 'Kiểm tra 15 phút',
              grade: 8.5,
              date: '2025-08-10'
            },
            {
              id: 2,
              subject: 'Toán học',
              assignment: 'Bài kiểm tra chương 2',
              grade: 9.0,
              date: '2025-08-08'
            }
          ],
          notifications: [
            {
              id: 1,
              type: 'leave_notice_ack',
              message: 'Thông báo nghỉ học đã được giáo viên xác nhận',
              time: '2 giờ trước',
              read: false
            },
            {
              id: 2,
              type: 'new_grade',
              message: 'Điểm Văn học mới đã được cập nhật',
              time: '1 ngày trước',
              read: true
            }
          ],
          pendingLeaveNotices: 1
        };

        setChildren(mockChildren);
        setDashboardData(mockDashboardData);
        
        // Set default selected child
        if (mockChildren.length > 0) {
          setSelectedChildId(mockChildren[0].id);
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const selectedChild = children.find(child => child.id === selectedChildId);

  const attendanceRate = dashboardData.attendanceThisWeek.total > 0 
    ? (dashboardData.attendanceThisWeek.present / dashboardData.attendanceThisWeek.total * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>
            <UserOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
            Bảng điều khiển phụ huynh
          </Title>
          <Text type="secondary">
            Chào mừng {user?.fullName}, theo dõi học tập của con em
          </Text>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<BellOutlined />}
            badge={{ count: dashboardData.notifications.filter(n => !n.read).length }}
          >
            Thông báo
          </Button>
        </Col>
      </Row>

      {/* Child Switcher */}
      <Row style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <ChildSwitcher 
            children={children}
            selectedChildId={selectedChildId}
            onChildChange={setSelectedChildId}
          />
        </Col>
      </Row>

      {/* Quick Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Chuyên cần tuần này"
              value={attendanceRate}
              suffix="%"
              prefix={<CalendarOutlined />}
              valueStyle={{ 
                color: attendanceRate >= 80 ? '#3f8600' : attendanceRate >= 60 ? '#cf1322' : '#cf1322' 
              }}
            />
            <Text type="secondary">
              {dashboardData.attendanceThisWeek.present}/{dashboardData.attendanceThisWeek.total} buổi học
            </Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bài tập sắp đến hạn"
              value={dashboardData.upcomingAssignments.length}
              prefix={<BookOutlined />}
              valueStyle={{ color: dashboardData.upcomingAssignments.length > 0 ? '#cf1322' : '#3f8600' }}
            />
            <Text type="secondary">Trong 7 ngày tới</Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Điểm trung bình"
              value={8.8}
              precision={1}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <Text type="secondary">Tháng này</Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Thông báo nghỉ"
              value={dashboardData.pendingLeaveNotices}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: dashboardData.pendingLeaveNotices > 0 ? '#1890ff' : '#3f8600' }}
            />
            <Text type="secondary">Chờ xác nhận</Text>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        {/* Left Column */}
        <Col xs={24} lg={16}>
          {/* Recent Activity Timeline */}
          <Card 
            title={
              <span>
                <ClockCircleOutlined style={{ marginRight: '8px' }} />
                Hoạt động gần đây
              </span>
            }
            style={{ marginBottom: '24px' }}
          >
            {selectedChild ? (
              <Timeline>
                <Timeline.Item color="green">
                  <div>
                    <Text strong>Điểm Văn học được cập nhật</Text>
                    <br />
                    <Text type="secondary">Kiểm tra 15 phút: 8.5 điểm - 1 ngày trước</Text>
                  </div>
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <div>
                    <Text strong>Thông báo nghỉ học đã được xác nhận</Text>
                    <br />
                    <Text type="secondary">Nghỉ buổi sáng ngày 12/08 - Cô Mai đã xem - 2 ngày trước</Text>
                  </div>
                </Timeline.Item>
                <Timeline.Item color="orange">
                  <div>
                    <Text strong>Bài tập mới được giao</Text>
                    <br />
                    <Text type="secondary">Toán học: Bài tập chương 3 - Hạn nộp 15/08</Text>
                  </div>
                </Timeline.Item>
                <Timeline.Item>
                  <div>
                    <Text strong>Điểm danh đầy đủ</Text>
                    <br />
                    <Text type="secondary">Có mặt tất cả các tiết học ngày 10/08</Text>
                  </div>
                </Timeline.Item>
              </Timeline>
            ) : (
              <Empty description="Vui lòng chọn con để xem hoạt động" />
            )}
          </Card>

          {/* Upcoming Assignments */}
          <Card 
            title={
              <span>
                <BookOutlined style={{ marginRight: '8px' }} />
                Bài tập sắp đến hạn
              </span>
            }
          >
            {dashboardData.upcomingAssignments.length > 0 ? (
              <div>
                {dashboardData.upcomingAssignments.map(assignment => (
                  <Card 
                    key={assignment.id}
                    size="small" 
                    style={{ marginBottom: '12px' }}
                    hoverable
                  >
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Text strong>{assignment.title}</Text>
                        <br />
                        <Text type="secondary">{assignment.subject}</Text>
                      </Col>
                      <Col>
                        <Badge 
                          status="warning" 
                          text={`Hạn: ${assignment.dueDate}`}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty description="Không có bài tập sắp đến hạn" />
            )}
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          {/* Child Info Card */}
          {selectedChild && (
            <Card 
              title="Thông tin học sinh"
              style={{ marginBottom: '24px' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  fontSize: '24px'
                }}>
                  <UserOutlined />
                </div>
                <Title level={4} style={{ margin: 0 }}>{selectedChild.name}</Title>
                <Text type="secondary">{selectedChild.grade}</Text>
              </div>
              <div>
                <Text strong>Giáo viên chủ nhiệm:</Text>
                <br />
                <Text>{selectedChild.teacherName}</Text>
              </div>
            </Card>
          )}

          {/* Notifications */}
          <Card 
            title={
              <span>
                <MessageOutlined style={{ marginRight: '8px' }} />
                Thông báo mới
              </span>
            }
          >
            {dashboardData.notifications.length > 0 ? (
              <div>
                {dashboardData.notifications.slice(0, 5).map(notification => (
                  <Alert
                    key={notification.id}
                    message={notification.message}
                    description={notification.time}
                    type={notification.read ? 'info' : 'warning'}
                    showIcon
                    style={{ marginBottom: '12px' }}
                    closable={!notification.read}
                  />
                ))}
              </div>
            ) : (
              <Empty description="Không có thông báo mới" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ParentDashboard;