import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined
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
import { useCallback, useEffect, useRef, useState } from 'react';
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

  // Debug events state changes (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [TimetableView] Events state changed:', {
        eventsLength: events.length,
        viewMode,
        selectedDate: selectedDate.format('YYYY-MM-DD')
      });
    }
  }, [events, viewMode, selectedDate]);

  // Refs for managing requests and debouncing
  const abortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const cacheRef = useRef(new Map());

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchSchedule = useCallback(async (startDate, endDate, viewMode) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    // Check cache first
    const cacheKey = `${startDate}-${endDate}-${viewMode}`;
    if (cacheRef.current.has(cacheKey)) {
      console.log('📅 Using cached data for:', cacheKey);
      setEvents(cacheRef.current.get(cacheKey));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📅 Fetching timetable for:', { startDate, endDate, viewMode });

      // Use TimetableService to fetch my timetable (for students)
      const data = await TimetableService.getMyTimetable({
        startDate,
        endDate
      });

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log('📅 Request was aborted');
        return;
      }

      console.log('📅 Timetable data received:', data);
      const eventsData = Array.isArray(data) ? data : [];
      console.log('🔍 DEBUG fetchSchedule - Processing events:', {
        dataType: typeof data,
        isArray: Array.isArray(data),
        dataLength: data?.length,
        eventsDataLength: eventsData.length,
        viewMode,
        cacheKey
      });

      // Cache the result
      cacheRef.current.set(cacheKey, eventsData);
      console.log('🔍 DEBUG fetchSchedule - Cached data:', { cacheKey, cachedLength: eventsData.length });

      // Limit cache size to prevent memory leaks
      if (cacheRef.current.size > 10) {
        const firstKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(firstKey);
      }

      console.log('🔍 DEBUG fetchSchedule - Setting events state:', { eventsDataLength: eventsData.length });
      setEvents(eventsData);
      console.log('🔍 DEBUG fetchSchedule - Events state set completed');

    } catch (error) {
      // Don't show error if request was aborted
      if (error.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        console.log('📅 Request was aborted');
        return;
      }

      console.error('❌ Error fetching schedule:', error);
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
      abortControllerRef.current = null;
    }
  }, [message]);

  // Debounced effect to prevent rapid API calls
  useEffect(() => {
    console.log('🔍 DEBUG useEffect triggered:', {
      selectedDate: selectedDate.format('YYYY-MM-DD'),
      viewMode,
      eventsLength: events.length
    });

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debouncing
    debounceTimeoutRef.current = setTimeout(() => {
      const startDate = selectedDate.startOf(viewMode).format('YYYY-MM-DD');
      const endDate = selectedDate.endOf(viewMode).format('YYYY-MM-DD');
      console.log('🔍 DEBUG fetchSchedule called:', { startDate, endDate, viewMode });
      fetchSchedule(startDate, endDate, viewMode);
    }, 300); // 300ms debounce

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [selectedDate, viewMode, fetchSchedule]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Function to clear cache when needed (e.g., when data is updated)
  const clearCache = useCallback(() => {
    console.log('📅 Clearing timetable cache');
    cacheRef.current.clear();
  }, []);

  // Function to refresh data (clear cache and refetch)
  const refreshData = useCallback(() => {
    clearCache();
    const startDate = selectedDate.startOf(viewMode).format('YYYY-MM-DD');
    const endDate = selectedDate.endOf(viewMode).format('YYYY-MM-DD');
    fetchSchedule(startDate, endDate, viewMode);
  }, [selectedDate, viewMode, fetchSchedule, clearCache]);

  const getListData = (value) => {
    const valueDate = value.format('YYYY-MM-DD');

    // Debug log for July 14th specifically - check events array
    if (valueDate === '2025-07-14') {
      console.log('🔍 DEBUG getListData July 14th:', {
        eventsIsArray: Array.isArray(events),
        eventsLength: events ? events.length : 'null/undefined',
        eventsData: events,
        valueDate
      });
    }

    if (!Array.isArray(events) || events.length === 0) {
      if (valueDate === '2025-07-14') {
        console.log('❌ DEBUG July 14th: Events array is empty or not array');
      }
      return [];
    }

    const dateEvents = events.filter(event => {
      // Check multiple possible field names for datetime (API inconsistency)
      const eventDateTime = event.startDatetime || event.start_datetime || event.startTime;

      if (!eventDateTime) {
        if (valueDate === '2025-07-14') {
          console.log('🔍 DEBUG July 14th - Event missing datetime:', {
            eventTitle: event.title,
            event: event
          });
        }
        return false;
      }

      const eventDate = dayjs(eventDateTime).format('YYYY-MM-DD');

      // Debug log for July 14th specifically
      if (valueDate === '2025-07-14') {
        console.log('🔍 DEBUG July 14th event filter:', {
          eventTitle: event.title,
          eventDateTime,
          eventDate,
          valueDate,
          matches: eventDate === valueDate,
          eventType: event.eventType
        });
      }

      return eventDate === valueDate;
    });

    const result = dateEvents.map(event => ({
      type: getEventType(event.eventType),
      content: event.title || 'Không có tiêu đề',
      event: event
    }));

    // Debug log for July 14th result
    if (value.format('YYYY-MM-DD') === '2025-07-14') {
      console.log('🔍 DEBUG July 14th result:', result);
    }

    return result;
  };

  const getEventType = (type) => {
    switch (type?.toLowerCase()) {
      case 'class':
      case 'class_session':
        return 'success';
      case 'exam':
      case 'test':
        return 'error';
      case 'assignment':
      case 'assignment_due':
        return 'warning';
      case 'event':
      case 'other':
        return 'default';
      default:
        return 'default';
    }
  };

  const getEventIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'class':
      case 'class_session':
        return <BookOutlined />;
      case 'exam':
      case 'test':
        return <ExclamationCircleOutlined />;
      case 'assignment':
      case 'assignment_due':
        return <ClockCircleOutlined />;
      case 'event':
      case 'other':
        return <CalendarOutlined />;
      default:
        return <CalendarOutlined />;
    }
  };

  const getEventColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'class':
      case 'class_session':
        return '#52c41a';
      case 'exam':
      case 'test':
        return '#f5222d';
      case 'assignment':
      case 'assignment_due':
        return '#faad14';
      case 'event':
      case 'other':
        return '#1890ff';
      default:
        return '#1890ff';
    }
  };

  const showEventDetails = useCallback((event) => {
    if (!event) {
      console.warn('⚠️ Cannot show details for null/undefined event');
      return;
    }

    console.log('📅 Showing event details:', event);
    setSelectedEvent(event);
    setModalVisible(true);
  }, []);

  const handleEventClick = useCallback((e, event) => {
    // Prevent event bubbling to avoid conflicts
    e.preventDefault();
    e.stopPropagation();

    console.log('📅 Event clicked:', event);

    // Validate event data before showing details
    if (!event) {
      console.warn('⚠️ No event data provided');
      message.warning('Không có thông tin sự kiện');
      return;
    }

    showEventDetails(event);
  }, [message, showEventDetails]);

  const cellRender = useCallback((current) => {
    // Ensure events is available before processing
    if (!Array.isArray(events) || events.length === 0) {
      return null;
    }

    const listData = getListData(current);

    // Debug log for July 14th specifically
    if (current.format('YYYY-MM-DD') === '2025-07-14') {
      console.log('🔍 DEBUG dateCellRender July 14th:', {
        date: current.format('YYYY-MM-DD'),
        eventsLength: events.length,
        listDataLength: listData.length,
        listData: listData
      });
    }

    if (listData.length === 0) return null;

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
                  onClick={(e) => handleEventClick(e, item.event)}
                >
                  {item.content}
                </span>
              }
            />
          </li>
        ))}
      </ul>
    );
  }, [events, handleEventClick]);

  const getTodayEvents = () => {
    const today = dayjs().format('YYYY-MM-DD');
    return events.filter(event => 
      dayjs(event.startDatetime).format('YYYY-MM-DD') === today
    );
  };

  const getUpcomingEvents = () => {
    const today = dayjs();
    return events
      .filter(event => dayjs(event.startDatetime).isAfter(today))
      .sort((a, b) => dayjs(a.startDatetime).diff(dayjs(b.startDatetime)))
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

    console.log('🔍 DEBUG renderWeekView:', {
      eventsLength: events.length,
      startOfWeek: startOfWeek.format('YYYY-MM-DD'),
      endOfWeek: endOfWeek.format('YYYY-MM-DD'),
      events: events
    });

    const eventsByDay = days.map(day => {
      const dayEvents = events
        .filter(event => {
          // Check both possible field names for datetime
          const eventDateTime = event.startDatetime || event.start_datetime || event.startTime;
          const matches = dayjs(eventDateTime).isSame(day, 'day');

          if (day.format('YYYY-MM-DD') === '2025-07-14') {
            console.log('🔍 DEBUG Week view July 14th filter:', {
              eventTitle: event.title,
              eventDateTime,
              dayFormatted: day.format('YYYY-MM-DD'),
              matches
            });
          }

          return matches;
        })
        .sort((a, b) => {
          const aTime = a.startDatetime || a.start_datetime || a.startTime;
          const bTime = b.startDatetime || b.start_datetime || b.startTime;
          return dayjs(aTime).diff(dayjs(bTime));
        });

      return dayEvents;
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
                {(() => {
                  const dayEventsCount = eventsByDay[index].length;
                  if (day.format('YYYY-MM-DD') === '2025-07-14') {
                    console.log('🔍 DEBUG Week view July 14th render:', {
                      dayFormatted: day.format('YYYY-MM-DD'),
                      dayEventsCount,
                      dayEvents: eventsByDay[index]
                    });
                  }
                  return dayEventsCount > 0;
                })() ? (
                  eventsByDay[index].map(event => (
                    <Card 
                      key={event.id} 
                      size="small" 
                      style={{ 
                        marginBottom: '8px',
                        cursor: 'pointer',
                        borderColor: getEventColor(event.event_type || event.type)
                      }}
                      onClick={(e) => handleEventClick(e, event)}
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
              dateCellRender={cellRender}
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
                  onClick={(e) => handleEventClick(e, item)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={getEventIcon(item.eventType)} 
                        style={{ backgroundColor: getEventColor(item.eventType) }}
                        size="small"
                      />
                    }
                    title={
                      <span style={{ fontSize: '13px' }}>{item.title}</span>
                    }
                    description={
                      <div style={{ fontSize: '11px' }}>
                        {dayjs(item.startDatetime).format('HH:mm')} - {dayjs(item.endDatetime).format('HH:mm')}
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
                  onClick={(e) => handleEventClick(e, item)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={getEventIcon(item.eventType)} 
                        style={{ backgroundColor: getEventColor(item.eventType) }}
                        size="small"
                      />
                    }
                    title={
                      <span style={{ fontSize: '13px' }}>{item.title}</span>
                    }
                    description={
                      <div style={{ fontSize: '11px' }}>
                        {dayjs(item.startDatetime).format('DD/MM - HH:mm')}
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
                  icon={getEventIcon(selectedEvent.eventType)} 
                  style={{ backgroundColor: getEventColor(selectedEvent.eventType) }}
                  size="small"
                />
                <span style={{ marginLeft: '8px' }}>
                  {selectedEvent.eventType === 'CLASS_SESSION' ? 'Lớp học' :
                   selectedEvent.eventType === 'EXAM' ? 'Kiểm tra/Thi' :
                   selectedEvent.eventType === 'ASSIGNMENT_DUE' ? 'Hạn nộp bài' : 'Sự kiện'}
                </span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ClockCircleOutlined style={{ marginRight: '8px' }} />
                {dayjs(selectedEvent.startDatetime).format('DD/MM/YYYY HH:mm')} - {dayjs(selectedEvent.endDatetime).format('HH:mm')}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Địa điểm">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <EnvironmentOutlined style={{ marginRight: '8px' }} />
                {selectedEvent.location || 'Chưa xác định'}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Khóa học">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <BookOutlined style={{ marginRight: '8px' }} />
                {selectedEvent.classroomName || 'Chưa xác định'}
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
