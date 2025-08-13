import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Button, Statistic, Alert, List, Tag } from 'antd';
import { 
  SettingOutlined, 
  UserOutlined, 
  MessageOutlined, 
  BarChartOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { SMSStatisticsDashboard } from '../components/SMS';
import { TeacherEvaluationDashboard } from '../components/TeacherEvaluation';

const { Title, Text, Paragraph } = Typography;

/**
 * System Management Page for Administrators
 * Provides overview and management of Teaching Assistant & SMS systems
 */
const SystemManagement = () => {
  const [systemStatus, setSystemStatus] = useState({
    teachingAssistants: 2,
    teachers: 6,
    totalEvaluations: 0,
    smsEnabled: true,
    smsSent: 0
  });

  useEffect(() => {
    // Mock system status - in real implementation, fetch from APIs
    setTimeout(() => {
      setSystemStatus({
        teachingAssistants: 2,
        teachers: 6,
        totalEvaluations: 18, // 6 teachers × 3 evaluations each
        smsEnabled: true,
        smsSent: 0
      });
    }, 500);
  }, []);

  const systemFeatures = [
    {
      title: 'Hệ Thống Đánh Giá Giảng Viên',
      description: 'Cho phép Trợ Giảng đánh giá giảng viên theo 3 tiêu chí với thang điểm 1-5 sao',
      status: 'active',
      details: [
        'Đánh giá chất lượng giảng dạy',
        'Đánh giá tương tác với học sinh', 
        'Đánh giá tính đúng giờ',
        'Hệ thống thống kê và báo cáo',
        'Giao diện responsive cho mobile'
      ]
    },
    {
      title: 'Hệ Thống SMS Thông Báo',
      description: 'Tự động gửi SMS cho phụ huynh khi học sinh vắng mặt sau 15 phút điểm danh',
      status: 'active',
      details: [
        'Tự động gửi SMS sau 15 phút',
        'Thông báo học sinh vắng mặt',
        'Tích hợp Android SMS Gateway',
        'Hệ thống retry và queue',
        'Dashboard thống kê SMS'
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Tạo Tài Khoản Trợ Giảng',
      description: 'Tạo tài khoản mới với roleId = 6',
      action: () => console.log('Create Teaching Assistant'),
      icon: <UserOutlined />
    },
    {
      title: 'Cấu Hình SMS Gateway',
      description: 'Thiết lập kết nối với Android SMS Gateway',
      action: () => console.log('Configure SMS'),
      icon: <MessageOutlined />
    },
    {
      title: 'Xem Báo Cáo Tổng Quan',
      description: 'Xem thống kê tổng quan hệ thống',
      action: () => console.log('View Reports'),
      icon: <BarChartOutlined />
    }
  ];

  return (
    <div className="system-management">
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <Space>
            <SettingOutlined />
            Quản Lý Hệ Thống
          </Space>
        </Title>
        <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
          Quản lý và theo dõi hệ thống Trợ Giảng & SMS Thông Báo
        </Paragraph>
      </Card>

      {/* System Overview */}
      <Card title="Tổng Quan Hệ Thống" style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="Trợ Giảng"
                value={systemStatus.teachingAssistants}
                prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="Giảng Viên"
                value={systemStatus.teachers}
                prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="Tổng Đánh Giá"
                value={systemStatus.totalEvaluations}
                prefix={<BarChartOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <div style={{ textAlign: 'center' }}>
                <Text strong>Trạng Thái SMS</Text>
                <div style={{ marginTop: 8 }}>
                  {systemStatus.smsEnabled ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      Hoạt động
                    </Tag>
                  ) : (
                    <Tag color="error" icon={<ExclamationCircleOutlined />}>
                      Tạm dừng
                    </Tag>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* System Features */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Tính Năng Hệ Thống" style={{ height: '100%' }}>
            <List
              dataSource={systemFeatures}
              renderItem={(feature) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        {feature.title}
                        <Tag color="green">Hoạt động</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Paragraph style={{ marginBottom: 8 }}>
                          {feature.description}
                        </Paragraph>
                        <ul style={{ marginBottom: 0, paddingLeft: 16 }}>
                          {feature.details.map((detail, index) => (
                            <li key={index}>
                              <Text type="secondary">{detail}</Text>
                            </li>
                          ))}
                        </ul>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Thao Tác Nhanh" style={{ height: '100%' }}>
            <List
              dataSource={quickActions}
              renderItem={(action) => (
                <List.Item
                  actions={[
                    <Button type="primary" onClick={action.action}>
                      Thực hiện
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={action.icon}
                    title={action.title}
                    description={action.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Usage Instructions */}
      <Card title="Hướng Dẫn Sử Dụng">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Alert
              message="Đăng Nhập Trợ Giảng"
              description={
                <div>
                  <p><strong>Tài khoản test:</strong></p>
                  <p>Username: <code>ta1</code> | Password: <code>ta123</code></p>
                  <p>Username: <code>ta2</code> | Password: <code>ta123</code></p>
                  <p>Sau khi đăng nhập, truy cập trang Đánh Giá Giảng Viên để bắt đầu sử dụng.</p>
                </div>
              }
              type="info"
              showIcon
            />
          </Col>
          
          <Col xs={24} lg={12}>
            <Alert
              message="Cấu Hình SMS Gateway"
              description={
                <div>
                  <p><strong>Cần thiết lập:</strong></p>
                  <p>1. Cài đặt Android SMS Gateway app</p>
                  <p>2. Cấu hình biến môi trường SMS_GATEWAY_USERNAME và SMS_GATEWAY_PASSWORD</p>
                  <p>3. Cập nhật số điện thoại phụ huynh cho học sinh</p>
                </div>
              }
              type="warning"
              showIcon
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SystemManagement;