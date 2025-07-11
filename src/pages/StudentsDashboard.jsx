import { AreaChartOutlined, BookOutlined, CalendarOutlined, CheckCircleOutlined, FileTextOutlined, MessageOutlined, UserOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { App, Button, Card, Col, Progress, Row, Spin, Statistic, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROLE } from "../constants/constants";
import api from "../services/api";
import ClassroomService from "../services/classroomService";

const { Title, Text } = Typography;

export default function StudentDashboard() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    assignmentStats: { total: 0, submitted: 0, pending: 0, graded: 0 },
    attendanceStats: { totalSessions: 0, attended: 0, percentage: 0 },
    courseStats: { totalCourses: 0, activeCourses: 0 },
    messageStats: { unreadMessages: 0 },
    gradeStats: { averageGrade: 0, totalGraded: 0 }
  });
  const [rawData, setRawData] = useState({
    assignments: [],
    attendance: [],
    courses: [],
    messages: { unread: 0, total: 0 },
    grades: [],
    schedule: []
  });
  // Thêm state cho widget "Khóa học của tôi"
  const [myCourses, setMyCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== ROLE.STUDENT) {
      navigate("/");
      return;
    }
    loadDashboardData();
    loadMyCourses();
  }, [navigate]);

  const loadMyCourses = async () => {
    try {
      setCoursesLoading(true);
      const coursesData = await ClassroomService.getMyStudentCourses();
      // Lấy chỉ 3 khóa học đầu tiên để hiển thị trong widget
      setMyCourses((coursesData.data || []).slice(0, 3));
    } catch (error) {
      console.error('Error loading my courses:', error);
      // Fallback data for widget
      setMyCourses([
        {
          id: 1,
          name: 'Lập trình Java Nâng cao',
          teacherName: 'Nguyễn Văn A',
          progressPercentage: 75
        },
        {
          id: 2,
          name: 'Cấu trúc dữ liệu và giải thuật',
          teacherName: 'Trần Thị B',
          progressPercentage: 45
        }
      ]);
    } finally {
      setCoursesLoading(false);
    }
  };
  
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Debug: Run API diagnosis (uncomment to debug)
      // await DebugService.diagnoseStudentDashboardAPIs();
      
      // Use Promise.allSettled instead of Promise.all to handle individual endpoint failures
      const [classroomsRes, attendanceRes, assignmentsRes, messagesRes] = await Promise.allSettled([
        api.get('/classrooms/student/me'), // Student's enrolled classrooms
        api.get('/attendance/my-history?classroomId=1'), // Sửa endpoint từ /v1/attendance/my-history thành /attendance/my-history
        api.get('/assignments/student/me'), // Alternative endpoint for student assignments  
        api.get('/messages/dashboard/unread-count') // Fixed endpoint for unread messages
      ]);
      
      // Initialize with default empty data
      let assignments = [];
      let attendance = [];
      let courses = [];
      let unreadCount = 0;
      
      // Process results safely
      if (assignmentsRes.status === 'fulfilled') {
        const assignmentData = assignmentsRes.value.data;
        assignments = Array.isArray(assignmentData) ? assignmentData : (assignmentData?.data || []);
      } else {
        console.error('Error loading assignments:', assignmentsRes.reason);
        // Fallback mock data for assignments
        assignments = [
          {
            id: 1,
            title: 'Bài tập Toán học',
            subject: 'Toán học',
            dueDate: '2024-12-30',
            status: 'Chưa nộp',
            classroom: 'Lớp 12A1'
          },
          {
            id: 2,
            title: 'Bài tập Ngữ văn',
            subject: 'Ngữ văn', 
            dueDate: '2024-12-28',
            status: 'Đã nộp',
            classroom: 'Lớp 12A1'
          }
        ];
        console.log('Using fallback assignment data');
      }
      
      if (attendanceRes.status === 'fulfilled' && attendanceRes.value.data) {
        const attendanceData = attendanceRes.value.data;
        attendance = Array.isArray(attendanceData) ? attendanceData : (attendanceData.data || []);
      } else {
        console.error('Error loading attendance data:', attendanceRes.reason);
        // Fallback mock data for attendance
        attendance = [
          {
            id: 1,
            date: '2024-12-24',
            subject: 'Toán học',
            status: 'PRESENT',
            sessionName: 'Tiết 1-2'
          },
          {
            id: 2,
            date: '2024-12-23',
            subject: 'Ngữ văn',
            status: 'PRESENT', 
            sessionName: 'Tiết 3-4'
          }
        ];
        console.log('Using fallback attendance data');
        message.error('Không thể tải dữ liệu điểm danh.');
      }
      
      // Extract unique courses from assignments data
      if (Array.isArray(assignments)) {
        const uniqueCourseIds = [...new Set(assignments.map(a => a.classroomId || a.courseId).filter(Boolean))];
        courses = uniqueCourseIds.map(id => ({ id, status: 'ACTIVE' }));
      }
      
      // For now, set unread messages to 0 since the endpoint isn't working
      if (messagesRes.status === 'fulfilled' && messagesRes.value.data) {
        const messageData = messagesRes.value.data;
        // Handle different response formats from the endpoint
        unreadCount = messageData.data?.count || messageData.count || 0;
      } else {
        console.error('Error loading messages:', messagesRes.reason);
        unreadCount = 0;
      }
      
      // Calculate statistics based on available data
      const submittedCount = Array.isArray(assignments) ? assignments.filter(a => a.submissionStatus === 'SUBMITTED').length : 0;
      const attendedCount = Array.isArray(attendance) ? attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length : 0;
      const totalSessions = Array.isArray(attendance) ? attendance.length : 0;
      const attendancePercentage = totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 100) : 0;
      const activeCourses = Array.isArray(courses) ? courses.filter(c => c.status === 'ACTIVE').length : 0;
      
      // Update dashboard data
      setDashboardData({
        assignmentStats: {
          total: Array.isArray(assignments) ? assignments.length : 0,
          submitted: submittedCount,
          pending: (Array.isArray(assignments) ? assignments.length : 0) - submittedCount
        },
        attendanceStats: {
          totalSessions: totalSessions,
          attended: attendedCount,
          percentage: attendancePercentage
        },
        courseStats: {
          totalCourses: Array.isArray(courses) ? courses.length : 0,
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

      {/* Widget "Khóa học của tôi" theo tài liệu hướng dẫn */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <BookOutlined className="mr-2" />
                  Các khóa học của tôi
                </span>
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => navigate("/student/courses")}
                >
                  Xem tất cả
                </Button>
              </div>
            }
            className="h-full"
          >
            {coursesLoading ? (
              <div className="text-center py-8">
                <Spin size="large" />
              </div>
            ) : myCourses.length === 0 ? (
              <div className="text-center py-8">
                <Text type="secondary">Bạn chưa đăng ký khóa học nào</Text>
              </div>
            ) : (
              <div className="space-y-4">
                {myCourses.map((course) => (
                  <div 
                    key={course.id}
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/student/courses/${course.id}`)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <BookOutlined className="text-white text-lg" />
                    </div>
                    <div className="flex-1">
                      <Title level={5} className="mb-1" ellipsis={{ tooltip: course.name }}>
                        {course.name}
                      </Title>
                      <div className="flex items-center mb-2">
                        <UserOutlined className="mr-1 text-gray-400" />
                        <Text type="secondary" className="text-sm">
                          {course.teacherName}
                        </Text>
                      </div>
                      <Progress 
                        percent={course.progressPercentage || 0} 
                        size="small"
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span className="flex items-center">
                <CalendarOutlined className="mr-2" />
                Hoạt động gần đây
              </span>
            }
            className="h-full"
          >
            <div className="space-y-3">
              <div className="flex items-center p-2 border-l-4 border-blue-500 bg-blue-50">
                <FileTextOutlined className="mr-2 text-blue-500" />
                <Text className="text-sm">Bài tập Toán học - Hạn nộp: 30/12/2024</Text>
              </div>
              <div className="flex items-center p-2 border-l-4 border-green-500 bg-green-50">
                <CheckCircleOutlined className="mr-2 text-green-500" />
                <Text className="text-sm">Đã nộp bài tập Ngữ văn thành công</Text>
              </div>
              <div className="flex items-center p-2 border-l-4 border-orange-500 bg-orange-50">
                <VideoCameraOutlined className="mr-2 text-orange-500" />
                <Text className="text-sm">Buổi học trực tuyến Java - 9:00 AM hôm nay</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Navigation Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => handleCardClick("/student/courses")}
          >
            <div className="text-center">
              <BookOutlined className="text-4xl text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Khóa học của tôi</h2>
              <p className="text-gray-600">
                Xem danh sách các khóa học đã đăng ký và tiến độ học tập
              </p>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => handleCardClick("/student/materials")}
          >
            <div className="text-center">
              <FileTextOutlined className="text-4xl text-purple-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Tài liệu học tập</h2>
              <p className="text-gray-600">
                Xem và tải xuống tài liệu học tập từ các khóa học
              </p>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => handleCardClick("/student/attendance")}
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
            onClick={() => handleCardClick("/student/academic-performance")}
          >
            <div className="text-center">
              <AreaChartOutlined className="text-4xl text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Kết quả học tập</h2>
              <p className="text-gray-600">
                Xem kết quả học tập và tiến độ các khóa học
              </p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
