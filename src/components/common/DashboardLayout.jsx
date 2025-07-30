import React from 'react';
import { Layout, Card, Row, Col, Statistic, Typography, Space, Divider } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;

/**
 * Layout chung cho tất cả các dashboard
 * Cung cấp cấu trúc và styling nhất quán
 */
const DashboardLayout = ({ 
  title, 
  subtitle, 
  stats = [], 
  children, 
  actions = null,
  loading = false 
}) => {
  return (
    <div style={{ 
      padding: '24px', 
      minHeight: '100vh', 
      backgroundColor: '#f0f2f5' 
    }}>
      {/* Header Section */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            {title}
          </Title>
          {actions && (
            <Space>
              {actions}
            </Space>
          )}
        </div>
        {subtitle && (
          <Text type="secondary" style={{ fontSize: '16px' }}>
            {subtitle}
          </Text>
        )}
      </div>

      {/* Statistics Cards */}
      {stats.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          {stats.map((stat, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={stat.icon}
                  suffix={stat.suffix}
                  valueStyle={{ 
                    color: stat.color || '#3f8600',
                    fontSize: '24px'
                  }}
                  loading={loading}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Main Content */}
      <Content>
        {children}
      </Content>
    </div>
  );
};

// Predefined icons for common statistics
export const DashboardIcons = {
  user: <UserOutlined />,
  clock: <ClockCircleOutlined />,
  calendar: <CalendarOutlined />,
  document: <FileTextOutlined />,
  warning: <WarningOutlined />,
  success: <CheckCircleOutlined />
};

// Common color schemes
export const DashboardColors = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
  info: '#13c2c2',
  secondary: '#722ed1'
};

export default DashboardLayout;
