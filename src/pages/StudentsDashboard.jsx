import { BookOutlined, CalendarOutlined, CheckCircleOutlined, FileTextOutlined, MessageOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { Card, Col, Row, Spin, Statistic, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROLE } from "../constants/constants";
import api from "../services/api";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    assignmentStats: { total: 0, submitted: 0, pending: 0 },
    attendanceStats: { totalSessions: 0, attended: 0, percentage: 0 },
    courseStats: { totalCourses: 0, activeCourses: 0 },
    messageStats: { unreadMessages: 0 }
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== ROLE.STUDENT) {
      navigate("/");
      return;
    }
    loadDashboardData();
  }, [navigate]);
  
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use Promise.allSettled instead of Promise.all to handle individual endpoint failures
      const results = await Promise.allSettled([
        api.get('/assignments/student'),
        api.get('/attendance/student'),
        api.get('/courses/student'),
        api.get('/student-messages/unread-count')
      ]);
      
      // Initialize with default empty data
      let assignments = [];
      let attendance = [];
      let courses = [];
      let unreadCount = 0;
      
      // Process results safely
      if (results[0].status === 'fulfilled') {
        assignments = results[0].value.data.data || [];
      } else {
        console.error('Error loading assignments:', results[0].reason);
        message.error('Không thể tải dữ liệu bài tập. Vui lòng thử lại sau.');
      }
      
      if (results[1].status === 'fulfilled') {
        attendance = results[1].value.data.data || [];
      } else {
        console.error('Error loading attendance data:', results[1].reason);
        message.error('Không thể tải dữ liệu điểm danh. Vui lòng thử lại sau.');
      }
      
      if (results[2].status === 'fulfilled') {
        courses = results[2].value.data.data || [];
      } else {
        console.error('Error loading course data:', results[2].reason);
        message.error('Không thể tải dữ liệu khóa học. Vui lòng thử lại sau.');
      }
      
      if (results[3].status === 'fulfilled') {
        unreadCount = results[3].value.data.data?.count || 0;
      } else {
        console.error('Error loading message count:', results[3].reason);
      }
      
      // Calculate statistics based on available data
      const submittedCount = assignments.filter(a => a.submissionStatus === 'SUBMITTED').length;
      const attendedCount = attendance.filter(a => a.status === 'PRESENT').length;
      const attendancePercentage = attendance.length > 0 ? Math.round((attendedCount / attendance.length) * 100) : 0;
      const activeCourses = courses.filter(c => c.status === 'ACTIVE').length || 0;
      
      // Update dashboard data
      setDashboardData({
        assignmentStats: {
          total: assignments.length,
          submitted: submittedCount,
          pending: assignments.length - submittedCount
        },
        attendanceStats: {
          totalSessions: attendance.length,
          attended: attendedCount,
          percentage: attendancePercentage
        },
        courseStats: {
          totalCourses: courses.length,
          activeCourses: activeCourses
        },
        messageStats: {
          unreadMessages: unreadCount
        }
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      message.error('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
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
      <h1 className="text-3xl font-bold mb-8 text-center">Trang Học Sinh</h1>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số bài tập"
              value={dashboardData.assignmentStats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã nộp"
              value={dashboardData.assignmentStats.submitted}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tỷ lệ chuyên cần"
              value={dashboardData.attendanceStats.percentage}
              suffix="%"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: dashboardData.attendanceStats.percentage >= 80 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tin nhắn chưa đọc"
              value={dashboardData.messageStats.unreadMessages}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#fa8c16' }}
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
            onClick={() => handleCardClick("/student/accomplishments")}
          >
            <div className="text-center">
              <BookOutlined className="text-4xl text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Xem tổng quan học lực</h2>
              <p className="text-gray-600">
                Hiển thị tổng quát điểm trung bình, xếp loại, học lực theo môn
              </p>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => handleCardClick("/attendance-marking")}
          >
            <div className="text-center">
              <CalendarOutlined className="text-4xl text-green-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Điểm danh</h2>
              <p className="text-gray-600">
                Điểm danh online và xem lịch sử chuyên cần
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
              <h2 className="text-xl font-semibold mb-4">Bài tập</h2>
              <p className="text-gray-600">
                Xem và nộp bài tập, theo dõi trạng thái nộp bài
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
                Xem bài giảng, tài liệu và video học tập
              </p>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => handleCardClick("/student/messages")}
          >
            <div className="text-center">
              <MessageOutlined className="text-4xl text-cyan-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Nhắn tin & Phản hồi</h2>
              <p className="text-gray-600">
                Nhắn tin với giáo viên và gửi phản hồi khóa học
              </p>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => handleCardClick("/student-exam-result")}
          >
            <div className="text-center">
              <CheckCircleOutlined className="text-4xl text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Kết quả kiểm tra</h2>
              <p className="text-gray-600">
                Xem điểm số và kết quả các bài kiểm tra
              </p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
