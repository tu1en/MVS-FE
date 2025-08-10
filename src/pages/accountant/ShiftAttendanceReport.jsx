import {
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DownloadOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined,
    SearchOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Input, message, Row, Select, Space, Statistic, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import attendanceService from '../../services/attendanceService';

const { RangePicker } = DatePicker;
const { Search } = Input;
const { Option } = Select;

const ShiftAttendanceReport = () => {
  const [loading, setLoading] = useState(false);
  const [rangeMode, setRangeMode] = useState('thisMonth'); // thisMonth | lastMonth | custom
  const [range, setRange] = useState(() => [dayjs().startOf('month'), dayjs().endOf('month')]);
  const [searchText, setSearchText] = useState('');
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [stats, setStats] = useState({ totalRecords: 0, presentCount: 0, absentCount: 0, lateCount: 0, totalHours: 0 });

  useEffect(() => {
    if (rangeMode !== 'custom') {
      if (rangeMode === 'thisMonth') setRange([dayjs().startOf('month'), dayjs().endOf('month')]);
      if (rangeMode === 'lastMonth') {
        const last = dayjs().subtract(1, 'month');
        setRange([last.startOf('month'), last.endOf('month')]);
      }
    }
  }, [rangeMode]);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, pagination.current, pagination.pageSize]);

  const normalizeToHour = (time) => {
    if (!time) return null;
    if (typeof time === 'string') return parseInt(time.split(':')[0] || '0', 10);
    if (Array.isArray(time)) return parseInt(time[0] ?? 0, 10);
    return null;
  };
  const classifyShift = (checkIn) => {
    const h = normalizeToHour(checkIn);
    if (h === null) return undefined;
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
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
    if (!status) return <CalendarOutlined />;
    const s = String(status).toUpperCase();
    if (s.includes('PRESENT') || s.includes('HOÀN THÀNH')) return <CheckCircleOutlined />;
    if (s.includes('ABSENT') || s.includes('VẮNG')) return <CloseCircleOutlined />;
    if (s.includes('LATE') || s.includes('MUỘN')) return <ExclamationCircleOutlined />;
    return <CalendarOutlined />;
  };
  const getStatusText = (status) => {
    if (!status) return '-';
    switch (status) {
      case 'PRESENT': return 'Có mặt';
      case 'ABSENT': return 'Vắng mặt';
      case 'LATE': return 'Đi muộn';
      default: return status;
    }
  };
  const getShiftText = (shift) => {
    switch (shift) {
      case 'morning': return 'Ca sáng';
      case 'afternoon': return 'Ca chiều';
      case 'evening': return 'Ca tối';
      default: return shift || '-';
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      if (!range || range.length !== 2) {
        message.warning('Vui lòng chọn khoảng thời gian');
        return;
      }
      const start = range[0];
      const end = range[1];
      const days = end.diff(start, 'day') + 1;
      const requests = Array.from({ length: days }, (_, i) => {
        const d = start.add(i, 'day').format('YYYY-MM-DD');
        return attendanceService.getDayLogs(d).catch(() => []);
      });
      const results = await Promise.all(requests);
      const data = results.flat().filter(Boolean);

      const mapped = data.map((it, idx) => ({
        id: idx + 1,
        userName: it.userName || '',
        role: it.role || 'STAFF',
        date: it.date,
        checkIn: it.checkInTime,
        checkOut: it.checkOutTime,
        status: it.status,
        shift: it.shift || classifyShift(it.checkInTime),
        workingHours: typeof it.workingHours === 'number' ? it.workingHours : undefined,
      }));

      setLogs(mapped);
      setPagination(prev => ({ ...prev, total: mapped.length }));

      const presentCount = mapped.filter(r => String(r.status).toUpperCase().includes('HOÀN THÀNH') || String(r.status).toUpperCase().includes('PRESENT')).length;
      const absentCount = mapped.filter(r => String(r.status).toUpperCase().includes('ABSENT') || String(r.status).toUpperCase().includes('VẮNG')).length;
      const lateCount = mapped.filter(r => String(r.status).toUpperCase().includes('LATE') || String(r.status).toUpperCase().includes('MUỘN')).length;
      const totalHours = data.reduce((sum, it) => sum + (typeof it.workingHours === 'number' ? it.workingHours : 0), 0);

      setStats({ totalRecords: mapped.length, presentCount, absentCount, lateCount, totalHours: Math.round(totalHours * 10) / 10 });
    } catch (error) {
      console.error('Fetch shift report error:', error);
      message.error('Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = !searchText ||
        log.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
        log.role?.toLowerCase().includes(searchText.toLowerCase());
      return matchesSearch;
    });
  }, [logs, searchText]);

  const exportCsv = () => {
    const headers = ['Tên', 'Vai trò', 'Ngày', 'Ca', 'Giờ vào', 'Giờ ra', 'Trạng thái', 'Giờ công'];
    const rows = filteredLogs.map(r => [
      r.userName,
      r.role,
      dayjs(r.date).format('YYYY-MM-DD'),
      getShiftText(r.shift),
      typeof r.checkIn === 'string' ? r.checkIn.substring(0,5) : Array.isArray(r.checkIn) ? `${String(r.checkIn[0]).padStart(2,'0')}:${String(r.checkIn[1]).padStart(2,'0')}` : '',
      typeof r.checkOut === 'string' ? r.checkOut.substring(0,5) : Array.isArray(r.checkOut) ? `${String(r.checkOut[0]).padStart(2,'0')}:${String(r.checkOut[1]).padStart(2,'0')}` : '',
      getStatusText(r.status),
      r.workingHours ?? ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `shift-attendance-${dayjs().format('YYYYMMDD-HHmmss')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    message.success('Đã xuất CSV');
  };

  const columns = [
    { title: 'Tên', dataIndex: 'userName', key: 'userName' },
    { title: 'Vai trò', dataIndex: 'role', key: 'role' },
    { title: 'Ngày', dataIndex: 'date', key: 'date', render: d => dayjs(d).format('DD/MM/YYYY') },
    { title: 'Ca', dataIndex: 'shift', key: 'shift', render: s => <Tag color="cyan">{getShiftText(s)}</Tag> },
    { title: 'Giờ vào', dataIndex: 'checkIn', key: 'checkIn', render: t => (typeof t === 'string' ? t.substring(0,5) : Array.isArray(t) ? `${String(t[0]).padStart(2,'0')}:${String(t[1]).padStart(2,'0')}` : '-') },
    { title: 'Giờ ra', dataIndex: 'checkOut', key: 'checkOut', render: t => (typeof t === 'string' ? t.substring(0,5) : Array.isArray(t) ? `${String(t[0]).padStart(2,'0')}:${String(t[1]).padStart(2,'0')}` : '-') },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: s => <Tag color={getStatusColor(s)} icon={getStatusIcon(s)}>{getStatusText(s)}</Tag> },
    { title: 'Giờ công', dataIndex: 'workingHours', key: 'workingHours' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0 }}>Báo cáo chấm công theo ca</h2>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={exportCsv}>Xuất CSV</Button>
            <Button type="primary" icon={<ReloadOutlined />} onClick={fetchLogs} loading={loading}>Làm mới</Button>
          </Space>
        </div>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Chu kỳ:
            </label>
            <Select value={rangeMode} onChange={setRangeMode} style={{ width: '100%' }}>
              <Option value="thisMonth">Tháng này</Option>
              <Option value="lastMonth">Tháng trước</Option>
              <Option value="custom">Tùy chọn...</Option>
            </Select>
          </Col>
          <Col span={10}>
            {rangeMode === 'custom' && (
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                  <CalendarOutlined /> Khoảng thời gian:
                </label>
                <RangePicker
                  value={range}
                  onChange={(v) => setRange(v)}
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </Col>
          <Col span={8}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
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

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}><Card><Statistic title="Tổng số bản ghi" value={stats.totalRecords} prefix={<TeamOutlined />} valueStyle={{ color: '#1890ff' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="Có mặt" value={stats.presentCount} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="Vắng mặt" value={stats.absentCount} prefix={<CloseCircleOutlined />} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="Đi muộn" value={stats.lateCount} prefix={<ExclamationCircleOutlined />} valueStyle={{ color: '#faad14' }} /></Card></Col>
        </Row>

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
          }}
        />
      </Card>
    </div>
  );
};

export default ShiftAttendanceReport;


