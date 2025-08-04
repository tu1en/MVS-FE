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

  useEffect(() => {
    loadPayrollData();
  }, [selectedPeriod]);

  const loadPayrollData = async () => {
    setLoading(true);
    try {
      const year = selectedPeriod.year();
      const month = selectedPeriod.month() + 1;
      
      // Mock data for demonstration - replace with actual API calls
      const mockPayrollData = [
        {
          id: 1,
          employeeId: 'EMP001',
          fullName: 'Nguyễn Văn A',
          department: 'Giảng viên',
          contractType: 'TEACHER',
          baseSalary: 15000000,
          teachingHours: 120,
          hourlyRate: 250000,
          attendanceBonus: 500000,
          deductions: 100000,
          totalSalary: 45400000,
          status: 'PROCESSED',
          processedDate: '2024-01-15'
        },
        {
          id: 2,
          employeeId: 'EMP002',
          fullName: 'Trần Thị B',
          department: 'Hành chính',
          contractType: 'STAFF',
          baseSalary: 12000000,
          teachingHours: 0,
          hourlyRate: 0,
          attendanceBonus: 300000,
          deductions: 50000,
          totalSalary: 12250000,
          status: 'PENDING',
          processedDate: null
        }
      ];

      setPayrollData(mockPayrollData);
      
      // Calculate statistics
      const stats = {
        totalEmployees: mockPayrollData.length,
        totalSalary: mockPayrollData.reduce((sum, item) => sum + item.totalSalary, 0),
        processedCount: mockPayrollData.filter(item => item.status === 'PROCESSED').length,
        pendingCount: mockPayrollData.filter(item => item.status === 'PENDING').length
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
      
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success('Tạo bảng lương thành công!');
      loadPayrollData();
    } catch (error) {
      console.error('Error generating payroll:', error);
      message.error('Lỗi khi tạo bảng lương!');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    message.info('Đang xuất file Excel...');
    // Implement Excel export functionality
  };

  const showEmployeeDetail = (employee) => {
    setSelectedEmployee(employee);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'Mã NV',
      dataIndex: 'employeeId',
      key: 'employeeId',
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
      render: (value, record) => record.contractType === 'TEACHER' ? `${value}h` : 'N/A',
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
      render: (status) => (
        <Tag color={status === 'PROCESSED' ? 'green' : 'orange'}>
          {status === 'PROCESSED' ? 'Đã xử lý' : 'Chờ xử lý'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              size="small" 
              onClick={() => showEmployeeDetail(record)}
            />
          </Tooltip>
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
                <strong>Mã nhân viên:</strong> {selectedEmployee.employeeId}
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
                <strong>Giờ dạy:</strong> {selectedEmployee.teachingHours}h
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