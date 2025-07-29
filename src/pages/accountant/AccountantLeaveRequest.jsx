import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
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
  Statistic,
  Table,
  Tabs,
  Tag,
  Tooltip
} from 'antd';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const AccountantLeaveRequest = () => {
  const [form] = Form.useForm();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [dateStrings, setDateStrings] = useState(null);

  // Fetch leave requests
  const fetchLeaveRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/accountant/absences');
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

  useEffect(() => {
    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      let workingDays;
      if (dateStrings && dateStrings.length === 2) {
        workingDays = calculateWorkingDaysFromStrings(dateStrings[0], dateStrings[1]);
      } else {
        workingDays = calculateWorkingDaysAlternative(dateRange[0], dateRange[1]);
      }
      form.setFieldsValue({
        startDate: dateRange[0],
        endDate: dateRange[1],
        numberOfDays: workingDays
      });
    }
  }, [dateRange, dateStrings, form]);

  const calculateWorkingDaysFromStrings = (startStr, endStr) => {
    if (!startStr || !endStr) return 0;
    const start = moment(startStr, 'DD/MM/YYYY');
    const end = moment(endStr, 'DD/MM/YYYY');
    if (!start.isValid() || !end.isValid()) return 0;
    const totalDays = end.diff(start, 'days') + 1;
    let workingDays = 0;
    for (let i = 0; i < totalDays; i++) {
      const currentDate = start.clone().add(i, 'days');
      const dayOfWeek = currentDate.day();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
    }
    return workingDays;
  };

  const calculateWorkingDaysAlternative = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const startStr = moment(startDate).format('YYYY-MM-DD');
    const endStr = moment(endDate).format('YYYY-MM-DD');
    const start = moment(startStr);
    const end = moment(endStr);
    const totalDays = end.diff(start, 'days') + 1;
    let workingDays = 0;
    for (let i = 0; i < totalDays; i++) {
      const currentDate = start.clone().add(i, 'days');
      const dayOfWeek = currentDate.day();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
    }
    return workingDays;
  };

  const handleDateRangeChange = (dates, dateStrings) => {
    setDateRange(dates);
    setDateStrings(dateStrings);
  };

  const handleCreateRequest = async (values) => {
    setSubmitting(true);
    try {
      const requestData = {
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        numberOfDays: values.numberOfDays,
        description: values.description
      };
      await api.post('/accountant/absences', requestData);
      message.success('Đơn xin nghỉ phép đã được gửi thành công');
      setCreateModalVisible(false);
      form.resetFields();
      setDateRange(null);
      setDateStrings(null);
      fetchLeaveRequests();
    } catch (error) {
      console.error('Error creating leave request:', error);
      message.error(error.response?.data?.message || 'Không thể gửi đơn xin nghỉ phép');
    } finally {
      setSubmitting(false);
    }
  };

  const showDetailModal = (record) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);
  };

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
      align: 'center',
    },
    {
      title: 'Chi Tiết',
      key: 'action',
      render: (_, record) => (
        <Button icon={<InfoCircleOutlined />} onClick={() => showDetailModal(record)} size="small" />
      ),
      align: 'center',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1>Quản Lý Nghỉ Phép (Kế Toán)</h1>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}><Statistic title="Tổng Đơn" value={leaveStats.total} prefix={<CalendarOutlined />} /></Col>
          <Col span={6}><Statistic title="Chờ Duyệt" value={leaveStats.pending} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#1890ff' }} /></Col>
          <Col span={6}><Statistic title="Đã Duyệt" value={leaveStats.approved} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Col>
          <Col span={6}><Statistic title="Từ Chối" value={leaveStats.rejected} prefix={<CloseCircleOutlined />} valueStyle={{ color: '#ff4d4f' }} /></Col>
        </Row>
      </Card>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)} style={{ marginBottom: 16 }}>
        Tạo Đơn Nghỉ Phép
      </Button>
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
      <Modal
        title="Tạo Đơn Xin Nghỉ Phép"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
          setDateRange(null);
          setDateStrings(null);
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
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              Gửi Đơn Nghỉ Phép
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Chi Tiết Đơn Nghỉ Phép"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedRequest && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Ngày Bắt Đầu">{moment(selectedRequest.startDate).format('DD/MM/YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Ngày Kết Thúc">{moment(selectedRequest.endDate).format('DD/MM/YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Số Ngày">{selectedRequest.numberOfDays}</Descriptions.Item>
            <Descriptions.Item label="Lý Do">{selectedRequest.description}</Descriptions.Item>
            <Descriptions.Item label="Trạng Thái">{getStatusBadge(selectedRequest.status, selectedRequest.resultStatus, selectedRequest.isOverLimit)}</Descriptions.Item>
            {selectedRequest.rejectReason && (
              <Descriptions.Item label="Lý Do Từ Chối">{selectedRequest.rejectReason}</Descriptions.Item>
            )}
            <Descriptions.Item label="Ngày Gửi">{moment(selectedRequest.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AccountantLeaveRequest; 