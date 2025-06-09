import React, { useState, useEffect } from 'react';
import { List, Card, Typography, Tag, Spin, Select, Button, Space, Pagination } from 'antd';
import { BellOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { notificationService } from '../services/notificationService';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Announcements = () => {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [filters, setFilters] = useState({
    targetAudience: 'all',
    isRead: 'all'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(
        pagination.current - 1,
        pagination.pageSize,
        filters
      );
      setAnnouncements(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (error) {
      toast.error('Không thể tải thông báo!');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchAnnouncements();
      toast.success('Đã đánh dấu là đã đọc');
    } catch (error) {
      toast.error('Không thể đánh dấu thông báo!');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchAnnouncements();
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      toast.error('Không thể đánh dấu thông báo!');
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [filters, pagination.current, pagination.pageSize]);

  const getAudienceTag = (audience) => {
    const tagProps = {
      all: { color: 'blue', text: 'Tất cả' },
      students: { color: 'green', text: 'Sinh viên' },
      teachers: { color: 'purple', text: 'Giáo viên' }
    };
    const { color, text } = tagProps[audience] || tagProps.all;
    return <Tag color={color}>{text}</Tag>;
  };

  if (loading) {
    return <Spin size="large" className="flex justify-center mt-8" />;
  }

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="flex items-center gap-2 mb-0">
          <BellOutlined />
          Thông Báo
        </Title>
        <Space>
          <Select
            value={filters.targetAudience}
            onChange={(value) => setFilters(prev => ({ ...prev, targetAudience: value }))}
            style={{ width: 120 }}
          >
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="students">Sinh viên</Select.Option>
            <Select.Option value="teachers">Giáo viên</Select.Option>
          </Select>
          <Select
            value={filters.isRead}
            onChange={(value) => setFilters(prev => ({ ...prev, isRead: value }))}
            style={{ width: 120 }}
          >
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="true">Đã đọc</Select.Option>
            <Select.Option value="false">Chưa đọc</Select.Option>
          </Select>
          <Button type="primary" onClick={handleMarkAllAsRead}>
            Đánh dấu tất cả đã đọc
          </Button>
        </Space>
      </div>

      <List
        itemLayout="vertical"
        dataSource={announcements}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            extra={
              <Space>
                {getAudienceTag(item.targetAudience)}
                {!item.isRead && (
                  <Button
                    type="text"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleMarkAsRead(item.id)}
                  >
                    Đánh dấu đã đọc
                  </Button>
                )}
              </Space>
            }
          >
            <List.Item.Meta
              title={<Text strong>{item.title}</Text>}
              description={
                <div className="text-gray-500 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <UserOutlined />
                    <span>Đăng bởi: {item.createdBy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockCircleOutlined />
                    <span>
                      {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                </div>
              }
            />
            <div className="mt-3">{item.content}</div>
          </List.Item>
        )}
      />
      <div className="mt-4 flex justify-end">
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={(page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize }))}
          showSizeChanger
          showTotal={(total) => `Tổng ${total} thông báo`}
        />
      </div>
    </Card>
  );
};

export default Announcements;
