import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Table, 
  DatePicker, 
  Button, 
  Space, 
  Tag, 
  message, 
  Row, 
  Col, 
  Statistic, 
  Select, 
  Input,
  Spin,
  Alert,
  Modal,
  Popconfirm
} from 'antd';
import { 
  FileTextOutlined, 
  TeamOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  CalendarOutlined,
  UserOutlined,
  DownloadOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

const ExplanationReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [statistics, setStatistics] = useState({
    totalReports: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0
  });

  useEffect(() => {
    fetchReports();
  }, [pagination.current, pagination.pageSize, dateRange, selectedStatus, selectedRole, selectedDepartment]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current - 1,
        size: pagination.pageSize
      };
      
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      if (selectedStatus) params.status = selectedStatus;
      if (selectedRole) params.role = selectedRole;
      if (selectedDepartment) params.department = selectedDepartment;
      
      const response = await api.get('/attendance-explanations/report', { params });
      const data = response.data.content || response.data;
      
      setReports(data);
      setPagination(prev => ({
        ...prev,
        total: response.data.totalElements || data.length
      }));
      
      // Calculate statistics
      const pendingCount = data.filter(report => report.status === 'PENDING').length;
      const approvedCount = data.filter(report => report.status === 'APPROVED').length;
      const rejectedCount = data.filter(report => report.status === 'REJECTED').length;
      
      setStatistics({
        totalReports: data.length,
        pendingCount,
        approvedCount,
        rejectedCount
      });
      
    } catch (error) {
      console.error('Error fetching explanation reports:', error);
      message.error('Không thể tải dữ liệu yêu cầu giải trình');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const params = {};
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      if (selectedStatus) params.status = selectedStatus;
      if (selectedRole) params.role = selectedRole;
      if (selectedDepartment) params.department = selectedDepartment;

      const response = await api.get('/attendance-explanations/export/excel', {
        params,
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `bao_cao_giai_trinh_${dayjs().format('YYYY-MM-DD')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      message.success('Xuất file Excel thành công!');
    } catch (error) {
      console.error('Failed to export Excel', error);
      message.error('Không thể xuất file Excel');
    }
  };

  const handleApprove = async (reportId) => {
    try {
      await api.put(`/attendance-explanations/${reportId}/approve`);
      message.success('Đã phê duyệt yêu cầu giải trình');
      fetchReports();
    } catch (error) {
      console.error('Failed to approve', error);
      message.error('Không thể phê duyệt yêu cầu');
    }
  };

  const handleReject = async (reportId) => {
    try {
      await api.put(`/attendance-explanations/${reportId}/reject`);
      message.success('Đã từ chối yêu cầu giải trình');
      fetchReports();
    } catch (error) {
      console.error('Failed to reject', error);
      message.error('Không thể từ chối yêu cầu');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'PENDING': return <ExclamationCircleOutlined />;
      case 'APPROVED': return <CheckCircleOutlined />;
      case 'REJECTED': return <CloseCircleOutlined />;
      default: return <FileTextOutlined />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'PENDING': return 'Chờ duyệt';
      case 'APPROVED': return 'Đã duyệt';
      case 'REJECTED': return 'Từ chối';
      default: return status;
    }
  };

  const handleRefresh = () => {
    fetchReports();
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchText || 
      report.submitterName?.toLowerCase().includes(searchText.toLowerCase()) ||
      report.reason?.toLowerCase().includes(searchText.toLowerCase()) ||
      report.department?.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

  const columns = [
    {
      title: 'Người gửi',
      dataIndex: 'submitterName',
      key: 'submitterName',
      render: (text) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Ngày vắng',
      dataIndex: 'absenceDate',
      key: 'absenceDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Người duyệt',
      dataIndex: 'approverName',
      key: 'approverName',
      render: (text) => text || 'Chưa có',
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      render: (text) => text || 'Chưa có',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'PENDING' && (
            <>
              <Popconfirm
                title="Phê duyệt yêu cầu"
                description="Bạn có chắc chắn muốn phê duyệt yêu cầu này?"
                onConfirm={() => handleApprove(record.id)}
                okText="Có"
                cancelText="Không"
              >
                <Button type="primary" size="small" icon={<CheckOutlined />}>
                  Duyệt
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Từ chối yêu cầu"
                description="Bạn có chắc chắn muốn từ chối yêu cầu này?"
                onConfirm={() => handleReject(record.id)}
                okText="Có"
                cancelText="Không"
              >
                <Button danger size="small" icon={<CloseOutlined />}>
                  Từ chối
                </Button>
              </Popconfirm>
            </>
          )}
          <Button size="small" icon={<EyeOutlined />}>
            Xem
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Yêu cầu giải trình điểm danh
          </h2>
          <Space>
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportExcel}>
              Xuất Excel
            </Button>
            <Button type="primary" icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              Làm mới
            </Button>
          </Space>
        </div>

        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số yêu cầu"
                value={statistics.totalReports}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Chờ duyệt"
                value={statistics.pendingCount}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã duyệt"
                value={statistics.approvedCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Từ chối"
                value={statistics.rejectedCount}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col span={8}>
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
            <Col span={4}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Trạng thái:
              </label>
              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                style={{ width: '100%' }}
                placeholder="Chọn trạng thái"
                allowClear
              >
                <Option value="PENDING">Chờ duyệt</Option>
                <Option value="APPROVED">Đã duyệt</Option>
                <Option value="REJECTED">Từ chối</Option>
              </Select>
            </Col>
            <Col span={4}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Vai trò:
              </label>
              <Select
                value={selectedRole}
                onChange={setSelectedRole}
                style={{ width: '100%' }}
                placeholder="Chọn vai trò"
                allowClear
              >
                <Option value="TEACHER">Giáo viên</Option>
                <Option value="ACCOUNTANT">Kế toán</Option>
                <Option value="ADMIN">Quản trị</Option>
              </Select>
            </Col>
            <Col span={8}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                <SearchOutlined /> Tìm kiếm:
              </label>
              <Search
                placeholder="Tìm theo tên, lý do hoặc phòng ban"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredReports}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, size) => setPagination(prev => ({ ...prev, current: page, pageSize: size })),
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu giải trình`
          }}
        />
      </Card>
    </div>
  );
};

export default ExplanationReports;
