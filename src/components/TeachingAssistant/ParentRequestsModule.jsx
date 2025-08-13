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
  Tabs,
  DatePicker,
  TimePicker,
  Popconfirm
} from 'antd';
import { 
  UserOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  MessageOutlined,
  CalendarOutlined,
  FileTextOutlined,
  BellOutlined,
  EyeOutlined,
  CheckOutlined,
  StopOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const ParentRequestsModule = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestDetailVisible, setRequestDetailVisible] = useState(false);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [form] = Form.useForm();

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
      loadParentRequests();
      loadPendingCount();
    }
  }, [classId]);

  const loadClassData = async () => {
    try {
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

  const loadParentRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`/api/teaching-assistant/classroom/${classId}/parent-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data);
    } catch (error) {
      console.error('Error loading parent requests:', error);
      message.error('Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingCount = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`/api/teaching-assistant/classroom/${classId}/parent-requests/pending-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingCount(response.data.pendingCount);
    } catch (error) {
      console.error('Error loading pending count:', error);
    }
  };

  const markAsNotified = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`/api/teaching-assistant/classroom/${classId}/parent-requests/mark-notified`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(req => ({
          ...req,
          assistantNotified: true
        }))
      );
    } catch (error) {
      console.error('Error marking as notified:', error);
    }
  };

  const openRequestDetail = (request) => {
    setSelectedRequest(request);
    if (isMobile) {
      setRequestDetailVisible(true);
    }
    // Mark as notified when viewing
    if (!request.assistantNotified) {
      markAsNotified();
    }
  };

  const openResponseModal = (request, action) => {
    setSelectedRequest(request);
    form.resetFields();
    form.setFieldsValue({ action });
    setResponseModalVisible(true);
  };

  const handleResponse = async (values) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('authToken');
      
      await axios.post(`/api/teaching-assistant/parent-request/${selectedRequest.id}/respond`, values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === selectedRequest.id 
            ? { 
                ...req, 
                status: values.action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                assistantResponse: values.response,
                approvedByAssistantId: 'current_user_id',
                processedAt: new Date()
              }
            : req
        )
      );
      
      setResponseModalVisible(false);
      setSelectedRequest(null);
      form.resetFields();
      
      message.success(`Đã ${values.action === 'APPROVE' ? 'duyệt' : 'từ chối'} yêu cầu thành công`);
      
    } catch (error) {
      console.error('Error responding to request:', error);
      message.error('Lỗi khi xử lý yêu cầu');
    } finally {
      setProcessing(false);
    }
  };

  const getRequestTypeColor = (type) => {
    const colors = {
      LEAVE: 'red',
      LATE_ARRIVAL: 'orange',
      EARLY_DEPARTURE: 'blue'
    };
    return colors[type] || 'default';
  };

  const getRequestTypeIcon = (type) => {
    const icons = {
      LEAVE: <StopOutlined />,
      LATE_ARRIVAL: <ClockCircleOutlined />,
      EARLY_DEPARTURE: <CheckCircleOutlined />
    };
    return icons[type] || <FileTextOutlined />;
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'orange',
      APPROVED: 'green',
      REJECTED: 'red',
      EXPIRED: 'gray'
    };
    return colors[status] || 'default';
  };

  const RequestCard = ({ request }) => {
    const isNew = !request.assistantNotified;
    const isUrgent = moment(request.requestDate).isSame(moment(), 'day');
    
    return (
      <Card
        size="small"
        className={`request-card ${isMobile ? 'mobile-request-card' : ''}`}
        style={{ 
          marginBottom: 12,
          borderRadius: 8,
          border: isNew ? '2px solid #1890ff' : '1px solid #d9d9d9',
          backgroundColor: isNew ? '#f6ffed' : 'white'
        }}
        bodyStyle={{ padding: isMobile ? 8 : 12 }}
      >
        <Row align="middle" gutter={[8, 8]}>
          <Col xs={6} sm={4}>
            <Badge dot={isNew} offset={[-8, 8]}>
              <Avatar 
                size={isMobile ? 32 : 40}
                style={{ 
                  backgroundColor: getRequestTypeColor(request.requestType),
                  fontSize: isMobile ? 12 : 16
                }}
              >
                {getRequestTypeIcon(request.requestType)}
              </Avatar>
            </Badge>
          </Col>
          
          <Col xs={18} sm={12}>
            <div>
              <Space direction="vertical" size={2}>
                <div>
                  <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>
                    {request.studentName}
                  </Text>
                  {isUrgent && (
                    <Tag color="red" size="small" style={{ marginLeft: 4 }}>
                      Hôm nay
                    </Tag>
                  )}
                </div>
                <Text type="secondary" style={{ fontSize: isMobile ? 10 : 12 }}>
                  {request.studentCode} - {request.parentName}
                </Text>
                <div>
                  <Tag 
                    color={getRequestTypeColor(request.requestType)} 
                    style={{ fontSize: isMobile ? 9 : 10 }}
                  >
                    {request.requestTypeDisplayName || request.requestType}
                  </Tag>
                  <Tag 
                    color={getStatusColor(request.status)} 
                    style={{ fontSize: isMobile ? 9 : 10 }}
                  >
                    {request.statusDisplayName || request.status}
                  </Tag>
                </div>
                <Text 
                  type="secondary" 
                  style={{ 
                    fontSize: isMobile ? 9 : 11,
                    display: 'block',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {request.reason}
                </Text>
              </Space>
            </div>
          </Col>
          
          <Col xs={24} sm={8}>
            <Space 
              direction={isMobile ? "horizontal" : "vertical"} 
              size="small"
              style={{ width: '100%' }}
            >
              <Button
                size={isMobile ? "small" : "middle"}
                icon={<EyeOutlined />}
                onClick={() => openRequestDetail(request)}
              >
                {isMobile ? '' : 'Chi tiết'}
              </Button>
              
              {request.status === 'PENDING' && (
                <Space size={4}>
                  <Button
                    type="primary"
                    size={isMobile ? "small" : "middle"}
                    icon={<CheckOutlined />}
                    onClick={() => openResponseModal(request, 'APPROVE')}
                  >
                    {isMobile ? '' : 'Duyệt'}
                  </Button>
                  <Button
                    danger
                    size={isMobile ? "small" : "middle"}
                    icon={<CloseCircleOutlined />}
                    onClick={() => openResponseModal(request, 'REJECT')}
                  >
                    {isMobile ? '' : 'Từ chối'}
                  </Button>
                </Space>
              )}
            </Space>
          </Col>
        </Row>
        
        <Row style={{ marginTop: 8 }}>
          <Col span={24}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary" style={{ fontSize: isMobile ? 9 : 11 }}>
                <CalendarOutlined /> {moment(request.requestDate).format('DD/MM/YYYY')}
                {request.timeRange && ` • ${request.timeRange}`}
              </Text>
              <Text type="secondary" style={{ fontSize: isMobile ? 9 : 11 }}>
                {moment(request.createdAt).fromNow()}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  const RequestDetailContent = ({ request }) => {
    if (!request) return null;
    
    return (
      <div style={{ padding: isMobile ? 16 : 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={5} style={{ marginBottom: 8 }}>
              Thông tin yêu cầu
            </Title>
            <Row gutter={[16, 8]}>
              <Col xs={12} sm={8}>
                <Text strong>Sinh viên:</Text>
                <br />
                <Text>{request.studentName} ({request.studentCode})</Text>
              </Col>
              <Col xs={12} sm={8}>
                <Text strong>Phụ huynh:</Text>
                <br />
                <Text>{request.parentName}</Text>
              </Col>
              <Col xs={12} sm={8}>
                <Text strong>Số điện thoại:</Text>
                <br />
                <Text>{request.parentPhone}</Text>
              </Col>
              <Col xs={12} sm={8}>
                <Text strong>Loại yêu cầu:</Text>
                <br />
                <Tag color={getRequestTypeColor(request.requestType)}>
                  {request.requestTypeDisplayName || request.requestType}
                </Tag>
              </Col>
              <Col xs={12} sm={8}>
                <Text strong>Ngày:</Text>
                <br />
                <Text>{moment(request.requestDate).format('DD/MM/YYYY')}</Text>
              </Col>
              <Col xs={12} sm={8}>
                <Text strong>Thời gian:</Text>
                <br />
                <Text>{request.timeRange || 'Cả ngày'}</Text>
              </Col>
            </Row>
          </div>
          
          <div>
            <Text strong>Lý do:</Text>
            <Paragraph style={{ marginTop: 8, backgroundColor: '#f5f5f5', padding: 12, borderRadius: 6 }}>
              {request.reason}
            </Paragraph>
          </div>
          
          {request.status !== 'PENDING' && (
            <div>
              <Text strong>Phản hồi của trợ giảng:</Text>
              <Paragraph style={{ marginTop: 8, backgroundColor: '#f0f9ff', padding: 12, borderRadius: 6 }}>
                {request.assistantResponse || 'Không có phản hồi'}
              </Paragraph>
            </div>
          )}
          
          <div>
            <Text strong>Trạng thái:</Text>
            <div style={{ marginTop: 8 }}>
              <Tag color={getStatusColor(request.status)} style={{ fontSize: 14, padding: '4px 12px' }}>
                {request.statusDisplayName || request.status}
              </Tag>
            </div>
          </div>
        </Space>
      </div>
    );
  };

  const RequestStats = () => {
    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'PENDING').length,
      approved: requests.filter(r => r.status === 'APPROVED').length,
      rejected: requests.filter(r => r.status === 'REJECTED').length
    };
    
    return (
      <Card 
        title="Thống kê yêu cầu" 
        size="small"
        style={{ marginBottom: 16, borderRadius: 8 }}
      >
        <Row gutter={16}>
          <Col xs={6} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 'bold', color: '#1890ff' }}>
                {stats.total}
              </div>
              <div style={{ fontSize: isMobile ? 10 : 12 }}>
                Tổng số
              </div>
            </div>
          </Col>
          <Col xs={6} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 'bold', color: '#fa8c16' }}>
                {stats.pending}
              </div>
              <div style={{ fontSize: isMobile ? 10 : 12 }}>
                Chờ xử lý
              </div>
            </div>
          </Col>
          <Col xs={6} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 'bold', color: '#52c41a' }}>
                {stats.approved}
              </div>
              <div style={{ fontSize: isMobile ? 10 : 12 }}>
                Đã duyệt
              </div>
            </div>
          </Col>
          <Col xs={6} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 'bold', color: '#f5222d' }}>
                {stats.rejected}
              </div>
              <div style={{ fontSize: isMobile ? 10 : 12 }}>
                Từ chối
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
              <BellOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              Yêu cầu từ phụ huynh: {classData?.name}
              {pendingCount > 0 && (
                <Badge 
                  count={pendingCount} 
                  style={{ marginLeft: 8 }}
                />
              )}
            </Title>
            <Text type="secondary" style={{ fontSize: isMobile ? 11 : 14 }}>
              Xem và xử lý yêu cầu nghỉ học, đi muộn, về sớm từ phụ huynh
            </Text>
          </Col>
          <Col xs={24} sm={6}>
            <Button 
              type="primary" 
              size={isMobile ? "small" : "middle"}
              icon={<HistoryOutlined />}
              onClick={() => navigate(`/teaching-assistant/parent-requests-history/${classId}`)}
              block={isMobile}
            >
              Lịch sử yêu cầu
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Stats */}
      <RequestStats />

      {/* Requests List */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={selectedRequest && !isMobile ? 14 : 24}>
          <Card 
            title={`Danh sách yêu cầu (${requests.length})`}
            style={{ borderRadius: 12 }}
          >
            {requests.length === 0 ? (
              <Alert
                message="Chưa có yêu cầu nào từ phụ huynh"
                description="Các yêu cầu nghỉ học, đi muộn, về sớm sẽ hiển thị tại đây."
                type="info"
                showIcon
              />
            ) : (
              <List
                dataSource={requests}
                renderItem={(request) => (
                  <RequestCard request={request} />
                )}
              />
            )}
          </Card>
        </Col>
        
        {/* Desktop detail panel */}
        {selectedRequest && !isMobile && (
          <Col lg={10}>
            <Card
              title="Chi tiết yêu cầu"
              style={{ 
                position: 'sticky',
                top: 24,
                borderRadius: 12
              }}
              extra={
                selectedRequest.status === 'PENDING' && (
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={() => openResponseModal(selectedRequest, 'APPROVE')}
                    >
                      Duyệt
                    </Button>
                    <Button
                      danger
                      size="small"
                      icon={<CloseCircleOutlined />}
                      onClick={() => openResponseModal(selectedRequest, 'REJECT')}
                    >
                      Từ chối
                    </Button>
                  </Space>
                )
              }
            >
              <RequestDetailContent request={selectedRequest} />
            </Card>
          </Col>
        )}
      </Row>

      {/* Mobile detail drawer */}
      <Drawer
        title="Chi tiết yêu cầu"
        placement="bottom"
        height="80%"
        onClose={() => setRequestDetailVisible(false)}
        open={requestDetailVisible}
        styles={{ body: { padding: 0 } }}
        extra={
          selectedRequest?.status === 'PENDING' && (
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => {
                  setRequestDetailVisible(false);
                  openResponseModal(selectedRequest, 'APPROVE');
                }}
              >
                Duyệt
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setRequestDetailVisible(false);
                  openResponseModal(selectedRequest, 'REJECT');
                }}
              >
                Từ chối
              </Button>
            </Space>
          )
        }
      >
        <RequestDetailContent request={selectedRequest} />
      </Drawer>

      {/* Response Modal */}
      <Modal
        title={`${form.getFieldValue('action') === 'APPROVE' ? 'Duyệt' : 'Từ chối'} yêu cầu`}
        open={responseModalVisible}
        onCancel={() => setResponseModalVisible(false)}
        footer={null}
        width={isMobile ? '95%' : 500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleResponse}
        >
          <Form.Item name="action" hidden>
            <Input />
          </Form.Item>
          
          <Alert
            message={`Bạn có chắc chắn muốn ${form.getFieldValue('action') === 'APPROVE' ? 'duyệt' : 'từ chối'} yêu cầu này?`}
            description={selectedRequest && (
              <div>
                <Text strong>{selectedRequest.studentName}</Text> - {selectedRequest.requestTypeDisplayName}
                <br />
                Ngày: {moment(selectedRequest?.requestDate).format('DD/MM/YYYY')}
                <br />
                Lý do: {selectedRequest.reason}
              </div>
            )}
            type={form.getFieldValue('action') === 'APPROVE' ? 'success' : 'warning'}
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Form.Item
            label="Phản hồi"
            name="response"
            rules={[{ required: true, message: 'Vui lòng nhập phản hồi' }]}
          >
            <TextArea
              rows={4}
              placeholder={`Nhập lý do ${form.getFieldValue('action') === 'APPROVE' ? 'duyệt' : 'từ chối'} yêu cầu...`}
            />
          </Form.Item>
          
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setResponseModalVisible(false)}>
                Hủy
              </Button>
              <Button 
                type={form.getFieldValue('action') === 'APPROVE' ? 'primary' : 'danger'}
                htmlType="submit"
                loading={processing}
                icon={form.getFieldValue('action') === 'APPROVE' ? <CheckOutlined /> : <CloseCircleOutlined />}
              >
                {form.getFieldValue('action') === 'APPROVE' ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Mobile floating buttons */}
      {isMobile && (
        <FloatButton.Group
          icon={<BellOutlined />}
          type="primary"
          style={{ right: 16, bottom: 16 }}
        >
          <FloatButton 
            icon={<HistoryOutlined />} 
            tooltip="Lịch sử"
            onClick={() => navigate(`/teaching-assistant/parent-requests-history/${classId}`)}
          />
        </FloatButton.Group>
      )}

      <style jsx>{`
        .request-card {
          transition: all 0.3s;
        }
        .request-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .mobile-request-card {
          margin: 0 0 8px 0;
        }
        @media (max-width: 768px) {
          .ant-card-body {
            padding: 8px !important;
          }
          .ant-btn {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default ParentRequestsModule;