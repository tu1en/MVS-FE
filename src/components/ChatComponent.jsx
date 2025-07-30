import React, { useState, useEffect, useRef } from 'react';
import { 
  List, 
  Input, 
  Button, 
  Avatar, 
  Typography, 
  Space, 
  Tooltip, 
  Popover,
  Badge,
  Divider,
  Empty
} from 'antd';
import { 
  SendOutlined, 
  SmileOutlined, 
  PictureOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * Chat Component for Live Classroom
 * Hỗ trợ tin nhắn realtime, emoji, reactions
 */
const ChatComponent = ({ roomId, sendMessage, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Emoji list
  const emojis = ['😀', '😂', '😍', '👍', '👎', '❤️', '👏', '🎉', '🤔', '😢', '😡', '🙏'];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Listen for chat messages from WebSocket
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat-message' && data.roomId === roomId) {
          addMessage(data);
        } else if (data.type === 'user-typing' && data.roomId === roomId) {
          handleTypingIndicator(data);
        }
      } catch (error) {
        console.error('Error parsing chat message:', error);
      }
    };

    // Add event listener for WebSocket messages
    if (typeof window !== 'undefined') {
      window.addEventListener('websocket-message', handleMessage);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('websocket-message', handleMessage);
      }
    };
  }, [roomId]);

  /**
   * Add new message to chat
   */
  const addMessage = (messageData) => {
    const newMsg = {
      id: Date.now() + Math.random(),
      userId: messageData.userId,
      userName: messageData.userName,
      userAvatar: messageData.userAvatar,
      userRole: messageData.userRole,
      content: messageData.content,
      timestamp: new Date(messageData.timestamp || Date.now()),
      reactions: messageData.reactions || {}
    };

    setMessages(prev => [...prev, newMsg]);
    
    // Increase unread count if user is not currently viewing
    if (!isVisible) {
      setUnreadCount(prev => prev + 1);
    }
  };

  /**
   * Send new message
   */
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      type: 'chat-message',
      roomId: roomId,
      userId: currentUser.userId,
      userName: currentUser.fullName,
      userAvatar: currentUser.avatar,
      userRole: currentUser.role,
      content: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    // Add to local messages immediately
    addMessage(messageData);
    
    // Send via WebSocket
    if (sendMessage) {
      sendMessage(messageData);
    }

    setNewMessage('');
    setIsTyping(false);
  };

  /**
   * Handle typing indicator
   */
  const handleTyping = (value) => {
    setNewMessage(value);
    
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      
      // Send typing indicator
      if (sendMessage) {
        sendMessage({
          type: 'user-typing',
          roomId: roomId,
          userId: currentUser.userId,
          userName: currentUser.fullName,
          isTyping: true
        });
      }
    }
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (sendMessage) {
        sendMessage({
          type: 'user-typing',
          roomId: roomId,
          userId: currentUser.userId,
          userName: currentUser.fullName,
          isTyping: false
        });
      }
    }, 1000);
  };

  /**
   * Handle typing indicator from other users
   */
  const handleTypingIndicator = (data) => {
    if (data.userId === currentUser.userId) return;
    
    if (data.isTyping) {
      setTypingUsers(prev => {
        const existing = prev.find(u => u.userId === data.userId);
        if (!existing) {
          return [...prev, { userId: data.userId, userName: data.userName }];
        }
        return prev;
      });
    } else {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    }
  };

  /**
   * Add emoji to message
   */
  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  /**
   * Add reaction to message
   */
  const addReaction = (messageId, emoji) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions };
        const reactionKey = `${emoji}_${currentUser.userId}`;
        
        if (reactions[reactionKey]) {
          delete reactions[reactionKey];
        } else {
          reactions[reactionKey] = {
            emoji,
            userId: currentUser.userId,
            userName: currentUser.fullName
          };
        }
        
        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Handle Enter key
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Format message timestamp
   */
  const formatMessageTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true, 
      locale: vi 
    });
  };

  /**
   * Get user role badge color
   */
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'TEACHER': return '#f50';
      case 'MANAGER': return '#108ee9';
      case 'STUDENT': return '#87d068';
      default: return '#d9d9d9';
    }
  };

  /**
   * Render message reactions
   */
  const renderReactions = (message) => {
    const reactionCounts = {};
    
    Object.values(message.reactions || {}).forEach(reaction => {
      const emoji = reaction.emoji;
      if (!reactionCounts[emoji]) {
        reactionCounts[emoji] = { count: 0, users: [] };
      }
      reactionCounts[emoji].count++;
      reactionCounts[emoji].users.push(reaction.userName);
    });

    return Object.entries(reactionCounts).map(([emoji, data]) => (
      <Button
        key={emoji}
        size="small"
        type="text"
        style={{ 
          height: '24px', 
          fontSize: '12px',
          marginRight: '4px',
          marginTop: '4px'
        }}
        onClick={() => addReaction(message.id, emoji)}
      >
        {emoji} {data.count}
      </Button>
    ));
  };

  /**
   * Emoji popover content
   */
  const emojiContent = (
    <div style={{ width: '200px' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(6, 1fr)', 
        gap: '4px' 
      }}>
        {emojis.map(emoji => (
          <Button
            key={emoji}
            type="text"
            size="small"
            style={{ fontSize: '18px', height: '32px' }}
            onClick={() => addEmoji(emoji)}
          >
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#fff'
    }}>
      {/* Chat Header */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0',
        background: '#fafafa'
      }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>
            Chat ({messages.length})
          </Text>
          {unreadCount > 0 && (
            <Badge count={unreadCount} size="small" />
          )}
        </Space>
      </div>

      {/* Messages Area */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '8px',
        background: '#fff'
      }}>
        {messages.length === 0 ? (
          <Empty 
            description="Chưa có tin nhắn nào"
            style={{ marginTop: '40px' }}
          />
        ) : (
          <List
            dataSource={messages}
            split={false}
            renderItem={(message) => (
              <List.Item
                style={{ 
                  padding: '8px 0',
                  border: 'none'
                }}
              >
                <div style={{ width: '100%' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    marginBottom: '4px'
                  }}>
                    <Avatar 
                      size="small"
                      src={message.userAvatar}
                      icon={<UserOutlined />}
                      style={{ marginRight: '8px', flexShrink: 0 }}
                    />
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        marginBottom: '2px'
                      }}>
                        <Text 
                          strong 
                          style={{ 
                            fontSize: '12px',
                            color: getRoleBadgeColor(message.userRole),
                            marginRight: '8px'
                          }}
                        >
                          {message.userName}
                        </Text>
                        
                        <Tooltip title={new Date(message.timestamp).toLocaleString('vi-VN')}>
                          <Text 
                            type="secondary" 
                            style={{ fontSize: '11px' }}
                          >
                            <ClockCircleOutlined style={{ marginRight: '2px' }} />
                            {formatMessageTime(message.timestamp)}
                          </Text>
                        </Tooltip>
                      </div>
                      
                      <Paragraph 
                        style={{ 
                          fontSize: '13px',
                          margin: 0,
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {message.content}
                      </Paragraph>
                      
                      {/* Reactions */}
                      {Object.keys(message.reactions || {}).length > 0 && (
                        <div style={{ marginTop: '4px' }}>
                          {renderReactions(message)}
                        </div>
                      )}
                      
                      {/* Quick reaction buttons */}
                      <div style={{ 
                        marginTop: '4px',
                        opacity: 0.7
                      }}>
                        {['👍', '❤️', '😂'].map(emoji => (
                          <Button
                            key={emoji}
                            type="text"
                            size="small"
                            style={{ 
                              fontSize: '12px',
                              height: '20px',
                              padding: '0 4px',
                              marginRight: '2px'
                            }}
                            onClick={() => addReaction(message.id, emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
        
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div style={{ 
            padding: '8px 0',
            fontSize: '12px',
            color: '#999',
            fontStyle: 'italic'
          }}>
            {typingUsers.map(user => user.userName).join(', ')} đang nhập...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ 
        padding: '12px',
        borderTop: '1px solid #f0f0f0',
        background: '#fafafa'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px'
        }}>
          <div style={{ flex: 1 }}>
            <TextArea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{ 
                resize: 'none',
                fontSize: '13px'
              }}
            />
          </div>
          
          <Space>
            <Popover 
              content={emojiContent} 
              title="Chọn emoji"
              trigger="click"
              placement="topRight"
            >
              <Button 
                type="text" 
                icon={<SmileOutlined />}
                size="small"
              />
            </Popover>
            
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="small"
            >
              Gửi
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;