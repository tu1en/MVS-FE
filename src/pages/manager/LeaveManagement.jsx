import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Tabs, 
  Button, 
  Table, 
  Tag, 
  Modal, 
  Input, 
  message, 
  Space,
  Descriptions,
  Tooltip,
  Row,
  Col,
  Statistic,
  Progress,
  Popconfirm
} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  InfoCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import absenceService from '../../services/absenceService';
import moment from 'moment';

const { TabPane } = Tabs;
const { TextArea } = Input;

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  
  // Modal states
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [employeeDetailModalVisible, setEmployeeDetailModalVisible] = useState(false);
  const [requestDetailModalVisible, setRequestDetailModalVisible] = useState(false);
  
  // Selected items
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // Processing state
  const [processing, setProcessing] = useState(false);

  // Fetch employees leave info
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await absenceService.getAllEmployeesLeaveInfo();
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error('Không thể tải danh sách nhân viên');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch leave requests
  const fetchLeaveRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const response = await absenceService.getAllAbsenceRequests();
      setLeaveRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      message.error('Không thể tải danh sách yêu cầu nghỉ phép');
      setLeaveRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'employees') {
      fetchEmployees();
    } else {
      fetchLeaveRequests();
    }
  }, [activeTab, fetchEmployees, fetchLeaveRequests]);

  // Handle approve request
  const handleApprove = async () => {
    if (!selectedRequestId) return;
    
    setProcessing(true);
    try {
      await absenceService.approveAbsenceRequest(selectedRequestId);
      message.success('Đã phê duyệt đơn nghỉ phép thành công');
      setApproveModalVisible(false);
      setSelectedRequestId(null);
      fetchLeaveRequests();
      fetchEmployees(); // Refresh employee data
    } catch (error) {
      console.error('Error approving request:', error);
      message.error(error.response?.data?.message || 'Không thể phê duyệt đơn nghỉ phép');
    } finally {
      setProcessing(false);
    }
  };

  // Handle reject request
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.error('Vui lòng nhập lý do từ chối');
      return;
    }
    
    setProcessing(true);
    try {
      await absenceService.rejectAbsenceRequest(selectedRequestId, rejectReason);
      message.success('Đã từ chối đơn nghỉ phép thành công');
      setRejectModalVisible(false);
      setSelectedRequestId(null);
      setRejectReason('');
      fetchLeaveRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      message.error(error.response?.data?.message || 'Không thể từ chối đơn nghỉ phép');
    } finally {
      setProcessing(false);
    }
  };

  // Show modals
  const showApproveModal = (e, requestId) => {
    e.stopPropagation();
    setSelectedRequestId(requestId);
    setApproveModalVisible(true);
  };

  const showRejectModal = (e, requestId) => {
    e.stopPropagation();
    setSelectedRequestId(requestId);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const showEmployeeDetailModal = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeDetailModalVisible(true);
  };

  const showRequestDetailModal = (request) => {
    setSelectedRequest(request);
    setRequestDetailModalVisible(true);
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

  // Calculate leave usage percentage
  const getLeaveUsagePercentage = (used, pending, total = 12) => {
    return Math.min(((used + pending) / total) * 100, 100);
  };

  // Get leave usage status color
  const getLeaveUsageColor = (used, pending, total = 12) => {
    const totalUsed = used + pending;
    if (totalUsed > total) return '#ff4d4f'; // Red for over limit
    if (totalUsed > total * 0.8) return '#faad14'; // Orange for warning
    return '#52c41a'; // Green for normal
  };

  // Employee columns
  const employeeColumns = [
    {
      title: 'Tên Nhân Viên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name, record) => (
        <Space>
          <UserOutlined />
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số ngày phép',
      key: 'remainingLeave',
      align: 'center',
      render: (_, record) => {
        const remaining = record.annualLeaveBalance;
        const color = remaining < 3 ? '#ff4d4f' : (remaining > 0 ? '#52c41a' : '#ff4d4f');
        return <span style={{ color }}>{Math.max(0, remaining)}</span>;
      },
    },
    {
      title: 'Chi Tiết',
      key: 'action',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            icon={<InfoCircleOutlined />}
            onClick={() => showEmployeeDetailModal(record)}
            size="small"
          />
        </Tooltip>
      ),
    },
  ];

  // Request columns
  const requestColumns = [
    {
      title: 'Nhân Viên',
      dataIndex: 'userFullName',
      key: 'userFullName',
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.userEmail}</div>
        </div>
      ),
    },
    {
      title: 'Thời Gian',
      key: 'duration',
      render: (_, record) => (
        <div>
          <div>{moment(record.startDate).format('DD/MM/YYYY')} - {moment(record.endDate).format('DD/MM/YYYY')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.numberOfDays} ngày</div>
        </div>
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
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<InfoCircleOutlined />}
              onClick={() => showRequestDetailModal(record)}
              size="small"
            />
          </Tooltip>
          {record.status === 'PENDING' && (
            <>
              <Tooltip title="Phê duyệt">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={(e) => showApproveModal(e, record.id)}
                  size="small"
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  type="primary"
                  danger
                  icon={<CloseOutlined />}
                  onClick={(e) => showRejectModal(e, record.id)}
                  size="small"
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const requestStats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(req => req.status === 'PENDING').length,
    approved: leaveRequests.filter(req => req.status === 'APPROVED').length,
    rejected: leaveRequests.filter(req => req.status === 'REJECTED').length,
  };

  const employeeStats = {
    total: employees.length,
    onLeave: employees.filter(emp => emp.pendingLeave > 0).length,
    overLimit: employees.filter(emp => emp.overLimitDays > 0).length,
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>Quản Lý Nghỉ Phép</h1>
      
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Danh Sách Nhân Viên" key="employees">
            {/* Employee Statistics */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Tổng Nhân Viên"
                    value={employeeStats.total}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Có Đơn Chờ Duyệt"
                    value={employeeStats.onLeave}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Vượt Phép"
                    value={employeeStats.overLimit}
                    prefix={<ExclamationCircleOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
            </Row>

            <Table
              columns={employeeColumns}
              dataSource={employees.map((emp) => ({ ...emp, key: emp.userId }))}
              loading={loading}
              rowKey="userId"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} nhân viên`,
              }}
            />
          </TabPane>

          <TabPane tab="Danh Sách Yêu Cầu" key="requests">
            {/* Request Statistics */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Tổng Yêu Cầu"
                    value={requestStats.total}
                    prefix={<CalendarOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Chờ Duyệt"
                    value={requestStats.pending}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Đã Duyệt"
                    value={requestStats.approved}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Đã Từ Chối"
                    value={requestStats.rejected}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
            </Row>

            <Table
              columns={requestColumns}
              dataSource={leaveRequests.map((req) => ({ ...req, key: req.id }))}
              loading={requestsLoading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Approve Modal */}
      <Modal
        title="Phê Duyệt Đơn Nghỉ Phép"
        open={approveModalVisible}
        onOk={handleApprove}
        onCancel={() => setApproveModalVisible(false)}
        okText="Phê Duyệt"
        cancelText="Hủy"
        confirmLoading={processing}
      >
        <p>Bạn có chắc chắn muốn phê duyệt đơn nghỉ phép này không?</p>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ Chối Đơn Nghỉ Phép"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
        }}
        okText="Từ Chối"
        cancelText="Hủy"
        confirmLoading={processing}
      >
        <div style={{ marginBottom: '16px' }}>
          <p>Vui lòng nhập lý do từ chối:</p>
          <TextArea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Lý do từ chối đơn nghỉ phép..."
            rows={4}
            maxLength={500}
            showCount
          />
        </div>
      </Modal>

      {/* Employee Detail Modal */}
      <Modal
        title="Chi Tiết Thông Tin Nhân Viên"
        open={employeeDetailModalVisible}
        onCancel={() => setEmployeeDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setEmployeeDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedEmployee && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Tên Nhân Viên" span={2}>
              {selectedEmployee.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedEmployee.email}
            </Descriptions.Item>
            <Descriptions.Item label="Số Điện Thoại">
              {selectedEmployee.phoneNumber || 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày Vào Làm">
              {selectedEmployee.hireDate ? moment(selectedEmployee.hireDate).format('DD/MM/YYYY') : 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng Phép Năm">
              12 ngày
            </Descriptions.Item>
            <Descriptions.Item label="Ngày Reset Phép">
              {selectedEmployee.leaveResetDate ? moment(selectedEmployee.leaveResetDate).format('DD/MM/YYYY') : 'Chưa xác định'}
            </Descriptions.Item>
            <Descriptions.Item label="Đã Sử Dụng">
              <span style={{ color: '#1890ff' }}>{selectedEmployee.usedLeave} ngày</span>
            </Descriptions.Item>
            <Descriptions.Item label="Chờ Duyệt">
              <span style={{ color: '#faad14' }}>{selectedEmployee.pendingLeave} ngày</span>
            </Descriptions.Item>
            <Descriptions.Item label="Còn Lại">
              <span style={{ color: selectedEmployee.annualLeaveBalance < 3 ? '#ff4d4f' : (selectedEmployee.annualLeaveBalance > 0 ? '#52c41a' : '#ff4d4f') }}>
                {Math.max(0, selectedEmployee.annualLeaveBalance)} ngày
              </span>
            </Descriptions.Item>
            {selectedEmployee.overLimitDays > 0 && (
              <Descriptions.Item label="Vượt Phép" span={2}>
                <span style={{ color: '#ff4d4f' }}>
                  {selectedEmployee.overLimitDays} ngày
                </span>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Request Detail Modal */}
      <Modal
        title="Chi Tiết Đơn Nghỉ Phép"
        open={requestDetailModalVisible}
        onCancel={() => setRequestDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setRequestDetailModalVisible(false)}>
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
            <Descriptions.Item label="Nhân Viên">
              {selectedRequest.userFullName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedRequest.userEmail}
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

export default LeaveManagement; 