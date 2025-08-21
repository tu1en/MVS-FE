import { Button, DatePicker, Form, Input, InputNumber, message, Modal, Popconfirm, Select, Table, Tabs, Tag } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import RecruitmentPlanManagement from './RecruitmentPlanManagement';

// Component cho cột Lương GROSS với input
const GrossSalaryColumn = ({ offer, recordId, onOfferUpdate, onShowSalaryDetails }) => {
  const [grossSalary, setGrossSalary] = useState(offer);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setGrossSalary(offer);
  }, [offer]);

  const handleGrossChange = async (value) => {
    if (value && value < 1000000) {
      value = 1000000;
    }
    setGrossSalary(value);
    await onOfferUpdate(recordId, value);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <InputNumber
          value={grossSalary}
          onChange={handleGrossChange}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          step={1000000}
          min={1000000}
          style={{ width: '150px' }}
          placeholder="Nhập lương GROSS"
        />
        {grossSalary && (
          <Button 
            size="small" 
            type="primary"
            onClick={() => onShowSalaryDetails(recordId, grossSalary)}
            style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
          >
            Chi Tiết
          </Button>
        )}
      </div>
    </div>
  );
};

/*
// Component cho cột Lương GROSS với input
const GrossSalaryColumnOld = ({ offer, recordId, onOfferUpdate, onShowSalaryDetails }) => {
  const [grossSalary, setGrossSalary] = useState(offer);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setGrossSalary(offer);
  }, [offer]);

  const handleGrossChange = async (value) => {
    if (value && value < 1000000) {
      value = 1000000;
    }
    setGrossSalary(value);
    await onOfferUpdate(recordId, value);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <InputNumber
          value={grossSalary}
          onChange={handleGrossChange}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          step={1000000}
          min={1000000}
          style={{ width: '150px' }}
          placeholder="Nhập lương GROSS"
        />
        {grossSalary && (
          <Button 
            size="small" 
            type="primary"
            onClick={() => onShowSalaryDetails(recordId, grossSalary)}
            style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
          >
            Chi Tiết
          </Button>
        )}
      </div>
    </div>
  );
};

// Component cho cột Lương theo giờ (Part-time) 
const HourlyRateColumnOld = ({ hourlyRate, recordId, onHourlyRateUpdate }) => {
  const [inputHourlyRate, setInputHourlyRate] = useState(hourlyRate);

  useEffect(() => {
    setInputHourlyRate(hourlyRate);
  }, [hourlyRate]);

  const handleHourlyRateChange = async (value) => {
    if (value && value < 100000) {
      value = 100000;
    }
    setInputHourlyRate(value);
    await onHourlyRateUpdate(recordId, value);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <InputNumber
          value={inputHourlyRate}
          onChange={handleHourlyRateChange}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          step={100000}
          min={100000}
          style={{ width: '150px' }}
          placeholder="Nhập lương/giờ"
        />
        <Button 
          size="small" 
          onClick={() => {
            const currentValue = parseInt(inputHourlyRate) || 100000;
            handleHourlyRateChange(currentValue + 100000);
          }}
        >
          +100k
        </Button>
        <Button 
          size="small"
          onClick={() => {
            const currentValue = parseInt(inputHourlyRate) || 100000;
            if (currentValue > 100000) {
              handleHourlyRateChange(currentValue - 100000);
            }
          }}
        >
          -100k
        </Button>
      </div>
      {inputHourlyRate && (
        <div className="text-xs text-gray-500 vietnamese-text mt-1">
          (Lương theo giờ: {inputHourlyRate.toLocaleString('vi-VN')} VNĐ/giờ)
        </div>
      )}
    </div>
  );
};

// Component cho cột Lương NET với input 
const NetSalaryColumnOld = ({ offer, recordId, contractType, numberOfDependents, onOfferUpdate }) => {
  const [netSalary, setNetSalary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputNetSalary, setInputNetSalary] = useState(null);

  useEffect(() => {
    const calculateNetSalary = async () => {
      if (!offer) {
        // Nếu chưa có offer, cho phép nhập NET trước
        setInputNetSalary(null);
        setNetSalary(null);
        return;
      }
      
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/interview-schedules/${recordId}/salary-calculation`, {
          params: { numberOfDependents: contractType === 'FULL_TIME' ? numberOfDependents ?? 0 : 0 }
        });
        const calculatedNet = response.data.netSalary;
        setNetSalary(calculatedNet);
        setInputNetSalary(calculatedNet);
      } catch (err) {
        console.error('Error calculating net salary:', err);
        // Fallback to estimation if API fails
        const grossSalary = parseInt(offer);
        const estimatedNet = grossSalary * 0.8;
        setNetSalary(estimatedNet);
        setInputNetSalary(estimatedNet);
      } finally {
        setLoading(false);
      }
    };
    
    calculateNetSalary();
  }, [offer, recordId, contractType, numberOfDependents]);

  const handleNetChange = async (value) => {
    if (!value) return;
    
    setInputNetSalary(value);
    setLoading(true);
    
    try {
      // Calculate GROSS from NET using backend
      const response = await axiosInstance.post(`/interview-schedules/${recordId}/calculate-gross-from-net`, {
        netSalary: value,
        numberOfDependents: contractType === 'FULL_TIME' ? (numberOfDependents ?? 0) : 0
      });
      const calculatedGross = response.data.grossSalary;
      await onOfferUpdate(recordId, calculatedGross);
    } catch (err) {
      console.error('Error calculating gross from net:', err);
      // Fallback: estimate gross as net * 1.25
      const estimatedGross = Math.round(value * 1.25);
      await onOfferUpdate(recordId, estimatedGross);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <span className="vietnamese-text text-gray-400">Đang tính...</span>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <InputNumber
          value={inputNetSalary}
          onChange={handleNetChange}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          step={1000000}
          min={1000000}
          style={{ width: '150px' }}
          placeholder="Nhập lương NET"
        />
      </div>
      {!offer && inputNetSalary && (
        <div className="text-xs text-blue-500 vietnamese-text mt-1">
          (Nhập NET trước - GROSS sẽ được tính tự động)
        </div>
      )}
    </div>
  );
};
*/

// Component cho cột Lương theo giờ (Part-time)
const HourlyRateColumn = ({ hourlyRate, recordId, onHourlyRateUpdate }) => {
  const [inputHourlyRate, setInputHourlyRate] = useState(hourlyRate);

  useEffect(() => {
    setInputHourlyRate(hourlyRate);
  }, [hourlyRate]);

  const handleHourlyRateChange = async (value) => {
    if (value && value < 100000) {
      value = 100000;
    }
    setInputHourlyRate(value);
    await onHourlyRateUpdate(recordId, value);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <InputNumber
          value={inputHourlyRate}
          onChange={handleHourlyRateChange}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          step={100000}
          min={100000}
          style={{ width: '150px' }}
          placeholder="Nhập lương/giờ"
        />
        <Button 
          size="small" 
          onClick={() => {
            const currentValue = parseInt(inputHourlyRate) || 100000;
            handleHourlyRateChange(currentValue + 100000);
          }}
        >
          +100k
        </Button>
        <Button 
          size="small"
          onClick={() => {
            const currentValue = parseInt(inputHourlyRate) || 100000;
            if (currentValue > 100000) {
              handleHourlyRateChange(currentValue - 100000);
            }
          }}
        >
          -100k
        </Button>
      </div>
      {inputHourlyRate && (
        <div className="text-xs text-gray-500 vietnamese-text mt-1">
          (Lương theo giờ: {inputHourlyRate.toLocaleString('vi-VN')} VNĐ/giờ)
        </div>
      )}
    </div>
  );
};

