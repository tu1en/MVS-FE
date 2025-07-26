import { Tabs, Table, Button, Modal, Form, Input, message, Popconfirm, Tag, Calendar, Badge, Select, InputNumber } from 'antd';
import { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import dayjs from 'dayjs';

const RecruitmentManagement = () => {
  // Job positions state
  const [positions, setPositions] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [positionForm] = Form.useForm();

  // Applications state
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // Modal từ chối
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingApp, setRejectingApp] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // State cho lịch phỏng vấn
  const [approvedApps, setApprovedApps] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedAppId, setSelectedAppId] = useState(null);

  // State cho kết quả phỏng vấn
  const [pendingInterviews, setPendingInterviews] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [resultModal, setResultModal] = useState({ open: false, interview: null, status: '', reason: '' });

  // Helper: chuyển LocalDateTime array về string ISO
  const parseDateTimeArray = arr => {
    if (!Array.isArray(arr) || arr.length < 6) return '';
    // [year, month, day, hour, minute, second, nano]
    const [y, m, d, h, min, s] = arr;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Fetch job positions
  const fetchPositions = async () => {
    setLoadingPositions(true);
    try {
      const res = await axiosInstance.get('/job-positions');
      setPositions(res.data);
    } catch {
      message.error('Không thể tải danh sách vị trí!');
    } finally {
      setLoadingPositions(false);
    }
  };

  // Fetch applications
  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await axiosInstance.get('/recruitments');
      setApplications(res.data);
    } catch {
      message.error('Không thể tải danh sách ứng viên!');
    } finally {
      setLoadingApps(false);
    }
  };

  // Fetch ứng viên đã duyệt
  const fetchApprovedApps = async () => {
    try {
      const res = await axiosInstance.get('/recruitments');
      setApprovedApps(res.data.filter(a => a.status === 'APPROVED'));
    } catch {}
  };
  // Fetch lịch phỏng vấn
  const fetchInterviews = async () => {
    setLoadingInterviews(true);
    try {
      const res = await axiosInstance.get('/interview-schedules');
      // Parse lại startTime/endTime nếu là array
      const data = res.data.map(i => ({
        ...i,
        startTime: Array.isArray(i.startTime) ? parseDateTimeArray(i.startTime) : i.startTime,
        endTime: Array.isArray(i.endTime) ? parseDateTimeArray(i.endTime) : i.endTime,
      }));
      setInterviews(data);
      console.log('Fetched interviews:', data); // Debug log
    } catch {}
    setLoadingInterviews(false);
  };

  // Fetch pending interviews
  const fetchPendingInterviews = async () => {
    setLoadingPending(true);
    try {
      const res = await axiosInstance.get('/interview-schedules/pending');
      setPendingInterviews(res.data);
    } catch {}
    setLoadingPending(false);
  };

  useEffect(() => {
    fetchPositions();
    fetchApplications();
    fetchApprovedApps();
    fetchInterviews();
    fetchPendingInterviews();
  }, []);

  // Khi interviews thay đổi, reset selectedAppId nếu ứng viên đã được xếp lịch
  useEffect(() => {
    if (selectedAppId && interviews.some(i => i.applicationId === selectedAppId)) {
      setSelectedAppId(null);
    }
  }, [interviews]);

  // Khi interviews thay đổi, cập nhật lại pendingInterviews (nếu cần)
  useEffect(() => {
    fetchPendingInterviews();
  }, [interviews]);

  // CRUD Job Position
  const openAddPosition = () => {
    setEditingPosition(null);
    positionForm.resetFields();
    setShowPositionModal(true);
  };
  const openEditPosition = (record) => {
    setEditingPosition(record);
    positionForm.setFieldsValue(record);
    setShowPositionModal(true);
  };
  const handleDeletePosition = async (id) => {
    await axiosInstance.delete(`/job-positions/${id}`);
    message.success('Đã xoá vị trí!');
    fetchPositions();
  };
  const handlePositionSubmit = async (values) => {
    if (editingPosition) {
      await axiosInstance.put(`/job-positions/${editingPosition.id}`, values);
      message.success('Cập nhật thành công!');
    } else {
      await axiosInstance.post('/job-positions', values);
      message.success('Cập nhật thành công!');
    }
    setShowPositionModal(false);
    fetchPositions();
  };

  // Duyệt CV
  const handleApprove = async (record) => {
    await axiosInstance.post(`/recruitments/${record.id}/approve`);
    message.success('Đã duyệt CV!');
    fetchApplications();
    fetchApprovedApps(); // Cập nhật ngay danh sách ứng viên đã duyệt
  };
  // Từ chối CV
  const handleReject = async () => {
    if (!rejectingApp) return;
    await axiosInstance.post(`/recruitments/${rejectingApp.id}/reject`, { reason: rejectReason });
    message.success('Đã từ chối CV!');
    setShowRejectModal(false);
    setRejectingApp(null);
    setRejectReason('');
    fetchApplications();
  };

  // Thêm lịch phỏng vấn
  const handleAddInterview = async (appId, date) => {
    // Không cho phép lên lịch trong quá khứ
    if (dayjs(date).isBefore(dayjs(), 'day')) {
      message.error('Không thể lên lịch phỏng vấn trong quá khứ!');
      return;
    }
    // Kiểm tra ứng viên đã có lịch phỏng vấn chưa
    if (interviews.some(i => i.applicationId === appId)) {
      message.error('Ứng viên này đã có lịch phỏng vấn!');
      return;
    }
    // Kiểm tra ứng viên đã có lịch phỏng vấn trong ngày này chưa
    if (interviews.some(i => i.applicationId === appId && dayjs(i.startTime).isSame(date, 'day'))) {
      message.error('Ứng viên này đã có lịch phỏng vấn trong ngày này!');
      return;
    }
    // Tìm slot giờ trống trong ngày (không trùng)
    const dayInterviews = interviews.filter(i => dayjs(i.startTime).isSame(date, 'day'));
    let startHour = 8;
    let found = false;
    for (; startHour <= 16; startHour++) {
      const slotTaken = dayInterviews.some(i => dayjs(i.startTime).hour() === startHour);
      if (!slotTaken) { found = true; break; }
    }
    if (!found) {
      message.error('Hết slot phỏng vấn trong ngày này!');
      return;
    }
    const start = dayjs(date).hour(startHour).minute(0).second(0);
    const end = start.add(1, 'hour');
    await axiosInstance.post('/interview-schedules', {
      applicationId: appId,
      startTime: start.toISOString(),
      endTime: end.toISOString()
    }, { params: { applicationId: appId, startTime: start.toISOString(), endTime: end.toISOString() } });
    message.success('Đã lên lịch phỏng vấn!');
    await fetchInterviews(); // Đảm bảo cập nhật lịch ngay
    await fetchPendingInterviews();
    setSelectedAppId(null); // Reset sau khi lên lịch thành công
  };
  // Xoá lịch phỏng vấn
  const handleDeleteInterview = async (id) => {
    await axiosInstance.delete(`/interview-schedules/${id}`);
    message.success('Đã xoá lịch phỏng vấn!');
    fetchInterviews();
  };

  // Xử lý kết quả phỏng vấn
  const handleSetResult = async () => {
    if (!resultModal.interview) return;
    await axiosInstance.put(`/interview-schedules/${resultModal.interview.id}/result`, {
      status: resultModal.status,
      result: resultModal.reason
    });
    message.success('Đã cập nhật kết quả phỏng vấn!');
    setResultModal({ open: false, interview: null, status: '', reason: '' });
    fetchPendingInterviews();
    fetchApprovedApps();
    fetchInterviews();
  };

  // Table columns
  const positionColumns = [
    { title: 'Tên vị trí', dataIndex: 'title' },
    { 
      title: 'Mô tả', 
      dataIndex: 'description',
      render: (text, record) => (
        <Input.TextArea
          value={text}
          onChange={(e) => {
            const newPositions = positions.map(p => 
              p.id === record.id ? { ...p, description: e.target.value } : p
            );
            setPositions(newPositions);
          }}
          onBlur={() => handlePositionSubmit({ ...record, description: record.description })}
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
      )
    },
    { 
      title: 'Mức lương', 
      dataIndex: 'salaryRange',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => {
            const newPositions = positions.map(p => 
              p.id === record.id ? { ...p, salaryRange: e.target.value } : p
            );
            setPositions(newPositions);
          }}
          onBlur={() => handlePositionSubmit({ ...record, salaryRange: record.salaryRange })}
        />
      )
    },
    { 
      title: 'Số lượng tuyển dụng', 
      dataIndex: 'quantity',
      render: (text, record) => (
        <InputNumber
          value={text}
          min={1}
          onChange={(value) => {
            const newPositions = positions.map(p => 
              p.id === record.id ? { ...p, quantity: value } : p
            );
            setPositions(newPositions);
          }}
          onBlur={() => handlePositionSubmit({ ...record, quantity: record.quantity })}
        />
      )
    },
    {
      title: 'Hành động',
      render: (_, record) => (
        <>
          <Button size="small" onClick={() => openEditPosition(record)}>Sửa</Button>
          <Popconfirm title="Xoá vị trí này?" onConfirm={() => handleDeletePosition(record.id)} okText="Xoá" cancelText="Huỷ">
            <Button size="small" danger className="ml-2">Xoá</Button>
          </Popconfirm>
        </>
      )
    }
  ];

  const appColumns = [
    { title: 'Vị trí', dataIndex: 'jobTitle' },
    { title: 'Họ tên', dataIndex: 'fullName' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phoneNumber', render: v => v || '-' },
    { title: 'Địa chỉ', dataIndex: 'address', render: v => v || '-' },
    { title: 'CV', dataIndex: 'cvUrl', render: url => url ? <a href={url} target="_blank" rel="noopener noreferrer">Xem CV</a> : '-' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: s => {
        let color = 'default';
        let text = s;
        
        if (s === 'PENDING') {
          color = 'orange';
          text = 'Chờ duyệt';
        } else if (s === 'APPROVED') {
          color = 'green';
          text = 'Đã duyệt';
        } else if (s === 'REJECTED') {
          color = 'red';
          text = 'Đã từ chối';
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    { title: 'Lý do từ chối', dataIndex: 'rejectReason', render: v => v || '-' },
    {
      title: 'Hành động',
      render: (_, record) => record.status === 'PENDING' && (
        <>
          <Button size="small" type="primary" onClick={() => handleApprove(record)}>Duyệt</Button>
          <Button size="small" danger className="ml-2" onClick={() => { setRejectingApp(record); setShowRejectModal(true); }}>Từ chối</Button>
        </>
      )
    }
  ];

  // Render lịch phỏng vấn trên calendar
  const dateCellRender = (value) => {
    const dayInterviews = interviews.filter(i => dayjs(i.startTime).isSame(value, 'day'));
    return (
      <ul className="events">
        {dayInterviews.map(item => (
          <li key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <Badge status="processing" text={item.applicantName} />
            <Button size="small" danger onClick={() => handleDeleteInterview(item.id)} style={{ marginLeft: 8 }}>
              Xoá lịch
            </Button>
          </li>
        ))}
      </ul>
    );
  };

  // Tab CV đã duyệt
  const ApprovedTab = () => {
    // Lọc chỉ các ứng viên đã duyệt nhưng chưa có lịch phỏng vấn
    const availableApps = approvedApps.filter(app => !interviews.some(i => i.applicationId === app.id));
    return (
      <div>
        <div className="mb-4">
          <Select
            showSearch
            placeholder="Chọn ứng viên để lên lịch phỏng vấn"
            optionFilterProp="children"
            style={{ width: 300 }}
            onChange={setSelectedAppId}
            value={selectedAppId}
          >
            {availableApps.map(app => (
              <Select.Option key={app.id} value={app.id}>{app.fullName} - {app.jobTitle}</Select.Option>
            ))}
          </Select>
          <Button type="primary" className="ml-2" disabled={!selectedAppId} onClick={() => handleAddInterview(selectedAppId, selectedDate)}>
            Lên lịch phỏng vấn ngày {selectedDate.format('DD/MM/YYYY')}
          </Button>
        </div>
        <Calendar value={selectedDate} onSelect={setSelectedDate} dateCellRender={dateCellRender} />
      </div>
    );
  };

  // Tab kết quả phỏng vấn
  const InterviewResultTab = () => {
    // Hiển thị tất cả lịch phỏng vấn, không filter trạng thái
    return (
      <div>
        <Table
          dataSource={interviews}
          rowKey="id"
          loading={loadingInterviews}
          columns={[
            { title: 'Ứng viên', dataIndex: 'applicantName' },
            { title: 'Email', dataIndex: 'applicantEmail' },
            { title: 'Vị trí', dataIndex: 'jobTitle' },
            { title: 'Thời gian', render: (_, r) => `${dayjs(r.startTime).format('DD/MM/YYYY HH:mm')} - ${dayjs(r.endTime).format('HH:mm')}` },
            { title: 'Trạng thái', dataIndex: 'status', render: s => {
              let color = 'default';
              let text = s || '---';
              
              if (s === 'PENDING') {
                color = 'orange';
                text = 'Chờ phỏng vấn';
              } else if (s === 'SCHEDULED') {
                color = 'blue';
                text = 'Đã lên lịch';
              } else if (s === 'ACCEPTED') {
                color = 'green';
                text = 'Đã chấp nhận';
              } else if (s === 'REJECTED') {
                color = 'red';
                text = 'Đã từ chối';
              } else if (s === 'DONE') {
                color = 'purple';
                text = 'Đã hoàn thành';
              }
              
              return <Tag color={color}>{text}</Tag>;
            } },
            {
              title: 'Hành động',
              render: (_, record) => (record.status === 'PENDING' || record.status === 'SCHEDULED') && (
                <>
                  <Button type="primary" size="small" onClick={() => setResultModal({ open: true, interview: record, status: 'ACCEPTED', reason: '' })}>Chấp nhận</Button>
                  <Button danger size="small" className="ml-2" onClick={() => setResultModal({ open: true, interview: record, status: 'REJECTED', reason: '' })}>Từ chối</Button>
                </>
              )
            }
          ]}
        />
        <Modal
          open={resultModal.open}
          onCancel={() => setResultModal({ open: false, interview: null, status: '', reason: '' })}
          onOk={handleSetResult}
          okText={resultModal.status === 'ACCEPTED' ? 'Chấp nhận' : 'Từ chối'}
          title={resultModal.status === 'ACCEPTED' ? 'Chấp nhận ứng viên' : 'Từ chối ứng viên'}
        >
          {resultModal.status === 'REJECTED' && (
            <Input.TextArea rows={3} value={resultModal.reason} onChange={e => setResultModal({ ...resultModal, reason: e.target.value })} placeholder="Nhập lý do từ chối" />
          )}
          {resultModal.status === 'ACCEPTED' && (
            <div>Bạn chắc chắn muốn chấp nhận ứng viên này? Ứng viên sẽ được thêm vào hệ thống với trạng thái chưa có hợp đồng.</div>
          )}
        </Modal>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Quản Lý Tuyển Dụng</h2>
      <Tabs defaultActiveKey="positions">
        <Tabs.TabPane tab="Vị trí tuyển dụng" key="positions">
          <Button type="primary" className="mb-4" onClick={openAddPosition}>Thêm vị trí mới</Button>
          <Table columns={positionColumns} dataSource={positions} rowKey="id" loading={loadingPositions} />
          <Modal open={showPositionModal} onCancel={() => setShowPositionModal(false)} title={editingPosition ? 'Cập nhật vị trí' : 'Thêm vị trí mới'} onOk={() => positionForm.submit()} okText={editingPosition ? 'Cập nhật' : 'Thêm mới'}>
            <Form form={positionForm} layout="vertical" onFinish={handlePositionSubmit}>
              <Form.Item name="title" label="Tên vị trí" rules={[{ required: true, message: 'Nhập tên vị trí' }]}> <Input /> </Form.Item>
              <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Nhập mô tả' }]}> <Input.TextArea rows={3} /> </Form.Item>
              <Form.Item name="salaryRange" label="Mức lương" rules={[{ required: true, message: 'Nhập mức lương' }]}> <Input /> </Form.Item>
              <Form.Item name="quantity" label="Số lượng tuyển dụng" rules={[{ required: true, message: 'Nhập số lượng' }]}> <InputNumber min={1} style={{ width: '100%' }} /> </Form.Item>
            </Form>
          </Modal>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Ứng viên nộp CV" key="applications">
          <Table columns={appColumns} dataSource={applications} rowKey="id" loading={loadingApps} />
          <Modal open={showRejectModal} onCancel={() => setShowRejectModal(false)} title="Lý do từ chối" onOk={handleReject} okText="Từ chối">
            <Input.TextArea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Nhập lý do từ chối" />
          </Modal>
        </Tabs.TabPane>
        <Tabs.TabPane tab="CV đã duyệt & Lịch phỏng vấn" key="approved">
          <ApprovedTab />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Kết quả phỏng vấn" key="interview-result">
          <InterviewResultTab />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default RecruitmentManagement; 