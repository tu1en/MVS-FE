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
import jsPDF from 'jspdf';

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
        educationLevel: values.level || values.educationLevel || '',
        // 🔄 REWRITTEN: Salary fields from editable Offer Management
        evaluation: values.evaluation || '',
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
      console.error('Error creating contract:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      message.error(`Không thể tạo hợp đồng! ${error.response?.data?.message || error.message || ''}`);
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
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null
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
      level: record.educationLevel
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
        evaluation: offerData.evaluation || 'Chưa có đánh giá'
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
        evaluation: 'Chưa có đánh giá'
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

  // Xem hợp đồng dước dạng PDF
  const handleViewContractPDF = (contract) => {
    console.log('Generating PDF for contract:', contract); // Debug log to inspect contract object
    const doc = new jsPDF();
    
    // Helper function to handle undefined/null values
    const getValue = (value, defaultValue = 'N/A') => value || defaultValue;
    
    // Extract contract details with fallback values
    // Try both possible field names to handle mapping issues
    const fullName = getValue(contract.fullName);
    const birthDate = contract.birthDate ? moment(contract.birthDate).format('DD/MM/YYYY') : 'N/A';
    const citizenId = getValue(contract.citizenId || contract.cccd);
    const address = getValue(contract.address);
    const qualification = getValue(contract.qualification);
    const subject = getValue(contract.subject || contract.position);
    const educationLevel = getValue(contract.educationLevel || contract.level);
    const startDate = contract.startDate ? moment(contract.startDate).format('DD/MM/YYYY') : 'N/A';
    const endDate = contract.endDate ? moment(contract.endDate).format('DD/MM/YYYY') : 'N/A';
    const salary = contract.salary ? contract.salary.toLocaleString('vi-VN') : 'N/A';
    const contractType = contract.type === 'teacher' ? 'Giáo viên' : 'Nhân viên';
    const department = getValue(contract.department);
    const offer = getValue(contract.offer);
    
    console.log('Extracted PDF values:', { citizenId, educationLevel, subject }); // Debug specific fields
    
    // Set document properties
    doc.setProperties({
      title: `Hợp đồng ${contractType} - ${fullName}`,
      subject: 'Hợp đồng lao động',
      author: 'ClassroomApp',
      keywords: 'hợp đồng, lao động, giáo viên, nhân viên',
      creator: 'ClassroomApp'
    });
    
    // Add placeholder for Vietnamese font support (to be implemented)
    // TODO: Implement proper Vietnamese font support for jsPDF
    doc.setCharSpace(0);
    
    // Sử dụng font helvetica với encoding chuẩn
    doc.setFont('helvetica');
    doc.setFontSize(14);
    doc.text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', 55, 20);
    doc.setFontSize(12);
    doc.text('Độc lập - Tự do - Hạnh phúc', 75, 30);
    doc.text('---------------------', 80, 35);
    doc.setFontSize(14);
    doc.text('HỢP ĐỒNG LAO ĐỘNG', 70, 50);
    doc.setFontSize(12);
    doc.text('(Về việc: Tuyển dụng giáo viên giảng dạy)', 60, 60);
    doc.text('Số: ........../HĐLĐ', 20, 70);
    doc.text('Căn cứ:', 20, 80);
    let y = 90;
    [
      '- Bộ luật Lao động nước Cộng hòa xã hội chủ nghĩa Việt Nam năm 2019;',
      '- Luật Giáo dục năm 2019 và các văn bản hướng dẫn thi hành;',
      '- Nhu cầu và năng lực của hai bên.'
    ].forEach(line => {
      const wrapped = doc.splitTextToSize(line, 160);
      doc.text(wrapped, 30, y);
      y += wrapped.length * 7;
    });
    const wrappedIntro = doc.splitTextToSize('Hôm nay, ngày .... tháng .... năm ........, tại Trung tâm bồi dưỡng kiến thức Minh Việt, chúng tôi gồm:', 160);
    doc.text(wrappedIntro, 20, y);
    y += wrappedIntro.length * 7;
    let yPosition = y; // continue using yPosition as before

    
    yPosition = 130;
    doc.setFontSize(14);
    doc.text('1. Ben A (Ben thue):', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Trung tam boi duong kien thuc Minh Viet', 30, yPosition);
    yPosition += 10;
    doc.text('Ma so thue: 123456789', 30, yPosition);
    yPosition += 10;
    doc.text('Dia chi: 123 Duong Le Loi, Quan 1, TP. Ho Chi Minh', 30, yPosition);
    yPosition += 10;
    doc.text('Dai dien: Ong Nguyen Van A', 30, yPosition);
    yPosition += 10;
    doc.text('Chuc vu: Giam doc', 30, yPosition);
    yPosition += 10;
    doc.text('So dien thoai: 0123 456 789    Email: info@minhviet.edu.vn', 30, yPosition);
    yPosition += 10;
    
    doc.setFontSize(14);
    doc.text('2. Ben B (Ben duoc thue):', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`Ho va ten: ${fullName}`, 30, yPosition);
    yPosition += 10;
    doc.text(`Sinh ngay: ${birthDate}`, 30, yPosition);
    yPosition += 10;
    doc.text(`So CCCD: ${citizenId}`, 30, yPosition);
    yPosition += 10;
    doc.text(`Dia chi: ${address}`, 30, yPosition);
    yPosition += 10;
    doc.text(`So dien thoai: ${contract.phoneNumber || 'N/A'}    Email: ${contract.email || 'N/A'}`, 30, yPosition);
    yPosition += 10;
    doc.text(`Trinh do chuyen mon: ${qualification}`, 30, yPosition);
    yPosition += 10;
    
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Hai ben cung thong nhat ky ket hop dong voi cac dieu khoan sau:', 20, yPosition);
    yPosition += 10;
    doc.text('Dieu 1: Noi dung hop dong', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Ben A thue Ben B lam giao vien giang day voi noi dung cong viec nhu sau:', 30, yPosition);
    yPosition += 10;
    doc.text(`- Mon hoc giang day: ${subject || contract.position || 'N/A'}`, 40, yPosition);
    yPosition += 10;
    doc.text(`- Cap hoc: ${educationLevel}`, 40, yPosition);
    yPosition += 10;
    doc.text(`- Thoi gian giang day: Tu ${startDate} den ${endDate}`, 40, yPosition);
    yPosition += 10;
    doc.text('- Dia diem giang day: Trung tam boi duong kien thuc Minh Viet', 40, yPosition);
    yPosition += 10;
    doc.text('- Ben B phai tuan thu day du, dung chuong trinh day, dam bao chat luong hoc tap cua hoc sinh.', 40, yPosition);
    yPosition += 10;
    
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Dieu 2: Thoi han hop dong va che do lam viec', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('- Loai hop dong lao dong: Co ky han.', 30, yPosition);
    yPosition += 10;
    doc.text(`- Thoi han hop dong: Tu ${startDate} den ${endDate}`, 30, yPosition);
    yPosition += 10;
    doc.text('- Thoi gian lam viec cua ben B: 8 gio/ngay.', 30, yPosition);
    yPosition += 10;
    doc.text('- Ben B duoc cap phat nhung dung cu lam viec gom: Cac tai lieu phuc vu cho giang day, dung cu giang day, thiet bi day hoc.', 30, yPosition);
    yPosition += 10;
    
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Dieu 3: Muc luong va phuong thuc thanh toan', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`- Ben A dong y chi tra cho ben B muc luong viec giang day voi so tien la: ${salary} dong/thang`, 30, yPosition);
    yPosition += 10;
    doc.text('- Thoi han tra tien luong: Ben A se tra tien luong cho ben B 01 lan vao cac ngay 5 hang thang.', 30, yPosition);
    yPosition += 10;
    doc.text('- Phuong thuc thanh toan: chuyen khoan.', 30, yPosition);
    yPosition += 10;
    doc.text('- Ben A co quyen dieu chinh muc luong theo hieu qua cong viec va cac yeu cau khac phat sinh ma khong can co su dong y cua ben B, nhung khong duoc thap hon qua 10% cua muc luong thang truoc do tai thoi diem dang chi tra luong cho ben B.', 30, yPosition);
    yPosition += 15;
    doc.text('- Ngoai muc luong ben A chi tra cho ben B, Ben B duoc huong tien thuong hang thang, hang ky, cuoi nam va cac khoan khac theo thoa thuan cua hai ben (neu co).', 30, yPosition);
    yPosition += 15;
    
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Dieu 4: Quyen va nghia vu cua ben A', 20, yPosition);
    yPosition += 10;
    doc.text('4.1. Quyen loi cua ben A:', 25, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('- Ben A co quyen yeu cau giao vien thuc hien dung noi dung giang day theo hop dong va co quyen kiem tra, danh gia chat luong giang day.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben A co quyen yeu cau dieu chinh phuong phap giang day cua Ben B neu thay khong phu hop voi yeu cau, tieu chuan giang day cua ben A.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben A co quyen cham dut hop dong ngay lap tuc neu Ben B vi pham nghiem trong cac quy dinh, noi quy cua lop hoc hoac hop dong.', 35, yPosition);
    yPosition += 10;
    doc.text('4.2. Nghia vu cua Ben A:', 25, yPosition);
    yPosition += 10;
    doc.text('- Ben A co nghia vu cung cap day du co so vat chat, trang thiet bi, tai lieu, dung cu giang day can thiet cho Ben B.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben A co nghia vu thanh toan dung han tien luong cho Ben B theo thoa thuan trong hop dong.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben A khong co nghia vu cung cap bat ky ho tro nao ngoai cac dieu khoan da ghi trong hop dong.', 35, yPosition);
    yPosition += 10;
    
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Dieu 5: Quyen va nghia vu cua ben B', 20, yPosition);
    yPosition += 10;
    doc.text('5.1. Quyen loi cua ben B:', 25, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('- Ben B co quyen yeu cau ben A thanh toan tien luong day du, dung han theo dieu 3 hop dong nay.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben B co quyen duoc yeu cau ho tro tai lieu, trang thiet bi day hoc tu ben A, nhung phai dam bao viec su dung nhung tai lieu nay chi phuc vu cho muc dich giang day o tren lop.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben B co quyen duoc nghi day trong truong hop co ly do chinh dang va phai thong bao cho ben A truoc 03 ngay.', 35, yPosition);
    yPosition += 10;
    doc.text('- Truong hop ben A cham thanh toan luong qua 15 ngay, ben B co quyen tam ngung giang day cho den khi duoc thanh toan.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben B duoc dam bao moi truong lam viec phu hop va duoc huong cac quyen loi khac (neu co).', 35, yPosition);
    yPosition += 10;
    doc.text('5.2. Nghia vu cua ben B:', 25, yPosition);
    yPosition += 10;
    doc.text('- Ben B phai thuc hien day du, dung chuong trinh day, dam bao chat luong hoc tap cua hoc sinh.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben B khong duoc nghi day dot xuat ma khong co ly do chinh dang, truong hop nghi phai thong bao truoc it nhat 3 ngay.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben B phai giu gin dao duc nghe nghiep, khong co hanh vi thieu chuyen nghiep hoac vi pham phap luat trong suot thoi gian lam viec, giao ket hop dong voi ben A.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben B khong duoc tu y su dung tai lieu, chuong trinh day hoc cua ben A cho muc dich ca nhan, khong lien quan den cong viec ben A thue ben B.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben B phai tuan thu day du, dung noi quy, quy dinh cua lop hoc va cac yeu cau cua ben A.', 35, yPosition);
    yPosition += 10;
    
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Dieu 6: Cham dut hop dong', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Hop dong se cham dut trong cac truong hop sau:', 30, yPosition);
    yPosition += 10;
    doc.text('- Het thoi han hop dong ma hai ben khong gia han.', 40, yPosition);
    yPosition += 10;
    doc.text('- Hai ben thoa thuan cham dut hop dong truoc thoi han.', 40, yPosition);
    yPosition += 10;
    doc.text('- Mot trong hai ben vi pham nghiem trong dieu khoan hop dong thi ben con lai duoc don phuong cham dut hop dong.', 40, yPosition);
    yPosition += 10;
    doc.text('- Giao vien khong dap ung yeu cau giang day, chat luong hoc sinh hoac vi pham noi quy cua ben thue dat ra.', 40, yPosition);
    yPosition += 10;
    doc.text('- Ben A khong thuc hien thanh toan dung han va khong khac phuc sau 15 ngay.', 40, yPosition);
    yPosition += 10;
    
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Dieu 7: Xu li vi pham hop dong', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('- Neu Ben B vi pham noi quy hoac tu y nghi day ma khong co ly do chinh dang, Ben A co quyen cham dut hop dong ngay lap tuc va khong thanh toan luong cho cac buoi day chua hoan thanh.', 30, yPosition);
    yPosition += 15;
    doc.text('- Neu Ben A khong thanh toan dung han, Ben B co quyen tam ngung giang day cho den khi duoc thanh toan day du.', 30, yPosition);
    yPosition += 10;
    doc.text('- Truong hop mot trong hai ben gay thiet hai do vi pham hop dong, ben bi thiet hai co quyen yeu cau boi thuong toan bo thiet hai do vi pham gay ra.', 30, yPosition);
    yPosition += 15;
    
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Dieu 8: Giai quyet tranh chap', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Moi tranh chap phat sinh se duoc giai quyet thong qua thuong luong, hoa giai. Neu khong dat duoc thoa thuan, tranh chap se duoc dua ra toa an co tham quyen giai quyet.', 30, yPosition);
    yPosition += 15;
    doc.text('Hop dong nay co hieu luc tu ngay ky va duoc lap thanh 02 ban, moi ben giu 01 ban co gia tri phap ly nhu nhau.', 30, yPosition);
    yPosition += 15;
    doc.text('Hai ben cam ket thuc hien dung cac dieu khoan cua hop dong.', 30, yPosition);
    yPosition += 20;
    
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Chu ky
    doc.setFontSize(14);
    doc.text('DAI DIEN BEN A', 30, yPosition);
    doc.text('DAI DIEN BEN B', 130, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('(Ky va ghi ro ho ten)', 25, yPosition);
    doc.text('(Ky va ghi ro ho ten)', 125, yPosition);
    
    // Open PDF in new tab
    window.open(doc.output('bloburl'), '_blank');
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

          <Form.Item name="subject" label="Môn giảng dạy" rules={[{ required: true, message: 'Vui lòng nhập môn giảng dạy!' }]}>
            <Input placeholder="Nhập môn giảng dạy" />
          </Form.Item>

          <Form.Item name="level" label="Cấp học" rules={[{ required: true, message: 'Vui lòng nhập cấp học!' }]}>
            <Input placeholder="Nhập cấp học" />
          </Form.Item>

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

          <Form.Item name="subject" label="Môn giảng dạy" rules={[{ required: true, message: 'Vui lòng nhập môn giảng dạy!' }]}>
            <Input placeholder="Nhập môn giảng dạy" />
          </Form.Item>

          <Form.Item name="level" label="Cấp học" rules={[{ required: true, message: 'Vui lòng nhập cấp học!' }]}>
            <Input placeholder="Nhập cấp học" />
          </Form.Item>

          <Form.Item name="position" label="Vị trí">
            <Input placeholder="Vị trí" readOnly style={{ backgroundColor: '#f5f5f5' }} />
          </Form.Item>

          {/* Offer Management Fields - Read Only */}
          <Form.Item name="evaluation" label="Đánh giá">
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