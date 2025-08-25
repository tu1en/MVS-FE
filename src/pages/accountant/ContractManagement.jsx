import {
    CheckOutlined,
    EditOutlined,
    FilePdfOutlined,
    PlusOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    DatePicker,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Popconfirm,
    Select,
    Space,
    Table,
    Tabs,
    Tag,
    Tooltip
} from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import './ContractManagement.css';

import ContractPDFGenerator from '../../utils/ContractPDFGenerator';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const ContractManagement = () => {
  const [teacherContracts, setTeacherContracts] = useState([]);
  const [candidatesReady, setCandidatesReady] = useState([]);
  const [loading, setLoading] = useState(false);
  const [candidateModalVisible, setCandidateModalVisible] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidatePosition, setCandidatePosition] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filteredTeacherContracts, setFilteredTeacherContracts] = useState([]);
  const [candidateForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [canEditHourly, setCanEditHourly] = useState(false);

  // Bộ lọc trạng thái hợp đồng
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [completedContracts, setCompletedContracts] = useState(new Set());

  

  // Helper: parse various date shapes to moment safely
  const parseToMoment = (value) => {
    if (!value) return null;
    if (moment.isMoment(value)) return value;
    // Try strict known formats first
    const formats = ['YYYY-MM-DD', 'DD/MM/YYYY', 'YYYY/MM/DD', moment.ISO_8601];
    const m = moment(value, formats, true);
    if (m.isValid()) {
      return m.isAfter(moment(), 'day') ? null : m;
    }
    // Fallback loose parse
    const m2 = moment(value);
    if (!m2.isValid() || m2.isAfter(moment(), 'day')) return null;
    return m2;
  };

  // ===== Contract ID helpers =====
  // New format: HĐLĐ-CT36-XXMM/YYYY (e.g., HĐLĐ-CT36-2308/2025)
  const CONTRACT_ID_PREFIX = 'HĐLĐ-CT36-';
  const CONTRACT_ID_REGEX = /^HĐLĐ-CT36-(\d{2})(\d{2}\/\d{4})$/;

  const getCurrentMonthYear = () => moment().format('MM/YYYY');

  const getUsedCodesForMonthYear = (monthYear) => {
    const used = new Set();
    (teacherContracts || []).forEach((c) => {
      const id = (c?.contractId ?? '').toString();
      const match = id.match(CONTRACT_ID_REGEX);
      if (match && match[2] === monthYear) {
        used.add(match[1]);
      }
    });
    return used;
  };

  const generateUniqueTwoDigitCode = (monthYear) => {
    const used = getUsedCodesForMonthYear(monthYear);
    // Prefer 10..99
    const pool = [];
    for (let i = 10; i <= 99; i++) pool.push(i);
    // Shuffle pool (Fisher-Yates)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    for (const n of pool) {
      const code = n.toString().padStart(2, '0');
      if (!used.has(code)) return code;
    }
    // Fallback to 00..99
    const pool2 = [];
    for (let i = 0; i <= 99; i++) pool2.push(i);
    for (let i = pool2.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool2[i], pool2[j]] = [pool2[j], pool2[i]];
    }
    for (const n of pool2) {
      const code = n.toString().padStart(2, '0');
      if (!used.has(code)) return code;
    }
    // Worst case: return a random two-digit value
    return Math.floor(Math.random() * 90 + 10).toString();
  };

  const generateContractId = (monthYear = getCurrentMonthYear()) => {
    const code = generateUniqueTwoDigitCode(monthYear);
    return `${CONTRACT_ID_PREFIX}${code}${monthYear}`;
  };

  const contractIdDisplay = (id) => {
    const str = (id ?? '').toString();
    const match = str.match(CONTRACT_ID_REGEX);
    if (match) {
      return `${str} (ký vào ${match[2]})`;
    }
    return str || '—';
  };



  // Fetch data khi component mount
  useEffect(() => {
    fetchContracts();
    fetchCandidatesReady();
  }, []);

  // Filter contracts when data changes
  useEffect(() => {
    filterContracts(searchText);
  }, [teacherContracts, searchText, statusFilter]);

  // Show raw DB contract IDs without reformatting

  // Lấy danh sách hợp đồng theo loại
  const fetchContracts = async () => {
    setLoading(true);
    try {
      const teacherResponse = await axiosInstance.get('/contracts/type/TEACHER');
      setTeacherContracts(teacherResponse.data);
      setFilteredTeacherContracts(teacherResponse.data);
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

  

  // Xử lý tạo hợp đồng mới
  const handleCreateContract = async (values) => {
    console.log('Creating contract:', values);

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

    // Chỉ cho phép lương theo giờ (Teacher contract)
    const hasHourly = values.hourlySalary && values.hourlySalary > 0;
    if (!hasHourly) {
      message.error('Vui lòng kiểm tra Lương theo giờ (chỉ áp dụng cho Hợp đồng Giáo viên)!');
      return;
    }
    console.log('SALARY VALIDATION PASSED (hourly only):', { hourlySalary: values.hourlySalary });

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

      // Không tự sinh/sửa ID hợp đồng ở FE. Để BE/DB quyết định.

      // Tính lương tổng hợp từ lương theo giờ (ước tính theo 80 giờ/tháng)
      let finalSalary = 0;
      let salaryType = 'Hourly';
      finalSalary = values.hourlySalary * 80;
      console.log('HOURLY SALARY: ', values.hourlySalary, 'VND/hour, Estimated Monthly:', finalSalary);

      // Dữ liệu hợp đồng - mặc định TEACHER, chỉ dùng lương theo giờ
      const contractData = {
        userId: userId,
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber || '',
        address: values.address || '',
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
        citizenId: values.cccd,
        qualification: values.qualification,
        position: values.position,
        department: values.department || 'Phòng Giáo vụ',
        contractType: 'TEACHER',
        salary: finalSalary, // Main salary field for compatibility
        // workingHours: values.workingHours || 'ca sáng (7:30-9:30)',
        contractTerms: values.contractTerms || 'Điều khoản hợp đồng chuẩn',
        comments: values.comments || 'Hợp đồng được tạo từ ứng viên đã duyệt',
        // Chỉ giữ lương theo giờ
        hourlySalary: values.hourlySalary,
        // Thông tin giảng dạy
        subject: values.subject,
        classLevel: values.classLevel,
        // Lịch làm việc
        // workShifts: Array.isArray(values.workShifts) ? values.workShifts.join(',') : (values.workShifts || ''),
        // workDays: Array.isArray(values.workDays) ? values.workDays.join(',') : (values.workDays || ''),
        // workSchedule: values.workSchedule || '',
        salaryType: salaryType // Additional info for logging
      };

      console.log('Sending contract creation request (TEACHER, hourly only):', contractData);
      console.log('Salary field breakdown:', {
        salary: contractData.salary,
        hourlySalary: contractData.hourlySalary
      });

      await axiosInstance.post('/contracts', contractData);
      message.success(`Tạo hợp đồng thành công cho ${values.fullName} với lương ${salaryType}!`);
      setCandidateModalVisible(false);
      candidateForm.resetFields();
      setSelectedCandidate(null);
      fetchContracts();
      fetchCandidatesReady();
    } catch (error) {
      console.error('Error creating contract:', error);
      message.error('Có lỗi xảy ra khi tạo hợp đồng!');
    }
  };

  // Hàm tìm kiếm và lọc hợp đồng
  const handleSearch = (value) => {
    setSearchText(value);
    filterContracts(value);
  };

  const filterContracts = (searchValue) => {
    const filterData = (contracts) => {
      let result = contracts;

      // Lọc theo từ khóa tìm kiếm (tên hoặc 9 ký tự cuối ID)
      if (searchValue) {
        result = result.filter(contract => {
          const fullName = contract.fullName?.toLowerCase() || '';
          const contractId = contract.contractId?.toString() || '';
          const idLower = contractId.toLowerCase();
          const last9Lower = idLower.slice(-9);
          const searchLower = searchValue.trim().toLowerCase();
          const afterPrefixLower = idLower.startsWith(CONTRACT_ID_PREFIX.toLowerCase())
            ? idLower.slice(CONTRACT_ID_PREFIX.length)
            : idLower;
          const startsWithDigit = /^\d/.test(searchLower);

          // Nếu nhập bắt đầu bằng số, chỉ lọc theo tiền tố của ID hợp đồng
          if (startsWithDigit) {
            return (
              idLower.startsWith(searchLower) ||
              afterPrefixLower.startsWith(searchLower) ||
              last9Lower.startsWith(searchLower)
            );
          }

          // Mặc định: theo tên (chứa) hoặc ID (bắt đầu)
          return (
            fullName.includes(searchLower) ||
            idLower.startsWith(searchLower) ||
            last9Lower.startsWith(searchLower)
          );
        });
      }

      // Lọc theo trạng thái
      if (statusFilter !== 'ALL') {
        result = result.filter(contract => contract.status === statusFilter);
      }

      return result;
    };

    setFilteredTeacherContracts(filterData(teacherContracts));
  };

  // Hàm validate ngày sinh: không được ở tương lai
  const validateBirthDate = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng chọn ngày sinh'));
    }
    if (value.isAfter(moment(), 'day')) {
      return Promise.reject(new Error('Ngày sinh không được ở tương lai!'));
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

  // Mở modal chỉnh sửa và đổ dữ liệu hợp đồng
  const handleEditContract = (record) => {
    setEditingContract(record);
    setEditModalVisible(true);
    // Chỉ cho phép sửa lương theo giờ NGAY SAU KHI KÝ LẠI: status=ACTIVE và startDate = hôm nay
    const start = record?.startDate ? moment(record.startDate) : null;
    const justRenewed = record?.status === 'ACTIVE' && start && start.isSame(moment(), 'day');
    setCanEditHourly(!!justRenewed);

    // const workShifts = Array.isArray(record.workShifts)
    //   ? record.workShifts
    //   : (record.workShifts ? record.workShifts.split(',').map(s => s.trim()).filter(Boolean) : []);
    // const workDays = Array.isArray(record.workDays)
    //   ? record.workDays
    //   : (record.workDays ? record.workDays.split(',').map(s => s.trim()).filter(Boolean) : []);

    editForm.setFieldsValue({
      contractId: record.contractId,
      fullName: record.fullName,
      birthDate: parseToMoment(record.birthDate),
      email: record.email,
      phoneNumber: record.phoneNumber,
      cccd: record.citizenId || record.cccd || '',
      address: record.address || '',
      qualification: record.qualification || '',
      subject: record.subject || '',
      classLevel: record.classLevel || record.educationLevel || '',
      // workShifts,
      // workDays,
      // workSchedule: record.workSchedule || '',
      position: record.position || '',
      hourlySalary: record.hourlySalary || undefined,
    });
  };

  // Cập nhật hợp đồng (PUT /contracts/{id})
  const handleUpdateContract = async (values) => {
    try {
      if (!editingContract || !editingContract.id) {
        message.error('Không xác định được hợp đồng cần cập nhật!');
        return;
      }

      const payload = {
        // Không chỉnh sửa các trường chỉ đọc, nhưng gửi kèm để BE an toàn
        contractId: values.contractId || editingContract.contractId,
        fullName: editingContract.fullName,
        email: editingContract.email,
        phoneNumber: editingContract.phoneNumber,
        position: editingContract.position,
        contractType: 'TEACHER',

        // Các trường cho phép chỉnh sửa
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
        citizenId: values.cccd,
        address: values.address,
        qualification: values.qualification,
        subject: values.subject,
        classLevel: values.classLevel,
        // workShifts: Array.isArray(values.workShifts) ? values.workShifts.join(',') : (values.workShifts || ''),
        // workDays: Array.isArray(values.workDays) ? values.workDays.join(',') : (values.workDays || ''),
        // workSchedule: values.workSchedule || ''
      };

      // Chỉ gửi hourlySalary nếu được phép (vừa ký lại xong)
      if (canEditHourly) {
        payload.hourlySalary = values.hourlySalary;
      }

      await axiosInstance.put(`/contracts/${editingContract.id}`, payload);
      message.success('Cập nhật hợp đồng thành công!');
      setEditModalVisible(false);
      setEditingContract(null);
      editForm.resetFields();
      fetchContracts();
    } catch (error) {
      console.error('Error updating contract:', error);
      message.error('Không thể cập nhật hợp đồng!');
    }
  };

  // Chọn ứng viên để tạo hợp đồng, tải thông tin Offer (nếu có)
  const handleSelectCandidate = async (record) => {
    try {
      setSelectedCandidate(record);
      setCandidatePosition(record.position || '');
      setCandidateModalVisible(true);

      candidateForm.setFieldsValue({
        fullName: record.fullName || '',
        email: record.email || '',
        phoneNumber: record.phoneNumber || '',
        position: record.position || '',
        hourlySalary: record.hourlySalary,
        cccd: record.citizenId || record.cccd || '',
        qualification: record.qualification || '',
        address: record.address || '',
        birthDate: parseToMoment(record.birthDate),
        subject: record.subject || '',
        classLevel: record.classLevel || record.educationLevel || ''
      });

      if (record.id) {
        try {
          const res = await axiosInstance.get(`/contracts/candidates/${record.id}/offer`);
          const offer = res.data || {};
          candidateForm.setFieldsValue({
            hourlySalary: offer.hourlySalary ?? candidateForm.getFieldValue('hourlySalary'),
            subject: offer.subject || candidateForm.getFieldValue('subject'),
            classLevel: offer.classLevel || candidateForm.getFieldValue('classLevel'),
            // workShifts: Array.isArray(offer.workShifts)
              // ? offer.workShifts
              // : (offer.workShifts ? offer.workShifts.split(',').map(s => s.trim()).filter(Boolean) : candidateForm.getFieldValue('workShifts')),
            // workDays: Array.isArray(offer.workDays)
            //   ? offer.workDays
            //   : (offer.workDays ? offer.workDays.split(',').map(s => s.trim()).filter(Boolean) : candidateForm.getFieldValue('workDays')),
            // workSchedule: offer.workSchedule || candidateForm.getFieldValue('workSchedule'),
          });
        } catch (e) {
          // Không có offer cụ thể cũng không sao
          console.warn('Không thể tải thông tin Offer của ứng viên:', e);
        }
      }
    } catch (error) {
      console.error('Error selecting candidate:', error);
    }
  };

  // Đánh dấu hoàn thành (cục bộ UI)
  const handleCompleteContract = (id) => {
    setCompletedContracts((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    message.success('Đã đánh dấu hợp đồng là hoàn thành .');
  };

  // Gia hạn hợp đồng (ký lại)
  const handleRenewContract = async (contractId) => {
    try {
      await axiosInstance.put(`/contracts/${contractId}/renew`);
      message.success('Gia hạn hợp đồng thành công! Hợp đồng đã được ký lại với thời hạn mới.');
      fetchContracts(); // Refresh data
    } catch (error) {
      console.error('Error renewing contract:', error);
      message.error('Không thể gia hạn hợp đồng!');
    }
  };

  // Cấu hình cột cho bảng hợp đồng
  const contractColumns = [
    {
      title: 'ID Hợp đồng',
      dataIndex: 'contractId',
      key: 'contractId',
      width: 220,
      render: (text) => (
        <strong style={{ color: '#1890ff' }}>{(text ?? '').toString()}</strong>
      )
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
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue';
        let text = status;
        
        switch(status) {
          case 'ACTIVE':
            color = 'green';
            text = 'Còn hạn';
            break;
          case 'NEAR_EXPIRY':
            color = 'orange';
            text = 'Sắp hết hạn';
            break;
          case 'EXPIRED':
            color = 'red';
            text = 'Hết hạn';
            break;
          case 'PENDING':
            color = 'geekblue';
            text = 'Chưa có hiệu lực';
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
              disabled={completedContracts.has(record.id)}
              style={{
                backgroundColor: completedContracts.has(record.id) ? '#d9d9d9' : undefined,
                borderColor: completedContracts.has(record.id) ? '#d9d9d9' : undefined,
                color: completedContracts.has(record.id) ? '#999' : undefined
              }}
              title={
                completedContracts.has(record.id) ? 'Không thể chỉnh sửa hợp đồng đã hoàn thành' :
                'Chỉnh sửa hợp đồng'
              }
            />
          </Tooltip>
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
          {record.status === 'EXPIRED' && !completedContracts.has(record.id) && (
            <Popconfirm
              title="Bạn có chắc chắn muốn gia hạn và ký lại hợp đồng này?"
              onConfirm={() => handleRenewContract(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Tooltip title="Đánh dấu hoàn thành (Ký lại)">
                <Button 
                  icon={<CheckOutlined />} 
                  size="small" 
                  style={{ color: '#ff4d4f', backgroundColor: '#fff2f0', borderColor: '#ff4d4f' }}
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
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên hoặc 9 ký tự cuối ID hợp đồng"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 400 }}
            allowClear
          />
          <Select
            style={{ width: 220 }}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
          >
            <Option value="ALL">Tất cả trạng thái</Option>
            <Option value="ACTIVE">Còn hạn</Option>
            <Option value="NEAR_EXPIRY">Sắp hết hạn</Option>
            <Option value="EXPIRED">Hết hạn</Option>
            <Option value="PENDING">Chưa có hiệu lực</Option>
          </Select>
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
              placeholder="Sẽ được tạo tự động sau khi lưu" 
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
            <DatePicker 
              style={{ width: '100%' }} 
              format="DD/MM/YYYY" 
              placeholder="Chọn ngày sinh" 
            />
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

          <Form.Item name="subject" label="Môn giảng dạy" rules={[{ required: true, message: 'Vui lòng nhập môn giảng dạy!' }]}>
            <Input placeholder="Nhập môn giảng dạy" />
          </Form.Item>

          <Form.Item name="classLevel" label="Lớp học" rules={[{ required: true, message: 'Vui lòng nhập lớp học!' }]}>
            <Input placeholder="Nhập lớp học" />
          </Form.Item>

          {/* <Form.Item 
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
          </Form.Item> */}

          {/* <Form.Item 
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
          </Form.Item> */}

          {/* <Form.Item name="workSchedule" label="Thời gian làm việc chi tiết">
            <Input.TextArea 
              rows={3} 
              placeholder="Mô tả chi tiết thời gian làm việc (ví dụ: Thứ 2, 4, 6 - Ca sáng và chiều)"
            />
          </Form.Item> */}

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

          <Form.Item 
            name="hourlySalary" 
            label="Lương theo giờ"
          >
            <InputNumber
              style={{ 
                width: '100%',
                backgroundColor: '#f0f8ff',
                border: '2px solid #52c41a',
                color: '#52c41a',
                fontWeight: 'bold'
              }}
              placeholder="Lấy từ duyệt ứng viên"
              readOnly={!canEditHourly}
              disabled={!canEditHourly}
              controls={false}
              precision={0}
              inputMode="numeric"
              onKeyDown={(e) => {
                // Chặn các phím không phải số, CHO PHÉP dấu phẩy "," để người dùng gõ phân tách
                if (['e','E','+','-','.','.'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              formatter={value => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
              parser={value => value ? value.replace(/[^0-9]/g, '') : ''}
            />
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
            <DatePicker 
              style={{ width: '100%' }} 
              format="DD/MM/YYYY" 
              placeholder="Chọn ngày sinh" 
            />
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

          <Form.Item name="subject" label="Môn giảng dạy" rules={[{ required: true, message: 'Vui lòng nhập môn giảng dạy!' }]}>
            <Input placeholder="Nhập môn giảng dạy" />
          </Form.Item>

          <Form.Item name="classLevel" label="Lớp học" rules={[{ required: true, message: 'Vui lòng nhập lớp học!' }]}>
            <Input placeholder="Nhập lớp học" />
          </Form.Item>

          {/* <Form.Item 
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
          </Form.Item> */}

          {/* <Form.Item 
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
          </Form.Item> */}

          {/* <Form.Item name="workSchedule" label="Thời gian làm việc chi tiết">
            <Input.TextArea 
              rows={3} 
              placeholder="Mô tả chi tiết thời gian làm việc (ví dụ: Thứ 2, 4, 6 - Ca sáng và chiều)"
            />
          </Form.Item> */}

          <Form.Item name="position" label="Vị trí">
            <Input placeholder="Vị trí" readOnly style={{ backgroundColor: '#f5f5f5' }} />
          </Form.Item>

          <Form.Item name="hourlySalary" label="Lương theo giờ">
            <InputNumber
              style={{ 
                width: '100%',
                backgroundColor: '#f0f8ff',
                border: '2px solid #52c41a',
                color: '#52c41a',
                fontWeight: 'bold'
              }}
              placeholder="Lấy từ duyệt ứng viên"
              readOnly
              disabled
              formatter={value => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
              parser={value => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
            />
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

      {/* ĐÃ XÓA Modal gia hạn hợp đồng */}
    </div>
  );
};

export default ContractManagement;