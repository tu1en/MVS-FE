import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tooltip
} from 'antd';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import absenceService from '../../services/absenceService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const TeacherLeaveRequest = () => {
  const [form] = Form.useForm();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [dateRange, setDateRange] = useState(null); // Thêm state để theo dõi dateRange
  const [dateStrings, setDateStrings] = useState(null); // Thêm state để lưu date strings

  // Fetch leave requests
  const fetchLeaveRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await absenceService.getMyLeaveRequests();
      setLeaveRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      message.error('Không thể tải danh sách đơn nghỉ phép');
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  // Effect để tính toán số ngày nghỉ khi dateRange thay đổi
  useEffect(() => {
    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      // Sử dụng dateStrings nếu có, nếu không thì sử dụng moment objects
      let workingDays;
      if (dateStrings && dateStrings.length === 2) {
        console.log('Using dateStrings for calculation:', dateStrings);
        workingDays = calculateWorkingDaysFromStrings(dateStrings[0], dateStrings[1]);
      } else {
        workingDays = calculateWorkingDaysAlternative(dateRange[0], dateRange[1]);
      }
      console.log('useEffect: Setting numberOfDays to:', workingDays);
      form.setFieldsValue({
        startDate: dateRange[0],
        endDate: dateRange[1],
        numberOfDays: workingDays
      });
    }
  }, [dateRange, dateStrings, form]);

  // Calculate working days from string dates (DD/MM/YYYY format)
  const calculateWorkingDaysFromStrings = (startStr, endStr) => {
    console.log('Calculating from strings:', startStr, 'to', endStr);
    
    if (!startStr || !endStr) {
      console.log('Invalid string dates provided');
      return 0;
    }
    
    // Parse string dates (DD/MM/YYYY format)
    const start = moment(startStr, 'DD/MM/YYYY');
    const end = moment(endStr, 'DD/MM/YYYY');
    
    console.log('Parsed start:', start.format('YYYY-MM-DD'), 'Parsed end:', end.format('YYYY-MM-DD'));
    
    if (!start.isValid() || !end.isValid()) {
      console.log('Invalid date format');
      return 0;
    }
    
    // Tính tổng số ngày
    const totalDays = end.diff(start, 'days') + 1;
    console.log('Total days:', totalDays);
    
    let workingDays = 0;
    
    // Kiểm tra từng ngày
    for (let i = 0; i < totalDays; i++) {
      const currentDate = start.clone().add(i, 'days');
      const dayOfWeek = currentDate.day();
      console.log(`Day ${i + 1}:`, currentDate.format('YYYY-MM-DD'), 'Day of week:', dayOfWeek);
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
        console.log('Added working day, total now:', workingDays);
      } else {
        console.log('Skipped weekend day');
      }
    }
    
    console.log('Final working days count (from strings):', workingDays);
    return workingDays;
  };

  // Calculate working days between two dates (excluding weekends) - Alternative method
  const calculateWorkingDaysAlternative = (startDate, endDate) => {
    console.log('Alternative method - Calculating working days between:', startDate, 'and', endDate);
    
    if (!startDate || !endDate) {
      console.log('Invalid dates provided');
      return 0;
    }
    
    // Tạo moment objects mới từ string format để tránh vấn đề với object references
    const startStr = moment(startDate).format('YYYY-MM-DD');
    const endStr = moment(endDate).format('YYYY-MM-DD');
    
    const start = moment(startStr);
    const end = moment(endStr);
    
    console.log('Start string:', startStr, 'End string:', endStr);
    console.log('Start:', start.format('YYYY-MM-DD'), 'End:', end.format('YYYY-MM-DD'));
    
    // Tính tổng số ngày
    const totalDays = end.diff(start, 'days') + 1;
    console.log('Total days:', totalDays);
    
    let workingDays = 0;
    
    // Kiểm tra từng ngày
    for (let i = 0; i < totalDays; i++) {
      const currentDate = start.clone().add(i, 'days');
      const dayOfWeek = currentDate.day();
      console.log(`Day ${i + 1}:`, currentDate.format('YYYY-MM-DD'), 'Day of week:', dayOfWeek);
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
        console.log('Added working day, total now:', workingDays);
      } else {
        console.log('Skipped weekend day');
      }
    }
    
    console.log('Final working days count (alternative):', workingDays);
    return workingDays;
  };

  // Calculate working days between two dates (excluding weekends)
  const calculateWorkingDays = (startDate, endDate) => {
    console.log('Calculating working days between:', startDate, 'and', endDate);
    
    if (!startDate || !endDate) {
      console.log('Invalid dates provided');
      return 0;
    }
    
    let count = 0;
    
    // Chuyển đổi sang string format để tránh vấn đề với moment objects
    const startStr = moment(startDate).format('YYYY-MM-DD');
    const endStr = moment(endDate).format('YYYY-MM-DD');
    
    console.log('Start string:', startStr, 'End string:', endStr);
    
    // Tạo moment object cho ngày hiện tại
    let current = moment(startStr);
    const end = moment(endStr);
    
    console.log('Start moment:', current.format('YYYY-MM-DD'), 'End moment:', end.format('YYYY-MM-DD'));
    
    // Kiểm tra xem end có sau start không
    if (!current.isSameOrBefore(end)) {
      console.log('Start date is after end date');
      return 0;
    }
    
    while (current.isSameOrBefore(end)) {
      const dayOfWeek = current.day();
      const currentDateStr = current.format('YYYY-MM-DD');
      console.log('Checking date:', currentDateStr, 'Day of week:', dayOfWeek);
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
        console.log('Added working day, count now:', count);
      } else {
        console.log('Skipped weekend day');
      }
      current.add(1, 'day');
    }
    
    console.log('Final working days count:', count);
    return count;
  };

  // Handle date range change in form
  const handleDateRangeChange = (dates, dateStrings) => {
    console.log('Date range changed:', dates, dateStrings); // Debug log
    setDateRange(dates); // Cập nhật state - useEffect sẽ xử lý phần còn lại
    setDateStrings(dateStrings); // Lưu date strings
  };

  // Handle create leave request
  const handleCreateRequest = async (values) => {
    setSubmitting(true);
    try {
      const requestData = {
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        numberOfDays: values.numberOfDays,
        description: values.description
      };

      await absenceService.submitLeaveRequest(requestData);
      message.success('Đơn xin nghỉ phép đã được gửi thành công');
      setCreateModalVisible(false);
      form.resetFields();
      setDateRange(null); // Reset dateRange state
      setDateStrings(null); // Reset dateStrings state
      fetchLeaveRequests();
    } catch (error) {
      console.error('Error creating leave request:', error);
      message.error(error.response?.data?.message || 'Không thể gửi đơn xin nghỉ phép');
    } finally {
      setSubmitting(false);
    }
  };

  // Show details modal
  const showDetailModal = (record) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);
  };

  // Get status badge
  const getStatusBadge = (status, resultStatus, isOverLimit) => {
    if (status === 'APPROVED') {
      return <Tag color="green">Đã Duyệt</Tag>;
    }
    if (status === 'REJECTED') {
      return <Tag color="red">Đã Từ Chối</Tag>;
    }
    if (status === 'PENDING') {
      if (isOverLimit) {
        return <Tag color="orange">Chờ Duyệt (Vượt Phép)</Tag>;
      }
      return <Tag color="blue">Chờ Duyệt</Tag>;
    }
    return <Tag>{status}</Tag>;
  };

  // Calculate leave statistics
  const leaveStats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(req => req.status === 'PENDING').length,
    approved: leaveRequests.filter(req => req.status === 'APPROVED').length,
    rejected: leaveRequests.filter(req => req.status === 'REJECTED').length,
    totalDaysUsed: leaveRequests
      .filter(req => req.status === 'APPROVED')
      .reduce((sum, req) => sum + req.numberOfDays, 0)
  };

  const columns = [
    {
      title: 'Ngày Bắt Đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.startDate).unix() - moment(b.startDate).unix(),
    },
    {
      title: 'Ngày Kết Thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Số Ngày',
      dataIndex: 'numberOfDays',
      key: 'numberOfDays',
      align: 'center',
      render: (days, record) => (
        <span style={{ color: record.isOverLimit ? '#ff4d4f' : 'inherit' }}>
          {days} {record.isOverLimit && <Tooltip title="Vượt quá số ngày nghỉ phép cho phép"><InfoCircleOutlined style={{ color: '#ff4d4f' }} /></Tooltip>}
        </span>
      ),
    },
    {
      title: 'Lý Do',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          {text && text.length > 50 ? `${text.substring(0, 50)}...` : text}
        </Tooltip>
      ),
    },
    {
      title: 'Ngày Gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => getStatusBadge(status, record.resultStatus, record.isOverLimit),
      filters: [
        { text: 'Chờ Duyệt', value: 'PENDING' },
        { text: 'Đã Duyệt', value: 'APPROVED' },
        { text: 'Đã Từ Chối', value: 'REJECTED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Chi Tiết',
      key: 'action',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            icon={<InfoCircleOutlined />}
            onClick={() => showDetailModal(record)}
            size="small"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Quản Lý Nghỉ Phép</h1>
      
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng Đơn"
              value={leaveStats.total}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chờ Duyệt"
              value={leaveStats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã Duyệt"
              value={leaveStats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Ngày Đã Sử Dụng"
              value={leaveStats.totalDaysUsed}
              suffix="/ 12"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: leaveStats.totalDaysUsed > 12 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Danh Sách Đơn Nghỉ Phép</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Tạo Đơn Mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={leaveRequests.map((req) => ({ ...req, key: req.id }))}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn`,
          }}
        />
      </Card>

      {/* Create Leave Request Modal */}
      <Modal
        title="Tạo Đơn Xin Nghỉ Phép"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
          setDateRange(null); // Reset dateRange state
          setDateStrings(null); // Reset dateStrings state
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateRequest}
        >
          <Form.Item
            name="dateRange"
            label="Thời Gian Nghỉ"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian nghỉ' }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
              onChange={handleDateRangeChange}
              value={dateRange}
              disabledDate={(current) => current && current < moment().startOf('day')}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Ngày Bắt Đầu"
                style={{ display: 'none' }}
              >
                <DatePicker style={{ width: '100%' }} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="Ngày Kết Thúc"
                style={{ display: 'none' }}
              >
                <DatePicker style={{ width: '100%' }} disabled />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="numberOfDays"
            label="Số Ngày Nghỉ (không tính cuối tuần)"
            rules={[
              { required: true, message: 'Vui lòng nhập số ngày nghỉ' },
              { type: 'number', min: 1, message: 'Số ngày phải lớn hơn 0' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Số ngày nghỉ"
              min={1}
              disabled
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Lý Do Nghỉ Phép"
            rules={[
              { required: true, message: 'Vui lòng nhập lý do nghỉ phép' },
              { min: 10, message: 'Lý do phải có ít nhất 10 ký tự' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Mô tả chi tiết lý do nghỉ phép..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
                setDateRange(null); // Reset dateRange state
                setDateStrings(null); // Reset dateStrings state
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Gửi Đơn
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi Tiết Đơn Nghỉ Phép"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedRequest && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Ngày Bắt Đầu">
              {moment(selectedRequest.startDate).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày Kết Thúc">
              {moment(selectedRequest.endDate).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Số Ngày Nghỉ">
              <span style={{ color: selectedRequest.isOverLimit ? '#ff4d4f' : 'inherit' }}>
                {selectedRequest.numberOfDays} ngày
                {selectedRequest.isOverLimit && <span style={{ color: '#ff4d4f' }}> (Vượt phép)</span>}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng Thái">
              {getStatusBadge(selectedRequest.status, selectedRequest.resultStatus, selectedRequest.isOverLimit)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày Gửi Đơn">
              {moment(selectedRequest.createdAt).format('DD/MM/YYYY HH:mm:ss')}
            </Descriptions.Item>
            {selectedRequest.processedAt && (
              <Descriptions.Item label="Ngày Xử Lý">
                {moment(selectedRequest.processedAt).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Lý Do Nghỉ Phép" span={2}>
              {selectedRequest.description}
            </Descriptions.Item>
            {selectedRequest.rejectReason && (
              <Descriptions.Item label="Lý Do Từ Chối" span={2}>
                <span style={{ color: '#ff4d4f' }}>{selectedRequest.rejectReason}</span>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default TeacherLeaveRequest; 