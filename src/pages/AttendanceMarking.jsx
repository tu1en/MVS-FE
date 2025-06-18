import { CheckCircleOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Button, Card, List, message, Modal, Space, Spin, Tag, Typography } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;

/**
 * AttendanceMarking component for students to mark attendance
 * @returns {JSX.Element} AttendanceMarking component
 */
function AttendanceMarking() {
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [locationModal, setLocationModal] = useState(false);

  // Get user info from localStorage
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (userId && token) {
      fetchActiveSessions();
      getCurrentLocation();
    }
  }, [userId, token]);

  const fetchActiveSessions = async () => {
    try {
      // Get student's classrooms first
      const classroomsResponse = await axios.get(`/api/classrooms/student/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const classrooms = classroomsResponse.data;
      const allSessions = [];
      
      // Fetch active sessions for each classroom
      for (const classroom of classrooms) {
        try {
          const sessionsResponse = await axios.get(`/api/attendance/sessions/classroom/${classroom.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          // Filter only active sessions
          const activeSessions = sessionsResponse.data.filter(session => 
            session.status === 'ACTIVE' || session.status === 'SCHEDULED'
          );
          
          allSessions.push(...activeSessions.map(session => ({
            ...session,
            classroomName: classroom.name
          })));
        } catch (error) {
          console.error(`Error fetching sessions for classroom ${classroom.id}:`, error);
        }
      }
      
      setActiveSessions(allSessions);
    } catch (error) {
      message.error('Không thể tải danh sách buổi học');
      console.error('Error fetching active sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          message.warning('Không thể lấy vị trí hiện tại. Một số tính năng có thể bị hạn chế.');
        }
      );
    } else {
      message.warning('Trình duyệt không hỗ trợ định vị.');
    }
  };

  const validateLocation = async (sessionId, userLat, userLon, sessionLat, sessionLon, radius) => {
    try {
      const response = await axios.get('/api/attendance/validate/location', {
        params: {
          userLat,
          userLon,
          sessionLat,
          sessionLon,
          radius
        },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error validating location:', error);
      return false;
    }
  };

  const markAttendance = async (session) => {
    if (!location) {
      setLocationModal(true);
      return;
    }

    setMarkingAttendance(true);
    
    try {
      // Validate location if session has location requirements
      if (session.locationLatitude && session.locationLongitude) {
        const isValidLocation = await validateLocation(
          session.id,
          location.latitude,
          location.longitude,
          session.locationLatitude,
          session.locationLongitude,
          session.locationRadius || 100
        );

        if (!isValidLocation) {
          message.error('Bạn không ở trong phạm vi cho phép để điểm danh');
          return;
        }
      }

      // Mark attendance
      await axios.post('/api/attendance/mark', null, {
        params: {
          sessionId: session.id,
          userId: userId,
          latitude: location.latitude,
          longitude: location.longitude
        },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      message.success('Điểm danh thành công!');
      fetchActiveSessions(); // Refresh to update status
    } catch (error) {
      console.error('Error marking attendance:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Có lỗi xảy ra khi điểm danh');
      }
    } finally {
      setMarkingAttendance(false);
    }
  };

  const getSessionStatus = (session) => {
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);

    if (now < startTime) {
      return { status: 'scheduled', color: 'blue', text: 'Sắp diễn ra' };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'active', color: 'green', text: 'Đang diễn ra' };
    } else {
      return { status: 'ended', color: 'default', text: 'Đã kết thúc' };
    }
  };

  const handleLocationModalOk = () => {
    getCurrentLocation();
    setLocationModal(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải danh sách buổi học...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2}>Điểm danh</Title>
          <Text type="secondary">
            Điểm danh các buổi học đang diễn ra
          </Text>
        </div>

        {/* Location Status */}
        <Card size="small">
          <Space>
            <EnvironmentOutlined />
            <Text>Trạng thái vị trí: </Text>
            {location ? (
              <Tag color="green">Đã xác định vị trí</Tag>
            ) : (
              <Tag color="red">Chưa xác định vị trí</Tag>
            )}
            {!location && (
              <Button size="small" onClick={getCurrentLocation}>
                Lấy vị trí
              </Button>
            )}
          </Space>
        </Card>

        {/* Active Sessions */}
        <Card title={`Buổi học có thể điểm danh (${activeSessions.length})`}>
          {activeSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <ClockCircleOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">Hiện tại không có buổi học nào để điểm danh</Text>
              </div>
            </div>
          ) : (
            <List
              dataSource={activeSessions}
              renderItem={(session) => {
                const { status, color, text } = getSessionStatus(session);
                const canMarkAttendance = status === 'active';
                
                return (
                  <List.Item>
                    <Card 
                      style={{ width: '100%' }}
                      size="small"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <Space direction="vertical" size="small">
                            <div>
                              <Text strong>{session.title}</Text>
                              <Tag color="blue" style={{ marginLeft: 8 }}>
                                {session.classroomName}
                              </Tag>
                            </div>
                            
                            <Text type="secondary">{session.description}</Text>
                            
                            <Space>
                              <ClockCircleOutlined />
                              <Text type="secondary">
                                {new Date(session.startTime).toLocaleString('vi-VN')} - 
                                {new Date(session.endTime).toLocaleString('vi-VN')}
                              </Text>
                            </Space>

                            {session.locationLatitude && session.locationLongitude && (
                              <Space>
                                <EnvironmentOutlined />
                                <Text type="secondary">
                                  Yêu cầu điểm danh tại vị trí cụ thể (bán kính {session.locationRadius || 100}m)
                                </Text>
                              </Space>
                            )}
                          </Space>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ marginBottom: 8 }}>
                            <Tag color={color}>{text}</Tag>
                          </div>
                          
                          <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            disabled={!canMarkAttendance}
                            loading={markingAttendance}
                            onClick={() => markAttendance(session)}
                          >
                            {canMarkAttendance ? 'Điểm danh' : 'Không thể điểm danh'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                );
              }}
            />
          )}
        </Card>

        {/* Location Permission Modal */}
        <Modal
          title="Yêu cầu quyền truy cập vị trí"
          open={locationModal}
          onOk={handleLocationModalOk}
          onCancel={() => setLocationModal(false)}
          okText="Cho phép"
          cancelText="Hủy"
        >
          <Space direction="vertical" size="middle">
            <div>
              <EnvironmentOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              <Text style={{ marginLeft: 8 }}>
                Ứng dụng cần quyền truy cập vị trí để xác minh bạn có mặt tại lớp học.
              </Text>
            </div>
            <Text type="secondary">
              Vị trí của bạn chỉ được sử dụng để điểm danh và không được lưu trữ.
            </Text>
          </Space>
        </Modal>
      </Space>
    </div>
  );
}

export default AttendanceMarking;
