import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Table, 
  Button, 
  Space, 
  message, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber,
  Tag,
  Popconfirm,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import axiosInstance from '../../config/axiosInstance';
import moment from 'moment';
import './ContractManagement.css';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const ContractManagement = () => {
  const [teacherContracts, setTeacherContracts] = useState([]);
  const [staffContracts, setStaffContracts] = useState([]);
  const [candidatesReady, setCandidatesReady] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [candidateModalVisible, setCandidateModalVisible] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [form] = Form.useForm();
  const [candidateForm] = Form.useForm();

  // Fetch data khi component mount
  useEffect(() => {
    fetchContracts();
    fetchCandidatesReady();
  }, []);

  // Lấy danh sách hợp đồng theo loại
  const fetchContracts = async () => {
    setLoading(true);
    try {
      const [teacherResponse, staffResponse] = await Promise.all([
        axiosInstance.get('/contracts/type/TEACHER'),
        axiosInstance.get('/contracts/type/STAFF')
      ]);
      
      setTeacherContracts(teacherResponse.data);
      setStaffContracts(staffResponse.data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      message.error('Không thể tải danh sách hợp đồng!');
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách ứng viên đã đỗ phỏng vấn
  const fetchCandidatesReady = async () => {
    try {
      const response = await axiosInstance.get('/contracts/candidates/ready');
      setCandidatesReady(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      message.error('Không thể tải danh sách ứng viên đã đỗ!');
    }
  };

  // Xử lý tạo hợp đồng mới
  const handleCreateContract = async (values) => {
    try {
      const contractData = {
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        status: 'ACTIVE',
        createdBy: 'Accountant'
      };

      await axiosInstance.post('/contracts', contractData);
      message.success('Tạo hợp đồng thành công!');
      setModalVisible(false);
      setCandidateModalVisible(false);
      form.resetFields();
      candidateForm.resetFields();
      fetchContracts();
      fetchCandidatesReady();
    } catch (error) {
      console.error('Error creating contract:', error);
      message.error('Không thể tạo hợp đồng!');
    }
  };

  // Xử lý cập nhật hợp đồng
  const handleUpdateContract = async (values) => {
    try {
      const contractData = {
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null
      };

      await axiosInstance.put(`/contracts/${editingContract.id}`, contractData);
      message.success('Cập nhật hợp đồng thành công!');
      setModalVisible(false);
      setEditingContract(null);
      form.resetFields();
      fetchContracts();
    } catch (error) {
      console.error('Error updating contract:', error);
      message.error('Không thể cập nhật hợp đồng!');
    }
  };

  // Xử lý xóa hợp đồng
  const handleDeleteContract = async (id) => {
    try {
      await axiosInstance.delete(`/contracts/${id}`);
      message.success('Xóa hợp đồng thành công!');
      fetchContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      message.error('Không thể xóa hợp đồng!');
    }
  };

  // Mở modal tạo hợp đồng từ ứng viên đã đỗ
  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    candidateForm.setFieldsValue({
      userId: candidate.userId || '',
      fullName: candidate.fullName || '',
      email: candidate.email || '',
      phoneNumber: candidate.phoneNumber || '',
      contractType: candidate.contractType || 'TEACHER',
      position: candidate.position || '',
      department: '',
      salary: candidate.salary || 0,
      workingHours: '8',
      startDate: '',
      endDate: '',
      status: 'ACTIVE',
      contractTerms: ''
    });
    setCandidateModalVisible(true);
  };

  // Mở modal chỉnh sửa hợp đồng
  const handleEditContract = (contract) => {
    setEditingContract(contract);
    form.setFieldsValue({
      ...contract,
      startDate: moment(contract.startDate),
      endDate: contract.endDate ? moment(contract.endDate) : null
    });
    setModalVisible(true);
  };

  // Cấu hình cột cho bảng hợp đồng
  const contractColumns = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber'
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position'
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: 'Lương',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary) => salary ? `${salary.toLocaleString()} VNĐ` : 'Chưa xác định'
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color, text;
        switch (status) {
          case 'ACTIVE':
            color = 'green';
            text = 'Đang hoạt động';
            break;
          case 'NEAR_EXPIRY':
            color = 'orange';
            text = 'Gần hết hạn hợp đồng';
            break;
          case 'EXPIRED':
            color = 'red';
            text = 'Hết hạn hợp đồng';
            break;
          case 'TERMINATED':
            color = 'volcano';
            text = 'Đã chấm dứt';
            break;
          default:
            color = 'default';
            text = status;
        }
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => handleEditContract(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa hợp đồng này?"
            onConfirm={() => handleDeleteContract(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Cấu hình cột cho bảng ứng viên đã đỗ
  const candidateColumns = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber'
    },
    {
      title: 'Vị trí ứng tuyển',
      dataIndex: 'position',
      key: 'position'
    },
    {
      title: 'Loại hợp đồng',
      dataIndex: 'contractType',
      key: 'contractType',
      render: (type) => (
        <Tag color={type === 'TEACHER' ? 'blue' : 'green'}>
          {type === 'TEACHER' ? 'Giáo viên' : 'Nhân viên'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => handleSelectCandidate(record)}
        >
          Tạo hợp đồng
        </Button>
      )
    }
  ];

  return (
    <div className="contract-management">
      <Card title="Quản lý Hợp đồng" className="contract-card">
        <Tabs defaultActiveKey="teachers" className="contract-tabs">
          <TabPane 
            tab={
              <span>
                <UserOutlined />
                Hợp đồng Giáo viên ({teacherContracts.length})
              </span>
            } 
            key="teachers"
          >

            <Table
              columns={contractColumns}
              dataSource={teacherContracts}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} hợp đồng`
              }}
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <TeamOutlined />
                Hợp đồng Nhân viên ({staffContracts.length})
              </span>
            } 
            key="staff"
          >

            <Table
              columns={contractColumns}
              dataSource={staffContracts}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} hợp đồng`
              }}
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <PlusOutlined />
                Tạo hợp đồng mới ({candidatesReady.length})
              </span>
            } 
            key="create"
          >
            <Card title="Danh sách ứng viên đã đỗ phỏng vấn" className="candidates-card">
              <Table
                columns={candidateColumns}
                dataSource={candidatesReady}
                rowKey="email"
                pagination={{
                  pageSize: 10,
                  showTotal: (total) => `Tổng ${total} ứng viên`
                }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal tạo/chỉnh sửa hợp đồng thủ công */}
      <Modal
        title={editingContract ? "Chỉnh sửa hợp đồng" : "Tạo hợp đồng mới"}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingContract(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingContract ? handleUpdateContract : handleCreateContract}
        >
          <Form.Item
            name="userId"
            label="ID Người dùng"
            rules={[{ required: true, message: 'Vui lòng nhập ID người dùng!' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Nhập ID người dùng" />
          </Form.Item>

          <Form.Item
            name="contractType"
            label="Loại hợp đồng"
            rules={[{ required: true, message: 'Vui lòng chọn loại hợp đồng!' }]}
          >
            <Select placeholder="Chọn loại hợp đồng">
              <Option value="TEACHER">Giáo viên</Option>
              <Option value="STAFF">Nhân viên</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="position"
            label="Vị trí"
            rules={[{ required: true, message: 'Vui lòng nhập vị trí!' }]}
          >
            <Input placeholder="Nhập vị trí công việc" />
          </Form.Item>

          <Form.Item
            name="department"
            label="Phòng ban"
          >
            <Input placeholder="Nhập phòng ban" />
          </Form.Item>

          <Form.Item
            name="salary"
            label="Lương (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập lương!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Nhập mức lương"
            />
          </Form.Item>

          <Form.Item
            name="workingHours"
            label="Giờ làm việc"
            rules={[{ required: true, message: 'Vui lòng chọn ca làm việc!' }]}
          >
            <Select placeholder="Chọn ca làm việc" style={{ width: '100%' }}>
              <Option value="Ca sáng: 7:30-9:30">Ca sáng: 7:30-9:30</Option>
              <Option value="Ca chiều: 14:30-16:30">Ca chiều: 14:30-16:30</Option>
              <Option value="Ca tối: 19:20-21:20">Ca tối: 19:20-21:20</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="contractTerms"
            label="Điều khoản hợp đồng"
          >
            <TextArea rows={4} placeholder="Nhập các điều khoản hợp đồng" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingContract ? 'Cập nhật' : 'Tạo hợp đồng'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingContract(null);
                form.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal tạo hợp đồng từ ứng viên đã đỗ */}
      <Modal
        title="Tạo hợp đồng cho ứng viên đã đỗ"
        visible={candidateModalVisible}
        onCancel={() => {
          setCandidateModalVisible(false);
          setSelectedCandidate(null);
          candidateForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={candidateForm}
          layout="vertical"
          onFinish={handleCreateContract}
        >
          <Form.Item
            name="fullName"
            label="Họ tên"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="userId"
            label="ID Người dùng"
            rules={[{ required: true, message: 'Vui lòng nhập ID người dùng!' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="ID tự động tạo" disabled />
          </Form.Item>

          <Form.Item
            name="contractType"
            label="Loại hợp đồng"
            rules={[{ required: true, message: 'Vui lòng chọn loại hợp đồng!' }]}
          >
            <Select placeholder="Chọn loại hợp đồng">
              <Option value="TEACHER">Giáo viên</Option>
              <Option value="STAFF">Nhân viên</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="position"
            label="Vị trí"
            rules={[{ required: true, message: 'Vui lòng nhập vị trí!' }]}
          >
            <Input placeholder="Nhập vị trí công việc" />
          </Form.Item>

          <Form.Item
            name="department"
            label="Phòng ban"
          >
            <Input placeholder="Nhập phòng ban" />
          </Form.Item>

          <Form.Item
            name="salary"
            label="Lương (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập lương!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Nhập mức lương"
            />
          </Form.Item>

          <Form.Item
            name="workingHours"
            label="Giờ làm việc"
            rules={[{ required: true, message: 'Vui lòng chọn ca làm việc!' }]}
          >
            <Select placeholder="Chọn ca làm việc" style={{ width: '100%' }}>
              <Option value="Ca sáng: 7:30-9:30">Ca sáng: 7:30-9:30</Option>
              <Option value="Ca chiều: 14:30-16:30">Ca chiều: 14:30-16:30</Option>
              <Option value="Ca tối: 19:20-21:20">Ca tối: 19:20-21:20</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="contractTerms"
            label="Điều khoản hợp đồng"
          >
            <TextArea rows={4} placeholder="Nhập các điều khoản hợp đồng" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Tạo hợp đồng
              </Button>
              <Button onClick={() => {
                setCandidateModalVisible(false);
                setSelectedCandidate(null);
                candidateForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContractManagement;
