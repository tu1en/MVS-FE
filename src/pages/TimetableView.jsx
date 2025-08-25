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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  
  // CSS để ẩn phần năm trong Calendar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Ẩn hoàn toàn phần năm trong Calendar - CSS mạnh hơn */
      
      /* Ẩn dropdown năm 2025 */
      .ant-picker-header-view .ant-picker-year-panel,
      .ant-picker-header-view .ant-picker-year-panel *,
      .ant-picker-header-view .ant-picker-year-panel .ant-picker-header-view,
      .ant-picker-header-view .ant-picker-year-panel .ant-picker-header-view * {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        width: 0 !important;
        height: 0 !important;
        position: absolute !important;
        left: -9999px !important;
        pointer-events: none !important;
      }
      
      /* Ẩn nút "Năm" trong radio group */
      .ant-radio-group.ant-picker-calendar-mode-switch .ant-radio-button-wrapper:nth-child(2),
      .ant-radio-group.ant-picker-calendar-mode-switch .ant-radio-button-wrapper:last-child,
      .ant-radio-group.ant-picker-calendar-mode-switch label:nth-child(2),
      .ant-radio-group.ant-picker-calendar-mode-switch label:last-child {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        width: 0 !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        position: absolute !important;
        left: -9999px !important;
        pointer-events: none !important;
      }
      
      /* Ẩn theo title attribute */
      .ant-picker-header-view button[title*="năm"],
      .ant-picker-header-view button[title*="year"],
      .ant-picker-header-view button[title="Năm"],
      .ant-picker-header-view button[title="Year"],
      .ant-radio-button-wrapper[title*="năm"],
      .ant-radio-button-wrapper[title*="year"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        width: 0 !important;
        height: 0 !important;
        position: absolute !important;
        left: -9999px !important;
        pointer-events: none !important;
      }
      
      /* Ẩn theo text content */
      .ant-picker-header-view button:contains("Năm"),
      .ant-picker-header-view button:contains("Year"),
      .ant-radio-button-wrapper:contains("Năm"),
      .ant-radio-button-wrapper:contains("Year") {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        width: 0 !important;
        height: 0 !important;
        position: absolute !important;
        left: -9999px !important;
        pointer-events: none !important;
      }
      
      /* Ẩn tất cả các phần tử có thể chứa năm */
      .ant-picker-header-view *[class*="year"],
      .ant-picker-header-view *[class*="Year"],
      .ant-picker-header-view *[aria-label*="năm"],
      .ant-picker-header-view *[aria-label*="year"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
    `;
    document.head.appendChild(style);
    
    // JavaScript để ẩn trực tiếp các phần tử năm
    const hideYearElements = () => {
      // Ẩn dropdown năm
      const yearPanels = document.querySelectorAll('.ant-picker-year-panel');
      yearPanels.forEach(panel => {
        panel.style.display = 'none';
        panel.style.visibility = 'hidden';
        panel.style.opacity = '0';
        panel.style.width = '0';
        panel.style.height = '0';
        panel.style.position = 'absolute';
        panel.style.left = '-9999px';
      });
      
      // Ẩn nút "Năm" trong radio group
      const radioButtons = document.querySelectorAll('.ant-radio-button-wrapper');
      radioButtons.forEach((button, index) => {
        if (index === 1 || button.textContent?.includes('Năm') || button.textContent?.includes('Year')) {
          button.style.display = 'none';
          button.style.visibility = 'hidden';
          button.style.opacity = '0';
          button.style.width = '0';
          button.style.height = '0';
          button.style.position = 'absolute';
          button.style.left = '-9999px';
        }
      });
      
      // Ẩn các button có title chứa "năm" hoặc "year"
      const yearButtons = document.querySelectorAll('button[title*="năm"], button[title*="year"], button[title*="Năm"], button[title*="Year"]');
      yearButtons.forEach(button => {
        button.style.display = 'none';
        button.style.visibility = 'hidden';
        button.style.opacity = '0';
        button.style.width = '0';
        button.style.height = '0';
        button.style.position = 'absolute';
        button.style.left = '-9999px';
      });
    };
    
    // Chạy ngay lập tức
    hideYearElements();
    
    // Chạy lại sau khi DOM đã render xong
    setTimeout(hideYearElements, 100);
    setTimeout(hideYearElements, 500);
    setTimeout(hideYearElements, 1000);
    
    // Theo dõi DOM changes để ẩn các phần tử mới
    const observer = new MutationObserver(hideYearElements);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
      observer.disconnect();
    };
  }, []);
  
  // State management với loading control
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Ref để track last fetch params và prevent duplicate calls
  const lastFetchRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Optimized fetchSchedule với debounce và duplicate prevention
  const fetchSchedule = useCallback(async () => {
    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      const startDate = selectedDate.startOf(viewMode).format('YYYY-MM-DD');
      const endDate = selectedDate.endOf(viewMode).format('YYYY-MM-DD');
      const params = { startDate, endDate, viewMode };
      const paramsKey = JSON.stringify(params);
      
      // Prevent duplicate API calls
      if (lastFetchRef.current === paramsKey && !loading) {
        console.log('📅 TimetableView: Skipping duplicate fetch for:', params);
        return;
      }
      
      if (loading) {
        console.log('📅 TimetableView: Already loading, skipping fetch');
        return;
      }
      
      lastFetchRef.current = paramsKey;
      setLoading(true);
      setError(null);
      
      console.log('📅 TimetableView: Fetching timetable for:', params);
      
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      // Use TimetableService to fetch my timetable
      const data = await TimetableService.getMyTimetable({
        startDate,
        endDate
      });
      
      console.log('📅 TimetableView: Response received:', data);
      
      // Validate and set data
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        console.warn('⚠️ TimetableView: Invalid response format:', data);
        setEvents([]);
      }
      
    } catch (error) {
      // Ignore aborted requests
      if (error.name === 'AbortError') {
        console.log('📅 TimetableView: Request aborted');
        return;
      }
      
      console.error('❌ TimetableView: Error fetching schedule:', error);
      setError(error);
      
      // Handle different error types
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
  }, [selectedDate, viewMode, loading, message]);

  // Effect với debounce và cleanup
  useEffect(() => {
    // Debounce để tránh multiple calls khi user thay đổi nhanh
    const timeoutId = setTimeout(() => {
      fetchSchedule();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      // Cancel any pending request when component unmounts or deps change
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchSchedule]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Event handler với optimization để prevent API spam
  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setSelectedEvent(null);
  }, []);

  const showEventDetails = useCallback((event) => {
    if (!event) return;
    console.log('📅 TimetableView: Showing event details for:', event);
    setSelectedEvent(event);
    setModalVisible(true);
  }, []);

  // Memoized event data processing
  const getListData = useCallback((value) => {
    if (!Array.isArray(events) || events.length === 0) return [];
    
    const dateEvents = events.filter(event => {
      if (!event.startDatetime) return false;
      const eventDate = dayjs(event.startDatetime).format('YYYY-MM-DD');
      return eventDate === value.format('YYYY-MM-DD');
    });
    
    return dateEvents.map(event => ({
      type: getEventType(event.eventType),
      content: event.title || 'Không có tiêu đề',
      event: event
    }));
  }, [events]);

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

  // Optimized cell render với click handler
  const cellRender = useCallback((current, info) => {
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showEventDetails(item.event);
                  }}
                >
                  {item.content}
                </span>
              }
            />
          </li>
        ))}
      </ul>
    );
  }, [getListData, showEventDetails]);

  // Memoized event lists
  const todayEvents = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    return events.filter(event => 
      dayjs(event.startDatetime).format('YYYY-MM-DD') === today
    );
  }, [events]);

  const upcomingEvents = useMemo(() => {
    const today = dayjs();
    return events
      .filter(event => dayjs(event.startDatetime).isAfter(today))
      .sort((a, b) => dayjs(a.startDatetime).diff(dayjs(b.startDatetime)))
      .slice(0, 5);
  }, [events]);

  // Week view handlers
  const handlePrevWeek = useCallback(() => {
    setSelectedDate(prev => prev.subtract(1, 'week'));
  }, []);

  const handleNextWeek = useCallback(() => {
    setSelectedDate(prev => prev.add(1, 'week'));
  }, []);

  const formatTime = useCallback((dateTime) => {
    if (!dateTime) return '';
    return dayjs(dateTime).format('HH:mm');
  }, []);

  // Optimized week view render
  const renderWeekView = useCallback(() => {
    const startOfWeek = selectedDate.startOf('week');
    const endOfWeek = selectedDate.endOf('week');
    const days = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));

    const eventsByDay = days.map(day => {
      return events
        .filter(event => dayjs(event.startDatetime || event.startTime).isSame(day, 'day'))
        .sort((a, b) => dayjs(a.startDatetime || a.startTime).diff(dayjs(b.startDatetime || b.startTime)));
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
                Tuần: {startOfWeek.format('DD/MM')} - {endOfWeek.format('DD/MM')}
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
                styles={{
                  body: { minHeight: '200px', padding: '12px' }
                }}
              >
                {eventsByDay[index].length > 0 ? (
                  eventsByDay[index].map(event => (
                    <Card 
                      key={event.id} 
                      size="small" 
                      style={{ 
                        marginBottom: '8px',
                        cursor: 'pointer',
                        borderColor: getEventColor(event.eventType || event.type)
                      }}
                      onClick={() => showEventDetails(event)}
                    >
                      <Text strong>{event.title}</Text>
                      <div style={{ marginTop: '4px' }}>
                        <Tag color={getEventType(event.eventType || event.type)}>
                          {formatTime(event.startDatetime || event.startTime)} - {formatTime(event.endDatetime || event.endTime)}
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
  }, [selectedDate, events, viewMode, handlePrevWeek, handleNextWeek, formatTime, showEventDetails]);

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
                dataSource={todayEvents}
                locale={{ emptyText: 'Không có lịch học hôm nay' }}
                renderItem={item => (
                  <List.Item 
                    style={{ padding: '8px 0', cursor: 'pointer' }}
                    onClick={() => showEventDetails(item)}
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
                dataSource={upcomingEvents}
                locale={{ emptyText: 'Không có lịch sắp tới' }}
                renderItem={item => (
                  <List.Item 
                    style={{ padding: '8px 0', cursor: 'pointer' }}
                    onClick={() => showEventDetails(item)}
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

      {/* Event Details Modal - Fixed modal state management */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {selectedEvent && getEventIcon(selectedEvent.eventType)}
            <span style={{ marginLeft: '8px' }}>Chi tiết lịch học</span>
          </div>
        }
        open={modalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Đóng
          </Button>
        ]}
        width={600}
        destroyOnClose={true} // Ensures clean modal state
        maskClosable={true}
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
                {dayjs(selectedEvent.startDatetime).format('DD/MM HH:mm')} - {dayjs(selectedEvent.endDatetime).format('HH:mm')}
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