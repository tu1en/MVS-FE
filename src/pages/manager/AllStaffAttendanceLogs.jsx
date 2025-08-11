import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined
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
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Option } = Select;
const { Search } = Input;

dayjs.extend(customParseFormat);

const AllStaffAttendanceLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [stats, setStats] = useState({
    totalLogs: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.current, pagination.pageSize, selectedDate]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      if (!selectedDate) {
        message.warning("Vui lòng chọn ngày để tải dữ liệu.");
        return;
      }

      const params = {
        date: dayjs(selectedDate).format('YYYY-MM-DD'),
        page: pagination.current - 1,
        size: pagination.pageSize
      };
      
      const response = await api.get('/attendance/all-logs', { params });
      const raw = response.data.data || response.data;

      const mapped = (Array.isArray(raw) ? raw : []).map((item, index) => {
        const userName = item.userName || item.employeeName || item.fullName || item.name || '';
        const role = item.role || item.userRole || item.position || 'STAFF';
        const department = item.department || item.departmentName || item.dept || '';
        const date = item.date || item.attendanceDate || item.workDate || selectedDate?.toISOString?.() || selectedDate;
        const checkIn = item.checkIn ?? item.checkInTime ?? item.check_in ?? item.startTime ?? null;
        const checkOut = item.checkOut ?? item.checkOutTime ?? item.check_out ?? item.endTime ?? null;
        const status = item.status || item.attendanceStatus || item.state || '';
        const shift = item.shift || undefined;
        return {
          id: item.id ?? index + 1,
          userName,
          role,
          department,
          date,
          shift,
          checkIn,
          checkOut,
          status
        };
      });

      setLogs(mapped);
      setPagination(prev => ({
        ...prev,
        total: response.data.totalElements || mapped.length
      }));
      
      // Calculate statistics
      const upper = (s) => String(s || '').toUpperCase();
      const presentCount = mapped.filter(log => ['PRESENT','HOÀN THÀNH','COMPLETED'].some(k => upper(log.status).includes(k))).length;
      const absentCount = mapped.filter(log => ['ABSENT','VẮNG'].some(k => upper(log.status).includes(k))).length;
      const lateCount = mapped.filter(log => ['LATE','MUỘN'].some(k => upper(log.status).includes(k))).length;
      
      setStats({
        totalLogs: mapped.length,
        presentCount,
        absentCount,
        lateCount
      });
      
    } catch (error) {
      console.error('Error fetching logs:', error);
      message.error('Không thể tải dữ liệu chấm công');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PRESENT': return 'success';
      case 'ABSENT': return 'error';
      case 'LATE': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'PRESENT': return <CheckCircleOutlined />;
      case 'ABSENT': return <CloseCircleOutlined />;
      case 'LATE': return <ExclamationCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'PRESENT': return 'Có mặt';
      case 'ABSENT': return 'Vắng mặt';
      case 'LATE': return 'Đi muộn';
      default: return status;
    }
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchText || 
      log.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
      log.department?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || log.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const formatDateSafe = (value) => {
    if (!value) return '-';
    // Try a set of common formats first
    const dateFormats = [
      'YYYY-MM-DD',
      'DD/MM/YYYY',
      'YYYY/MM/DD',
      'DD-MM-YYYY',
      'MM/DD/YYYY'
    ];
    for (const fmt of dateFormats) {
      const parsed = dayjs(value, fmt, true);
      if (parsed.isValid()) return parsed.format('DD/MM/YYYY');
    }
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : '-';
  };

  const formatTimeSafe = (value) => {
    if (!value) return '-';
    if (Array.isArray(value)) {
      const hh = String(value[0] ?? 0).padStart(2, '0');
      const mm = String(value[1] ?? 0).padStart(2, '0');
      return `${hh}:${mm}`;
    }
    const timeFormats = ['HH:mm', 'HH:mm:ss', 'YYYY-MM-DDTHH:mm:ssZ', 'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DD HH:mm:ss'];
    for (const fmt of timeFormats) {
      const parsed = dayjs(value, fmt, true);
      if (parsed.isValid()) return parsed.format('HH:mm');
    }
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('HH:mm') : '-';
  };

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
          <TeamOutlined />
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
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      render: (text) => text || 'Không xác định',
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => formatDateSafe(date),
    },
    {
      title: 'Ca làm',
      dataIndex: 'shift',
      key: 'shift',
      render: (shift) => (
        <Tag color='cyan'>
          <ClockCircleOutlined /> {shift || 'Ca chính'}
        </Tag>
      ),
    },
    {
      title: 'Giờ vào',
      dataIndex: 'checkIn',
      key: 'checkIn',
      render: (time) => formatTimeSafe(time),
    },
    {
      title: 'Giờ ra',
      dataIndex: 'checkOut',
      key: 'checkOut',
      render: (time) => formatTimeSafe(time),
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
            <TeamOutlined style={{ marginRight: 8 }} />
            Toàn bộ chấm công nhân viên
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
                value={stats.totalLogs}
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
            <Col span={6}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                <CalendarOutlined /> Chọn ngày:
              </label>
              <DatePicker
                value={selectedDate}
                onChange={(value) => setSelectedDate(value || dayjs())}
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                placeholder="Chọn ngày"
              />
            </Col>
            <Col span={6}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                <SearchOutlined /> Tìm kiếm:
              </label>
              <Search
                placeholder="Tìm theo tên hoặc phòng ban"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={6}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Trạng thái:
              </label>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
                placeholder="Chọn trạng thái"
              >
                <Option value="all">Tất cả</Option>
                <Option value="PRESENT">Có mặt</Option>
                <Option value="ABSENT">Vắng mặt</Option>
                <Option value="LATE">Đi muộn</Option>
              </Select>
            </Col>
            <Col span={6}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Phòng ban:
              </label>
              <Select
                value={departmentFilter}
                onChange={setDepartmentFilter}
                style={{ width: '100%' }}
                placeholder="Chọn phòng ban"
              >
                <Option value="all">Tất cả</Option>
                <Option value="IT">IT</Option>
                <Option value="HR">HR</Option>
                <Option value="Finance">Tài chính</Option>
                <Option value="Education">Giáo dục</Option>
              </Select>
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
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`
          }}
        />
      </Card>
    </div>
  );
};

export default AllStaffAttendanceLogs;
