import React from 'react';
import { Typography, Avatar, Space, Button, Dropdown, Tag } from 'antd';
import { 
  UserOutlined, 
  MoreOutlined, 
  PhoneOutlined, 
  VideoCameraOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * Unified MessageHeader component for both student and teacher messaging interfaces
 * Displays conversation header with contact info and action buttons
 */
const MessageHeader = ({
  contactName = '',
  contactId,
  contactRole = 'student', // 'student' or 'teacher'
  isOnline = false,
  lastSeen,
  conversationId,
  showActions = true,
  showStatus = true,
  className = '',
  style = {},
  onCall,
  onVideoCall,
  onViewInfo,
  onDeleteConversation,
  onReportUser,
  onBlockUser
}) => {
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    
    if (diffInMinutes < 1) {
      return 'Vừa truy cập';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)} phút trước`;
    } else if (diffInMinutes < 1440) { // 24 hours
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const getStatusText = () => {
    if (isOnline) {
      return 'Đang hoạt động';
    } else if (lastSeen) {
      return `Hoạt động ${formatLastSeen(lastSeen)}`;
    } else {
      return 'Không xác định';
    }
  };

  const getStatusColor = () => {
    return isOnline ? '#52c41a' : '#8c8c8c';
  };

  const getRoleTag = () => {
    if (contactRole === 'teacher') {
      return <Tag color="blue" size="small">Giáo viên</Tag>;
    } else if (contactRole === 'student') {
      return <Tag color="green" size="small">Học sinh</Tag>;
    } else {
      return <Tag color="default" size="small">{contactRole}</Tag>;
    }
  };

  const getActionMenuItems = () => {
    const items = [];

    if (onCall) {
      items.push({
        key: 'call',
        icon: <PhoneOutlined />,
        label: 'Gọi điện',
        onClick: () => onCall(contactId, contactName)
      });
    }

    if (onVideoCall) {
      items.push({
        key: 'video-call',
        icon: <VideoCameraOutlined />,
        label: 'Gọi video',
        onClick: () => onVideoCall(contactId, contactName)
      });
    }

    if (onViewInfo) {
      items.push({
        key: 'view-info',
        icon: <InfoCircleOutlined />,
        label: 'Xem thông tin',
        onClick: () => onViewInfo(contactId, contactName)
      });
    }

    if (items.length > 0) {
      items.push({ type: 'divider' });
    }

    if (onReportUser) {
      items.push({
        key: 'report',
        icon: <ExclamationCircleOutlined />,
        label: 'Báo cáo',
        onClick: () => onReportUser(contactId, contactName)
      });
    }

    if (onDeleteConversation) {
      items.push({
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Xóa cuộc trò chuyện',
        danger: true,
        onClick: () => onDeleteConversation(conversationId, contactName)
      });
    }

    return items;
  };

  const actionMenuItems = getActionMenuItems();

  if (!contactName) {
    return (
      <div 
        className={`message-header-empty ${className}`}
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: '#fafafa',
          textAlign: 'center',
          ...style
        }}
      >
        <Text type="secondary">Chọn một cuộc trò chuyện để bắt đầu</Text>
      </div>
    );
  }

  return (
    <div 
      className={`message-header-container ${className}`}
      style={{
        padding: '12px 20px',
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...style
      }}
    >
      {/* Contact info */}
      <Space align="center">
        <div style={{ position: 'relative' }}>
          <Avatar 
            size="large"
            icon={<UserOutlined />}
            style={{ 
              backgroundColor: contactRole === 'teacher' ? '#1890ff' : '#52c41a'
            }}
          />
          {showStatus && (
            <div
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: getStatusColor(),
                border: '2px solid white'
              }}
            />
          )}
        </div>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
              {contactName}
            </Title>
            {getRoleTag()}
          </div>
          
          {showStatus && (
            <Text 
              type="secondary" 
              style={{ 
                fontSize: '12px',
                color: getStatusColor()
              }}
            >
              {getStatusText()}
            </Text>
          )}
        </div>
      </Space>

      {/* Action buttons */}
      {showActions && actionMenuItems.length > 0 && (
        <Space>
          {/* Quick action buttons */}
          {onCall && (
            <Button 
              type="text" 
              icon={<PhoneOutlined />}
              onClick={() => onCall(contactId, contactName)}
              title="Gọi điện"
            />
          )}
          
          {onVideoCall && (
            <Button 
              type="text" 
              icon={<VideoCameraOutlined />}
              onClick={() => onVideoCall(contactId, contactName)}
              title="Gọi video"
            />
          )}

          {/* More actions dropdown */}
          <Dropdown
            menu={{ items: actionMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button 
              type="text" 
              icon={<MoreOutlined />}
              title="Thêm tùy chọn"
            />
          </Dropdown>
        </Space>
      )}
    </div>
  );
};

export default MessageHeader;
