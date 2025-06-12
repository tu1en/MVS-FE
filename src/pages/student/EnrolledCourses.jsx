import { Alert, Button, Card, Col, Row, Spin, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseService from '../../services/courseService';

const { Title, Text } = Typography;

const EnrolledCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const userId = currentUser?.id || localStorage.getItem('userId');
      
      if (!userId) {
        setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }
      
      // Use the CourseService to get courses
      const coursesData = await CourseService.getCurrentStudentCourses();
      setCourses(coursesData || []);
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
          <Col xs={24} sm={12} key={course.id}>
            <Card 
              hoverable
              className="h-full"
            >
              <Title level={4}>
                {course.title || course.name}
              </Title>
              
              <Text type="secondary" className="mb-4 block min-h-[60px]">
                {course.description}
              </Text>
              
              <div className="mt-auto">
                <Text type="secondary" className="block mb-2">
                  Giáo viên: {course.teacherName || course.instructorName}
                </Text>
                
                <Text type="secondary" className="block mb-4">
                  Ngày bắt đầu: {course.startDate ? new Date(course.startDate).toLocaleDateString('vi-VN') : 'N/A'}
                </Text>
                
                <Button 
                  type="primary" 
                  block
                  onClick={() => navigate(`/student/course-details?id=${course.id}`)}
                >
                  Xem Chi Tiết
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default EnrolledCourses;
