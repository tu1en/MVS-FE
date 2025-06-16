import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Alert, Button, Tag, Avatar, Typography, Statistic } from 'antd';
import { 
  UserOutlined, 
  BookOutlined, 
  CalendarOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

const TeacherCourses = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTeacherCourses();
  }, []);

  const loadTeacherCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading teacher courses...');
      
      // Tạo axios instance với auth header
      const token = localStorage.getItem('token');
      const axiosConfig = {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.get('http://localhost:8088/api/classrooms/current-teacher', axiosConfig);
      console.log('Teacher courses response:', response.data);
      
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error loading teacher courses:', error);
      setError('Không thể tải danh sách khóa học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'Công nghệ phần mềm': 'blue',
      'Toán học': 'green',
      'Tiếng Anh': 'orange',
      'Khoa học máy tính': 'purple',
      'default': 'default'
    };
    return colors[subject] || colors.default;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" tip="Đang tải danh sách khóa học..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi tải dữ liệu"
        description={error}
        type="error"
        showIcon
        action={
          <Button onClick={loadTeacherCourses} type="primary" size="small">
            Thử lại
          </Button>
        }
      />
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>
          <BookOutlined className="mr-2" />
          Quản lý khóa học
        </Title>
        <Text type="secondary">
          Danh sách các khóa học bạn đang giảng dạy
        </Text>
      </div>

      {courses.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <BookOutlined style={{ fontSize: '64px', color: '#ccc' }} />
            <Title level={4} type="secondary">Chưa có khóa học nào</Title>
            <Text type="secondary">
              Bạn chưa được phân công giảng dạy khóa học nào.
            </Text>
          </div>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {courses.map((course) => (
            <Col xs={24} md={12} lg={8} key={course.id}>
              <Card
                hoverable
                className="h-full"
                actions={[
                  <Button type="text" icon={<EyeOutlined />}>
                    Xem chi tiết
                  </Button>,
                  <Button type="text" icon={<EditOutlined />}>
                    Chỉnh sửa
                  </Button>,
                  <Button type="text" icon={<FileTextOutlined />}>
                    Bài tập
                  </Button>
                ]}
              >
                <Card.Meta
                  avatar={
                    <Avatar 
                      size={48}
                      style={{ 
                        backgroundColor: getSubjectColor(course.subject) === 'blue' ? '#1890ff' : 
                                        getSubjectColor(course.subject) === 'green' ? '#52c41a' :
                                        getSubjectColor(course.subject) === 'orange' ? '#fa8c16' :
                                        getSubjectColor(course.subject) === 'purple' ? '#722ed1' : '#d9d9d9'
                      }}
                    >
                      <BookOutlined />
                    </Avatar>
                  }
                  title={
                    <div>
                      <Title level={4} className="mb-1">{course.name}</Title>
                      <Tag color={getSubjectColor(course.subject)}>
                        {course.subject}
                      </Tag>
                    </div>
                  }
                  description={
                    <div className="space-y-2">
                      <Paragraph ellipsis={{ rows: 2, tooltip: course.description }}>
                        {course.description}
                      </Paragraph>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <CalendarOutlined className="mr-1" />
                        <span>{course.section}</span>
                      </div>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic
                            title="Học viên"
                            value={course.enrolledStudents?.length || 0}
                            prefix={<UsergroupAddOutlined />}
                            valueStyle={{ fontSize: '16px' }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Bài tập"
                            value={course.assignments?.length || 0}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ fontSize: '16px' }}
                          />
                        </Col>
                      </Row>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {courses.length > 0 && (
        <div className="mt-6 text-center">
          <Title level={4}>Tổng quan</Title>
          <Row gutter={16} justify="center">
            <Col>
              <Statistic
                title="Tổng số khóa học"
                value={courses.length}
                prefix={<BookOutlined />}
              />
            </Col>
            <Col>
              <Statistic
                title="Tổng số học viên"
                value={courses.reduce((total, course) => total + (course.enrolledStudents?.length || 0), 0)}
                prefix={<UserOutlined />}
              />
            </Col>
            <Col>
              <Statistic
                title="Tổng số bài tập"
                value={courses.reduce((total, course) => total + (course.assignments?.length || 0), 0)}
                prefix={<FileTextOutlined />}
              />
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default TeacherCourses;
