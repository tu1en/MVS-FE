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
  
  // State cho widget "Khóa học của tôi"
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
      console.log('Loading my courses...');
      
      const coursesData = await ClassroomService.getMyStudentCourses();
      console.log('Courses loaded:', coursesData);
      
      if (coursesData.data && Array.isArray(coursesData.data)) {
        // Format courses for display and take first 3
        const formattedCourses = coursesData.data
          .slice(0, 3)
          .map(course => ClassroomService.formatClassroomForDisplay(course));
        
        setMyCourses(formattedCourses);
        console.log('Formatted courses set:', formattedCourses);
      } else {
        console.warn('No courses data or invalid format:', coursesData);
        setMyCourses([]);
      }
    } catch (error) {
      console.error('Error loading my courses:', error);
      message.error('Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
      setMyCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };
  
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard data...');
      
      // Use Promise.allSettled to handle individual endpoint failures gracefully
      const [classroomsRes, attendanceRes, assignmentsRes, messagesRes] = await Promise.allSettled([
        ClassroomService.getMyStudentCourses(), // Load student's classrooms
        api.get('/attendance/my-history'), // Load attendance data
        api.get('/assignments/student/me'), // Load assignments
        api.get('/messages/dashboard/unread-count') // Load unread messages
      ]);
      
      // Initialize with default empty data
      let assignments = [];
      let attendance = [];
      let courses = [];
      let unreadCount = 0;
      
      // Process classrooms result
      if (classroomsRes.status === 'fulfilled' && classroomsRes.value.data) {
        courses = Array.isArray(classroomsRes.value.data) ? classroomsRes.value.data : [];
        console.log('Loaded courses for dashboard:', courses.length);
      } else {
        console.error('Error loading classrooms:', classroomsRes.reason);
        courses = [];
      }
      
      // Process assignments result
      if (assignmentsRes.status === 'fulfilled' && assignmentsRes.value.data) {
        const assignmentData = assignmentsRes.value.data;
        assignments = Array.isArray(assignmentData) ? assignmentData : 
                    (assignmentData?.data || []);
        console.log('Loaded assignments:', assignments.length);
      } else {
        console.error('Error loading assignments:', assignmentsRes.reason);
        assignments = [];
      }
      
      // Process attendance result
      if (attendanceRes.status === 'fulfilled' && attendanceRes.value.data) {
        const attendanceData = attendanceRes.value.data;
        attendance = Array.isArray(attendanceData) ? attendanceData : 
                   (attendanceData?.data || []);
        console.log('Loaded attendance records:', attendance.length);
      } else {
        console.error('Error loading attendance data:', attendanceRes.reason);
        attendance = [];
      }
      
      // Process messages result
      if (messagesRes.status === 'fulfilled' && messagesRes.value.data) {
        const messageData = messagesRes.value.data;
        unreadCount = messageData.data?.count || messageData.count || 0;
        console.log('Loaded unread messages count:', unreadCount);
      } else {
        console.error('Error loading messages:', messagesRes.reason);
        unreadCount = 0;
      }
      
      // Calculate statistics based on real data
      const submittedCount = assignments.filter(a => 
        a.submissionStatus === 'SUBMITTED' || 
        a.status === 'SUBMITTED' || 
        a.submitted === true
      ).length;
      
      const gradedCount = assignments.filter(a => 
        a.grade !== null && a.grade !== undefined ||
        a.graded === true ||
        a.status === 'GRADED'
      ).length;
      
      const attendedCount = attendance.filter(a => 
        a.status === 'PRESENT' || 
        a.status === 'LATE' ||
        a.attended === true
      ).length;
      
      const totalSessions = attendance.length;
      const attendancePercentage = totalSessions > 0 ? 
        Math.round((attendedCount / totalSessions) * 100) : 0;
      
      const activeCourses = courses.filter(c => 
        c.status === 'ACTIVE' || 
        !c.status // Assume active if no status field
      ).length;
      
      // Calculate average grade if available
      const gradesWithValues = assignments
        .filter(a => a.grade !== null && a.grade !== undefined && !isNaN(a.grade))
        .map(a => parseFloat(a.grade));
      
      const averageGrade = gradesWithValues.length > 0 ? 
        Math.round(gradesWithValues.reduce((sum, grade) => sum + grade, 0) / gradesWithValues.length * 10) / 10 : 0;
      
      // Update dashboard data with real statistics
      setDashboardData({
        assignmentStats: {
          total: assignments.length,
          submitted: submittedCount,
          pending: assignments.length - submittedCount,
          graded: gradedCount
        },
        attendanceStats: {
          totalSessions: totalSessions,
          attended: attendedCount,
          percentage: attendancePercentage
        },
        courseStats: {
          totalCourses: courses.length,
          activeCourses: activeCourses
        },
        messageStats: {
          unreadMessages: unreadCount
        },
        gradeStats: {
          averageGrade: averageGrade,
          totalGraded: gradedCount
        }
      });
      
      console.log('Dashboard data updated:', {
        courses: courses.length,
        assignments: assignments.length,
        attendance: attendance.length,
        unreadMessages: unreadCount
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

  const handleCourseClick = (courseId) => {
    navigate(`/student/courses/${courseId}`);
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
              valueStyle={{ 
                color: dashboardData.attendanceStats.percentage >= 80 ? '#52c41a' : '#ff4d4f' 
              }}
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

      {/* Widget "Khóa học của tôi" và "Hoạt động gần đây" */}
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
                  Xem tất cả ({dashboardData.courseStats.totalCourses})
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
                <BookOutlined className="text-4xl text-gray-300 mb-4" />
                <Text type="secondary">Bạn chưa đăng ký khóa học nào</Text>
                <div className="mt-4">
                  <Button type="primary" onClick={() => navigate("/student/courses")}>
                    Khám phá khóa học
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {myCourses.map((course) => (
                  <div 
                    key={course.id}
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleCourseClick(course.id)}
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
                Thống kê học tập
              </span>
            }
            className="h-full"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <BookOutlined className="mr-2 text-blue-500" />
                  <Text>Khóa học đang theo học</Text>
                </div>
                <Text strong className="text-blue-600">
                  {dashboardData.courseStats.activeCourses}
                </Text>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <FileTextOutlined className="mr-2 text-green-500" />
                  <Text>Bài tập chưa nộp</Text>
                </div>
                <Text strong className="text-green-600">
                  {dashboardData.assignmentStats.pending}
                </Text>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <AreaChartOutlined className="mr-2 text-orange-500" />
                  <Text>Điểm trung bình</Text>
                </div>
                <Text strong className="text-orange-600">
                  {dashboardData.gradeStats.averageGrade > 0 ? 
                    `${dashboardData.gradeStats.averageGrade}/10` : 'Chưa có'
                  }
                </Text>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <CalendarOutlined className="mr-2 text-purple-500" />
                  <Text>Buổi học đã tham gia</Text>
                </div>
                <Text strong className="text-purple-600">
                  {dashboardData.attendanceStats.attended}/{dashboardData.attendanceStats.totalSessions}
                </Text>
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
              <div className="mt-4 p-2 bg-blue-50 rounded-lg">
                <Text className="text-blue-600 font-medium">
                  {dashboardData.courseStats.totalCourses} khóa học
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => handleCardClick("/student/assignments")}
          >
            <div className="text-center">
              <FileTextOutlined className="text-4xl text-purple-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Bài tập</h2>
              <p className="text-gray-600">
                Xem và nộp bài tập từ các khóa học
              </p>
              <div className="mt-4 p-2 bg-purple-50 rounded-lg">
                <Text className="text-purple-600 font-medium">
                  {dashboardData.assignmentStats.pending} bài chưa nộp
                </Text>
              </div>
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
              <div className="mt-4 p-2 bg-green-50 rounded-lg">
                <Text className="text-green-600 font-medium">
                  {dashboardData.attendanceStats.percentage}% chuyên cần
                </Text>
              </div>
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
              <div className="mt-4 p-2 bg-red-50 rounded-lg">
                <Text className="text-red-600 font-medium">
                  {dashboardData.gradeStats.averageGrade > 0 ? 
                    `${dashboardData.gradeStats.averageGrade}/10 điểm TB` : 
                    'Chưa có điểm'
                  }
                </Text>
              </div>
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
              <MessageOutlined className="text-4xl text-orange-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Tin nhắn</h2>
              <p className="text-gray-600">
                Xem tin nhắn từ giảng viên và thông báo hệ thống
              </p>
              <div className="mt-4 p-2 bg-orange-50 rounded-lg">
                <Text className="text-orange-600 font-medium">
                  {dashboardData.messageStats.unreadMessages} tin chưa đọc
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => handleCardClick("/student/schedule")}
          >
            <div className="text-center">
              <VideoCameraOutlined className="text-4xl text-cyan-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Lịch học</h2>
              <p className="text-gray-600">
                Xem lịch học và tham gia các buổi học trực tuyến
              </p>
              <div className="mt-4 p-2 bg-cyan-50 rounded-lg">
                <Text className="text-cyan-600 font-medium">
                  Lịch học hôm nay
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}