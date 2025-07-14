import React, { useEffect } from 'react';
import { message } from 'antd';
import { MessagingLayout } from '../components/messaging';
import useUnifiedMessaging from '../hooks/useUnifiedMessaging';
import '../styles/messaging.css';

/**
 * Unified Teacher Messaging Page
 * Uses standardized messaging components for consistent UI/UX
 */
const UnifiedTeacherMessaging = () => {
  // Get user info from localStorage or auth context
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;
  const userRole = 'teacher';

  // Debug logging
  console.log('🔍 UnifiedTeacherMessaging Debug:', {
    userStr: userStr ? 'exists' : 'null',
    user,
    userId,
    userRole
  });

  // Use unified messaging hook
  const {
    conversations,
    messages,
    contacts,
    selectedConversationId,
    loadingConversations,
    loadingMessages,
    sending,
    error,
    selectConversation,
    sendMessage,
    startNewConversation,
    refresh,
    getUserName
  } = useUnifiedMessaging(userRole, userId);

  // Debug logging for loading states
  console.log('🎭 UnifiedTeacherMessaging render states:', {
    conversationsCount: conversations.length,
    loadingConversations,
    loadingMessages,
    selectedConversationId
  });

  // Show error messages
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // Handle conversation selection
  const handleConversationSelect = (conversationId, conversationData) => {
    console.log('👨‍🏫 Teacher selecting conversation:', conversationId);
    selectConversation(conversationId, conversationData);
  };

  // Handle sending message
  const handleSendMessage = async (conversationId, content) => {
    try {
      console.log('📤 Teacher sending message:', { conversationId, content });
      await sendMessage(conversationId, content);
      message.success('Tin nhắn đã được gửi');
    } catch (err) {
      console.error('Error sending message:', err);
      message.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  // Handle new conversation
  const handleNewConversation = async (formData) => {
    try {
      console.log('🆕 Teacher starting new conversation:', formData);
      await startNewConversation(formData);
      message.success('Tin nhắn mới đã được gửi');
    } catch (err) {
      console.error('Error starting new conversation:', err);
      message.error('Không thể gửi tin nhắn mới. Vui lòng thử lại.');
      throw err; // Re-throw to prevent modal from closing
    }
  };

  // Handle view student info
  const handleViewInfo = (studentId, studentName) => {
    message.info(`Xem thông tin học sinh: ${studentName}`);
    // TODO: Implement student info modal
  };

  // Handle call student (if available)
  const handleCall = (studentId, studentName) => {
    message.info(`Gọi điện cho học sinh: ${studentName}`);
    // TODO: Implement call functionality
  };

  // Handle video call student (if available)
  const handleVideoCall = (studentId, studentName) => {
    message.info(`Gọi video với học sinh: ${studentName}`);
    // TODO: Implement video call functionality
  };

  // Handle report student (if needed)
  const handleReportUser = (studentId, studentName) => {
    message.warning(`Báo cáo học sinh: ${studentName}`);
    // TODO: Implement report functionality
  };

  // Handle delete conversation
  const handleDeleteConversation = (conversationId, studentName) => {
    message.warning(`Xóa cuộc trò chuyện với: ${studentName}`);
    // TODO: Implement delete conversation
  };

  if (!userId) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        flexDirection: 'column'
      }}>
        <p>Vui lòng đăng nhập để sử dụng tính năng tin nhắn</p>
      </div>
    );
  }

  return (
    <div className="messaging-vietnamese-text">
      <MessagingLayout
        // Data props
        conversations={conversations}
        messages={messages}
        contacts={contacts}
        currentUserId={userId}
        userRole={userRole}
        
        // State props
        selectedConversationId={selectedConversationId}
        loading={loadingConversations} // Use specific loading state for conversations
        loadingMessages={loadingMessages} // Use specific loading state for messages
        sending={sending}
        
        // Event handlers
        onConversationSelect={handleConversationSelect}
        onSendMessage={handleSendMessage}
        onNewConversation={handleNewConversation}
        
        // Optional handlers
        onCall={handleCall}
        onVideoCall={handleVideoCall}
        onViewInfo={handleViewInfo}
        onDeleteConversation={handleDeleteConversation}
        onReportUser={handleReportUser}
        
        // Customization props
        title="Quản lý tin nhắn học sinh"
        showNewMessageButton={true}
        showMessageActions={true}
      />
    </div>
  );
};

export default UnifiedTeacherMessaging;
