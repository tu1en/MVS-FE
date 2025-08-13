import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  List, 
  Button, 
  Avatar, 
  Drawer, 
  Space, 
  Tag, 
  Alert, 
  Spin,
  Badge,
  FloatButton
} from 'antd';
import { 
  BookOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined,
  TeamOutlined,
  MenuOutlined,
  PhoneOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;

const AssignedClassesDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch assigned classes
  useEffect(() => {
    fetchAssignedClasses();
  }, []);

  const fetchAssignedClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/teaching-assistant/my-assigned-classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching assigned classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = (classData) => {
    setSelectedClass(classData);
    if (isMobile) {
      setDrawerVisible(true);
    }
  };

  const handleAttendance = (classId) => {
    navigate(`/teaching-assistant/attendance/${classId}`);
  };

  const handleStudentEvaluation = (classId) => {
    navigate(`/teaching-assistant/evaluate-students/${classId}`);
  };

  const handleSendReport = (classId) => {
    navigate(`/teaching-assistant/send-report/${classId}`);
  };

  const ClassCard = ({ classData, onClick }) => (
    <Card
      hoverable
      className={`class-card ${isMobile ? 'mobile-card' : ''}`}
      style={{ 
        marginBottom: 16,
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      onClick={() => onClick(classData)}
      bodyStyle={{ 
        padding: isMobile ? '12px' : '16px'
      }}
    >
      <Row align="middle" gutter={[8, 8]}>
        <Col xs={24} sm={16}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOutlined style={{ color: '#1890ff' }} />
              <Text strong style={{ fontSize: isMobile ? 14 : 16 }}>
                {classData.name}
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
              {classData.subject}
            </Text>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Tag color="blue" style={{ fontSize: isMobile ? 10 : 12 }}>
                <TeamOutlined /> {classData.enrollments?.length || 0} sinh viên
              </Tag>
              <Tag color="green" style={{ fontSize: isMobile ? 10 : 12 }}>
                <UserOutlined /> {classData.teacher?.fullName}
              </Tag>
            </div>
          </Space>
        </Col>
        <Col xs={24} sm={8}>
          <Space 
            direction={isMobile ? "horizontal" : "vertical"} 
            size="small"
            style={{ 
              width: '100%',
              justifyContent: isMobile ? 'space-between' : 'flex-end'
            }}
          >
            <Button 
              type="primary" 
              size={isMobile ? "small" : "middle"}
              icon={<CheckCircleOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleAttendance(classData.id);
              }}
            >
              {isMobile ? '' : 'Điểm danh'}
            </Button>
            <Button 
              size={isMobile ? "small" : "middle"}
              icon={<MessageOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleSendReport(classData.id);
              }}
            >
              {isMobile ? '' : 'Báo cáo'}
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  const ClassDetailContent = ({ classData }) => (
    <div style={{ padding: isMobile ? 16 : 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={4} style={{ marginBottom: 8 }}>
            <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            {classData.name}
          </Title>
          <Text type="secondary">{classData.description}</Text>
        </div>

        <Card size="small">
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8}>
              <Text strong>Môn học:</Text>
              <br />
              <Text>{classData.subject}</Text>
            </Col>
            <Col xs={12} sm={8}>
              <Text strong>Giảng viên:</Text>
              <br />
              <Text>{classData.teacher?.fullName}</Text>
            </Col>
            <Col xs={12} sm={8}>
              <Text strong>Số sinh viên:</Text>
              <br />
              <Text>{classData.enrollments?.length || 0}</Text>
            </Col>
          </Row>
        </Card>

        <div>
          <Title level={5}>Chức năng quản lý</Title>
          <Row gutter={[8, 8]}>
            <Col xs={12} sm={6}>
              <Button 
                type="primary" 
                block
                icon={<CheckCircleOutlined />}
                onClick={() => handleAttendance(classData.id)}
              >
                Điểm danh
              </Button>
            </Col>
            <Col xs={12} sm={6}>
              <Button 
                block
                icon={<UserOutlined />}
                onClick={() => handleStudentEvaluation(classData.id)}
              >
                Đánh giá SV
              </Button>
            </Col>
            <Col xs={12} sm={6}>
              <Button 
                block
                icon={<MessageOutlined />}
                onClick={() => handleSendReport(classData.id)}
              >
                Báo cáo PH
              </Button>
            </Col>
            <Col xs={12} sm={6}>
              <Button 
                block
                icon={<TeamOutlined />}
                onClick={() => navigate(`/teaching-assistant/students/${classData.id}`)}
              >
                DS Sinh viên
              </Button>
            </Col>
          </Row>
        </div>
      </Space>
    </div>
  );

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
      padding: isMobile ? '16px 8px' : '24px',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={isMobile ? 4 : 3} style={{ marginBottom: 8 }}>
          <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Lớp học được phân công
        </Title>
        <Text type="secondary">
          Quản lý các lớp học và sinh viên được phân công
        </Text>
      </div>

      {classes.length === 0 ? (
        <Alert
          message="Chưa có lớp học nào được phân công"
          description="Liên hệ với quản lý để được phân công lớp học."
          type="info"
          showIcon
        />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={selectedClass && !isMobile ? 12 : 24}>
            <List
              dataSource={classes}
              renderItem={(classData) => (
                <ClassCard 
                  classData={classData}
                  onClick={handleClassSelect}
                />
              )}
            />
          </Col>
          
          {/* Desktop detail panel */}
          {selectedClass && !isMobile && (
            <Col lg={12}>
              <Card
                title="Chi tiết lớp học"
                style={{ 
                  position: 'sticky',
                  top: 24,
                  borderRadius: 12
                }}
              >
                <ClassDetailContent classData={selectedClass} />
              </Card>
            </Col>
          )}
        </Row>
      )}

      {/* Mobile drawer */}
      <Drawer
        title="Chi tiết lớp học"
        placement="bottom"
        height="80%"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{
          body: { padding: 0 }
        }}
      >
        {selectedClass && <ClassDetailContent classData={selectedClass} />}
      </Drawer>

      {/* Mobile floating action buttons */}
      {isMobile && (
        <FloatButton.Group
          icon={<MenuOutlined />}
          type="primary"
          style={{ right: 24, bottom: 24 }}
        >
          <FloatButton 
            icon={<PhoneOutlined />} 
            tooltip="Liên hệ hỗ trợ"
          />
          <FloatButton 
            icon={<CalendarOutlined />} 
            tooltip="Lịch dạy"
          />
        </FloatButton.Group>
      )}

      <style jsx>{`
        .class-card {
          transition: all 0.3s;
        }
        .class-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
        }
        .mobile-card {
          margin: 0 4px 12px 4px;
        }
        @media (max-width: 768px) {
          .ant-card-body {
            padding: 12px !important;
          }
          .ant-typography h4 {
            font-size: 16px !important;
          }
          .ant-btn {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default AssignedClassesDashboard;