import { SearchOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Input, Select, Space, Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const PaymentTracking = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/accountant/payments');
      setPayments(response.data || []);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu thanh toán:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã thanh toán',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Học viên',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Hóa đơn',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount?.toLocaleString() || 0}`,
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => method || 'Không có',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = {
          'completed': 'green',
          'pending': 'orange',
          'failed': 'red',
        }[status] || 'default';
        const label = {
          'completed': 'Hoàn tất',
          'pending': 'Đang xử lý',
          'failed': 'Thất bại',
        }[status] || status;
        return <Tag color={color}>{label.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" onClick={() => navigate(`/accountant/payments/${record.id}`)}>
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
                         payment.invoiceNumber.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Theo dõi thanh toán</Title>
      
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm theo tên học viên hoặc hóa đơn..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
          >
            <Option value="completed">Hoàn tất</Option>
            <Option value="pending">Đang xử lý</Option>
            <Option value="failed">Thất bại</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredPayments}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default PaymentTracking;
