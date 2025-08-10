import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    DownloadOutlined,
    ExclamationCircleOutlined,
    HistoryOutlined,
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
    Empty,
    Input,
    message,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import attendanceService from '../../services/attendanceService';
import { safeDataSource } from '../../utils/tableUtils';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const PersonalAttendanceHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
  const [rangeMode, setRangeMode] = useState('last7'); // today | last7 | last30 | thisMonth | custom
  // Chỉ hiển thị dữ liệu bản thân
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [statistics, setStatistics] = useState({
    totalRecords: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    totalHours: 0
  });
  

  // HELPER FUNCTIONS
  const getStatusColor = (status) => {
    // Hỗ trợ cả status từ BE: 'Chưa chấm công', 'Đang làm việc', 'Hoàn thành'
    if (!status) return 'default';
    const s = String(status).toUpperCase();
    if (s.includes('PRESENT') || s.includes('HOÀN THÀNH')) return 'success';
    if (s.includes('ABSENT') || s.includes('VẮNG')) return 'error';
    if (s.includes('LATE') || s.includes('MUỘN')) return 'warning';
    if (s.includes('ĐANG LÀM')) return 'processing';
    return 'default';
  };

  const getStatusIcon = (status) => {
    if (!status) return <ClockCircleOutlined />;
    const s = String(status).toUpperCase();
    if (s.includes('PRESENT') || s.includes('HOÀN THÀNH')) return <CheckCircleOutlined />;
    if (s.includes('ABSENT') || s.includes('VẮNG')) return <CloseCircleOutlined />;
    if (s.includes('LATE') || s.includes('MUỘN')) return <ExclamationCircleOutlined />;
    return <ClockCircleOutlined />;
  };

  const getStatusText = (status) => {
    if (!status) return '-';
    switch(status) {
      case 'PRESENT': return 'Có mặt';
      case 'ABSENT': return 'Vắng mặt';
      case 'LATE': return 'Đi muộn';
      default: return status;
    }
  };

  const getShiftText = (shift) => {
    switch(shift) {
      case 'morning': return 'Ca sáng';
      case 'afternoon': return 'Ca chiều';
      case 'evening': return 'Ca tối';
      default: return shift || '-';
    }
  };

  // COLUMNS DEFINITION
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Tên nhân viên',
      dataIndex: 'userName',
      key: 'userName',
      render: (text) => (
        <Space>
          <UserOutlined />
          {text || user?.fullName || user?.username}
        </Space>
      ),
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ca làm',
      dataIndex: 'shift',
      key: 'shift',
      render: (shift) => (
        <Tag color='cyan'>
          <ClockCircleOutlined /> {getShiftText(shift)}
        </Tag>
      ),
    },
    {
      title: 'Giờ vào',
      dataIndex: 'checkIn',
      key: 'checkIn',
      render: (time) => (typeof time === 'string' ? time.substring(0, 5) : (Array.isArray(time) ? `${String(time[0]).padStart(2,'0')}:${String(time[1]).padStart(2,'0')}` : '-')),
    },
    {
      title: 'Giờ ra',
      dataIndex: 'checkOut',
      key: 'checkOut',
      render: (time) => (typeof time === 'string' ? time.substring(0, 5) : (Array.isArray(time) ? `${String(time[0]).padStart(2,'0')}:${String(time[1]).padStart(2,'0')}` : '-')),
    },
    {
      title: 'Số giờ làm',
      key: 'workingHours',
      render: (_, record) => {
        if (record.checkIn && record.checkOut) {
          const today = dayjs().format('YYYY-MM-DD');
          const checkIn = dayjs(`${today} ${record.checkIn}`);
          const checkOut = dayjs(`${today} ${record.checkOut}`);
          const hours = checkOut.diff(checkIn, 'hour', true);
          return hours > 0 ? `${Math.round(hours * 10) / 10}h` : '-';
        }
        return '-';
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
  ];

  // useEffect hooks
  useEffect(() => {
    fetchLogs();
  }, [pagination.current, pagination.pageSize, dateRange]);

  // remove testUsers dependency for production data

  // MAIN FUNCTIONS
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      const raw = await attendanceService.getAttendanceHistory(startDate, endDate);
      const data = Array.isArray(raw) ? raw : [];

      // Map dữ liệu từ BE -> FE columns
      const mapped = data.map((item, index) => ({
        id: index + 1,
        userName: user?.fullName || user?.username || '',
        date: item.date,
        shift: item.shift, // có thể undefined nếu BE chưa có
        checkIn: item.checkInTime,
        checkOut: item.checkOutTime,
        status: item.status,
      }));

      setLogs(mapped);
      setPagination(prev => ({ ...prev, total: mapped.length }));

      const totalHours = data.reduce((sum, it) => sum + (typeof it.workingHours === 'number' ? it.workingHours : 0), 0);
      setStatistics({
        totalRecords: mapped.length,
        presentCount: mapped.filter(r => String(r.status).toUpperCase().includes('HOÀN THÀNH') || String(r.status).toUpperCase().includes('PRESENT')).length,
        absentCount: mapped.filter(r => String(r.status).toUpperCase().includes('ABSENT') || String(r.status).toUpperCase().includes('VẮNG')).length,
        lateCount: mapped.filter(r => String(r.status).toUpperCase().includes('LATE') || String(r.status).toUpperCase().includes('MUỘN')).length,
        totalHours: Math.round(totalHours * 10) / 10,
      });
      
    } catch (error) {
      console.error('Error fetching staff attendance history:', error);
      console.error('Error details:', error.response);
      if (error.response?.status === 403) {
        message.error('Bạn không có quyền xem dữ liệu này');
      } else if (error.response?.status === 404) {
        message.error('Không tìm thấy dữ liệu chấm công');
      } else {
        message.error('Không thể tải lịch sử chấm công: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadTestUsers = async () => {};

  const handleRefresh = () => {
    fetchLogs();
  };

  useEffect(() => {
    if (rangeMode === 'custom') return;
    const today = dayjs();
    let start = today;
    let end = today;
    switch (rangeMode) {
      case 'today':
        start = today;
        end = today;
        break;
      case 'last7':
        start = today.subtract(6, 'day');
        end = today;
        break;
      case 'last30':
        start = today.subtract(29, 'day');
        end = today;
        break;
      case 'thisMonth':
        start = today.startOf('month');
        end = today;
        break;
      default:
        break;
    }
    setDateRange([start, end]);
  }, [rangeMode]);

  const handleExportExcel = async () => {
    try {
      if (!logs || logs.length === 0) {
        message.warning('Không có dữ liệu để xuất');
        return;
      }

      const csvContent = [
        // Header row
        'ID,Tên nhân viên,Ngày,Ca làm,Giờ vào,Giờ ra,Số giờ làm,Trạng thái',
        // Data rows
        ...logs.map(log => {
          const workingHours = log.checkIn && log.checkOut ? 
            (() => {
              const today = dayjs().format('YYYY-MM-DD');
              const checkIn = dayjs(`${today} ${log.checkIn}`);
              const checkOut = dayjs(`${today} ${log.checkOut}`);
              const hours = checkOut.diff(checkIn, 'hour', true);
              return hours > 0 ? `${Math.round(hours * 10) / 10}h` : '-';
            })() : '-';
          
          return [
            log.id,
            log.userName,
            dayjs(log.date).format('DD/MM/YYYY'),
            getShiftText(log.shift),
            typeof log.checkIn === 'string' ? log.checkIn.substring(0, 5) : '-',
            typeof log.checkOut === 'string' ? log.checkOut.substring(0, 5) : '-',
            workingHours,
            getStatusText(log.status)
          ].join(',');
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `lich_su_cham_cong_${selectedUserId || 'all_users'}_${dayjs().format('YYYY-MM-DD')}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      message.success('Xuất file CSV thành công!');
    } catch (error) {
      console.error('Failed to export CSV', error);
      message.error('Không thể xuất file CSV');
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchText || 
      log.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
      log.shift?.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>
            <HistoryOutlined style={{ marginRight: 8 }} />
            Lịch sử chấm công nhân viên
          </h2>
          <Space>
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportExcel} disabled={logs.length === 0}>
              Xuất CSV
            </Button>
            <Button type="primary" icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              Làm mới
            </Button>
          </Space>
        </div>

        {/* Ẩn khu vực user test trong môi trường thật */}

        {/* Statistics Cards */}
        {logs.length > 0 && (
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={5}>
              <Card>
                <Statistic
                  title="Tổng số ngày"
                  value={statistics.totalRecords}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={5}>
              <Card>
                <Statistic
                  title="Có mặt"
                  value={statistics.presentCount}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={5}>
              <Card>
                <Statistic
                  title="Vắng mặt"
                  value={statistics.absentCount}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col span={5}>
              <Card>
                <Statistic
                  title="Đi muộn"
                  value={statistics.lateCount}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="Tổng giờ làm"
                  value={statistics.totalHours}
                  suffix="h"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Filters */}
        <Card style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col span={8}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                <CalendarOutlined /> Chọn nhanh:
              </label>
              <Select value={rangeMode} onChange={setRangeMode} style={{ width: '100%' }}>
                <Option value="today">Hôm nay</Option>
                <Option value="last7">7 ngày gần nhất</Option>
                <Option value="last30">30 ngày gần nhất</Option>
                <Option value="thisMonth">Tháng này</Option>
                <Option value="custom">Tùy chọn...</Option>
              </Select>
            </Col>
            <Col span={8}>
              {rangeMode === 'custom' && (
                <div>
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
                </div>
              )}
            </Col>
            {/* Không cần chọn mã nhân viên ở trang cá nhân */}
            <Col span={8}></Col>
            <Col span={8}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                <SearchOutlined /> Tìm kiếm:
              </label>
              <Search
                placeholder="Tìm theo tên hoặc ca làm"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Table */}
        {logs.length === 0 ? (
          <Empty description="Không có dữ liệu trong khoảng thời gian đã chọn" style={{ margin: '40px 0' }} />
        ) : (
          <div>
            <div style={{ marginBottom: '16px', color: '#666' }}>
              <strong>
                {`Hiển thị ${logs.length} bản ghi lịch sử chấm công`}
              </strong>
            </div>
            <Table
              columns={columns}
              dataSource={safeDataSource(filteredLogs, 'PersonalAttendanceHistory')}
              loading={loading}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: (page, size) => setPagination(prev => ({ ...prev, current: page, pageSize: size })),
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi lịch sử chấm công`
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default PersonalAttendanceHistory;