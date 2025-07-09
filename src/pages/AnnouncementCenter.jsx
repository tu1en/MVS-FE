import {
    BellOutlined,
    CheckOutlined,
    ExclamationCircleOutlined,
    FilterOutlined,
    NotificationOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { App, Avatar, Badge, Button, Card, Input, List, Select, Tabs, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AnnouncementService from '../services/announcementService';

const { Search } = Input;
const { Option } = Select;

const AnnouncementCenter = () => {
  const { message } = App.useApp();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchAnnouncements();
    }
  }, [filter, user?.id]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await AnnouncementService.getUserAnnouncements(user.id, filter);
      setAnnouncements(data);
      setUnreadCount(data.filter(item => !item.isRead).length);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      message.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (announcementId) => {
    try {
      // Use AnnouncementService to mark as read
      await AnnouncementService.markAsRead(announcementId);
      
      setAnnouncements(prev => 
        prev.map(item => 
          item.id === announcementId 
            ? { ...item, isRead: true }
            : item
        )
      );
      setUnreadCount(prev => prev - 1);
      message.success('Đã đánh dấu đã đọc');
    } catch (error) {
      console.error('Error marking as read:', error);
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const markAllAsRead = async () => {
    try {
      // Use AnnouncementService to mark all as read
      await AnnouncementService.markAllAsRead(user.id);
      
      setAnnouncements(prev => 
        prev.map(item => ({ ...item, isRead: true }))
      );
      setUnreadCount(0);
      message.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Error marking all as read:', error);
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const getAnnouncementIcon = (type) => {
    switch (type) {
      case 'SYSTEM':
        return <NotificationOutlined style={{ color: '#1890ff' }} />;
      case 'COURSE':
        return <BellOutlined style={{ color: '#52c41a' }} />;
      case 'URGENT':
        return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
      default:
        return <NotificationOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getAnnouncementTag = (type, priority) => {
    const colors = {
      SYSTEM: 'blue',
      COURSE: 'green',
      URGENT: 'red',
      HIGH: 'orange',
      MEDIUM: 'gold',
      LOW: 'default'
    };

    return (
      <Tag color={colors[type] || colors[priority] || 'default'}>
        {type === 'SYSTEM' ? 'Hệ thống' : 
         type === 'COURSE' ? 'Khóa học' :
         type === 'URGENT' ? 'Khẩn cấp' :
         priority === 'HIGH' ? 'Ưu tiên cao' :
         priority === 'MEDIUM' ? 'Ưu tiên vừa' : 'Thông thường'}
      </Tag>
    );
  };

  const filteredAnnouncements = announcements.filter(item =>
    item.title.toLowerCase().includes(searchText.toLowerCase()) ||
    item.content.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <NotificationOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              Trung tâm thông báo
              {unreadCount > 0 && (
                <Badge count={unreadCount} style={{ marginLeft: '8px' }} />
              )}
            </div>
            <Button 
              type="primary" 
              icon={<CheckOutlined />}
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          </div>
        }
      >
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
          <Search
            placeholder="Tìm kiếm thông báo..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ flex: 1 }}
            prefix={<SearchOutlined />}
          />
          <Select
            value={filter}
            onChange={setFilter}
            style={{ width: 200 }}
            prefix={<FilterOutlined />}
          >
            <Option value="all">Tất cả thông báo</Option>
            <Option value="unread">Chưa đọc</Option>
            <Option value="read">Đã đọc</Option>
            <Option value="system">Hệ thống</Option>
            <Option value="course">Khóa học</Option>
            <Option value="urgent">Khẩn cấp</Option>
          </Select>
        </div>

        <Tabs 
          defaultActiveKey="all"
          items={[
            {
              key: 'all',
              label: 'Tất cả',
              children: (
                <List
                  loading={loading}
                  dataSource={filteredAnnouncements}
                  renderItem={item => (
                    <List.Item
                      style={{
                        backgroundColor: item.isRead ? '#fff' : '#f6ffed',
                        border: item.isRead ? '1px solid #d9d9d9' : '1px solid #b7eb8f',
                        borderRadius: '6px',
                        marginBottom: '8px',
                        padding: '16px'
                      }}
                      actions={[
                        !item.isRead && (
                          <Button 
                            type="link" 
                            size="small"
                            onClick={() => markAsRead(item.id)}
                            icon={<CheckOutlined />}
                          >
                            Đánh dấu đã đọc
                          </Button>
                        )
                      ].filter(Boolean)}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge dot={!item.isRead}>
                            <Avatar icon={getAnnouncementIcon(item.type)} />
                          </Badge>
                        }
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: item.isRead ? 'normal' : 'bold' }}>
                              {item.title}
                            </span>
                            {getAnnouncementTag(item.type, item.priority)}
                          </div>
                        }
                        description={
                          <div>
                            <p style={{ marginBottom: '8px' }}>{item.content}</p>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              <span>Từ: {item.senderName}</span>
                              <span style={{ marginLeft: '16px' }}>
                                Thời gian: {new Date(item.createdAt).toLocaleString('vi-VN')}
                              </span>
                              {item.courseName && (
                                <span style={{ marginLeft: '16px' }}>
                                  Khóa học: {item.courseName}
                                </span>
                              )}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )
            },
            {
              key: 'unread',
              label: `Chưa đọc (${unreadCount})`,
              children: (
                <List
                  loading={loading}
                  dataSource={filteredAnnouncements.filter(item => !item.isRead)}
                  renderItem={item => (
                    <List.Item
                      style={{
                        backgroundColor: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: '6px',
                        marginBottom: '8px',
                        padding: '16px'
                      }}
                      actions={[
                        <Button 
                          type="link" 
                          size="small"
                          onClick={() => markAsRead(item.id)}
                          icon={<CheckOutlined />}
                        >
                          Đánh dấu đã đọc
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge dot>
                            <Avatar icon={getAnnouncementIcon(item.type)} />
                          </Badge>
                        }
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 'bold' }}>{item.title}</span>
                            {getAnnouncementTag(item.type, item.priority)}
                          </div>
                        }
                        description={
                          <div>
                            <p style={{ marginBottom: '8px' }}>{item.content}</p>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              <span>Từ: {item.senderName}</span>
                              <span style={{ marginLeft: '16px' }}>
                                Thời gian: {new Date(item.createdAt).toLocaleString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )
            },
            {
              key: 'system',
              label: 'Hệ thống',
              children: (
                <List
                  loading={loading}
                  dataSource={filteredAnnouncements.filter(item => item.type === 'SYSTEM')}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<NotificationOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                        title={item.title}
                        description={
                          <div>
                            <p>{item.content}</p>
                            <small>{new Date(item.createdAt).toLocaleString('vi-VN')}</small>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )
            },
            {
              key: 'course',
              label: 'Khóa học',
              children: (
                <List
                  loading={loading}
                  dataSource={filteredAnnouncements.filter(item => item.type === 'COURSE')}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<BellOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                        title={item.title}
                        description={
                          <div>
                            <p>{item.content}</p>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              <span>Khóa học: {item.courseName}</span>
                              <span style={{ marginLeft: '16px' }}>
                                {new Date(item.createdAt).toLocaleString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default AnnouncementCenter;
