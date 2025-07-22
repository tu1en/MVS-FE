import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, message, Typography, Divider } from 'antd';
import { DollarOutlined, FileTextOutlined, TeamOutlined, CalendarOutlined, UserOutlined, StopOutlined } from '@ant-design/icons';
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
  const [leaveStats, setLeaveStats] = useState({
    totalAbsences: 0,
    pendingAbsences: 0,
    approvedAbsences: 0,
    annualLeaveBalance: 0
  });
  const [contractStats, setContractStats] = useState({
    totalContracts: 0,
    activeContracts: 0,
    terminatedContracts: 0,
    contractsExpiringSoon: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch dashboard stats
        const statsResponse = await api.get('/accountant/dashboard-stats');
        if (statsResponse.data) {
          // Lấy đúng các trường từ API mới
          setDashboardData({
            financialStats: statsResponse.data.financialStats || { totalInvoices: 0, paidInvoices: 0, pendingPayments: 0, overduePayments: 0 },
            messageStats: statsResponse.data.messageStats || { unreadMessages: 0 }
          });
          setLeaveStats(statsResponse.data.leaveStats || { totalAbsences: 0, pendingAbsences: 0, approvedAbsences: 0, annualLeaveBalance: 0 });
        } else {
          setDashboardData({
            financialStats: { totalInvoices: 0, paidInvoices: 0, pendingPayments: 0, overduePayments: 0 },
            messageStats: { unreadMessages: 0 }
          });
          setLeaveStats({ totalAbsences: 0, pendingAbsences: 0, approvedAbsences: 0, annualLeaveBalance: 0 });
        }
        
        // Fetch contract statistics
        try {
          const contractStatsResponse = await api.get('/contracts/statistics');
          setContractStats(contractStatsResponse.data || {
            totalContracts: 0,
            activeContracts: 0,
            terminatedContracts: 0,
            contractsExpiringSoon: 0
          });
        } catch (error) {
          console.error('Error fetching contract stats:', error);
          setContractStats({
            totalContracts: 0,
            activeContracts: 0,
            terminatedContracts: 0,
            contractsExpiringSoon: 0
          });
        }
      } catch (error) {
        message.error('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Contract Management Section */}
      <Title level={3} style={{ marginBottom: 16 }}>Quản lý Hợp đồng</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false}>
            <Statistic title="Tổng số hợp đồng" value={contractStats?.totalContracts ?? 0} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false}>
            <Statistic title="Hợp đồng đang hoạt động" value={contractStats?.activeContracts ?? 0} prefix={<UserOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false}>
            <Statistic title="Hợp đồng đã chấm dứt" value={contractStats?.terminatedContracts ?? 0} prefix={<StopOutlined />} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false}>
            <Statistic title="Sắp hết hạn (30 ngày)" value={contractStats?.contractsExpiringSoon ?? 0} prefix={<CalendarOutlined />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>
      
      {/* Contract Management Navigation */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            title="Quản lý Hợp đồng"
            bordered={false}
            style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}
            onClick={() => handleCardClick('/accountant/contracts')}
          >
            <FileTextOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <div>Tạo và quản lý hợp đồng lao động</div>
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      {/* Leave Management Section */}
      <Title level={3} style={{ marginBottom: 16 }}>Quản lý Nghỉ phép</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false}>
            <Statistic title="Tổng Đơn Nghỉ Phép" value={leaveStats?.totalAbsences ?? 0} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false}>
            <Statistic title="Đơn Chờ Duyệt" value={leaveStats?.pendingAbsences ?? 0} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false}>
            <Statistic title="Đơn Đã Duyệt" value={leaveStats?.approvedAbsences ?? 0} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false}>
            <Statistic title="Số Ngày Phép Còn Lại" value={leaveStats?.annualLeaveBalance ?? 0} valueStyle={{ color: leaveStats?.annualLeaveBalance > 0 ? '#3f8600' : '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>
      
      {/* Leave Management Navigation */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            title="Quản lý Nghỉ phép"
            bordered={false}
            style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}
            onClick={() => handleCardClick('/accountant/leave-requests')}
          >
            <CalendarOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <div>Quản lý đơn nghỉ phép nhân viên</div>
          </Card>
        </Col>
      </Row>
      </div>
  );
};

export default AccountantDashboard;
