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
  Empty
} from 'antd';
import { 
  HistoryOutlined, 
  TeamOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

const PersonalAttendanceHistory = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
  const [selectedUserId, setSelectedUserId] = useState('');
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

  useEffect(() => {
    if (selectedUserId) {
      fetchLogs();
    }
  }, [pagination.current, pagination.pageSize, dateRange, selectedUserId]);

  const fetchLogs = async () => {
    if (!selectedUserId) {
      setLogs([]);
      return;
    }

    try {
      setLoading(true);
      const params = {
        userId: selectedUserId,
        page: pagination.current - 1,
        size: pagination.pageSize
      };
      
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      const response = await api.get('/attendance/my-history', { params });
      const data = response.data.data || response.data;
      
      setLogs(data);
      setPagination(prev => ({
        ...prev,
        total: response.data.totalElements || data.length
      }));
      
      // Calculate statistics
      const presentCount = data.filter(log => log.status === 'PRESENT').length;
      const absentCount = data.filter(log => log.status === 'ABSENT').length;
      const lateCount = data.filter(log => log.status === 'LATE').length;
      
      // Calculate total working hours
      const totalHours = data.reduce((sum, log) => {
        if (log.checkIn && log.checkOut) {
          const checkIn = dayjs(log.checkIn);
          const checkOut = dayjs(log.checkOut);
          const hours = checkOut.diff(checkIn, 'hour', true);
          return sum + (hours > 0 ? hours : 0);
        }
        return sum;
      }, 0);
      
      setStatistics({
        totalRecords: data.length,
        presentCount,
        absentCount,
        lateCount,
        totalHours: Math.round(totalHours * 10) / 10
      });
      
    } catch (error) {
      console.error('Error fetching personal attendance history:', error);
      message.error('Không thể tải lịch sử chấm công cá nhân');
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

  const getShiftText = (shift) => {
    switch(shift) {
      case 'morning': return 'Ca sáng';
      case 'afternoon': return 'Ca chiều';
      case 'evening': return 'Ca tối';
      default: return shift;
    }
  };

  const handleRefresh = () => {
    if (selectedUserId) {
      fetchLogs();
    }
  };

  const handleExportExcel = async () => {
    if (!selectedUserId) {
      message.warning('Vui lòng chọn nhân viên trước khi xuất báo cáo');
      return;
    }

    try {
      const params = {
        userId: selectedUserId
      };
      
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      const response = await api.get('/attendance/export/personal-history', {
        params,
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `lich_su_cham_cong_ca_nhan_${selectedUserId}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
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

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchText || 
      log.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
      log.shift?.toLowerCase().includes(searchText.toLowerCase());
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
      render: (time) => time ? dayjs(time).format('HH:mm') : '-',
    },
    {
      title: 'Giờ ra',
      dataIndex: 'checkOut',
      key: 'checkOut',
      render: (time) => time ? dayjs(time).format('HH:mm') : '-',
    },
    {
      title: 'Số giờ làm',
      key: 'workingHours',
      render: (_, record) => {
        if (record.checkIn && record.checkOut) {
          const checkIn = dayjs(record.checkIn);
          const checkOut = dayjs(record.checkOut);
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

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>
            <HistoryOutlined style={{ marginRight: 8 }} />
            Lịch sử chấm công cá nhân
          </h2>
          <Space>
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportExcel} disabled={!selectedUserId}>
              Xuất Excel
            </Button>
            <Button type="primary" icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading} disabled={!selectedUserId}>
              Làm mới
            </Button>
          </Space>
        </div>

        {/* Statistics Cards */}
        {selectedUserId && (
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
            <Col span={8}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                <UserOutlined /> Mã nhân viên:
              </label>
              <Input
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                placeholder="Nhập mã nhân viên"
                style={{ width: '100%' }}
              />
            </Col>
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
        {!selectedUserId ? (
          <Empty
            description="Vui lòng nhập mã nhân viên để xem lịch sử chấm công"
            style={{ margin: '40px 0' }}
          />
        ) : (
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
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi lịch sử chấm công`
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default PersonalAttendanceHistory;
