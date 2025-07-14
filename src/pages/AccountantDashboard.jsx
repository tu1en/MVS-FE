import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, message, Typography } from 'antd';
import { DollarOutlined, FileTextOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';
import api from '../utils/api.js';

const { Title } = Typography;

const AccountantDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    financialStats: {
      totalInvoices: 0,
      paidInvoices: 0,
      pendingPayments: 0,
      overduePayments: 0
    },
    messageStats: {
      unreadMessages: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Loading accountant dashboard data...');
        setLoading(true);
        
        // Fetch dashboard stats
        const statsResponse = await api.get('/accountant/dashboard-stats');
        
        let newDashboardData = { ...dashboardData };
        if (statsResponse.data) {
          newDashboardData = statsResponse.data;
          console.log('Dashboard stats loaded successfully:', newDashboardData);
        } else {
          console.error('Invalid response format for dashboard stats');
        }

        setDashboardData(newDashboardData);
      } catch (error) {
        console.error('Error loading accountant dashboard data:', error);
        message.error('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>Accountant Dashboard</Title>
      
      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <Statistic
              title="Total Invoices"
              value={dashboardData.financialStats.totalInvoices}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <Statistic
              title="Paid Invoices"
              value={dashboardData.financialStats.paidInvoices}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <Statistic
              title="Pending Payments"
              value={dashboardData.financialStats.pendingPayments}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <Statistic
              title="Overdue Payments"
              value={dashboardData.financialStats.overduePayments}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Navigation Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            title="Invoice Management"
            bordered={false}
            style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}
            onClick={() => handleCardClick('/accountant/invoices')}
          >
            <FileTextOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <div>Manage student invoices and payments</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            title="Payment Tracking"
            bordered={false}
            style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}
            onClick={() => handleCardClick('/accountant/payments')}
          >
            <DollarOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <div>Track payment status and history</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            title="Financial Reports"
            bordered={false}
            style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}
            onClick={() => handleCardClick('/accountant/reports')}
          >
            <CalendarOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <div>Generate financial reports</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            title="Student Accounts"
            bordered={false}
            style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}
            onClick={() => handleCardClick('/accountant/students')}
          >
            <TeamOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <div>Manage student financial accounts</div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AccountantDashboard;
