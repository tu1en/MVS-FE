import { BookOutlined, ClockCircleOutlined, DownloadOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Button, Card, Divider, List, message, Space, Spin, Tag, Typography } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

/**
 * LecturesPage component for viewing course lectures and materials
 * @returns {JSX.Element} LecturesPage component
 */
function LecturesPage() {
  const [lectures, setLectures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get user info from localStorage
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    if (userId && token) {
      fetchCourses();
    }
  }, [userId, token]);

  const fetchCourses = async () => {
    try {
      let response;
      if (userRole === '1') { // Student
        // Get student's enrolled classrooms
        response = await axios.get(`/api/classrooms/student/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else { // Teacher
        response = await axios.get(`/api/classrooms/teacher/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      setCourses(response.data);
      if (response.data.length > 0) {
        setSelectedCourse(response.data[0].id);
        fetchLectures(response.data[0].id);
      }
    } catch (error) {
      message.error('Không thể tải danh sách khóa học');
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLectures = async (courseId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/courses/${courseId}/lectures`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setLectures(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách bài giảng');
      console.error('Error fetching lectures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (courseId) => {
    setSelectedCourse(courseId);
    fetchLectures(courseId);
  };

  const handleDownloadMaterial = async (materialUrl, materialName) => {
    try {
      const response = await axios.get(materialUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', materialName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Không thể tải xuống tài liệu');
      console.error('Error downloading material:', error);
    }
  };

  const renderMaterials = (materials) => {
    if (!materials || materials.length === 0) {
      return <Text type="secondary">Không có tài liệu</Text>;
    }

    return (
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {materials.map((material, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px',
            background: '#f5f5f5',
            borderRadius: '4px'
          }}>
            <Space>
              <BookOutlined />
              <Text>{material.name}</Text>
              <Tag color="blue">{material.type}</Tag>
            </Space>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadMaterial(material.downloadUrl, material.name)}
            >
              Tải xuống
            </Button>
          </div>
        ))}
      </Space>
    );
  };

  if (loading && courses.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải khóa học...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2}>Bài giảng và tài liệu học tập</Title>
          <Text type="secondary">
            Xem video bài giảng và tải xuống tài liệu học tập
          </Text>
        </div>

        {/* Course Selection */}
        <Card title="Chọn khóa học">
          <Space wrap>
            {courses.map(course => (
              <Button
                key={course.id}
                type={selectedCourse === course.id ? 'primary' : 'default'}
                onClick={() => handleCourseChange(course.id)}
              >
                {course.name}
              </Button>
            ))}
          </Space>
        </Card>

        {/* Lectures List */}
        <Card 
          title={`Bài giảng (${lectures.length})`}
          extra={
            userRole !== '1' && (
              <Button 
                type="primary"
                onClick={() => navigate(`/teacher/courses/${selectedCourse}/lectures/create`)}
              >
                Tạo bài giảng mới
              </Button>
            )
          }
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin />
              <div style={{ marginTop: 8 }}>Đang tải bài giảng...</div>
            </div>
          ) : (
            <List
              dataSource={lectures}
              renderItem={(lecture) => (
                <List.Item>
                  <Card 
                    style={{ width: '100%' }}
                    actions={[
                      <Button 
                        type="primary" 
                        icon={<PlayCircleOutlined />}
                        onClick={() => navigate(`/lectures/${lecture.id}/watch`)}
                      >
                        Xem bài giảng
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Space>
                          <PlayCircleOutlined />
                          {lecture.title}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          <Paragraph ellipsis={{ rows: 2, expandable: true }}>
                            {lecture.content || lecture.description}
                          </Paragraph>
                          
                          {lecture.duration && (
                            <Space>
                              <ClockCircleOutlined />
                              <Text type="secondary">
                                Thời lượng: {Math.floor(lecture.duration / 60)} phút
                              </Text>
                            </Space>
                          )}

                          <Divider style={{ margin: '8px 0' }} />
                          
                          <div>
                            <Text strong>Tài liệu đính kèm:</Text>
                            <div style={{ marginTop: 8 }}>
                              {renderMaterials(lecture.materials)}
                            </div>
                          </div>
                        </Space>
                      }
                    />
                  </Card>
                </List.Item>
              )}
              locale={{
                emptyText: selectedCourse ? 'Chưa có bài giảng nào' : 'Vui lòng chọn khóa học'
              }}
            />
          )}
        </Card>
      </Space>
    </div>
  );
}

export default LecturesPage;
