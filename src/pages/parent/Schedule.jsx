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
  Divider
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
  RightOutlined
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
  const [selectedDate, setSelectedDate] = useState(moment().startOf('day'));
  const [eventDetailVisible, setEventDetailVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadScheduleData();
      loadExamData();
    }
  }, [selectedChild, selectedDate]);

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
      
      // Get schedule for the selected month
      const startOfMonth = selectedDate.clone().startOf('month');
      const endOfMonth = selectedDate.clone().endOf('month');
      
      const response = await api.get(`/parent/children/${selectedChild.studentId}/schedule`, {
        params: {
          startDate: startOfMonth.format('YYYY-MM-DD'),
          endDate: endOfMonth.format('YYYY-MM-DD')
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
      const startOfMonth = selectedDate.clone().startOf('month');
      const endOfMonth = selectedDate.clone().endOf('month');
      
      const response = await api.get(`/parent/children/${selectedChild.studentId}/exams`, {
        params: {
          startDate: startOfMonth.format('YYYY-MM-DD'),
          endDate: endOfMonth.format('YYYY-MM-DD')
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
                    <Button 
                      size="small"
                      icon={<LeftOutlined />}
                      onClick={() => {
                        const prevMonth = selectedDate.clone().subtract(1, 'month');
                        setSelectedDate(prevMonth);
                      }}
                    >
                      Tháng trước
                    </Button>
                    <Button 
                      size="small"
                      type="primary"
                      onClick={() => {
                        const today = moment().startOf('day');
                        setSelectedDate(today);
                      }}
                    >
                      Hôm nay
                    </Button>
                    <Button 
                      size="small"
                      icon={<RightOutlined />}
                      onClick={() => {
                        const nextMonth = selectedDate.clone().add(1, 'month');
                        setSelectedDate(nextMonth);
                      }}
                    >
                      Tháng sau
                    </Button>
                  </Space>
                </Space>
              }
              loading={loading}
            >
              <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                <Text strong style={{ fontSize: '16px' }}>
                  {selectedDate.format('MMMM YYYY')}
                </Text>
              </div>
              <Calendar
                dateCellRender={dateCellRender}
                onPanelChange={onPanelChange}
                onSelect={onSelect}
                value={selectedDate}
                mode="month"
                style={{ minHeight: '400px' }}
              />
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
              title="Thống kê tuần này"
              style={{ marginTop: '16px' }}
            >
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                      {scheduleData.filter(event => 
                        moment(event.date).isSame(moment(), 'week')
                      ).length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Tiết học</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>
                      {examData.filter(exam => 
                        moment(exam.examDate).isSame(moment(), 'week')
                      ).length}
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