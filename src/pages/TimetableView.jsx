import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    BookOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    ExclamationCircleOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    App,
    Avatar,
    Badge,
    Button,
    Calendar,
    Card,
    Col,
    Descriptions,
    List,
    Modal,
    Row,
    Select,
    Space,
    Tag,
    Typography
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import { useEffect, useState } from 'react';
import TimetableService from '../services/timetableService';

const { Option } = Select;
const { Title, Text } = Typography;

// Configure dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekday);
dayjs.locale('vi');

const TimetableView = () => {
  const { message } = App.useApp();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate, viewMode]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startDate = selectedDate.startOf(viewMode).format('YYYY-MM-DD');
      const endDate = selectedDate.endOf(viewMode).format('YYYY-MM-DD');
      
      console.log('Fetching timetable for:', { startDate, endDate, viewMode });
      
      // Use TimetableService to fetch schedule
      const data = await TimetableService.getTimetable({
        startDate,
        endDate,
        view: viewMode
      });
      
      console.log('Timetable data received:', data);
      setEvents(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setError(error);
      
      if (error.response?.status === 404) {
        message.warning('Không tìm thấy lịch học cho khoảng thời gian này');
        setEvents([]);
      } else if (error.response?.status === 403) {
        message.error('Bạn không có quyền xem lịch học');
      } else if (!error.response) {
        message.error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.');
      } else {
        message.error('Không thể tải lịch học. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getListData = (value) => {
    if (!Array.isArray(events) || events.length === 0) return [];
    
    const dateEvents = events.filter(event => {
      if (!event.startTime && !event.start_datetime) return false;
      const eventDate = dayjs(event.startTime || event.start_datetime).format('YYYY-MM-DD');
      return eventDate === value.format('YYYY-MM-DD');
    });
    
    return dateEvents.map(event => ({
      type: getEventType(event.type || event.event_type),
      content: event.title || event.name || 'Không có tiêu đề',
      event: event
    }));
  };

  const getEventType = (type) => {
    switch (type?.toLowerCase()) {
      case 'class':
      case 'lop_hoc':
        return 'success';
      case 'exam':
      case 'kiem_tra':
      case 'thi':
        return 'error';
      case 'assignment':
      case 'bai_tap':
        return 'warning';
      case 'event':
      case 'su_kien':
        return 'default';
      default:
        return 'default';
    }
  };

  const getEventIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'class':
      case 'lop_hoc':
        return <BookOutlined />;
      case 'exam':
      case 'kiem_tra':
      case 'thi':
        return <ExclamationCircleOutlined />;
      case 'assignment':
      case 'bai_tap':
        return <ClockCircleOutlined />;
      case 'event':
      case 'su_kien':
        return <CalendarOutlined />;
      default:
        return <CalendarOutlined />;
    }
  };

  const getEventColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'class':
      case 'lop_hoc':
        return '#52c41a';
      case 'exam':
      case 'kiem_tra':
      case 'thi':
        return '#f5222d';
      case 'assignment':
      case 'bai_tap':
        return '#faad14';
      case 'event':
      case 'su_kien':
        return '#1890ff';
      default:
        return '#1890ff';
    }
  };

  const cellRender = (current, info) => {
    if (info.type !== 'date') return info.originNode;
    
    const listData = getListData(current);
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index} style={{ marginBottom: '2px' }}>
            <Badge 
              status={item.type} 
              text={
                <span 
                  style={{ 
                    fontSize: '10px', 
                    cursor: 'pointer',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '80px'
                  }}
                  onClick={() => showEventDetails(item.event)}
                >
                  {item.content}
                </span>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  const showEventDetails = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const getTodayEvents = () => {
    const today = dayjs().format('YYYY-MM-DD');
    return events.filter(event => 
      dayjs(event.start_datetime || event.startTime).format('YYYY-MM-DD') === today
    );
  };

  const getUpcomingEvents = () => {
    const today = dayjs();
    return events
      .filter(event => dayjs(event.start_datetime || event.startTime).isAfter(today))
      .sort((a, b) => dayjs(a.start_datetime || a.startTime).diff(dayjs(b.start_datetime || b.startTime)))
      .slice(0, 5);
  };

  // Week view functions
  const handlePrevWeek = () => {
    setSelectedDate(selectedDate.subtract(1, 'week'));
  };

  const handleNextWeek = () => {
    setSelectedDate(selectedDate.add(1, 'week'));
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    return dayjs(dateTime).format('HH:mm');
  };

  const renderWeekView = () => {
    const startOfWeek = selectedDate.startOf('week');
    const endOfWeek = selectedDate.endOf('week');
    const days = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));

    const eventsByDay = days.map(day => {
      return events
        .filter(event => dayjs(event.start_datetime || event.startTime).isSame(day, 'day'))
        .sort((a, b) => dayjs(a.start_datetime || a.startTime).diff(dayjs(b.start_datetime || b.startTime)));
    });

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
            <Space>
              <Title level={4}>
                Tuần: {startOfWeek.format('DD/MM')} - {endOfWeek.format('DD/MM/YYYY')}
              </Title>
              <Select
                value={viewMode}
                onChange={setViewMode}
                style={{ width: 120 }}
              >
                <Option value="month">Tháng</Option>
                <Option value="week">Tuần</Option>
              </Select>
            </Space>
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
                bodyStyle={{ minHeight: '200px', padding: '12px' }}
              >
                {eventsByDay[index].length > 0 ? (
                  eventsByDay[index].map(event => (
                    <Card 
                      key={event.id} 
                      size="small" 
                      style={{ 
                        marginBottom: '8px',
                        cursor: 'pointer',
                        borderColor: getEventColor(event.event_type || event.type)
                      }}
                      onClick={() => showEventDetails(event)}
                    >
                      <Text strong>{event.title}</Text>
                      <div style={{ marginTop: '4px' }}>
                        <Tag color={getEventType(event.event_type || event.type)}>
                          {formatTime(event.start_datetime || event.startTime)} - {formatTime(event.end_datetime || event.endTime)}
                        </Tag>
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

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Main Calendar */}
        {viewMode === 'week' ? (
          renderWeekView()
        ) : (
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  Thời khóa biểu cá nhân
                </div>
                <Select
                  value={viewMode}
                  onChange={setViewMode}
                  style={{ width: 120 }}
                >
                  <Option value="month">Tháng</Option>
                  <Option value="week">Tuần</Option>
                </Select>
              </div>
            }
            style={{ flex: 1 }}
            loading={loading}
          >
            <Calendar
              cellRender={cellRender}
              value={selectedDate}
              onSelect={setSelectedDate}
              onPanelChange={(value, mode) => {
                setSelectedDate(value);
                setViewMode(mode);
              }}
            />
          </Card>
        )}

        {/* Sidebar - Only show in month view */}
        {viewMode === 'month' && (
          <div style={{ width: '320px' }}>
          {/* Today's Events */}
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ClockCircleOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                Lịch hôm nay
              </div>
            }
            size="small"
            style={{ marginBottom: '16px' }}
          >
            <List
              size="small"
              dataSource={getTodayEvents()}
              locale={{ emptyText: 'Không có lịch học hôm nay' }}
              renderItem={item => (
                <List.Item 
                  style={{ padding: '8px 0', cursor: 'pointer' }}
                  onClick={() => showEventDetails(item)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={getEventIcon(item.type)} 
                        style={{ backgroundColor: getEventColor(item.type) }}
                        size="small"
                      />
                    }
                    title={
                      <span style={{ fontSize: '13px' }}>{item.title}</span>
                    }
                    description={
                      <div style={{ fontSize: '11px' }}>
                        {dayjs(item.start_datetime || item.startTime).format('HH:mm')} - {dayjs(item.end_datetime || item.endTime).format('HH:mm')}
                        <br />
                        {item.location}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* Upcoming Events */}
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                Sắp tới
              </div>
            }
            size="small"
          >
            <List
              size="small"
              dataSource={getUpcomingEvents()}
              locale={{ emptyText: 'Không có lịch sắp tới' }}
              renderItem={item => (
                <List.Item 
                  style={{ padding: '8px 0', cursor: 'pointer' }}
                  onClick={() => showEventDetails(item)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={getEventIcon(item.type)} 
                        style={{ backgroundColor: getEventColor(item.type) }}
                        size="small"
                      />
                    }
                    title={
                      <span style={{ fontSize: '13px' }}>{item.title}</span>
                    }
                    description={
                      <div style={{ fontSize: '11px' }}>
                        {dayjs(item.start_datetime || item.startTime).format('DD/MM - HH:mm')}
                        <br />
                        {item.location}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
        )}
      </div>

      {/* Event Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {selectedEvent && getEventIcon(selectedEvent.event_type || selectedEvent.type)}
            <span style={{ marginLeft: '8px' }}>Chi tiết lịch học</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedEvent && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tiêu đề">
              {selectedEvent.title}
            </Descriptions.Item>
            <Descriptions.Item label="Loại">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  icon={getEventIcon(selectedEvent.event_type || selectedEvent.type)} 
                  style={{ backgroundColor: getEventColor(selectedEvent.event_type || selectedEvent.type) }}
                  size="small"
                />
                <span style={{ marginLeft: '8px' }}>
                  {(selectedEvent.event_type || selectedEvent.type) === 'CLASS' ? 'Lớp học' :
                   (selectedEvent.event_type || selectedEvent.type) === 'EXAM' ? 'Kiểm tra/Thi' :
                   (selectedEvent.event_type || selectedEvent.type) === 'ASSIGNMENT' ? 'Bài tập' : 'Sự kiện'}
                </span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ClockCircleOutlined style={{ marginRight: '8px' }} />
                {dayjs(selectedEvent.start_datetime || selectedEvent.startTime).format('DD/MM/YYYY HH:mm')} - {dayjs(selectedEvent.end_datetime || selectedEvent.endTime).format('HH:mm')}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Địa điểm">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <EnvironmentOutlined style={{ marginRight: '8px' }} />
                {selectedEvent.location || 'Chưa xác định'}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Giảng viên">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <UserOutlined style={{ marginRight: '8px' }} />
                {selectedEvent.teacherName || 'Chưa xác định'}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Khóa học">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <BookOutlined style={{ marginRight: '8px' }} />
                {selectedEvent.courseName || 'Chưa xác định'}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {selectedEvent.description || 'Không có mô tả'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default TimetableView;
