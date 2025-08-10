import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import weekday from 'dayjs/plugin/weekday';
import { useState } from 'react';

// Cấu hình dayjs
dayjs.extend(weekday);
dayjs.locale('vi');

const { Title, Text } = Typography;

const WeeklyTimetable = ({ schedule }) => {
  const [currentDate, setCurrentDate] = useState(dayjs());

  const handlePrevWeek = () => {
    setCurrentDate(currentDate.subtract(1, 'week'));
  };

  const handleNextWeek = () => {
    setCurrentDate(currentDate.add(1, 'week'));
  };

  const startOfWeek = currentDate.startOf('week');
  const endOfWeek = currentDate.endOf('week');

  const days = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));

  const eventsByDay = days.map(day => {
    return schedule
      .filter(event => dayjs(event.startTime).isSame(day, 'day'))
      .sort((a, b) => dayjs(a.startTime).diff(dayjs(b.startTime)));
  });

  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    return dayjs(dateTime).format('HH:mm');
  };

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handlePrevWeek}>Tuần trước</Button>
            <Button icon={<ArrowRightOutlined />} onClick={handleNextWeek}>Tuần sau</Button>
          </Space>
        </Col>
        <Col>
          <Title level={4}>
            Tuần: {startOfWeek.format('DD/MM')} - {endOfWeek.format('DD/MM/YYYY')}
          </Title>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {days.map((day, index) => (
          <Col xs={24} sm={12} md={8} lg={6} xl={3} key={day.format('YYYY-MM-DD')}>
            <Card 
              title={day.format('dddd, DD/MM')} 
              headStyle={{ 
                backgroundColor: day.isSame(dayjs(), 'day') ? '#e6f7ff' : '#f0f2f5',
                borderBottom: '1px solid #d9d9d9'
              }}
              styles={{
                body: { minHeight: '200px', padding: '12px' }
              }}
            >
              {eventsByDay[index].length > 0 ? (
                eventsByDay[index].map(event => (
                  <Card key={event.id} size="small" style={{ marginBottom: '8px' }}>
                    <Text strong>{event.title}</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Tag color="blue">{formatTime(event.startTime)} - {formatTime(event.endTime)}</Tag>
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <Text type="secondary">{event.location || 'N/A'}</Text>
                    </div>
                  </Card>
                ))
              ) : (
                <Text type="secondary">Không có lịch</Text>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default WeeklyTimetable;
