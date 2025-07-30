import { BookOutlined, CalendarOutlined, FileTextOutlined, PlayCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, App, Avatar, Button, Card, Descriptions, List, Progress, Spin, Tabs, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import WeeklyTimetable from '../components/WeeklyTimetable';
import ClassroomService from '../services/classroomService';
import MaterialService from '../services/materialService';
import { formatFullDateTime, parseTimestamp } from '../utils/dateUtils';
import { ROLE } from '../constants/constants';

const CourseDetails = () => {
  const { message } = App.useApp();
  const { Title, Text } = Typography;
  const navigate = useNavigate();
  const { courseId: pathCourseId } = useParams();
  const location = useLocation();
  
  // Get course ID from query parameters or path parameters
  const getCourseId = () => {
    const searchParams = new URLSearchParams(location.search);
    const queryId = searchParams.get('id');
    return queryId || pathCourseId;
  };
  
  // Use imported formatFullDateTime from utils
  const formatDateTime = (dateTime) => {
    const parsed = parseTimestamp(dateTime);
    return parsed ? formatFullDateTime(parsed) : 'Chưa xác định';
  };
  
  const courseId = getCourseId();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [progress, setProgress] = useState(0);
  const [suggestedCourses, setSuggestedCourses] = useState([]);
  const [hasNetworkError, setHasNetworkError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use ClassroomService to fetch classroom details
        const courseData = await ClassroomService.getClassroomDetails(courseId);
        setCourse(courseData);

        // const materialsData = await ClassroomService.getCourseMaterials(courseId);
        // setMaterials(materialsData);

        // Fetch students instead of schedule
        const studentsData = await ClassroomService.getStudentsInClassroom(courseId);
        setSchedule(studentsData); // Temporarily putting students in schedule state for display

      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const fetchSuggestedCourses = async () => {
    try {
      //  const coursesData = await ClassroomService.getMyMyCourses();
       setSuggestedCourses([]); // Set to empty array as getMyMyCourses doesn't exist
    } catch (error) {
      console.error('Error fetching suggested courses:', error);
    }
  };

  const downloadMaterial = async (materialId, fileName) => {
    try {
      // Use MaterialService to download material
      const blob = await MaterialService.downloadMaterial(materialId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('Tải file thành công');
    } catch (error) {
      console.error('Error downloading material:', error);
      message.error('Không thể tải file');
    }
  };

  if (!courseId) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Card>
          <h3>Lỗi: Không tìm thấy ID khóa học</h3>
          <p>URL phải chứa tham số ID khóa học (?id=courseId)</p>
          <Button type="primary" onClick={() => window.history.back()}>
            Quay lại
          </Button>
        </Card>
      </div>
    );
  }

  // Network error state
  if (!loading && hasNetworkError && !course) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Alert
            message="Lỗi kết nối"
            description="Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn."
            type="error"
            showIcon
          />
          <div style={{ marginTop: '20px' }}>
            <Button 
              type="primary" 
              onClick={() => {
                setHasNetworkError(false);
                fetchSuggestedCourses();
              }}
              style={{ marginRight: '10px' }}
            >
              Thử lại
            </Button>
            <Button onClick={() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token) {
        navigate('/');
    } else {
        switch (role) {
            case ROLE.ADMIN:
                navigate('/admin');
                break;
            case ROLE.TEACHER:
                navigate('/teacher');
                break;
            case ROLE.MANAGER:
                navigate('/manager');
                break;
            case ROLE.STUDENT:
                navigate('/student');
                break;
            case ROLE.ACCOUNTANT:
                navigate('/accountant');
                break;
            default:
                navigate('/');
        }
    }
}}>Quay lại</Button>
          </div>
        </Card>
      </div>
    );
  }
  if (!loading && course === null) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Alert
            message="Không tìm thấy khóa học"
            description={
              <div style={{ textAlign: 'left' }}>
                <p>Khóa học với ID <strong>{courseId}</strong> không tồn tại hoặc đã bị xóa.</p>
                <p><strong>Bạn có thể:</strong></p>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  <li>Kiểm tra lại URL có đúng không</li>
                  <li>Truy cập từ danh sách khóa học của bạn</li>
                  <li>Liên hệ với giáo viên nếu đây là khóa học bạn đã đăng ký</li>
                </ul>
              </div>
            }
            type="warning"
            showIcon
            style={{ textAlign: 'left' }}
          />
          
          {/* Suggested Courses */}
          {suggestedCourses.length > 0 && (
            <div style={{ marginTop: '20px', textAlign: 'left' }}>
              <Title level={4}>Khóa học của bạn:</Title>
              <List
                dataSource={suggestedCourses}
                renderItem={(suggestedCourse) => (
                  <List.Item 
                    actions={[
                      <Button 
                        type="link" 
                        onClick={() => navigate(`/course-details?id=${suggestedCourse.id}`)}
                      >
                        Xem chi tiết
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<BookOutlined />} />}
                      title={suggestedCourse.name || suggestedCourse.courseName}
                      description={
                        <div>
                          <Text type="secondary">ID: {suggestedCourse.id}</Text>
                          {suggestedCourse.description && (
                            <div style={{ marginTop: '4px' }}>
                              <Text>{suggestedCourse.description}</Text>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}
          
          <div style={{ marginTop: '20px' }}>
            <Button 
              type="primary" 
              onClick={() => navigate('/student/enrolled-courses')}
              style={{ marginRight: '10px' }}
            >
              Tất cả khóa học
            </Button>
            <Button onClick={() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token) {
        navigate('/');
    } else {
        switch (role) {
            case ROLE.ADMIN:
                navigate('/admin');
                break;
            case ROLE.TEACHER:
                navigate('/teacher');
                break;
            case ROLE.MANAGER:
                navigate('/manager');
                break;
            case ROLE.STUDENT:
                navigate('/student');
                break;
            case ROLE.ACCOUNTANT:
                navigate('/accountant');
                break;
            default:
                navigate('/');
        }
    }
}}>Quay lại</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BookOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            {course?.title || 'Chi tiết khóa học'}
          </div>
        }
        style={{ marginBottom: '24px' }}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Tên khóa học">
            {course?.title}
          </Descriptions.Item>
          <Descriptions.Item label="Giảng viên">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar icon={<UserOutlined />} style={{ marginRight: '8px' }} />
              {course?.teacher?.fullName}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả" span={2}>
            {course?.description}
          </Descriptions.Item>
          <Descriptions.Item label="Tiến độ hoàn thành">
            <Progress percent={progress} />
          </Descriptions.Item>
          <Descriptions.Item label="Số sinh viên đã đăng ký">
            {course?.enrolledCount || 0} sinh viên
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian bắt đầu">
            {course?.startDate ? formatDateTime(course.startDate) : 'Chưa xác định'}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian kết thúc">
            {course?.endDate ? formatDateTime(course.endDate) : 'Chưa xác định'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs 
        defaultActiveKey="syllabus"
        items={[
          {
            key: 'syllabus',
            label: (
              <span>
                <FileTextOutlined />
                Giáo trình
              </span>
            ),
            children: (
              <Card>
                <div dangerouslySetInnerHTML={{ __html: course?.syllabus || 'Chưa có giáo trình' }} />
              </Card>
            )
          },
          {
            key: 'schedule',
            label: (
              <span>
                <CalendarOutlined />
                Lịch học
              </span>
            ),
            children: <WeeklyTimetable schedule={schedule} />,
          },
          {
            key: 'materials',
            label: (
              <span>
                <FileTextOutlined />
                Tài liệu
              </span>
            ),
            children: (
              <List
                dataSource={materials}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => downloadMaterial(item.id, item.fileName)}
                      >
                        Tải xuống
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<FileTextOutlined />} />}
                      title={item.fileName}
                      description={
                        <div>
                          <p><strong>Loại:</strong> {item.fileType || 'Không rõ'}</p>
                          <p><strong>Kích thước:</strong> {item.fileSize || 'Không rõ'}</p>
                          <p><strong>Ngày tải lên:</strong> {item.uploadDate ? formatDateTime(item.uploadDate) : 'Chưa xác định'}</p>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )
          },
          {
            key: 'lectures',
            label: (
              <span>
                <PlayCircleOutlined />
                Video bài giảng
              </span>
            ),
            children: (
              <List
                dataSource={course?.lectures || []}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button type="primary" icon={<PlayCircleOutlined />}>
                        Xem video
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<PlayCircleOutlined />} />}
                      title={item.title}
                      description={
                        <div>
                          <p><strong>Thời lượng:</strong> {item.duration} phút</p>
                          <p><strong>Mô tả:</strong> {item.description}</p>
                          <Progress 
                            percent={item.watchProgress || 0} 
                            size="small" 
                            format={percent => `${percent}%`}
                          />
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )
          }
        ]}
      />
    </div>
  );
};

export default CourseDetails;
