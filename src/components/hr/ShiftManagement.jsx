import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Input,
  Card,
  Row,
  Col,
  Tag,
  Switch,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import CreateShiftModal from './CreateShiftModal';
import hrService from '../../services/hrService';

const { Search } = Input;

/**
 * Component quản lý ca làm việc
 * Chỉ dành cho Manager và Admin
 */
const ShiftManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  // Load shifts data
  const loadShifts = async (page = 1, pageSize = 10, search = '') => {
    setLoading(true);
    try {
      const params = {
        page: page - 1, // Backend uses 0-based pagination
        size: pageSize,
        sortBy: 'name',
        sortDir: 'asc'
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await hrService.getShifts(params);
      
      if (response.success) {
        setShifts(response.data);
        setPagination({
          current: response.currentPage + 1, // Convert to 1-based
          pageSize: response.pageSize,
          total: response.totalItems
        });
      } else {
        console.error('Không thể tải danh sách ca làm việc:', response.message);
      }
    } catch (error) {
      console.error('Error loading shifts:', error);
      console.log('Có lỗi xảy ra khi tải danh sách ca làm việc:', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadShifts();
  }, []);

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
    loadShifts(1, pagination.pageSize, value);
  };

  // Handle table change (pagination, sorting)
  const handleTableChange = (paginationInfo) => {
    setPagination(paginationInfo);
    loadShifts(paginationInfo.current, paginationInfo.pageSize, searchText);
  };

  // Handle create shift
  const handleCreateShift = () => {
    setEditingShift(null);
    setIsModalVisible(true);
  };

  // Handle edit shift
  const handleEditShift = (shift) => {
    setEditingShift(shift);
    setIsModalVisible(true);
  };

  // Handle delete shift
  const handleDeleteShift = async (shiftId) => {
    try {
      const response = await hrService.deleteShift(shiftId);
      
      if (response.success) {
        console.log('Ca làm việc đã được xóa thành công');
        loadShifts(pagination.current, pagination.pageSize, searchText);
      } else {
        console.error('Không thể xóa ca làm việc:', response.message);
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
      console.log('Có lỗi xảy ra khi xóa ca làm việc');
    }
  };

  // Handle toggle shift status
  const handleToggleStatus = async (shiftId, currentStatus) => {
    try {
      const response = await hrService.toggleShiftStatus(shiftId, !currentStatus);
      
      if (response.success) {
        console.log(response.message);
        loadShifts(pagination.current, pagination.pageSize, searchText);
      } else {
        console.error('Không thể thay đổi trạng thái ca làm việc:', response.message);
      }
    } catch (error) {
      console.error('Error toggling shift status:', error);
      console.log('Có lỗi xảy ra khi thay đổi trạng thái ca làm việc');
    }
  };

  // Handle modal success
  const handleModalSuccess = () => {
    setIsModalVisible(false);
    setEditingShift(null);
    loadShifts(pagination.current, pagination.pageSize, searchText);
  };

  // Table columns
  const columns = [
    {
      title: 'Tên ca làm việc',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text, record) => (
        <div>
          <strong>{text}</strong>
          {record.description && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {record.description}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Giờ làm việc',
      key: 'timeRange',
      render: (_, record) => (
        <div>
          <div>{record.startTime} - {record.endTime}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Nghỉ: {record.breakHours || 0} giờ
          </div>
        </div>
      )
    },
    {
      title: 'Tổng giờ làm',
      dataIndex: 'workingHours',
      key: 'workingHours',
      render: (hours) => `${hours?.toFixed(1) || 0} giờ`
    },
    {
      title: 'Số phân công',
      dataIndex: 'assignmentCount',
      key: 'assignmentCount',
      render: (count) => (
        <Tag color={count > 0 ? 'blue' : 'default'}>
          {count || 0} phân công
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record.id, isActive)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Vô hiệu"
        />
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditShift(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa ca làm việc"
            description="Bạn có chắc chắn muốn xóa ca làm việc này?"
            onConfirm={() => handleDeleteShift(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Tooltip title="Xóa">
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
          <Col>
            <h2 style={{ margin: 0 }}>Quản lý Ca làm việc</h2>
          </Col>
          <Col>
            <Space>
              <Search
                placeholder="Tìm kiếm ca làm việc..."
                allowClear
                onSearch={handleSearch}
                style={{ width: 250 }}
                enterButton={<SearchOutlined />}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={() => loadShifts(pagination.current, pagination.pageSize, searchText)}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateShift}
              >
                Tạo ca mới
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={shifts}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} ca làm việc`
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>

      <CreateShiftModal
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingShift(null);
        }}
        onSuccess={handleModalSuccess}
        editingShift={editingShift}
      />
    </div>
  );
};

export default ShiftManagement;
