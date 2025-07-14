import { CheckOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Typography } from 'antd';
import { formatMessageTime } from '../../utils/dateUtils';

const { Text } = Typography;

/**
 * Unified MessageBubble component for both student and teacher messaging interfaces
 * Provides consistent styling and behavior across different user roles
 */
const MessageBubble = ({
  message,
  isCurrentUser = false,
  senderName,
  showAvatar = true,
  showTimestamp = true,
  showStatus = false,
  className = '',
  style = {}
}) => {

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'read':
      case 'replied':
        return <CheckOutlined style={{ color: '#52c41a' }} />;
      case 'sent':
      case 'delivered':
        return <CheckOutlined style={{ color: '#1890ff' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'read':
        return 'Đã xem';
      case 'replied':
        return 'Đã phản hồi';
      case 'sent':
        return 'Đã gửi';
      case 'delivered':
        return 'Đã nhận';
      default:
        return 'Đang gửi';
    }
  };

  return (
    <div 
      className={`message-bubble-container ${className}`}
      style={{
        display: 'flex',
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
        alignItems: 'flex-end',
        ...style
      }}
    >
      {/* Avatar for received messages */}
      {!isCurrentUser && showAvatar && (
        <Avatar 
          icon={<UserOutlined />} 
          size="small"
          style={{ 
            marginRight: '8px',
            backgroundColor: '#1890ff'
          }}
        />
      )}
      
      {/* Message content */}
      <div style={{ maxWidth: '70%' }}>
        {/* Sender name for received messages */}
        {!isCurrentUser && senderName && (
          <Text 
            type="secondary" 
            style={{ 
              fontSize: '12px',
              marginLeft: '8px',
              display: 'block',
              marginBottom: '4px'
            }}
          >
            {senderName}
          </Text>
        )}
        
        {/* Message bubble */}
        <Card
          size="small"
          style={{
            backgroundColor: isCurrentUser ? '#1890ff' : '#f5f5f5',
            color: isCurrentUser ? 'white' : 'rgba(0, 0, 0, 0.85)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          }}
          styles={{
            body: {
              padding: '8px 12px',
              fontSize: '14px',
              lineHeight: '1.4'
            }
          }}
        >
          {/* Message content */}
          <div style={{ marginBottom: showTimestamp || showStatus ? '4px' : 0 }}>
            {message.content || message.text || ''}
          </div>
          
          {/* Message footer with timestamp and status */}
          {(showTimestamp || showStatus) && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '4px'
            }}>
              {/* Timestamp */}
              {showTimestamp && (
                <Text 
                  style={{ 
                    fontSize: '11px',
                    color: isCurrentUser ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.45)',
                    marginRight: showStatus ? '8px' : 0
                  }}
                >
                  {formatMessageTime(message.createdAt || message.timestamp)}
                </Text>
              )}
              
              {/* Status indicator for sent messages */}
              {showStatus && isCurrentUser && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {getStatusIcon(message.status)}
                  <Text 
                    style={{ 
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    {getStatusText(message.status)}
                  </Text>
                </div>
              )}
            </div>
          )}
        </Card>
        
        {/* Reply indicator */}
        {message.reply && (
          <Card
            size="small"
            style={{
              marginTop: '8px',
              backgroundColor: '#f0f2f5',
              border: '1px solid #d9d9d9',
              borderRadius: '8px'
            }}
            styles={{
              body: {
                padding: '8px 12px'
              }
            }}
          >
            <Text strong style={{ fontSize: '12px', color: '#1890ff' }}>
              Phản hồi từ {isCurrentUser ? 'học sinh' : 'giáo viên'}:
            </Text>
            <div style={{ marginTop: '4px', fontSize: '13px' }}>
              {message.reply}
            </div>
            {message.repliedAt && (
              <Text 
                type="secondary" 
                style={{ fontSize: '11px', marginTop: '4px', display: 'block' }}
              >
                {formatMessageTime(message.repliedAt)}
              </Text>
            )}
          </Card>
        )}
      </div>
      
      {/* Avatar for sent messages */}
      {isCurrentUser && showAvatar && (
        <Avatar 
          icon={<UserOutlined />} 
          size="small"
          style={{ 
            marginLeft: '8px',
            backgroundColor: '#52c41a'
          }}
        />
      )}
    </div>
  );
};

export default MessageBubble;
