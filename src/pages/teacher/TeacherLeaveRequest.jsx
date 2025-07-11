import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Tabs, 
  Button, 
  Table, 
  Tag, 
  Modal, 
  Form, 
  DatePicker, 
  InputNumber, 
  Input, 
  message, 
  Space,
  Descriptions,
  Tooltip,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  InfoCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import absenceService from '../../services/absenceService';
import moment from 'moment';

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

  // Calculate working days between two dates (excluding weekends)
  const calculateWorkingDays = (startDate, endDate) => {
    let count = 0;
    const start = moment(startDate);
    const end = moment(endDate);
    
    while (start.isSameOrBefore(end)) {
      if (start.day() !== 0 && start.day() !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      start.add(1, 'day');
    }
    return count;
  };

  // Handle date range change in form
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      const workingDays = calculateWorkingDays(dates[0], dates[1]);
      form.setFieldsValue({
        startDate: dates[0],
        endDate: dates[1],
        numberOfDays: workingDays
      });
    } else {
      form.setFieldsValue({
        startDate: null,
        endDate: null,
        numberOfDays: null
      });
    }
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
      title: 'Hành Động',
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
            <Descriptions.Item label="Mã Đơn" span={2}>
              #{selectedRequest.id}
            </Descriptions.Item>
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