import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  List, 
  Button, 
  Avatar, 
  Switch, 
  Space, 
  Tag, 
  Alert, 
  Spin,
  Modal,
  Input,
  Select,
  message,
  Divider,
  Badge,
  FloatButton,
  Drawer
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  UserOutlined, 
  ClockCircleOutlined,
  EditOutlined,
  SaveOutlined,
  PhoneOutlined,
  MessageOutlined,
  TeamOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
  SendOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const TAAttendanceModule = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionTime, setSessionTime] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load data on mount
  useEffect(() => {
    if (classId) {
      loadClassData();
      loadStudents();
    }
  }, [classId]);

  const loadClassData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      // Mock data for now - would fetch from API
      setClassData({
        id: classId,
        name: 'Lập trình Java cơ bản',
        subject: 'Java Programming',
        teacher: { fullName: 'Nguyễn Văn A' }
      });
    } catch (error) {
      console.error('Error loading class data:', error);
      message.error('Không thể tải thông tin lớp học');
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Mock data - would fetch from API
      const mockStudents = [
        { id: 1, fullName: 'Trần Văn A', email: 'a@student.com', studentCode: 'SV001' },
        { id: 2, fullName: 'Lê Thị B', email: 'b@student.com', studentCode: 'SV002' },
        { id: 3, fullName: 'Phạm Văn C', email: 'c@student.com', studentCode: 'SV003' },
        { id: 4, fullName: 'Nguyễn Thị D', email: 'd@student.com', studentCode: 'SV004' },
        { id: 5, fullName: 'Võ Văn E', email: 'e@student.com', studentCode: 'SV005' }
      ];
      
      setStudents(mockStudents);
      
      // Initialize attendance data
      const initialAttendance = {};
      mockStudents.forEach(student => {
        initialAttendance[student.id] = {
          status: 'present',
          note: '',
          time: null
        };
      });
      setAttendanceData(initialAttendance);
      
    } catch (error) {
      console.error('Error loading students:', error);
      message.error('Không thể tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  const startAttendanceSession = () => {
    setSessionStarted(true);
    setSessionTime(new Date());
    message.success('Đã bắt đầu phiên điểm danh');
  };

  const updateAttendanceStatus = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        time: new Date()
      }
    }));
  };

  const openNoteModal = (student) => {
    setSelectedStudent(student);
    setCurrentNote(attendanceData[student.id]?.note || '');
    setNoteModalVisible(true);
  };

  const saveNote = () => {
    if (selectedStudent) {
      setAttendanceData(prev => ({
        ...prev,
        [selectedStudent.id]: {
          ...prev[selectedStudent.id],
          note: currentNote
        }
      }));
      setNoteModalVisible(false);
      setSelectedStudent(null);
      setCurrentNote('');
      message.success('Đã lưu ghi chú');
    }
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      // Mock save - would call API
      console.log('Saving attendance:', attendanceData);
      
      message.success('Đã lưu điểm danh thành công');
      
      setTimeout(() => {
        navigate('/teaching-assistant/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Error saving attendance:', error);
      message.error('Lỗi khi lưu điểm danh');
    } finally {
      setSaving(false);
    }
  };

  const sendNotificationToParents = async () => {
    try {
      const absentStudents = students.filter(student => 
        attendanceData[student.id]?.status === 'absent'
      );
      
      if (absentStudents.length === 0) {
        message.info('Không có sinh viên nào vắng mặt');
        return;
      }
      
      // Mock send notification
      message.success(`Đã gửi thông báo cho ${absentStudents.length} phụ huynh`);
      
    } catch (error) {
      console.error('Error sending notifications:', error);
      message.error('Lỗi khi gửi thông báo');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'green';
      case 'absent': return 'red';
      case 'late': return 'orange';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircleOutlined style={{ color: 'green' }} />;
      case 'absent': return <CloseCircleOutlined style={{ color: 'red' }} />;
      case 'late': return <ClockCircleOutlined style={{ color: 'orange' }} />;
      default: return <UserOutlined />;
    }
  };

  const getAttendanceStats = () => {
    const stats = { present: 0, absent: 0, late: 0 };
    Object.values(attendanceData).forEach(data => {
      stats[data.status] = (stats[data.status] || 0) + 1;
    });
    return stats;
  };

  const StudentCard = ({ student }) => {
    const studentAttendance = attendanceData[student.id] || {};
    
    return (
      <Card
        size="small"
        className={`student-card ${isMobile ? 'mobile-student-card' : ''}`}
        style={{ 
          marginBottom: 12,
          borderRadius: 8,
          border: `2px solid ${getStatusColor(studentAttendance.status)}20`
        }}
        bodyStyle={{ padding: isMobile ? 8 : 12 }}
      >
        <Row align="middle" gutter={[8, 8]}>
          <Col xs={6} sm={4}>
            <Avatar 
              size={isMobile ? 32 : 40}
              style={{ 
                backgroundColor: getStatusColor(studentAttendance.status),
                fontSize: isMobile ? 12 : 16
              }}
            >
              {getStatusIcon(studentAttendance.status)}
            </Avatar>
          </Col>
          
          <Col xs={18} sm={12}>
            <div>
              <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>
                {student.fullName}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: isMobile ? 10 : 12 }}>
                {student.studentCode}
              </Text>
            </div>
          </Col>
          
          <Col xs={24} sm={8}>
            <Space 
              direction={isMobile ? "horizontal" : "vertical"} 
              size="small"
              style={{ width: '100%' }}
            >
              <Select
                value={studentAttendance.status}
                onChange={(value) => updateAttendanceStatus(student.id, value)}
                size={isMobile ? "small" : "middle"}
                style={{ width: isMobile ? 80 : 100 }}
                disabled={!sessionStarted}
              >
                <Option value="present">Có mặt</Option>
                <Option value="absent">Vắng</Option>
                <Option value="late">Muộn</Option>
              </Select>
              
              <Button
                size={isMobile ? "small" : "middle"}
                icon={<EditOutlined />}
                onClick={() => openNoteModal(student)}
                disabled={!sessionStarted}
              >
                {isMobile ? '' : 'Ghi chú'}
              </Button>
            </Space>
          </Col>
        </Row>
        
        {studentAttendance.note && (
          <div style={{ 
            marginTop: 8, 
            padding: 8, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 4,
            fontSize: isMobile ? 10 : 12
          }}>
            <Text type="secondary">Ghi chú: {studentAttendance.note}</Text>
          </div>
        )}
      </Card>
    );
  };

  const AttendanceStats = () => {
    const stats = getAttendanceStats();
    
    return (
      <Card 
        title="Thống kê điểm danh" 
        size="small"
        style={{ marginBottom: 16, borderRadius: 8 }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Badge count={stats.present} style={{ backgroundColor: 'green' }}>
                <Avatar 
                  size={isMobile ? 32 : 40} 
                  style={{ backgroundColor: 'green' }}
                  icon={<CheckCircleOutlined />}
                />
              </Badge>
              <div style={{ marginTop: 4, fontSize: isMobile ? 10 : 12 }}>
                Có mặt
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Badge count={stats.absent} style={{ backgroundColor: 'red' }}>
                <Avatar 
                  size={isMobile ? 32 : 40} 
                  style={{ backgroundColor: 'red' }}
                  icon={<CloseCircleOutlined />}
                />
              </Badge>
              <div style={{ marginTop: 4, fontSize: isMobile ? 10 : 12 }}>
                Vắng mặt
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Badge count={stats.late} style={{ backgroundColor: 'orange' }}>
                <Avatar 
                  size={isMobile ? 32 : 40} 
                  style={{ backgroundColor: 'orange' }}
                  icon={<ClockCircleOutlined />}
                />
              </Badge>
              <div style={{ marginTop: 4, fontSize: isMobile ? 10 : 12 }}>
                Đi muộn
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: isMobile ? '8px' : '24px',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Header */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row align="middle" justify="space-between">
          <Col xs={24} sm={16}>
            <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
              <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              Điểm danh: {classData?.name}
            </Title>
            <Text type="secondary" style={{ fontSize: isMobile ? 11 : 14 }}>
              Giảng viên: {classData?.teacher?.fullName}
              {sessionTime && (
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  Bắt đầu: {sessionTime.toLocaleTimeString()}
                </Tag>
              )}
            </Text>
          </Col>
          <Col xs={24} sm={8}>
            <Space direction={isMobile ? "horizontal" : "vertical"} style={{ width: '100%' }}>
              {!sessionStarted ? (
                <Button 
                  type="primary" 
                  size={isMobile ? "small" : "middle"}
                  icon={<CheckOutlined />}
                  onClick={startAttendanceSession}
                  block={isMobile}
                >
                  Bắt đầu điểm danh
                </Button>
              ) : (
                <>
                  <Button 
                    type="primary" 
                    size={isMobile ? "small" : "middle"}
                    icon={<SaveOutlined />}
                    onClick={saveAttendance}
                    loading={saving}
                    block={isMobile}
                  >
                    Lưu điểm danh
                  </Button>
                  <Button 
                    size={isMobile ? "small" : "middle"}
                    icon={<SendOutlined />}
                    onClick={sendNotificationToParents}
                    block={isMobile}
                  >
                    Báo phụ huynh
                  </Button>
                </>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Stats */}
      {sessionStarted && <AttendanceStats />}

      {/* Alert */}
      {!sessionStarted && (
        <Alert
          message="Chưa bắt đầu phiên điểm danh"
          description="Nhấn 'Bắt đầu điểm danh' để bắt đầu."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Student List */}
      <Card 
        title={`Danh sách sinh viên (${students.length})`}
        style={{ borderRadius: 12 }}
      >
        <List
          dataSource={students}
          renderItem={(student) => (
            <StudentCard student={student} />
          )}
        />
      </Card>

      {/* Note Modal */}
      <Modal
        title={`Ghi chú cho ${selectedStudent?.fullName}`}
        open={noteModalVisible}
        onOk={saveNote}
        onCancel={() => setNoteModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <TextArea
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          placeholder="Nhập ghi chú..."
          rows={4}
        />
      </Modal>

      {/* Mobile floating buttons */}
      {isMobile && sessionStarted && (
        <FloatButton.Group
          icon={<TeamOutlined />}
          type="primary"
          style={{ right: 16, bottom: 16 }}
        >
          <FloatButton 
            icon={<SaveOutlined />} 
            tooltip="Lưu điểm danh"
            onClick={saveAttendance}
          />
          <FloatButton 
            icon={<SendOutlined />} 
            tooltip="Báo phụ huynh"
            onClick={sendNotificationToParents}
          />
        </FloatButton.Group>
      )}

      <style jsx>{`
        .student-card {
          transition: all 0.3s;
        }
        .student-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .mobile-student-card {
          margin: 0 0 8px 0;
        }
        @media (max-width: 768px) {
          .ant-card-body {
            padding: 8px !important;
          }
          .ant-select {
            font-size: 10px;
          }
          .ant-btn {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default TAAttendanceModule;