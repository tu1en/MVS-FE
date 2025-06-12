import { BookOutlined, CalendarOutlined, FileTextOutlined, PlayCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Descriptions, List, Progress, Spin, Tabs, message } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CourseService from '../services/courseService';
import MaterialService from '../services/materialService';

const { TabPane } = Tabs;

const CourseDetails = () => {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      
      // Use CourseService to fetch course details
      const courseData = await CourseService.getCourseDetails(courseId);
      setCourse(courseData);

      // Fetch course materials
      const materialsData = await CourseService.getCourseMaterials(courseId);
      setMaterials(materialsData);

      // Fetch course schedule
      const scheduleData = await CourseService.getCourseSchedule(courseId);
      setSchedule(scheduleData);

      // Calculate progress
      setProgress(courseData.progress || 0);
    } catch (error) {
      console.error('Error fetching course details:', error);
      message.error('Không thể tải thông tin khóa học');
    } finally {
      setLoading(false);
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
            {course?.startDate ? new Date(course.startDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian kết thúc">
            {course?.endDate ? new Date(course.endDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs defaultActiveKey="syllabus">
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              Giáo trình
            </span>
          } 
          key="syllabus"
        >
          <Card>
            <div dangerouslySetInnerHTML={{ __html: course?.syllabus || 'Chưa có giáo trình' }} />
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <CalendarOutlined />
              Lịch học
            </span>
          } 
          key="schedule"
        >
          <List
            dataSource={schedule}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<CalendarOutlined />} />}
                  title={item.title}
                  description={
                    <div>
                      <p><strong>Thời gian:</strong> {new Date(item.startTime).toLocaleString('vi-VN')}</p>
                      <p><strong>Địa điểm:</strong> {item.location}</p>
                      <p><strong>Mô tả:</strong> {item.description}</p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>

        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              Tài liệu
            </span>
          } 
          key="materials"
        >
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
                      <p><strong>Loại:</strong> {item.fileType}</p>
                      <p><strong>Kích thước:</strong> {item.fileSize}</p>
                      <p><strong>Ngày tải lên:</strong> {new Date(item.uploadDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>

        <TabPane 
          tab={
            <span>
              <PlayCircleOutlined />
              Video bài giảng
            </span>
          } 
          key="lectures"
        >
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
        </TabPane>
      </Tabs>
    </div>
  );
};

export default CourseDetails;
