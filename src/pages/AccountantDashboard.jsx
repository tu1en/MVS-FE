import {
    CalendarOutlined,
    ContainerOutlined,
    DollarOutlined,
    FileTextOutlined,
    FolderOpenOutlined,
    StopOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Card, Col, Divider, message, Row, Statistic, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE } from '../constants/constants';
import { useBackButton } from '../hooks/useBackButton';
import api from '../services/api.js';

const { Title } = Typography;

const AccountantDashboard = () => {
  const navigate = useNavigate();
  useBackButton();

  const [loading, setLoading] = useState(true);
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
            financialStats: statsResponse.data.financialStats || {},
            messageStats: statsResponse.data.messageStats || {}
          });
          setLeaveStats(statsResponse.data.leaveStats || {});
        }

        try {
          const contractStatsResponse = await api.get('/contracts/stats');
          setContractStats(contractStatsResponse.data || {});
        } catch (error) {
          console.error('Error fetching contract stats:', error);
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
      <Title level={2}>Bảng Điều Khiển Kế Toán</Title>

      {/* Quản lý hợp đồng */}
      <Title level={3}>Quản lý Hợp đồng</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic title="Tổng số hợp đồng" value={contractStats.totalContracts ?? 0} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic title="Đang hoạt động" value={contractStats.activeContracts ?? 0} prefix={<UserOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic title="Đã chấm dứt" value={contractStats.terminatedContracts ?? 0} prefix={<StopOutlined />} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic title="Sắp hết hạn (30 ngày)" value={contractStats.contractsExpiringSoon ?? 0} prefix={<CalendarOutlined />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable title="Quản lý Hợp đồng" bordered={false} style={{ textAlign: 'center' }} onClick={() => handleCardClick('/accountant/contracts')}>
            <ContainerOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <div>Tạo và quản lý hợp đồng lao động</div>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Quản lý nghỉ phép */}
      <Title level={3}>Quản lý Nghỉ phép</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic title="Tổng Đơn Nghỉ Phép" value={leaveStats.totalAbsences ?? 0} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic title="Đơn Chờ Duyệt" value={leaveStats.pendingAbsences ?? 0} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic title="Đơn Đã Duyệt" value={leaveStats.approvedAbsences ?? 0} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic title="Số Ngày Phép Còn Lại" value={leaveStats.annualLeaveBalance ?? 0} valueStyle={{ color: leaveStats.annualLeaveBalance > 0 ? '#3f8600' : '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable title="Quản lý Nghỉ phép" bordered={false} style={{ textAlign: 'center' }} onClick={() => handleCardClick('/accountant/leave-requests')}>
            <CalendarOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <div>Quản lý đơn nghỉ phép nhân viên</div>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Quản lý điểm danh */}
      <Title level={3}>Quản lý Điểm danh</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable title="Giải trình vi phạm" bordered={false} style={{ textAlign: 'center' }} onClick={() => handleCardClick('/accountant/explanation-request')}>
            <FileTextOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <div>Gửi giải trình cho các vi phạm điểm danh</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable title="Trạng thái giải trình" bordered={false} style={{ textAlign: 'center' }} onClick={() => handleCardClick('/accountant/attendance-explanations')}>
            <CalendarOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <div>Xem trạng thái các giải trình đã gửi</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable title="Minh chứng" bordered={false} style={{ textAlign: 'center' }} onClick={() => handleCardClick('/accountant/evidence')}>
            <FolderOpenOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <div>Quản lý và tải lên minh chứng theo giải trình</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable title="Lịch sử chấm công" bordered={false} style={{ textAlign: 'center' }} onClick={() => handleCardClick('/accountant/attendance-history')}>
            <UserOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
            <div>Xem lịch sử chấm công cá nhân</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable title="Tạo bảng lương" bordered={false} style={{ textAlign: 'center' }} onClick={() => handleCardClick('/accountant/payroll')}>
            <DollarOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <div>Tạo bảng lương dựa trên điểm danh và giờ dạy</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable title="Báo Cáo Chấm Công" bordered={false} style={{ textAlign: 'center' }} onClick={() => handleCardClick('/accountant/attendance-reports')}>
            <CalendarOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <div>Báo cáo chấm công và thống kê</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable title="Chấm công" bordered={false} style={{ textAlign: 'center' }} onClick={() => handleCardClick('/accountant/attendance')}>
            <UserOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <div>Thực hiện chấm công hàng ngày</div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AccountantDashboard;