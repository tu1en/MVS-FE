import {
    DeleteOutlined,
    EmojiHappyOutlined,
    FileImageOutlined,
    SendOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Input,
    List,
    Popover,
    Space,
    Typography,
    Upload
} from 'antd';
import { useEffect, useRef, useState } from 'react';

const { Text } = Typography;

/**
 * VideoChat component cho real-time messaging trong video calls
 * @param {Object} props - Component props
 * @param {string} props.roomId - ID của phòng chat
 * @param {string} props.userId - ID của user hiện tại
 * @param {string} props.userName - Tên của user hiện tại
 * @param {boolean} props.isTeacher - Có phải là giáo viên không
 * @param {string} props.height - Chiều cao của chat container
 * @returns {JSX.Element} VideoChat component
 */
const VideoChat = ({ 
  roomId, 
  userId, 
  userName = 'User',
  isTeacher = false,
  height = '400px'
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Emoji list
  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯'];

  // Khởi tạo socket connection
  useEffect(() => {
    if (!roomId || !userId) return;

    const wsUrl = process.env.REACT_APP_SIGNALING_SERVER || 'ws://localhost:8088/signaling';
    socketRef.current = new WebSocket(wsUrl);

    const socket = socketRef.current;

    // Socket event handlers
    socket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      socket.emit('join-chat', { roomId, userId, userName });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    socket.on('chat-message', (messageData) => {
      setMessages(prev => [...prev, messageData]);
      scrollToBottom();
    });

    socket.on('user-joined-chat', ({ userId: newUserId, userName: newUserName, users }) => {
      setOnlineUsers(users);
      
      // Add system message
      const systemMessage = {
        id: Date.now(),
        type: 'system',
        message: `${newUserName} đã tham gia chat`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
      scrollToBottom();
    });

    socket.on('user-left-chat', ({ userId: leftUserId, userName: leftUserName, users }) => {
      setOnlineUsers(users);
      
      // Add system message
      const systemMessage = {
        id: Date.now(),
        type: 'system',
        message: `${leftUserName} đã rời khỏi chat`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
      scrollToBottom();
    });

    socket.on('user-typing', ({ userId: typingUserId, userName: typingUserName }) => {
      if (typingUserId !== userId) {
        setTypingUsers(prev => {
          if (!prev.find(u => u.userId === typingUserId)) {
            return [...prev, { userId: typingUserId, userName: typingUserName }];
          }
          return prev;
        });
      }
    });

    socket.on('user-stop-typing', ({ userId: typingUserId }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== typingUserId));
    });

    socket.on('message-deleted', ({ messageId }) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    });

    return () => {
      if (socket) {
        socket.emit('leave-chat', { roomId, userId });
        socket.disconnect();
      }
    };
  }, [roomId, userId, userName]);

  // Scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  // Gửi tin nhắn
  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;

    const messageData = {
      id: Date.now(),
      roomId,
      userId,
      userName,
      message: newMessage,
      timestamp: new Date(),
      type: 'text',
      isTeacher
    };

    socketRef.current.emit('send-message', messageData);
    setNewMessage('');
    stopTyping();
  };

  // Xử lý typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit('typing', { roomId, userId, userName });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  };

  // Dừng typing
  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      socketRef.current.emit('stop-typing', { roomId, userId });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  // Thêm emoji
  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  // Xóa tin nhắn (chỉ giáo viên hoặc chủ tin nhắn)
  const deleteMessage = (messageId, messageUserId) => {
    if (isTeacher || messageUserId === userId) {
      socketRef.current.emit('delete-message', { roomId, messageId });
    }
  };

  // Upload file
  const handleFileUpload = (file) => {
    // Simulate file upload
    const messageData = {
      id: Date.now(),
      roomId,
      userId,
      userName,
      message: `Đã gửi file: ${file.name}`,
      timestamp: new Date(),
      type: 'file',
      fileName: file.name,
      fileSize: file.size,
      isTeacher
    };

    socketRef.current.emit('send-message', messageData);
    return false; // Prevent default upload
  };

  // Render message item
  const renderMessage = (msg) => {
    const isOwnMessage = msg.userId === userId;
    const canDelete = isTeacher || isOwnMessage;

    if (msg.type === 'system') {
      return (
        <div key={msg.id} style={{ textAlign: 'center', margin: '8px 0' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {msg.message}
          </Text>
        </div>
      );
    }

    return (
      <List.Item 
        key={msg.id} 
        style={{ 
          padding: '8px 12px', 
          border: 'none',
          backgroundColor: isOwnMessage ? '#e6f7ff' : 'transparent'
        }}
        actions={canDelete ? [
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => deleteMessage(msg.id, msg.userId)}
            danger
          />
        ] : []}
      >
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <Avatar 
              size="small" 
              icon={<UserOutlined />}
              style={{ 
                backgroundColor: msg.isTeacher ? '#1890ff' : '#52c41a' 
              }}
            />
            <Text 
              strong 
              style={{ 
                marginLeft: 8, 
                fontSize: '12px',
                color: msg.isTeacher ? '#1890ff' : '#000'
              }}
            >
              {msg.userName}
              {msg.isTeacher && ' (Giáo viên)'}
            </Text>
            <Text 
              type="secondary" 
              style={{ marginLeft: 'auto', fontSize: '10px' }}
            >
              {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </div>
          
          <div style={{ marginLeft: 32 }}>
            {msg.type === 'file' ? (
              <div style={{ 
                padding: '8px', 
                background: '#f0f0f0', 
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center'
              }}>
                <FileImageOutlined style={{ marginRight: 8 }} />
                <div>
                  <Text strong>{msg.fileName}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    {(msg.fileSize / 1024).toFixed(1)} KB
                  </Text>
                </div>
              </div>
            ) : (
              <Text style={{ fontSize: '13px', wordBreak: 'break-word' }}>
                {msg.message}
              </Text>
            )}
          </div>
        </div>
      </List.Item>
    );
  };

  return (
    <Card
      title={
        <Space>
          <Text strong>Chat</Text>
          {onlineUsers.length > 0 && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ({onlineUsers.length} người online)
            </Text>
          )}
          {!isConnected && (
            <Text type="danger" style={{ fontSize: '12px' }}>
              (Mất kết nối)
            </Text>
          )}
        </Space>
      }
      size="small"
      style={{ height }}
      bodyStyle={{ 
        height: 'calc(100% - 40px)', 
        padding: 0,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Messages */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: `calc(${height} - 120px)`
        }}
      >
        <List
          dataSource={messages}
          renderItem={renderMessage}
          locale={{ emptyText: 'Chưa có tin nhắn nào' }}
        />
        
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div style={{ padding: '8px 12px' }}>
            <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
              {typingUsers.map(u => u.userName).join(', ')} đang nhập...
            </Text>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid #f0f0f0' }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={handleTyping}
            onPressEnter={sendMessage}
            onBlur={stopTyping}
            disabled={!isConnected}
            style={{ fontSize: '12px' }}
          />
          
          <Popover
            content={
              <div style={{ display: 'flex', flexWrap: 'wrap', width: '200px' }}>
                {emojis.map(emoji => (
                  <Button
                    key={emoji}
                    type="text"
                    size="small"
                    onClick={() => addEmoji(emoji)}
                    style={{ fontSize: '16px', padding: '4px' }}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            }
            title="Chọn emoji"
            trigger="click"
          >
            <Button icon={<EmojiHappyOutlined />} />
          </Popover>
          
          <Upload
            beforeUpload={handleFileUpload}
            showUploadList={false}
            accept="image/*,.pdf,.doc,.docx"
          >
            <Button icon={<FileImageOutlined />} />
          </Upload>
          
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
          />
        </Space.Compact>
      </div>
    </Card>
  );
};

export default VideoChat;
