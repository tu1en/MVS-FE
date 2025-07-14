import { MessageOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Empty, List, Spin, Tag, Typography } from 'antd';
import { formatTimestamp } from '../../utils/dateUtils';

const { Text } = Typography;

/**
 * Unified ConversationList component for both student and teacher messaging interfaces
 * Displays list of conversations/contacts with consistent styling
 */
const ConversationList = ({
  conversations = [],
  selectedConversationId,
  onConversationSelect,
  loading = false,
  title = "Cuộc trò chuyện",
  emptyText = "Chưa có cuộc trò chuyện nào",
  showUnreadBadge = true,
  showLastMessage = true,
  showTimestamp = true,
  userRole = 'student', // 'student' or 'teacher'
  className = '',
  style = {}
}) => {
  // Debug logging
  console.log('🎭 ConversationList render:', {
    conversationsCount: conversations.length,
    loading,
    userRole
  });

  // Removed debug code for production

  const getContactName = (conversation) => {
    if (userRole === 'teacher') {
      return conversation.studentName || conversation.recipientName || `Học sinh #${conversation.studentId || conversation.recipientId}`;
    } else {
      return conversation.teacherName || conversation.senderName || `Giáo viên #${conversation.teacherId || conversation.senderId}`;
    }
  };

  const getLastMessagePreview = (conversation) => {
    if (!showLastMessage) return '';
    
    const lastMessage = conversation.lastMessage || conversation.content || '';
    if (lastMessage.length > 50) {
      return lastMessage.substring(0, 50) + '...';
    }
    return lastMessage;
  };

  const getUnreadCount = (conversation) => {
    return conversation.unreadCount || 0;
  };

  const isSelected = (conversation) => {
    const conversationId = conversation.id || conversation.studentId || conversation.teacherId;
    return selectedConversationId === conversationId;
  };

  const handleItemClick = (conversation) => {
    const conversationId = conversation.id || conversation.studentId || conversation.teacherId;
    onConversationSelect?.(conversationId, conversation);
  };

  const getMessageStatus = (conversation) => {
    if (!conversation.status) return null;
    
    const statusColors = {
      'sent': 'blue',
      'delivered': 'cyan',
      'read': 'green',
      'replied': 'purple'
    };
    
    const statusTexts = {
      'sent': 'Đã gửi',
      'delivered': 'Đã nhận',
      'read': 'Đã xem',
      'replied': 'Đã phản hồi'
    };
    
    return (
      <Tag
        color={statusColors[conversation.status.toLowerCase()]}
        size="small"
        style={{
          fontSize: '10px',
          padding: '0 4px',
          whiteSpace: 'nowrap',
          maxWidth: '80px',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {statusTexts[conversation.status.toLowerCase()] || conversation.status}
      </Tag>
    );
  };

  if (loading) {
    return (
      <div 
        className={`conversation-list-loading ${className}`}
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          ...style 
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div 
        className={`conversation-list-empty ${className}`}
        style={{ 
          padding: '40px 20px',
          textAlign: 'center',
          ...style 
        }}
      >
        <Empty
          image={<MessageOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
          description={emptyText}
          styles={{ image: { height: 60 } }}
        />
      </div>
    );
  }

  return (
    <div className={`conversation-list-container ${className}`} style={style}>
      {title && (
        <div style={{ 
          padding: '16px 16px 8px 16px', 
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: '#fafafa'
        }}>
          <Text strong style={{ fontSize: '16px' }}>
            {title}
          </Text>
        </div>
      )}
      
      <List
        dataSource={conversations}
        renderItem={(conversation) => {
          const unreadCount = getUnreadCount(conversation);
          const contactName = getContactName(conversation);
          const lastMessagePreview = getLastMessagePreview(conversation);
          const timestamp = conversation.lastMessageAt || conversation.createdAt || conversation.updatedAt;
          
          return (
            <List.Item
              className={`conversation-item ${isSelected(conversation) ? 'selected' : ''}`}
              onClick={() => handleItemClick(conversation)}
              style={{
                cursor: 'pointer',
                backgroundColor: isSelected(conversation) ? '#e6f7ff' : 'transparent',
                borderLeft: isSelected(conversation) ? '4px solid #1890ff' : '4px solid transparent',
                padding: '12px 16px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSelected(conversation)) {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected(conversation)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <List.Item.Meta
                avatar={
                  <Badge count={showUnreadBadge ? unreadCount : 0} size="small">
                    <Avatar 
                      icon={<UserOutlined />}
                      style={{ 
                        backgroundColor: userRole === 'teacher' ? '#52c41a' : '#1890ff'
                      }}
                    />
                  </Badge>
                }
                title={
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minWidth: 0 // Allow flex items to shrink
                  }}>
                    <Text
                      strong={unreadCount > 0}
                      style={{
                        fontSize: '14px',
                        color: unreadCount > 0 ? '#1890ff' : 'inherit',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        marginRight: '8px'
                      }}
                    >
                      {contactName}
                    </Text>
                    {showTimestamp && timestamp && (
                      <Text
                        type="secondary"
                        style={{
                          fontSize: '11px',
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}
                      >
                        {formatTimestamp(timestamp)}
                      </Text>
                    )}
                  </div>
                }
                description={
                  <div style={{ marginTop: '4px' }}>
                    {lastMessagePreview && (
                      <Text
                        type="secondary"
                        style={{
                          fontSize: '12px',
                          display: 'block',
                          marginBottom: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%'
                        }}
                      >
                        {lastMessagePreview}
                      </Text>
                    )}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'nowrap',
                      gap: '4px'
                    }}>
                      {getMessageStatus(conversation)}
                      {conversation.priority && conversation.priority !== 'MEDIUM' && (
                        <Tag
                          color={conversation.priority === 'HIGH' ? 'red' : conversation.priority === 'URGENT' ? 'magenta' : 'default'}
                          size="small"
                          style={{
                            fontSize: '10px',
                            padding: '0 4px',
                            whiteSpace: 'nowrap',
                            maxWidth: '60px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            flexShrink: 0
                          }}
                        >
                          {conversation.priority === 'HIGH' ? 'Cao' :
                           conversation.priority === 'URGENT' ? 'Khẩn cấp' :
                           conversation.priority === 'LOW' ? 'Thấp' : conversation.priority}
                        </Tag>
                      )}
                    </div>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default ConversationList;
