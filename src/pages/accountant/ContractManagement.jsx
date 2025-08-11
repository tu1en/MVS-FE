import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Table, 
  Button, 
  Space, 
  message, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber,
  Tag,
  Popconfirm,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  UserOutlined,
  TeamOutlined,
  FilePdfOutlined,
  CheckOutlined
} from '@ant-design/icons';
import axiosInstance from '../../config/axiosInstance';
import moment from 'moment';
import './ContractManagement.css';
import WorkingScheduleFields from '../../components/WorkingScheduleFields';
import ContractPDFGenerator from '../../utils/ContractPDFGenerator';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const ContractManagement = () => {
  const [teacherContracts, setTeacherContracts] = useState([]);
  const [staffContracts, setStaffContracts] = useState([]);
  const [candidatesReady, setCandidatesReady] = useState([]);
  const [loading, setLoading] = useState(false);
  const [candidateModalVisible, setCandidateModalVisible] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidatePosition, setCandidatePosition] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filteredTeacherContracts, setFilteredTeacherContracts] = useState([]);
  const [filteredStaffContracts, setFilteredStaffContracts] = useState([]);
  const [candidateForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [renewModalVisible, setRenewModalVisible] = useState(false);
  const [renewingContract, setRenewingContract] = useState(null);
  const [renewForm] = Form.useForm();
  const [completedContracts, setCompletedContracts] = useState(new Set());

  // Fetch data khi component mount
  useEffect(() => {
    fetchContracts();
    fetchCandidatesReady();
  }, []);

  // Filter contracts when data changes
  useEffect(() => {
    filterContracts(searchText);
  }, [teacherContracts, staffContracts, searchText]);

  // Lấy danh sách hợp đồng theo loại
  const fetchContracts = async () => {
    setLoading(true);
    try {
      const [teacherResponse, staffResponse] = await Promise.all([
        axiosInstance.get('/contracts/type/TEACHER'),
        axiosInstance.get('/contracts/type/STAFF')
      ]);
      
      setTeacherContracts(teacherResponse.data);
      setStaffContracts(staffResponse.data);
      setFilteredTeacherContracts(teacherResponse.data);
      setFilteredStaffContracts(staffResponse.data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      message.error('Không thể tải danh sách hợp đồng!');
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách ứng viên đã được duyệt
  const fetchCandidatesReady = async () => {
    try {
      const response = await axiosInstance.get('/contracts/candidates/ready');
      setCandidatesReady(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      message.error('Không thể tải danh sách ứng viên đã được duyệt!');
    }
  };

  // 🔄 REFACTORED: Xử lý tạo hợp đồng mới với mutually exclusive salary fields
  const handleCreateContract = async (values) => {
    console.log('🔄 REFACTORED: Creating contract with mutually exclusive salary values:', values);
    
    // Validate required fields
    if (!values.fullName || values.fullName.trim() === '') {
      message.error('Vui lòng nhập họ tên!');
      return;
    }
    if (!values.email || values.email.trim() === '') {
      message.error('Vui lòng nhập email!');
      return;
    }
    if (!values.position || values.position.trim() === '') {
      message.error('Vui lòng nhập vị trí công việc!');
      return;
    }
    
    // 🔄 NEW: Validate mutually exclusive salary logic
    const hasHourly = values.hourlySalary && values.hourlySalary > 0;
    const hasGross = values.grossSalary && values.grossSalary > 0;
    const hasNet = values.netSalary && values.netSalary > 0;
    const hasGrossOrNet = hasGross || hasNet;
    
    if (!hasHourly && !hasGrossOrNet) {
      message.error('Vui lòng có ít nhất một loại lương (theo giờ hoặc GROSS/NET)!');
      return;
    }
    
    if (hasHourly && hasGrossOrNet) {
      message.error('Không thể có cả lương theo giờ và lương GROSS/NET cùng lúc!');
      return;
    }
    
    console.log('🔍 SALARY VALIDATION PASSED:', {
      hasHourly,
      hasGross,
      hasNet,
      hasGrossOrNet
    });
    if (!values.startDate) {
      message.error('Vui lòng chọn ngày bắt đầu!');
      return;
    }
    if (values.endDate && values.endDate.isBefore(values.startDate, 'day')) {
      message.error('Ngày kết thúc không được trước ngày bắt đầu!');
      return;
    }
    if (values.endDate && values.endDate.isBefore(moment(), 'day')) {
      message.error('Ngày kết thúc không được là ngày trong quá khứ!');
      return;
    }
    
    try {
      // Generate userId if not provided (for manual contract creation)
      let userId = values.userId;
      if (!userId && selectedCandidate) {
        userId = selectedCandidate.userId || selectedCandidate.id;
      }
      if (!userId) {
        // Generate a temporary userId for manual contracts
        userId = Date.now(); // Simple timestamp-based ID
      }

      // 🔄 REFACTORED: Handle salary based on mutually exclusive fields
    let finalSalary = 0;
    let salaryType = '';
    
    if (hasHourly) {
      // For hourly salary, estimate monthly: hourly * 80 hours
      finalSalary = values.hourlySalary * 80;
      salaryType = 'Hourly';
      console.log('💰 HOURLY SALARY: ', values.hourlySalary, 'VND/hour, Estimated Monthly:', finalSalary);
    } else if (hasGross) {
      // Use gross salary
      finalSalary = values.grossSalary;
      salaryType = 'Gross';
      console.log('💰 GROSS SALARY:', finalSalary, 'VND/month');
    } else if (hasNet) {
      // Use net salary
      finalSalary = values.netSalary;
      salaryType = 'Net';
      console.log('💰 NET SALARY:', finalSalary, 'VND/month');
    }    
      
      // 🔄 REFACTORED: Enhanced contract data with mutually exclusive salary fields
      const contractData = {
        contractId: values.contractId,
        userId: userId,
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber || '',
        address: values.address || '',
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
        position: values.position,
        department: values.department || 'Phòng Giáo vụ',
        contractType: values.contractType || 'STAFF',
        salary: finalSalary, // Main salary field for compatibility
        workingHours: values.workingHours || 'ca sáng (7:30-9:30)',
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : moment().add(2, 'years').format('YYYY-MM-DD'),
        status: values.status || 'ACTIVE',
        contractTerms: values.contractTerms || 'Điều khoản hợp đồng chuẩn',
        comments: values.comments || 'Hợp đồng được tạo từ ứng viên đã duyệt',
        // 🔄 REFACTORED: Mutually exclusive salary fields - chỉ một trong ba có giá trị
        hourlySalary: hasHourly ? values.hourlySalary : null,
        grossSalary: hasGross ? values.grossSalary : null,
        netSalary: hasNet ? values.netSalary : null,
        salaryType: salaryType // Additional info for logging
      };

      console.log('🔄 REFACTORED: Sending contract creation request with mutually exclusive salary data:', contractData);
      console.log('🔄 REWRITTEN: Salary field breakdown:', {
        salary: contractData.salary,
        hourlySalary: contractData.hourlySalary,
        grossSalary: contractData.grossSalary,
        netSalary: contractData.netSalary
      });

      await axiosInstance.post('/contracts', contractData);
      message.success(`Tạo hợp đồng thành công cho ${values.fullName} với lương ${salaryType}!`);
      setCandidateModalVisible(false);
      candidateForm.resetFields();
      setSelectedCandidate(null);
      fetchContracts();
      fetchCandidatesReady();
    } catch (error) {
      console.error('🔄 REFACTORED Error creating contract:', error);
      message.error('Có lỗi xảy ra khi tạo hợp đồng!');
    }
  };

  // Xử lý cập nhật hợp đồng
  const handleUpdateContract = async (values) => {
    if (values.endDate && values.endDate.isBefore(values.startDate, 'day')) {
      message.error('Ngày kết thúc không được trước ngày bắt đầu!');
      return;
    }
    try {
      const contractData = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
        citizenId: values.cccd || values.citizenId || '',
        // Format working schedule fields for backend
        workShifts: Array.isArray(values.workShifts) ? values.workShifts.join(',') : (values.workShifts || ''),
        workDays: Array.isArray(values.workDays) ? values.workDays.join(',') : (values.workDays || ''),
        workSchedule: values.workSchedule || ''
      };

      await axiosInstance.put(`/contracts/${editingContract.id}`, contractData);
      message.success('Cập nhật hợp đồng thành công!');
      setModalVisible(false);
      setEditingContract(null);
      form.resetFields();
      fetchContracts();
    } catch (error) {
      console.error('Error updating contract:', error);
      message.error('Không thể cập nhật hợp đồng!');
    }
  };

  // Xử lý đánh dấu hợp đồng hoàn thành (chỉ ẩn nút, không thay đổi trạng thái)
  const handleCompleteContract = async (id) => {
    try {
      // Chỉ đánh dấu local để ẩn nút, không thay đổi trạng thái hợp đồng
      setCompletedContracts(prev => new Set([...prev, id]));
      message.success('Đã đánh dấu hợp đồng hoàn thành!');
    } catch (error) {
      console.error('Error marking contract as completed:', error);
      message.error('Không thể đánh dấu hợp đồng hoàn thành!');
    }
  };

  // Xử lý gia hạn hợp đồng
  const handleRenewContract = (record) => {
    console.log('Renewing contract:', record);
    setRenewingContract(record);
    
    // Populate form with current contract dates
    renewForm.setFieldsValue({
      contractId: record.contractId,
      fullName: record.fullName,
      startDate: record.startDate ? moment(record.startDate) : null,
      endDate: record.endDate ? moment(record.endDate) : null
    });
    
    setRenewModalVisible(true);
  };

  // Xử lý cập nhật ngày hợp đồng (gia hạn)
  const handleRenewContractSubmit = async (values) => {
    try {
      const renewData = {
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD')
      };
      
      await axiosInstance.put(`/contracts/${renewingContract.id}`, renewData);
      message.success('Gia hạn hợp đồng thành công!');
      setRenewModalVisible(false);
      setRenewingContract(null);
      renewForm.resetFields();
      fetchContracts();
    } catch (error) {
      console.error('Error renewing contract:', error);
      message.error('Không thể gia hạn hợp đồng!');
    }
  };

  // Xử lý chỉnh sửa hợp đồng
  const handleEditContract = (record) => {
    if (record.status === 'EXPIRED') {
      message.warning('Không thể chỉnh sửa hợp đồng đã hết hạn!');
      return;
    }
    
    console.log('🔍 DEBUG: Editing contract:', record);
    console.log('🔍 DEBUG: Contract salary fields:', {
      grossSalary: record.grossSalary,
      netSalary: record.netSalary,
      hourlySalary: record.hourlySalary,
    });
    console.log('🔍 DEBUG: Contract type:', record.contractType);
    
    setEditingContract(record);
    
    // Populate form with contract data
    editForm.setFieldsValue({
      contractId: record.contractId,
      fullName: record.fullName,
      email: record.email,
      phoneNumber: record.phoneNumber,
      position: record.position,
      birthDate: record.birthDate ? moment(record.birthDate) : null,
      citizenId: record.citizenId,
      address: record.address,
      qualification: record.qualification,
      subject: record.subject,
      educationLevel: record.educationLevel,
      startDate: record.startDate ? moment(record.startDate) : null,
      endDate: record.endDate ? moment(record.endDate) : null,
      status: record.status,
      contractTerms: record.contractTerms,
      evaluation: record.evaluation,
    });
    
    setEditModalVisible(true);
  };

  // Generate Contract ID based on current date and sequence
  const generateContractId = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);
    // For demo purposes, we'll use a simple sequence. In production, this should come from backend
    const sequence = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
    return `${sequence}${month}${year}`;
  };

  // 🔄 REFACTORED: Mở modal tạo hợp đồng với logic lương mutually exclusive
  const handleSelectCandidate = async (candidate) => {
    console.log('🔄 REFACTORED: Selected candidate for contract creation:', candidate);
    setSelectedCandidate(candidate);
    setCandidateModalVisible(true);
    
    // Reset form trước khi set dữ liệu mới
    candidateForm.resetFields();
    
    try {
      // Lấy dữ liệu offer từ backend (với logic mutually exclusive salary)
      console.log('🔄 REFACTORED: Fetching mutually exclusive salary data for candidate ID:', candidate.id);
      const response = await axiosInstance.get(`/contracts/candidates/${candidate.id}/offer-data`);
      const offerData = response.data;
      
      console.log('🔄 REFACTORED: Received mutually exclusive salary data:', offerData);
      
      // Xác định loại hợp đồng dựa trên vị trí (vẫn cần cho contractType)
      const jobTitle = candidate.jobTitle ? candidate.jobTitle.toLowerCase() : '';
      let contractType = 'STAFF'; // Default
      
      if (jobTitle.includes('giáo viên') || jobTitle.includes('teacher')) {
        contractType = 'TEACHER';
      } else if (jobTitle.includes('kế toán') || jobTitle.includes('accountant')) {
        contractType = 'ACCOUNTANT';
      } else if (jobTitle.includes('quản lý') || jobTitle.includes('manager')) {
        contractType = 'MANAGER';
      }
      
      // Generate Contract ID
      const contractId = generateContractId();
      
      // 🔄 NEW: Validate mutually exclusive salary logic
      const hasHourly = offerData.hourlySalary && offerData.hourlySalary > 0;
      const hasGross = offerData.grossSalary && offerData.grossSalary > 0;
      const hasNet = offerData.netSalary && offerData.netSalary > 0;
      
      console.log('🔍 SALARY VALIDATION:', {
        hasHourly,
        hasGross, 
        hasNet,
        hourlySalary: offerData.hourlySalary,
        grossSalary: offerData.grossSalary,
        netSalary: offerData.netSalary
      });
      
      // Điền thông tin cơ bản vào form
      candidateForm.setFieldsValue({
        contractId: contractId,
        userId: candidate.id,
        fullName: candidate.fullName,
        email: candidate.email,
        phoneNumber: candidate.phoneNumber || '',
        address: candidate.address || '',
        birthDate: candidate.birthDate ? moment(candidate.birthDate) : undefined,
        position: candidate.jobTitle,
        department: 'Phòng Giáo vụ', // Default department
        contractType: contractType,
        status: 'ACTIVE',
        // 🔄 REFACTORED: Mutually exclusive salary data từ backend
        comments: offerData.comments || 'Chưa có nhận xét',
        // Backend đã đảm bảo chỉ một loại lương có giá trị, các loại khác sẽ là null
        hourlySalary: offerData.hourlySalary,
        grossSalary: offerData.grossSalary,
        netSalary: offerData.netSalary
      });
      
      console.log('🔄 REFACTORED: Form populated with mutually exclusive salary data.');
      
    } catch (error) {
      console.error('🔄 REFACTORED Error fetching offer data:', error);
      message.error('Không thể lấy dữ liệu offer cho ứng viên này!');
      
      // Fallback: điền thông tin cơ bản không có offer data
      const contractId = generateContractId();
      candidateForm.setFieldsValue({
        contractId: contractId,
        userId: candidate.id,
        fullName: candidate.fullName,
        email: candidate.email,
        phoneNumber: candidate.phoneNumber || '',
        address: candidate.address || '',
        birthDate: candidate.birthDate ? moment(candidate.birthDate) : undefined,
        position: candidate.jobTitle,
        department: 'Phòng Giáo vụ',
        contractType: contractType,
        status: 'ACTIVE',
        comments: 'Chưa có nhận xét',
        // Tất cả salary fields để null khi có lỗi
        hourlySalary: null,
        grossSalary: null,
        netSalary: null
      });
    }
  };

  // Hàm tìm kiếm và lọc hợp đồng
  const handleSearch = (value) => {
    setSearchText(value);
    filterContracts(value);
  };

  const filterContracts = (searchValue) => {
    const filterData = (contracts) => {
      if (!searchValue) return contracts;
      
      return contracts.filter(contract => {
        const fullName = contract.fullName?.toLowerCase() || '';
        const contractId = contract.contractId?.toString() || '';
        const last4Digits = contractId.slice(-4);
        const searchLower = searchValue.toLowerCase();
        
        return fullName.includes(searchLower) || last4Digits.includes(searchLower);
      });
    };
    
    setFilteredTeacherContracts(filterData(teacherContracts));
    setFilteredStaffContracts(filterData(staffContracts));
  };



  // Hàm validate ngày sinh (ít nhất 20 tuổi) - Đã bỏ validate tuổi theo yêu cầu
  const validateBirthDate = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng chọn ngày sinh'));
    }
    return Promise.resolve();
  };

  // Xem hợp đồng dước dạng PDF
  const handleViewContractPDF = (contract) => {
    try {
      ContractPDFGenerator.generateContractPDF(contract);
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Không thể tạo file PDF hợp đồng!');
    }
  };

  // Cấu hình cột cho bảng hợp đồng
  const contractColumns = [
    {
      title: 'ID Hợp đồng',
      dataIndex: 'contractId',
      key: 'contractId',
      width: 120,
      render: (text) => <strong style={{ color: '#1890ff' }}>{text}</strong>
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text) => <strong>{text}</strong>
    },

    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber'
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position'
    },

    {
      title: 'Lương',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary) => salary ? `${salary.toLocaleString()} VNĐ` : 'Chưa xác định'
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => date ? moment(date).format('DD/MM/YYYY') : 'N/A'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue';
        let text = status;
        
        switch(status) {
          case 'ACTIVE':
            color = 'green';
            text = 'Đang hoạt động';
            break;
          case 'NEAR_EXPIRY':
            color = 'orange';
            text = 'Sắp hết hạn';
            break;
          case 'EXPIRED':
            color = 'red';
            text = 'Hết hạn';
            break;
          default:
            color = 'blue';
            text = status;
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem hợp đồng PDF">
            <Button 
              icon={<FilePdfOutlined />} 
              size="small" 
              onClick={() => handleViewContractPDF(record)}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => handleEditContract(record)}
              disabled={record.status === 'EXPIRED' || completedContracts.has(record.id)}
              style={{
                backgroundColor: (record.status === 'EXPIRED' || completedContracts.has(record.id)) ? '#d9d9d9' : undefined,
                borderColor: (record.status === 'EXPIRED' || completedContracts.has(record.id)) ? '#d9d9d9' : undefined,
                color: (record.status === 'EXPIRED' || completedContracts.has(record.id)) ? '#999' : undefined
              }}
              title={
                record.status === 'EXPIRED' ? 'Không thể chỉnh sửa hợp đồng đã hết hạn' :
                completedContracts.has(record.id) ? 'Không thể chỉnh sửa hợp đồng đã hoàn thành' :
                'Chỉnh sửa hợp đồng'
              }
            />
          </Tooltip>
          {record.status === 'NEAR_EXPIRY' && (
            <Tooltip title="Gia hạn hợp đồng">
              <Button 
                icon={<PlusOutlined />} 
                size="small" 
                onClick={() => handleRenewContract(record)}
                style={{ color: '#fa8c16' }}
              />
            </Tooltip>
          )}
          {!completedContracts.has(record.id) && (record.status === 'ACTIVE' || record.status === 'NEAR_EXPIRY') && (
            <Popconfirm
              title="Bạn có chắc chắn muốn đánh dấu hợp đồng này đã hoàn thành?"
              onConfirm={() => handleCompleteContract(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Tooltip title="Đánh dấu hoàn thành">
                <Button 
                  icon={<CheckOutlined />} 
                  size="small" 
                  style={{ color: '#52c41a' }}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    }
  ];

  // Cấu hình cột cho bảng ứng viên đã duyệt
  const candidateColumns = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber'
    },
    {
      title: 'Vị trí ứng tuyển',
      dataIndex: 'position',
      key: 'position'
    },

    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => handleSelectCandidate(record)}
        >
          Tạo hợp đồng
        </Button>
      )
    }
  ];

  return (
    <div className="contract-management">
      <Card title="Quản lý Hợp đồng" className="contract-card">
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên hoặc 4 số cuối ID hợp đồng"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 400 }}
            allowClear
          />
        </div>
        <Tabs defaultActiveKey="teachers" className="contract-tabs">
          <TabPane 
            tab={<span><UserOutlined /> Hợp đồng Giáo viên ({teacherContracts.length})</span>} 
            key="teachers"
          >
            <Table
              columns={contractColumns}
              dataSource={filteredTeacherContracts}
              rowKey="id"
              loading={loading}
              pagination={{ 
                pageSize: 10, 
                showSizeChanger: true, 
                showTotal: (total) => `Tổng ${total} hợp đồng` 
              }}
            />
          </TabPane>

          <TabPane 
            tab={<span><TeamOutlined /> Hợp đồng Nhân viên ({staffContracts.length})</span>} 
            key="staff"
          >
            <Table
              columns={contractColumns}
              dataSource={filteredStaffContracts}
              rowKey="id"
              loading={loading}
              pagination={{ 
                pageSize: 10, 
                showSizeChanger: true, 
                showTotal: (total) => `Tổng ${total} hợp đồng` 
              }}
            />
          </TabPane>

          <TabPane 
            tab={<span><PlusOutlined /> Tạo hợp đồng từ ứng viên đã duyệt ({candidatesReady.length})</span>} 
            key="create"
          >
            <Card title="Danh sách ứng viên đã được duyệt" className="candidates-card">
              <Table
                columns={candidateColumns}
                dataSource={candidatesReady}
                rowKey="email"
                pagination={{ 
                  pageSize: 10, 
                  showTotal: (total) => `Tổng ${total} ứng viên` 
                }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal chỉnh sửa hợp đồng */}
      <Modal
        title="Chỉnh sửa hợp đồng"
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingContract(null);
          editForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateContract}
        >
          <Form.Item name="contractId" label="ID Hợp đồng">
            <Input 
              placeholder="Tự động tạo" 
              readOnly 
              style={{ 
                backgroundColor: '#f0f8ff', 
                border: '1px solid #1890ff',
                color: '#1890ff',
                fontWeight: 'bold'
              }} 
            />
          </Form.Item>

          <Form.Item name="fullName" label="Họ và tên">
            <Input 
              placeholder="Nhập họ và tên" 
              readOnly={editingContract}
              style={editingContract ? {
                backgroundColor: '#f5f5f5',
                color: '#666',
                cursor: 'not-allowed'
              } : {}}
            />
          </Form.Item>

          <Form.Item 
            name="birthDate" 
            label="Ngày sinh" 
            rules={[
              { required: true, message: 'Vui lòng chọn ngày sinh' },
              { validator: validateBirthDate }
            ]}
          > 
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
            <Input 
              placeholder="Nhập email" 
              readOnly={editingContract}
              style={editingContract ? {
                backgroundColor: '#f5f5f5',
                color: '#666',
                cursor: 'not-allowed'
              } : {}}
            />
          </Form.Item>

          <Form.Item name="phoneNumber" label="Số điện thoại">
            <Input 
              placeholder="Nhập số điện thoại" 
              readOnly={editingContract}
              style={editingContract ? {
                backgroundColor: '#f5f5f5',
                color: '#666',
                cursor: 'not-allowed'
              } : {}}
            />
          </Form.Item>

          <Form.Item name="cccd" label="Số CCCD" rules={[{ required: true, message: 'Vui lòng nhập số CCCD!' }, { pattern: /^\d{12}$/, message: 'Số CCCD phải có đúng 12 chữ số!' }]}>
            <Input placeholder="Nhập số CCCD (12 số)" maxLength={12} />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}>
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item name="qualification" label="Trình độ chuyên môn" rules={[{ required: true, message: 'Vui lòng nhập trình độ chuyên môn!' }]}>
            <Input placeholder="Nhập trình độ chuyên môn" />
          </Form.Item>

          {/* Subject and Class Level fields - Only for Teachers */}
          {(() => {
            // For edit mode, check the editing contract's type and position
            const isTeacher = editingContract ? 
              (editingContract.contractType === 'TEACHER' || 
               editingContract.position?.toLowerCase().includes('giáo viên')) :
              (candidatePosition.toLowerCase().includes('giáo viên') || 
               candidatePosition.toLowerCase().includes('teacher'));
            
            if (isTeacher) {
              return (
                <>
                  <Form.Item name="subject" label="Môn giảng dạy" rules={[{ required: true, message: 'Vui lòng nhập môn giảng dạy!' }]}>
                    <Input placeholder="Nhập môn giảng dạy" />
                  </Form.Item>

                  <Form.Item name="classLevel" label="Lớp học" rules={[{ required: true, message: 'Vui lòng nhập lớp học!' }]}>
                    <Input placeholder="Nhập lớp học" />
                  </Form.Item>
                </>
              );
            }
            return null; // Don't show for HR/Accountant staff
          })()}

          {/* Working Schedule Fields - Only for Teachers in Edit Mode */}
          {(() => {
            // For edit mode, check the editing contract's type and position
            const isTeacher = editingContract ? 
              (editingContract.contractType === 'TEACHER' || 
               editingContract.position?.toLowerCase().includes('giáo viên')) :
              (candidatePosition.toLowerCase().includes('giáo viên') || 
               candidatePosition.toLowerCase().includes('teacher'));
            
            if (isTeacher) {
              return (
                <>
                  <Form.Item 
                    name="workShifts" 
                    label="Ca làm việc" 
                    rules={[{ required: true, message: 'Vui lòng chọn ca làm việc!' }]}
                  >
                    <Select 
                      mode="multiple" 
                      placeholder="Chọn ca làm việc"
                      options={[
                        { value: 'morning', label: 'Ca sáng (7:30 - 9:30)' },
                        { value: 'afternoon', label: 'Ca chiều (14:00 - 17:00)' },
                        { value: 'evening', label: 'Ca tối (17:00 - 21:00)' }
                      ]}
                    />
                  </Form.Item>

                  <Form.Item 
                    name="workDays" 
                    label="Ngày trong tuần" 
                    rules={[{ required: true, message: 'Vui lòng chọn ngày làm việc!' }]}
                  >
                    <Select 
                      mode="multiple" 
                      placeholder="Chọn ngày trong tuần"
                      options={[
                        { value: 'monday', label: 'Thứ 2' },
                        { value: 'tuesday', label: 'Thứ 3' },
                        { value: 'wednesday', label: 'Thứ 4' },
                        { value: 'thursday', label: 'Thứ 5' },
                        { value: 'friday', label: 'Thứ 6' },
                        { value: 'saturday', label: 'Thứ 7' },
                        { value: 'sunday', label: 'Chủ nhật' }
                      ]}
                    />
                  </Form.Item>

                  <Form.Item name="workSchedule" label="Thời gian làm việc chi tiết">
                    <Input.TextArea 
                      rows={3} 
                      placeholder="Mô tả chi tiết thời gian làm việc (ví dụ: Thứ 2, 4, 6 - Ca sáng và chiều)"
                    />
                  </Form.Item>
                </>
              );
            }
            return null; // Don't show for HR/Accountant staff
          })()}

          <Form.Item name="position" label="Vị trí" rules={[{ required: true, message: 'Vui lòng nhập vị trí!' }]}>
            <Input 
              placeholder="Nhập vị trí" 
              readOnly={editingContract}
              style={editingContract ? {
                backgroundColor: '#f5f5f5',
                color: '#666',
                cursor: 'not-allowed'
              } : {}}
            />
          </Form.Item>

          {/* Salary fields - only show in edit mode and read-only, based on contract type */}
          {editingContract && (
            <>
              {/* For Teacher Contracts: Show only Hourly Salary */}
              {(editingContract.contractType === 'TEACHER' || 
                editingContract.position?.toLowerCase().includes('giáo viên')) && 
                editingContract.hourlySalary && (
                <Form.Item name="hourlySalary" label="Lương theo giờ">
                  <InputNumber
                    style={{ 
                      width: '100%',
                      backgroundColor: '#f5f5f5',
                      color: '#666',
                      cursor: 'not-allowed'
                    }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    readOnly
                    disabled
                  />
                </Form.Item>
              )}
              
              {/* For Staff Contracts: Show Gross and Net Salary */}
              {(editingContract.contractType === 'STAFF' || 
                !editingContract.position?.toLowerCase().includes('giáo viên')) && (
                <>
                  {editingContract.grossSalary && (
                    <Form.Item name="grossSalary" label="Lương GROSS">
                      <InputNumber
                        style={{ 
                          width: '100%',
                          backgroundColor: '#f5f5f5',
                          color: '#666',
                          cursor: 'not-allowed'
                        }}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        readOnly
                        disabled
                      />
                    </Form.Item>
                  )}
                  {editingContract.netSalary && (
                    <Form.Item name="netSalary" label="Lương NET">
                      <InputNumber
                        style={{ 
                          width: '100%',
                          backgroundColor: '#f5f5f5',
                          color: '#666',
                          cursor: 'not-allowed'
                        }}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        readOnly
                        disabled
                      />
                    </Form.Item>
                  )}
                </>
              )}
            </>
          )}

          <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="endDate" label="Ngày kết thúc">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="contractTerms" label="Điều khoản hợp đồng">
            <TextArea rows={4} placeholder="Nhập điều khoản hợp đồng" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật hợp đồng
              </Button>
              <Button onClick={() => {
                setEditModalVisible(false);
                setEditingContract(null);
                editForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal tạo hợp đồng từ ứng viên đã duyệt */}
      <Modal
        title="Tạo hợp đồng cho ứng viên đã duyệt"
        visible={candidateModalVisible}
        onCancel={() => {
          setCandidateModalVisible(false);
          setSelectedCandidate(null);
          candidateForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={candidateForm}
          layout="vertical"
          onFinish={handleCreateContract}
        >
          <Form.Item name="contractId" label="ID Hợp đồng">
            <Input 
              placeholder="Tự động tạo" 
              readOnly 
              style={{ 
                backgroundColor: '#f0f8ff', 
                border: '1px solid #1890ff',
                color: '#1890ff',
                fontWeight: 'bold'
              }} 
            />
          </Form.Item>

          <Form.Item name="fullName" label="Họ và tên">
            <Input placeholder="Nhập họ và tên" readOnly style={{ backgroundColor: '#f5f5f5' }} />
          </Form.Item>

          <Form.Item 
            name="birthDate" 
            label="Ngày sinh" 
            rules={[
              { required: true, message: 'Vui lòng chọn ngày sinh' },
              { validator: validateBirthDate }
            ]}
          > 
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input placeholder="Email" readOnly style={{ backgroundColor: '#f5f5f5' }} />
          </Form.Item>

          <Form.Item name="phoneNumber" label="Số điện thoại">
            <Input placeholder="Số điện thoại" readOnly style={{ backgroundColor: '#f5f5f5' }} />
          </Form.Item>

          <Form.Item name="cccd" label="Số CCCD" rules={[{ required: true, message: 'Vui lòng nhập số CCCD!' }, { pattern: /^\d{12}$/, message: 'Số CCCD phải có đúng 12 chữ số!' }]}>
            <Input placeholder="Nhập số CCCD (12 số)" maxLength={12} />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}>
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item name="qualification" label="Trình độ chuyên môn" rules={[{ required: true, message: 'Vui lòng nhập trình độ chuyên môn!' }]}>
            <Input placeholder="Nhập trình độ chuyên môn" />
          </Form.Item>

          {/* Subject and Class Level fields - Only for Teachers */}
          {(() => {
            const position = candidatePosition.toLowerCase();
            const isTeacher = position.includes('giáo viên') || position.includes('teacher') || 
                             (selectedCandidate && selectedCandidate.contractType === 'TEACHER');
            
            if (isTeacher) {
              return (
                <>
                  <Form.Item name="subject" label="Môn giảng dạy" rules={[{ required: true, message: 'Vui lòng nhập môn giảng dạy!' }]}>
                    <Input placeholder="Nhập môn giảng dạy" />
                  </Form.Item>

                  <Form.Item name="classLevel" label="Lớp học" rules={[{ required: true, message: 'Vui lòng nhập lớp học!' }]}>
                    <Input placeholder="Nhập lớp học" />
                  </Form.Item>
                </>
              );
            }
            return null; // Don't show for HR/Accountant staff
          })()}

          {/* Working Schedule Fields - Only for Teachers */}
          {(() => {
            const position = candidatePosition.toLowerCase();
            const isTeacher = position.includes('giáo viên') || position.includes('teacher') || 
                             (selectedCandidate && selectedCandidate.contractType === 'TEACHER');
            
            if (isTeacher) {
              return (
                <>
                  <Form.Item 
                    name="workShifts" 
                    label="Ca làm việc" 
                    rules={[{ required: true, message: 'Vui lòng chọn ca làm việc!' }]}
                  >
                    <Select 
                      mode="multiple" 
                      placeholder="Chọn ca làm việc"
                      options={[
                        { value: 'morning', label: 'Ca sáng (7:30 - 9:30)' },
                        { value: 'afternoon', label: 'Ca chiều (14:00 - 17:00)' },
                        { value: 'evening', label: 'Ca tối (17:00 - 21:00)' }
                      ]}
                    />
                  </Form.Item>

                  <Form.Item 
                    name="workDays" 
                    label="Ngày trong tuần" 
                    rules={[{ required: true, message: 'Vui lòng chọn ngày làm việc!' }]}
                  >
                    <Select 
                      mode="multiple" 
                      placeholder="Chọn ngày trong tuần"
                      options={[
                        { value: 'monday', label: 'Thứ 2' },
                        { value: 'tuesday', label: 'Thứ 3' },
                        { value: 'wednesday', label: 'Thứ 4' },
                        { value: 'thursday', label: 'Thứ 5' },
                        { value: 'friday', label: 'Thứ 6' },
                        { value: 'saturday', label: 'Thứ 7' },
                        { value: 'sunday', label: 'Chủ nhật' }
                      ]}
                    />
                  </Form.Item>

                  <Form.Item name="workSchedule" label="Thời gian làm việc chi tiết">
                    <Input.TextArea 
                      rows={3} 
                      placeholder="Mô tả chi tiết thời gian làm việc (ví dụ: Thứ 2, 4, 6 - Ca sáng và chiều)"
                    />
                  </Form.Item>
                </>
              );
            }
          })()}

          <Form.Item name="position" label="Vị trí">
            <Input placeholder="Vị trí" readOnly style={{ backgroundColor: '#f5f5f5' }} />
          </Form.Item>

          <Form.Item 
            name="contractType" 
            label="Loại hợp đồng" 
            rules={[{ required: true, message: 'Vui lòng chọn loại hợp đồng!' }]}
          >
            <Select placeholder="Chọn loại hợp đồng">
              <Option value="TEACHER">Giáo viên</Option>
              <Option value="STAFF">Nhân viên HR</Option>
              <Option value="STAFF">Kế toán viên</Option>
            </Select>
          </Form.Item>

          {/* Offer Management Fields - Read Only */}
          <Form.Item name="comments" label="Nhận xét">
            <Input 
              placeholder="Tự động lấy từ Offer" 
              readOnly 
              style={{ 
                backgroundColor: '#f0f8ff', 
                border: '1px solid #52c41a',
                color: '#52c41a',
                fontWeight: 'bold'
              }} 
            />
          </Form.Item>

          {/* Conditional rendering based on position */}
          {(() => {
            const position = candidatePosition.toLowerCase();
            // ✅ FIX: More robust teacher detection
            const isTeacher = position.includes('giáo viên') || position.includes('teacher') || 
                             (selectedCandidate && selectedCandidate.contractType === 'TEACHER');
            console.log('Teacher detection - position:', position, 'isTeacher:', isTeacher, 'contractType:', selectedCandidate?.contractType);
            
            if (isTeacher) {
              // Teachers: only show hourly salary
              return (
                <Form.Item name="hourlySalary" label="Lương theo giờ">
                  <InputNumber
                    style={{ 
                      width: '100%',
                      backgroundColor: '#f0f8ff', 
                      border: '1px solid #52c41a',
                      color: '#52c41a',
                      fontWeight: 'bold'
                    }}
                    placeholder="Lương theo giờ cho Giáo viên"
                    readOnly
                    formatter={value => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                    parser={value => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
                  />
                </Form.Item>
              );
            } else {
              // Manager/Accountant: show gross and net salary
              return (
                <>
                  <Form.Item name="grossSalary" label="Lương GROSS">
                    <InputNumber
                      style={{ 
                        width: '100%',
                        backgroundColor: '#f0f8ff', 
                        border: '1px solid #52c41a',
                        color: '#52c41a',
                        fontWeight: 'bold'
                      }}
                      placeholder="Lương GROSS cho Manager/Kế toán"
                      readOnly
                      formatter={value => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                      parser={value => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
                    />
                  </Form.Item>

                  <Form.Item name="netSalary" label="Lương NET">
                    <InputNumber
                      style={{ 
                        width: '100%',
                        backgroundColor: '#f0f8ff', 
                        border: '1px solid #52c41a',
                        color: '#52c41a',
                        fontWeight: 'bold'
                      }}
                      placeholder="Lương NET cho Manager/Kế toán"
                      readOnly
                      formatter={value => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                      parser={value => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
                    />
                  </Form.Item>
                </>
              );
            }
          })()}

          <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="endDate" label="Ngày kết thúc">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="contractTerms" label="Điều khoản hợp đồng">
            <TextArea rows={4} placeholder="Nhập điều khoản hợp đồng" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Tạo hợp đồng
              </Button>
              <Button onClick={() => {
                setCandidateModalVisible(false);
                setSelectedCandidate(null);
                candidateForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal gia hạn hợp đồng */}
      <Modal
        title="Gia hạn hợp đồng"
        visible={renewModalVisible}
        onCancel={() => {
          setRenewModalVisible(false);
          setRenewingContract(null);
          renewForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={renewForm}
          layout="vertical"
          onFinish={handleRenewContractSubmit}
        >
          <Form.Item name="contractId" label="ID Hợp đồng">
            <Input 
              readOnly 
              style={{ 
                backgroundColor: '#f0f8ff', 
                border: '1px solid #1890ff',
                color: '#1890ff',
                fontWeight: 'bold'
              }} 
            />
          </Form.Item>

          <Form.Item name="fullName" label="Họ và tên">
            <Input 
              readOnly 
              style={{ backgroundColor: '#f5f5f5' }} 
            />
          </Form.Item>

          <Form.Item 
            name="startDate" 
            label="Ngày bắt đầu mới" 
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="DD/MM/YYYY" 
              placeholder="Chọn ngày bắt đầu mới"
            />
          </Form.Item>

          <Form.Item 
            name="endDate" 
            label="Ngày kết thúc mới" 
            rules={[
              { required: true, message: 'Vui lòng chọn ngày kết thúc!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('startDate')) {
                    return Promise.resolve();
                  }
                  if (value.isBefore(getFieldValue('startDate'), 'day')) {
                    return Promise.reject(new Error('Ngày kết thúc không được trước ngày bắt đầu!'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="DD/MM/YYYY" 
              placeholder="Chọn ngày kết thúc mới"
            />
          </Form.Item>

          <div style={{ 
            backgroundColor: '#fff7e6', 
            border: '1px solid #ffd591', 
            borderRadius: '6px', 
            padding: '12px', 
            marginBottom: '16px' 
          }}>
            <p style={{ margin: 0, color: '#fa8c16' }}>
              <strong>Lưu ý:</strong> Chỉ có thể thay đổi ngày bắt đầu và ngày kết thúc. 
              Các thông tin khác của hợp đồng sẽ được giữ nguyên.
            </p>
          </div>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Gia hạn hợp đồng
              </Button>
              <Button onClick={() => {
                setRenewModalVisible(false);
                setRenewingContract(null);
                renewForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContractManagement;