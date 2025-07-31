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
      fetchApprovedApps();
    }
  }, [selectedPlan, positions]);

  useEffect(() => {
    if (selectedPlan && applications.length > 0) {
      fetchInterviews();
      fetchPendingInterviews();
    }
  }, [selectedPlan, applications]);

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
    if (!selectedPlan) return;
    try {
      const res = await axiosInstance.get('/recruitment-applications/approved');
      // Lọc theo job positions thuộc recruitment plan
      const filtered = res.data.filter(app => 
        positions.some(pos => pos.id === app.jobPositionId)
      );
      setApprovedApps(filtered);
    } catch (err) {
      message.error('Không thể tải danh sách ứng viên đã duyệt!');
    }
  };

  const fetchInterviews = async () => {
    if (!selectedPlan) return;
    try {
      const res = await axiosInstance.get('/interview-schedules');
      // Lọc theo applications thuộc recruitment plan
      const filtered = res.data.filter(interview => 
        applications.some(app => app.id === interview.applicationId)
      );
      setInterviews(filtered);
    } catch (err) {
      message.error('Không thể tải danh sách lịch phỏng vấn!');
    }
  };

  const fetchPendingInterviews = async () => {
    if (!selectedPlan) return;
    try {
      const res = await axiosInstance.get('/interview-schedules/pending');
      console.log('All pending interviews from API:', res.data);
      
      // Lọc theo applications thuộc recruitment plan
      const filtered = res.data.filter(interview => {
        // Tìm application tương ứng trong tất cả applications
        const application = applications.find(app => app.id === interview.applicationId);
        if (application) {
          // Kiểm tra xem application có thuộc job position của recruitment plan không
          const belongsToPlan = positions.some(pos => pos.id === application.jobPositionId);
          console.log(`Interview ${interview.id} for application ${interview.applicationId}: belongsToPlan = ${belongsToPlan}`);
          console.log(`Interview ${interview.id} startTime:`, interview.startTime, 'Type:', typeof interview.startTime);
          return belongsToPlan;
        }
        console.log(`Interview ${interview.id}: no application found`);
        return false;
      });
      console.log('Pending interviews filtered:', filtered);
      setPendingInterviews(filtered);
    } catch (err) {
      console.error('Error fetching pending interviews:', err);
      message.error('Không thể tải danh sách phỏng vấn chờ!');
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
    
    if (selectedPlan || key === 'plans') {
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
      message.error('Có lỗi xảy ra!');
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

      // Kiểm tra trùng lịch
      const conflictCheck = await axiosInstance.post('/interview-schedules/check-conflict', null, {
        params: { startTime: startTimeStr, endTime: endTimeStr }
      });

      if (conflictCheck.data) {
        message.error('Thời gian này đã có lịch phỏng vấn khác!');
        return;
      }

      const response = await axiosInstance.post('/interview-schedules', null, {
        params: {
          applicationId: selectedApplication.id,
          startTime: startTimeStr,
          endTime: endTimeStr
        }
      });
      console.log('Interview created:', response.data);

      message.success('Lên lịch phỏng vấn thành công!');
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
    } catch (err) {
      message.error('Không thể cập nhật kết quả phỏng vấn!');
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
    
    try {
      window.open(cvUrl, '_blank');
    } catch (error) {
      message.error('Không thể mở CV. Vui lòng thử lại!');
      console.error('Error opening CV:', error);
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
    { title: 'Vị trí', dataIndex: 'jobPosition', render: (text) => <span className="vietnamese-text">{text}</span> },
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
          <Popconfirm title="Xóa đơn này?" onConfirm={() => handleDeleteApplication(record.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger className="vietnamese-text">Xóa</Button>
          </Popconfirm>
        </div>
      )
    }
  ];

  // Gộp danh sách ứng viên đã duyệt và lịch phỏng vấn
  const scheduleColumns = [
    { title: 'Họ tên', dataIndex: 'fullName', render: (text) => <span className="vietnamese-text">{text}</span> },
    { title: 'Email', dataIndex: 'email', render: (text) => <span className="vietnamese-text">{text}</span> },
    { title: 'Vị trí', dataIndex: 'jobPosition', render: (text) => <span className="vietnamese-text">{text}</span> },
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
          <Popconfirm title="Xóa lịch này?" onConfirm={() => handleDeleteInterview(record.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger className="vietnamese-text">Xóa</Button>
          </Popconfirm>
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
        
        <Tabs.TabPane tab="Lên lịch" key="schedule" disabled={!selectedPlan}>
          <Table columns={scheduleColumns} dataSource={approvedApps} rowKey="id" />
        </Tabs.TabPane>
        
        <Tabs.TabPane tab="Phỏng vấn chờ" key="pending" disabled={!selectedPlan}>
          <Table columns={pendingInterviewColumns} dataSource={pendingInterviews} rowKey="id" />
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
          <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} className="vietnamese-text" />
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
    </div>
  );
};

export default RecruitmentManagement; 