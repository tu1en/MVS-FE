import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      let url = `http://localhost:8088/api/attendance-explanations/report?page=${page}&size=${rowsPerPage}`;
      if (startDate) url += `&startDate=${startDate.format('YYYY-MM-DD')}`;
      if (endDate) url += `&endDate=${endDate.format('YYYY-MM-DD')}`;
      if (status) url += `&status=${status}`;
      if (role) url += `&role=${role}`;
      if (department) url += `&department=${department}`;

      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setReports(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      setError('Failed to load reports. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      let reasonUrl = `http://localhost:8088/api/attendance-explanations/statistics/reason`;
      let statusUrl = `http://localhost:8088/api/attendance-explanations/statistics/status`;
      if (startDate) {
        reasonUrl += `?startDate=${startDate.format('YYYY-MM-DD')}`;
        statusUrl += `?startDate=${startDate.format('YYYY-MM-DD')}`;
      }
      if (endDate) {
        reasonUrl += `${startDate ? '&' : '?'}endDate=${endDate.format('YYYY-MM-DD')}`;
        statusUrl += `${startDate ? '&' : '?'}endDate=${endDate.format('YYYY-MM-DD')}`;
      }

      const [reasonResponse, statusResponse] = await Promise.all([
        axios.get(reasonUrl, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(statusUrl, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      setStatistics({
        reason: reasonResponse.data,
        status: statusResponse.data
      });
    } catch (err) {
      console.error('Failed to load statistics', err);
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `http://localhost:8088/api/attendance-explanations/export/excel`;
      if (startDate) url += `?startDate=${startDate.format('YYYY-MM-DD')}`;
      if (endDate) url += `${startDate ? '&' : '?'}endDate=${endDate.format('YYYY-MM-DD')}`;
      if (status) url += `${startDate || endDate ? '&' : '?'}status=${status}`;
      if (role) url += `${startDate || endDate || status ? '&' : '?'}role=${role}`;
      if (department) url += `${startDate || endDate || status || role ? '&' : '?'}department=${department}`;

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
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  label="Role"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="TEACHER">Teacher</MenuItem>
                  <MenuItem value="ACCOUNTANT">Accountant</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Paper>

      {/* Statistics Section */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Statistics</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>By Reason:</Typography>
            {Object.entries(statistics.reason).map(([reason, count]) => (
              <Typography key={reason}>{reason}: {count}</Typography>
            ))}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>By Status:</Typography>
            {Object.entries(statistics.status).map(([status, count]) => (
              <Typography key={status}>{status}: {count}</Typography>
            ))}
          </Grid>
        </Grid>
        <Button variant="contained" onClick={handleExportExcel} sx={{ mt: 2 }}>
          Export to Excel
        </Button>
      </Paper>

      {/* Reports Table */}
      <Paper sx={{ width: '100%' }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Submitter</TableCell>
                <TableCell>Absence Date</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Submitted At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Approver</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">No reports found.</TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.submitterName}</TableCell>
                    <TableCell>{report.absenceDate}</TableCell>
                    <TableCell>{report.reason}</TableCell>
                    <TableCell>{dayjs(report.submittedAt).format('YYYY-MM-DD HH:mm')}</TableCell>
                    <TableCell>
                      <span style={{ color: getStatusColor(report.status) }}>{report.status}</span>
                    </TableCell>
                    <TableCell>{report.approverName || 'N/A'}</TableCell>
                    <TableCell>{report.department || 'N/A'}</TableCell>
                    <TableCell>
                      {report.status === 'PENDING' && (
                        <>
                          <Button 
                            variant="contained" 
                            size="small" 
                            sx={{ mr: 1 }}
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                const userId = JSON.parse(atob(token.split('.')[1])).id;
                                await axios.put(`http://localhost:8088/api/attendance-explanations/${report.id}/approve?approverId=${userId}`, {}, {
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                fetchReports();
                                fetchStatistics();
                              } catch (err) {
                                console.error('Failed to approve', err);
                                setError('Failed to approve explanation.');
                              }
                            }}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                const userId = JSON.parse(atob(token.split('.')[1])).id;
                                await axios.put(`http://localhost:8088/api/attendance-explanations/${report.id}/reject?approverId=${userId}`, {}, {
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                fetchReports();
                                fetchStatistics();
                              } catch (err) {
                                console.error('Failed to reject', err);
                                setError('Failed to reject explanation.');
                              }
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
          <Button
            onClick={() => handleChangePage(null, page - 1)}
            disabled={page === 0 || loading}
          >
            Previous
          </Button>
          <Typography>Page {page + 1} of {Math.ceil(totalElements / rowsPerPage)}</Typography>
          <Button
            onClick={() => handleChangePage(null, page + 1)}
            disabled={page >= Math.ceil(totalElements / rowsPerPage) - 1 || loading}
          >
            Next
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ExplanationReports;
