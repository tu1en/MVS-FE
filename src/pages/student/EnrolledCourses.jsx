import { BookOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Progress, Row, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ClassroomService from '../../services/classroomService';

const { Title, Text } = Typography;

const EnrolledCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Sử dụng API endpoint mới theo tài liệu hướng dẫn
      const coursesData = await ClassroomService.getMyStudentCourses();
      setCourses(coursesData.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert message={error} type="error" showIcon />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert
          message="Chưa có khóa học"
          description="Bạn chưa đăng ký khóa học nào. Hãy khám phá các khóa học có sẵn!"
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="mb-6">
        Khóa Học Của Tôi
      </Title>
      
      <Row gutter={[16, 16]}>
        {courses.map((course) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={course.id}>
            <Card 
              hoverable
              className="h-full"
              cover={
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                  <BookOutlined className="text-4xl text-white" />
                </div>
              }
            >
              <div className="flex flex-col h-full">
                <Title level={4} className="mb-2" ellipsis={{ tooltip: course.classroomName }}>
                  {course.classroomName}
                </Title>
                
                <Text type="secondary" className="mb-3 block flex-1" ellipsis={{ rows: 2 }}>
                  {course.description}
                </Text>
                
                {/* Thanh tiến độ theo yêu cầu tài liệu */}
                <div className="mb-3">
                  <Text type="secondary" className="text-sm mb-1 block">
                    Tiến độ học tập:
                  </Text>
                  <Progress 
                    percent={course.progressPercentage || 0} 
                    size="small" 
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </div>
                
                <div className="mt-auto">
                  <div className="flex items-center mb-2">
                    <UserOutlined className="mr-1" />
                    <Text type="secondary" className="text-sm">
                      {course.teacherName}
                    </Text>
                  </div>
                  
                  <Text type="secondary" className="block mb-3 text-sm">
                    Ngày bắt đầu: {course.startDate ? new Date(course.startDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </Text>
                  
                  <Button 
                    type="primary" 
                    block
                    onClick={() => navigate(`/student/courses/${course.id}`)}
                  >
                    Xem Chi Tiết
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default EnrolledCourses;
