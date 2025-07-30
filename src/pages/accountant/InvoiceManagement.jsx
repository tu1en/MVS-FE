import { DollarOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Input, Select, Space, Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const InvoiceManagement = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/accountant/invoices');
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách hóa đơn:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã Hóa Đơn',
      dataIndex: 'id',
      key: 'id',
      render: (text) => text,
    },
    {
      title: 'Học Sinh',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Số Tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${(amount || 0).toLocaleString('vi-VN')} VND`,
    },
    {
      title: 'Hạn Thanh Toán',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          'paid': { color: 'green', text: 'ĐÃ THANH TOÁN' },
          'pending': { color: 'orange', text: 'CHỜ THANH TOÁN' },
          'overdue': { color: 'red', text: 'QUÁ HẠN' },
        };
        const config = statusConfig[status] || { color: 'default', text: status?.toUpperCase() || '' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Thao Tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => navigate(`/accountant/invoices/${record.id}`)}
            icon={<FileTextOutlined />}
          >
            Xem Chi Tiết
          </Button>
        </Space>
      ),
    },
  ];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.studentName?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản Lý Hóa Đơn</Title>
     
      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Input
              placeholder="Tìm kiếm theo tên học sinh..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: 180 }}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="paid">Đã Thanh Toán</Option>
              <Option value="pending">Chờ Thanh Toán</Option>
              <Option value="overdue">Quá Hạn</Option>
            </Select>
          </Space>
          <Space>
            <Button type="primary" icon={<DollarOutlined />}>
              Tạo Hóa Đơn Mới
            </Button>
          </Space>
        </Space>
        
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          loading={loading}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} hóa đơn`,
          }}
          locale={{
            emptyText: 'Không có dữ liệu hóa đơn',
            filterConfirm: 'Xác nhận',
            filterReset: 'Đặt lại',
            selectAll: 'Chọn tất cả',
            selectInvert: 'Chọn ngược lại',
          }}
        />
      </Card>
    </div>
  );
};

export default InvoiceManagement;