import React, { useState, useEffect } from 'react';
import {
  Card,
  Calendar,
  Badge,
  List,
  Typography,
  Space,
  Spin,
  Alert,
  Button,
  Select,
  Row,
  Col,
  Tag,
  Tooltip,
  Empty,
  Modal,
  Divider,
  Radio
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  BookOutlined,
  UserOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  LeftOutlined,
  RightOutlined,
  AppstoreOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import moment from 'moment';
import 'moment/locale/vi';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Configure moment.js
moment.locale('vi');
moment.suppressDeprecationWarnings = true;

/**
 * Parent Schedule Page - View children's timetable and exam schedule
 * Based on PARENT_ROLE_SPEC.md Phase 2 requirements
 */
const ParentSchedule = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [examData, setExamData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [eventDetailVisible, setEventDetailVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadScheduleData();
      loadExamData();
    }
  }, [selectedChild, selectedDate, viewMode]);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const response = await api.get('/parent/children');
      setChildren(response.data);
      
      if (response.data.length > 0) {
        setSelectedChild(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleData = async () => {
    if (!selectedChild) return;

    try {
      setLoading(true);

      // Get schedule for the selected period (month or week)
      let startDate, endDate;
      if (viewMode === 'week') {
        startDate = selectedDate.clone().startOf('week');
        endDate = selectedDate.clone().endOf('week');
      } else {
        startDate = selectedDate.clone().startOf('month');
        endDate = selectedDate.clone().endOf('month');
      }

      const response = await api.get(`/parent/children/${selectedChild.studentId}/schedule`, {
        params: {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD')
        }
      });
      setScheduleData(response.data || []);
    } catch (error) {
      console.error('Error loading schedule:', error);
      setScheduleData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadExamData = async () => {
    if (!selectedChild) return;

    try {
      // Get exam data for the selected period (month or week)
      let startDate, endDate;
      if (viewMode === 'week') {
        startDate = selectedDate.clone().startOf('week');
        endDate = selectedDate.clone().endOf('week');
      } else {
        startDate = selectedDate.clone().startOf('month');
        endDate = selectedDate.clone().endOf('month');
      }

      const response = await api.get(`/parent/children/${selectedChild.studentId}/exams`, {
        params: {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD')
        }
      });

      setExamData(response.data || []);
    } catch (error) {
      console.error('Error loading exam data:', error);
      setExamData([]);
    }
  };

  const getEventsForDate = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    
    const scheduleEvents = scheduleData.filter(event => 
      moment(event.date).format('YYYY-MM-DD') === dateStr
    );
    
    const examEvents = examData.filter(exam => 
      moment(exam.examDate).format('YYYY-MM-DD') === dateStr
    );

    return [...scheduleEvents, ...examEvents];
  };

  const getEventTypeColor = (event) => {
    if (event.examDate) return 'red'; // Exam
    if (event.type === 'class') return 'blue'; // Regular class
    if (event.type === 'assignment') return 'orange'; // Assignment due
    return 'green'; // Other
  };

  const getEventTypeIcon = (event) => {
    if (event.examDate) return '📝'; // Exam
    if (event.type === 'class') return '📚'; // Regular class
    if (event.type === 'assignment') return '📋'; // Assignment due
    return '📅'; // Other
  };

  const dateCellRender = (value) => {
    const events = getEventsForDate(value);
    
    return (
      <div style={{ minHeight: '60px' }}>
        {events.slice(0, 3).map((event, index) => (
          <div
            key={index}
            style={{
              fontSize: '11px',
              padding: '1px 4px',
              margin: '1px 0',
              borderRadius: '3px',
              backgroundColor: getEventTypeColor(event) === 'red' ? '#ffebee' : 
                             getEventTypeColor(event) === 'blue' ? '#e3f2fd' : '#f3e5f5',
              color: getEventTypeColor(event) === 'red' ? '#c62828' : 
                     getEventTypeColor(event) === 'blue' ? '#1565c0' : '#7b1fa2',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
            onClick={() => {
              setSelectedEvent(event);
              setEventDetailVisible(true);
            }}
          >
            {getEventTypeIcon(event)} {event.title || event.subject || event.examName}
          </div>
        ))}
        {events.length > 3 && (
          <div style={{ fontSize: '10px', color: '#666', textAlign: 'center' }}>
            +{events.length - 3} khác
          </div>
        )}
      </div>
    );
  };


  const onPanelChange = (value, mode) => {
    // Chỉ cho phép thay đổi ngày, không cho phép thay đổi mode
    setSelectedDate(value);
  };

  const onSelect = (value) => {
    setSelectedDate(value);
    const events = getEventsForDate(value);
    if (events.length > 0) {
      setSelectedEvent(events[0]);
      setEventDetailVisible(true);
    }
  };

  // Render week view
  const renderWeekView = () => {
    const startOfWeek = selectedDate.clone().startOf('week');
    const weekDays = [];

    for (let i = 0; i < 7; i++) {
      const day = startOfWeek.clone().add(i, 'days');
      const dayEvents = getEventsForDate(day);
      const isToday = day.isSame(moment(), 'day');
      const isSelected = day.isSame(selectedDate, 'day');

      weekDays.push({
        date: day,
        events: dayEvents,
        isToday,
        isSelected
      });
    }

    return (
      <div style={{ padding: '16px' }}>
        {/* Week header */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <Text strong style={{ fontSize: '14px', color: '#666' }}>
            {startOfWeek.format('DD/MM')} - {startOfWeek.clone().add(6, 'days').format('DD/MM/YYYY')}
          </Text>
        </div>

        <Row gutter={[4, 4]}>
          {weekDays.map((dayData, index) => (
            <Col key={index} xs={24} sm={12} md={8} lg={24/7} style={{ minHeight: '300px' }}>
              <div
                style={{
                  border: dayData.isToday ? '2px solid #1890ff' :
                          dayData.isSelected ? '2px solid #52c41a' : '1px solid #d9d9d9',
                  borderRadius: '6px',
                  backgroundColor: dayData.isToday ? '#f0f8ff' :
                                  dayData.isSelected ? '#f6ffed' : '#fff',
                  height: '100%',
                  minHeight: '280px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSelectedDate(dayData.date)}
              >
                {/* Day header */}
                <div
                  style={{
                    padding: '8px',
                    borderBottom: '1px solid #f0f0f0',
                    textAlign: 'center',
                    backgroundColor: dayData.isToday ? '#e6f7ff' :
                                    dayData.isSelected ? '#f0f9ff' : '#fafafa'
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {dayData.date.format('ddd')}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: dayData.isToday || dayData.isSelected ? 'bold' : 'normal',
                    color: dayData.isToday ? '#1890ff' :
                           dayData.isSelected ? '#52c41a' : '#000'
                  }}>
                    {dayData.date.format('DD')}
                  </div>
                </div>

                {/* Events */}
                <div style={{ padding: '4px', height: 'calc(100% - 60px)', overflow: 'hidden' }}>
                  {dayData.events.slice(0, 4).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      style={{
                        fontSize: '10px',
                        padding: '2px 4px',
                        margin: '2px 0',
                        borderRadius: '3px',
                        backgroundColor: getEventTypeColor(event) === 'red' ? '#ffebee' :
                                       getEventTypeColor(event) === 'blue' ? '#e3f2fd' : '#f3e5f5',
                        color: getEventTypeColor(event) === 'red' ? '#c62828' :
                               getEventTypeColor(event) === 'blue' ? '#1565c0' : '#7b1fa2',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Ngăn click bubble lên day container
                        setSelectedEvent(event);
                        setEventDetailVisible(true);
                      }}
                    >
                      {getEventTypeIcon(event)} {event.title || event.subject || event.examName}
                    </div>
                  ))}
                  {dayData.events.length > 4 && (
                    <div style={{ fontSize: '9px', color: '#666', textAlign: 'center', marginTop: '4px' }}>
                      +{dayData.events.length - 4} khác
                    </div>
                  )}
                  {dayData.events.length === 0 && (
                    <div style={{
                      fontSize: '10px',
                      color: '#ccc',
                      textAlign: 'center',
                      marginTop: '20px',
                      fontStyle: 'italic'
                    }}>
                      Không có lịch
                    </div>
                  )}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  const renderTodaySchedule = () => {
    const todayEvents = getEventsForDate(moment());
    const selectedDateEvents = getEventsForDate(selectedDate);
    const isToday = selectedDate.isSame(moment(), 'day');
    const displayEvents = isToday ? todayEvents : selectedDateEvents;

    if (displayEvents.length === 0) {
      return (
        <Empty
          description={isToday ? "Không có lịch học hôm nay" : `Không có lịch học ngày ${selectedDate.format('DD/MM/YYYY')}`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <List
        dataSource={displayEvents}
        renderItem={(event) => (
          <List.Item
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedEvent(event);
              setEventDetailVisible(true);
            }}
          >
            <List.Item.Meta
              avatar={
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: getEventTypeColor(event) === 'red' ? '#ffcdd2' :
                                  getEventTypeColor(event) === 'blue' ? '#bbdefb' : '#e1bee7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  {getEventTypeIcon(event)}
                </div>
              }
              title={
                <Space>
                  <Text strong>{event.title || event.subject || event.examName}</Text>
                  <Tag color={getEventTypeColor(event)}>
                    {event.examDate ? 'Kiểm tra' : event.type === 'class' ? 'Lớp học' : 'Khác'}
                  </Tag>
                </Space>
              }
              description={
                <Space direction="vertical" size={2}>
                  <Space size={16}>
                    <Text type="secondary">
                      <ClockCircleOutlined /> {event.startTime || event.examTime} - {event.endTime || ''}
                    </Text>
                    {event.classroom && (
                      <Text type="secondary">
                        <EnvironmentOutlined /> {event.classroom}
                      </Text>
                    )}
                  </Space>
                  {event.teacher && (
                    <Text type="secondary">
                      <UserOutlined /> {event.teacher}
                    </Text>
                  )}
                </Space>
              }
            />
          </List.Item>
        )}
      />
    );
  };


  const renderEventDetail = () => {
    if (!selectedEvent) return null;

    return (
      <Modal
        title={
          <Space>
            <span style={{ fontSize: '20px' }}>{getEventTypeIcon(selectedEvent)}</span>
            <span>{selectedEvent.title || selectedEvent.subject || selectedEvent.examName}</span>
          </Space>
        }
        open={eventDetailVisible}
        onCancel={() => setEventDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setEventDetailVisible(false)}>
            Đóng
          </Button>
        ]}
        width={500}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Row gutter={[16, 8]}>
            <Col span={8}>
              <Text strong>Ngày:</Text>
            </Col>
            <Col span={16}>
              <Text>{moment(selectedEvent.date || selectedEvent.examDate).format('dddd, DD/MM/YYYY')}</Text>
            </Col>
          </Row>

          <Row gutter={[16, 8]}>
            <Col span={8}>
              <Text strong>Thời gian:</Text>
            </Col>
            <Col span={16}>
              <Text>
                {selectedEvent.startTime || selectedEvent.examTime}
                {selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
              </Text>
            </Col>
          </Row>

          {selectedEvent.classroom && (
            <Row gutter={[16, 8]}>
              <Col span={8}>
                <Text strong>Phòng học:</Text>
              </Col>
              <Col span={16}>
                <Text>{selectedEvent.classroom}</Text>
              </Col>
            </Row>
          )}

          {selectedEvent.teacher && (
            <Row gutter={[16, 8]}>
              <Col span={8}>
                <Text strong>Giáo viên:</Text>
              </Col>
              <Col span={16}>
                <Text>{selectedEvent.teacher}</Text>
              </Col>
            </Row>
          )}

          {selectedEvent.description && (
            <>
              <Divider />
              <div>
                <Text strong>Mô tả:</Text>
                <Paragraph style={{ marginTop: 8 }}>
                  {selectedEvent.description}
                </Paragraph>
              </div>
            </>
          )}

          {selectedEvent.examDate && (
            <>
              <Divider />
              <Alert
                message="Lưu ý kiểm tra"
                description="Hãy nhắc nhở con chuẩn bị tốt cho bài kiểm tra này."
                type="info"
                showIcon
              />
            </>
          )}
        </Space>
      </Modal>
    );
  };

  if (loading && children.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Đang tải lịch học...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                <CalendarOutlined /> Lịch học của con
              </Title>
              <Text type="secondary">
                Xem lịch học và lịch kiểm tra của con em
              </Text>
            </div>
            <Space>
              <Select
                style={{ width: 200 }}
                placeholder="Chọn con"
                value={selectedChild?.studentId}
                onChange={(value) => {
                  const child = children.find(c => c.studentId === value);
                  setSelectedChild(child);
                }}
              >
                {children.map(child => (
                  <Option key={child.studentId} value={child.studentId}>
                    {child.student?.fullName}
                  </Option>
                ))}
              </Select>
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => {
                  loadScheduleData();
                  loadExamData();
                }}
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
          </Space>
        </Col>
      </Row>

      {!selectedChild ? (
        <Card>
          <Empty 
            description="Vui lòng chọn con để xem lịch học"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {/* Calendar */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span>{`Lịch học của ${selectedChild.student?.fullName}`}</span>
                  <Space>
                    {/* View Mode Toggle */}
                    <Radio.Group
                      value={viewMode}
                      onChange={(e) => setViewMode(e.target.value)}
                      size="small"
                      style={{ marginRight: '8px' }}
                    >
                      <Radio.Button value="month">
                        <AppstoreOutlined /> Tháng
                      </Radio.Button>
                      <Radio.Button value="week">
                        <UnorderedListOutlined /> Tuần
                      </Radio.Button>
                    </Radio.Group>

                    <Button
                      size="small"
                      icon={<LeftOutlined />}
                      onClick={() => {
                        const prev = viewMode === 'week'
                          ? selectedDate.clone().subtract(1, 'week')
                          : selectedDate.clone().subtract(1, 'month');
                        setSelectedDate(prev);
                      }}
                    >
                      {viewMode === 'week' ? 'Tuần trước' : 'Tháng trước'}
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        const today = moment();
                        setSelectedDate(today);
                      }}
                    >
                      Hôm nay
                    </Button>
                    <Button
                      size="small"
                      icon={<RightOutlined />}
                      onClick={() => {
                        const next = viewMode === 'week'
                          ? selectedDate.clone().add(1, 'week')
                          : selectedDate.clone().add(1, 'month');
                        setSelectedDate(next);
                      }}
                    >
                      {viewMode === 'week' ? 'Tuần sau' : 'Tháng sau'}
                    </Button>
                  </Space>
                </Space>
              }
              loading={loading}
            >
              <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                <Text strong style={{ fontSize: '16px' }}>
                  {viewMode === 'week'
                    ? `Tuần ${selectedDate.clone().startOf('week').format('DD/MM')} - ${selectedDate.clone().endOf('week').format('DD/MM/YYYY')}`
                    : `Tháng ${selectedDate.format('MM/YYYY')}`
                  }
                </Text>
              </div>

              {viewMode === 'month' ? (
                <div>
                  <Calendar
                    dateCellRender={dateCellRender}
                    onPanelChange={(value) => {
                      setSelectedDate(value);
                    }}
                    onSelect={onSelect}
                    value={selectedDate}
                    mode="month"
                    validRange={[moment().subtract(2, 'years'), moment().add(2, 'years')]}
                    headerRender={() => null}
                    disabledDate={false}
                    style={{ minHeight: '400px' }}
                  />
                </div>
              ) : (
                renderWeekView()
              )}
            </Card>
          </Col>

          {/* Selected Date Schedule */}
          <Col xs={24} lg={8}>
            <Card 
              title={
                <Space>
                  <ClockCircleOutlined />
                  <span>
                    {selectedDate.isSame(moment(), 'day') 
                      ? 'Lịch hôm nay' 
                      : `Lịch ngày ${selectedDate.format('DD/MM')}`
                    }
                  </span>
                  <Badge 
                    count={getEventsForDate(selectedDate).length} 
                    style={{ backgroundColor: '#52c41a' }}
                  />
                </Space>
              }
              style={{ height: 'fit-content' }}
            >
              {renderTodaySchedule()}
            </Card>

            {/* Quick Stats */}
            <Card
              title={`Thống kê ${viewMode === 'week' ? 'tuần này' : 'tháng này'}`}
              style={{ marginTop: '16px' }}
            >
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                      {scheduleData.filter(event => {
                        const eventDate = moment(event.date);
                        return viewMode === 'week'
                          ? eventDate.isSame(selectedDate, 'week')
                          : eventDate.isSame(selectedDate, 'month');
                      }).length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Tiết học</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>
                      {examData.filter(exam => {
                        const examDate = moment(exam.examDate);
                        return viewMode === 'week'
                          ? examDate.isSame(selectedDate, 'week')
                          : examDate.isSame(selectedDate, 'month');
                      }).length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Kiểm tra</div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      {/* Event Detail Modal */}
      {renderEventDetail()}
    </div>
  );
};

export default ParentSchedule;