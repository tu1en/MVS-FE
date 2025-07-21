import { BookOutlined, CalendarOutlined, CheckCircleOutlined, EditOutlined, FileTextOutlined, MessageOutlined, TeamOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Row, Spin, Statistic } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE } from '../constants/constants';
import api from '../services/api';

export default function TeacherDashboard() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    classStats: { totalClasses: 0, activeClasses: 0, totalStudents: 0 },
    assignmentStats: { totalAssignments: 0, pendingGrading: 0, graded: 0 },
    attendanceStats: { totalSessions: 0, averageAttendance: 0 },
    messageStats: { unreadMessages: 0 }
  });

  useEffect(() => {
    // Check if user is authenticated and has teacher role
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== ROLE.TEACHER) {
      console.error('User is not authenticated or not a teacher');
      message.error('Bạn không có quyền truy cập trang này');
      navigate('/login');
      return;
    }
    
    loadDashboardData();
  }, [navigate, message]);
  
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading teacher dashboard data...');
      
      // Use Promise.allSettled to handle each API call separately
      const [classroomsRes, assignmentsRes, dashboardStatsRes] = await Promise.allSettled([
        api.get('/classrooms/current-teacher'),
        api.get('/assignments/current-teacher'),
        api.get('/teacher/dashboard-stats')
      ]);

      // Process dashboard stats (main data source)
      let dashboardData = {
        classStats: { totalClasses: 0, activeClasses: 0, totalStudents: 0 },
        assignmentStats: { totalAssignments: 0, pendingGrading: 0, graded: 0 },
        attendanceStats: { totalSessions: 0, averageAttendance: 0 },
        messageStats: { unreadMessages: 0 }
      };
      
      if (dashboardStatsRes.status === 'fulfilled' && dashboardStatsRes.value.data) {
        dashboardData = dashboardStatsRes.value.data;
        console.log('Dashboard stats loaded successfully:', dashboardData);
      } else {
        console.error('Dashboard stats loading failed:', dashboardStatsRes.reason);
        message.warning('Không thể tải dữ liệu thống kê. Hiển thị dữ liệu mẫu.');
      }
      
      setDashboardData(dashboardData);
      
    } catch (error) {
      console.error('Error loading teacher dashboard data:', error);
      message.error('Không thể tải dữ liệu dashboard');
      
      // Fallback to mock data in case of overall failure
      setDashboardData({
        classStats: {
          totalClasses: 0,
          activeClasses: 0,
          totalStudents: 0
        },
        assignmentStats: {
          totalAssignments: 0,
          pendingGrading: 0,
          graded: 0
        },
        attendanceStats: {
          totalSessions: 0,
          averageAttendance: 0
        },
        messageStats: {
          unreadMessages: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (path) => {
    navigate(path);
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/teacher/dashboard-stats');
      setDashboardStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Dashboard Stats API error:', error.message);
      // Tạo dữ liệu mẫu khi API trả về lỗi
      const mockStats = {
        classStats: {
          totalClasses: 3,
          activeClasses: 2,
          totalStudents: 45
        },
        assignmentStats: {
          totalAssignments: 12,
          pendingGrading: 5,
          graded: 7
        },
        attendanceStats: {
          totalSessions: 24,
          averageAttendance: 85.5
        }
      };
      setDashboardStats(mockStats);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Trang Giáo Viên</h1>
      
      {/* Live Classroom Button */}
      <div className="mb-8 text-center">
        <Button
          type="primary"
          size="large"
          icon={<VideoCameraOutlined />}
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '8px',
            height: '50px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
          onClick={() => navigate("/teacher/live-classroom/room-123")}
        >
          🚀 Vào Lớp Trực Tuyến
        </Button>
      </div>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số lớp"
              value={dashboardData.classStats.totalClasses}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng học sinh"
              value={dashboardData.classStats.totalStudents}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Chờ chấm điểm"
              value={dashboardData.assignmentStats.pendingGrading}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Chuyên cần TB"
              value={dashboardData.attendanceStats.averageAttendance}
              suffix="%"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: dashboardData.attendanceStats.averageAttendance >= 80 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Navigation Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => handleCardClick("/teacher/courses")}
          >
            <div className="text-center">
              <TeamOutlined className="text-4xl text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Quản lý lớp học</h2>
              <p className="text-gray-600">
                Xem và quản lý các lớp học bạn phụ trách
              </p>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => handleCardClick("/teacher/assignments")}
          >
            <div className="text-center">
              <FileTextOutlined className="text-4xl text-purple-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Quản lý bài tập</h2>
              <p className="text-gray-600">
                Tạo, chỉnh sửa và chấm điểm bài tập cho học sinh
              </p>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => handleCardClick("/teacher/lectures")}
          >
            <div className="text-center">
              <VideoCameraOutlined className="text-4xl text-orange-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Bài giảng</h2>
              <p className="text-gray-600">
                Quản lý bài giảng, tài liệu và video cho khóa học
              </p>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => handleCardClick("/teacher/schedule")}
          >
            <div className="text-center">
              <CalendarOutlined className="text-4xl text-teal-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Lịch giảng dạy</h2>
              <p className="text-gray-600">
                Xem và quản lý lịch dạy của bạn
              </p>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => handleCardClick("/teacher/messages")}
          >
            <div className="text-center">
              <MessageOutlined className="text-4xl text-cyan-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Nhắn tin & Phản hồi</h2>
              <p className="text-gray-600">
                Nhắn tin với học sinh và xem phản hồi khóa học
              </p>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => handleCardClick("/teacher/assignments")}
          >
            <div className="text-center">
              <CheckCircleOutlined className="text-4xl text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Chấm điểm</h2>
              <p className="text-gray-600">
                Chấm điểm bài tập và kiểm tra của học sinh
              </p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}