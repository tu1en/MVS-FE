import React, { useState, useEffect } from 'react';
import { Badge, Button, Popover, List, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const fetchNotifications = async () => {
    try {
      const [unreadNotifs, count] = await Promise.all([
        notificationService.getUnreadNotifications(5),
        notificationService.getUnreadCount()
      ]);
      setNotifications(unreadNotifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Fetch notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleViewAll = () => {
    navigate(`/${role.toLowerCase()}/announcements`);
  };

  const notificationContent = (
    <List
      itemLayout="horizontal"
      dataSource={notifications}
      style={{ width: 300 }}
      renderItem={(item) => (
        <List.Item 
          onClick={() => handleNotificationClick(item.id)}
          style={{ cursor: 'pointer' }}
          className="hover:bg-gray-50"
        >
          <List.Item.Meta
            title={<span className="font-medium">{item.title}</span>}
            description={
              <Typography.Paragraph ellipsis={{ rows: 2 }} className="mb-0">
                {item.content}
              </Typography.Paragraph>
            }
          />
        </List.Item>
      )}
      footer={
        <div style={{ textAlign: 'center' }}>
          <Button type="link" onClick={handleViewAll}>
            Xem tất cả thông báo
          </Button>
        </div>
      }
    />
  );

  return (
    <Popover 
      content={notificationContent} 
      title="Thông báo mới" 
      trigger="click"
      placement="bottomRight"
    >
      <Badge count={unreadCount} overflowCount={99}>
        <BellOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
