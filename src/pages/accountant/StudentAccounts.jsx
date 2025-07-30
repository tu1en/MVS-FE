import { DollarOutlined, SearchOutlined } from '@ant-design/icons';
import { Button as Btn, Button, Card, Input, Space, Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';

const { Title } = Typography;

const StudentAccounts = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [balanceFilter, setBalanceFilter] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/accountant/students');
      setStudents(response.data || []);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu học viên:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStudentBalance = async (studentId, amount) => {
    try {
      await api.put(`/accountant/students/${studentId}/balance`, { amount });
      fetchStudents();
    } catch (error) {
      console.error('Lỗi khi cập nhật số dư:', error);
    }
  };

  const handleCreateInvoice = (studentId) => {
    navigate(`/accountant/invoices/create?studentId=${studentId}`);
  };

  const columns = [
    {
      title: 'Mã học viên',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên học viên',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số dư hiện tại',
      dataIndex: 'accountBalance',
      key: 'accountBalance',
      render: (balance) => (
        <Tag color={balance >= 0 ? 'green' : 'red'}>
          ${balance?.toLocaleString() || 0}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'accountStatus',
      key: 'accountStatus',
      render: (status) => {
        const color = {
          'active': 'green',
          'suspended': 'red',
          'pending': 'orange',
        }[status] || 'default';
        const label = {
          'active': 'Đang hoạt động',
          'suspended': 'Đình chỉ',
          'pending': 'Chờ xử lý',
        }[status] || status;
        return <Tag color={color}>{label.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Khoản nợ',
      dataIndex: 'outstandingAmount',
      key: 'outstandingAmount',
      render: (amount) => (
        <span style={{ color: amount > 0 ? 'red' : 'inherit' }}>
          ${amount?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleCreateInvoice(record.id)}
            icon={<DollarOutlined />}
          >
            Tạo hóa đơn
          </Button>
          <Button
            size="small"
            onClick={() => navigate(`/accountant/students/${record.id}/transactions`)}
          >
            Xem giao dịch
          </Button>
        </Space>
      ),
    },
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesBalance = 
      !balanceFilter || 
      (balanceFilter === 'positive' && student.accountBalance >= 0) ||
      (balanceFilter === 'negative' && student.accountBalance < 0) ||
      (balanceFilter === 'outstanding' && student.outstandingAmount > 0);
    
    return matchesSearch && matchesBalance;
  });

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Tài khoản tài chính học viên</Title>
      
      <Card>
        <Space style={{ marginBottom: 16, width: '100%' }} wrap>
          <Input
            placeholder="Tìm kiếm học viên..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Input
            type="text"
            value={balanceFilter}
            onChange={(e) => setBalanceFilter(e.target.value)}
            placeholder="Lọc theo số dư"
            style={{ width: 150 }}
          />
          <Btn>Xuất báo cáo</Btn>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredStudents}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default StudentAccounts;

// Hiển thị số dư
const BalanceDisplay = ({ balance }) => {
  return (
    <div style={{ textAlign: 'center' }}>
      <DollarOutlined style={{ fontSize: 24, color: balance >= 0 ? '#52c41a' : '#ff4d4f' }} />
      <div style={{ fontSize: 16, fontWeight: 'bold' }}>
        ${balance?.toLocaleString() || 0}
      </div>
    </div>
  );
};
