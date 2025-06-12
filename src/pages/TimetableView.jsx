import {
    BookOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    ExclamationCircleOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Avatar, Badge, Button, Calendar, Card, Descriptions, List, Modal, Select, message } from 'antd';
import moment from 'moment';
import 'moment/locale/vi';
import { useEffect, useState } from 'react';
import TimetableService from '../services/timetableService';

const { Option } = Select;

moment.locale('vi');

const TimetableView = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('month');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate, viewMode]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const startDate = selectedDate.clone().startOf(viewMode).format('YYYY-MM-DD');
      const endDate = selectedDate.clone().endOf(viewMode).format('YYYY-MM-DD');
      
      // Use TimetableService to fetch schedule
      const data = await TimetableService.getTimetable({
        startDate,
        endDate,
        view: viewMode
      });
      setEvents(data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      message.error('Không thể tải lịch học');
    } finally {
      setLoading(false);
    }
  };

  const getListData = (value) => {
    const dateEvents = events.filter(event => 
      moment(event.startTime).format('YYYY-MM-DD') === value.format('YYYY-MM-DD')
    );
    
    return dateEvents.map(event => ({
      type: getEventType(event.type),
      content: event.title,
      event: event
    }));
  };

  const getEventType = (type) => {
    switch (type) {
      case 'CLASS':
        return 'success';
      case 'EXAM':
        return 'error';
      case 'ASSIGNMENT':
        return 'warning';
      case 'EVENT':
        return 'default';
      default:
        return 'default';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'CLASS':
        return <BookOutlined />;
      case 'EXAM':
        return <ExclamationCircleOutlined />;
      case 'ASSIGNMENT':
        return <ClockCircleOutlined />;
      case 'EVENT':
        return <CalendarOutlined />;
      default:
        return <CalendarOutlined />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'CLASS':
        return '#52c41a';
      case 'EXAM':
        return '#f5222d';
      case 'ASSIGNMENT':
        return '#faad14';
      case 'EVENT':
        return '#1890ff';
      default:
        return '#1890ff';
    }
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
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
    const today = moment().format('YYYY-MM-DD');
    return events.filter(event => 
      moment(event.startTime).format('YYYY-MM-DD') === today
    );
  };

  const getUpcomingEvents = () => {
    const today = moment();
    return events
      .filter(event => moment(event.startTime).isAfter(today))
      .sort((a, b) => moment(a.startTime).diff(moment(b.startTime)))
      .slice(0, 5);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Main Calendar */}
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
            dateCellRender={dateCellRender}
            value={selectedDate}
            onSelect={setSelectedDate}
            onPanelChange={(value, mode) => {
              setSelectedDate(value);
              setViewMode(mode);
            }}
          />
        </Card>

        {/* Sidebar */}
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
                        {moment(item.startTime).format('HH:mm')} - {moment(item.endTime).format('HH:mm')}
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
                        {moment(item.startTime).format('DD/MM - HH:mm')}
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
      </div>

      {/* Event Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {selectedEvent && getEventIcon(selectedEvent.type)}
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
                  icon={getEventIcon(selectedEvent.type)} 
                  style={{ backgroundColor: getEventColor(selectedEvent.type) }}
                  size="small"
                />
                <span style={{ marginLeft: '8px' }}>
                  {selectedEvent.type === 'CLASS' ? 'Lớp học' :
                   selectedEvent.type === 'EXAM' ? 'Kiểm tra/Thi' :
                   selectedEvent.type === 'ASSIGNMENT' ? 'Bài tập' : 'Sự kiện'}
                </span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ClockCircleOutlined style={{ marginRight: '8px' }} />
                {moment(selectedEvent.startTime).format('DD/MM/YYYY HH:mm')} - {moment(selectedEvent.endTime).format('HH:mm')}
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
