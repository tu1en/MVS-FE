import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, message, Typography, Divider } from 'antd';
import { DollarOutlined, FileTextOutlined, TeamOutlined, CalendarOutlined, UserOutlined, StopOutlined, ContainerOutlined } from '@ant-design/icons';
import api from '../utils/api.js';
import { useBackButton } from '../hooks/useBackButton';

const { Title } = Typography;

const AccountantDashboard = () => {
  const navigate = useNavigate();
  useBackButton(); // Thêm hook xử lý nút back
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
      
      {/* Management Navigation */}
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
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            title="Quản lý Hợp đồng"
            bordered={false}
            style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}
            onClick={() => handleCardClick('/accountant/contracts')}
          >
            <ContainerOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <div>Quản lý hợp đồng Giáo viên & Nhân viên</div>
          </Card>
        </Col>
      </Row>
      </div>
  );
};

export default AccountantDashboard;
