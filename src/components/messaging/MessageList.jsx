import { MessageOutlined } from '@ant-design/icons';
import { Divider, Empty, Spin, Typography } from 'antd';
import { useEffect, useRef } from 'react';
import { formatDateDivider } from '../../utils/dateUtils';
import MessageBubble from './MessageBubble';

const { Text } = Typography;

/**
 * Unified MessageList component for both student and teacher messaging interfaces
 * Displays conversation messages with consistent styling and auto-scroll
 */
const MessageList = ({
  messages = [],
  currentUserId,
  loading = false,
  emptyText = 'Chưa có tin nhắn nào',
  showAvatar = true,
  showTimestamp = true,
  showStatus = false,
  autoScroll = true,
  groupByDate = true,
  className = '',
  style = {},
  onMessageClick,
  getUserName = (userId) => `Người dùng #${userId}`
}) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages, autoScroll]);

  // Use imported formatDateDivider from utils

  const shouldShowDateDivider = (currentMessage, previousMessage) => {
    if (!groupByDate || !previousMessage) return false;
    
    const currentDate = new Date(currentMessage.createdAt || currentMessage.timestamp);
    const previousDate = new Date(previousMessage.createdAt || previousMessage.timestamp);
    
    return currentDate.toDateString() !== previousDate.toDateString();
  };

  const groupMessagesByDate = (messages) => {
    if (!groupByDate) return messages;

    const grouped = [];
    let currentDate = null;

    messages.forEach((message, index) => {
      const messageDate = new Date(message.createdAt || message.timestamp);
      const dateString = messageDate.toDateString();

      if (currentDate !== dateString) {
        currentDate = dateString;
        grouped.push({
          type: 'date-divider',
          date: messageDate,
          id: `date-${dateString}`
        });
      }

      grouped.push({
        ...message,
        type: 'message'
      });
    });

    return grouped;
  };

  if (loading) {
    return (
      <div 
        className={`message-list-loading ${className}`}
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          ...style 
        }}
      >
        <Spin size="large" />
        <Text style={{ marginLeft: '12px' }}>Đang tải tin nhắn...</Text>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div 
        className={`message-list-empty ${className}`}
        style={{ 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '300px',
          padding: '40px 20px',
          ...style 
        }}
      >
        <Empty
          image={<MessageOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
          description={emptyText}
          imageStyle={{ height: 60 }}
        />
      </div>
    );
  }

  const processedMessages = groupMessagesByDate(messages);

  return (
    <div 
      ref={containerRef}
      className={`message-list-container ${className}`}
      style={{
        height: '100%',
        overflowY: 'auto',
        padding: '16px',
        backgroundColor: '#ffffff',
        ...style
      }}
    >
      {processedMessages.map((item, index) => {
        if (item.type === 'date-divider') {
          return (
            <Divider 
              key={item.id}
              style={{ 
                margin: '16px 0',
                fontSize: '12px',
                color: '#8c8c8c'
              }}
            >
              {formatDateDivider(item.date)}
            </Divider>
          );
        }

        const message = item;
        const isCurrentUser = message.senderId?.toString() === currentUserId?.toString();
        const senderName = isCurrentUser ? null : getUserName(message.senderId);

        return (
          <div
            key={message.id || `message-${index}`}
            onClick={() => onMessageClick?.(message)}
            style={{ cursor: onMessageClick ? 'pointer' : 'default' }}
          >
            <MessageBubble
              message={message}
              isCurrentUser={isCurrentUser}
              senderName={senderName}
              showAvatar={showAvatar}
              showTimestamp={showTimestamp}
              showStatus={showStatus && isCurrentUser}
            />
          </div>
        );
      })}
      
      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
