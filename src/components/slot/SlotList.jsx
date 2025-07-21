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
  TimePicker,
  Select
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import slotService from '../../services/slotService';
import dayjs from 'dayjs';

const { Option } = Select;

/**
 * Component hiển thị danh sách slots
 */
const SlotList = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Load slots data
  const loadSlots = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      let response;
      
      if (sessionId) {
        response = await slotService.getSlotsBySession(sessionId);
        setSlots(response || []);
        setPagination(prev => ({ ...prev, total: response?.length || 0 }));
      } else {
        response = await slotService.getAllSlots({
          page: page - 1,
          size,
        });
        setSlots(response.content || []);
        setPagination({
          current: page,
          pageSize: size,
          total: response.totalElements || 0,
        });
      }
    } catch (error) {
      console.error('Error loading slots:', error);
      message.error('Không thể tải danh sách slot');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadSlots();
  }, [sessionId]);

  // Handle table change
  const handleTableChange = (paginationInfo) => {
    if (!sessionId) {
      loadSlots(paginationInfo.current, paginationInfo.pageSize);
    }
  };

  // Handle delete slot
  const handleDelete = async (id) => {
    try {
      await slotService.deleteSlot(id);
      message.success('Xóa slot thành công');
      loadSlots(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error deleting slot:', error);
      message.error('Không thể xóa slot');
    }
  };

  // Handle status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await slotService.updateSlotStatus(id, newStatus);
      message.success('Cập nhật trạng thái thành công');
      loadSlots(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error updating slot status:', error);
      message.error('Không thể cập nhật trạng thái');
    }
  };

  // Get status color and icon
  const getStatusDisplay = (status) => {
    const statusMap = {
      PENDING: { color: 'default', icon: <ClockCircleOutlined />, text: 'Chờ' },
      ACTIVE: { color: 'green', icon: <PlayCircleOutlined />, text: 'Đang diễn ra' },
      DONE: { color: 'blue', icon: <CheckCircleOutlined />, text: 'Hoàn thành' },
      CANCELLED: { color: 'red', icon: <PauseCircleOutlined />, text: 'Đã hủy' },
    };
    
    const config = statusMap[status] || statusMap.PENDING;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // Get status actions
  const getStatusActions = (record) => {
    const { status } = record;
    const actions = [];

    if (status === 'PENDING') {
      actions.push(
        <Button
          key="start"
          type="primary"
          size="small"
          icon={<PlayCircleOutlined />}
          onClick={() => handleStatusUpdate(record.id, 'ACTIVE')}
        >
          Bắt đầu
        </Button>
      );
    }

    if (status === 'ACTIVE') {
      actions.push(
        <Button
          key="complete"
          type="primary"
          size="small"
          icon={<CheckCircleOutlined />}
          onClick={() => handleStatusUpdate(record.id, 'DONE')}
        >
          Hoàn thành
        </Button>
      );
    }

    return actions;
  };

  // Filter slots by status
  const filteredSlots = slots.filter(slot => {
    if (statusFilter) {
      return slot.status === statusFilter;
    }
    return true;
  });

  // Table columns
  const columns = [
    {
      title: 'Tên Slot',
      dataIndex: 'slotName',
      key: 'slotName',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/slots/${record.id}`)}
          style={{ padding: 0, fontWeight: 'bold' }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Thời Gian',
      key: 'timeRange',
      render: (_, record) => (
        <Space>
          <ClockCircleOutlined />
          {dayjs(record.startTime, 'HH:mm:ss').format('HH:mm')} - {dayjs(record.endTime, 'HH:mm:ss').format('HH:mm')}
        </Space>
      ),
      sorter: (a, b) => {
        const timeA = dayjs(a.startTime, 'HH:mm:ss').unix();
        const timeB = dayjs(b.startTime, 'HH:mm:ss').unix();
        return timeA - timeB;
      },
    },
    {
      title: 'Thời Lượng',
      key: 'duration',
      align: 'center',
      render: (_, record) => {
        const start = dayjs(record.startTime, 'HH:mm:ss');
        const end = dayjs(record.endTime, 'HH:mm:ss');
        const duration = end.diff(start, 'minute');
        return <Tag color="blue">{duration} phút</Tag>;
      },
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
      title: 'Thao Tác',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space size="small" direction="vertical">
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <Button
                type="primary"
                ghost
                size="small"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/slots/${record.id}`)}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="default"
                size="small"
                icon={<EditOutlined />}
                onClick={() => navigate(`/slots/${record.id}/edit`)}
                disabled={record.status === 'DONE'}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Popconfirm
                title="Xóa slot"
                description="Bạn có chắc chắn muốn xóa slot này?"
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
                  disabled={record.status === 'ACTIVE' || record.status === 'DONE'}
                />
              </Popconfirm>
            </Tooltip>
          </Space>
          <Space size="small">
            {getStatusActions(record)}
          </Space>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={sessionId ? 'Danh Sách Slot' : 'Quản Lý Slot'}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(sessionId ? `/sessions/${sessionId}/slots/create` : '/slots/create')}
        >
          Tạo Slot Mới
        </Button>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Filters */}
        <Space wrap>
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            style={{ width: 150 }}
            onChange={setStatusFilter}
          >
            <Option value="PENDING">Chờ</Option>
            <Option value="ACTIVE">Đang diễn ra</Option>
            <Option value="DONE">Hoàn thành</Option>
            <Option value="CANCELLED">Đã hủy</Option>
          </Select>
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredSlots}
          rowKey="id"
          loading={loading}
          pagination={sessionId ? false : {
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} slot`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Space>
    </Card>
  );
};

export default SlotList;
