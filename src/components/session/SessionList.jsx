import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Card,
  Tag,
  Modal,
  message,
  Tooltip,
  Popconfirm,
  DatePicker,
  Select
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import sessionService from '../../services/sessionService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * Component hiển thị danh sách sessions
 */
const SessionList = () => {
  const navigate = useNavigate();
  const { classroomId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Load sessions data
  const loadSessions = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      let response;
      
      if (classroomId) {
        response = await sessionService.getSessionsByClassroom(classroomId);
        setSessions(response || []);
        setPagination(prev => ({ ...prev, total: response?.length || 0 }));
      } else {
        response = await sessionService.getAllSessions({
          page: page - 1,
          size,
        });
        setSessions(response.content || []);
        setPagination({
          current: page,
          pageSize: size,
          total: response.totalElements || 0,
        });
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      message.error('Không thể tải danh sách buổi học');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadSessions();
  }, [classroomId]);

  // Handle table change
  const handleTableChange = (paginationInfo) => {
    if (!classroomId) {
      loadSessions(paginationInfo.current, paginationInfo.pageSize);
    }
  };

  // Handle delete session
  const handleDelete = async (id) => {
    try {
      await sessionService.deleteSession(id);
      message.success('Xóa buổi học thành công');
      loadSessions(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error deleting session:', error);
      message.error('Không thể xóa buổi học');
    }
  };

  // Get status color and icon
  const getStatusDisplay = (status) => {
    const statusMap = {
      UPCOMING: { color: 'blue', icon: <CalendarOutlined />, text: 'Sắp diễn ra' },
      IN_PROGRESS: { color: 'green', icon: <PlayCircleOutlined />, text: 'Đang diễn ra' },
      COMPLETED: { color: 'default', icon: <CheckCircleOutlined />, text: 'Đã hoàn thành' },
      CANCELLED: { color: 'red', icon: <PauseCircleOutlined />, text: 'Đã hủy' },
    };
    
    const config = statusMap[status] || statusMap.UPCOMING;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // Filter sessions by date range and status
  const filteredSessions = sessions.filter(session => {
    let matchDate = true;
    let matchStatus = true;

    if (dateRange.length === 2) {
      const sessionDate = dayjs(session.sessionDate);
      matchDate = sessionDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
    }

    if (statusFilter) {
      matchStatus = session.status === statusFilter;
    }

    return matchDate && matchStatus;
  });

  // Table columns
  const columns = [
    {
      title: 'Ngày Học',
      dataIndex: 'sessionDate',
      key: 'sessionDate',
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format('DD/MM/YYYY')}
        </Space>
      ),
      sorter: (a, b) => dayjs(a.sessionDate).unix() - dayjs(b.sessionDate).unix(),
    },
    {
      title: 'Lớp Học',
      dataIndex: 'classroomName',
      key: 'classroomName',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/classrooms/${record.classroomId}`)}
          style={{ padding: 0 }}
        >
          {text || `Classroom ${record.classroomId}`}
        </Button>
      ),
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text || 'Không có mô tả'}
        </Tooltip>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => getStatusDisplay(status),
    },
    {
      title: 'Số Slot',
      dataIndex: 'slotCount',
      key: 'slotCount',
      align: 'center',
      render: (count) => (
        <Tag color="blue">{count || 0} slot</Tag>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              ghost
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/sessions/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/sessions/${record.id}/edit`)}
              disabled={record.status === 'COMPLETED'}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa buổi học"
              description="Bạn có chắc chắn muốn xóa buổi học này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okType="danger"
            >
              <Button
                type="primary"
                danger
                size="small"
                icon={<DeleteOutlined />}
                disabled={record.status === 'IN_PROGRESS' || record.status === 'COMPLETED'}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={classroomId ? 'Danh Sách Buổi Học' : 'Quản Lý Buổi Học'}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(classroomId ? `/classrooms/${classroomId}/sessions/create` : '/sessions/create')}
        >
          Tạo Buổi Học Mới
        </Button>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Filters */}
        <Space wrap>
          <RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            format="DD/MM/YYYY"
            onChange={setDateRange}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            style={{ width: 150 }}
            onChange={setStatusFilter}
          >
            <Option value="UPCOMING">Sắp diễn ra</Option>
            <Option value="IN_PROGRESS">Đang diễn ra</Option>
            <Option value="COMPLETED">Đã hoàn thành</Option>
            <Option value="CANCELLED">Đã hủy</Option>
          </Select>
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredSessions}
          rowKey="id"
          loading={loading}
          pagination={classroomId ? false : {
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} buổi học`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Space>
    </Card>
  );
};

export default SessionList;
