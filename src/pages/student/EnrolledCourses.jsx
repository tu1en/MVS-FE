import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Row, Col, Alert, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`/api/v1/student/courses?studentId=${currentUser.id}`);
      setCourses(response.data);
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
                {course.title}
              </Title>
              
              <Text type="secondary" className="mb-4 block min-h-[60px]">
                {course.description}
              </Text>
              
              <div className="mt-auto">
                <Text type="secondary" className="block mb-2">
                  Giáo viên: {course.teacherName}
                </Text>
                
                <Text type="secondary" className="block mb-4">
                  Ngày bắt đầu: {new Date(course.startDate).toLocaleDateString('vi-VN')}
                </Text>
                
                <Button 
                  type="primary" 
                  block
                  onClick={() => navigate(`/student/courses/${course.id}`)}
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
