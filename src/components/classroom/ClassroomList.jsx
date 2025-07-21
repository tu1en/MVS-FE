import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Card,
  Tag,
  Modal,
  message,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import classroomService from '../../services/classroomService';

const { Search } = Input;

/**
 * Component hiển thị danh sách classrooms
 */
const ClassroomList = () => {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Load classrooms data
  const loadClassrooms = async (page = 1, size = 10, search = '') => {
    try {
      setLoading(true);
      const response = await classroomService.getAllClassrooms({
        page: page - 1,
        size,
        search: search.trim()
      });
      
      setClassrooms(response.content || []);
      setPagination({
        current: page,
        pageSize: size,
        total: response.totalElements || 0,
      });
    } catch (error) {
      console.error('Error loading classrooms:', error);
      message.error('Không thể tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadClassrooms();
  }, []);

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
    loadClassrooms(1, pagination.pageSize, value);
  };

  // Handle table change (pagination, sorting, filtering)
  const handleTableChange = (paginationInfo) => {
    loadClassrooms(paginationInfo.current, paginationInfo.pageSize, searchText);
  };

  // Handle delete classroom
  const handleDelete = async (id) => {
    try {
      await classroomService.deleteClassroom(id);
      message.success('Xóa lớp học thành công');
      loadClassrooms(pagination.current, pagination.pageSize, searchText);
    } catch (error) {
      console.error('Error deleting classroom:', error);
      message.error('Không thể xóa lớp học');
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Tên Lớp Học',
      dataIndex: 'classroomName',
      key: 'classroomName',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/classrooms/${record.id}`)}
          style={{ padding: 0, fontWeight: 'bold' }}
        >
          {text}
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
      title: 'Giáo Viên',
      dataIndex: 'teacherName',
      key: 'teacherName',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          {text || `Teacher ID: ${record.teacherId}`}
        </Space>
      ),
    },
    {
      title: 'Số Buổi Học',
      dataIndex: 'sessionCount',
      key: 'sessionCount',
      align: 'center',
      render: (count) => (
        <Tag color="blue">{count || 0} buổi</Tag>
      ),
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
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
              onClick={() => navigate(`/classrooms/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/classrooms/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa lớp học"
              description="Bạn có chắc chắn muốn xóa lớp học này?"
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
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Quản Lý Lớp Học"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/classrooms/create')}
        >
          Tạo Lớp Học Mới
        </Button>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Search */}
        <Search
          placeholder="Tìm kiếm lớp học..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          style={{ maxWidth: 400 }}
        />

        {/* Table */}
        <Table
          columns={columns}
          dataSource={classrooms}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} lớp học`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Space>
    </Card>
  );
};

export default ClassroomList;
