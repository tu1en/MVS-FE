import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  List, 
  Button, 
  Avatar, 
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
  Drawer,
  Form,
  Progress,
  Tabs,
  DatePicker,
  Radio,
  Checkbox,
  Switch
} from 'antd';
import { 
  UserOutlined, 
  SendOutlined,
  FileTextOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  HeartOutlined,
  BookOutlined,
  TeamOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  BellOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const ParentReportModule = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportHistory, setReportHistory] = useState([]);
  const [form] = Form.useForm();

  // Report templates
  const reportTemplates = [
    {
      key: 'weekly',
      title: 'Báo cáo tuần',
      icon: <CalendarOutlined />,
      description: 'Tổng hợp hoạt động học tập trong tuần'
    },
    {
      key: 'behavior',
      title: 'Báo cáo hành vi',
      icon: <HeartOutlined />,
      description: 'Thông báo về hành vi đặc biệt của sinh viên'
    },
    {
      key: 'academic',
      title: 'Báo cáo học tập',
      icon: <BookOutlined />,
      description: 'Kết quả học tập và bài tập'
    },
    {
      key: 'attendance',
      title: 'Báo cáo điểm danh',
      icon: <CheckCircleOutlined />,
      description: 'Tình hình tham gia lớp học'
    }
  ];

  // Notification methods
  const notificationMethods = [
    { key: 'sms', label: 'SMS', icon: <PhoneOutlined /> },
    { key: 'email', label: 'Email', icon: <MailOutlined /> },
    { key: 'app', label: 'Ứng dụng', icon: <BellOutlined /> }
  ];

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
      loadReportHistory();
    }
  }, [classId]);

  const loadClassData = async () => {
    try {
      // Mock data for now
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
      
      // Mock data with parent contact info
      const mockStudents = [
        { 
          id: 1, 
          fullName: 'Trần Văn A', 
          email: 'a@student.com', 
          studentCode: 'SV001',
          parentName: 'Trần Văn B',
          parentPhone: '0901234567',
          parentEmail: 'parent1@email.com'
        },
        { 
          id: 2, 
          fullName: 'Lê Thị B', 
          email: 'b@student.com', 
          studentCode: 'SV002',
          parentName: 'Lê Văn C',
          parentPhone: '0901234568',
          parentEmail: 'parent2@email.com'
        },
        { 
          id: 3, 
          fullName: 'Phạm Văn C', 
          email: 'c@student.com', 
          studentCode: 'SV003',
          parentName: 'Phạm Thị D',
          parentPhone: '0901234569',
          parentEmail: 'parent3@email.com'
        },
        { 
          id: 4, 
          fullName: 'Nguyễn Thị D', 
          email: 'd@student.com', 
          studentCode: 'SV004',
          parentName: 'Nguyễn Văn E',
          parentPhone: '0901234570',
          parentEmail: 'parent4@email.com'
        },
        { 
          id: 5, 
          fullName: 'Võ Văn E', 
          email: 'e@student.com', 
          studentCode: 'SV005',
          parentName: 'Võ Thị F',
          parentPhone: '0901234571',
          parentEmail: 'parent5@email.com'
        }
      ];
      
      setStudents(mockStudents);
      
    } catch (error) {
      console.error('Error loading students:', error);
      message.error('Không thể tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  const loadReportHistory = async () => {
    try {
      // Mock report history
      const mockHistory = [
        {
          id: 1,
          studentId: 1,
          type: 'weekly',
          title: 'Báo cáo tuần 12/2024',
          sentDate: moment().subtract(2, 'days'),
          method: ['sms', 'email'],
          status: 'sent'
        },
        {
          id: 2,
          studentId: 2,
          type: 'behavior',
          title: 'Thông báo hành vi tích cực',
          sentDate: moment().subtract(1, 'week'),
          method: ['app'],
          status: 'sent'
        }
      ];
      
      setReportHistory(mockHistory);
      
    } catch (error) {
      console.error('Error loading report history:', error);
    }
  };

  const openReportModal = (student) => {
    setSelectedStudent(student);
    form.resetFields();
    form.setFieldsValue({
      reportType: 'weekly',
      methods: ['sms'],
      sendImmediately: true
    });
    setReportModalVisible(true);
  };

  const sendReport = async (values) => {
    try {
      setSending(true);
      
      const reportData = {
        ...values,
        studentId: selectedStudent.id,
        classId: classId,
        sentDate: new Date(),
        assistantId: 'current_user_id' // Would get from auth
      };
      
      // Mock API call
      console.log('Sending report:', reportData);
      
      // Add to report history
      const newReport = {
        id: Date.now(),
        studentId: selectedStudent.id,
        type: values.reportType,
        title: values.title,
        sentDate: moment(),
        method: values.methods,
        status: 'sent'
      };
      
      setReportHistory(prev => [newReport, ...prev]);
      setReportModalVisible(false);
      setSelectedStudent(null);
      form.resetFields();
      
      message.success(`Đã gửi báo cáo cho phụ huynh của ${selectedStudent.fullName}`);
      
    } catch (error) {
      console.error('Error sending report:', error);
      message.error('Lỗi khi gửi báo cáo');
    } finally {
      setSending(false);
    }
  };

  const sendBulkReport = async () => {
    try {
      setSending(true);
      
      // Mock bulk send
      const selectedStudents = students.slice(0, 3); // Send to first 3 students
      
      for (const student of selectedStudents) {
        const newReport = {
          id: Date.now() + student.id,
          studentId: student.id,
          type: 'weekly',
          title: `Báo cáo tuần ${moment().format('WW/YYYY')}`,
          sentDate: moment(),
          method: ['sms', 'email'],
          status: 'sent'
        };
        
        setReportHistory(prev => [newReport, ...prev]);
      }
      
      message.success(`Đã gửi báo cáo hàng loạt cho ${selectedStudents.length} phụ huynh`);
      
    } catch (error) {
      console.error('Error sending bulk report:', error);
      message.error('Lỗi khi gửi báo cáo hàng loạt');
    } finally {
      setSending(false);
    }
  };

  const getReportTypeColor = (type) => {
    const colors = {
      weekly: 'blue',
      behavior: 'green',
      academic: 'purple',
      attendance: 'orange'
    };
    return colors[type] || 'default';
  };

  const getReportTypeIcon = (type) => {
    const icons = {
      weekly: <CalendarOutlined />,
      behavior: <HeartOutlined />,
      academic: <BookOutlined />,
      attendance: <CheckCircleOutlined />
    };
    return icons[type] || <FileTextOutlined />;
  };

  const StudentCard = ({ student }) => {
    const studentReports = reportHistory.filter(report => report.studentId === student.id);
    const lastReportDate = studentReports.length > 0 
      ? studentReports[0].sentDate 
      : null;
    
    return (
      <Card
        size="small"
        className={`student-card ${isMobile ? 'mobile-student-card' : ''}`}
        style={{ 
          marginBottom: 12,
          borderRadius: 8,
          border: `2px solid ${studentReports.length > 0 ? '#52c41a20' : '#d9d9d920'}`
        }}
        bodyStyle={{ padding: isMobile ? 8 : 12 }}
      >
        <Row align="middle" gutter={[8, 8]}>
          <Col xs={6} sm={4}>
            <Badge 
              count={studentReports.length}
              style={{ backgroundColor: '#52c41a' }}
              offset={[-8, 8]}
            >
              <Avatar 
                size={isMobile ? 32 : 40}
                style={{ 
                  backgroundColor: '#1890ff',
                  fontSize: isMobile ? 12 : 16
                }}
              >
                {student.fullName.charAt(0)}
              </Avatar>
            </Badge>
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
              <br />
              <Text type="secondary" style={{ fontSize: isMobile ? 9 : 11 }}>
                PH: {student.parentName} - {student.parentPhone}
              </Text>
              {lastReportDate && (
                <div style={{ marginTop: 4 }}>
                  <Tag 
                    color="green" 
                    size="small"
                    style={{ fontSize: isMobile ? 9 : 10 }}
                  >
                    <ClockCircleOutlined /> {lastReportDate.format('DD/MM HH:mm')}
                  </Tag>
                </div>
              )}
            </div>
          </Col>
          
          <Col xs={24} sm={8}>
            <Space 
              direction={isMobile ? "horizontal" : "vertical"} 
              size="small"
              style={{ width: '100%' }}
            >
              <Button
                type="primary"
                size={isMobile ? "small" : "middle"}
                icon={<SendOutlined />}
                onClick={() => openReportModal(student)}
              >
                {isMobile ? '' : 'Gửi báo cáo'}
              </Button>
              
              <Button
                size={isMobile ? "small" : "middle"}
                icon={<HistoryOutlined />}
                onClick={() => {
                  const studentReportsFiltered = reportHistory.filter(r => r.studentId === student.id);
                  if (studentReportsFiltered.length === 0) {
                    message.info('Chưa có báo cáo nào cho sinh viên này');
                    return;
                  }
                  // Show history modal or navigate to history page
                  message.info(`${studentReportsFiltered.length} báo cáo đã gửi`);
                }}
              >
                {isMobile ? '' : 'Lịch sử'}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  const ReportStats = () => {
    const totalReports = reportHistory.length;
    const thisWeekReports = reportHistory.filter(report => 
      moment(report.sentDate).isAfter(moment().startOf('week'))
    ).length;
    const studentsReported = new Set(reportHistory.map(r => r.studentId)).size;
    
    return (
      <Card 
        title="Thống kê báo cáo" 
        size="small"
        style={{ marginBottom: 16, borderRadius: 8 }}
      >
        <Row gutter={16}>
          <Col xs={8} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 'bold', color: '#1890ff' }}>
                {totalReports}
              </div>
              <div style={{ fontSize: isMobile ? 10 : 12 }}>
                Tổng báo cáo
              </div>
            </div>
          </Col>
          <Col xs={8} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 'bold', color: '#52c41a' }}>
                {thisWeekReports}
              </div>
              <div style={{ fontSize: isMobile ? 10 : 12 }}>
                Tuần này
              </div>
            </div>
          </Col>
          <Col xs={8} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 'bold', color: '#fa8c16' }}>
                {studentsReported}
              </div>
              <div style={{ fontSize: isMobile ? 10 : 12 }}>
                SV đã báo cáo
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
              <MessageOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              Báo cáo phụ huynh: {classData?.name}
            </Title>
            <Text type="secondary" style={{ fontSize: isMobile ? 11 : 14 }}>
              Gửi thông tin học tập và hành vi sinh viên đến phụ huynh
            </Text>
          </Col>
          <Col xs={24} sm={8}>
            <Space direction={isMobile ? "horizontal" : "vertical"} style={{ width: '100%' }}>
              <Button 
                type="primary" 
                size={isMobile ? "small" : "middle"}
                icon={<SendOutlined />}
                onClick={sendBulkReport}
                loading={sending}
                block={isMobile}
              >
                Gửi hàng loạt
              </Button>
              <Button 
                size={isMobile ? "small" : "middle"}
                icon={<HistoryOutlined />}
                onClick={() => navigate(`/teaching-assistant/report-history/${classId}`)}
                block={isMobile}
              >
                Lịch sử báo cáo
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Stats */}
      <ReportStats />

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

      {/* Report Modal */}
      <Modal
        title={`Gửi báo cáo cho phụ huynh: ${selectedStudent?.fullName}`}
        open={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        footer={null}
        width={isMobile ? '95%' : 700}
        style={{ top: isMobile ? 20 : 50 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={sendReport}
        >
          <Form.Item
            label="Loại báo cáo"
            name="reportType"
            rules={[{ required: true, message: 'Vui lòng chọn loại báo cáo' }]}
          >
            <Radio.Group>
              {reportTemplates.map(template => (
                <Radio.Button 
                  key={template.key} 
                  value={template.key}
                  style={{ 
                    width: isMobile ? '50%' : '25%',
                    textAlign: 'center',
                    marginBottom: 8
                  }}
                >
                  <div>
                    {template.icon}
                    <br />
                    <span style={{ fontSize: isMobile ? 10 : 12 }}>
                      {template.title}
                    </span>
                  </div>
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            label="Tiêu đề báo cáo"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề báo cáo..." />
          </Form.Item>
          
          <Form.Item
            label="Nội dung báo cáo"
            name="content"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <TextArea
              rows={6}
              placeholder="Nhập nội dung báo cáo chi tiết..."
            />
          </Form.Item>
          
          <Form.Item
            label="Phương thức gửi"
            name="methods"
            rules={[{ required: true, message: 'Vui lòng chọn phương thức gửi' }]}
          >
            <Checkbox.Group>
              <Row>
                {notificationMethods.map(method => (
                  <Col span={8} key={method.key}>
                    <Checkbox value={method.key}>
                      <Space>
                        {method.icon}
                        {method.label}
                      </Space>
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
          
          <Form.Item
            label="Gửi ngay"
            name="sendImmediately"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setReportModalVisible(false)}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<SendOutlined />}
                loading={sending}
              >
                Gửi báo cáo
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Mobile floating buttons */}
      {isMobile && (
        <FloatButton.Group
          icon={<MessageOutlined />}
          type="primary"
          style={{ right: 16, bottom: 16 }}
        >
          <FloatButton 
            icon={<SendOutlined />} 
            tooltip="Gửi hàng loạt"
            onClick={sendBulkReport}
          />
          <FloatButton 
            icon={<HistoryOutlined />} 
            tooltip="Lịch sử"
            onClick={() => navigate(`/teaching-assistant/report-history/${classId}`)}
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
          .ant-radio-button-wrapper {
            font-size: 10px;
          }
          .ant-btn {
            font-size: 10px;
          }
          .ant-modal-content {
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ParentReportModule;