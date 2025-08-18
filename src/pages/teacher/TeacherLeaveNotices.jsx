import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  List, 
  Space, 
  Tag, 
  Alert, 
  Spin,
  Modal,
  Divider,
  Badge,
  Empty,
  message
} from 'antd';
import { 
  CalendarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import moment from 'moment';

const { Title, Text } = Typography;

/**
 * Teacher Leave Notices Page - View leave requests from parents (READ-ONLY)
 * Based on ParentRequestsModule but simplified for viewing only
 */
const TeacherLeaveNotices = () => {
  const { user } = useAuth();
  const [leaveNotices, setLeaveNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Load leave notices on component mount
  useEffect(() => {
    loadLeaveNotices();
  }, []);

  const loadLeaveNotices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teacher/leave-notices');
      console.log('Teacher leave notices response:', response.data);
      if (response.data?.length > 0) {
        console.log('First notice createdAt:', response.data[0].createdAt);
        console.log('First notice full object:', response.data[0]);
        console.log('Student field:', response.data[0].student);
        console.log('StudentName field:', response.data[0].studentName);
      }
      
      // Enrich data with student names from API
      const enrichedNotices = await Promise.all(
        (response.data || []).map(async (notice) => {
          if (!notice.studentName) {
            try {
              // Try to get student name from user API
              const studentResponse = await api.get(`/users/${notice.studentId}`);
              const student = studentResponse.data;
              notice.studentName = student?.fullName || student?.name || `Học sinh ID: ${notice.studentId}`;
            } catch (error) {
              console.warn(`Could not fetch student name for ID ${notice.studentId}:`, error);
              notice.studentName = `Học sinh ID: ${notice.studentId}`;
            }
          }
          return notice;
        })
      );
      setLeaveNotices(enrichedNotices || []);
    } catch (error) {
      console.error('Error loading leave notices:', error);
      message.error('Không thể tải danh sách thông báo nghỉ học');
      setLeaveNotices([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format LocalDateTime array from Java to readable date
  const formatCreatedAt = (createdAtArray) => {
    try {
      if (Array.isArray(createdAtArray) && createdAtArray.length >= 6) {
        // Java LocalDateTime array format: [year, month, day, hour, minute, second, nano]
        const [year, month, day, hour, minute, second] = createdAtArray;
        // Note: month is 1-based in Java, but 0-based in JavaScript Date
        const date = new Date(year, month - 1, day, hour, minute, second);
        return moment(date).format('DD/MM/YYYY HH:mm');
      }
      return 'Chưa xác định';
    } catch (error) {
      console.error('Error formatting createdAt:', error);
      return 'Chưa xác định';
    }
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      FULL_DAY: 'red',
      LATE: 'orange', 
      EARLY: 'blue'
    };
    return colors[type] || 'default';
  };

  const getLeaveTypeIcon = (type) => {
    const icons = {
      FULL_DAY: <CalendarOutlined />,
      LATE: <ClockCircleOutlined />,
      EARLY: <ClockCircleOutlined />
    };
    return icons[type] || <CalendarOutlined />;
  };

  const getLeaveTypeText = (type) => {
    const texts = {
      FULL_DAY: 'Nghỉ cả ngày',
      LATE: 'Đến muộn',
      EARLY: 'Về sớm'
    };
    return texts[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      SENT: 'processing',
      DELIVERED: 'warning', 
      ACKNOWLEDGED: 'success'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      SENT: 'Đã gửi',
      DELIVERED: 'Đã chuyển đến',
      ACKNOWLEDGED: 'Đã xác nhận'
    };
    return texts[status] || status;
  };

  const getReasonText = (reasonCode) => {
    const reasons = {
      SICK: 'Ốm đau',
      FAMILY: 'Việc gia đình',
      APPOINTMENT: 'Có hẹn khám bệnh',
      EMERGENCY: 'Khẩn cấp',
      OTHER: 'Lý do khác'
    };
    return reasons[reasonCode] || reasonCode;
  };

  const getReasonColor = (reasonCode) => {
    const colors = {
      SICK: 'red',
      FAMILY: 'blue',
      APPOINTMENT: 'green', 
      EMERGENCY: 'orange',
      OTHER: 'default'
    };
    return colors[reasonCode] || 'default';
  };

  const showNoticeDetail = (notice) => {
    setSelectedNotice(notice);
    setDetailModalVisible(true);
  };

  const isToday = (date) => {
    return moment(date).isSame(moment(), 'day');
  };

  const isUrgent = (notice) => {
    return isToday(notice.date) && notice.status === 'SENT';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Đang tải thông báo nghỉ học...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <CalendarOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
              Thông báo nghỉ học từ phụ huynh
            </Title>
            <Text type="secondary">
              Xem các thông báo nghỉ học từ phụ huynh trong lớp của bạn
            </Text>
          </div>
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {leaveNotices.length}
              </div>
              <div>Tổng thông báo</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {leaveNotices.filter(n => n.status === 'ACKNOWLEDGED').length}
              </div>
              <div>Đã xác nhận</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {leaveNotices.filter(n => isToday(n.date)).length}
              </div>
              <div>Hôm nay</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Leave Notices List */}
      <Card>
        {leaveNotices.length > 0 ? (
          <List
            dataSource={leaveNotices}
            renderItem={(notice) => {
              const urgent = isUrgent(notice);
              
              return (
                <List.Item
                  style={{ 
                    border: urgent ? '2px solid #ff4d4f' : '1px solid #f0f0f0',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    padding: '16px',
                    backgroundColor: urgent ? '#fff2f0' : 'white'
                  }}
                  actions={[
                    <a key="view" onClick={() => showNoticeDetail(notice)}>
                      <EyeOutlined /> Xem chi tiết
                    </a>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot={urgent} offset={[-8, 8]}>
                        <div style={{ 
                          width: '48px', 
                          height: '48px', 
                          borderRadius: '50%', 
                          backgroundColor: getLeaveTypeColor(notice.type),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '20px'
                        }}>
                          {getLeaveTypeIcon(notice.type)}
                        </div>
                      </Badge>
                    }
                    title={
                      <div>
                        <Space>
                          <Text strong>{notice.studentName || `Học sinh ID: ${notice.studentId}`}</Text>
                          <Tag color={getLeaveTypeColor(notice.type)}>
                            {getLeaveTypeText(notice.type)}
                          </Tag>
                          <Tag color={getStatusColor(notice.status)}>
                            {getStatusText(notice.status)}
                          </Tag>
                          {urgent && (
                            <Tag color="red">Hôm nay</Tag>
                          )}
                        </Space>
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: '4px' }}>
                          <CalendarOutlined style={{ marginRight: '4px' }} />
                          <Text strong>{moment(notice.date).format('DD/MM/YYYY')}</Text>
                          {notice.arriveAt && (
                            <Text> - Đến lúc {notice.arriveAt}</Text>
                          )}
                          {notice.leaveAt && (
                            <Text> - Về lúc {notice.leaveAt}</Text>
                          )}
                        </div>
                        <div style={{ marginBottom: '4px' }}>
                          <Tag color={getReasonColor(notice.reasonCode)} size="small">
                            {getReasonText(notice.reasonCode)}
                          </Tag>
                        </div>
                        {notice.note && (
                          <Text type="secondary" ellipsis>
                            {notice.note}
                          </Text>
                        )}
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                          <UserOutlined style={{ marginRight: '4px' }} />
                          Gửi lúc: {notice.createdAt ? formatCreatedAt(notice.createdAt) : 'Chưa xác định'}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty 
            description="Chưa có thông báo nghỉ học nào từ phụ huynh"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <span>Chi tiết thông báo nghỉ học</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedNotice && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Học sinh:</Text>
                <br />
                <Text>{selectedNotice.studentName || `Học sinh ID: ${selectedNotice.studentId}`}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Loại thông báo:</Text>
                <br />
                <Tag color={getLeaveTypeColor(selectedNotice.type)}>
                  {getLeaveTypeText(selectedNotice.type)}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>Ngày:</Text>
                <br />
                <Text>{moment(selectedNotice.date).format('DD/MM/YYYY')}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Trạng thái:</Text>
                <br />
                <Tag color={getStatusColor(selectedNotice.status)}>
                  {getStatusText(selectedNotice.status)}
                </Tag>
              </Col>
              {selectedNotice.arriveAt && (
                <Col span={12}>
                  <Text strong>Giờ đến:</Text>
                  <br />
                  <Text>{selectedNotice.arriveAt}</Text>
                </Col>
              )}
              {selectedNotice.leaveAt && (
                <Col span={12}>
                  <Text strong>Giờ về:</Text>
                  <br />
                  <Text>{selectedNotice.leaveAt}</Text>
                </Col>
              )}
              <Col span={24}>
                <Text strong>Lý do:</Text>
                <br />
                <Tag color={getReasonColor(selectedNotice.reasonCode)}>
                  {getReasonText(selectedNotice.reasonCode)}
                </Tag>
              </Col>
              {selectedNotice.note && (
                <Col span={24}>
                  <Text strong>Ghi chú:</Text>
                  <br />
                  <Text>{selectedNotice.note}</Text>
                </Col>
              )}
              <Col span={24}>
                <Divider />
                <Text strong>Thông tin gửi:</Text>
                <br />
                <Text type="secondary">
                  Gửi lúc: {selectedNotice.createdAt ? formatCreatedAt(selectedNotice.createdAt) : 'Chưa xác định'}
                </Text>
                {selectedNotice.ackAt && (
                  <>
                    <br />
                    <Text type="secondary">
                      Xác nhận lúc: {moment(selectedNotice.ackAt).format('DD/MM/YYYY HH:mm')}
                    </Text>
                    {selectedNotice.ackByTeacher && (
                      <>
                        <br />
                        <Text type="secondary">
                          Xác nhận bởi: {selectedNotice.ackByTeacher}
                        </Text>
                      </>
                    )}
                  </>
                )}
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherLeaveNotices;