import { CalendarOutlined, DollarOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, Col, message, Row, Statistic, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE } from '../constants/constants';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== ROLE.ACCOUNTANT) {
      navigate('/');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const statsResponse = await api.get('/accountant/dashboard-stats');
        if (statsResponse.data) {
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
      } catch (error) {
        message.error('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>Accountant Dashboard</Title>

      {/* Leave Statistics */}
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
      
      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false}>
            <Statistic
              title="Total Invoices"
              value={dashboardData?.financialStats?.totalInvoices ?? 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false}>
            <Statistic
              title="Paid Invoices"
              value={dashboardData?.financialStats?.paidInvoices ?? 0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false}>
            <Statistic
              title="Pending Payments"
              value={dashboardData?.financialStats?.pendingPayments ?? 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false}>
            <Statistic
              title="Overdue Payments"
              value={dashboardData?.financialStats?.overduePayments ?? 0}
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
            style={{ textAlign: 'center' }}
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
            style={{ textAlign: 'center' }}
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
            style={{ textAlign: 'center' }}
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
            style={{ textAlign: 'center' }}
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
