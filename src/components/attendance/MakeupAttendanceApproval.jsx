import {
  BookOutlined,
  CalendarOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import makeupAttendanceService from '../../services/makeupAttendanceService';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { confirm } = Modal;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * Component for managers to approve/reject makeup attendance requests
 */
const MakeupAttendanceApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({});
  const [acknowledgeModalVisible, setAcknowledgeModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [acknowledgeForm] = Form.useForm();

  // Filter and search states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING'); // Default to pending requests
  const [dateRange, setDateRange] = useState(null);
  const [sortField, setSortField] = useState('requestedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load data on component mount
  useEffect(() => {
    loadPendingRequests();
    loadStatistics();
  }, []);

  const loadPendingRequests = async () => {
    setLoading(true);
    try {
      // Load all requests for filtering
      const data = await makeupAttendanceService.getAllRequestsForManager();
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
      message.error('Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort requests
  const filteredAndSortedRequests = () => {
    let filtered = requests.filter(request => {
      // Search filter
      const matchesSearch = !searchText ||
        request.teacherName?.toLowerCase().includes(searchText.toLowerCase()) ||
        request.lectureTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
        request.classroomName?.toLowerCase().includes(searchText.toLowerCase()) ||
        request.reason?.toLowerCase().includes(searchText.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

      // Date range filter
      const matchesDateRange = !dateRange ||
        (moment(request.requestedAt).isSameOrAfter(dateRange[0], 'day') &&
         moment(request.requestedAt).isSameOrBefore(dateRange[1], 'day'));

      return matchesSearch && matchesStatus && matchesDateRange;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'requestedAt' || sortField === 'lectureDate') {
        aValue = moment(aValue);
        bValue = moment(bValue);
        return sortOrder === 'asc' ? aValue.diff(bValue) : bValue.diff(aValue);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchText('');
    setStatusFilter('PENDING');
    setDateRange(null);
    setSortField('requestedAt');
    setSortOrder('desc');
  };

  const loadStatistics = async () => {
    try {
      const stats = await makeupAttendanceService.getOverallStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleAcknowledge = (request) => {
    setSelectedRequest(request);
    setAcknowledgeModalVisible(true);
  };

  const handleQuickAcknowledge = (request) => {
    confirm({
      title: 'Xác nhận điểm danh bù',
      content: `Bạn xác nhận rằng giáo viên ${request.teacherName} đã không thực hiện điểm danh cho buổi học này?`,
      icon: <CheckOutlined style={{ color: '#52c41a' }} />,
      okText: 'Xác nhận',
      cancelText: 'Hủy bỏ',
      onOk: async () => {
        try {
          await makeupAttendanceService.acknowledgeRequest(request.id, '');
          message.success('Đã xác nhận yêu cầu thành công');
          loadPendingRequests();
          loadStatistics();
        } catch (error) {
          console.error('Error acknowledging request:', error);
          const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xác nhận';
          message.error(errorMessage);
        }
      }
    });
  };

  const handleAcknowledgeSubmit = async (values) => {
    try {
      await makeupAttendanceService.acknowledgeRequest(selectedRequest.id, values.managerNotes || '');
      message.success('Đã xác nhận yêu cầu');
      setAcknowledgeModalVisible(false);
      acknowledgeForm.resetFields();
      setSelectedRequest(null);
      loadPendingRequests();
      loadStatistics();
    } catch (error) {
      console.error('Error acknowledging request:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xác nhận';
      message.error(errorMessage);
    }
  };

  const handleAcknowledgeCancel = () => {
    setAcknowledgeModalVisible(false);
    acknowledgeForm.resetFields();
    setSelectedRequest(null);
  };

  const columns = [
    {
      title: 'Giáo viên',
      dataIndex: 'teacherName',
      key: 'teacherName',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.teacherEmail}
          </Text>
        </Space>
      ),
      width: 180,
      sorter: (a, b) => a.teacherName.localeCompare(b.teacherName),
      sortDirections: ['ascend', 'descend']
    },
    {
      title: 'Buổi học',
      key: 'lecture',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.lectureTitle}</Text>
          <Space size={4}>
            <CalendarOutlined style={{ color: '#1890ff' }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.lectureDate} {record.lectureTime}
            </Text>
          </Space>
        </Space>
      ),
      width: 200,
      sorter: (a, b) => a.lectureTitle.localeCompare(b.lectureTitle),
      sortDirections: ['ascend', 'descend']
    },
    {
      title: 'Lớp học',
      dataIndex: 'classroomName',
      key: 'classroomName',
      render: (text) => (
        <Space>
          <BookOutlined style={{ color: '#722ed1' }} />
          <Text>{text}</Text>
        </Space>
      ),
      width: 120,
      sorter: (a, b) => a.classroomName.localeCompare(b.classroomName),
      sortDirections: ['ascend', 'descend']
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      render: (text) => (
        <Tooltip title={text} placement="topLeft">
          <Text ellipsis style={{ maxWidth: 200, display: 'block' }}>
            {text}
          </Text>
        </Tooltip>
      ),
      width: 250
    },
    {
      title: 'Thời gian yêu cầu',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      render: (date) => (
        <Space direction="vertical" size={0}>
          <Text>{moment(date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {moment(date).format('HH:mm:ss')}
          </Text>
        </Space>
      ),
      width: 120,
      sorter: (a, b) => moment(a.requestedAt).unix() - moment(b.requestedAt).unix()
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Tag color={record.statusColor} icon={<ClockCircleOutlined />}>
          {record.statusDisplayName}
        </Tag>
      ),
      width: 100,
      sorter: (a, b) => a.status.localeCompare(b.status),
      sortDirections: ['ascend', 'descend']
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xác nhận nhanh">
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleQuickAcknowledge(record)}
            />
          </Tooltip>
          <Tooltip title="Xác nhận với ghi chú">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleAcknowledge(record)}
            />
          </Tooltip>
        </Space>
      ),
      width: 120,
      fixed: 'right'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <ClockCircleOutlined style={{ color: '#ff7a00', marginRight: 8 }} />
        Quản lý yêu cầu điểm danh bù
      </Title>

      {/* Statistics Cards */}
      {/* <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Chờ xác nhận"
              value={statistics.pending || 0}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Đã xác nhận"
              value={statistics.acknowledged || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={statistics.completed || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<EyeOutlined />}
            />
          </Card>
        </Col>
      </Row> */}

      {/* Filters */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={6}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              <SearchOutlined /> Tìm kiếm:
            </label>
            <Search
              placeholder="Tìm theo tên giáo viên, buổi học, lớp học..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          <Col span={6}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              <FilterOutlined /> Trạng thái:
            </label>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              placeholder="Chọn trạng thái"
            >
              <Option value="all">Tất cả</Option>
              <Option value="PENDING">Chờ xác nhận</Option>
              <Option value="ACKNOWLEDGED">Đã xác nhận</Option>
              <Option value="COMPLETED">Hoàn thành</Option>
            </Select>
          </Col>
          <Col span={6}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              <CalendarOutlined /> Khoảng thời gian:
            </label>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Col>
          <Col span={6}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Sắp xếp:
            </label>
            <Space style={{ width: '100%' }}>
              <Select
                value={sortField}
                onChange={setSortField}
                style={{ width: '200px' }}
              >
                <Option value="requestedAt">Thời gian yêu cầu</Option>
                <Option value="teacherName">Tên giáo viên</Option>
                <Option value="lectureTitle">Buổi học</Option>
                <Option value="lectureDate">Ngày học</Option>
              </Select>
              <Select
                value={sortOrder}
                onChange={setSortOrder}
                style={{ width: '80px' }}
              >
                <Option value="asc">Tăng</Option>
                <Option value="desc">Giảm</Option>
              </Select>
            </Space>
          </Col>
        </Row>
        <Row style={{ marginTop: 16 }}>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={handleResetFilters}
              >
                Đặt lại bộ lọc
              </Button>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={loadPendingRequests}
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Requests Table */}
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            Danh sách yêu cầu ({filteredAndSortedRequests().length}/{requests.length})
          </Title>
        </div>

        <Table
          columns={columns}
          dataSource={filteredAndSortedRequests()}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Acknowledge Modal */}
      <Modal
        title={
          <Space>
            <CheckOutlined style={{ color: '#52c41a' }} />
            <span>Xác nhận yêu cầu điểm danh bù</span>
          </Space>
        }
        open={acknowledgeModalVisible}
        onCancel={handleAcknowledgeCancel}
        footer={null}
        width={600}
      >
        {selectedRequest && (
          <>
            <div style={{
              background: '#f6ffed',
              padding: '16px',
              borderRadius: '6px',
              marginBottom: '20px',
              border: '1px solid #b7eb8f'
            }}>
              <Title level={5} style={{ margin: 0, marginBottom: 8, color: '#389e0d' }}>
                Thông tin yêu cầu
              </Title>
              
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <div>
                  <Text strong>Giáo viên: </Text>
                  <Text>{selectedRequest.teacherName}</Text>
                </div>
                
                <div>
                  <Text strong>Buổi học: </Text>
                  <Text>{selectedRequest.lectureTitle}</Text>
                </div>
                
                <div>
                  <Text strong>Lý do: </Text>
                  <Text>{selectedRequest.reason}</Text>
                </div>
              </Space>
            </div>

            <Form
              form={acknowledgeForm}
              layout="vertical"
              onFinish={handleAcknowledgeSubmit}
            >
              <Form.Item
                name="managerNotes"
                label={
                  <span>
                    <Text strong>Ghi chú của Manager</Text>
                    <Text type="secondary"> (Tùy chọn)</Text>
                  </span>
                }
                rules={[
                  { max: 1000, message: 'Ghi chú không được vượt quá 1000 ký tự!' }
                ]}
                extra="Bạn có thể thêm ghi chú về việc xác nhận này (không bắt buộc)."
              >
                <TextArea
                  rows={4}
                  placeholder="Ví dụ: Đã xác nhận với giáo viên. Lần tới cần chú ý thực hiện điểm danh đúng thời hạn."
                  showCount
                  maxLength={1000}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button onClick={handleAcknowledgeCancel}>
                    Hủy bỏ
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<CheckOutlined />}
                  >
                    Xác nhận yêu cầu
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default MakeupAttendanceApproval;
