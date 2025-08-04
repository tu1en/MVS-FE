import { Alert, Button, Card, Col, Row, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ClassroomService from '../../services/classroomService';

const { Title, Text } = Typography;

const StudentAttendanceHub = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Sử dụng API endpoint mới theo tài liệu hướng dẫn
        const coursesData = await ClassroomService.getMyStudentCourses();
        setCourses(coursesData.data);
        setError(null);
      } catch (err) {
        setError('Không thể tải danh sách khóa học để xem điểm danh. Vui lòng thử lại sau.');
        console.error('Error fetching courses for attendance hub:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

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
          description="Bạn cần đăng ký một khóa học trước khi có thể xem điểm danh."
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="mb-6">
        Trung Tâm Điểm Danh
      </Title>
      <Text className="mb-6 block">Chọn một khóa học để xem lịch sử chuyên cần của bạn.</Text>
      
      <Row gutter={[16, 16]}>
        {courses.map((course) => (
          <Col xs={24} sm={12} md={8} key={course.id}>
            <Card 
              hoverable
              className="h-full flex flex-col"
            >
              <div className="flex-grow">
                <Title level={4}>
                  {course.subject || course.description || course.name || `Lớp ${course.id}`}
                </Title>
                
                {course.subject && course.name && (
                  <Text type="secondary" className="mb-2 block">
                    Mã lớp: {course.name}
                  </Text>
                )}
                
                <Text type="secondary" className="mb-4 block">
                  Giáo viên: {course.teacherName || 'N/A'}
                </Text>
              </div>
              
              <div className="mt-auto">
                <Button 
                  type="primary" 
                  block
                  onClick={() => navigate(`/student/courses/${course.id}/my-attendance`)}
                >
                  Xem Điểm Danh
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default StudentAttendanceHub; 