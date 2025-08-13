import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, Spin, Alert, Button, Modal, Form, Input, message } from 'antd';
import { 
  MessageOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  ClockCircleOutlined,
  SendOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { getSMSStatistics, getSMSStatus, testSMS } from '../../services/smsService';

const { Title, Text } = Typography;

/**
 * SMS Statistics Dashboard Component
 * Displays comprehensive SMS statistics and allows testing SMS functionality
 */
const SMSStatisticsDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [smsStatus, setSmsStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [testForm] = Form.useForm();
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, statusData] = await Promise.all([
        getSMSStatistics(),
        getSMSStatus()
      ]);
      setStatistics(statsData);
      setSmsStatus(statusData);
    } catch (error) {
      console.error('Error fetching SMS data:', error);
      message.error(error.message || 'Có lỗi xảy ra khi tải dữ liệu SMS');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSMS = async (values) => {
    try {
      setTestLoading(true);
      const result = await testSMS(values.phoneNumber, values.message);
      
      if (result.success) {
        message.success('SMS test thành công!');
        setTestModalVisible(false);
        testForm.resetFields();
      } else {
        message.error(`SMS test thất bại: ${result.message}`);
      }
    } catch (error) {
      console.error('Error testing SMS:', error);
      message.error(error.message || 'Có lỗi xảy ra khi test SMS');
    } finally {
      setTestLoading(false);
    }
  };

  const getSuccessRateColor = (rate) => {
    if (rate >= 90) return '#52c41a'; // green
    if (rate >= 70) return '#faad14'; // yellow
    return '#ff4d4f'; // red
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Đang tải thống kê SMS...</p>
        </div>
      </Card>
    );
  }

  if (!statistics || !smsStatus) {
    return (
      <Alert
        message="Không thể tải dữ liệu SMS"
        description="Vui lòng thử lại sau"
        type="error"
        showIcon
        action={
          <Button size="small" onClick={fetchData}>
            Thử lại
          </Button>
        }
      />
    );
  }

  return (
    <div>
      {/* Service Status */}
      <Card style={{ marginBottom: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <MessageOutlined style={{ marginRight: 8 }} />
              Hệ Thống SMS Thông Báo
            </Title>
            <Text type="secondary">
              Trạng thái: {smsStatus.enabled ? (
                <Text type="success">
                  <CheckCircleOutlined style={{ marginRight: 4 }} />
                  Đã kích hoạt
                </Text>
              ) : (
                <Text type="danger">
                  <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                  Chưa kích hoạt
                </Text>
              )}
            </Text>
          </Col>
          <Col>
            <Button 
              icon={<ReloadOutlined />}
              onClick={fetchData}
              style={{ marginRight: 8 }}
            >
              Làm mới
            </Button>
            {smsStatus.enabled && (
              <Button 
                type="primary" 
                icon={<SendOutlined />}
                onClick={() => setTestModalVisible(true)}
              >
                Test SMS
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      {smsStatus.enabled ? (
        <Row gutter={[24, 24]}>
          {/* Main Statistics */}
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="Tổng số SMS đã gửi"
                value={statistics.totalSent || 0}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="SMS đang chờ gửi"
                value={statistics.totalPending || 0}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="SMS gửi thất bại"
                value={statistics.totalFailed || 0}
                prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="SMS hôm nay"
                value={statistics.sentToday || 0}
                prefix={<MessageOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          {/* Success Rate */}
          <Col xs={24} lg={12}>
            <Card title="Tỷ lệ thành công">
              <div style={{ textAlign: 'center' }}>
                <Progress
                  type="circle"
                  percent={Math.round(statistics.successRate || 0)}
                  strokeColor={getSuccessRateColor(statistics.successRate || 0)}
                  width={120}
                  format={(percent) => `${percent}%`}
                />
                <div style={{ marginTop: 16 }}>
                  <Text strong style={{ fontSize: '16px' }}>
                    Tỷ lệ gửi thành công
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* Status Breakdown */}
          <Col xs={24} lg={12}>
            <Card title="Phân tích chi tiết">
              {statistics.statusBreakdown && Object.keys(statistics.statusBreakdown).length > 0 ? (
                <div>
                  {Object.entries(statistics.statusBreakdown).map(([status, count]) => (
                    <div key={status} style={{ marginBottom: 8 }}>
                      <Text strong>{status}:</Text>
                      <span style={{ float: 'right' }}>{count}</span>
                      <Progress
                        percent={((count / (statistics.totalSent + statistics.totalFailed + statistics.totalPending)) * 100)}
                        showInfo={false}
                        size="small"
                        strokeColor={
                          status === 'SENT' ? '#52c41a' :
                          status === 'PENDING' ? '#faad14' :
                          status === 'FAILED' ? '#ff4d4f' : '#1890ff'
                        }
                        style={{ marginTop: 4 }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Text type="secondary">Chưa có dữ liệu</Text>
              )}
            </Card>
          </Col>
        </Row>
      ) : (
        <Alert
          message="Dịch vụ SMS chưa được kích hoạt"
          description="Vui lòng liên hệ quản trị viên để kích hoạt dịch vụ SMS thông báo."
          type="warning"
          showIcon
        />
      )}

      {/* Test SMS Modal */}
      <Modal
        title="Test SMS"
        open={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={testForm}
          layout="vertical"
          onFinish={handleTestSMS}
          initialValues={{
            message: 'Đây là tin nhắn test từ hệ thống quản lý lớp học.'
          }}
        >
          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9+\-\s()]+$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input 
              placeholder="Ví dụ: +84901234567" 
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="message"
            label="Nội dung tin nhắn"
            rules={[
              { required: true, message: 'Vui lòng nhập nội dung tin nhắn' },
              { max: 160, message: 'Tin nhắn không được vượt quá 160 ký tự' }
            ]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Nhập nội dung tin nhắn test..."
              showCount
              maxLength={160}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button
              onClick={() => setTestModalVisible(false)}
              style={{ marginRight: 8 }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={testLoading}
              icon={<SendOutlined />}
            >
              Gửi Test SMS
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SMSStatisticsDashboard;