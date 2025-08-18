import { DollarOutlined, DownloadOutlined, TeamOutlined, TrendingUpOutlined } from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import { Alert, Button, Card, Col, DatePicker, Progress, Row, Select, Space, Statistic, Table, Tag } from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

const { Option } = Select;
const { MonthPicker } = DatePicker;

/**
 * Component dashboard tổng quan bảng lương
 */
const PayrollDashboard = ({ userRole = 'EMPLOYEE' }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(moment());
  const [statistics, setStatistics] = useState(null);
  const [departmentSummary, setDepartmentSummary] = useState([]);
  const [topEarners, setTopEarners] = useState([]);
  const [trends, setTrends] = useState([]);
  const [processingStatus, setProcessingStatus] = useState(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const year = selectedPeriod.year();
      const month = selectedPeriod.month() + 1;

      // Load statistics for managers/admins
      if (userRole === 'MANAGER' || userRole === 'ADMIN') {
        await Promise.all([
          loadPayrollStatistics(year, month),
          loadDepartmentSummary(year, month),
          loadTopEarners(year, month),
          loadPayrollTrends(),
          loadProcessingStatus(year, month)
        ]);
      } else {
        // Load personal data for employees
        await loadPersonalPayrollData(year);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPayrollStatistics = async (year, month) => {
    try {
      const response = await axios.get('/api/hr/salary/statistics/period', {
        params: { year, month }
      });
      setStatistics(response.data);
    } catch (error) {
      console.error('Error loading payroll statistics:', error);
    }
  };

  const loadDepartmentSummary = async (year, month) => {
    try {
      const response = await axios.get('/api/hr/salary/statistics/department', {
        params: { year, month }
      });
      setDepartmentSummary(response.data);
    } catch (error) {
      console.error('Error loading department summary:', error);
    }
  };

  const loadTopEarners = async (year, month) => {
    try {
      const response = await axios.get('/api/hr/salary/statistics/top-earners', {
        params: { year, month, limit: 10 }
      });
      setTopEarners(response.data);
    } catch (error) {
      console.error('Error loading top earners:', error);
    }
  };

  const loadPayrollTrends = async () => {
    try {
      const response = await axios.get('/api/hr/salary/statistics/trends', {
        params: { months: 12 }
      });
      setTrends(response.data);
    } catch (error) {
      console.error('Error loading payroll trends:', error);
    }
  };

  const loadProcessingStatus = async (year, month) => {
    try {
      const response = await axios.get('/api/hr/salary/statistics/processing-status', {
        params: { year, month }
      });
      setProcessingStatus(response.data);
    } catch (error) {
      console.error('Error loading processing status:', error);
    }
  };

  const loadPersonalPayrollData = async (year) => {
    try {
      const response = await axios.get('/api/hr/salary/statistics/my-yearly', {
        params: { year }
      });
      setTrends(response.data);
    } catch (error) {
      console.error('Error loading personal payroll data:', error);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Statistics cards for managers/admins
  const renderStatisticsCards = () => {
    if (!statistics) return null;

    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số bảng lương"
              value={statistics.totalPayrolls}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        {/* Ẩn thống kê tổng lương gộp */}
        {/* <Col span={6}>
          <Card>
            <Statistic
              title="Tổng lương gộp"
              value={statistics.totalGrossSalary}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col> */}
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng lương thực nhận"
              value={statistics.totalNetSalary}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Lương TB/người"
              value={statistics.averageNetSalary}
              formatter={(value) => formatCurrency(value)}
              prefix={<TrendingUpOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // Processing status for current period
  const renderProcessingStatus = () => {
    if (!processingStatus) return null;

    const completionRate = processingStatus.totalEmployees > 0 
      ? (processingStatus.processedCount / processingStatus.totalEmployees) * 100 
      : 0;

    return (
      <Card title="Trạng thái xử lý bảng lương" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Progress
              type="circle"
              percent={Math.round(completionRate)}
              format={() => `${processingStatus.processedCount}/${processingStatus.totalEmployees}`}
            />
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <strong>Tiến độ xử lý</strong>
            </div>
          </Col>
          <Col span={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Tag color="green">Đã xử lý: {processingStatus.processedCount}</Tag>
              </div>
              <div>
                <Tag color="orange">Chờ xử lý: {processingStatus.pendingCount}</Tag>
              </div>
              <div>
                <Tag color="red">Lỗi: {processingStatus.errorCount}</Tag>
              </div>
              <div>
                <Tag color={processingStatus.isCompleted ? 'green' : 'blue'}>
                  {processingStatus.isCompleted ? 'Hoàn thành' : 'Đang xử lý'}
                </Tag>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  // Department summary table
  const renderDepartmentSummary = () => {
    const columns = [
      {
        title: 'Phòng ban',
        dataIndex: 'department',
        key: 'department',
        render: (text) => text || 'Chưa phân loại'
      },
      {
        title: 'Số nhân viên',
        dataIndex: 'employeeCount',
        key: 'employeeCount',
        align: 'center'
      },
      // Ẩn cột tổng lương gộp
      // {
      //   title: 'Tổng lương gộp',
      //   dataIndex: 'totalGrossSalary',
      //   key: 'totalGrossSalary',
      //   render: (value) => formatCurrency(value),
      //   align: 'right'
      // },
      {
        title: 'Tổng lương thực nhận',
        dataIndex: 'totalNetSalary',
        key: 'totalNetSalary',
        render: (value) => formatCurrency(value),
        align: 'right'
      },
      {
        title: 'Lương TB/người',
        dataIndex: 'averageNetSalary',
        key: 'averageNetSalary',
        render: (value) => formatCurrency(value),
        align: 'right'
      }
    ];

    return (
      <Card title="Tổng hợp theo phòng ban" style={{ marginBottom: 24 }}>
        <Table
          columns={columns}
          dataSource={departmentSummary}
          rowKey="department"
          pagination={false}
          size="small"
        />
      </Card>
    );
  };

  // Top earners table
  const renderTopEarners = () => {
    const columns = [
      {
        title: 'STT',
        key: 'index',
        render: (_, __, index) => index + 1,
        width: 50,
        align: 'center'
      },
      {
        title: 'Nhân viên',
        key: 'employee',
        render: (_, record) => (
          <div>
            <div>{record.user?.fullName}</div>
            <small style={{ color: '#666' }}>{record.user?.email}</small>
          </div>
        )
      },
      {
        title: 'Phòng ban',
        dataIndex: ['user', 'department'],
        key: 'department',
        render: (text) => text || 'Chưa phân loại'
      },
      {
        title: 'Lương thực nhận',
        dataIndex: 'netSalary',
        key: 'netSalary',
        render: (value) => formatCurrency(value),
        align: 'right'
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
          const colors = {
            'CALCULATED': 'blue',
            'APPROVED': 'green',
            'PAID': 'purple'
          };
          return <Tag color={colors[status]}>{status}</Tag>;
        }
      }
    ];

    return (
      <Card title="Top 10 thu nhập cao nhất" style={{ marginBottom: 24 }}>
        <Table
          columns={columns}
          dataSource={topEarners}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    );
  };

  // Payroll trends chart
  const renderTrendsChart = () => {
    if (!trends || trends.length === 0) return null;

    const chartData = trends.map(item => ({
      period: `${item.month}/${item.year}`,
      totalNetSalary: item.totalNetSalary || item.netSalary || 0,
      payrollCount: item.payrollCount || 1
    }));

    const config = {
      data: chartData,
      xField: 'period',
      yField: 'totalNetSalary',
      point: {
        size: 5,
        shape: 'diamond',
      },
      label: {
        style: {
          fill: '#aaa',
        },
      },
      tooltip: {
        formatter: (datum) => ({
          name: 'Tổng lương',
          value: formatCurrency(datum.totalNetSalary)
        })
      }
    };

    const title = userRole === 'EMPLOYEE' ? 'Lịch sử lương của tôi' : 'Xu hướng tổng lương công ty';

    return (
      <Card title={title} style={{ marginBottom: 24 }}>
        <Line {...config} />
      </Card>
    );
  };

  // Department distribution chart
  const renderDepartmentChart = () => {
    if (!departmentSummary || departmentSummary.length === 0) return null;

    const chartData = departmentSummary.map(item => ({
      department: item.department || 'Chưa phân loại',
      value: item.totalNetSalary
    }));

    const config = {
      appendPadding: 10,
      data: chartData,
      angleField: 'value',
      colorField: 'department',
      radius: 0.8,
      label: {
        type: 'outer',
        content: '{name} {percentage}',
      },
      interactions: [
        {
          type: 'element-selected',
        },
        {
          type: 'element-active',
        },
      ],
      tooltip: {
        formatter: (datum) => ({
          name: datum.department,
          value: formatCurrency(datum.value)
        })
      }
    };

    return (
      <Card title="Phân bổ lương theo phòng ban" style={{ marginBottom: 24 }}>
        <Pie {...config} />
      </Card>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard Bảng lương</h2>
        <Space>
          <MonthPicker
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            format="MM/YYYY"
            placeholder="Chọn tháng"
          />
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => window.open('/api/hr/reports/generate?templateId=1&format=PDF')}
          >
            Xuất báo cáo
          </Button>
        </Space>
      </div>

      {/* Manager/Admin Dashboard */}
      {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
        <>
          {renderStatisticsCards()}
          {renderProcessingStatus()}
          
          <Row gutter={16}>
            <Col span={16}>
              {renderDepartmentSummary()}
              {renderTrendsChart()}
            </Col>
            <Col span={8}>
              {renderTopEarners()}
              {renderDepartmentChart()}
            </Col>
          </Row>
        </>
      )}

      {/* Employee Dashboard */}
      {userRole === 'EMPLOYEE' && (
        <Row gutter={16}>
          <Col span={24}>
            {renderTrendsChart()}
            
            <Card title="Thông tin bảng lương hiện tại">
              <Alert
                message="Thông tin bảng lương"
                description="Bảng lương tháng hiện tại đang được xử lý. Vui lòng kiểm tra lại sau."
                type="info"
                showIcon
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default PayrollDashboard;
