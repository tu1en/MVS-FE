import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
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
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Option } = Select;
const { Search } = Input;

dayjs.extend(customParseFormat);

const TeacherAttendanceStatus = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedShift, setSelectedShift] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [stats, setStats] = useState({
    totalTeachers: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.current, pagination.pageSize, selectedDate, selectedShift]);

  const decodeLatin1ToUtf8 = (str) => {
    if (!str || typeof str !== 'string') return str;
    try {
      // Chuyển các chuỗi bị decode sai ISO-8859-1 về UTF-8 (trường hợp "Ð?ng" → "Đặng")
      const converted = decodeURIComponent(escape(str));
      // Nếu sau khi convert độ dài thay đổi hoặc xuất hiện các ký tự tiếng Việt, dùng bản convert
      if (converted && converted !== str) return converted;
      return str;
    } catch {
      return str;
    }
  };

  const formatDateSafe = (value) => {
    if (!value) return '-';
    if (Array.isArray(value)) {
      const [y, m, d] = value;
      if (y && m && d) {
        const parsed = dayjs(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, 'YYYY-MM-DD', true);
        return parsed.isValid() ? parsed.format('DD/MM/YYYY') : '-';
      }
    }
    const fmts = ['YYYY-MM-DD', 'DD/MM/YYYY', 'YYYY/MM/DD', 'DD-MM-YYYY', 'MM/DD/YYYY'];
    for (const f of fmts) {
      const p = dayjs(value, f, true);
      if (p.isValid()) return p.format('DD/MM/YYYY');
    }
    const p = dayjs(value);
    return p.isValid() ? p.format('DD/MM/YYYY') : '-';
  };

  const formatTimeSafe = (value) => {
    if (!value) return '-';
    if (Array.isArray(value)) {
      const hh = String(value[0] ?? 0).padStart(2, '0');
      const mm = String(value[1] ?? 0).padStart(2, '0');
      return `${hh}:${mm}`;
    }
    const fmts = ['HH:mm', 'HH:mm:ss', 'YYYY-MM-DDTHH:mm:ssZ', 'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DD HH:mm:ss'];
    for (const f of fmts) {
      const p = dayjs(value, f, true);
      if (p.isValid()) return p.format('HH:mm');
    }
    const p = dayjs(value);
    return p.isValid() ? p.format('HH:mm') : '-';
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        date: selectedDate.format('YYYY-MM-DD'),
        page: pagination.current - 1,
        size: pagination.pageSize
      };
      
      if (selectedShift !== 'all') {
        params.shift = selectedShift;
      }
      
      const response = await api.get('/attendance/teacher-status', { params });
      const raw = response.data.data || response.data;

      const mapped = (Array.isArray(raw) ? raw : []).map((it, idx) => ({
        id: it.id ?? idx + 1,
        userId: it.userId,
        userName: decodeLatin1ToUtf8(it.userName),
        role: it.role,
        department: it.department,
        date: it.date,
        shift: it.shift,
        checkIn: it.checkIn ?? it.checkInTime,
        checkOut: it.checkOut ?? it.checkOutTime,
        status: it.status
      }));

      setLogs(mapped);
      setPagination(prev => ({
        ...prev,
        total: response.data.totalElements || mapped.length
      }));
      
      // Calculate statistics
      const presentCount = mapped.filter(log => log.status === 'PRESENT').length;
      const absentCount = mapped.filter(log => log.status === 'ABSENT').length;
      const lateCount = mapped.filter(log => log.status === 'LATE').length;
      
      setStats({
        totalTeachers: mapped.length,
        presentCount,
        absentCount,
        lateCount
      });
      
    } catch (error) {
      console.error('Error fetching teacher attendance:', error);
      message.error('Không thể tải dữ liệu chấm công giáo viên');
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
      log.userName?.toLowerCase().includes(searchText.toLowerCase());
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
      title: 'Tên giáo viên',
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
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => formatDateSafe(date),
    },
    // {
    //   title: 'Ca làm',
    //   dataIndex: 'shift',
    //   key: 'shift',
    //   render: (shift) => (
    //     <Tag color='cyan'>
    //       <ClockCircleOutlined /> {shift || 'Ca chính'}
    //     </Tag>
    //   ),
    // },
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
            <UserOutlined style={{ marginRight: 8 }} />
            Chấm công giáo viên
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
                title="Tổng số giáo viên"
                value={stats.totalTeachers}
                prefix={<UserOutlined />}
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
                <CalendarOutlined /> Chọn ngày:
              </label>
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                placeholder="Chọn ngày"
              />
            </Col>
            {/* <Col span={8}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                <ClockCircleOutlined /> Ca làm:
              </label>
              <Select
                value={selectedShift}
                onChange={setSelectedShift}
                style={{ width: '100%' }}
                placeholder="Chọn ca làm"
              >
                <Option value="all">Tất cả</Option>
                <Option value="morning">Ca sáng</Option>
                <Option value="afternoon">Ca chiều</Option>
                <Option value="evening">Ca tối</Option>
              </Select>
            </Col> */}
            <Col span={8}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                <SearchOutlined /> Tìm kiếm:
              </label>
              <Search
                placeholder="Tìm theo tên giáo viên"
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
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} giáo viên`
          }}
        />
      </Card>
    </div>
  );
};

export default TeacherAttendanceStatus;
