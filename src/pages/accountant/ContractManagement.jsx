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
  FilePdfOutlined
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
  const [modalVisible, setModalVisible] = useState(false);
  const [candidateModalVisible, setCandidateModalVisible] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidatePosition, setCandidatePosition] = useState('');
  const [form] = Form.useForm();
  const [candidateForm] = Form.useForm();

  // Fetch data khi component mount
  useEffect(() => {
    fetchContracts();
    fetchCandidatesReady();
  }, []);

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

  // 🔄 REWRITTEN: Xử lý tạo hợp đồng mới với lương theo giờ từ Quản Lý Offer
  const handleCreateContract = async (values) => {
    console.log('🔄 REWRITTEN: Creating contract with values:', values);
    
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

      // 🔄 REWRITTEN: Determine contract type and validate salary based on position
      const position = values.position || '';
      const isTeacher = position.toLowerCase().includes('giáo viên') || 
                       position.toLowerCase().includes('teacher') || 
                       values.contractType === 'TEACHER';
      
      const contractType = isTeacher ? 'TEACHER' : 'STAFF';
      
      console.log('🔄 REWRITTEN: Contract type determination:', {
        position,
        isTeacher,
        contractType,
        hourlySalary: values.hourlySalary,
        grossSalary: values.grossSalary,
        netSalary: values.netSalary
      });

      // 🔄 REWRITTEN: Validate salary based on contract type
      let salary = 0;
      if (isTeacher) {
        // ✅ FOR TEACHERS: Validate hourly salary from Offer Management
        if (!values.hourlySalary || values.hourlySalary <= 0) {
          message.error('Vui lòng nhập lương theo giờ hợp lệ cho giáo viên!');
          return;
        }
        salary = values.hourlySalary;
        console.log('🎓 TEACHER: Using hourly salary:', salary, 'VND/hour');
        
      } else {
        // ✅ FOR STAFF: Validate gross salary
        if (!values.grossSalary || values.grossSalary <= 0) {
          message.error('Vui lòng nhập lương gross hợp lệ cho nhân viên!');
          return;
        }
        salary = values.grossSalary;
        console.log('👥 STAFF: Using gross salary:', salary, 'VND');
      }

      // 🔄 REWRITTEN: Contract data structure with proper salary field handling
      const contractData = {
        userId: userId,
        contractId: values.contractId || generateContractId(),
        fullName: values.fullName || '',
        email: values.email || '',
        phoneNumber: values.phoneNumber || '',
        contractType: contractType,
        position: values.position || '',
        department: values.department || 'Không xác định',
        salary: salary, // Main salary field for compatibility
        workingHours: values.workingHours || '8h/ngày',
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        status: 'ACTIVE',
        contractTerms: values.contractTerms || '',
        createdBy: 'Accountant',
        // Custom fields
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
        citizenId: values.cccd || values.citizenId || '',
        address: values.address || '',
        qualification: values.qualification || '',
        subject: values.subject || '',
        classLevel: values.classLevel || values.level || '', // Changed from educationLevel to classLevel (Lớp học)
        // 🔄 REWRITTEN: Updated field names and added working schedule
        comments: values.comments || '', // Changed from evaluation to comments (Nhận xét)
        workSchedule: values.workSchedule || '', // New field: Thời gian làm việc
        workShifts: Array.isArray(values.workShifts) ? values.workShifts.join(',') : (values.workShifts || ''), // Convert array to comma-separated string
        workDays: Array.isArray(values.workDays) ? values.workDays.join(',') : (values.workDays || ''), // Convert array to comma-separated string
        // ✅ FOR TEACHERS: Only send hourly salary from Offer Management
        grossSalary: isTeacher ? null : (values.grossSalary || null),
        netSalary: isTeacher ? null : (values.netSalary || null),
        hourlySalary: isTeacher ? (values.hourlySalary || null) : null,
        offer: values.offer || ''
      };

      console.log('🔄 REWRITTEN: Contract data being sent to backend:', contractData);
      console.log('🔄 REWRITTEN: Salary field breakdown:', {
        isTeacher,
        salary: contractData.salary,
        hourlySalary: contractData.hourlySalary,
        grossSalary: contractData.grossSalary,
        netSalary: contractData.netSalary
      });

      await axiosInstance.post('/contracts', contractData);
      message.success('Tạo hợp đồng thành công!');
      setModalVisible(false);
      setCandidateModalVisible(false);
      form.resetFields();
      candidateForm.resetFields();
      setSelectedCandidate(null);
      fetchContracts();
      fetchCandidatesReady();
    } catch (error) {
      console.error('❌ Error creating contract:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Full error object:', JSON.stringify(error.response?.data, null, 2));
      
      // More detailed error message
      let errorMessage = 'An unexpected error occurred';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(`Không thể tạo hợp đồng! ${errorMessage}`);
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

  // Xử lý xóa hợp đồng
  const handleDeleteContract = async (id) => {
    try {
      await axiosInstance.delete(`/contracts/${id}`);
      message.success('Xóa hợp đồng thành công!');
      fetchContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      message.error('Không thể xóa hợp đồng!');
    }
  };

  // Xử lý chỉnh sửa hợp đồng
  const handleEditContract = (record) => {
    console.log('🔍 DEBUG: Editing contract:', record);
    console.log('🔍 DEBUG: Contract salary fields:', {
      grossSalary: record.grossSalary,
      netSalary: record.netSalary,
      hourlySalary: record.hourlySalary,
      salary: record.salary
    });

    setEditingContract(record);
    
    // Populate form with contract data
    const formData = {
      contractId: record.contractId,
      fullName: record.fullName,
      email: record.email,
      phoneNumber: record.phoneNumber,
      position: record.position,
      // Populate salary fields from contract data (read-only)
      grossSalary: record.grossSalary,
      netSalary: record.netSalary,
      hourlySalary: record.hourlySalary,
      startDate: record.startDate ? moment(record.startDate) : null,
      endDate: record.endDate ? moment(record.endDate) : null,
      status: record.status,
      contractTerms: record.contractTerms,
      birthDate: record.birthDate ? moment(record.birthDate) : null,
      cccd: record.citizenId,
      address: record.address,
      qualification: record.qualification,
      subject: record.subject,
      classLevel: record.classLevel || record.educationLevel, // Changed from level to classLevel (Lớp học)
      // New working schedule fields
      comments: record.comments, // Changed from evaluation to comments (Nhận xét)
      workSchedule: record.workSchedule, // Thời gian làm việc
      workShifts: record.workShifts ? (typeof record.workShifts === 'string' ? record.workShifts.split(',') : record.workShifts) : [], // Convert comma-separated string to array
      workDays: record.workDays ? (typeof record.workDays === 'string' ? record.workDays.split(',') : record.workDays) : [] // Convert comma-separated string to array
    };

    console.log('🔍 DEBUG: Form data for edit:', formData);
    form.setFieldsValue(formData);
    setModalVisible(true);
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

  // 🔄 REWRITTEN: Mở modal tạo hợp đồng từ ứng viên đã duyệt với lương theo giờ từ Quản Lý Offer
  const handleSelectCandidate = async (candidate) => {
    console.log('🔄 REWRITTEN: Creating contract for approved candidate:', candidate);
    setSelectedCandidate(candidate);
    const contractId = generateContractId();
    
    // Xác định loại vị trí để xử lý lương phù hợp
    const position = candidate.position || candidate.jobTitle || candidate.role || '';
    const contractType = candidate.contractType || '';
    const isTeacher = position.toLowerCase().includes('giáo viên') || 
                     position.toLowerCase().includes('teacher') || 
                     contractType === 'TEACHER';
    
    console.log('🔍 REWRITTEN DEBUG: Candidate analysis:', {
      position,
      contractType,
      isTeacher,
      candidateId: candidate.userId || candidate.id
    });
    
    // Set effective position for UI logic
    const effectivePosition = isTeacher ? 'giáo viên' : position;
    setCandidatePosition(effectivePosition);
    
    // Set basic candidate information
    candidateForm.setFieldsValue({
      contractId: contractId,
      fullName: candidate.fullName || '',
      email: candidate.email || '',
      phoneNumber: candidate.phoneNumber || '',
      position: position,
      startDate: '',
      endDate: '',
      status: 'ACTIVE',
      contractTerms: ''
    });
    
    // 🔄 REWRITTEN: Fetch offer data with focus on hourly salary for teachers
    try {
      const candidateId = candidate.userId || candidate.id || 1;
      console.log('🔄 REWRITTEN: Fetching offer data from editable Offer Management for candidate ID:', candidateId);
      
      const offerResponse = await axiosInstance.get(`/contracts/candidates/${candidateId}/offer`);
      const offerData = offerResponse.data;
      
      console.log('🔄 REWRITTEN: Received offer data from backend:', offerData);
      console.log('🔄 REWRITTEN: Salary breakdown - Hourly:', offerData.hourlySalary, 'Gross:', offerData.grossSalary, 'Net:', offerData.netSalary);
      
      // 🔄 REWRITTEN: Process salary data based on position type
      const formValues = {
        comments: offerData.comments || 'Chưa có nhận xét' // Changed from evaluation to comments
      };
      
      if (isTeacher) {
        // ✅ FOR TEACHERS: Only use hourly salary from editable Offer Management
        console.log('🎓 REWRITTEN TEACHER: Using hourly salary from editable Offer Management');
        
        if (offerData.hourlySalary && offerData.hourlySalary > 0) {
          formValues.hourlySalary = offerData.hourlySalary;
          console.log('✅ TEACHER: Set hourly salary from Offer Management:', offerData.hourlySalary, 'VND/hour');
        } else {
          formValues.hourlySalary = 100000; // Default 100k VND/hour
          console.log('⚠️ TEACHER: Using default hourly salary: 100,000 VND/hour');
        }
        
        // Don't set gross/net salary for teachers
        formValues.grossSalary = null;
        formValues.netSalary = null;
        
      } else {
        // ✅ FOR STAFF: Use gross and net salary
        console.log('👥 REWRITTEN STAFF: Using gross and net salary from Offer Management');
        
        formValues.grossSalary = offerData.grossSalary || 15000000; // Default 15M VND
        formValues.netSalary = offerData.netSalary || 12000000;     // Default 12M VND
        formValues.hourlySalary = null; // Don't set hourly salary for staff
        
        console.log('✅ STAFF: Set gross salary:', formValues.grossSalary, 'VND, net salary:', formValues.netSalary, 'VND');
      }
      
      console.log('🔄 REWRITTEN: Final form values for contract creation:', formValues);
      candidateForm.setFieldsValue(formValues);
      
      message.success(`✅ Đã tải thông tin lương từ Quản Lý Offer ${isTeacher ? '(Lương theo giờ)' : '(Lương gross/net)'}`);
      
    } catch (error) {
      console.error('🔄 REWRITTEN ERROR: Failed to fetch offer data:', error);
      message.error('❌ Không thể tải thông tin lương từ Quản Lý Offer!');
      
      // Set appropriate default values based on position
      const defaultValues = {
        comments: 'Chưa có nhận xét' // Changed from evaluation to comments
      };
      
      if (isTeacher) {
        defaultValues.hourlySalary = 100000; // 100k VND/hour for teachers
        defaultValues.grossSalary = null;
        defaultValues.netSalary = null;
      } else {
        defaultValues.grossSalary = 15000000; // 15M VND for staff
        defaultValues.netSalary = 12000000;   // 12M VND for staff
        defaultValues.hourlySalary = null;
      }
      
      candidateForm.setFieldsValue(defaultValues);
    }
    
    setCandidateModalVisible(true);
  };

  // Mở modal tạo hợp đồng thủ công
  const handleCreateManualContract = () => {
    const contractId = generateContractId();
    form.setFieldsValue({
      contractId: contractId
    });
    setModalVisible(true);
  };



  // Hàm validate ngày sinh (ít nhất 20 tuổi) - Đã bỏ validate tuổi theo yêu cầu
  const validateBirthDate = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng chọn ngày sinh'));
    }
    return Promise.resolve();
  };

  // Xem hợp đồng dưới dạng PDF
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
        let color, text;
        switch (status) {
          case 'ACTIVE':
            color = 'green';
            text = 'Đang hoạt động';
            break;
          case 'NEAR_EXPIRY':
            color = 'orange';
            text = 'Gần hết hạn hợp đồng';
            break;
          case 'EXPIRED':
            color = 'red';
            text = 'Hết hạn hợp đồng';
            break;
          case 'TERMINATED':
            color = 'volcano';
            text = 'Đã chấm dứt';
            break;
          default:
            color = 'default';
            text = status;
        }
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
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
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa hợp đồng này?"
            onConfirm={() => handleDeleteContract(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
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
      title: 'Loại hợp đồng',
      dataIndex: 'contractType',
      key: 'contractType',
      render: (type) => (
        <Tag color={type === 'TEACHER' ? 'blue' : 'green'}>
          {type === 'TEACHER' ? 'Giáo viên' : 'Nhân viên'}
        </Tag>
      )
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
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateManualContract}
            size="large"
          >
            Tạo hợp đồng thủ công
          </Button>
        </div>
        <Tabs defaultActiveKey="teachers" className="contract-tabs">
          <TabPane 
            tab={<span><UserOutlined /> Hợp đồng Giáo viên ({teacherContracts.length})</span>} 
            key="teachers"
          >
            <Table
              columns={contractColumns}
              dataSource={teacherContracts}
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
              dataSource={staffContracts}
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

      {/* Modal tạo/chỉnh sửa hợp đồng thủ công */}
      <Modal
        title={editingContract ? "Chỉnh sửa hợp đồng" : "Tạo hợp đồng mới"}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingContract(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingContract ? handleUpdateContract : handleCreateContract}
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
                {editingContract ? 'Cập nhật' : 'Tạo hợp đồng'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingContract(null);
                form.resetFields();
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
            return null; // Don't show for HR/Accountant staff
          })()}

          <Form.Item name="position" label="Vị trí">
            <Input placeholder="Vị trí" readOnly style={{ backgroundColor: '#f5f5f5' }} />
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
    </div>
  );
};

export default ContractManagement;