import {
    CalculatorOutlined,
    CalendarOutlined,
    DollarOutlined,
    EyeOutlined,
    FileExcelOutlined,
    FilterOutlined,
    ReloadOutlined,
    SearchOutlined,
    TeamOutlined
} from '@ant-design/icons';
import {
    Badge,
    Button,
    Card,
    Col,
    Collapse,
    DatePicker,
    Divider,
    Input,
    message,
    Modal,
    Progress,
    Row,
    Select,
    Slider,
    Space,
    Statistic,
    Table,
    Tag,
    Tooltip,
    Typography
} from 'antd';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import SalaryCalculationDetailsModal from '../../components/SalaryCalculationDetailsModal';
import PayrollService from '../../services/payrollService';

const { Option } = Select;
const { MonthPicker } = DatePicker;
const { Text, Title } = Typography;
const { Panel } = Collapse;

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
      fullName: 'Lê Quý Thịnh',
      email: 'an.nguyen@school.edu.vn',
      department: 'Giảng dạy',
      contractType: 'TEACHER',
      baseSalary: 8000000,
      totalTeachingHours: 120, // Giờ dạy
      totalTeachingSlots: 80, // Số tiết dạy (120 giờ / 1.5 = 80 tiết)
      totalWorkingHours: 183, // Tổng giờ làm (bao gồm giờ dạy + giờ làm việc khác)
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
      totalTeachingHours: 148, // Giờ dạy
      totalTeachingSlots: 98.7, // Số tiết dạy (148 giờ / 1.5 = 98.7 tiết)
      totalWorkingHours: 175, // Tổng giờ làm (bao gồm giờ dạy + giờ làm việc khác)
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
      id: `GV003_${period}`,
      userId: 'GV003',
      fullName: 'Phạm Minh Đức',
      email: 'duc.pham@school.edu.vn',
      department: 'Giảng dạy',
      contractType: 'TEACHER',
      baseSalary: 7200000,
      totalTeachingHours: 96, // Giờ dạy
      totalTeachingSlots: 64, // Số tiết dạy (96 giờ / 1.5 = 64 tiết)
      totalWorkingHours: 160, // Tổng giờ làm
      weekendWorkingHours: 12,
      weekdayWorkingHours: 148,
      hourlyRate: 48000,
      personalIncomeTax: 460800,
      employeeInsurance: 576000,
      deductions: 1036800,
      grossPay: 4608000,
      totalSalary: 3571200,
      weekendPay: 576000,
      calculationMethod: 'HOURLY',
      standardMonthlyHours: 160,
      totalWorkingDays: 22,
      actualWorkingDays: 20,
      status: 'PENDING',
      processedDate: null,
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
  const [roleFilter, setRoleFilter] = useState('TEACHER'); // ALL | TEACHER | STAFF - Mặc định chỉ hiển thị giáo viên
  
  // New advanced filters
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [salaryRange, setSalaryRange] = useState([0, 50000000]);
  const [hoursRange, setHoursRange] = useState([0, 200]);
  const [sortField, setSortField] = useState('fullName');
  const [sortOrder, setSortOrder] = useState('ascend');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
        // shiftSummary: record.shiftSummary || '',
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

  // Get unique departments for filter
  const getUniqueDepartments = () => {
    const departments = [...new Set(payrollData.map(item => item.department))];
    return departments.filter(Boolean);
  };

  // Get unique statuses for filter
  const getUniqueStatuses = () => {
    const statuses = [...new Set(payrollData.map(item => item.status))];
    return statuses.filter(Boolean);
  };

  // Get salary statistics for range slider
  const getSalaryStats = () => {
    if (payrollData.length === 0) return { min: 0, max: 50000000 };
    const salaries = payrollData.map(item => {
      if (item.contractType === 'TEACHER') {
        return (item.hourlySalary || 0) * (item.totalTeachingHours || 0);
      }
      return item.totalSalary || 0;
    }).filter(salary => salary > 0);
    
    return {
      min: Math.min(...salaries),
      max: Math.max(...salaries)
    };
  };

  // Get hours statistics for range slider
  const getHoursStats = () => {
    if (payrollData.length === 0) return { min: 0, max: 200 };
    const hours = payrollData.map(item => {
      if (item.contractType === 'TEACHER') {
        return item.totalTeachingHours || 0;
      }
      return item.actualWorkingHours || 0;
    }).filter(hours => hours > 0);
    
    return {
      min: Math.min(...hours),
      max: Math.max(...hours)
    };
  };

  // Apply all filters and sorting
  const getFilteredAndSortedData = () => {
    let filtered = payrollData.filter((row) => {
      // Role filter
      if (roleFilter !== 'ALL' && (row.contractType || '').toUpperCase() !== roleFilter) return false;
      
      // Department filter
      if (departmentFilter !== 'ALL' && row.department !== departmentFilter) return false;
      
      // Status filter
      if (statusFilter !== 'ALL' && row.status !== statusFilter) return false;
      
      // Salary range filter
      const salary = row.contractType === 'TEACHER' 
        ? (row.hourlySalary || 0) * (row.totalTeachingHours || 0)
        : (row.totalSalary || 0);
      if (salary < salaryRange[0] || salary > salaryRange[1]) return false;
      
      // Hours range filter
      const hours = row.contractType === 'TEACHER' 
        ? (row.totalTeachingHours || 0)
        : (row.actualWorkingHours || 0);
      if (hours < hoursRange[0] || hours > hoursRange[1]) return false;
      
      // Search filter
      const q = (searchText || '').trim().toLowerCase();
      if (!q) return true;
      const idStr = String(row.userId || '');
      return (
        idStr.includes(q) ||
        (row.fullName || '').toLowerCase().includes(q) ||
        (row.email || '').toLowerCase().includes(q)
      );
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'fullName':
          aValue = (a.fullName || '').toLowerCase();
          bValue = (b.fullName || '').toLowerCase();
          break;
        case 'totalSalary':
          aValue = a.contractType === 'TEACHER' 
            ? (a.hourlySalary || 0) * (a.totalTeachingHours || 0)
            : (a.totalSalary || 0);
          bValue = b.contractType === 'TEACHER' 
            ? (b.hourlySalary || 0) * (b.totalTeachingHours || 0)
            : (b.totalSalary || 0);
          break;
        case 'totalTeachingHours':
        case 'actualWorkingHours':
          aValue = a[sortField] || 0;
          bValue = b[sortField] || 0;
          break;
        case 'department':
          aValue = (a.department || '').toLowerCase();
          bValue = (b.department || '').toLowerCase();
          break;
        default:
          aValue = a[sortField] || '';
          bValue = b[sortField] || '';
      }
      
      if (sortOrder === 'ascend') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchText('');
    setRoleFilter('ALL');
    setDepartmentFilter('ALL');
    setStatusFilter('ALL');
    setSalaryRange([0, 50000000]);
    setHoursRange([0, 200]);
    setSortField('fullName');
    setSortOrder('ascend');
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
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      width: 150,
      filters: getUniqueDepartments().map(dept => ({ text: dept, value: dept })),
      onFilter: (value, record) => record.department === value,
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
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (rate, record) => record.calculationMethod === 'HOURLY' ? `${Number(rate || 0).toLocaleString()} VNĐ/giờ` : 'N/A',
    },
    {
      title: 'Giờ dạy',
      dataIndex: 'totalTeachingHours',
      key: 'totalTeachingHours',
      width: 100,
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (value, record) => {
        if (value && value > 0) {
          return <Badge count={parseFloat(value).toFixed(1)} style={{ backgroundColor: '#52c41a' }} />;
        }
        return <span style={{ color: '#999' }}>0h</span>;
      },
    },
    {
      title: 'Số tiết dạy',
      dataIndex: 'totalTeachingSlots',
      key: 'totalTeachingSlots',
      width: 120,
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (value, record) => {
        // Hiển thị teaching slots từ backend hoặc tính từ teaching hours
        let slots = value;
        if (!slots && record.totalTeachingHours) {
          // Nếu không có slots từ backend, tính từ hours (1 slot = 1.5 giờ)
          slots = parseFloat(record.totalTeachingHours) / 1.5;
        }

        if (slots && slots > 0) {
          return (
            <div>
              <Badge count={parseFloat(slots).toFixed(1)} style={{ backgroundColor: '#1890ff' }} />
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                tiết (1.5h/tiết)
              </div>
            </div>
          );
        }
        return <span style={{ color: '#999' }}>0 tiết</span>;
      },
    },
    // {
    //   title: 'Tổng giờ làm',
    //   dataIndex: 'actualWorkingHours',
    //   key: 'actualWorkingHours',
    //   sorter: true,
    //   sortDirections: ['ascend', 'descend'],
    //   render: (value, record) => {
    //     if (record.contractType === 'TEACHER') {
    //       return <span style={{ color: '#999' }}>-</span>;
    //     }
    //     if (value && value > 0) {
    //       return <Badge count={`${value}h`} style={{ backgroundColor: '#1890ff' }} />;
    //     }
    //     return <span style={{ color: '#999' }}>0h</span>;
    //   }
    // },
    {
      title: 'Thuế TNCN',
      dataIndex: 'topCVResult',
      key: 'personalIncomeTax',
      render: (value, record) => {
        // Debug log để kiểm tra dữ liệu
        console.log('🔍 Thuế TNCN record:', record);
        console.log('🔍 topCVResult:', value);
        
        // Kiểm tra nếu có dữ liệu thuế từ topCVResult
        let pit = value?.personalIncomeTax;
        
        // Nếu không có từ topCVResult, thử lấy từ record trực tiếp
        if (!pit) {
          pit = record.personalIncomeTax;
        }
        
        // Tính lương thô để xác định mức thuế
        let grossSalary = 0;
        if (record.contractType === 'TEACHER') {
          grossSalary = (record.hourlySalary || 0) * (record.totalTeachingHours || 0);
        } else {
          grossSalary = record.proratedGrossSalary || record.grossPay || record.baseSalary || 0;
        }
        
        if (pit && pit > 0) {
          return (
            <div>
              <div>{formatCurrency(pit)}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                {grossSalary >= 2000000 ? 'Trừ 10% (≥2M)' : 'Trừ 10% (<2M)'}
              </div>
            </div>
          );
        }
        
        // Nếu không có thuế nhưng có lương thô, tính thuế ước tính
        if (grossSalary > 0 && grossSalary >= 2000000) {
          const estimatedTax = Math.round(grossSalary * 0.1);
          return (
            <div>
              <div style={{ color: '#ffa500' }}>Ước tính: {formatCurrency(estimatedTax)}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                Trừ 10% (≥2M) - Ước tính
              </div>
            </div>
          );
        }
        
        // Nếu không có thuế và lương < 2M, hiển thị 0 VNĐ
        return <span style={{ color: '#999' }}>0 VNĐ</span>;
      }
    },
    {
      title: 'Thực nhận',
      dataIndex: 'totalSalary',
      key: 'netSalary',
      width: 150,
      render: (value, record) => {
        if (record.contractType === 'TEACHER') {
          const hourlySalary = record.hourlySalary || 0;
          const teachingHours = record.totalTeachingHours || 0;
          const calculatedSalary = hourlySalary * teachingHours;
          return calculatedSalary > 0 ? (
            <Text strong style={{ color: '#52c41a' }}>
              {formatCurrency(calculatedSalary)}
            </Text>
          ) : 'Chưa có dữ liệu';
        }
        return value ? (
          <Text strong style={{ color: '#52c41a' }}>
            {formatCurrency(value)}
          </Text>
        ) : 'Chưa có dữ liệu';
      }
    },
    {
      title: 'Khấu trừ',
      dataIndex: 'topCVResult',
      key: 'deductions',
      render: (value, record) => {
        // Debug log để kiểm tra dữ liệu
        console.log('🔍 Khấu trừ record:', record);
        console.log('🔍 topCVResult deductions:', value);
        
        // Lấy thuế TNCN
        let pit = value?.personalIncomeTax;
        if (!pit) {
          pit = record.personalIncomeTax;
        }
        
        // Lấy bảo hiểm
        let si = value?.socialInsuranceEmployee;
        if (!si) {
          si = record.employeeInsurance || record.socialInsuranceEmployee;
        }
        
        const total = (pit || 0) + (si || 0);
        
        if (total > 0) {
          return (
            <Text type="danger">
              {formatCurrency(total)}
            </Text>
          );
        }
        
        // Nếu không có khấu trừ nhưng có lương thô, tính khấu trừ ước tính
        let grossSalary = 0;
        if (record.contractType === 'TEACHER') {
          grossSalary = (record.hourlySalary || 0) * (record.totalTeachingHours || 0);
        } else {
          grossSalary = record.proratedGrossSalary || record.grossPay || record.baseSalary || 0;
        }
        
        if (grossSalary > 0 && grossSalary >= 2000000) {
          const estimatedTax = Math.round(grossSalary * 0.1);
          const estimatedSI = Math.round(grossSalary * 0.08); // Ước tính bảo hiểm 8%
          const estimatedTotal = estimatedTax + estimatedSI;
          
          return (
            <div>
              <div style={{ color: '#ffa500' }}>Ước tính: {formatCurrency(estimatedTotal)}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                Thuế + BH ước tính
              </div>
            </div>
          );
        }
        
        // Nếu không có khấu trừ và lương < 2M, hiển thị 0 VNĐ
        return <span style={{ color: '#999' }}>0 VNĐ</span>;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: getUniqueStatuses().map(status => ({ 
        text: status === 'PROCESSED' ? 'Đã xử lý' : status === 'PAID' ? 'Đã trả lương' : 'Chờ xử lý', 
        value: status 
      })),
      onFilter: (value, record) => record.status === value,
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
      fixed: 'right',
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

  const filteredData = getFilteredAndSortedData();

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>Quản lý Bảng lương</Title>
          <Text type="secondary">Tạo và quản lý bảng lương dựa trên điểm danh và giờ dạy</Text>
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

        {/* Advanced Filters */}
        <Collapse 
          ghost 
          style={{ marginBottom: 16 }}
          activeKey={showAdvancedFilters ? ['1'] : []}
        >
          <Panel 
            header={
              <Space>
                <FilterOutlined />
                <Text strong>Bộ lọc nâng cao</Text>
                <Badge count={[
                  roleFilter !== 'ALL' ? 1 : 0,
                  departmentFilter !== 'ALL' ? 1 : 0,
                  statusFilter !== 'ALL' ? 1 : 0,
                  salaryRange[0] > 0 || salaryRange[1] < 50000000 ? 1 : 0,
                  hoursRange[0] > 0 || hoursRange[1] < 200 ? 1 : 0
                ].reduce((a, b) => a + b, 0)} />
              </Space>
            } 
            key="1"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Loại nhân viên:</Text>
                <Select
                  value={roleFilter}
                  style={{ width: '100%', marginTop: 8 }}
                  onChange={(val) => setRoleFilter(val)}
                >
                  <Option value="ALL">Tất cả (GV + NV)</Option>
                  <Option value="TEACHER">GIÁO VIÊN</Option>
                  <Option value="STAFF">Nhân viên</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Phòng ban:</Text>
                <Select
                  value={departmentFilter}
                  style={{ width: '100%', marginTop: 8 }}
                  onChange={(val) => setDepartmentFilter(val)}
                >
                  <Option value="ALL">Tất cả phòng ban</Option>
                  {getUniqueDepartments().map(dept => (
                    <Option key={dept} value={dept}>{dept}</Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Trạng thái:</Text>
                <Select
                  value={statusFilter}
                  style={{ width: '100%', marginTop: 8 }}
                  onChange={(val) => setStatusFilter(val)}
                >
                  <Option value="ALL">Tất cả trạng thái</Option>
                  {getUniqueStatuses().map(status => (
                    <Option key={status} value={status}>
                      {status === 'PROCESSED' ? 'Đã xử lý' : status === 'PAID' ? 'Đã trả lương' : 'Chờ xử lý'}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Sắp xếp theo:</Text>
                <Select
                  value={sortField}
                  style={{ width: '100%', marginTop: 8 }}
                  onChange={(val) => setSortField(val)}
                >
                  <Option value="fullName">Tên nhân viên</Option>
                  <Option value="totalSalary">Lương thực nhận</Option>
                  <Option value="totalTeachingHours">Giờ dạy</Option>
                  <Option value="actualWorkingHours">Giờ làm việc</Option>
                  <Option value="department">Phòng ban</Option>
                </Select>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Text strong>Khoảng lương (VNĐ):</Text>
                <div style={{ marginTop: 8 }}>
                  <Slider
                    range
                    min={getSalaryStats().min}
                    max={getSalaryStats().max}
                    value={salaryRange}
                    onChange={setSalaryRange}
                    tipFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    style={{ width: '100%' }}
                  />
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <Text type="secondary">
                      {`${(salaryRange[0] / 1000000).toFixed(1)}M - ${(salaryRange[1] / 1000000).toFixed(1)}M VNĐ`}
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Khoảng giờ làm:</Text>
                <div style={{ marginTop: 8 }}>
                  <Slider
                    range
                    min={getHoursStats().min}
                    max={getHoursStats().max}
                    value={hoursRange}
                    onChange={setHoursRange}
                    tipFormatter={(value) => `${value}h`}
                    style={{ width: '100%' }}
                  />
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <Text type="secondary">
                      {`${hoursRange[0]}h - ${hoursRange[1]}h`}
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
            
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={resetFilters}
                type="default"
              >
                Đặt lại bộ lọc
              </Button>
            </div>
          </Panel>
        </Collapse>

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
                prefix={<SearchOutlined />}
              />
              <Button
                type={showAdvancedFilters ? 'primary' : 'default'}
                icon={<FilterOutlined />}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                {showAdvancedFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
              </Button>
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
            <Space>
              <Text>Tiến độ xử lý:</Text>
              <Progress
                percent={statistics.totalEmployees > 0 ? Math.round((statistics.processedCount / statistics.totalEmployees) * 100) : 0}
                status={statistics.processedCount === statistics.totalEmployees ? 'success' : 'active'}
                showInfo={true}
                style={{ flex: 1 }}
              />
              <Text type="secondary">
                {filteredData.length} / {payrollData.length} nhân viên
              </Text>
            </Space>
          </Col>
        </Row>

        {/* Message when no data */}
        {payrollData.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <h3>Chưa có dữ liệu bảng lương cho kỳ này</h3>
            <p>Vui lòng tạo bảng lương bằng cách nhấn nút "Tạo bảng lương" ở trên</p>
          </div>
        )}

        {/* Message when no filtered results */}
        {payrollData.length > 0 && filteredData.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <h3>Không tìm thấy kết quả phù hợp</h3>
            <p>Vui lòng thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <Button onClick={resetFilters}>Đặt lại bộ lọc</Button>
          </div>
        )}

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} nhân viên`,
          }}
          scroll={{ x: 1400 }}
          onChange={(pagination, filters, sorter) => {
            if (sorter.field) {
              setSortField(sorter.field);
              setSortOrder(sorter.order);
            }
          }}
          rowClassName={(record, index) => {
            if (record.contractType === 'TEACHER') {
              return 'teacher-row';
            }
            return index % 2 === 0 ? 'even-row' : 'odd-row';
          }}
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
                {/* Tổng giờ làm: Bao gồm giờ dạy + giờ làm việc khác (họp, chuẩn bị bài giảng, chấm bài, v.v.) */}
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
                <Tooltip title="Thuế thu nhập cá nhân: Trừ 10% từ lương thô nếu ≥2M VNĐ, trừ 10% nếu <2M VNĐ">
                  <strong>Thuế TNCN:</strong> 
                  {selectedEmployee.topCVResult?.personalIncomeTax ? (
                    <div>
                      <span style={{ color: '#ff4d4f' }}>
                        {selectedEmployee.topCVResult.personalIncomeTax.toLocaleString()} VNĐ
                      </span>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                        {(() => {
                          const grossSalary = selectedEmployee.proratedGrossSalary || selectedEmployee.grossPay || 0;
                          return grossSalary >= 2000000 ? 'Trừ 10% (≥2M VNĐ)' : 'Trừ 10% (<2M VNĐ)';
                        })()}
                      </div>
                    </div>
                  ) : (
                    '0 VNĐ'
                  )}
                </Tooltip>
              </Col>
              <Col span={12}>
                <strong style={{ color: '#52c41a' }}>Tổng lương:</strong> 
                <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                  {' '}{selectedEmployee.totalSalary?.toLocaleString()} VNĐ
                </span>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Tổng khấu trừ:</strong> 
                <span style={{ color: '#ff4d4f' }}>
                  {(() => {
                    const pit = selectedEmployee.topCVResult?.personalIncomeTax || 0;
                    const si = selectedEmployee.topCVResult?.socialInsuranceEmployee || 0;
                    const total = pit + si;
                    return total > 0 ? `${total.toLocaleString()} VNĐ` : '0 VNĐ';
                  })()}
                </span>
              </Col>
              <Col span={12}>
                <strong>Bảo hiểm:</strong> 
                <span style={{ color: '#ff4d4f' }}>
                  {selectedEmployee.topCVResult?.socialInsuranceEmployee ? 
                    `${selectedEmployee.topCVResult.socialInsuranceEmployee.toLocaleString()} VNĐ` : 
                    '0 VNĐ'
                  }
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

      <style jsx>{`
        .teacher-row {
          background-color: #f0f8ff !important;
        }
        .even-row {
          background-color: #fafafa;
        }
        .odd-row {
          background-color: #ffffff;
        }
        .ant-table-thead > tr > th {
          background-color: #f5f5f5;
          font-weight: 600;
        }
        .ant-collapse-header {
          font-weight: 600;
        }
        .ant-slider-track {
          background-color: #1890ff;
        }
        .ant-slider-handle {
          border-color: #1890ff;
        }
        .ant-badge-count {
          font-size: 12px;
          font-weight: 600;
        }
        
        /* Bỏ background color xanh dương nhạt của dòng được chọn */
        .ant-table-tbody > tr.ant-table-row-selected > td {
          background-color: transparent !important;
        }
        .ant-table-tbody > tr.ant-table-row-selected:hover > td {
          background-color: #f5f5f5 !important;
        }
        
        /* Bỏ background color xanh dương nhạt khi hover */
        .ant-table-tbody > tr:hover > td {
          background-color: #f5f5f5 !important;
        }
        
        /* Đảm bảo không có background color xanh dương nhạt */
        .ant-table-tbody > tr > td {
          background-color: transparent !important;
        }
        
        /* Bỏ tất cả background color xanh dương nhạt từ Ant Design */
        .ant-table-tbody > tr.ant-table-row-selected {
          background-color: transparent !important;
        }
        
        /* Bỏ background color khi focus */
        .ant-table-tbody > tr:focus-within > td {
          background-color: transparent !important;
        }
        
        /* Đảm bảo các dòng có background trắng hoặc xám nhạt */
        .ant-table-tbody > tr:nth-child(even) > td {
          background-color: #fafafa !important;
        }
        .ant-table-tbody > tr:nth-child(odd) > td {
          background-color: #ffffff !important;
        }
      `}</style>
    </div>
  );
};

export default PayrollManagement;