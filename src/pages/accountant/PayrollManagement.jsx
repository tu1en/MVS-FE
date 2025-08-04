import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  message, 
  Select, 
  DatePicker, 
  Modal,
  Statistic,
  Row,
  Col,
  Tag,
  Tooltip,
  Progress
} from 'antd';
import { 
  DollarOutlined, 
  DownloadOutlined, 
  EyeOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import axiosInstance from '../../config/axiosInstance';
import PayrollService from '../../services/payrollService';
import moment from 'moment';

const { Option } = Select;
const { MonthPicker } = DatePicker;

const PayrollManagement = () => {
  const [loading, setLoading] = useState(false);
  const [payrollData, setPayrollData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(moment());
  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    totalSalary: 0,
    processedCount: 0,
    pendingCount: 0
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Helper functions
  const getDepartmentFromStaff = (staffId) => {
    // You can implement a lookup or add department info to the API response
    return 'Chưa xác định';
  };

  const getContractType = (teachingHours) => {
    // Determine contract type based on teaching hours
    return teachingHours && teachingHours > 0 ? 'TEACHER' : 'STAFF';
  };

  useEffect(() => {
    loadPayrollData();
  }, [selectedPeriod]);

  const loadPayrollData = async () => {
    setLoading(true);
    try {
      const year = selectedPeriod.year();
      const month = selectedPeriod.month() + 1;
      
      // Call real payroll API using service
      const response = await PayrollService.getPayrollByMonth(year, month);
      const payrollRecords = response.content || [];
      
      // Transform API data to match frontend format
      const transformedData = payrollRecords.map(record => 
        PayrollService.transformPayrollRecord(record)
      );

      setPayrollData(transformedData);
      
      // Calculate statistics from real data
      const stats = {
        totalEmployees: transformedData.length,
        totalSalary: transformedData.reduce((sum, item) => sum + (item.totalSalary || 0), 0),
        processedCount: transformedData.filter(item => item.status === 'PROCESSED').length,
        pendingCount: transformedData.filter(item => item.status === 'PENDING').length
      };
      setStatistics(stats);

    } catch (error) {
      console.error('Error loading payroll data:', error);
      message.error('Không thể tải dữ liệu bảng lương!');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayroll = async () => {
    setLoading(true);
    try {
      const year = selectedPeriod.year();
      const month = selectedPeriod.month() + 1;
      
      // Calculate start and end dates for the month
      const startDate = selectedPeriod.startOf('month').format('YYYY-MM-DD');
      const endDate = selectedPeriod.endOf('month').format('YYYY-MM-DD');
      
      // Call real bulk payroll generation API using service
      const response = await PayrollService.generateBulkPayroll(startDate, endDate);
      
      message.success(`Đã tạo bảng lương cho ${response.length} nhân viên!`);
      loadPayrollData();
    } catch (error) {
      console.error('Error generating payroll:', error);
      message.error('Lỗi khi tạo bảng lương: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const year = selectedPeriod.year();
      const month = selectedPeriod.month() + 1;
      
      const startDate = selectedPeriod.startOf('month').format('YYYY-MM-DD');
      const endDate = selectedPeriod.endOf('month').format('YYYY-MM-DD');
      
      const response = await axiosInstance.get('/payroll/export/excel', {
        params: { startDate, endDate },
        responseType: 'blob'
      });
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payroll_${year}_${month}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('Đã xuất file Excel thành công!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      message.error('Lỗi khi xuất file Excel: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayroll = async (payrollId) => {
    try {
      await PayrollService.processPayroll(payrollId);
      message.success('Đã xử lý bảng lương thành công!');
      loadPayrollData();
    } catch (error) {
      console.error('Error processing payroll:', error);
      message.error('Lỗi khi xử lý bảng lương: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleMarkAsPaid = async (payrollId) => {
    try {
      await PayrollService.markPayrollAsPaid(payrollId);
      message.success('Đã đánh dấu là đã trả lương!');
      loadPayrollData();
    } catch (error) {
      console.error('Error marking as paid:', error);
      message.error('Lỗi khi đánh dấu đã trả lương: ' + (error.response?.data?.message || error.message));
    }
  };

  const showEmployeeDetail = (employee) => {
    setSelectedEmployee(employee);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'Mã NV',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      width: 150,
    },
    {
      title: 'Loại hợp đồng',
      dataIndex: 'contractType',
      key: 'contractType',
      width: 120,
      render: (type) => (
        <Tag color={type === 'TEACHER' ? 'blue' : 'green'}>
          {type === 'TEACHER' ? 'Giảng viên' : 'Nhân viên'}
        </Tag>
      ),
    },
    {
      title: 'Lương cơ bản',
      dataIndex: 'baseSalary',
      key: 'baseSalary',
      width: 150,
      render: (value) => `${value?.toLocaleString()} VNĐ`,
    },
    {
      title: 'Giờ dạy',
      dataIndex: 'teachingHours',
      key: 'teachingHours',
      width: 100,
      render: (value, record) => {
        if (value && value > 0) {
          return `${parseFloat(value).toFixed(1)}h`;
        }
        return 'N/A';
      },
    },
    {
      title: 'Tổng giờ làm',
      dataIndex: 'totalWorkingHours',
      key: 'totalWorkingHours',
      width: 120,
      render: (value) => value ? `${parseFloat(value).toFixed(1)}h` : 'N/A',
    },
    {
      title: 'Tổng lương',
      dataIndex: 'totalSalary',
      key: 'totalSalary',
      width: 150,
      render: (value) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          {value?.toLocaleString()} VNĐ
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        let color = 'orange';
        let text = 'Chờ xử lý';
        
        if (status === 'PROCESSED') {
          color = 'blue';
          text = 'Đã xử lý';
        } else if (status === 'PAID') {
          color = 'green';
          text = 'Đã trả lương';
        }
        
        return (
          <Tag color={color}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              size="small" 
              onClick={() => showEmployeeDetail(record)}
            />
          </Tooltip>
          {record.status === 'PENDING' && (
            <Tooltip title="Xử lý">
              <Button 
                type="primary"
                size="small"
                onClick={() => handleProcessPayroll(record.id)}
              >
                Xử lý
              </Button>
            </Tooltip>
          )}
          {record.status === 'PROCESSED' && (
            <Tooltip title="Đánh dấu đã trả">
              <Button 
                type="primary"
                size="small"
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                onClick={() => handleMarkAsPaid(record.id)}
              >
                Đã trả
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <h2>Quản lý Bảng lương</h2>
          <p>Tạo và quản lý bảng lương dựa trên điểm danh và giờ dạy</p>
        </div>

        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng số nhân viên"
                value={statistics.totalEmployees}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng lương tháng"
                value={statistics.totalSalary}
                precision={0}
                prefix={<DollarOutlined />}
                suffix="VNĐ"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đã xử lý"
                value={statistics.processedCount}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Chờ xử lý"
                value={statistics.pendingCount}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Controls */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <span>Kỳ lương:</span>
              <MonthPicker
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                format="MM/YYYY"
                placeholder="Chọn tháng"
              />
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<DollarOutlined />}
                loading={loading}
                onClick={handleGeneratePayroll}
              >
                Tạo bảng lương
              </Button>
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
              >
                Xuất Excel
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Progress */}
        <Row style={{ marginBottom: 16 }}>
          <Col span={24}>
            <span>Tiến độ xử lý: </span>
            <Progress
              percent={Math.round((statistics.processedCount / statistics.totalEmployees) * 100)}
              status={statistics.processedCount === statistics.totalEmployees ? 'success' : 'active'}
              showInfo={true}
            />
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={payrollData}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} nhân viên`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Employee Detail Modal */}
      <Modal
        title="Chi tiết lương nhân viên"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedEmployee && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Mã nhân viên:</strong> {selectedEmployee.userId}
              </Col>
              <Col span={12}>
                <strong>Email:</strong> {selectedEmployee.email}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Kỳ lương:</strong> {selectedEmployee.payPeriodStart} - {selectedEmployee.payPeriodEnd}
              </Col>
              <Col span={12}>
                <strong>Tổng giờ làm:</strong> {selectedEmployee.totalWorkingHours ? parseFloat(selectedEmployee.totalWorkingHours).toFixed(1) : 0}h
              </Col>
              <Col span={12}>
                <strong>Họ tên:</strong> {selectedEmployee.fullName}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Phòng ban:</strong> {selectedEmployee.department}
              </Col>
              <Col span={12}>
                <strong>Loại hợp đồng:</strong> {selectedEmployee.contractType}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Lương cơ bản:</strong> {selectedEmployee.baseSalary?.toLocaleString()} VNĐ
              </Col>
              <Col span={12}>
                <strong>Giờ dạy:</strong> {selectedEmployee.teachingHours ? parseFloat(selectedEmployee.teachingHours).toFixed(1) : 0}h
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Lương thô:</strong> {selectedEmployee.grossPay?.toLocaleString()} VNĐ
              </Col>
              <Col span={12}>
                <strong>Các khoản trừ:</strong> {selectedEmployee.deductions?.toLocaleString()} VNĐ
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Lương theo giờ:</strong> {(selectedEmployee.teachingHours * selectedEmployee.hourlyRate)?.toLocaleString()} VNĐ
              </Col>
              <Col span={12}>
                <strong>Phụ cấp chuyên cần:</strong> {selectedEmployee.attendanceBonus?.toLocaleString()} VNĐ
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Khấu trừ:</strong> {selectedEmployee.deductions?.toLocaleString()} VNĐ
              </Col>
              <Col span={12}>
                <strong style={{ color: '#52c41a' }}>Tổng lương:</strong> 
                <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                  {' '}{selectedEmployee.totalSalary?.toLocaleString()} VNĐ
                </span>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PayrollManagement;