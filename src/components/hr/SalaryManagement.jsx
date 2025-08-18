import { CalculatorOutlined, CheckOutlined, DollarOutlined, EyeOutlined, FileExcelOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, message, Modal, Row, Select, Space, Statistic, Table, Tabs, Tag } from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

const { Option } = Select;
const { MonthPicker } = DatePicker;
const { TabPane } = Tabs;

/**
 * Component quản lý bảng lương
 */
const SalaryManagement = ({ userRole = 'MANAGER' }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(moment());
  const [payrolls, setPayrolls] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [activeTab, setActiveTab] = useState('payrolls');
  const [statistics, setStatistics] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Load data when period or status changes
  useEffect(() => {
    loadPayrolls();
    loadStatistics();
  }, [selectedPeriod, selectedStatus]);

  // Load payrolls
  const loadPayrolls = async () => {
    setLoading(true);
    try {
      const year = selectedPeriod.year();
      const month = selectedPeriod.month() + 1;

      let endpoint = '/api/hr/salary/payrolls/period';
      let params = { year, month };

      if (selectedStatus !== 'ALL') {
        endpoint = `/api/hr/salary/payrolls/status/${selectedStatus}`;
        params = {};
      }

      const response = await axios.get(endpoint, { params });
      setPayrolls(response.data.content);
    } catch (error) {
      console.error('Error loading payrolls:', error);
      message.error('Lỗi khi tải danh sách bảng lương');
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    try {
      const year = selectedPeriod.year();
      const month = selectedPeriod.month() + 1;

      const response = await axios.get('/api/hr/salary/statistics/period', {
        params: { year, month }
      });
      setStatistics(response.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  // Calculate payroll for all users
  const handleCalculateAll = async () => {
    Modal.confirm({
      title: 'Xác nhận tính lương',
      content: `Bạn có chắc chắn muốn tính lương cho tất cả nhân viên trong tháng ${selectedPeriod.format('MM/YYYY')}?`,
      onOk: async () => {
        try {
          setLoading(true);
          const year = selectedPeriod.year();
          const month = selectedPeriod.month() + 1;

          await axios.post('/api/hr/salary/calculate-all', null, {
            params: { year, month }
          });

          message.success('Tính lương thành công cho tất cả nhân viên');
          loadPayrolls();
          loadStatistics();
        } catch (error) {
          console.error('Error calculating payrolls:', error);
          message.error('Lỗi khi tính lương: ' + (error.response?.data?.message || error.message));
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Recalculate specific payroll
  const handleRecalculate = async (payrollId) => {
    try {
      await axios.put(`/api/hr/salary/recalculate/${payrollId}`);
      message.success('Tính lại lương thành công');
      loadPayrolls();
    } catch (error) {
      console.error('Error recalculating payroll:', error);
      message.error('Lỗi khi tính lại lương');
    }
  };

  // Approve payroll
  const handleApprove = async (payrollId) => {
    try {
      await axios.put(`/api/hr/salary/payroll/${payrollId}/approve`);
      message.success('Phê duyệt bảng lương thành công');
      loadPayrolls();
    } catch (error) {
      console.error('Error approving payroll:', error);
      message.error('Lỗi khi phê duyệt bảng lương');
    }
  };

  // Bulk approve payrolls
  const handleBulkApprove = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một bảng lương');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận phê duyệt',
      content: `Bạn có chắc chắn muốn phê duyệt ${selectedRowKeys.length} bảng lương đã chọn?`,
      onOk: async () => {
        try {
          await axios.put('/api/hr/salary/payrolls/approve', selectedRowKeys);
          message.success(`Phê duyệt thành công ${selectedRowKeys.length} bảng lương`);
          setSelectedRowKeys([]);
          loadPayrolls();
        } catch (error) {
          console.error('Error bulk approving payrolls:', error);
          message.error('Lỗi khi phê duyệt hàng loạt');
        }
      }
    });
  };

  // Mark as paid
  const handleMarkAsPaid = async (payrollId) => {
    Modal.confirm({
      title: 'Xác nhận thanh toán',
      content: 'Bạn có chắc chắn đã thanh toán lương cho nhân viên này?',
      onOk: async () => {
        try {
          await axios.put(`/api/hr/salary/payroll/${payrollId}/paid`);
          message.success('Đánh dấu đã thanh toán thành công');
          loadPayrolls();
        } catch (error) {
          console.error('Error marking as paid:', error);
          message.error('Lỗi khi đánh dấu đã thanh toán');
        }
      }
    });
  };

  // View payroll details
  const handleViewDetails = (payroll) => {
    Modal.info({
      title: `Chi tiết bảng lương - ${payroll.user?.fullName}`,
      width: 800,
      content: (
        <div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <p><strong>Nhân viên:</strong> {payroll.user?.fullName}</p>
              <p><strong>Email:</strong> {payroll.user?.email}</p>
              <p><strong>Phòng ban:</strong> {payroll.user?.department || 'Chưa phân loại'}</p>
              <p><strong>Kỳ lương:</strong> {payroll.getFormattedPayrollPeriod?.() || `${payroll.payrollMonth}/${payroll.payrollYear}`}</p>
            </Col>
            <Col span={12}>
              <p><strong>Tổng ngày làm việc:</strong> {payroll.totalWorkingDays}</p>
              <p><strong>Ngày làm việc thực tế:</strong> {payroll.actualWorkingDays}</p>
              <p><strong>Số giờ làm thêm:</strong> {payroll.overtimeHours}</p>
              <p><strong>Số lần đi trễ:</strong> {payroll.lateArrivals}</p>
            </Col>
          </Row>

          <h4>Chi tiết lương:</h4>
          <Row gutter={16}>
            <Col span={12}>
              <p><strong>Lương cơ bản:</strong> {formatCurrency(payroll.baseSalary)}</p>
              <p><strong>Lương làm thêm:</strong> {formatCurrency(payroll.overtimePay)}</p>
              <p><strong>Phụ cấp chức vụ:</strong> {formatCurrency(payroll.positionAllowance)}</p>
              <p><strong>Phụ cấp đi lại:</strong> {formatCurrency(payroll.transportAllowance)}</p>
              <p><strong>Phụ cấp ăn trưa:</strong> {formatCurrency(payroll.mealAllowance)}</p>
              <p><strong>Tổng phụ cấp:</strong> {formatCurrency(payroll.totalAllowances)}</p>
            </Col>
            <Col span={12}>
              <p><strong>BHXH:</strong> {formatCurrency(payroll.socialInsurance)}</p>
              <p><strong>BHYT:</strong> {formatCurrency(payroll.healthInsurance)}</p>
              <p><strong>BHTN:</strong> {formatCurrency(payroll.unemploymentInsurance)}</p>
              <p><strong>Thuế TNCN:</strong> {formatCurrency(payroll.personalIncomeTax)}</p>
              <p><strong>Phạt đi trễ:</strong> {formatCurrency(payroll.latePenalty)}</p>
              <p><strong>Tổng khấu trừ:</strong> {formatCurrency(payroll.totalDeductions)}</p>
            </Col>
          </Row>

          <div style={{ marginTop: 16, padding: 16, backgroundColor: '#f0f2f5', borderRadius: 4 }}>
            <Row gutter={16}>
              {/* Ẩn hiển thị tổng lương gộp */}
              {/* <Col span={12}>
                <p><strong>Tổng lương gộp:</strong> <span style={{ color: '#52c41a', fontSize: '16px', fontWeight: 'bold' }}>{formatCurrency(payroll.grossSalary)}</span></p>
              </Col> */}
              <Col span={24}>
                <p><strong>Lương thực nhận:</strong> <span style={{ color: '#1890ff', fontSize: '16px', fontWeight: 'bold' }}>{formatCurrency(payroll.netSalary)}</span></p>
              </Col>
            </Row>
          </div>
        </div>
      )
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'DRAFT': 'default',
      'CALCULATED': 'blue',
      'APPROVED': 'green',
      'PAID': 'purple',
      'CANCELLED': 'red'
    };
    return colors[status] || 'default';
  };

  // Table columns
  const columns = [
    {
      title: 'Nhân viên',
      key: 'employee',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.user?.fullName}</div>
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
      title: 'Kỳ lương',
      key: 'period',
      render: (_, record) => `${record.payrollMonth}/${record.payrollYear}`
    },
    // Ẩn cột lương gộp (Gross)
    // {
    //   title: 'Lương gộp',
    //   dataIndex: 'grossSalary',
    //   key: 'grossSalary',
    //   render: (value) => formatCurrency(value),
    //   align: 'right'
    // },
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
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Xem
          </Button>
          
          {record.status === 'DRAFT' && (
            <Button
              type="link"
              icon={<CalculatorOutlined />}
              size="small"
              onClick={() => handleRecalculate(record.id)}
            >
              Tính lại
            </Button>
          )}
          
          {record.status === 'CALCULATED' && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              size="small"
              style={{ color: '#52c41a' }}
              onClick={() => handleApprove(record.id)}
            >
              Phê duyệt
            </Button>
          )}
          
          {record.status === 'APPROVED' && userRole === 'ADMIN' && (
            <Button
              type="link"
              icon={<DollarOutlined />}
              size="small"
              style={{ color: '#722ed1' }}
              onClick={() => handleMarkAsPaid(record.id)}
            >
              Đã trả
            </Button>
          )}
        </Space>
      )
    }
  ];

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record) => ({
      disabled: record.status !== 'CALCULATED'
    })
  };

  // Statistics cards
  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số bảng lương"
              value={statistics.totalPayrolls}
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
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Quản lý bảng lương</h2>
        <Space>
          <MonthPicker
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            format="MM/YYYY"
            placeholder="Chọn tháng"
          />
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            style={{ width: 150 }}
          >
            <Option value="ALL">Tất cả</Option>
            <Option value="DRAFT">Bản nháp</Option>
            <Option value="CALCULATED">Đã tính</Option>
            <Option value="APPROVED">Đã duyệt</Option>
            <Option value="PAID">Đã trả</Option>
          </Select>
          <Button
            type="primary"
            icon={<CalculatorOutlined />}
            onClick={handleCalculateAll}
          >
            Tính lương tất cả
          </Button>
        </Space>
      </div>

      {renderStatistics()}

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            {selectedRowKeys.length > 0 && (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleBulkApprove}
              >
                Phê duyệt ({selectedRowKeys.length})
              </Button>
            )}
            <Button
              icon={<FileExcelOutlined />}
              onClick={() => {
                // Export to Excel
                window.open(`/api/hr/reports/generate?templateId=2&format=EXCEL&year=${selectedPeriod.year()}&month=${selectedPeriod.month() + 1}`);
              }}
            >
              Xuất Excel
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={payrolls}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} bảng lương`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default SalaryManagement;
