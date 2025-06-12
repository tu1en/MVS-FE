import {
    BookOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    EditOutlined,
    FileTextOutlined,
    MessageOutlined,
    TeamOutlined,
    VideoCameraOutlined
} from '@ant-design/icons';
import { Card, Col, Row, Spin, Statistic, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE } from '../constants/constants';
import api from '../services/api';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    classStats: { totalClasses: 0, activeClasses: 0, totalStudents: 0 },
    assignmentStats: { totalAssignments: 0, pendingGrading: 0, graded: 0 },
    attendanceStats: { totalSessions: 0, averageAttendance: 0 },
    messageStats: { unreadMessages: 0 }
  });

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== ROLE.TEACHER) {
      navigate('/');
      return;
    }
    loadDashboardData();
  }, [navigate]);  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading teacher dashboard data...');
      
      // Gọi các API với error handling riêng cho từng endpoint
      const [classroomsRes, assignmentsRes, attendanceRes, messagesRes] = await Promise.all([
        api.get('/classrooms/current-teacher').catch(err => {
          console.warn('Classrooms API error:', err.message);
          return { data: { data: [] } };
        }),
        api.get('/assignments/current-teacher').catch(err => {
          console.warn('Assignments API error:', err.message);
          return { data: { data: [] } };
        }),
        api.get('/attendance/current-teacher/stats').catch(err => {
          console.warn('Attendance API error:', err.message);
          return { data: { data: {} } };
        }),
        api.get('/teacher-messages/unread-count').catch(err => {
          console.warn('Messages API error:', err.message);
          return { data: { data: { unreadMessages: 0 } } };
        })
      ]);

      const classrooms = classroomsRes.data.data || [];
      const assignments = assignmentsRes.data.data || [];
      const attendance = attendanceRes.data.data || {};
      
      const totalStudents = classrooms.reduce((sum, classroom) => sum + (classroom.studentCount || 0), 0);
      const pendingGrading = assignments.filter(a => a.status === 'SUBMITTED' && !a.isGraded).length;

      setDashboardData({
        classStats: {
          totalClasses: classrooms.length,
          activeClasses: classrooms.filter(c => c.status === 'ACTIVE').length,
          totalStudents: totalStudents
        },
        assignmentStats: {
          totalAssignments: assignments.length,
          pendingGrading: pendingGrading,
          graded: assignments.filter(a => a.isGraded).length
        },
        attendanceStats: {
          totalSessions: attendance.totalSessions || 0,
          averageAttendance: Math.round(attendance.averageAttendance || 0)
        },
        messageStats: {
          unreadMessages: messagesRes.data.data?.count || 0
        }
      });
    } catch (error) {
      console.error('Error loading teacher dashboard data:', error);
      message.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (path) => {
    navigate(path);
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
            onClick={() => handleCardClick("/classes")}
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
            onClick={() => handleCardClick("/assignments-new")}
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
            onClick={() => handleCardClick("/lectures")}
          >
            <div className="text-center">
              <VideoCameraOutlined className="text-4xl text-orange-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Bài giảng</h2>
              <p className="text-gray-600">
                Quản lý bài giảng, tài liệu và video cho khóa học
              </p>
            </div>
          </Card>
        </Col>        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => handleCardClick("/teacher/attendance")}
          >
            <div className="text-center">
              <CalendarOutlined className="text-4xl text-green-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Quản lý điểm danh</h2>
              <p className="text-gray-600">
                Tạo phiên điểm danh và xem báo cáo chuyên cần
              </p>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => handleCardClick("/messaging")}
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
            onClick={() => handleCardClick("/teacher/grading")}
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