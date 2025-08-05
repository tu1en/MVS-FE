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
  const [testUsers, setTestUsers] = useState([]);

  // HELPER FUNCTIONS
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
      render: (time) => (typeof time === 'string' ? time.substring(0, 5) : '-'),
    },
    {
      title: 'Giờ ra',
      dataIndex: 'checkOut',
      key: 'checkOut',
      render: (time) => (typeof time === 'string' ? time.substring(0, 5) : '-'),
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
    loadTestUsers();
  }, []);

  useEffect(() => {
    if (testUsers.length > 0) {
      fetchLogs();
    }
  }, [pagination.current, pagination.pageSize, dateRange, testUsers, selectedUserId]);

  // MAIN FUNCTIONS
  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      // Nếu không chọn user cụ thể, lấy dữ liệu của tất cả user
      if (!selectedUserId) {
        console.log('Fetching data for all users...');
        
        // Lấy dữ liệu cho tất cả user có trong danh sách
        const allPromises = testUsers.map(async (userString) => {
          const idMatch = userString.match(/ID: (\d+)/);
          const userId = idMatch ? idMatch[1] : '';
          
          if (!userId) return [];
          
          try {
            const params = {
              userId: userId,
              startDate: dateRange[0].format('YYYY-MM-DD'),
              endDate: dateRange[1].format('YYYY-MM-DD')
            };
            
            const response = await api.get('/attendance/my-history-range', { params });
            const rawData = response.data?.data ?? response.data ?? [];
            return Array.isArray(rawData) ? rawData : [];
          } catch (error) {
            console.error(`Error fetching data for user ${userId}:`, error);
            return [];
          }
        });
        
        // Chờ tất cả request hoàn thành
        const allResults = await Promise.all(allPromises);
        
        // Gộp tất cả dữ liệu lại
        const allData = allResults.flat();
        
        console.log('All users data:', allData);
        setLogs(allData);
        
        // Tính toán thống kê tổng
        const presentCount = allData.filter(log => log.status === 'PRESENT').length;
        const absentCount = allData.filter(log => log.status === 'ABSENT').length;
        const lateCount = allData.filter(log => log.status === 'LATE').length;
        
        const totalHours = allData.reduce((sum, log) => {
          if (log.checkIn && log.checkOut) {
            const today = dayjs().format('YYYY-MM-DD');
            const checkIn = dayjs(`${today} ${log.checkIn}`);
            const checkOut = dayjs(`${today} ${log.checkOut}`);
            const hours = checkOut.diff(checkIn, 'hour', true);
            return sum + (hours > 0 ? hours : 0);
          }
          return sum;
        }, 0);
        
        setStatistics({
          totalRecords: allData.length,
          presentCount,
          absentCount,
          lateCount,
          totalHours: Math.round(totalHours * 10) / 10
        });
        
        setPagination(prev => ({
          ...prev,
          total: allData.length
        }));
        
      } else {
        // Logic cũ cho user cụ thể
        const params = {
          userId: selectedUserId,
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD')
        };
        
        console.log('Making API call with params:', params);
        
        const response = await api.get('/attendance/my-history-range', { params });
        console.log('API response:', response);
        
        const rawData = response.data?.data ?? response.data ?? [];
        const data = Array.isArray(rawData) ? rawData : [];

        console.log('Processed data:', data);
        
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
            const today = dayjs().format('YYYY-MM-DD');
            const checkIn = dayjs(`${today} ${log.checkIn}`);
            const checkOut = dayjs(`${today} ${log.checkOut}`);
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
      }
      
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

  const loadTestUsers = async () => {
    try {
      const response = await api.get('/debug/users');
      console.log('Test users:', response.data);
      setTestUsers(response.data);
      message.success('Đã tải danh sách người dùng test');
    } catch (error) {
      console.error('Error loading test users:', error);
      message.error('Không thể tải danh sách người dùng test');
    }
  };

  const handleRefresh = () => {
    fetchLogs();
  };

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
            <Button type="default" onClick={loadTestUsers}>
              Tải danh sách User ID
            </Button>
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportExcel} disabled={logs.length === 0}>
              Xuất CSV
            </Button>
            <Button type="primary" icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              Làm mới
            </Button>
          </Space>
        </div>

        {/* Test Users Display */}
        {testUsers.length > 0 && (
          <Card style={{ marginBottom: '16px', backgroundColor: '#f6ffed' }}>
            <h4>🔍 Danh sách User ID có sẵn (để test):</h4>
            <p style={{ marginBottom: '8px', color: '#666' }}>
              {selectedUserId ? 
                `Đang xem dữ liệu của user ${selectedUserId}. Nhấn "Xem tất cả" để xem toàn bộ dữ liệu.` :
                'Đang hiển thị dữ liệu chấm công của TẤT CẢ nhân viên. Nhấp vào một User ID để xem riêng.'
              }
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              <Button 
                size="small" 
                onClick={() => setSelectedUserId('')}
                type={!selectedUserId ? 'primary' : 'default'}
              >
                Xem tất cả
              </Button>
              {testUsers.map((userString, index) => {
                const idMatch = userString.match(/ID: (\d+)/);
                const nameMatch = userString.match(/Name: ([^,]+)/);
                const userId = idMatch ? idMatch[1] : '';
                const userName = nameMatch ? nameMatch[1] : '';
                
                return (
                  <Button 
                    key={index} 
                    size="small" 
                    onClick={() => setSelectedUserId(userId)}
                    type={selectedUserId === userId ? 'primary' : 'default'}
                  >
                    ID: {userId} - {userName}
                  </Button>
                );
              })}
            </div>
          </Card>
        )}

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
              <Select
                showSearch
                value={selectedUserId}
                onChange={(value) => setSelectedUserId(value)}
                placeholder="Chọn nhân viên (để trống = xem tất cả)"
                style={{ width: '100%' }}
                allowClear
                filterOption={(input, option) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
                options={[
                  { value: '', label: 'Tất cả nhân viên' },
                  ...testUsers.map((userString) => {
                    const idMatch = userString.match(/ID: (\d+)/);
                    const nameMatch = userString.match(/Name: ([^,]+)/);
                    const userId = idMatch ? idMatch[1] : '';
                    const userName = nameMatch ? nameMatch[1] : '';
                    const label = `${userName} (ID: ${userId})`;

                    return {
                      value: userId,
                      label: label,
                    };
                  })
                ]}
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
        {testUsers.length === 0 ? (
          <Empty
            description="Nhấn 'Tải danh sách User ID' để xem dữ liệu chấm công của tất cả nhân viên"
            style={{ margin: '40px 0' }}
          />
        ) : (
          <div>
            <div style={{ marginBottom: '16px', color: '#666' }}>
              <strong>
                {selectedUserId ? 
                  `Hiển thị dữ liệu của nhân viên có ID: ${selectedUserId}` :
                  `Hiển thị dữ liệu của TẤT CẢ nhân viên (${logs.length} bản ghi)`
                }
              </strong>
            </div>
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
          </div>
        )}
      </Card>
    </div>
  );
};

export default PersonalAttendanceHistory;