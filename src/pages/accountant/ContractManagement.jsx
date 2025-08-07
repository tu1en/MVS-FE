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

  // Xử lý tạo hợp đồng mới
  const handleCreateContract = async (values) => {
    if (values.endDate && values.endDate.isBefore(values.startDate, 'day')) {
      message.error('Ngày kết thúc không được trước ngày bắt đầu!');
      return;
    }
    if (values.endDate && values.endDate.isBefore(moment(), 'day')) {
      message.error('Ngày kết thúc không được là ngày trong quá khứ!');
      return;
    }
    try {
      const contractData = {
        ...values,
        citizenId: values.cccd, // mapping CCCD
        educationLevel: values.level, // mapping cấp học
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        status: 'ACTIVE',
        createdBy: 'Accountant'
      };
      delete contractData.cccd;
      delete contractData.level;

      await axiosInstance.post('/contracts', contractData);
      message.success('Tạo hợp đồng thành công!');
      setModalVisible(false);
      setCandidateModalVisible(false);
      form.resetFields();
      candidateForm.resetFields();
      fetchContracts();
      fetchCandidatesReady();
    } catch (error) {
      console.error('Error creating contract:', error);
      message.error('Không thể tạo hợp đồng!');
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

  // Mở modal tạo hợp đồng từ ứng viên đã duyệt
  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    candidateForm.setFieldsValue({
      userId: candidate.userId || '',
      fullName: candidate.fullName || '',
      email: candidate.email || '',
      phoneNumber: candidate.phoneNumber || '',
      contractType: candidate.contractType || 'TEACHER',
      position: candidate.position || '',
      department: '',
      offer: candidate.offer || 'Chưa có thông tin offer',
      salary: candidate.salary || 0,
      workingHours: '8',
      startDate: '',
      endDate: '',
      status: 'ACTIVE',
      contractTerms: ''
    });
    setCandidateModalVisible(true);
  };

  // Mở modal chỉnh sửa hợp đồng
  const handleEditContract = async (record) => {
    try {
      console.log('Editing contract:', record);
      // Parse dates with moment to ensure proper format before validation
      const parsedStartDate = record.startDate ? moment(record.startDate, ['YYYY-MM-DD', 'DD/MM/YYYY', moment.ISO_8601], true) : null;
      const parsedEndDate = record.endDate ? moment(record.endDate, ['YYYY-MM-DD', 'DD/MM/YYYY', moment.ISO_8601], true) : null;
      const parsedBirthDate = record.birthDate ? moment(record.birthDate, ['YYYY-MM-DD', 'DD/MM/YYYY', moment.ISO_8601], true) : null;
      
      console.log('Parsed dates:', { 
        startDate: parsedStartDate, 
        endDate: parsedEndDate, 
        birthDate: parsedBirthDate 
      });
      
      form.setFieldsValue({
        ...record,
        startDate: parsedStartDate && parsedStartDate.isValid() ? parsedStartDate : null,
        endDate: parsedEndDate && parsedEndDate.isValid() ? parsedEndDate : null,
        birthDate: parsedBirthDate && parsedBirthDate.isValid() ? parsedBirthDate : null,
      });
      setEditingContract(record);
      setModalVisible(true);
    } catch (error) {
      console.error('Error in handleEditContract:', error);
      message.error('Có lỗi xảy ra khi mở form chỉnh sửa hợp đồng');
    }
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
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Offer',
      dataIndex: 'offer',
      key: 'offer',
      render: (offer) => offer || 'Chưa có thông tin offer'
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
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department'
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
          <Form.Item name="userId" label="User ID" rules={[{ required: true, message: 'Vui lòng nhập User ID!' }]}>
            <Input placeholder="Nhập User ID" />
          </Form.Item>

          <Form.Item name="fullName" label="Họ và tên">
            <Input placeholder="Nhập họ và tên" />
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
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item name="phoneNumber" label="Số điện thoại">
            <Input placeholder="Nhập số điện thoại" />
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

          <Form.Item name="contractType" label="Loại hợp đồng" rules={[{ required: true, message: 'Vui lòng chọn loại hợp đồng!' }]}>
            <Select placeholder="Chọn loại hợp đồng">
              <Option value="TEACHER">Giáo viên</Option>
              <Option value="STAFF">Nhân viên</Option>
            </Select>
          </Form.Item>

          <Form.Item name="position" label="Vị trí" rules={[{ required: true, message: 'Vui lòng nhập vị trí!' }]}>
            <Input placeholder="Nhập vị trí" />
          </Form.Item>

          <Form.Item name="department" label="Phòng ban" rules={[{ required: true, message: 'Vui lòng nhập phòng ban!' }]}>
            <Input placeholder="Nhập phòng ban" />
          </Form.Item>

          <Form.Item name="offer" label="Offer">
            <TextArea rows={3} placeholder="Nhập thông tin offer (nếu có)" />
          </Form.Item>

          <Form.Item name="salary" label="Lương" rules={[{ required: true, message: 'Vui lòng nhập lương!' }]}>
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập lương"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item name="workingHours" label="Giờ làm việc">
            <Input placeholder="Nhập giờ làm việc" defaultValue="8" />
          </Form.Item>

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
          <Form.Item name="userId" label="User ID" rules={[{ required: true, message: 'Vui lòng nhập User ID!' }]}>
            <Input placeholder="Nhập User ID" />
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

          <Form.Item name="contractType" label="Loại hợp đồng">
            <Select disabled>
              <Option value="TEACHER">Giáo viên</Option>
              <Option value="STAFF">Nhân viên</Option>
            </Select>
          </Form.Item>

          <Form.Item name="position" label="Vị trí">
            <Input placeholder="Vị trí" readOnly style={{ backgroundColor: '#f5f5f5' }} />
          </Form.Item>

          <Form.Item name="department" label="Phòng ban" rules={[{ required: true, message: 'Vui lòng nhập phòng ban!' }]}>
            <Input placeholder="Nhập phòng ban" />
          </Form.Item>

          <Form.Item name="offer" label="Offer">
            <TextArea rows={3} readOnly style={{ backgroundColor: '#f5f5f5', cursor: 'default' }} />
          </Form.Item>

          <Form.Item name="salary" label="Lương" rules={[{ required: true, message: 'Vui lòng nhập lương!' }]}>
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập lương"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item name="workingHours" label="Giờ làm việc">
            <Input placeholder="Nhập giờ làm việc" defaultValue="8" />
          </Form.Item>

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