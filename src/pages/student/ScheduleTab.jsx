import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Card, Col, Empty, Row, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

const { Title, Text } = Typography;

const ScheduleTab = ({ schedule }) => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { courseId } = useParams();

  useEffect(() => {
    fetchScheduleData();
  }, [courseId]);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch timetable events from the correct API endpoint
      const response = await api.get(`/timetable/classroom/${courseId}`);
      setScheduleData(response.data || []);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Không thể tải lịch học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventTypeColor = (eventType) => {
    switch (eventType?.toLowerCase()) {
      case 'class': return 'blue';
      case 'exam': return 'red';
      case 'meeting': return 'green';
      case 'assignment_due': return 'orange';
      case 'holiday': return 'purple';
      default: return 'default';
    }
  };

  const getEventTypeText = (eventType) => {
    switch (eventType?.toLowerCase()) {
      case 'class': return 'Lớp học';
      case 'exam': return 'Kiểm tra';
      case 'meeting': return 'Họp';
      case 'assignment_due': return 'Hạn nộp bài';
      case 'holiday': return 'Nghỉ lễ';
      default: return eventType || 'Sự kiện';
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert message={error} type="error" showIcon />
      </div>
    );
  }

  if (!scheduleData || scheduleData.length === 0) {
    return (
      <div className="p-4">
        <Empty 
          description="Chưa có lịch học nào được thiết lập"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Title level={4} className="mb-4">
        <CalendarOutlined className="mr-2" />
        Lịch học
      </Title>
      
      <Row gutter={[16, 16]}>
        {scheduleData.map((event) => (
          <Col xs={24} sm={12} lg={8} key={event.id}>
            <Card 
              className="h-full"
              bodyStyle={{ padding: '16px' }}
              title={
                <div className="flex justify-between items-start">
                  <Text strong className="text-base">{event.title}</Text>
                  <Tag color={getEventTypeColor(event.eventType)} className="mb-0">
                    {getEventTypeText(event.eventType)}
                  </Tag>
                </div>
              }
            >
              <div className="space-y-3">
                <div className="flex items-center">
                  <CalendarOutlined className="mr-2 text-gray-500" />
                  <Text className="text-sm">
                    {formatDate(event.startDatetime)}
                  </Text>
                </div>
                
                <div className="flex items-center">
                  <ClockCircleOutlined className="mr-2 text-gray-500" />
                  <Text className="text-sm">
                    {formatTime(event.startDatetime)} - {formatTime(event.endDatetime)}
                  </Text>
                </div>
                
                {event.location && (
                  <div className="flex items-center">
                    <EnvironmentOutlined className="mr-2 text-gray-500" />
                    <Text className="text-sm">{event.location}</Text>
                  </div>
                )}
                
                {event.classroomName && (
                  <div className="flex items-center">
                    <UserOutlined className="mr-2 text-gray-500" />
                    <Text className="text-sm">{event.classroomName}</Text>
                  </div>
                )}
                
                {event.description && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <Text type="secondary" className="text-sm">
                      {event.description}
                    </Text>
                  </div>
                )}

                {event.isAllDay && (
                  <div className="mt-2">
                    <Tag color="blue" size="small">Cả ngày</Tag>
                  </div>
                )}

                {event.isCancelled && (
                  <div className="mt-2">
                    <Tag color="red" size="small">Đã hủy</Tag>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ScheduleTab; 