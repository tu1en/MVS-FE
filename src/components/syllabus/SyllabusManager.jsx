// src/components/syllabus/SyllabusManager.jsx
import {
  BookOutlined,
  DashboardOutlined,
  DownloadOutlined,
  FileTextOutlined,
  RiseOutlined,
  SettingOutlined,
  UploadOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Alert, Button, Card, Col, Row, Space, Statistic, Tabs, Typography } from 'antd';
import { useState } from 'react';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const SyllabusManager = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [stats] = useState({
    totalTemplates: 15,
    activeTemplates: 12,
    totalSubjects: 8,
    totalUsage: 156,
  });

  // Handle quick actions
  const handleDownloadTemplate = async () => {
    try {
      // Simulate download
      console.log('Downloading template...');
      // In real implementation, call API here
      alert('Template Excel đã được tải xuống thành công!');
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleImportExcel = () => {
    setShowImportWizard(true);
    console.log('Opening import wizard...');
    alert('Chức năng Import Excel đang được phát triển...');
  };

  const handleViewTemplates = () => {
    setActiveTab('templates');
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px 24px', 
        marginBottom: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BookOutlined style={{ fontSize: '32px', color: '#1890ff', marginRight: '16px' }} />
            <div>
              <Title level={2} style={{ margin: '0 0 8px 0', color: '#001529' }}>
                📚 LMS - Quản lý Kế hoạch Dạy học
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Hệ thống quản lý syllabus và template giảng dạy
              </Text>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Text type="secondary">
              👤 Manager: <Text strong>Nguyễn Văn A</Text>
            </Text>
            <Button type="default">
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card style={{ marginBottom: '24px' }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
          size="large"
        >
          <TabPane 
            tab={
              <span>
                <DashboardOutlined />
                🏠 Dashboard
              </span>
            } 
            key="dashboard" 
          />
          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                📚 Templates
              </span>
            } 
            key="templates" 
          />
          <TabPane 
            tab={
              <span>
                <RiseOutlined />
                📊 Analytics
              </span>
            } 
            key="analytics" 
          />
          <TabPane 
            tab={
              <span>
                <SettingOutlined />
                ⚙️ Settings
              </span>
            } 
            key="settings" 
          />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Stats Overview */}
          <div style={{ marginBottom: '32px' }}>
            <Title level={3} style={{ marginBottom: '20px' }}>
              🎯 Tổng quan hệ thống
            </Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Tổng Templates"
                    value={stats.totalTemplates}
                    prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                    valueStyle={{ color: '#1890ff' }}
                    suffix="template"
                  />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Đã tạo trong hệ thống
                  </Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Templates Active"
                    value={stats.activeTemplates}
                    prefix={<BookOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                    suffix="active"
                  />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Đang được sử dụng
                  </Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Môn học"
                    value={stats.totalSubjects}
                    prefix={<UserOutlined style={{ color: '#722ed1' }} />}
                    valueStyle={{ color: '#722ed1' }}
                    suffix="môn"
                  />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Đã có template
                  </Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Lượt sử dụng"
                    value={stats.totalUsage}
                    prefix={<RiseOutlined style={{ color: '#fa8c16' }} />}
                    valueStyle={{ color: '#fa8c16' }}
                    suffix="lượt"
                  />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Template downloads
                  </Text>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '32px' }}>
            <Title level={3} style={{ marginBottom: '20px' }}>
              🚀 Thao tác nhanh
            </Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card
                  hoverable
                  style={{ textAlign: 'center', cursor: 'pointer', borderLeft: '4px solid #1890ff' }}
                  onClick={handleDownloadTemplate}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <DownloadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                    <div>
                      <Title level={4} style={{ marginBottom: '8px' }}>
                        📥 Tải Template Excel
                      </Title>
                      <Text type="secondary">
                        Download file mẫu để tạo kế hoạch dạy học
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
              
              <Col xs={24} md={8}>
                <Card
                  hoverable
                  style={{ textAlign: 'center', cursor: 'pointer', borderLeft: '4px solid #52c41a' }}
                  onClick={handleImportExcel}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <UploadOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                    <div>
                      <Title level={4} style={{ marginBottom: '8px' }}>
                        📤 Import Excel
                      </Title>
                      <Text type="secondary">
                        Upload file Excel đã điền để tạo template
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
              
              <Col xs={24} md={8}>
                <Card
                  hoverable
                  style={{ textAlign: 'center', cursor: 'pointer', borderLeft: '4px solid #722ed1' }}
                  onClick={handleViewTemplates}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <BookOutlined style={{ fontSize: '48px', color: '#722ed1' }} />
                    <div>
                      <Title level={4} style={{ marginBottom: '8px' }}>
                        📚 Xem Templates
                      </Title>
                      <Text type="secondary">
                        Quản lý và chỉnh sửa các template hiện có
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Recent Activity */}
          <div style={{ marginBottom: '32px' }}>
            <Title level={3} style={{ marginBottom: '20px' }}>
              📈 Hoạt động gần đây
            </Title>
            <Card>
              <div style={{ padding: '20px' }}>
                {[
                  {
                    action: 'Tạo template mới',
                    subject: 'Vật Lý 10',
                    time: '2 giờ trước',
                    user: 'Nguyễn Văn A',
                    type: 'create'
                  },
                  {
                    action: 'Cập nhật template',
                    subject: 'Toán 11',
                    time: '5 giờ trước',
                    user: 'Trần Thị B',
                    type: 'update'
                  },
                  {
                    action: 'Download template',
                    subject: 'Hóa học 12',
                    time: '1 ngày trước',
                    user: 'Lê Văn C',
                    type: 'download'
                  },
                ].map((activity, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index < 2 ? '1px solid #f0f0f0' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: activity.type === 'create' ? '#52c41a' :
                          activity.type === 'update' ? '#1890ff' : '#8c8c8c'
                      }} />
                      <div>
                        <Text strong>
                          {activity.action}: <Text style={{ color: '#1890ff' }}>{activity.subject}</Text>
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          bởi {activity.user}
                        </Text>
                      </div>
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {activity.time}
                    </Text>
                  </div>
                ))}
                
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <Button type="default">
                    Xem tất cả hoạt động
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* System Status */}
          <div>
            <Title level={3} style={{ marginBottom: '20px' }}>
              ⚡ Trạng thái hệ thống
            </Title>
            <Card>
              <Row gutter={[24, 24]} style={{ textAlign: 'center' }}>
                <Col xs={24} sm={8}>
                  <Space direction="vertical" size="small">
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: '#52c41a', 
                      borderRadius: '50%',
                      margin: '0 auto'
                    }} />
                    <Title level={5} style={{ margin: '8px 0 4px 0' }}>
                      Server Status
                    </Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Hoạt động bình thường
                    </Text>
                  </Space>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Space direction="vertical" size="small">
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: '#52c41a', 
                      borderRadius: '50%',
                      margin: '0 auto'
                    }} />
                    <Title level={5} style={{ margin: '8px 0 4px 0' }}>
                      Database
                    </Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Kết nối ổn định
                    </Text>
                  </Space>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Space direction="vertical" size="small">
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: '#52c41a', 
                      borderRadius: '50%',
                      margin: '0 auto'
                    }} />
                    <Title level={5} style={{ margin: '8px 0 4px 0' }}>
                      File Storage
                    </Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Sẵn sàng upload
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Card>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FileTextOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
            <Title level={3} style={{ color: '#8c8c8c' }}>
              📚 Template Library
            </Title>
            <Text type="secondary">
              Chức năng quản lý template đang được phát triển...
            </Text>
          </div>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <RiseOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
            <Title level={3} style={{ color: '#8c8c8c' }}>
              📊 Analytics Dashboard
            </Title>
            <Text type="secondary">
              Chức năng thống kê và báo cáo đang được phát triển...
            </Text>
          </div>
        </Card>
      )}

      Settings Tab
      {activeTab === 'settings' && (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <SettingOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
            <Title level={3} style={{ color: '#8c8c8c' }}>
              ⚙️ System Settings
            </Title>
            <Text type="secondary">
              Cài đặt hệ thống đang được phát triển...
            </Text>
          </div>
        </Card>
      )}

      {/* Development Notice */}
      <Alert
        message="🔧 Đang phát triển"
        description="Syllabus Management System đang được tích hợp. Các chức năng Excel import/export sẽ sớm hoàn thiện."
        type="info"
        showIcon
        style={{ marginTop: '24px' }}
      />
    </div>
  );
};

export default SyllabusManager;