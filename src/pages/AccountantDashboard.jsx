import { CalendarOutlined, DollarOutlined, FileTextOutlined, StopOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, Divider, message, Row, Statistic, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE } from '../constants/constants';
import { useBackButton } from '../hooks/useBackButton';
import api from '../services/api.js';

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
  const [contractStats, setContractStats] = useState({
    totalContracts: 0,
    activeContracts: 0,
    terminatedContracts: 0,
    contractsExpiringSoon: 0
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
  }, [navigate]);

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>Bảng Điều Khiển Kế Toán</Title>
      
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
      
      <Divider />
      
      {/* Financial Statistics Section */}
      <Title level={3} style={{ marginBottom: 16 }}>Thống kê Tài chính</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false}>
            <Statistic
              title="Tổng Hóa Đơn"
              value={dashboardData?.financialStats?.totalInvoices ?? 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false}>
            <Statistic
              title="Hóa Đơn Đã Thanh Toán"
              value={dashboardData?.financialStats?.paidInvoices ?? 0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false}>
            <Statistic
              title="Thanh Toán Chờ Xử Lý"
              value={dashboardData?.financialStats?.pendingPayments ?? 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} bordered={false}>
            <Statistic
              title="Thanh Toán Quá Hạn"
              value={dashboardData?.financialStats?.overduePayments ?? 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Financial Management Navigation */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            title="Quản Lý Hóa Đơn"
            bordered={false}
            style={{ textAlign: 'center' }}
            onClick={() => handleCardClick('/accountant/invoices')}
          >
            <FileTextOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <div>Quản lý hóa đơn và thanh toán của học sinh</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            title="Theo Dõi Thanh Toán"
            bordered={false}
            style={{ textAlign: 'center' }}
            onClick={() => handleCardClick('/accountant/payments')}
          >
            <DollarOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <div>Theo dõi trạng thái và lịch sử thanh toán</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            title="Báo Cáo Tài Chính"
            bordered={false}
            style={{ textAlign: 'center' }}
            onClick={() => handleCardClick('/accountant/reports')}
          >
            <CalendarOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <div>Tạo báo cáo tài chính</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            title="Tài Khoản Học Sinh"
            bordered={false}
            style={{ textAlign: 'center' }}
            onClick={() => handleCardClick('/accountant/students')}
          >
            <TeamOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <div>Quản lý tài khoản tài chính của học sinh</div>
          </Card>
        </Col>
      </Row>
      </div>
  );
};

export default AccountantDashboard;