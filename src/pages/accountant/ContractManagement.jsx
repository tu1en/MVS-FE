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
  Select,
  Upload,
  message, 
  Space,
  Descriptions,
  Tooltip,
  Row,
  Col,
  Statistic,
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  InfoCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  UploadOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import moment from 'moment';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const ContractManagement = () => {
  const [form] = Form.useForm();
  const [terminateForm] = Form.useForm();
  const [contracts, setContracts] = useState([]);
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [terminateModalVisible, setTerminateModalVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Fetch contracts
  const fetchContracts = useCallback(async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const response = await api.get('/contracts', {
        params: {
          page: page - 1,
          size: size,
          sortBy: 'createdAt',
          sortDir: 'desc'
        }
      });
      
      if (response.data && response.data.content) {
        setContracts(response.data.content);
        setPagination({
          current: page,
          pageSize: size,
          total: response.data.totalElements
        });
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      message.error('Không thể tải danh sách hợp đồng');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch users for dropdown
  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/admin/users');
      if (response.data && response.data.content) {
        setUsers(response.data.content);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Không thể tải danh sách người dùng');
    }
  }, []);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await api.get('/contracts/statistics');
      setStatistics(response.data || {});
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
    fetchUsers();
    fetchStatistics();
  }, [fetchContracts, fetchUsers, fetchStatistics]);

  // Handle create contract
  const handleCreateContract = async (values) => {
    setSubmitting(true);
    try {
      const contractData = {
        userId: values.userId,
        fullName: values.fullName,
        contractType: values.contractType,
        position: values.position,
        department: values.department,
        salary: values.salary,
        workingHours: values.workingHours,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        status: values.status,
        createdBy: values.createdBy,
        attachmentPath: values.attachmentPath?.fileList?.[0]?.name || null,
        notes: values.notes
      };

      await api.post('/contracts', contractData);
      message.success('Tạo hợp đồng thành công');
      setCreateModalVisible(false);
      form.resetFields();
      fetchContracts();
      fetchStatistics();
    } catch (error) {
      console.error('Error creating contract:', error);
      message.error(error.response?.data?.error || 'Không thể tạo hợp đồng');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle terminate contract
  const handleTerminateContract = async (values) => {
    setSubmitting(true);
    try {
      const terminationData = {
        terminationReason: values.terminationReason,
        terminationDate: values.terminationDate ? values.terminationDate.format('YYYY-MM-DD') : null,
        whoApproved: values.whoApproved,
        settlementInfo: values.settlementInfo
      };
      
      await api.put(`/contracts/${selectedContract.id}/terminate`, terminationData);
      message.success('Chấm dứt hợp đồng thành công');
      setTerminateModalVisible(false);
      terminateForm.resetFields();
      setSelectedContract(null);
      fetchContracts();
      fetchStatistics();
    } catch (error) {
      console.error('Error terminating contract:', error);
      message.error(error.response?.data?.error || 'Không thể chấm dứt hợp đồng');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete contract
  const handleDeleteContract = async (contractId) => {
    try {
      await api.delete(`/contracts/${contractId}`);
      message.success('Xóa hợp đồng thành công');
      fetchContracts();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting contract:', error);
      message.error(error.response?.data?.error || 'Không thể xóa hợp đồng');
    }
  };

  // Show contract details
  const showContractDetails = (contract) => {
    setSelectedContract(contract);
    setDetailModalVisible(true);
  };

  // Show terminate modal
  const showTerminateModal = (contract) => {
    setSelectedContract(contract);
    setTerminateModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.userEmail}</div>
        </div>
      ),
    },
    {
      title: 'Loại hợp đồng',
      dataIndex: 'contractType',
      key: 'contractType',
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Lương',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary) => `${salary?.toLocaleString()} VND`,
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => date ? moment(date).format('DD/MM/YYYY') : 'Không xác định',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          'ACTIVE': { color: 'green', text: 'Đang hoạt động' },
          'TERMINATED': { color: 'red', text: 'Đã chấm dứt' },
          'EXPIRED': { color: 'orange', text: 'Đã hết hạn' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="link" 
              icon={<InfoCircleOutlined />} 
              onClick={() => showContractDetails(record)}
            />
          </Tooltip>
          {record.status === 'ACTIVE' && (
            <Tooltip title="Chấm dứt hợp đồng">
              <Button 
                type="link" 
                danger
                icon={<StopOutlined />} 
                onClick={() => showTerminateModal(record)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa hợp đồng này?"
            onConfirm={() => handleDeleteContract(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa hợp đồng">
              <Button 
                type="link" 
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số hợp đồng"
              value={statistics.totalContracts || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hợp đồng đang hoạt động"
              value={statistics.activeContracts || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hợp đồng đã chấm dứt"
              value={statistics.terminatedContracts || 0}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sắp hết hạn (30 ngày)"
              value={statistics.contractsExpiringSoon || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Quản lý hợp đồng lao động">
        <div style={{ marginBottom: '16px' }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Tạo hợp đồng mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={contracts}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} hợp đồng`,
            onChange: (page, pageSize) => {
              fetchContracts(page, pageSize);
            },
            onShowSizeChange: (current, size) => {
              fetchContracts(1, size);
            }
          }}
        />
      </Card>

      {/* Create Contract Modal */}
      <Modal
        title="Tạo hợp đồng mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateContract}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="userId"
                label="Nhân viên"
                rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
              >
                <Select
                  placeholder="Chọn nhân viên"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.fullName} ({user.email})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Tên nhân viên (tùy chọn)"
              >
                <Input placeholder="Nhập tên nhân viên để hiển thị nhanh" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contractType"
                label="Loại hợp đồng"
                rules={[{ required: true, message: 'Vui lòng chọn loại hợp đồng' }]}
              >
                <Select placeholder="Chọn loại hợp đồng">
                  <Option value="Thử việc">Thử việc</Option>
                  <Option value="Chính thức">Chính thức</Option>
                  <Option value="Thời vụ">Thời vụ</Option>
                  <Option value="Bán thời gian">Bán thời gian</Option>
                  <Option value="Hợp đồng có thời hạn">Hợp đồng có thời hạn</Option>
                  <Option value="Hợp đồng không thời hạn">Hợp đồng không thời hạn</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                initialValue="ACTIVE"
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="ACTIVE">Đang hoạt động</Option>
                  <Option value="PENDING">Chờ duyệt</Option>
                  <Option value="TERMINATED">Đã chấm dứt</Option>
                  <Option value="EXPIRED">Hết hạn</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="position"
                label="Vị trí"
                rules={[{ required: true, message: 'Vui lòng nhập vị trí' }]}
              >
                <Input placeholder="Nhập vị trí công việc" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Phòng ban"
              >
                <Input placeholder="Nhập phòng ban" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="salary"
                label="Lương (VND)"
                rules={[{ required: true, message: 'Vui lòng nhập lương' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập mức lương"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="workingHours"
                label="Thời gian làm việc"
                initialValue="Full-time, 8h/ngày"
              >
                <Input placeholder="VD: Full-time, 8h/ngày" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="endDate"
                label="Ngày kết thúc (tùy chọn)"
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="createdBy"
                label="Người tạo/Duyệt"
              >
                <Input placeholder="Nhập tên người tạo hoặc duyệt hợp đồng" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="attachmentPath"
            label="Tệp đính kèm"
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept=".pdf,.doc,.docx"
            >
              <Button icon={<UploadOutlined />}>Tải lên tệp hợp đồng (PDF, DOC, DOCX)</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea rows={4} placeholder="Nhập ghi chú (tùy chọn)" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Tạo hợp đồng
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Contract Details Modal */}
      <Modal
        title="Chi tiết hợp đồng"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedContract(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetailModalVisible(false);
            setSelectedContract(null);
          }}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedContract && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Nhân viên" span={2}>
              {selectedContract.userName} ({selectedContract.userEmail})
            </Descriptions.Item>
            <Descriptions.Item label="Loại hợp đồng">
              {selectedContract.contractType}
            </Descriptions.Item>
            <Descriptions.Item label="Vị trí">
              {selectedContract.position}
            </Descriptions.Item>
            <Descriptions.Item label="Phòng ban">
              {selectedContract.department || 'Không xác định'}
            </Descriptions.Item>
            <Descriptions.Item label="Lương">
              {selectedContract.salary?.toLocaleString()} VND
            </Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">
              {moment(selectedContract.startDate).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày kết thúc">
              {selectedContract.endDate ? moment(selectedContract.endDate).format('DD/MM/YYYY') : 'Không xác định'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={selectedContract.status === 'ACTIVE' ? 'green' : 'red'}>
                {selectedContract.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã chấm dứt'}
              </Tag>
            </Descriptions.Item>
            {selectedContract.terminationReason && (
              <Descriptions.Item label="Lý do chấm dứt" span={2}>
                {selectedContract.terminationReason}
              </Descriptions.Item>
            )}
            {selectedContract.terminationDate && (
              <Descriptions.Item label="Ngày chấm dứt">
                {moment(selectedContract.terminationDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
            )}
            {selectedContract.whoApproved && (
              <Descriptions.Item label="Người duyệt chấm dứt">
                {selectedContract.whoApproved}
              </Descriptions.Item>
            )}
            {selectedContract.settlementInfo && (
              <Descriptions.Item label="Thông tin quyết toán" span={2}>
                {selectedContract.settlementInfo}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Ngày tạo">
              {moment(selectedContract.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              {selectedContract.createdBy}
            </Descriptions.Item>
            {selectedContract.notes && (
              <Descriptions.Item label="Ghi chú" span={2}>
                {selectedContract.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Terminate Contract Modal */}
      <Modal
        title="Chấm dứt hợp đồng"
        open={terminateModalVisible}
        onCancel={() => {
          setTerminateModalVisible(false);
          terminateForm.resetFields();
          setSelectedContract(null);
        }}
        footer={null}
      >
        <Form
          form={terminateForm}
          layout="vertical"
          onFinish={handleTerminateContract}
          initialValues={{
            terminationDate: moment()
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="terminationDate"
                label="Ngày chấm dứt"
                rules={[{ required: true, message: 'Vui lòng chọn ngày chấm dứt' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="whoApproved"
                label="Người duyệt"
                rules={[{ required: true, message: 'Vui lòng nhập người duyệt' }]}
              >
                <Input placeholder="Nhập tên người duyệt việc chấm dứt" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="terminationReason"
            label="Lý do chấm dứt"
            rules={[{ required: true, message: 'Vui lòng chọn lý do chấm dứt' }]}
          >
            <Select placeholder="Chọn lý do chấm dứt">
              <Option value="Tự xin nghỉ việc">Tự xin nghỉ việc</Option>
              <Option value="Hết hạn hợp đồng">Hết hạn hợp đồng</Option>
              <Option value="Vi phạm nội quy">Vi phạm nội quy</Option>
              <Option value="Không đạt yêu cầu công việc">Không đạt yêu cầu công việc</Option>
              <Option value="Cắt giảm nhân sự">Cắt giảm nhân sự</Option>
              <Option value="Lý do khác">Lý do khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="settlementInfo"
            label="Thông tin quyết toán (tùy chọn)"
          >
            <TextArea 
              rows={3} 
              placeholder="Nhập thông tin quyết toán cuối cùng (lương, bảo hiểm, phụ cấp...)" 
            />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => {
                setTerminateModalVisible(false);
                terminateForm.resetFields();
                setSelectedContract(null);
              }}>
                Hủy
              </Button>
              <Button type="primary" danger htmlType="submit" loading={submitting}>
                Chấm dứt hợp đồng
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContractManagement;
