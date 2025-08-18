import {
    CalculatorOutlined,
    CalendarOutlined,
    DollarOutlined,
    EyeOutlined,
    FileExcelOutlined,
    TeamOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Input,
    message,
    Modal,
    Progress,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
    Tooltip
} from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import SalaryCalculationDetailsModal from '../../components/SalaryCalculationDetailsModal';
import PayrollService from '../../services/payrollService';

const { Option } = Select;
const { MonthPicker } = DatePicker;

// Sample data generator for development (following DataLoader pattern)
const getSamplePayrollData = (selectedPeriod) => {
  const periodMoment = selectedPeriod || moment();
  const period = periodMoment.format('YYYY-MM');
  const startOfMonth = periodMoment.clone().startOf('month').format('YYYY-MM-DD');
  const endOfMonth = periodMoment.clone().endOf('month').format('YYYY-MM-DD');
  
  return [
    {
      id: `GV001_${period}`,
      userId: 'GV001',
      fullName: 'Nguyễn Văn An',
      email: 'an.nguyen@school.edu.vn',
      department: 'Giảng dạy',
      contractType: 'TEACHER',
      baseSalary: 8000000,
      teachingHours: 120, // Giờ dạy
      totalWorkingHours: 183, // Tổng giờ làm
      weekendWorkingHours: 24,
      weekdayWorkingHours: 159,
      hourlyRate: 50000,
      personalIncomeTax: 800000,
      employeeInsurance: 640000,
      deductions: 1440000,
      grossPay: 9150000,
      totalSalary: 7710000,
      weekendPay: 1200000,
      calculationMethod: 'HOURLY',
      standardMonthlyHours: 160,
      totalWorkingDays: 22,
      actualWorkingDays: 20,
      status: 'PROCESSED',
      processedDate: new Date().toISOString().split('T')[0],
      payPeriodStart: startOfMonth,
      payPeriodEnd: endOfMonth
    },
    {
      id: `GV002_${period}`,
      userId: 'GV002',
      fullName: 'Trần Thị Bình',
      email: 'binh.tran@school.edu.vn',
      department: 'Giảng dạy',
      contractType: 'TEACHER',
      baseSalary: 7500000,
      teachingHours: 148, // Giờ dạy
      totalWorkingHours: 175, // Tổng giờ làm
      weekendWorkingHours: 16,
      weekdayWorkingHours: 159,
      hourlyRate: 45000,
      personalIncomeTax: 650000,
      employeeInsurance: 600000,
      deductions: 1250000,
      grossPay: 7875000,
      totalSalary: 6625000,
      weekendPay: 720000,
      calculationMethod: 'HOURLY',
      standardMonthlyHours: 160,
      totalWorkingDays: 22,
      actualWorkingDays: 21,
      status: 'PROCESSED',
      processedDate: new Date().toISOString().split('T')[0],
      payPeriodStart: startOfMonth,
      payPeriodEnd: endOfMonth
    },
    {
      id: `NV003_${period}`,
      userId: 'NV003',
      fullName: 'Lê Văn Cường',
      email: 'cuong.le@school.edu.vn',
      department: 'Hành chính',
      contractType: 'STAFF',
      baseSalary: 6000000,
      teachingHours: 0, // Nhân viên hành chính không có giờ dạy
      totalWorkingHours: 176, // Tổng giờ làm
      weekendWorkingHours: 0,
      weekdayWorkingHours: 176,
      hourlyRate: 0,
      personalIncomeTax: 420000,
      employeeInsurance: 480000,
      deductions: 900000,
      grossPay: 6000000,
      totalSalary: 5100000,
      weekendPay: 0,
      calculationMethod: 'MONTHLY',
      standardMonthlyHours: 176,
      totalWorkingDays: 22,
      actualWorkingDays: 22,
      status: 'PROCESSED',
      processedDate: new Date().toISOString().split('T')[0],
      payPeriodStart: startOfMonth,
      payPeriodEnd: endOfMonth
    }
  ];
};

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
  const [salaryDetailsModalVisible, setSalaryDetailsModalVisible] = useState(false);
  const [selectedPayrollId, setSelectedPayrollId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // ALL | TEACHER | STAFF

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
      const periodMoment = selectedPeriod || moment();
      const period = periodMoment.format('YYYY-MM');
      
      // Generate payroll for all employees using new TopCV system
      const response = await PayrollService.generateBulkPayroll(period);
      const payrollRecords = response.payrollResults || [];
      
      // Transform API data to match frontend format
      const transformedData = payrollRecords.map(record => {
        const baseSalary = Number(record.contractSalary ?? 0);
        const pit = Number(record.topCVResult?.personalIncomeTax ?? 0);
        const si = Number(record.topCVResult?.insuranceDetails?.totalEmployeeContribution ?? 0);
        const gross = Number(record.proratedGrossSalary ?? 0);
        const net = Number(record.netSalary ?? 0);
        const actualWorkingDays = Number(record.actualWorkingDays ?? 0);
        const actualWorkingHours = Number(record.actualWorkingHours ?? (actualWorkingDays * 8));
        const weekendWorkingHours = Number(record.weekendWorkingHours ?? 0);
        const weekdayWorkingHours = Number(record.weekendWorkingHours ?? Math.max(actualWorkingHours - weekendWorkingHours, 0));
        const weekendPay = Number(record.weekendPay ?? 0);
        const standardMonthlyHours = Number(record.standardMonthlyHours ?? 0);
        const calculationMethod = record.calculationMethod || (record.contractType === 'TEACHER' ? 'HOURLY' : 'MONTHLY');
        const hourlySalary = Number(record.hourlySalary ?? 0);

        // Debug log để kiểm tra dữ liệu từ backend
        console.log('🔍 Backend record for user:', record.userName, {
          totalTeachingHours: record.totalTeachingHours,
          actualWorkingHours: record.actualWorkingHours,
          contractType: record.contractType,
          proratedGrossSalary: record.proratedGrossSalary,
          netSalary: record.netSalary,
          hourlySalary: record.hourlySalary,
          contractSalary: record.contractSalary,
          // Log toàn bộ record để debug
          fullRecord: record
        });

        const startOfMonth = periodMoment.clone().startOf('month').format('YYYY-MM-DD');
        const endOfMonth = periodMoment.clone().endOf('month').format('YYYY-MM-DD');

        return ({
        id: `${record.userId}_${period}`,
        userId: record.userId,
        fullName: record.userName || 'Không có tên',
        email: record.userEmail || '',
        department: record.contractType === 'TEACHER' ? 'Giảng dạy' : 'Hành chính',
        contractType: record.contractType,
        baseSalary,
        totalTeachingHours: record.totalTeachingHours || (record.contractType === 'TEACHER' ? actualWorkingHours : 0),
        actualWorkingHours: actualWorkingHours,
        weekendWorkingHours,
        weekdayWorkingHours,
        hourlySalary: record.hourlySalary || 0,
        hourlyRate: calculationMethod === 'HOURLY' ? hourlySalary : 0,
        personalIncomeTax: pit,
        employeeInsurance: si,
        deductions: pit + si,
        grossPay: gross,
        totalSalary: net,
        weekendPay,
        calculationMethod,
        standardMonthlyHours,
        totalWorkingDays: Number(record.totalWorkingDays ?? (standardMonthlyHours ? standardMonthlyHours / 8 : actualWorkingDays)),
        actualWorkingDays,
        topCVResult: record.topCVResult || null,
        shiftSummary: record.shiftSummary || '',
        status: 'PROCESSED', // New system generates processed payroll
        processedDate: new Date().toISOString().split('T')[0],
        payPeriodStart: startOfMonth,
        payPeriodEnd: endOfMonth,
        contractStartDate: record.contractStartDate || null,
        contractEndDate: record.contractEndDate || null,
        generatedAt: new Date().toISOString()
      });
      });

      // Log warning if no data found
      if (payrollRecords.length === 0) {
        console.warn('Không có dữ liệu payroll từ backend cho kỳ:', period);
      }

      setPayrollData(transformedData);
      
      // Calculate statistics from real data
      const stats = {
        totalEmployees: transformedData.length,
        totalSalary: transformedData.reduce((sum, item) => {
          const salary = Number(item.totalSalary || 0);
          return sum + (isNaN(salary) ? 0 : salary);
        }, 0),
        processedCount: transformedData.filter(item => item.status === 'PROCESSED').length,
        pendingCount: transformedData.filter(item => item.status === 'PENDING').length
      };
      setStatistics(stats);

    } catch (error) {
      console.error('Error loading payroll data:', error);
      console.log('Backend payroll API failed, loading sample data for development...');
      
      // Load sample data when API fails (following DataLoader pattern)
      const sampleData = getSamplePayrollData(selectedPeriod);
      setPayrollData(sampleData);
      
      // Calculate statistics from sample data
      const stats = {
        totalEmployees: sampleData.length,
        totalSalary: sampleData.reduce((sum, item) => sum + Number(item.totalSalary || 0), 0),
        processedCount: sampleData.filter(item => item.status === 'PROCESSED').length,
        pendingCount: sampleData.filter(item => item.status === 'PENDING').length
      };
      setStatistics(stats);
      
      message.warning('Đang sử dụng dữ liệu mẫu để test giao diện');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayroll = async () => {
    setLoading(true);
    try {
      const current = selectedPeriod || moment();
      const period = current.format('YYYY-MM');
      
      // Call new bulk payroll generation API using TopCV calculations
      const response = await PayrollService.generateBulkPayroll(period);
      
      message.success(`Đã tạo bảng lương cho ${response.totalEmployees} nhân viên!`);
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
      const period = selectedPeriod.format('YYYY-MM');
      
      // Generate CSV data from current payroll data
      const csvHeader = 'Mã NV,Họ tên,Phòng ban,Loại HĐ,Phương thức,Đơn giá (giờ),Tổng lương,Trạng thái\n';
      const csvData = payrollData.map(row => {
        const method = row.calculationMethod === 'HOURLY' ? 'Theo giờ' : 'Theo tháng';
        const rate = row.calculationMethod === 'HOURLY' ? row.hourlyRate : '';
        return `${row.userId},"${row.fullName}","${row.department}","${row.contractType === 'TEACHER' ? 'GIÁO VIÊN' : 'Nhân viên'}",${method},${rate},${row.totalSalary},"${row.status === 'PROCESSED' ? 'Đã xử lý' : 'Chờ xử lý'}"`;
      }).join('\n');
      
      const csvContent = csvHeader + csvData;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payroll_${period}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('Đã xuất file CSV thành công!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      message.error('Lỗi khi xuất file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendConfirmation = async (record) => {
    try {
      const period = (selectedPeriod || moment()).format('YYYY-MM');
      await PayrollService.sendPayrollConfirmation(record.userId, period);
      message.success(`Đã gửi xác nhận lương tới ${record.fullName}`);
    } catch (error) {
      console.error('Error sending confirmation:', error);
      message.error('Gửi email xác nhận thất bại');
    }
  };

  const handleSendConfirmationAll = async () => {
    try {
      setLoading(true);
      const period = (selectedPeriod || moment()).format('YYYY-MM');
      const res = await PayrollService.sendPayrollConfirmationAll(period);
      message.success(`Đã gửi xác nhận cho ${res.emailsSent || 0}/${res.totalEmployees || 0} nhân viên`);
    } catch (error) {
      console.error('Error sending confirmation all:', error);
      message.error('Gửi email xác nhận hàng loạt thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayroll = async (payrollId) => {
    try {
      // New system generates already processed payroll
      message.success('Bảng lương đã được xử lý!');
      loadPayrollData();
    } catch (error) {
      console.error('Error processing payroll:', error);
      message.error('Lỗi khi xử lý bảng lương: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleMarkAsPaid = async (payrollId) => {
    try {
      // Gọi API backend để cập nhật trạng thái
      const response = await axios.put(`/api/payroll/${payrollId}/status`, {
        status: 'PAID'
      });
      
      if (response.data.success) {
        // Cập nhật local state sau khi backend thành công
        setPayrollData(prevData => 
          prevData.map(item => 
            item.id === payrollId ? { ...item, status: 'PAID' } : item
          )
        );
        message.success('Đã đánh dấu là đã trả lương!');
      } else {
        message.error('Lỗi khi cập nhật trạng thái: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      message.error('Lỗi khi đánh dấu đã trả lương: ' + error.message);
    }
  };

  const showEmployeeDetail = (employee) => {
    setSelectedEmployee(employee);
    setDetailModalVisible(true);
  };

  const showSalaryCalculationDetails = (record) => {
    // Prefer backend TopCV breakdown if present; fallback to simple split
    const backendPIT = record.topCVResult?.personalIncomeTax ?? null;
    const backendSI = record.topCVResult?.insuranceDetails?.totalEmployeeContribution ?? null;
    setSelectedEmployee({
      ...record,
      topCVDetails: {
        grossSalary: record.grossPay,
        personalIncomeTax: backendPIT !== null ? Number(backendPIT) : record.deductions * 0.7,
        socialInsurance: backendSI !== null ? Number(backendSI) : record.deductions * 0.3,
        netSalary: record.totalSalary
      }
    });
    setSalaryDetailsModalVisible(true);
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'Chưa có dữ liệu';
    return value.toLocaleString() + ' VNĐ';
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
          {type === 'TEACHER' ? 'GIÁO VIÊN' : 'Nhân viên'}
        </Tag>
      ),
    },
    {
      title: 'Phương thức',
      dataIndex: 'calculationMethod',
      key: 'calculationMethod',
      width: 120,
      render: (method) => method === 'HOURLY' ? <Tag color="blue">Theo giờ</Tag> : <Tag color="green">Theo tháng</Tag>,
    },
    {
      title: 'Đơn giá (giờ)',
      dataIndex: 'hourlyRate',
      key: 'hourlyRate',
      width: 150,
      render: (rate, record) => record.calculationMethod === 'HOURLY' ? `${Number(rate || 0).toLocaleString()} VNĐ/giờ` : 'N/A',
    },
    {
      title: 'Giờ dạy',
      dataIndex: 'totalTeachingHours',
      key: 'totalTeachingHours',
      width: 100,
      render: (value, record) => {
        if (value && value > 0) {
          return `${parseFloat(value).toFixed(1)}h`;
        }
        return <span style={{ color: '#999' }}>Chưa có dữ liệu</span>;
      },
    },
    {
      title: 'Tổng giờ làm',
      dataIndex: 'actualWorkingHours',
      key: 'actualWorkingHours',
      render: (value, record) => {
        // Giáo viên: giờ làm = 0, Nhân viên: hiển thị giờ làm thực tế
        if (record.contractType === 'TEACHER') {
          return <span style={{ color: '#999' }}>0</span>;
        }
        return value ? `${value} giờ` : 'Chưa có dữ liệu';
      }
    },
    // Ẩn cột Tổng lương (Gross)
    // {
    //   title: 'Tổng lương',
    //   dataIndex: 'proratedGrossSalary',
    //   key: 'proratedGrossSalary',
    //   render: (value, record) => {
    //     if (record.contractType === 'TEACHER') {
    //       // Giáo viên: lương theo giờ nhân số giờ dạy
    //       const hourlySalary = record.hourlySalary || 0;
    //       const teachingHours = record.totalTeachingHours || 0;
    //       const calculatedSalary = hourlySalary * teachingHours;
    //       return calculatedSalary > 0 ? formatCurrency(calculatedSalary) : 'Chưa có dữ liệu';
    //     }
    //     // Nhân viên: hiển thị lương thực tế
    //     return value ? formatCurrency(value) : 'Chưa có dữ liệu';
    //   }
    // },
    // Ẩn cột Gross (tạm tính)
    // {
    //   title: 'Gross (tạm tính)',
    //   dataIndex: 'netSalary',
    //   key: 'netSalary',
    //   render: (value, record) => {
    //     // Ẩn cột này cho giáo viên
    //     if (record.contractType === 'TEACHER') {
    //       return <span style={{ color: '#999' }}>-</span>;
    //     }
    //     return value ? formatCurrency(value) : 'Chưa có dữ liệu';
    //   }
    // },
    {
      title: 'Thuế TNCN',
      dataIndex: 'topCVResult',
      key: 'personalIncomeTax',
      render: (value, record) => {
        // Ẩn cột này cho giáo viên
        if (record.contractType === 'TEACHER') {
          return <span style={{ color: '#999' }}>-</span>;
        }
        const pit = value?.personalIncomeTax;
        return pit ? formatCurrency(pit) : 'Chưa có dữ liệu';
      }
    },
    {
      title: 'BH NLĐ',
      dataIndex: 'topCVResult',
      key: 'employeeInsurance',
      render: (value, record) => {
        // Ẩn cột này cho giáo viên
        if (record.contractType === 'TEACHER') {
          return <span style={{ color: '#999' }}>-</span>;
        }
        const si = value?.socialInsuranceEmployee;
        return si ? formatCurrency(si) : 'Chưa có dữ liệu';
      }
    },
    {
      title: 'Khấu trừ',
      dataIndex: 'topCVResult',
      key: 'deductions',
      render: (value, record) => {
        // Ẩn cột này cho giáo viên
        if (record.contractType === 'TEACHER') {
          return <span style={{ color: '#999' }}>-</span>;
        }
        const pit = value?.personalIncomeTax || 0;
        const si = value?.socialInsuranceEmployee || 0;
        const total = pit + si;
        return total > 0 ? formatCurrency(total) : 'Chưa có dữ liệu';
      }
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
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết tính lương">
            <Button 
              icon={<CalculatorOutlined />} 
              size="small"
              type="default"
              onClick={() => showSalaryCalculationDetails(record)}
            >
              Chi tiết
            </Button>
          </Tooltip>
          <Tooltip title="Xem thông tin cơ bản">
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
          <Tooltip title="Gửi xác nhận cho nhân viên">
            <Button
              size="small"
              onClick={() => handleSendConfirmation(record)}
            >
              Gửi xác nhận
            </Button>
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
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }} gutter={[16, 12]}>
          <Col flex="auto">
            <Space wrap>
              <span>Kỳ lương:</span>
              <MonthPicker
                allowClear={false}
                value={selectedPeriod}
                onChange={(val) => setSelectedPeriod(val || moment())}
                format="MM/YYYY"
                placeholder="Chọn tháng"
              />
              <Input.Search
                allowClear
                placeholder="Tìm theo mã NV, tên hoặc email"
                style={{ width: 320 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Select
                value={roleFilter}
                style={{ width: 180 }}
                onChange={(val) => setRoleFilter(val)}
              >
                <Option value="ALL">Tất cả (GV + NV)</Option>
                <Option value="TEACHER">GIÁO VIÊN</Option>
                <Option value="STAFF">Nhân viên</Option>
              </Select>
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
                Xuất CSV
              </Button>
              <Button onClick={handleSendConfirmationAll}>Gửi xác nhận tất cả</Button>
            </Space>
          </Col>
        </Row>

        {/* Progress */}
        <Row style={{ marginBottom: 16 }}>
          <Col span={24}>
            <span>Tiến độ xử lý: </span>
            <Progress
              percent={statistics.totalEmployees > 0 ? Math.round((statistics.processedCount / statistics.totalEmployees) * 100) : 0}
              status={statistics.processedCount === statistics.totalEmployees ? 'success' : 'active'}
              showInfo={true}
            />
          </Col>
        </Row>

        {/* Message when no data */}
        {payrollData.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <h3>Chưa có dữ liệu bảng lương cho kỳ này</h3>
            <p>Vui lòng tạo bảng lương bằng cách nhấn nút "Tạo bảng lương" ở trên</p>
          </div>
        )}

        {/* Table */}
        <Table
          columns={columns}
          dataSource={payrollData.filter((row) => {
            // Role filter
            if (roleFilter !== 'ALL' && (row.contractType || '').toUpperCase() !== roleFilter) return false;
            // Search filter
            const q = (searchText || '').trim().toLowerCase();
            if (!q) return true;
            const idStr = String(row.userId || '');
            return (
              idStr.includes(q) ||
              (row.fullName || '').toLowerCase().includes(q) ||
              (row.email || '').toLowerCase().includes(q)
            );
          })}
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
              {/* Ẩn hiển thị lương thô */}
              {/* <Col span={12}>
                <strong>Lương thô:</strong> {selectedEmployee.grossPay?.toLocaleString()} VNĐ
              </Col> */}
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

      {/* Salary Calculation Details Modal */}
      <SalaryCalculationDetailsModal
        visible={salaryDetailsModalVisible}
        onCancel={() => setSalaryDetailsModalVisible(false)}
        payrollId={selectedPayrollId}
        employeeRecord={selectedEmployee}
      />
    </div>
  );
};

export default PayrollManagement;