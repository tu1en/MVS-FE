import {
    CalendarOutlined,
    CheckCircleOutlined,
    CheckOutlined,
    CloseCircleOutlined,
    CloseOutlined,
    DownloadOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    FileTextOutlined,
    ReloadOutlined,
    SearchOutlined,
    TeamOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Input,
    message,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tabs,
    Tag
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const roleStr = ((currentUser?.role || currentUser?.roleName || '') + '').toUpperCase();
  const isAccountant = roleStr.includes('ACCOUNTANT');
  const [viewScope, setViewScope] = useState(() => {
    const url = new URL(window.location.href);
    const init = url.searchParams.get('scope');
    if (init === 'mine' || init === 'others' || init === 'all') return init;
    return isAccountant ? 'others' : 'all';
  }); // all | mine | others

  useEffect(() => {
    fetchReports();
  }, [pagination.current, pagination.pageSize, dateRange, selectedStatus, selectedRole, selectedDepartment]);

  const fetchStatistics = async () => {
    try {
      const params = {};
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      const statusResponse = await api.get('/attendance-explanations/statistics/status', { params });
      const statusData = statusResponse.data;
      
      setStatistics({
        totalReports: (statusData.PENDING || 0) + (statusData.APPROVED || 0) + (statusData.REJECTED || 0),
        pendingCount: statusData.PENDING || 0,
        approvedCount: statusData.APPROVED || 0,
        rejectedCount: statusData.REJECTED || 0
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Fallback to basic statistics if API fails
      setStatistics({
        totalReports: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0
      });
    }
  };

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
      
      // Set pagination info
      setPagination(prev => ({
        ...prev,
        total: response.data.totalElements || data.length
      }));
      
      // Fetch overall statistics from backend API
      fetchStatistics();
      
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
      const user = JSON.parse(localStorage.getItem('user'));
      const approverId = user?.email || user?.name || 'Manager';
      
      await api.put(`/attendance-explanations/${reportId}/approve`, null, {
        params: { approverId }
      });
      message.success('Đã phê duyệt yêu cầu giải trình');
      fetchReports();
    } catch (error) {
      console.error('Failed to approve', error);
      message.error('Không thể phê duyệt yêu cầu');
    }
  };

  const handleReject = async (reportId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const approverId = user?.email || user?.name || 'Manager';
      
      await api.put(`/attendance-explanations/${reportId}/reject`, null, {
        params: { approverId }
      });
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

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleCloseModal = () => {
    setDetailModalVisible(false);
    setSelectedRecord(null);
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchText || 
      report.submitterName?.toLowerCase().includes(searchText.toLowerCase()) ||
      report.reason?.toLowerCase().includes(searchText.toLowerCase()) ||
      report.department?.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

  const isMine = (record) => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || 'null');
      const myIdStr = stored?.id || localStorage.getItem('userId');
      const myId = myIdStr ? parseInt(myIdStr, 10) : null;
      if (myId && (record?.staff?.id || record?.staffId)) {
        const staffId = record?.staff?.id || record?.staffId;
        return Number(staffId) === myId;
      }
    } catch (_) {}
    if (!currentUser) return false;
    const myEmail = (currentUser.email || localStorage.getItem('email') || '').toLowerCase();
    const myName = (currentUser.name || currentUser.fullName || '').toLowerCase();
    const submitter = (record.submitterName || '').toLowerCase();
    const staffEmail = (record.staff?.email || '').toLowerCase();
    return (staffEmail && staffEmail === myEmail) || (submitter && (submitter === myEmail || submitter === myName));
  };

  const scopedReports = filteredReports.filter(r => {
    if (viewScope === 'all') return true;
    if (viewScope === 'mine') return isMine(r);
    if (viewScope === 'others') return !isMine(r);
    return true;
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
          {isAccountant && (
            <Tag color={text && isMine({ submitterName: text }) ? 'geekblue' : 'default'}>
              {isMine({ submitterName: text }) ? 'Của tôi' : 'Khác'}
            </Tag>
          )}
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
      title: 'Ngày gửi',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date) => {
        if (!date) return 'Chưa có';
        const parsedDate = dayjs(date);
        return parsedDate.isValid() ? parsedDate.format('DD/MM/YYYY HH:mm') : 'Ngày không hợp lệ';
      },
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
          {record.status === 'PENDING' && (!isAccountant || (isAccountant && !isMine(record))) && (
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
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
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

        {/* Table with scope tabs for ACCOUNTANT */}
        {isAccountant ? (
          <>
            <Tabs
              activeKey={viewScope}
              onChange={setViewScope}
              items={[
                { key: 'mine', label: 'Của tôi' },
                { key: 'others', label: 'Của người khác' },
                { key: 'all', label: 'Tất cả' }
              ]}
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={columns}
              dataSource={scopedReports}
              loading={loading}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: scopedReports.length,
                onChange: (page, size) => setPagination(prev => ({ ...prev, current: page, pageSize: size })),
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu giải trình`
              }}
            />
          </>
        ) : (
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
        )}
      </Card>

      {/* Modal for viewing explanation details */}
      <Modal
        title="Chi tiết yêu cầu giải trình"
        open={detailModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedRecord && (
          <div style={{ padding: '16px 0' }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card size="small" title="Thông tin người gửi">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div><strong>Tên:</strong> {selectedRecord.submitterName}</div>
                    <div><strong>Phòng ban:</strong> {selectedRecord.department || 'Chưa có'}</div>
                    <div><strong>Ngày vắng mặt:</strong> {dayjs(selectedRecord.absenceDate).format('DD/MM/YYYY')}</div>
                    <div><strong>Ngày gửi:</strong> {
                      selectedRecord.submittedAt ? 
                        dayjs(selectedRecord.submittedAt).format('DD/MM/YYYY HH:mm') : 
                        'Chưa có'
                    }</div>
                  </Space>
                </Card>
              </Col>
              <Col span={24}>
                <Card size="small" title="Lý do giải trình">
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#f9f9f9', 
                    borderRadius: '6px',
                    minHeight: '80px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedRecord.reason || 'Không có lý do'}
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExplanationReports;
