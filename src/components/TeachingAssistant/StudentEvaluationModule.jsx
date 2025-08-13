import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  List, 
  Button, 
  Avatar, 
  Rate, 
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
  Tabs
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined,
  SaveOutlined,
  StarOutlined,
  TrophyOutlined,
  BookOutlined,
  HeartOutlined,
  TeamOutlined,
  SendOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const StudentEvaluationModule = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [evaluationModalVisible, setEvaluationModalVisible] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState({});
  const [form] = Form.useForm();

  // Evaluation criteria
  const evaluationCriteria = [
    { key: 'learning', label: 'Khả năng học tập', icon: <BookOutlined />, color: '#1890ff' },
    { key: 'attitude', label: 'Thái độ học tập', icon: <HeartOutlined />, color: '#52c41a' },
    { key: 'participation', label: 'Tham gia lớp học', icon: <TeamOutlined />, color: '#fa8c16' },
    { key: 'homework', label: 'Bài tập về nhà', icon: <FileTextOutlined />, color: '#eb2f96' },
    { key: 'behavior', label: 'Hành vi', icon: <TrophyOutlined />, color: '#722ed1' }
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
      loadEvaluations();
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
      
      // Mock data
      const mockStudents = [
        { id: 1, fullName: 'Trần Văn A', email: 'a@student.com', studentCode: 'SV001' },
        { id: 2, fullName: 'Lê Thị B', email: 'b@student.com', studentCode: 'SV002' },
        { id: 3, fullName: 'Phạm Văn C', email: 'c@student.com', studentCode: 'SV003' },
        { id: 4, fullName: 'Nguyễn Thị D', email: 'd@student.com', studentCode: 'SV004' },
        { id: 5, fullName: 'Võ Văn E', email: 'e@student.com', studentCode: 'SV005' }
      ];
      
      setStudents(mockStudents);
      
    } catch (error) {
      console.error('Error loading students:', error);
      message.error('Không thể tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  const loadEvaluations = async () => {
    try {
      // Mock evaluations data
      const mockEvaluations = {
        1: {
          learning: 4,
          attitude: 5,
          participation: 3,
          homework: 4,
          behavior: 5,
          comment: 'Sinh viên học tập tích cực và có thái độ tốt.',
          strengths: 'Tích cực tham gia, có khả năng tư duy logic',
          improvements: 'Cần cải thiện kỹ năng thuyết trình',
          lastUpdated: new Date()
        },
        2: {
          learning: 3,
          attitude: 4,
          participation: 4,
          homework: 3,
          behavior: 4,
          comment: 'Cần nỗ lực hơn trong việc làm bài tập.',
          strengths: 'Có tinh thần trách nhiệm',
          improvements: 'Cần tập trung hơn trong giờ học',
          lastUpdated: new Date()
        }
      };
      
      setEvaluations(mockEvaluations);
      
    } catch (error) {
      console.error('Error loading evaluations:', error);
    }
  };

  const openEvaluationModal = (student) => {
    setSelectedStudent(student);
    const existingEvaluation = evaluations[student.id] || {};
    setCurrentEvaluation(existingEvaluation);
    form.setFieldsValue(existingEvaluation);
    setEvaluationModalVisible(true);
  };

  const saveEvaluation = async (values) => {
    try {
      setSaving(true);
      
      const evaluationData = {
        ...values,
        studentId: selectedStudent.id,
        classId: classId,
        lastUpdated: new Date()
      };
      
      // Update local state
      setEvaluations(prev => ({
        ...prev,
        [selectedStudent.id]: evaluationData
      }));
      
      setEvaluationModalVisible(false);
      setSelectedStudent(null);
      form.resetFields();
      message.success('Đã lưu đánh giá thành công');
      
    } catch (error) {
      console.error('Error saving evaluation:', error);
      message.error('Lỗi khi lưu đánh giá');
    } finally {
      setSaving(false);
    }
  };

  const calculateOverallScore = (evaluation) => {
    if (!evaluation) return 0;
    const criteria = ['learning', 'attitude', 'participation', 'homework', 'behavior'];
    const total = criteria.reduce((sum, key) => sum + (evaluation[key] || 0), 0);
    return (total / criteria.length).toFixed(1);
  };

  const getScoreColor = (score) => {
    if (score >= 4.5) return 'green';
    if (score >= 3.5) return 'orange';
    return 'red';
  };

  const getScoreLabel = (score) => {
    if (score >= 4.5) return 'Xuất sắc';
    if (score >= 3.5) return 'Khá';
    if (score >= 2.5) return 'Trung bình';
    return 'Yếu';
  };

  const sendEvaluationReport = async (studentId) => {
    try {
      const evaluation = evaluations[studentId];
      if (!evaluation) {
        message.warning('Chưa có đánh giá cho sinh viên này');
        return;
      }
      
      // Mock send report
      message.success('Đã gửi báo cáo đánh giá cho phụ huynh');
      
    } catch (error) {
      console.error('Error sending report:', error);
      message.error('Lỗi khi gửi báo cáo');
    }
  };

  const StudentCard = ({ student }) => {
    const evaluation = evaluations[student.id];
    const overallScore = calculateOverallScore(evaluation);
    const hasEvaluation = !!evaluation;
    
    return (
      <Card
        size="small"
        className={`student-card ${isMobile ? 'mobile-student-card' : ''}`}
        style={{ 
          marginBottom: 12,
          borderRadius: 8,
          border: hasEvaluation ? '2px solid #52c41a20' : '2px solid #d9d9d920'
        }}
        bodyStyle={{ padding: isMobile ? 8 : 12 }}
      >
        <Row align="middle" gutter={[8, 8]}>
          <Col xs={6} sm={4}>
            <Badge 
              count={hasEvaluation ? <CheckCircleOutlined style={{ color: 'green' }} /> : ''}
              offset={[-8, 8]}
            >
              <Avatar 
                size={isMobile ? 32 : 40}
                style={{ 
                  backgroundColor: hasEvaluation ? '#52c41a' : '#d9d9d9',
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
              {hasEvaluation && (
                <div style={{ marginTop: 4 }}>
                  <Rate 
                    disabled 
                    allowHalf 
                    value={parseFloat(overallScore)} 
                    style={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <Tag 
                    color={getScoreColor(overallScore)} 
                    style={{ marginLeft: 4, fontSize: isMobile ? 10 : 11 }}
                  >
                    {overallScore}/5
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
                type={hasEvaluation ? "default" : "primary"}
                size={isMobile ? "small" : "middle"}
                icon={<EditOutlined />}
                onClick={() => openEvaluationModal(student)}
              >
                {isMobile ? '' : hasEvaluation ? 'Sửa' : 'Đánh giá'}
              </Button>
              
              {hasEvaluation && (
                <Button
                  size={isMobile ? "small" : "middle"}
                  icon={<SendOutlined />}
                  onClick={() => sendEvaluationReport(student.id)}
                >
                  {isMobile ? '' : 'Gửi PH'}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
        
        {hasEvaluation && evaluation.comment && (
          <div style={{ 
            marginTop: 8, 
            padding: 8, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 4,
            fontSize: isMobile ? 10 : 12
          }}>
            <Text type="secondary">"{evaluation.comment}"</Text>
          </div>
        )}
      </Card>
    );
  };

  const EvaluationStats = () => {
    const evaluatedCount = Object.keys(evaluations).length;
    const totalCount = students.length;
    const percentage = totalCount > 0 ? (evaluatedCount / totalCount * 100).toFixed(1) : 0;
    
    const avgScore = Object.values(evaluations).length > 0 
      ? (Object.values(evaluations).reduce((sum, eval) => sum + parseFloat(calculateOverallScore(eval)), 0) / Object.values(evaluations).length).toFixed(1)
      : 0;
    
    return (
      <Card 
        title="Thống kê đánh giá" 
        size="small"
        style={{ marginBottom: 16, borderRadius: 8 }}
      >
        <Row gutter={16}>
          <Col xs={8} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <Progress 
                type="circle" 
                percent={parseFloat(percentage)}
                size={isMobile ? 60 : 80}
                format={() => `${evaluatedCount}/${totalCount}`}
              />
              <div style={{ marginTop: 4, fontSize: isMobile ? 10 : 12 }}>
                Đã đánh giá
              </div>
            </div>
          </Col>
          <Col xs={8} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <Rate 
                disabled 
                allowHalf 
                value={parseFloat(avgScore)} 
                style={{ fontSize: isMobile ? 12 : 16 }}
              />
              <div style={{ marginTop: 4, fontSize: isMobile ? 10 : 12 }}>
                Điểm TB: {avgScore}/5
              </div>
            </div>
          </Col>
          <Col xs={8} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <Tag 
                color={getScoreColor(avgScore)} 
                style={{ fontSize: isMobile ? 12 : 14, padding: '4px 8px' }}
              >
                {getScoreLabel(avgScore)}
              </Tag>
              <div style={{ marginTop: 4, fontSize: isMobile ? 10 : 12 }}>
                Xếp loại
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
          <Col xs={24} sm={18}>
            <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
              <StarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              Đánh giá sinh viên: {classData?.name}
            </Title>
            <Text type="secondary" style={{ fontSize: isMobile ? 11 : 14 }}>
              Đánh giá và nhận xét quá trình học tập của sinh viên
            </Text>
          </Col>
          <Col xs={24} sm={6}>
            <Button 
              type="primary" 
              size={isMobile ? "small" : "middle"}
              icon={<FileTextOutlined />}
              onClick={() => navigate(`/teaching-assistant/evaluation-report/${classId}`)}
              block={isMobile}
            >
              Báo cáo tổng hợp
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Stats */}
      <EvaluationStats />

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

      {/* Evaluation Modal */}
      <Modal
        title={`Đánh giá sinh viên: ${selectedStudent?.fullName}`}
        open={evaluationModalVisible}
        onCancel={() => setEvaluationModalVisible(false)}
        footer={null}
        width={isMobile ? '95%' : 800}
        style={{ top: isMobile ? 20 : 50 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={saveEvaluation}
        >
          <Tabs defaultActiveKey="criteria" size={isMobile ? "small" : "default"}>
            <TabPane tab="Tiêu chí đánh giá" key="criteria">
              {evaluationCriteria.map(criterion => (
                <Form.Item
                  key={criterion.key}
                  label={
                    <Space>
                      {criterion.icon}
                      <Text strong>{criterion.label}</Text>
                    </Space>
                  }
                  name={criterion.key}
                  rules={[{ required: true, message: 'Vui lòng đánh giá tiêu chí này' }]}
                >
                  <Rate 
                    allowHalf 
                    style={{ fontSize: isMobile ? 16 : 20 }}
                  />
                </Form.Item>
              ))}
            </TabPane>
            
            <TabPane tab="Nhận xét" key="comments">
              <Form.Item
                label="Nhận xét chung"
                name="comment"
                rules={[{ required: true, message: 'Vui lòng nhập nhận xét' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập nhận xét về quá trình học tập của sinh viên..."
                />
              </Form.Item>
              
              <Form.Item
                label="Điểm mạnh"
                name="strengths"
              >
                <TextArea
                  rows={3}
                  placeholder="Nêu những điểm mạnh của sinh viên..."
                />
              </Form.Item>
              
              <Form.Item
                label="Cần cải thiện"
                name="improvements"
              >
                <TextArea
                  rows={3}
                  placeholder="Nêu những điểm cần cải thiện..."
                />
              </Form.Item>
            </TabPane>
          </Tabs>
          
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setEvaluationModalVisible(false)}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
              >
                Lưu đánh giá
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Mobile floating buttons */}
      {isMobile && (
        <FloatButton.Group
          icon={<StarOutlined />}
          type="primary"
          style={{ right: 16, bottom: 16 }}
        >
          <FloatButton 
            icon={<FileTextOutlined />} 
            tooltip="Báo cáo tổng hợp"
            onClick={() => navigate(`/teaching-assistant/evaluation-report/${classId}`)}
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
          .ant-rate {
            font-size: 12px !important;
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

export default StudentEvaluationModule;