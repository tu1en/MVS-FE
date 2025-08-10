import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
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
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import attendanceService from '../../services/attendanceService';

const { Search } = Input;
const { Option } = Select;

const DailyShiftAttendance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [dayMode, setDayMode] = useState('today'); // today | yesterday | last7 | last30 | custom
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [stats, setStats] = useState({
    totalRecords: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    totalHours: 0
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.current, pagination.pageSize, selectedDate]);

  useEffect(() => {
    if (dayMode === 'custom') return;
    const today = dayjs();
    if (dayMode === 'today') setSelectedDate(today);
    if (dayMode === 'yesterday') setSelectedDate(today.subtract(1, 'day'));
    if (dayMode === 'last7' || dayMode === 'last30') setSelectedDate(today);
  }, [dayMode]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      if (!selectedDate) {
        message.warning("Vui lòng chọn ngày để tải dữ liệu.");
        setLoading(false);
        return;
      }
      
      let data = [];
      if (dayMode === 'last7' || dayMode === 'last30') {
        const days = dayMode === 'last7' ? 7 : 30;
        const requests = Array.from({ length: days }, (_, i) => {
          const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
          return attendanceService.getDayLogs(d).catch(() => []);
        });
        const results = await Promise.all(requests);
        data = results.flat().filter(Boolean);
      } else {
        const day = selectedDate.format('YYYY-MM-DD');
        const raw = await attendanceService.getDayLogs(day);
        data = Array.isArray(raw) ? raw : [];
      }

      const mapped = data.map((it, idx) => ({
        id: idx + 1,
        userName: it.userName || '',
        role: it.role || 'STAFF',
        date: it.date,
        checkIn: it.checkInTime,
        checkOut: it.checkOutTime,
        status: it.status,
        shift: it.shift || classifyShift(it.checkInTime),
      }));

      setLogs(mapped);
      setPagination(prev => ({ ...prev, total: mapped.length }));

      const presentCount = mapped.filter(r => String(r.status).toUpperCase().includes('HOÀN THÀNH') || String(r.status).toUpperCase().includes('PRESENT')).length;
      const absentCount = mapped.filter(r => String(r.status).toUpperCase().includes('ABSENT') || String(r.status).toUpperCase().includes('VẮNG')).length;
      const lateCount = mapped.filter(r => String(r.status).toUpperCase().includes('LATE') || String(r.status).toUpperCase().includes('MUỘN')).length;
      const totalHours = data.reduce((sum, it) => sum + (typeof it.workingHours === 'number' ? it.workingHours : 0), 0);

      setStats({ totalRecords: mapped.length, presentCount, absentCount, lateCount, totalHours: Math.round(totalHours * 10) / 10 });
      
    } catch (error) {
      console.error('Error fetching shift attendance:', error);
      message.error('Không thể tải báo cáo chấm công');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
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

  // Utilities to infer shift from check-in time when BE không trả shift
  const normalizeToHour = (time) => {
    if (!time) return null;
    if (typeof time === 'string') {
      const h = parseInt(time.split(':')[0] || '0', 10);
      return isNaN(h) ? null : h;
    }
    if (Array.isArray(time)) {
      const h = parseInt(time[0] ?? 0, 10);
      return isNaN(h) ? null : h;
    }
    return null;
  };

  const classifyShift = (checkIn) => {
    const h = normalizeToHour(checkIn);
    if (h === null) return undefined;
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchText || 
      log.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
      log.role?.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

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
          {text}
        </Space>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'TEACHER' ? 'blue' : role === 'MANAGER' ? 'purple' : 'green'}>
          {role === 'TEACHER' ? 'Giáo viên' : role === 'MANAGER' ? 'Quản lý' : role}
        </Tag>
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

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            Chấm công theo ca
          </h2>
          <Button type="primary" icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            Làm mới
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số bản ghi"
                value={stats.totalRecords}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Có mặt"
                value={stats.presentCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Vắng mặt"
                value={stats.absentCount}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đi muộn"
                value={stats.lateCount}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col span={8}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                <CalendarOutlined /> Chọn nhanh:
              </label>
              <Select value={dayMode} onChange={setDayMode} style={{ width: '100%' }}>
                <Option value="today">Hôm nay</Option>
                <Option value="yesterday">Hôm qua</Option>
                <Option value="last7">7 ngày gần nhất</Option>
                <Option value="last30">30 ngày gần nhất</Option>
                <Option value="custom">Tùy chọn...</Option>
              </Select>
            </Col>
            <Col span={8}>
              {dayMode === 'custom' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    <CalendarOutlined /> Chọn ngày:
                  </label>
                  <DatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    format="DD/MM/YYYY"
                    style={{ width: '100%' }}
                    placeholder="Chọn ngày"
                  />
                </div>
              )}
            </Col>
            {/* Bỏ chọn ca vì dữ liệu lấy theo log xác thực trong ngày */}
            <Col span={8}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                <SearchOutlined /> Tìm kiếm:
              </label>
              <Search
                placeholder="Tìm theo tên hoặc vai trò"
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
          dataSource={filteredLogs}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, size) => setPagination(prev => ({ ...prev, current: page, pageSize: size })),
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => {
              if (dayMode === 'last7') return `${range[0]}-${range[1]} của ${total} bản ghi (7 ngày gần nhất)`;
              if (dayMode === 'last30') return `${range[0]}-${range[1]} của ${total} bản ghi (30 ngày gần nhất)`;
              return `${range[0]}-${range[1]} của ${total} bản ghi ${selectedDate ? 'ngày ' + selectedDate.format('DD/MM/YYYY') : ''}`;
            }
          }}
        />
      </Card>
    </div>
  );
};

export default DailyShiftAttendance;
