import { Tabs, Table, Button, Modal, Form, Input, DatePicker, InputNumber, Tag, message, Popconfirm, Select, Space } from 'antd';
import { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import dayjs from 'dayjs';
import RecruitmentPlanManagement from './RecruitmentPlanManagement';
import { recruitmentService } from '../../services/recruitmentService';

const { RangePicker } = DatePicker;

const RecruitmentManagement = () => {
  const [plans, setPlans] = useState([]);
  const [positions, setPositions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [approvedApps, setApprovedApps] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [pendingInterviews, setPendingInterviews] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('plans');
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [scheduleForm] = Form.useForm();
  const [showCvModal, setShowCvModal] = useState(false);
  const [currentCvUrl, setCurrentCvUrl] = useState('');
  const [currentApplicantName, setCurrentApplicantName] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [offerForm] = Form.useForm();
  const [offers, setOffers] = useState([]);
  const [showSalaryDetailsModal, setShowSalaryDetailsModal] = useState(false);
  const [salaryDetails, setSalaryDetails] = useState(null);
  const [loadingSalaryDetails, setLoadingSalaryDetails] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (selectedPlan) {
      fetchPositions();
    }
  }, [selectedPlan]);

  useEffect(() => {
    if (selectedPlan && positions.length > 0) {
      fetchApplications();
    }
  }, [selectedPlan, positions]);

  useEffect(() => {
    if (selectedPlan && applications.length > 0) {
      fetchInterviews();
      fetchPendingInterviews();
    }
  }, [selectedPlan, applications]);

  useEffect(() => {
    if (activeTab === 'schedule') {
      fetchApprovedApps();
      fetchInterviews();
    }
    if (activeTab === 'pending') {
      fetchPendingInterviews();
    }
    if (activeTab === 'offers') {
      fetchOffers();
    }
  }, [activeTab]);

  const fetchPlans = async () => {
    try {
      const res = await axiosInstance.get('/recruitment-plans');
      setPlans(res.data);
    } catch (err) {
      message.error('Không thể tải danh sách kế hoạch!');
    }
  };

  const fetchPositions = async () => {
    if (!selectedPlan) return;
    try {
      const res = await axiosInstance.get(`/job-positions?recruitmentPlanId=${selectedPlan.id}`);
      setPositions(res.data);
    } catch (err) {
      message.error('Không thể tải danh sách vị trí!');
    }
  };

  const fetchApplications = async () => {
    if (!selectedPlan) return;
    try {
      const res = await axiosInstance.get('/recruitment-applications');
      // Lọc theo job positions thuộc recruitment plan
      const filtered = res.data.filter(app => 
        positions.some(pos => pos.id === app.jobPositionId)
      );
      setApplications(filtered);
    } catch (err) {
      message.error('Không thể tải danh sách đơn ứng tuyển!');
    }
  };

  const fetchApprovedApps = async () => {
    try {
      const res = await axiosInstance.get('/recruitment-applications/approved');
      // Ngoại lệ: Tại tab "Lên lịch", fetch tất cả đơn ứng tuyển đã duyệt từ tất cả kế hoạch
      setApprovedApps(res.data);
    } catch (err) {
      message.error('Không thể tải danh sách ứng viên đã duyệt!');
    }
  };

  const fetchInterviews = async () => {
    try {
      const res = await axiosInstance.get('/interview-schedules');
      // Ngoại lệ: Tại tab "Lên lịch", fetch tất cả lịch phỏng vấn
      setInterviews(res.data);
    } catch (err) {
      message.error('Không thể tải danh sách lịch phỏng vấn!');
    }
  };

  const fetchPendingInterviews = async () => {
    try {
      const res = await axiosInstance.get('/interview-schedules/pending');
      console.log('All pending interviews from API:', res.data);
      
      // Ngoại lệ: Tại tab "Phỏng vấn chờ", fetch tất cả lịch phỏng vấn
      setPendingInterviews(res.data);
    } catch (err) {
      console.error('Error fetching pending interviews:', err);
      message.error('Không thể tải danh sách phỏng vấn chờ!');
    }
  };

  const fetchOffers = async () => {
    try {
      const res = await axiosInstance.get('/interview-schedules/accepted');
      console.log('All offers from API:', res.data);
      setOffers(res.data);
    } catch (err) {
      console.error('Error fetching offers:', err);
      message.error('Không thể tải danh sách offer!');
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setActiveTab('positions');
  };

  // Hàm xử lý khi thay đổi tab
  const handleTabChange = (key) => {
    if (key === 'plans') {
      // Nếu đang ở tab plans và ấn lại vào plans, refresh trang
      if (activeTab === 'plans') {
        window.location.href = '/manager/recruitment';
        return;
      }
      // Reset selectedPlan khi chuyển về tab plans
      setSelectedPlan(null);
    }
    
    // Cho phép truy cập trực tiếp vào "Lên lịch", "Phỏng vấn chờ" và "Quản Lý Offer" vì đã hiện tất cả
    if (selectedPlan || key === 'plans' || key === 'schedule' || key === 'pending' || key === 'offers') {
      setActiveTab(key);
    } else {
      message.warning('Vui lòng chọn một kế hoạch tuyển dụng trước!');
    }
  };

  const openAddPosition = () => {
    setEditingPosition(null);
    setShowPositionModal(true);
  };

  const openEditPosition = (record) => {
    setEditingPosition(record);
    setShowPositionModal(true);
  };

  const handlePlanChange = (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setEditingPosition({ ...editingPosition, recruitmentPlanId: planId });
    }
  };

  const handlePositionSubmit = async (values) => {
    try {
      if (editingPosition) {
        await axiosInstance.put(`/job-positions/${editingPosition.id}`, values);
        message.success('Cập nhật vị trí thành công!');
      } else {
        await axiosInstance.post('/job-positions', { ...values, recruitmentPlanId: selectedPlan.id });
        message.success('Tạo vị trí thành công!');
      }
      setShowPositionModal(false);
      fetchPositions();
    } catch (err) {
      // Xử lý lỗi validation từ backend
      if (err.response && err.response.status === 400) {
        message.error(err.response.data || 'Dữ liệu không hợp lệ!');
      } else {
        message.error('Có lỗi xảy ra!');
      }
    }
  };

  const handleDeletePosition = async (id) => {
    try {
      await axiosInstance.delete(`/job-positions/${id}`);
      message.success('Xóa vị trí thành công!');
      fetchPositions();
    } catch (err) {
      message.error('Không thể xóa vị trí!');
    }
  };

  const handleApplicationStatusChange = async (id, status) => {
    try {
      if (status === 'APPROVED') {
        await axiosInstance.post(`/recruitment-applications/${id}/approve`);
      } else if (status === 'REJECTED') {
        await axiosInstance.post(`/recruitment-applications/${id}/reject`);
      }
      message.success('Cập nhật trạng thái thành công!');
      fetchApplications();
      fetchApprovedApps();
    } catch (err) {
      message.error('Không thể cập nhật trạng thái!');
    }
  };

  const handleDeleteApplication = async (id) => {
    try {
      await axiosInstance.delete(`/recruitment-applications/${id}`);
      message.success('Xóa đơn ứng tuyển thành công!');
      fetchApplications();
    } catch (err) {
      message.error('Không thể xóa đơn ứng tuyển!');
    }
  };

  const openScheduleModal = (application) => {
    setSelectedApplication(application);
    scheduleForm.resetFields();
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (values) => {
    try {
      const [startTime, endTime] = values.interviewTime;
      console.log('Scheduling interview for application:', selectedApplication.id);
      console.log('Start time:', startTime.format('YYYY-MM-DDTHH:mm:ss'));
      console.log('End time:', endTime.format('YYYY-MM-DDTHH:mm:ss'));
      
      // Kiểm tra không cho phép xếp lịch trong quá khứ
      const now = dayjs();
      if (startTime.isBefore(now)) {
        message.error('Không thể xếp lịch phỏng vấn trong quá khứ!');
        return;
      }
      
      const startTimeStr = startTime.format('YYYY-MM-DDTHH:mm:ss');
      const endTimeStr = endTime.format('YYYY-MM-DDTHH:mm:ss');

      // Tìm lịch phỏng vấn hiện tại của ứng viên (nếu có)
      const currentInterview = interviews.find(i => i.applicationId === selectedApplication.id);

      // Kiểm tra trùng lịch với các ứng viên khác
      const otherInterviews = interviews.filter(i => i.applicationId !== selectedApplication.id);
      const hasConflict = otherInterviews.some(interview => {
        const interviewStart = dayjs(interview.startTime);
        const interviewEnd = dayjs(interview.endTime);
        return (
          (startTime.isSame(interviewStart) || startTime.isBetween(interviewStart, interviewEnd)) ||
          (endTime.isSame(interviewEnd) || endTime.isBetween(interviewStart, interviewEnd)) ||
          (startTime.isBefore(interviewStart) && endTime.isAfter(interviewEnd))
        );
      });

      if (hasConflict) {
        message.error('Thời gian này đã có lịch phỏng vấn của ứng viên khác!');
        return;
      }

      let response;
      if (currentInterview) {
        // Cập nhật lịch hiện tại
        response = await axiosInstance.put(`/interview-schedules/${currentInterview.id}`, null, {
          params: {
            startTime: startTimeStr,
            endTime: endTimeStr
          }
        });
      } else {
        // Tạo lịch mới
        response = await axiosInstance.post('/interview-schedules', null, {
          params: {
            applicationId: selectedApplication.id,
            startTime: startTimeStr,
            endTime: endTimeStr
          }
        });
      }
      console.log('Interview updated/created:', response.data);

      message.success(currentInterview ? 'Cập nhật lịch phỏng vấn thành công!' : 'Lên lịch phỏng vấn thành công!');
      setShowScheduleModal(false);
      
      // Refresh tất cả dữ liệu
      console.log('Refreshing data...');
      await fetchApprovedApps();
      await fetchInterviews();
      await fetchPendingInterviews();
      console.log('Data refresh complete');
    } catch (err) {
      console.error('Error scheduling interview:', err);
      message.error('Không thể lên lịch phỏng vấn!');
    }
  };

  const handleInterviewStatusChange = async (id, status, result) => {
    try {
      await axiosInstance.put(`/interview-schedules/${id}/result`, { status, result });
      message.success('Cập nhật kết quả phỏng vấn thành công!');
      fetchPendingInterviews();
      // Nếu status là ACCEPTED thì refresh danh sách offer
      if (status === 'ACCEPTED') {
        fetchOffers();
      }
    } catch (err) {
      message.error('Không thể cập nhật kết quả phỏng vấn!');
    }
  };

  const handleOfferUpdate = async (id, offer) => {
    try {
      // Đảm bảo giá trị tối thiểu là 1 triệu
      let validOffer = offer;
      if (offer && offer < 1000000) {
        validOffer = 1000000;
      }
      await axiosInstance.put(`/interview-schedules/${id}/offer`, { offer: validOffer });
      message.success('Cập nhật offer thành công!');
      fetchOffers(); // Refresh để hiển thị giá trị đã được chuẩn hóa
    } catch (err) {
      message.error('Không thể cập nhật offer!');
    }
  };

  const handleEvaluationUpdate = async (id, evaluation) => {
    try {
      await axiosInstance.put(`/interview-schedules/${id}/evaluation`, { evaluation });
      message.success('Cập nhật đánh giá thành công!');
    } catch (err) {
      message.error('Không thể cập nhật đánh giá!');
    }
  };

  const handleDeleteInterview = async (id) => {
    try {
      await axiosInstance.delete(`/interview-schedules/${id}`);
      message.success('Xóa lịch phỏng vấn thành công!');
      fetchInterviews();
      fetchPendingInterviews();
    } catch (err) {
      message.error('Không thể xóa lịch phỏng vấn!');
    }
  };

  const handleViewCV = (cvUrl, applicantName) => {
    if (!cvUrl) {
      message.warning(`Ứng viên ${applicantName} chưa có CV`);
      return;
    }
    
    setCurrentCvUrl(cvUrl);
    setCurrentApplicantName(applicantName);
    setShowCvModal(true);
  };

  const handleResendOffer = async (interviewId, offer) => {
    if (!offer || offer.trim() === '') {
      message.warning('Vui lòng nhập offer trước khi gửi lại!');
      return;
    }
    try {
      // Lấy chi tiết tính lương trước khi gửi email
      const salaryDetails = await axiosInstance.get(`/interview-schedules/${interviewId}/salary-calculation`);
      
      await axiosInstance.post(`/interview-schedules/${interviewId}/resend-offer`, {
        offer: offer,
        salaryDetails: salaryDetails.data
      });
      message.success('Đã gửi offer email với chi tiết lương thành công!');
    } catch (err) {
      console.error('Error resending offer:', err);
      message.error('Không thể gửi offer email!');
    }
  };

  const openOfferModal = (record) => {
    setEditingInterview(record);
    offerForm.setFieldsValue({
      offer: record.offer || ''
    });
    setShowOfferModal(true);
  };

  const handleOfferModalSubmit = async (values) => {
    try {
      await axiosInstance.put(`/interview-schedules/${editingInterview.id}/offer`, {
        offer: values.offer
      });
      message.success('Cập nhật offer thành công!');
      setShowOfferModal(false);
      fetchOffers(); // Refresh data
    } catch (err) {
      console.error('Error updating offer:', err);
      message.error('Không thể cập nhật offer!');
    }
  };

  const handleApproveCandidate = async (id) => {
    try {
      // Kiểm tra tài khoản và hợp đồng
      const response = await axiosInstance.get(`/interview-schedules/${id}/check-account`);
      const { hasAccount, hasContract } = response.data;

      if (!hasAccount) {
        message.warning('Ứng viên chưa có tài khoản trong hệ thống. Hệ thống sẽ tự động tạo tài khoản.');
      }

      // Duyệt ứng viên
      await axiosInstance.put(`/interview-schedules/${id}/result`, { 
        status: 'APPROVED', 
        result: 'Đã duyệt ứng viên',
        createAccount: !hasAccount
      });

      if (!hasContract) {
        message.warning('Vui lòng tạo hợp đồng cho ứng viên để kích hoạt tài khoản đăng nhập bằng Google.');
      }

      message.success('Đã duyệt ứng viên thành công!');
      fetchOffers();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        message.error(err.response.data.message);
      } else {
        message.error('Không thể duyệt ứng viên!');
      }
    }
  };

  const handleShowSalaryDetails = async (interviewId, grossSalary) => {
    setLoadingSalaryDetails(true);
    try {
      const response = await axiosInstance.get(`/interview-schedules/${interviewId}/salary-calculation`);
      setSalaryDetails(response.data);
      setShowSalaryDetailsModal(true);
    } catch (err) {
      message.error('Không thể tải chi tiết tính lương!');
    } finally {
      setLoadingSalaryDetails(false);
    }
  };

  const openPlans = plans.filter(p => p.status === 'OPEN');

  const positionColumns = [
    { title: 'Vị trí', dataIndex: 'title', render: (text) => <span className="vietnamese-text">{text}</span> },
    { title: 'Mô tả', dataIndex: 'description', render: (text) => <span className="vietnamese-text">{text}</span> },
    { title: 'Mức lương', dataIndex: 'salaryRange', render: (text) => <span className="vietnamese-text">{text}</span> },
    { title: 'Số lượng', dataIndex: 'quantity', render: (text) => <span className="vietnamese-text">{text}</span> },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <div className="space-x-2">
          <Button size="small" onClick={() => openEditPosition(record)} className="vietnamese-text">Sửa</Button>
          <Popconfirm title="Xóa vị trí này?" onConfirm={() => handleDeletePosition(record.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger className="vietnamese-text">Xóa</Button>
          </Popconfirm>
        </div>
      )
    }
  ];

  const applicationColumns = [
    { title: 'Họ tên', dataIndex: 'fullName', render: (text) => <span className="vietnamese-text">{text}</span> },
    { title: 'Email', dataIndex: 'email', render: (text) => <span className="vietnamese-text">{text}</span> },
    { title: 'Số điện thoại', dataIndex: 'phoneNumber', render: (text) => <span className="vietnamese-text">{text}</span> },
    { title: 'Vị trí', dataIndex: 'jobTitle', render: (text) => <span className="vietnamese-text">{text}</span> },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 'APPROVED' ? 'green' : status === 'REJECTED' ? 'red' : 'orange'} className="vietnamese-text">
          {status === 'APPROVED' ? 'Đã duyệt' : status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <div className="space-x-2">
          {record.cvUrl && (
            <Button 
              type="link" 
              size="small" 
              onClick={() => handleViewCV(record.cvUrl, record.fullName)}
              className="vietnamese-text"
              style={{ padding: 0, height: 'auto' }}
            >
              📄 Xem CV
            </Button>
          )}
          {record.status === 'PENDING' && (
            <>
              <Button 
                type="primary" 
                size="small" 
                onClick={() => handleApplicationStatusChange(record.id, 'APPROVED')}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                className="vietnamese-text"
              >
                ✓ Duyệt
              </Button>
              <Button 
                type="primary" 
                size="small" 
                danger
                onClick={() => handleApplicationStatusChange(record.id, 'REJECTED')}
                className="vietnamese-text"
              >
                ✗ Từ chối
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  // Gộp danh sách ứng viên đã duyệt và lịch phỏng vấn
  const scheduleColumns = [
    { title: 'Họ tên', dataIndex: 'fullName', render: (text) => <span className="vietnamese-text">{text}</span> },
    { title: 'Email', dataIndex: 'email', render: (text) => <span className="vietnamese-text">{text}</span> },
    { title: 'Vị trí', dataIndex: 'jobTitle', render: (text) => <span className="vietnamese-text">{text}</span> },
    {
      title: 'Trạng thái lịch',
      dataIndex: 'hasSchedule',
      render: (_, record) => {
        const hasSchedule = interviews.some(interview => interview.applicationId === record.id);
        return (
          <Tag color={hasSchedule ? 'green' : 'orange'} className="vietnamese-text">
            {hasSchedule ? 'Đã lên lịch' : 'Chưa lên lịch'}
          </Tag>
        );
      }
    },
    {
      title: 'Thời gian phỏng vấn',
      dataIndex: 'interviewTime',
      render: (_, record) => {
        const interview = interviews.find(i => i.applicationId === record.id);
        console.log('Interview data for record', record.id, ':', interview);
        if (interview && interview.startTime && interview.endTime) {
          try {
            console.log('Start time:', interview.startTime, 'Type:', typeof interview.startTime);
            console.log('End time:', interview.endTime, 'Type:', typeof interview.endTime);
            // Parse startTime và endTime từ ISO format
            const startTime = dayjs(interview.startTime);
            const endTime = dayjs(interview.endTime);
            console.log('Parsed startTime:', startTime.format('YYYY-MM-DD HH:mm:ss'));
            console.log('Parsed endTime:', endTime.format('YYYY-MM-DD HH:mm:ss'));
            return <span className="vietnamese-text">{`${startTime.format('DD/MM/YYYY HH:mm')} - ${endTime.format('HH:mm')}`}</span>;
          } catch (error) {
            console.error('Error formatting date:', interview.startTime, interview.endTime, error);
            return <span className="vietnamese-text">Lỗi định dạng</span>;
          }
        }
        return <span className="vietnamese-text">-</span>;
      }
    },
    {
      title: 'Thao tác',
      render: (_, record) => {
        const hasSchedule = interviews.some(interview => interview.applicationId === record.id);
        return (
          <div className="space-x-2">
            {record.cvUrl && (
              <Button 
                type="link" 
                size="small" 
                onClick={() => handleViewCV(record.cvUrl, record.fullName)}
                className="vietnamese-text"
                style={{ padding: 0, height: 'auto' }}
              >
                📄 Xem CV
              </Button>
            )}
            {!hasSchedule && (
              <Button 
                type="primary" 
                size="small" 
                onClick={() => openScheduleModal(record)}
                className="vietnamese-text"
              >
                Lên lịch
              </Button>
            )}
            {hasSchedule && (
              <Button 
                size="small" 
                onClick={() => openScheduleModal(record)}
                className="vietnamese-text"
              >
                Sửa lịch
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  const pendingInterviewColumns = [
    { title: 'Họ tên', dataIndex: 'applicantName', render: (text) => <span className="vietnamese-text">{text}</span> },
    { title: 'Vị trí', dataIndex: 'jobTitle', render: (text) => <span className="vietnamese-text">{text}</span> },
    { 
      title: 'Ngày phỏng vấn', 
      dataIndex: 'startTime', 
      render: (date, record) => {
        try {
          console.log('Pending interview startTime:', date, 'Type:', typeof date);
          console.log('Pending interview endTime:', record.endTime, 'Type:', typeof record.endTime);
          const startTime = dayjs(date);
          const endTime = dayjs(record.endTime);
          return <span className="vietnamese-text">{`${startTime.format('DD/MM/YYYY HH:mm')} - ${endTime.format('HH:mm')}`}</span>;
        } catch (error) {
          console.error('Error formatting pending interview date:', date, record.endTime, error);
          return <span className="vietnamese-text">Lỗi định dạng</span>;
        }
      }
    },
    {
      title: 'Đánh giá',
      dataIndex: 'evaluation',
      render: (text, record) => (
        <Input.TextArea
          defaultValue={text || ''}
          placeholder="Nhập đánh giá..."
          className="vietnamese-text"
          onBlur={(e) => handleEvaluationUpdate(record.id, e.target.value)}
          style={{ minHeight: '60px' }}
        />
      )
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <div className="space-x-2">
          {record.cvUrl && (
            <Button 
              type="link" 
              size="small" 
              onClick={() => handleViewCV(record.cvUrl, record.applicantName)}
              className="vietnamese-text"
              style={{ padding: 0, height: 'auto' }}
            >
              📄 Xem CV
            </Button>
          )}
          <Button 
            type="primary" 
            size="small" 
            onClick={() => handleInterviewStatusChange(record.id, 'ACCEPTED')}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            className="vietnamese-text"
          >
            ✓ Đỗ
          </Button>
          <Button 
            type="primary" 
            size="small" 
            danger
            onClick={() => handleInterviewStatusChange(record.id, 'REJECTED')}
            className="vietnamese-text"
          >
            ✗ Trượt
          </Button>
        </div>
      )
    }
  ];

  const offerColumns = [
    { title: 'Họ tên', dataIndex: 'applicantName', render: (text) => <span className="vietnamese-text">{text}</span> },
    { title: 'Vị trí', dataIndex: 'jobTitle', render: (text) => <span className="vietnamese-text">{text}</span> },
    { 
      title: 'Ngày phỏng vấn', 
      dataIndex: 'startTime', 
      render: (date, record) => {
        try {
          const startTime = dayjs(date);
          const endTime = dayjs(record.endTime);
          return <span className="vietnamese-text">{`${startTime.format('DD/MM/YYYY HH:mm')} - ${endTime.format('HH:mm')}`}</span>;
        } catch (error) {
          return <span className="vietnamese-text">Lỗi định dạng</span>;
        }
      }
    },
    {
      title: 'Đánh giá',
      dataIndex: 'evaluation',
      render: (text, record) => (
        <Input.TextArea
          defaultValue={text || ''}
          placeholder="Nhập đánh giá..."
          className="vietnamese-text"
          onBlur={(e) => handleEvaluationUpdate(record.id, e.target.value)}
          style={{ minHeight: '60px' }}
        />
      )
    },
    {
      title: 'Lương GROSS',
      dataIndex: 'offer',
      render: (text, record) => (
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 'bold', marginRight: '8px' }}>Lương GROSS:</div>
            <InputNumber
              value={text}
              onChange={(value) => {
                if (value && value < 1000000) {
                  value = 1000000;
                }
                handleOfferUpdate(record.id, value);
              }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              step={1000000}
              min={1000000}
              style={{ width: '150px' }}
              placeholder="Nhập lương GROSS"
            />
            <Button 
              size="small" 
              onClick={() => {
                const currentValue = parseInt(text) || 1000000;
                handleOfferUpdate(record.id, currentValue + 1000000);
              }}
            >
              +1 triệu
            </Button>
            <Button 
              size="small"
              onClick={() => {
                const currentValue = parseInt(text) || 1000000;
                if (currentValue > 1000000) {
                  handleOfferUpdate(record.id, currentValue - 1000000);
                }
              }}
            >
              -1 triệu
            </Button>
            {text && (
              <Button 
                size="small" 
                type="primary"
                onClick={() => handleShowSalaryDetails(record.id, text)}
                style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
              >
                Chi Tiết
              </Button>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Lương NET',
      dataIndex: 'offer',
      render: (text, record) => {
        if (!text) return <span style={{ color: '#999' }}>Chưa có offer</span>;
        
        // Tính toán lương NET từ GROSS (ước tính đơn giản)
        const grossSalary = parseInt(text);
        const employeeContribution = Math.round(grossSalary * 0.105); // 10.5%
        const estimatedTax = Math.round(grossSalary * 0.1); // Ước tính thuế 10%
        const netSalary = grossSalary - employeeContribution - estimatedTax;
        
        return (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ fontWeight: 'bold', marginRight: '8px' }}>Lương NET:</div>
            <div style={{ 
              padding: '4px 12px', 
              border: '1px solid #d9d9d9', 
              borderRadius: '6px', 
              backgroundColor: '#f0f8ff',
              color: '#1890ff',
              fontWeight: 'bold',
              minWidth: '150px',
              textAlign: 'center'
            }}>
              {netSalary.toLocaleString('vi-VN')} VNĐ
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              (Ước tính)
            </div>
          </div>
        );
      }
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <div className="space-x-2">
          {record.cvUrl && (
            <Button 
              type="link" 
              size="small" 
              onClick={() => handleViewCV(record.cvUrl, record.applicantName)}
              className="vietnamese-text"
              style={{ padding: 0, height: 'auto' }}
            >
              📄 Xem CV
            </Button>
          )}
          <Button 
            size="small" 
            type="primary"
            onClick={() => handleResendOffer(record.id, record.offer)}
            className="vietnamese-text"
            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
          >
            Offer Lại
          </Button>
          <Button 
            type="primary" 
            size="small" 
            onClick={() => handleApproveCandidate(record.id)}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            className="vietnamese-text"
          >
            Duyệt ứng viên
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 vietnamese-heading">Quản Lý Tuyển Dụng</h2>
      
      {selectedPlan && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="text-lg font-semibold text-blue-800 vietnamese-heading">Kế hoạch đang quản lý: {selectedPlan.title}</h3>
          <p className="text-blue-600 vietnamese-body">
            Thời gian: {dayjs(selectedPlan.startDate).format('DD/MM/YYYY')} - {dayjs(selectedPlan.endDate).format('DD/MM/YYYY')} | 
            Số lượng: {selectedPlan.totalQuantity} | 
            Trạng thái: <Tag color={selectedPlan.status === 'OPEN' ? 'green' : 'red'}>
              {selectedPlan.status === 'OPEN' ? 'Đang mở' : 'Đã đóng'}
            </Tag>
          </p>
          <Button 
            type="link" 
            onClick={() => {
              setSelectedPlan(null);
              setActiveTab('plans');
            }}
            className="p-0 text-blue-600 vietnamese-text"
          >
            ← Chọn kế hoạch khác
          </Button>
        </div>
      )}

      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <Tabs.TabPane tab="Kế hoạch tuyển dụng" key="plans">
          <RecruitmentPlanManagement onPlanSelect={handlePlanSelect} />
        </Tabs.TabPane>
        
        <Tabs.TabPane tab="Vị trí tuyển dụng" key="positions" disabled={!selectedPlan}>
          <div className="mb-4">
            <Button type="primary" onClick={openAddPosition} className="vietnamese-text">Thêm vị trí</Button>
          </div>
          <Table columns={positionColumns} dataSource={positions} rowKey="id" />
        </Tabs.TabPane>
        
        <Tabs.TabPane tab="Đơn ứng tuyển" key="applications" disabled={!selectedPlan}>
          <Table columns={applicationColumns} dataSource={applications} rowKey="id" />
        </Tabs.TabPane>
        
        <Tabs.TabPane tab="Lên lịch" key="schedule">
          <Table columns={scheduleColumns} dataSource={approvedApps} rowKey="id" />
        </Tabs.TabPane>
        
        <Tabs.TabPane tab="Phỏng vấn chờ" key="pending">
          <Table columns={pendingInterviewColumns} dataSource={pendingInterviews} rowKey="id" />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Quản Lý Offer" key="offers">
          <Table columns={offerColumns} dataSource={offers} rowKey="id" />
        </Tabs.TabPane>
      </Tabs>

      {/* Modal tạo/sửa vị trí */}
      <Modal
        title={editingPosition ? 'Sửa vị trí' : 'Thêm vị trí'}
        open={showPositionModal}
        onCancel={() => setShowPositionModal(false)}
        footer={null}
        className="form-vietnamese"
      >
        <Form layout="vertical" onFinish={handlePositionSubmit} className="form-vietnamese">
          <Form.Item name="title" label="Tên vị trí" rules={[{ required: true }]}>
            <Input className="vietnamese-text" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true }]}>
            <Input.TextArea className="vietnamese-text" />
          </Form.Item>
          <Form.Item name="salaryRange" label="Mức lương" rules={[{ required: true }]}>
            <Input className="vietnamese-text" />
          </Form.Item>
          <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}>
            <InputNumber 
              min={1} 
              max={999}
              step={1}
              precision={0}
              style={{ width: '100%' }} 
              className="vietnamese-text"
              placeholder="Nhập số lượng"
              controls={{
                upIcon: <span>+</span>,
                downIcon: <span>-</span>
              }}
            />
          </Form.Item>
          <Form.Item>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setShowPositionModal(false)} className="vietnamese-text">Hủy</Button>
              <Button type="primary" htmlType="submit" className="vietnamese-text">
                {editingPosition ? 'Cập nhật' : 'Tạo'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal lên lịch phỏng vấn */}
      <Modal
        title="Lên lịch phỏng vấn"
        open={showScheduleModal}
        onCancel={() => setShowScheduleModal(false)}
        footer={null}
        className="form-vietnamese"
      >
        <Form layout="vertical" form={scheduleForm} onFinish={handleScheduleSubmit} className="form-vietnamese">
          <Form.Item 
            name="interviewTime" 
            label="Thời gian phỏng vấn" 
            rules={[{ required: true, message: 'Vui lòng chọn thời gian phỏng vấn!' }]}
          >
            <RangePicker 
              showTime 
              format="YYYY-MM-DD HH:mm"
              placeholder={['Bắt đầu', 'Kết thúc']}
              className="vietnamese-text"
            />
          </Form.Item>
          <Form.Item>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setShowScheduleModal(false)} className="vietnamese-text">Hủy</Button>
              <Button type="primary" htmlType="submit" className="vietnamese-text">
                Lên lịch
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem CV */}
      <Modal
        title={`CV của ${currentApplicantName}`}
        open={showCvModal}
        onCancel={() => setShowCvModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowCvModal(false)}>
            Đóng
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            onClick={() => window.open(currentCvUrl, '_blank')}
          >
            Tải xuống
          </Button>
        ]}
        width={800}
        className="cv-modal"
      >
        <div style={{ height: '600px', overflow: 'auto' }}>
          {currentCvUrl && (
            <iframe
              src={currentCvUrl}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title={`CV của ${currentApplicantName}`}
            />
          )}
        </div>
      </Modal>

      {/* Modal chỉnh sửa Offer */}
      <Modal
        title="Chỉnh sửa Offer"
        open={showOfferModal}
        onCancel={() => setShowOfferModal(false)}
        footer={null}
        className="form-vietnamese"
      >
        <Form layout="vertical" form={offerForm} onFinish={handleOfferModalSubmit} className="form-vietnamese">
          <Form.Item 
            name="offer" 
            label="Offer"
            rules={[{ required: false }]} // Cho phép null
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <InputNumber
                style={{ width: '200px' }}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                step={1000000}
                min={1000000}
                placeholder="Nhập offer..."
                className="vietnamese-text"
                onChange={(value) => {
                  if (value && value < 1000000) {
                    offerForm.setFieldsValue({ offer: 1000000 });
                  }
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Button 
                  size="small"
                  onClick={() => {
                    const currentValue = parseInt(offerForm.getFieldValue('offer')) || 1000000;
                    offerForm.setFieldsValue({ offer: currentValue + 1000000 });
                  }}
                >
                  +1 triệu
                </Button>
                <Button 
                  size="small"
                  onClick={() => {
                    const currentValue = parseInt(offerForm.getFieldValue('offer')) || 1000000;
                    if (currentValue > 1000000) {
                      offerForm.setFieldsValue({ offer: currentValue - 1000000 });
                    }
                  }}
                >
                  -1 triệu
                </Button>
              </div>
            </div>
          </Form.Item>
          <Form.Item>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setShowOfferModal(false)} className="vietnamese-text">Hủy</Button>
              <Button type="primary" htmlType="submit" className="vietnamese-text">
                Cập nhật
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Chi Tiết Tính Lương */}
      <Modal
        title="Chi Tiết Tính Lương Offer"
        open={showSalaryDetailsModal}
        onCancel={() => setShowSalaryDetailsModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowSalaryDetailsModal(false)}>
            Đóng
          </Button>
        ]}
        width={800}
        className="salary-details-modal"
      >
        {loadingSalaryDetails ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div>Đang tải chi tiết tính lương...</div>
          </div>
        ) : salaryDetails ? (
          <div>
            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#52c41a' }}>Tóm Tắt</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <strong>Lương GROSS:</strong> {salaryDetails.grossSalary?.toLocaleString('vi-VN')} VNĐ
                </div>
                <div>
                  <strong>Lương NET:</strong> {salaryDetails.netSalary?.toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#1890ff' }}>Chi Tiết Bảo Hiểm</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <strong>Đóng góp nhân viên (10.5%):</strong> {salaryDetails.employeeContribution?.toLocaleString('vi-VN')} VNĐ
                </div>
                <div>
                  <strong>Đóng góp công ty (21.5%):</strong> {salaryDetails.employerContribution?.toLocaleString('vi-VN')} VNĐ
                </div>
                <div>
                  <strong>Tổng bảo hiểm (32%):</strong> {salaryDetails.totalInsuranceContribution?.toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#722ed1' }}>Chi Tiết Thuế Thu Nhập Cá Nhân (VNĐ)</h3>
              <div style={{ marginBottom: '12px' }}>
                <strong>Thu nhập chịu thuế:</strong> {salaryDetails.taxableIncome?.toLocaleString('vi-VN')} VNĐ
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Giảm trừ người phụ thuộc:</strong> {salaryDetails.dependentDeductions?.toLocaleString('vi-VN')} VNĐ
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Tổng thuế TNCN:</strong> {salaryDetails.personalIncomeTax?.toLocaleString('vi-VN')} VNĐ
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#fa8c16' }}>Cách Tính Lương NET</h3>
              <div style={{ backgroundColor: '#fff7e6', padding: '12px', borderRadius: '6px', border: '1px solid #ffd591' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Lương NET = Lương GROSS - Đóng góp nhân viên - Thuế TNCN</strong>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                  {salaryDetails.grossSalary?.toLocaleString('vi-VN')} - {salaryDetails.employeeContribution?.toLocaleString('vi-VN')} - {salaryDetails.personalIncomeTax?.toLocaleString('vi-VN')} = {salaryDetails.netSalary?.toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#f0f0f0', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>
                <strong>Lưu ý:</strong> Tính toán dựa trên chuẩn pháp luật Việt Nam. 
                Tỷ lệ đóng góp và thuế có thể thay đổi theo quy định mới.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            Không có dữ liệu chi tiết tính lương
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RecruitmentManagement; 