// Component cho cột Lương NET với input
const NetSalaryColumn = ({ offer, recordId, contractType, numberOfDependents, onOfferUpdate }) => {
  const [netSalary, setNetSalary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputNetSalary, setInputNetSalary] = useState(null);

  useEffect(() => {
    const calculateNetSalary = async () => {
      if (!offer) {
        // Nếu chưa có offer, cho phép nhập NET trước
        setInputNetSalary(null);
        setNetSalary(null);
        return;
      }
      
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/interview-schedules/${recordId}/salary-calculation`, {
          params: { numberOfDependents: contractType === 'FULL_TIME' ? numberOfDependents ?? 0 : 0 }
        });
        const calculatedNet = response.data.netSalary;
        setNetSalary(calculatedNet);
        setInputNetSalary(calculatedNet);
      } catch (err) {
        console.error('Error calculating net salary:', err);
        // Fallback to estimation if API fails
        const grossSalary = parseInt(offer);
        const estimatedNet = grossSalary * 0.8;
        setNetSalary(estimatedNet);
        setInputNetSalary(estimatedNet);
      } finally {
        setLoading(false);
      }
    };
    
    calculateNetSalary();
  }, [offer, recordId, contractType, numberOfDependents]);

  const handleNetChange = async (value) => {
    if (!value) return;
    
    setInputNetSalary(value);
    setLoading(true);
    
    try {
      // Calculate GROSS from NET using backend
      const response = await axiosInstance.post(`/interview-schedules/${recordId}/calculate-gross-from-net`, {
        netSalary: value,
        numberOfDependents: contractType === 'FULL_TIME' ? (numberOfDependents ?? 0) : 0
      });
      const calculatedGross = response.data.grossSalary;
      await onOfferUpdate(recordId, calculatedGross);
    } catch (err) {
      console.error('Error calculating gross from net:', err);
      // Fallback: estimate gross as net * 1.25
      const estimatedGross = Math.round(value * 1.25);
      await onOfferUpdate(recordId, estimatedGross);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <span className="vietnamese-text text-gray-400">Đang tính...</span>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <InputNumber
          value={inputNetSalary}
          onChange={handleNetChange}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          step={1000000}
          min={1000000}
          style={{ width: '150px' }}
          placeholder="Nhập lương NET"
        />
      </div>
      {!offer && inputNetSalary && (
        <div className="text-xs text-blue-500 vietnamese-text mt-1">
          (Nhập NET trước - GROSS sẽ được tính tự động)
        </div>
      )}
    </div>
  );
};

const { RangePicker } = DatePicker;

const RecruitmentManagement = () => {
  // Helper: parse cả ISO string lẫn mảng [yyyy, M, d, H, m, s]
  const parseApiDateTime = (value) => {
    try {
      if (Array.isArray(value) && value.length >= 3) {
        const [y, m, d, hh = 0, mm = 0, ss = 0] = value;
        return dayjs(new Date(y, (m || 1) - 1, d, hh, mm, ss));
      }
      return dayjs(value);
    } catch {
      return dayjs.invalid();
    }
  };

  const toTimestamp = (value) => {
    const d = parseApiDateTime(value);
    return d.isValid() ? d.valueOf() : 0;
  };
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
  const [positionForm] = Form.useForm();
  const [offers, setOffers] = useState([]);
  const [dependentsByInterview, setDependentsByInterview] = useState({});
  const [showSalaryDetailsModal, setShowSalaryDetailsModal] = useState(false);
  const [salaryDetails, setSalaryDetails] = useState(null);
  const [loadingSalaryDetails, setLoadingSalaryDetails] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [evaluationForm] = Form.useForm();
  const [evaluatingInterview, setEvaluatingInterview] = useState(null);
  const [evaluationDraft, setEvaluationDraft] = useState('');
  const evaluationSaveTimerRef = useRef(null);

  // Theo dõi thay đổi contractType trong form vị trí để cập nhật đơn vị tiền tệ linh hoạt
  const watchedContractType = Form.useWatch('contractType', positionForm);

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
      const filtered = res.data
        .filter(app => positions.some(pos => pos.id === app.jobPositionId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
                    // Lấy tất cả interview schedules để lọc ra những ứng viên đã hoàn thành phỏng vấn
                    const res = await axiosInstance.get('/interview-schedules');
                    const allInterviews = res.data;
      
      // Lọc ra những ứng viên có status COMPLETED (đã hoàn thành phỏng vấn)
      const completedInterviews = allInterviews.filter(shouldShowInOffers);
      
      setOffers(completedInterviews);
    } catch (err) {
      console.error('Error fetching offers:', err);
      message.error('Không thể tải danh sách offer!');
    }
  };

  // Hàm mới: Lọc danh sách ứng viên đã duyệt để loại bỏ những người đã được duyệt phỏng vấn
  const getFilteredApprovedApps = () => {
    // Lọc ra những ứng viên đã được duyệt phỏng vấn (có status ACCEPTED, APPROVED hoặc COMPLETED)
    const approvedInterviewEmails = pendingInterviews
      .filter(interview => interview.status === 'ACCEPTED' || interview.status === 'APPROVED' || interview.status === 'COMPLETED')
      .map(interview => interview.applicantEmail);
    
    // Loại bỏ những ứng viên đã được duyệt phỏng vấn khỏi danh sách "Lên lịch"
    // Lịch phỏng vấn với trạng thái COMPLETED không hiển thị trong "Lên lịch" vì đã hoàn thành
    // Loại bỏ những ứng viên đã bị từ chối
    return approvedApps.filter(app => {
      const isApprovedInterview = approvedInterviewEmails.includes(app.email);
      const isRejected = app.status === 'REJECTED';
      return !isApprovedInterview && !isRejected;
    });
  };

  // Hàm mới: Kiểm tra xem ứng viên có nên hiển thị trong "Lên lịch" hay không
  const shouldShowInSchedule = (applicationId) => {
    const interview = pendingInterviews.find(i => i.applicationId === applicationId);
    // Hiển thị nếu không có lịch phỏng vấn hoặc lịch phỏng vấn chưa được duyệt
    // Lịch phỏng vấn với trạng thái COMPLETED không hiển thị trong "Lên lịch" vì đã hoàn thành
    // Không hiển thị những ứng viên đã bị từ chối
    
    // Kiểm tra xem ứng viên có bị từ chối trong đơn ứng tuyển không
    const application = applications.find(app => app.id === applicationId);
    if (application && application.status === 'REJECTED') {
      return false;
    }
    
    return !interview || (interview.status !== 'ACCEPTED' && interview.status !== 'APPROVED' && interview.status !== 'COMPLETED' && interview.status !== 'REJECTED');
  };

  // Hàm mới: Kiểm tra xem ứng viên có nên hiển thị trong "Phỏng vấn chờ" hay không
  const shouldShowInPending = (interview) => {
    // Chỉ hiển thị những ứng viên chưa được duyệt và chưa bị từ chối
    
    // Kiểm tra xem ứng viên có bị từ chối trong đơn ứng tuyển không
    const application = applications.find(app => app.id === interview.applicationId);
    if (application && application.status === 'REJECTED') {
      return false;
    }
    
    return interview.status !== 'APPROVED' && interview.status !== 'REJECTED';
  };

  // Hàm mới: Kiểm tra xem ứng viên có nên hiển thị trong "Quản Lý Offer" hay không
  const shouldShowInOffers = (interview) => {
    // Chỉ hiển thị những ứng viên đã hoàn thành phỏng vấn (COMPLETED)
    // Không hiển thị APPROVED vì đó là trạng thái đã được duyệt cuối cùng
    // Không hiển thị ACCEPTED vì đó là trạng thái tạm thời
    // Không hiển thị REJECTED vì đã bị từ chối
    
    // Kiểm tra xem ứng viên có bị từ chối trong đơn ứng tuyển không
    const application = applications.find(app => app.id === interview.applicationId);
    if (application && application.status === 'REJECTED') {
      return false;
    }
    
    // Kiểm tra xem lịch phỏng vấn có bị từ chối không
    if (interview.status === 'REJECTED') {
      return false;
    }
    
    return interview.status === 'COMPLETED';
  };

  const handlePlanSelect = (plan) => {
    // Kiểm tra xem kế hoạch đã kết thúc chưa
    const now = dayjs();
    if (plan.endDate && dayjs(plan.endDate).isBefore(now, 'day')) {
      message.error('Ngày tuyển dụng của kế hoạch đã kết thúc!');
      return;
    }
    
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
    positionForm.resetFields();
    positionForm.setFieldsValue({ contractType: 'PART_TIME', title: '', description: '', salaryRange: '', quantity: 1 });
    setShowPositionModal(true);
  };

  const openEditPosition = (record) => {
    setEditingPosition(record);
    // Đổ dữ liệu vào form khi sửa
    positionForm.setFieldsValue({
      title: record.title,
      description: record.description,
      contractType: record.contractType || 'PART_TIME',
      salaryRange: (record.salaryRange ?? '').toString(),
      quantity: record.quantity || 1
    });
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
      // Cập nhật cả vị trí và kế hoạch để số lượng được cập nhật ngay lập tức
      await Promise.all([
        fetchPositions(),
        fetchPlans()
      ]);
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
      // Cập nhật cả vị trí và kế hoạch để số lượng được cập nhật ngay lập tức
      await Promise.all([
        fetchPositions(),
        fetchPlans()
      ]);
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
        
        // Cập nhật trạng thái lịch phỏng vấn thành REJECTED nếu có
        // Tìm tất cả các lịch phỏng vấn của ứng viên này, không chỉ trong pendingInterviews
        // mà cả trong interviews (để bắt cả trường hợp lịch đã COMPLETED)
        const allInterviews = [...interviews, ...pendingInterviews, ...offers];
        const interview = allInterviews.find(i => i.applicationId === id);
        
        if (interview) {
          console.log('Updating interview status to REJECTED:', interview.id);
          await axiosInstance.put(`/interview-schedules/${interview.id}/result`, { 
            status: 'REJECTED', 
            result: 'Ứng viên bị từ chối' 
          });
        }
      }
      message.success('Cập nhật trạng thái thành công!');
      
      // Refresh tất cả dữ liệu để đảm bảo tính nhất quán
      await Promise.all([
        fetchApplications(),
        fetchApprovedApps(),
        fetchInterviews(),
        fetchPendingInterviews(),
        fetchOffers()
      ]);
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
      
      // Ghi chú: Đã loại bỏ validation ở frontend để tránh xung đột với backend
      // Backend sẽ xử lý tất cả validation bao gồm kiểm tra thời gian trong quá khứ
      
      // Sử dụng format đơn giản để tránh vấn đề timezone
      const startTimeStr = startTime.format('YYYY-MM-DDTHH:mm:ss');
      const endTimeStr = endTime.format('YYYY-MM-DDTHH:mm:ss');

      // Tìm lịch phỏng vấn hiện tại của ứng viên (nếu có)
      const currentInterview = interviews.find(i => i.applicationId === selectedApplication.id);

      // Ghi chú: Đã loại bỏ logic kiểm tra trùng lịch ở frontend để tránh xung đột với backend
      // Backend sẽ xử lý tất cả validation bao gồm kiểm tra trùng lịch

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
      console.log('Full error response:', err.response);
      console.log('Error response data:', err.response?.data);
      console.log('Error response status:', err.response?.status);
      
      // Hiển thị thông báo lỗi cụ thể từ backend
      if (err.response && err.response.status === 400) {
        if (err.response.data && err.response.data.message) {
          // Hiển thị thông báo lỗi chi tiết từ backend
          console.log('Using backend message:', err.response.data.message);
          message.error(err.response.data.message);
        } else if (err.response.data && err.response.data.error) {
          // Fallback cho trường hợp có error code nhưng không có message
          const errorMessages = {
            'PAST_TIME': 'Thời gian bắt đầu không được trong quá khứ!',
            'DIFFERENT_DAYS': 'Thời gian bắt đầu và kết thúc phải trong cùng một ngày!',
            'DURATION_TOO_LONG': 'Thời gian phỏng vấn không được quá 4 tiếng!',
            'INVALID_TIME_ORDER': 'Thời gian bắt đầu phải trước thời gian kết thúc!',
            'SCHEDULE_CONFLICT': 'Thời gian phỏng vấn bị trùng với lịch phỏng vấn khác!',
            // Đã bỏ ràng buộc giờ hành chính
          };
          const errorMessage = errorMessages[err.response.data.error] || 'Thời gian phỏng vấn không đáp ứng điều kiện quy định!';
          console.log('Using error code mapping:', err.response.data.error, '->', errorMessage);
          message.error(errorMessage);
        } else {
          console.log('No specific error message found, using generic message');
          message.error('Thời gian phỏng vấn không đáp ứng điều kiện quy định!');
        }
      } else {
        console.log('Non-400 error, using generic message');
        message.error('Không thể lên lịch phỏng vấn!');
      }
    }
  };

                  const handleInterviewStatusChange = async (id, status, result) => {
                  try {
                    await axiosInstance.put(`/interview-schedules/${id}/result`, { status, result });
                    
                    // Nếu từ chối, cập nhật trạng thái đơn ứng tuyển thành REJECTED
                    if (status === 'REJECTED') {
                      // Tìm application ID từ interview
                      const interview = pendingInterviews.find(i => i.id === id);
                      if (interview && interview.applicationId) {
                        await axiosInstance.post(`/recruitment-applications/${interview.applicationId}/reject`);
                      }
                    }
                    
                    message.success('Cập nhật trạng thái thành công!');

                    // Refresh tất cả dữ liệu để đảm bảo tính nhất quán
                    await Promise.all([
                      fetchPendingInterviews(),
                      fetchInterviews(),
                      fetchApprovedApps(),
                      fetchOffers(),
                      fetchApplications()
                    ]);
                  } catch (error) {
                    message.error('Cập nhật trạng thái thất bại!');
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

  const handleHourlyRateUpdate = async (id, hourlyRate) => {
    try {
      // Đảm bảo giá trị tối thiểu là 100k
      let validHourlyRate = hourlyRate;
      if (hourlyRate && hourlyRate < 100000) {
        validHourlyRate = 100000;
      }
      await axiosInstance.put(`/interview-schedules/${id}/hourly-rate`, { hourlyRate: validHourlyRate });
      message.success('Cập nhật lương theo giờ thành công!');
      fetchOffers(); // Refresh để hiển thị giá trị đã được chuẩn hóa
    } catch (err) {
      message.error('Không thể cập nhật lương theo giờ!');
    }
  };

  const handleEvaluationUpdate = async (id, evaluation, silent = false) => {
    try {
      await axiosInstance.put(`/interview-schedules/${id}/evaluation`, { evaluation });
      if (!silent) {
        message.success('Cập nhật đánh giá thành công!');
      }
      // Đồng bộ lại dữ liệu local để hiển thị ngay
      setPendingInterviews(prev => prev.map(i => i.id === id ? { ...i, evaluation } : i));
      setInterviews(prev => prev.map(i => i.id === id ? { ...i, evaluation } : i));
      setOffers(prev => prev.map(i => i.id === id ? { ...i, evaluation } : i));
    } catch (err) {
      const detail = err?.response?.data?.message || 'Không thể cập nhật đánh giá!';
      message.error(detail);
    }
  };

  const openEvaluationModal = (record) => {
    setEvaluatingInterview(record);
    const current = record?.evaluation || '';
    setEvaluationDraft(current);
    evaluationForm.setFieldsValue({ evaluation: current });
    setShowEvaluationModal(true);
  };

  const closeEvaluationModal = () => {
    setShowEvaluationModal(false);
    setEvaluatingInterview(null);
    setEvaluationDraft('');
    evaluationForm.resetFields();
    if (evaluationSaveTimerRef.current) {
      clearTimeout(evaluationSaveTimerRef.current);
      evaluationSaveTimerRef.current = null;
    }
  };

  const handleEvaluationChange = (e) => {
    const value = (e?.target?.value ?? '').slice(0, 200);
    setEvaluationDraft(value);
    evaluationForm.setFieldsValue({ evaluation: value });

    if (!evaluatingInterview?.id) return;
    if (evaluationSaveTimerRef.current) {
      clearTimeout(evaluationSaveTimerRef.current);
    }
    evaluationSaveTimerRef.current = setTimeout(() => {
      handleEvaluationUpdate(evaluatingInterview.id, value, true);
    }, 600);
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

  const handleResendOffer = async (interviewId, offer, hourlyRate, contractType) => {
    try {
      if (contractType === 'PART_TIME') {
        if (!hourlyRate || hourlyRate < 100000) {
          message.warning('Vui lòng nhập lương theo giờ trước khi gửi lại!');
          return;
        }
        
        // Gửi email part-time
        await axiosInstance.post(`/interview-schedules/${interviewId}/resend-offer-part-time`, {
          hourlyRate: hourlyRate
        });
        message.success('Đã gửi offer email part-time thành công!');
      } else {
        if (!offer || offer.trim() === '') {
          message.warning('Vui lòng nhập offer trước khi gửi lại!');
          return;
        }
        
        // Lấy chi tiết tính lương trước khi gửi email (kèm số người phụ thuộc nếu FULL_TIME)
        const salaryDetails = await axiosInstance.get(`/interview-schedules/${interviewId}/salary-calculation`, {
          params: { numberOfDependents: dependentsByInterview[interviewId] || 0 }
        });
        
        await axiosInstance.post(`/interview-schedules/${interviewId}/resend-offer`, {
          offer: offer,
          salaryDetails: salaryDetails.data
        });
        message.success('Đã gửi offer email với chi tiết lương thành công!');
      }
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
      
      // Cập nhật state local ngay lập tức để ẩn ứng viên đã duyệt khỏi "Phỏng vấn chờ"
      setPendingInterviews(prev => prev.filter(interview => interview.id !== id));
      
      // Refresh tất cả dữ liệu để đảm bảo tính nhất quán
      await Promise.all([
        fetchPendingInterviews(),
        fetchInterviews(),
        fetchApprovedApps(),
        fetchOffers()
      ]);
    } catch (error) {
      console.error('Error approving candidate:', error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Không thể duyệt ứng viên!');
      }
    }
  };

  const handleShowSalaryDetails = async (interviewId, grossSalary) => {
    setLoadingSalaryDetails(true);
    try {
      const response = await axiosInstance.get(`/interview-schedules/${interviewId}/salary-calculation`, {
        params: { numberOfDependents: dependentsByInterview[interviewId] || 0 }
      });
      setSalaryDetails(response.data);
      setShowSalaryDetailsModal(true);
    } catch (err) {
      message.error('Không thể tải chi tiết tính lương!');
    } finally {
      setLoadingSalaryDetails(false);
    }
  };

  const handleDependentsChange = (interviewId, value) => {
    setDependentsByInterview(prev => ({ ...prev, [interviewId]: value }));
  };

  const openPlans = plans.filter(p => p.status === 'OPEN');

  const positionColumns = [
    { 
      title: 'Thứ tự', 
      dataIndex: 'index',
      width: 80,
      render: (_, __, index) => <span className="vietnamese-text">{index + 1}</span>
    },
    { 
      title: 'Vị trí', 
      dataIndex: 'title', 
      width: 200,
      render: (text) => (
        <span className="vietnamese-text" title={text}>
          {text && text.length > 20 ? `${text.substring(0, 20)}...` : text}
        </span>
      )
    },
    { 
      title: 'Mô tả', 
      dataIndex: 'description', 
      width: 400,
      render: (text) => {
        if (!text) return <span className="vietnamese-text">-</span>;
        if (text.length > 250) {
          return (
            <span className="vietnamese-text" title={text}>
              {text.substring(0, 250)}...
            </span>
          );
        }
        return <span className="vietnamese-text">{text}</span>;
      }
    },
    { 
      title: 'Mức lương', 
      dataIndex: 'salaryRange', 
      render: (text, record) => {
        const ct = record?.contractType || 'FULL_TIME';
        if (!text) return <span className="vietnamese-text">-</span>;
        if (ct === 'PART_TIME') {
          const vnd = Number(text || 0);
          return <span className="vietnamese-text">{vnd.toLocaleString('vi-VN')} VNĐ/giờ</span>;
        }
        return <span className="vietnamese-text">{`${text} triệu`}</span>;
      }
    },
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
    { 
      title: 'Thứ tự', 
      dataIndex: 'index',
      width: 80,
      render: (_, __, index) => <span className="vietnamese-text">{index + 1}</span>
    },
    { title: 'Họ tên', dataIndex: 'fullName', render: (text) => <span className="vietnamese-text">{text}</span> },
    { title: 'Email', dataIndex: 'email', render: (text) => <span className="vietnamese-text">{text}</span> },
    { title: 'Số điện thoại', dataIndex: 'phoneNumber', render: (text) => <span className="vietnamese-text">{text}</span> },
    { title: 'Địa chỉ', dataIndex: 'address', render: (text) => <span className="vietnamese-text">{text || '-'}</span> },
    { 
      title: 'Vị trí', 
      dataIndex: 'jobTitle', 
      width: 200,
      render: (text) => (
        <span className="vietnamese-text" title={text}>
          {text && text.length > 20 ? `${text.substring(0, 20)}...` : text}
        </span>
      )
    },
    { 
      title: 'Ngày ứng tuyển', 
      dataIndex: 'createdAt',
      sorter: (a, b) => toTimestamp(a.createdAt) - toTimestamp(b.createdAt),
      defaultSortOrder: 'descend',
      render: (value) => {
        const d = parseApiDateTime(value);
        return d.isValid() ? <span className="vietnamese-text">{d.format('DD/MM/YYYY HH:mm')}</span> : <span className="vietnamese-text">-</span>;
      }
    },
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
    { 
      title: 'Thứ tự', 
      dataIndex: 'index',
      width: 80,
      render: (_, __, index) => <span className="vietnamese-text">{index + 1}</span>
    },
    { title: 'Họ tên', dataIndex: 'fullName', render: (text) => <span className="vietnamese-text">{text}</span> },
    { title: 'Email', dataIndex: 'email', render: (text) => <span className="vietnamese-text">{text}</span> },
    { 
      title: 'Vị trí', 
      dataIndex: 'jobTitle', 
      width: 200,
      render: (text) => (
        <span className="vietnamese-text" title={text}>
          {text && text.length > 20 ? `${text.substring(0, 20)}...` : text}
        </span>
      )
    },
    {
      title: 'Trạng thái lịch',
      dataIndex: 'hasSchedule',
      render: (_, record) => {
        const interview = interviews.find(i => i.applicationId === record.id);
        if (!interview) {
          return (
            <Tag color="orange" className="vietnamese-text">
              Chưa lên lịch
            </Tag>
          );
        }
        
        // Hiển thị trạng thái chi tiết
        let color, text;
        switch (interview.status) {
          case 'SCHEDULED':
            color = 'blue';
            text = 'Đã lên lịch';
            break;
          case 'PENDING':
            color = 'orange';
            text = 'Chờ phỏng vấn';
            break;
          case 'COMPLETED':
            color = 'gray';
            text = 'Hoàn thành';
            break;
          case 'ACCEPTED':
            color = 'green';
            text = 'Đã duyệt';
            break;
          case 'APPROVED':
            color = 'green';
            text = 'Đã duyệt';
            break;
          case 'REJECTED':
            color = 'red';
            text = 'Từ chối';
            break;
          default:
            color = 'default';
            text = interview.status || 'Không xác định';
        }
        
        return (
          <Tag color={color} className="vietnamese-text">
            {text}
          </Tag>
        );
      }
    },
    {
      title: 'Thời gian phỏng vấn',
      dataIndex: 'interviewTime',
      render: (_, record) => {
        const interview = interviews.find(i => i.applicationId === record.id);
        if (interview && interview.startTime && interview.endTime) {
          try {
            // Parse startTime và endTime từ ISO format
            const startTime = dayjs(interview.startTime);
            const endTime = dayjs(interview.endTime);
            return <span className="vietnamese-text">{`${startTime.format('DD/MM/YYYY HH:mm')} - ${endTime.format('HH:mm')}`}</span>;
          } catch (error) {
            return <span className="vietnamese-text">Lỗi định dạng</span>;
          }
        }
        return <span className="vietnamese-text">-</span>;
      }
    },
    {
      title: 'Thao tác',
      render: (_, record) => {
        const interview = interviews.find(i => i.applicationId === record.id);
        const hasSchedule = !!interview;
        
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
            {hasSchedule && interview.status !== 'COMPLETED' && (
              <Button 
                size="small" 
                onClick={() => openScheduleModal(record)}
                className="vietnamese-text"
              >
                Sửa lịch
              </Button>
            )}
            {hasSchedule && interview.status === 'COMPLETED' && (
              <Button 
                size="small" 
                type="dashed"
                disabled
                className="vietnamese-text"
              >
                Đã hoàn thành
              </Button>
            )}
            <Button 
              type="primary" 
              size="small" 
              danger
              onClick={() => handleApplicationStatusChange(record.id, 'REJECTED')}
              className="vietnamese-text"
            >
              ✗ Từ chối
            </Button>
          </div>
        );
      }
    }
  ];

  const pendingInterviewColumns = [
    { 
      title: 'Thứ tự', 
      dataIndex: 'index',
      width: 80,
      render: (_, __, index) => <span className="vietnamese-text">{index + 1}</span>
    },
    { title: 'Họ tên', dataIndex: 'applicantName', render: (text) => <span className="vietnamese-text">{text}</span> },
    { 
      title: 'Vị trí', 
      dataIndex: 'jobTitle', 
      width: 200,
      render: (text) => (
        <span className="vietnamese-text" title={text}>
          {text && text.length > 20 ? `${text.substring(0, 20)}...` : text}
        </span>
      )
    },
    { 
      title: 'Ngày phỏng vấn', 
      dataIndex: 'startTime', 
      render: (date, record) => {
        try {
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
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => {
        let color, text;
        switch (status) {
          case 'SCHEDULED':
            color = 'blue';
            text = 'Đã lên lịch';
            break;
          case 'PENDING':
            color = 'orange';
            text = 'Chờ phỏng vấn';
            break;
          case 'COMPLETED':
            color = 'gray';
            text = 'Hoàn thành';
            break;
          case 'ACCEPTED':
            color = 'green';
            text = 'Đã duyệt';
            break;
          case 'APPROVED':
            color = 'green';
            text = 'Đã duyệt';
            break;
          case 'REJECTED':
            color = 'red';
            text = 'Từ chối';
            break;
          default:
            color = 'default';
            text = status || 'Không xác định';
        }
        
        return (
          <Tag color={color} className="vietnamese-text">
            {text}
          </Tag>
        );
      }
    },
    {
      title: 'Đánh giá',
      dataIndex: 'evaluation',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button size="small" onClick={() => openEvaluationModal(record)} className="vietnamese-text">Viết đánh giá</Button>
          {text ? <span className="vietnamese-text" style={{ color: '#888' }}>(Đã có đánh giá)</span> : <span className="vietnamese-text" style={{ color: '#aaa' }}>(Chưa có)</span>}
        </div>
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
    { 
      title: 'Thứ tự', 
      dataIndex: 'index',
      width: 80,
      render: (_, __, index) => <span className="vietnamese-text">{index + 1}</span>
    },
    { 
      title: 'Họ tên', 
      dataIndex: 'applicantName', 
      render: (text, record) => (
        <span className="vietnamese-text" style={{
          backgroundColor: record.contractType === 'PART_TIME' ? '#e6f7ff' : '#fff7e6',
          padding: '4px 8px',
          borderRadius: '4px',
          display: 'inline-block'
        }}>
          {text}
        </span>
      )
    },
    { 
      title: 'Vị trí', 
      dataIndex: 'jobTitle', 
      width: 200,
      render: (text) => (
        <span className="vietnamese-text" title={text}>
          {text && text.length > 20 ? `${text.substring(0, 20)}...` : text}
        </span>
      )
    },
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button size="small" onClick={() => openEvaluationModal(record)} className="vietnamese-text">Viết đánh giá</Button>
          {text ? <span className="vietnamese-text" style={{ color: '#888' }}>(Đã có đánh giá)</span> : <span className="vietnamese-text" style={{ color: '#aaa' }}>(Chưa có)</span>}
        </div>
      )
    },
    /*
    {
      title: 'Lương GROSS',
      dataIndex: 'offer',
      render: (text, record) => {
        if (record.contractType === 'PART_TIME') {
          return <span className="vietnamese-text text-gray-500">-</span>;
        }
        return (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <GrossSalaryColumnOld 
              offer={text} 
              recordId={record.id} 
              onOfferUpdate={handleOfferUpdate} 
              onShowSalaryDetails={handleShowSalaryDetails} 
            />
            {record.contractType === 'FULL_TIME' && (
              <Select
                size="small"
                value={dependentsByInterview[record.id] || 0}
                onChange={(v) => handleDependentsChange(record.id, v)}
                style={{ width: 140 }}
                className="vietnamese-text"
              >
                {Array.from({ length: 11 }).map((_, i) => (
                  <Select.Option key={i} value={i}>{`Phụ thuộc: ${i}`}</Select.Option>
                ))}
              </Select>
            )}
          </div>
        );
      }
    },
    {
      title: 'Lương NET',
      dataIndex: 'offer',
      render: (text, record) => {
        if (record.contractType === 'PART_TIME') {
          return <span className="vietnamese-text text-gray-500">-</span>;
        }
        return (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <NetSalaryColumnOld 
              offer={text} 
              recordId={record.id} 
              contractType={record.contractType}
              numberOfDependents={dependentsByInterview[record.id] || 0}
              onOfferUpdate={handleOfferUpdate} 
            />
            {record.contractType === 'FULL_TIME' && (
              <Select
                size="small"
                value={dependentsByInterview[record.id] || 0}
                onChange={(v) => handleDependentsChange(record.id, v)}
                style={{ width: 140 }}
                className="vietnamese-text"
              >
                {Array.from({ length: 11 }).map((_, i) => (
                  <Select.Option key={i} value={i}>{`Phụ thuộc: ${i}`}</Select.Option>
                ))}
              </Select>
            )}
          </div>
        );
      }
    },
    */
    
    {
      title: 'Lương theo giờ',
      dataIndex: 'hourlyRate',
      render: (text, record) => {
        if (record.contractType === 'FULL_TIME') {
          return <span className="vietnamese-text text-gray-500">-</span>;
        }
        return <HourlyRateColumn hourlyRate={text} recordId={record.id} onHourlyRateUpdate={handleHourlyRateUpdate} />;
      }
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <div className="grid grid-cols-1 gap-2">
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
            onClick={() => handleResendOffer(record.id, record.offer, record.hourlyRate, record.contractType)}
            className="vietnamese-text"
            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
          >
            Gửi mail Offer
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
        
        <Tabs.TabPane tab="Quản lý đơn ứng tuyển" key="applications" disabled={!selectedPlan}>
          <Table columns={applicationColumns} dataSource={applications} rowKey="id" />
        </Tabs.TabPane>
        
        <Tabs.TabPane tab="Quản lý lịch" key="schedule">
          <Table 
            columns={scheduleColumns} 
            dataSource={getFilteredApprovedApps().filter(app => shouldShowInSchedule(app.id))} 
            rowKey="id" 
          />
        </Tabs.TabPane>
        
        <Tabs.TabPane tab="Đánh giá" key="pending">
          <Table 
            columns={pendingInterviewColumns} 
            dataSource={pendingInterviews.filter(shouldShowInPending)} 
            rowKey="id" 
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Quản Lý Offer" key="offers">
          <Table 
            columns={offerColumns} 
            dataSource={offers.filter(shouldShowInOffers)} 
            rowKey="id" 
          />
        </Tabs.TabPane>
      </Tabs>

      {/* Modal tạo/sửa vị trí */}
      {/* Modal viết đánh giá */}
      <Modal
        title={`Viết đánh giá`}
        open={showEvaluationModal}
        onCancel={closeEvaluationModal}
        footer={null}
        className="form-vietnamese"
      >
        <Form layout="vertical" form={evaluationForm} className="form-vietnamese">
          <Form.Item
            name="evaluation"
            label="Đánh giá"
            rules={[{ max: 200, message: 'Đánh giá tối đa 200 ký tự!' }]}
          >
            <Input.TextArea
              value={evaluationDraft}
              onChange={handleEvaluationChange}
              maxLength={200}
              rows={6}
              placeholder="Nhập đánh giá (tối đa 200 ký tự)..."
              className="vietnamese-text"
            />
          </Form.Item>
          <Form.Item>
            <div className="flex justify-end space-x-2">
              <Button onClick={closeEvaluationModal} className="vietnamese-text">Đóng</Button>
              <Button
                type="primary"
                className="vietnamese-text"
                onClick={async () => {
                  if (!evaluatingInterview?.id) return;
                  await handleEvaluationUpdate(evaluatingInterview.id, evaluationDraft);
                  closeEvaluationModal();
                }}
              >
                Lưu
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal tạo/sửa vị trí */}
      <Modal
        title={editingPosition ? 'Sửa vị trí' : 'Thêm vị trí'}
        open={showPositionModal}
        onCancel={() => setShowPositionModal(false)}
        footer={null}
        className="form-vietnamese"
      >
        <Form layout="vertical" form={positionForm} onFinish={handlePositionSubmit} className="form-vietnamese">
          <Form.Item name="title" label="Tên vị trí" rules={[{ required: true, message: 'Vui lòng nhập tên vị trí' }, { max: 50, message: 'Vị trí tối đa 50 ký tự!' }]}>
            <Input className="vietnamese-text" maxLength={50} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }, { max: 500, message: 'Mô tả tối đa 500 ký tự!' }]}>
            <Input.TextArea 
              className="vietnamese-text" 
              maxLength={500} 
              rows={4}
              style={{ minHeight: '120px' }}
              placeholder="Nhập mô tả chi tiết về vị trí công việc..."
            />
          </Form.Item>
          
          {/* 
          <Form.Item name="contractType" label="Kiểu hợp đồng" rules={[{ required: true, message: 'Vui lòng chọn kiểu hợp đồng' }]}>
            <Select className="vietnamese-text" placeholder="Chọn kiểu hợp đồng">
              <Select.Option value="FULL_TIME">Hợp đồng full-time</Select.Option>
              <Select.Option value="PART_TIME">Hợp đồng có kỳ hạn</Select.Option>
            </Select>
          </Form.Item>
          */}
          
          <Form.Item name="contractType" hidden>
            <Input value="PART_TIME" />
          </Form.Item>
          <Form.Item name="salaryRange" label="Mức lương" rules={[{ required: true, message: 'Vui lòng nhập mức lương' }]}>
            <Input 
              className="vietnamese-text" 
              maxLength={50}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/[^0-9]/g, '').slice(0, 50);
                positionForm.setFieldsValue({ salaryRange: onlyDigits });
              }}
              addonAfter={watchedContractType === 'PART_TIME' ? 'VNĐ/giờ' : 'triệu'}
              placeholder={watchedContractType === 'PART_TIME' ? 'Ví dụ: 500000' : 'Ví dụ: 15'}
            />
          </Form.Item>
          <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}>    
            <InputNumber 
              min={1} 
              max={50}
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
            rules={[
              { required: true, message: 'Vui lòng chọn thời gian phỏng vấn!' },
              {
                validator: (_, value) => {
                  if (!value || !value[0] || !value[1]) {
                    return Promise.resolve();
                  }
                  
                  const startTime = value[0];
                  const endTime = value[1];
                  
                  console.log('Frontend validation:', {
                    startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
                    endTime: endTime.format('YYYY-MM-DD HH:mm:ss'),
                    duration: endTime.diff(startTime, 'hour', true)
                  });
                  // Backend sẽ xử lý tất cả validation bao gồm:
                  // - Thời gian trong quá khứ
                  // - Cùng ngày
                  // - Không quá 4 tiếng
                  // - Thời gian bắt đầu phải trước thời gian kết thúc
                  // - Trùng lịch với ứng viên khác
                  
                  console.log('Frontend validation passed - letting backend handle all validation');
                  return Promise.resolve();
                }
              }
            ]}
          >
            <RangePicker 
              showTime={{ 
                format: 'HH:mm',
                minuteStep: 60, // Chỉ cho phép chọn giờ, không chọn phút
                hideDisabledOptions: true
              }}
              format="YYYY-MM-DD HH:mm"
              placeholder={['Bắt đầu', 'Kết thúc']}
              className="vietnamese-text"
              // Đã bỏ ràng buộc giờ hành chính, cho phép chọn cả ngày
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  console.log('Selected times:', {
                    start: dates[0].format('YYYY-MM-DD HH:mm:ss'),
                    end: dates[1].format('YYYY-MM-DD HH:mm:ss'),
                    duration: dates[1].diff(dates[0], 'hour', true)
                  });
                }
              }}
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
                  <strong>Bảo hiểm xã hội nhân viên (8%):</strong> {salaryDetails.insuranceDetails?.socialInsuranceEmployee?.toLocaleString('vi-VN')} VNĐ
                </div>
                <div>
                  <strong>Bảo hiểm y tế nhân viên (1.5%):</strong> {salaryDetails.insuranceDetails?.healthInsuranceEmployee?.toLocaleString('vi-VN')} VNĐ
                </div>
                <div>
                  <strong>Bảo hiểm thất nghiệp nhân viên (1%):</strong> {salaryDetails.insuranceDetails?.unemploymentInsuranceEmployee?.toLocaleString('vi-VN')} VNĐ
                </div>
                <div>
                  <strong>Tổng đóng góp nhân viên (10.5%):</strong> {salaryDetails.insuranceDetails?.totalEmployeeContribution?.toLocaleString('vi-VN')} VNĐ
                </div>
                <div>
                  <strong>Bảo hiểm xã hội công ty (17%):</strong> {salaryDetails.insuranceDetails?.socialInsuranceEmployer?.toLocaleString('vi-VN')} VNĐ
                </div>
                <div>
                  <strong>Bảo hiểm y tế công ty (3%):</strong> {salaryDetails.insuranceDetails?.healthInsuranceEmployer?.toLocaleString('vi-VN')} VNĐ
                </div>
                <div>
                  <strong>Bảo hiểm thất nghiệp công ty (1%):</strong> {salaryDetails.insuranceDetails?.unemploymentInsuranceEmployer?.toLocaleString('vi-VN')} VNĐ
                </div>
                <div>
                  <strong>Bảo hiểm tai nạn lao động (0.5%):</strong> {salaryDetails.insuranceDetails?.workAccidentInsurance?.toLocaleString('vi-VN')} VNĐ
                </div>
                <div>
                  <strong>Tổng đóng góp công ty (21.5%):</strong> {salaryDetails.insuranceDetails?.totalEmployerContribution?.toLocaleString('vi-VN')} VNĐ
                </div>
                <div>
                  <strong>Tổng bảo hiểm (32%):</strong> {salaryDetails.insuranceDetails?.totalInsuranceContribution?.toLocaleString('vi-VN')} VNĐ
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
                  {salaryDetails.grossSalary?.toLocaleString('vi-VN')} - {salaryDetails.insuranceDetails?.totalEmployeeContribution?.toLocaleString('vi-VN')} - {salaryDetails.personalIncomeTax?.toLocaleString('vi-VN')} = {salaryDetails.netSalary?.toLocaleString('vi-VN')} VNĐ
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
            Không có dữ liệu tính lương
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RecruitmentManagement; 