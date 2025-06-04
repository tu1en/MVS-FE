import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Card, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const ManageAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);

  // Temporary data for testing
  useEffect(() => {
    setAnnouncements([
      {
        id: 1,
        title: 'Thông báo lịch thi học kỳ 1',
        content: 'Lịch thi học kỳ 1 năm học 2023-2024...',
        createdAt: '2023-12-01',
        status: 'active',
        priority: 'high',
      },
      {
        id: 2,
        title: 'Thông báo nghỉ Tết Nguyên Đán',
        content: 'Thông báo về lịch nghỉ Tết Nguyên Đán 2024...',
        createdAt: '2023-12-15',
        status: 'scheduled',
        priority: 'medium',
      },
    ]);
  }, []);

  const columns = [
    {
      title: 'Tiêu Đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        let text = 'Đang hiển thị';
        
        if (status === 'scheduled') {
          color = 'blue';
          text = 'Đã lên lịch';
        } else if (status === 'draft') {
          color = 'gray';
          text = 'Bản nháp';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Mức Độ',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colors = {
          high: 'red',
          medium: 'orange',
          low: 'green',
        };
        const texts = {
          high: 'Cao',
          medium: 'Trung bình',
          low: 'Thấp',
        };
        return <Tag color={colors[priority]}>{texts[priority]}</Tag>;
      },
    },
    {
      title: 'Thao Tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleView = (announcement) => {
    Modal.info({
      title: announcement.title,
      content: (
        <div>
          <p>{announcement.content}</p>
          <p>
            <strong>Ngày tạo:</strong> {dayjs(announcement.createdAt).format('DD/MM/YYYY')}
          </p>
        </div>
      ),
      width: 600,
    });
  };

  const handleEdit = (announcement) => {
    // Navigate to edit page
    window.location.href = '/manager/announcements/edit/' + announcement.id;
  };

  const handleDelete = (announcement) => {
    Modal.confirm({
      title: 'Xác nhận xóa thông báo',
      content: 'Bạn có chắc chắn muốn xóa thông báo "' + announcement.title + '"?',
      onOk() {
        setAnnouncements(announcements.filter((item) => item.id !== announcement.id));
        message.success('Xóa thông báo thành công');
      },
    });
  };

  return (
    <Card title="Quản Lý Thông Báo" className="shadow-md">
      <Button
        type="primary"
        href="/manager/announcements/create"
        style={{ marginBottom: 16 }}
      >
        Tạo Thông Báo Mới
      </Button>

      <Table columns={columns} dataSource={announcements} rowKey="id" />
    </Card>
  );
};

export default ManageAnnouncements;
