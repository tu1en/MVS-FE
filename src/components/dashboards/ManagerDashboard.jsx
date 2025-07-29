import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Tabs, 
  Alert,
  Spin,
  message,
  Modal,
  Typography
} from 'antd';
import {
  TeamOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import DashboardLayout, { DashboardIcons, DashboardColors } from '../common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { managerService } from '../../services/managerService';
import absenceService from '../../services/absenceService';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

/**
 * Dashboard dành cho Manager/HR
 * Hiển thị tổng quan quản lý nhân sự và các chức năng quản lý
 */
const ManagerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({});
  const [pendingRequests, setPendingRequests] = useState([]);
  const [recentViolations, setRecentViolations] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard statistics
      const [statsResponse, pendingResponse] = await Promise.all([
        managerService.getDashboardStats?.() || Promise.resolve({ data: {} }),
        absenceService.getPendingAbsenceRequests()
      ]);

      setDashboardStats(statsResponse.data || {});
      setPendingRequests(pendingResponse.data || []);
      
      // Mock recent violations data (replace with actual API call)
      setRecentViolations([
        {
          id: 1,
          employeeName: 'Nguyễn Văn A',
          violationType: 'Đi muộn',
          date: '2024-01-15',
          severity: 'medium'
        },
        {
          id: 2,
          employeeName: 'Trần Thị B',
          violationType: 'Về sớm',
          date: '2024-01-14',
          severity: 'low'
        }
      ]);

    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
      message.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Statistics for dashboard
  const stats = [
    {
      title: 'Tổng số nhân viên',
      value: dashboardStats.totalEmployees || 0,
      icon: DashboardIcons.user,
      color: DashboardColors.primary
    },
    {
      title: 'Đơn chờ duyệt',
      value: pendingRequests.length,
      icon: DashboardIcons.document,
      color: DashboardColors.warning
    },
    {
      title: 'Vi phạm chấm công',
      value: recentViolations.length,
      icon: DashboardIcons.warning,
      color: DashboardColors.error
    },
    {
      title: 'Ca làm việc hôm nay',
      value: dashboardStats.todayShifts || 0,
      icon: DashboardIcons.clock,
      color: DashboardColors.success
    }
  ];

  // Columns for pending requests table
  const pendingRequestsColumns = [
    {
      title: 'Nhân viên',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Loại đơn',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color="blue">
          {type === 'SICK_LEAVE' ? 'Nghỉ ốm' : 
           type === 'ANNUAL_LEAVE' ? 'Nghỉ phép' : 
           type === 'PERSONAL_LEAVE' ? 'Nghỉ cá nhân' : type}
        </Tag>
      )
    },
    {
      title: 'Từ ngày',
      dataIndex: 'startDate',
      key: 'startDate'
    },
    {
      title: 'Đến ngày',
      dataIndex: 'endDate',
      key: 'endDate'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color="orange">Chờ duyệt</Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleApproveRequest(record.id)}
          >
            Duyệt
          </Button>
          <Button 
            danger 
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={() => handleRejectRequest(record.id)}
          >
            Từ chối
          </Button>
        </Space>
      )
    }
  ];

  // Columns for violations table
  const violationsColumns = [
    {
      title: 'Nhân viên',
      dataIndex: 'employeeName',
      key: 'employeeName'
    },
    {
      title: 'Loại vi phạm',
      dataIndex: 'violationType',
      key: 'violationType'
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={
          severity === 'high' ? 'red' : 
          severity === 'medium' ? 'orange' : 'green'
        }>
          {severity === 'high' ? 'Nghiêm trọng' : 
           severity === 'medium' ? 'Trung bình' : 'Nhẹ'}
        </Tag>
      )
    }
  ];

  const handleApproveRequest = async (requestId) => {
    try {
      await absenceService.approveAbsenceRequest(requestId);
      message.success('Đã duyệt đơn thành công');
      loadDashboardData(); // Reload data
    } catch (error) {
      console.error('Lỗi khi duyệt đơn:', error);
      message.error('Không thể duyệt đơn');
    }
  };

  const handleRejectRequest = (requestId) => {
    Modal.confirm({
      title: 'Từ chối đơn xin nghỉ',
      content: 'Bạn có chắc chắn muốn từ chối đơn này?',
      onOk: async () => {
        try {
          await absenceService.rejectAbsenceRequest(requestId, 'Không đủ điều kiện');
          message.success('Đã từ chối đơn');
          loadDashboardData(); // Reload data
        } catch (error) {
          console.error('Lỗi khi từ chối đơn:', error);
          message.error('Không thể từ chối đơn');
        }
      }
    });
  };

  const dashboardActions = (
    <Space>
      <Button 
        type="primary" 
        icon={<CalendarOutlined />}
        onClick={() => window.location.href = '/manager/shifts'}
      >
        Quản lý ca làm việc
      </Button>
      <Button 
        icon={<BarChartOutlined />}
        onClick={() => window.location.href = '/manager/reports'}
      >
        Xem báo cáo
      </Button>
    </Space>
  );

  return (
    <DashboardLayout
      title="Dashboard Quản lý"
      subtitle={`Chào mừng ${user?.fullName || user?.username}, hôm nay là ${new Date().toLocaleDateString('vi-VN')}`}
      stats={stats}
      actions={dashboardActions}
      loading={loading}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane 
          tab={
            <span>
              <TeamOutlined />
              Tổng quan
            </span>
          } 
          key="overview"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <span>
                    <FileTextOutlined style={{ marginRight: 8 }} />
                    Đơn xin nghỉ chờ duyệt
                  </span>
                }
                extra={
                  <Button 
                    type="link" 
                    onClick={() => window.location.href = '/manager/leave-requests'}
                  >
                    Xem tất cả
                  </Button>
                }
              >
                <Table
                  dataSource={pendingRequests.slice(0, 5)}
                  columns={pendingRequestsColumns}
                  pagination={false}
                  size="small"
                  loading={loading}
                  locale={{ emptyText: 'Không có đơn nào chờ duyệt' }}
                />
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <span>
                    <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                    Vi phạm chấm công gần đây
                  </span>
                }
                extra={
                  <Button 
                    type="link"
                    onClick={() => navigate('/manager/attendance/teacher-status')}
                  >
                    Xem tất cả
                  </Button>
                }
              >
                <Table
                  dataSource={recentViolations}
                  columns={violationsColumns}
                  pagination={false}
                  size="small"
                  loading={loading}
                  locale={{ emptyText: 'Không có vi phạm nào' }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <ClockCircleOutlined />
              Ca làm việc hôm nay
            </span>
          } 
          key="shifts"
        >
          <Card>
            <Alert
              message="Tính năng đang phát triển"
              description="Hiển thị danh sách ca làm việc hôm nay và trạng thái chấm công của nhân viên"
              type="info"
              showIcon
            />
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <BarChartOutlined />
              Báo cáo nhanh
            </span>
          } 
          key="reports"
        >
          <Card>
            <Alert
              message="Tính năng đang phát triển"
              description="Hiển thị các báo cáo nhanh về hiệu suất làm việc và chấm công"
              type="info"
              showIcon
            />
          </Card>
        </TabPane>
      </Tabs>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
