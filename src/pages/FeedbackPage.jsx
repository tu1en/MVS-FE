import {
    CheckCircleOutlined,
    CommentOutlined,
    ExclamationCircleOutlined,
    StarFilled
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Form,
    Input,
    List,
    message,
    Modal,
    Progress,
    Radio,
    Rate,
    Row,
    Select,
    Space,
    Spin,
    Statistic,
    Tabs,
    Tag,
    Typography
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * FeedbackPage component for course feedback
 * @returns {JSX.Element} FeedbackPage component
 */
function FeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  // Get user info from localStorage
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Debug logging for role detection
  console.log('FeedbackPage - Role Debug:', { 
    userId, 
    userRole, 
    roleFromStorage: localStorage.getItem('role'),
    token: localStorage.getItem('token') 
  });

  // Mock data
  const mockCourses = [
    { id: 1, name: 'Nhập môn lập trình Java', code: 'JAVA101', teacherId: 201, teacherName: 'Giảng viên Nguyễn Thị D' },
    { id: 2, name: 'Cơ sở dữ liệu', code: 'DB101', teacherId: 202, teacherName: 'Giảng viên Trần Văn E' },
    { id: 3, name: 'Lập trình Web', code: 'WEB101', teacherId: 201, teacherName: 'Giảng viên Nguyễn Thị D' },
  ];

  const mockFeedbacks = [
    {
      id: 1,
      courseId: 1,
      rating: 4,
      contentQuality: 'Rất tốt',
      teachingSpeed: 'Tốt',
      materialQuality: 'Tốt',
      comment: 'Khóa học rất hữu ích, giảng viên giảng dạy dễ hiểu. Tuy nhiên cần thêm nhiều bài tập thực hành hơn.',
      createdAt: moment().subtract(5, 'days').toISOString(),
      anonymous: true
    },
    {
      id: 2,
      courseId: 1,
      rating: 5,
      contentQuality: 'Rất tốt',
      teachingSpeed: 'Rất tốt',
      materialQuality: 'Rất tốt',
      comment: 'Tuyệt vời! Tôi đã học được rất nhiều từ khóa học này. Tài liệu rất chi tiết và dễ hiểu.',
      createdAt: moment().subtract(1, 'week').toISOString(),
      anonymous: true
    },
    {
      id: 3,
      courseId: 1,
      rating: 3,
      contentQuality: 'Tốt',
      teachingSpeed: 'Bình thường',
      materialQuality: 'Tốt',
      comment: 'Khóa học có nội dung tốt nhưng đôi khi giảng hơi nhanh, khó theo kịp.',
      createdAt: moment().subtract(2, 'weeks').toISOString(),
      anonymous: false,
      studentName: 'Nguyễn Văn A'
    },
    {
      id: 4,
      courseId: 2,
      rating: 4,
      contentQuality: 'Tốt',
      teachingSpeed: 'Tốt',
      materialQuality: 'Rất tốt',
      comment: 'Khóa học cung cấp kiến thức đầy đủ về SQL và thiết kế cơ sở dữ liệu.',
      createdAt: moment().subtract(3, 'days').toISOString(),
      anonymous: true
    }
  ];

  const mockStudentCourses = [
    { 
      id: 1, 
      name: 'Nhập môn lập trình Java', 
      code: 'JAVA101', 
      teacherId: 201, 
      teacherName: 'Giảng viên Nguyễn Thị D',
      completed: 0.8, // 80% completed
      canFeedback: true,
      hasSubmittedFeedback: false
    },
    { 
      id: 2, 
      name: 'Cơ sở dữ liệu', 
      code: 'DB101', 
      teacherId: 202, 
      teacherName: 'Giảng viên Trần Văn E',
      completed: 1.0, // 100% completed
      canFeedback: true,
      hasSubmittedFeedback: true
    }
  ];

  useEffect(() => {
    // Load mock data
    setTimeout(() => {
      if (userRole === '1') { // Student
        setCourses(mockStudentCourses);
      } else { // Teacher or Manager
        setCourses(mockCourses);
        setFeedbacks(mockFeedbacks);
        if (mockCourses.length > 0) {
          setSelectedCourse(mockCourses[0].id);
        }
      }
      setLoading(false);
    }, 800);
  }, [userId, token, userRole]);

  const handleSubmitFeedback = (values) => {
    // In a real app, would save to API
    // For now, just show success message
    message.success('Cảm ơn bạn đã gửi phản hồi về khóa học!');
    
    // Update course to indicate feedback has been submitted
    const updatedCourses = courses.map(course => {
      if (course.id === values.courseId) {
        return {
          ...course,
          hasSubmittedFeedback: true
        };
      }
      return course;
    });
    setCourses(updatedCourses);
    
    // Close modal and reset form
    setFeedbackModalVisible(false);
    form.resetFields();
  };

  // Calculate feedback statistics for a course
  const calculateFeedbackStats = (courseId) => {
    const courseFeedbacks = feedbacks.filter(feedback => feedback.courseId === courseId);
    
    if (courseFeedbacks.length === 0) {
      return {
        averageRating: 0,
        totalFeedbacks: 0,
        contentQualityStats: { 'Rất tốt': 0, 'Tốt': 0, 'Bình thường': 0, 'Kém': 0, 'Rất kém': 0 },
        teachingSpeedStats: { 'Rất tốt': 0, 'Tốt': 0, 'Bình thường': 0, 'Kém': 0, 'Rất kém': 0 },
        materialQualityStats: { 'Rất tốt': 0, 'Tốt': 0, 'Bình thường': 0, 'Kém': 0, 'Rất kém': 0 }
      };
    }
    
    const totalRating = courseFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = totalRating / courseFeedbacks.length;
    
    // Count occurrences of each rating option
    const contentQualityStats = {
      'Rất tốt': 0, 'Tốt': 0, 'Bình thường': 0, 'Kém': 0, 'Rất kém': 0
    };
    
    const teachingSpeedStats = {
      'Rất tốt': 0, 'Tốt': 0, 'Bình thường': 0, 'Kém': 0, 'Rất kém': 0
    };
    
    const materialQualityStats = {
      'Rất tốt': 0, 'Tốt': 0, 'Bình thường': 0, 'Kém': 0, 'Rất kém': 0
    };
    
    courseFeedbacks.forEach(feedback => {
      contentQualityStats[feedback.contentQuality]++;
      teachingSpeedStats[feedback.teachingSpeed]++;
      materialQualityStats[feedback.materialQuality]++;
    });
    
    return {
      averageRating,
      totalFeedbacks: courseFeedbacks.length,
      contentQualityStats,
      teachingSpeedStats,
      materialQualityStats
    };
  };

  // RENDER FUNCTIONS BASED ON USER ROLE

  // Student view components
  const renderStudentDashboard = () => {
    return (
      <div className="student-feedback-dashboard">
        <Title level={4}>Đánh giá khóa học</Title>
        
        <Row gutter={[16, 16]}>
          {courses.map(course => (
            <Col xs={24} sm={12} md={8} key={course.id}>
              <Card 
                title={course.name}
                extra={<Tag color="blue">{course.code}</Tag>}
                actions={[
                  course.hasSubmittedFeedback ? (
                    <Button type="text" disabled icon={<CheckCircleOutlined />}>
                      Đã gửi đánh giá
                    </Button>
                  ) : course.canFeedback ? (
                    <Button 
                      type="primary" 
                      icon={<CommentOutlined />}
                      onClick={() => {
                        form.setFieldsValue({ courseId: course.id });
                        setFeedbackModalVisible(true);
                      }}
                    >
                      Đánh giá khóa học
                    </Button>
                  ) : (
                    <Button type="text" disabled icon={<ExclamationCircleOutlined />}>
                      Chưa đủ điều kiện đánh giá
                    </Button>
                  )
                ]}
              >
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Giảng viên: </Text>
                  <Text>{course.teacherName}</Text>
                </div>
                
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Tiến độ hoàn thành: </Text>
                </div>
                <Progress 
                  percent={Math.round(course.completed * 100)} 
                  status={course.completed >= 1 ? "success" : "active"}
                />
                
                {course.completed < 0.8 && (
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">
                      Bạn cần hoàn thành ít nhất 80% khóa học để gửi đánh giá.
                    </Text>
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  // Teacher view components
  const renderTeacherDashboard = () => {
    return (
      <div className="teacher-feedback-dashboard">
        <div className="header-actions" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Phản hồi từ học viên</Title>
          <Select
            placeholder="Chọn khóa học"
            value={selectedCourse}
            onChange={setSelectedCourse}
            style={{ width: 240 }}
          >
            {courses.map(course => (
              <Option key={course.id} value={course.id}>{course.name}</Option>
            ))}
          </Select>
        </div>
        
        {selectedCourse && renderCourseStatistics(selectedCourse)}
        {selectedCourse && renderCourseFeedbacks(selectedCourse)}
      </div>
    );
  };

  const renderCourseStatistics = (courseId) => {
    const stats = calculateFeedbackStats(courseId);
    const course = courses.find(c => c.id === courseId);
    
    if (!course) return null;
    
    return (
      <div className="course-statistics" style={{ marginBottom: 24 }}>
        <Card title={`Thống kê đánh giá - ${course.name}`}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <Statistic
                title="Đánh giá trung bình"
                value={stats.averageRating.toFixed(1)}
                suffix={<span style={{ fontSize: '0.5em' }}>/5</span>}
                prefix={<StarFilled style={{ color: '#fadb14' }} />}
              />
              <Rate disabled defaultValue={Math.round(stats.averageRating)} style={{ marginTop: 8 }} />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Tổng số đánh giá"
                value={stats.totalFeedbacks}
                prefix={<CommentOutlined />}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Tỷ lệ hài lòng"
                value={stats.totalFeedbacks > 0 
                  ? Math.round((stats.contentQualityStats['Rất tốt'] + stats.contentQualityStats['Tốt']) / stats.totalFeedbacks * 100) 
                  : 0
                }
                suffix="%"
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              />
            </Col>
          </Row>
          
          <Divider />
          
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Text strong>Chất lượng nội dung</Text>
              </div>
              {/* In a real implementation, render chart here */}
              <div style={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Text type="secondary">Biểu đồ thống kê chất lượng nội dung</Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Text strong>Tốc độ giảng dạy</Text>
              </div>
              {/* In a real implementation, render chart here */}
              <div style={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Text type="secondary">Biểu đồ thống kê tốc độ giảng dạy</Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Text strong>Chất lượng tài liệu</Text>
              </div>
              {/* In a real implementation, render chart here */}
              <div style={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Text type="secondary">Biểu đồ thống kê chất lượng tài liệu</Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    );
  };

  const renderCourseFeedbacks = (courseId) => {
    const courseFeedbacks = feedbacks.filter(feedback => feedback.courseId === courseId);
    
    if (courseFeedbacks.length === 0) {
      return (
        <Card>
          <Empty description="Chưa có phản hồi nào cho khóa học này" />
        </Card>
      );
    }
    
    return (
      <Card title="Danh sách phản hồi">
        <List
          itemLayout="vertical"
          dataSource={courseFeedbacks}
          renderItem={feedback => (
            <List.Item
              key={feedback.id}
              extra={
                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: 8 }}>
                    <Rate disabled defaultValue={feedback.rating} />
                  </div>
                  <Text type="secondary">
                    {moment(feedback.createdAt).format('DD/MM/YYYY')}
                  </Text>
                </div>
              }
            >
              <List.Item.Meta
                title={
                  <div>
                    <Text strong>
                      {feedback.anonymous ? 'Học viên ẩn danh' : feedback.studentName}
                    </Text>
                  </div>
                }
                description={
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Tag color="blue">Nội dung: {feedback.contentQuality}</Tag>
                      <Tag color="green">Tốc độ: {feedback.teachingSpeed}</Tag>
                      <Tag color="purple">Tài liệu: {feedback.materialQuality}</Tag>
                    </div>
                  </Space>
                }
              />
              <div style={{ marginTop: 16 }}>
                <Paragraph>{feedback.comment}</Paragraph>
              </div>
            </List.Item>
          )}
        />
      </Card>
    );
  };

  // Shared modals and forms
  const renderFeedbackModal = () => {
    const courseId = form.getFieldValue('courseId');
    const course = courses.find(c => c.id === courseId);
    
    return (
      <Modal
        title={`Đánh giá khóa học: ${course ? course.name : ''}`}
        open={feedbackModalVisible}
        onCancel={() => setFeedbackModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitFeedback}
        >
          <Form.Item name="courseId" hidden>
            <Input />
          </Form.Item>
          
          <Form.Item
            name="rating"
            label="Đánh giá tổng thể"
            rules={[{ required: true, message: 'Vui lòng đánh giá khóa học' }]}
          >
            <Rate />
          </Form.Item>
          
          <Form.Item
            name="contentQuality"
            label="Chất lượng nội dung"
            rules={[{ required: true, message: 'Vui lòng đánh giá chất lượng nội dung' }]}
          >
            <Radio.Group>
              <Radio value="Rất tốt">Rất tốt</Radio>
              <Radio value="Tốt">Tốt</Radio>
              <Radio value="Bình thường">Bình thường</Radio>
              <Radio value="Kém">Kém</Radio>
              <Radio value="Rất kém">Rất kém</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="teachingSpeed"
            label="Tốc độ giảng dạy"
            rules={[{ required: true, message: 'Vui lòng đánh giá tốc độ giảng dạy' }]}
          >
            <Radio.Group>
              <Radio value="Rất tốt">Rất tốt</Radio>
              <Radio value="Tốt">Tốt</Radio>
              <Radio value="Bình thường">Bình thường</Radio>
              <Radio value="Kém">Kém</Radio>
              <Radio value="Rất kém">Rất kém</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="materialQuality"
            label="Chất lượng tài liệu"
            rules={[{ required: true, message: 'Vui lòng đánh giá chất lượng tài liệu' }]}
          >
            <Radio.Group>
              <Radio value="Rất tốt">Rất tốt</Radio>
              <Radio value="Tốt">Tốt</Radio>
              <Radio value="Bình thường">Bình thường</Radio>
              <Radio value="Kém">Kém</Radio>
              <Radio value="Rất kém">Rất kém</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="comment"
            label="Nhận xét và góp ý"
            rules={[{ required: true, message: 'Vui lòng nhập nhận xét của bạn' }]}
          >
            <TextArea
              rows={4}
              placeholder="Hãy chia sẻ nhận xét của bạn về khóa học này và đề xuất cải thiện nếu có"
            />
          </Form.Item>
          
          <Form.Item
            name="anonymous"
            valuePropName="checked"
            initialValue={true}
          >
            <Radio>Gửi đánh giá ẩn danh</Radio>
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button style={{ marginRight: 8 }} onClick={() => setFeedbackModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Gửi đánh giá
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  // Main content renderer with comprehensive role validation
  const renderMainContent = () => {
    // Don't render if no valid role or user ID
    if (!userId || !userRole || !token) {
      console.warn('FeedbackPage: Missing required authentication data:', { userId, userRole, token: !!token });
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
    
    // Parent view for role '7' or 'PARENT'
    if (userRole === '7' || userRole === 'PARENT') {
      return renderStudentDashboard(); // Parents can see student view to monitor their children
    }
    
    // If role is not recognized, show error
    console.error('FeedbackPage: Unrecognized role:', userRole);
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
    <div className="feedback-page">
      {/* Main content based on user role */}
      {renderMainContent()}
      
      {/* Shared modals and forms */}
      {renderFeedbackModal()}
    </div>
  );
}

export default FeedbackPage; 