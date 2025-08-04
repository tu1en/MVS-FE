import {
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography
} from 'antd';
import { useEffect, useState } from 'react';
import adminService from '../services/adminService';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const SystemActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [filters, setFilters] = useState({
    username: '',
    action: '',
    logLevel: '',
    dateRange: null
  });

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (createdAt) => {
        if (!createdAt) return '-';
        try {
          // Handle different date formats from backend
          let date;
          if (typeof createdAt === 'string') {
            // Try parsing ISO string or other formats
            date = new Date(createdAt);
          } else if (Array.isArray(createdAt)) {
            // Handle LocalDateTime array format [year, month, day, hour, minute, second]
            const [year, month, day, hour = 0, minute = 0, second = 0] = createdAt;
            date = new Date(year, month - 1, day, hour, minute, second);
          } else {
            date = new Date(createdAt);
          }
          
          if (isNaN(date.getTime())) {
            return 'Invalid Date';
          }
          
          return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        } catch (error) {
          console.error('Date parsing error:', error, 'Raw value:', createdAt);
          return 'Invalid Date';
        }
      }
    },
    {
      title: 'Người dùng',
      dataIndex: 'username',
      key: 'username',
      width: 120
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 150
    },
    {
      title: 'Mức độ',
      dataIndex: 'logLevel',
      key: 'logLevel',
      width: 100,
      render: (level) => {
        const color = {
          INFO: 'blue',
          WARN: 'orange',
          ERROR: 'red',
          DEBUG: 'green'
        };
        return <Tag color={color[level] || 'default'}>{level}</Tag>;
      }
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 120
    },
    {
      title: 'Chi tiết',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true
    }
  ];

  const fetchLogs = async (page = 1, size = 20) => {
    setLoading(true);
    try {
      const response = await adminService.getSystemLogs(page - 1, size);
      if (response.success) {
        // Add unique keys to each log entry
        const logsWithKeys = (response.data.content || []).map((log, index) => ({
          ...log,
          key: log.id || `log-${index}`
        }));
        setLogs(logsWithKeys);
        setPagination({
          current: page,
          pageSize: size,
          total: response.data.totalElements || 0
        });
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
    setLoading(false);
  };

  const handleTableChange = (pagination) => {
    fetchLogs(pagination.current, pagination.pageSize);
  };

  const handleSearch = () => {
    fetchLogs(1, pagination.pageSize);
  };

  const handleReset = () => {
    setFilters({
      username: '',
      action: '',
      logLevel: '',
      dateRange: null
    });
    fetchLogs(1, pagination.pageSize);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-6">
      <Card>
        <div className="mb-4">
          <Title level={2}>
            <SearchOutlined className="mr-2" />
            Nhật ký hoạt động hệ thống
          </Title>
        </div>

        {/* Search Filters */}
        <Card size="small" className="mb-4">
          <Space wrap>
            <Input
              placeholder="Tìm theo tên người dùng"
              value={filters.username}
              onChange={(e) => setFilters({...filters, username: e.target.value})}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
            <Input
              placeholder="Tìm theo hành động"
              value={filters.action}
              onChange={(e) => setFilters({...filters, action: e.target.value})}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Chọn mức độ log"
              value={filters.logLevel}
              onChange={(value) => setFilters({...filters, logLevel: value})}
              style={{ width: 150 }}
              allowClear
            >
              <Select.Option value="INFO">INFO</Select.Option>
              <Select.Option value="WARN">WARN</Select.Option>
              <Select.Option value="ERROR">ERROR</Select.Option>
              <Select.Option value="DEBUG">DEBUG</Select.Option>
            </Select>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters({...filters, dateRange: dates})}
              style={{ width: 250 }}
            />
            <Button type="primary" icon={<FilterOutlined />} onClick={handleSearch}>
              Tìm kiếm
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              Đặt lại
            </Button>
            <Button icon={<DownloadOutlined />}>
              Xuất Excel
            </Button>
          </Space>
        </Card>

        {/* Logs Table */}
        <Table
          columns={columns}
          dataSource={logs}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} bản ghi`
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default SystemActivityLogsPage;