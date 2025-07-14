import React, { useEffect } from 'react';
import { message } from 'antd';
import { MessagingLayout } from '../components/messaging';
import useUnifiedMessaging from '../hooks/useUnifiedMessaging';
import '../styles/messaging.css';

/**
 * Unified Student Messaging Page
 * Uses standardized messaging components for consistent UI/UX
 */
const UnifiedStudentMessaging = () => {
  // Get user info from localStorage or auth context
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;
  const userRole = 'student';

  // Use unified messaging hook
  const {
    conversations,
    messages,
    contacts,
    selectedConversationId,
    loading,
    sending,
    error,
    selectConversation,
    sendMessage,
    startNewConversation,
    refresh,
    getUserName
  } = useUnifiedMessaging(userRole, userId);

  // Show error messages
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // Handle conversation selection
  const handleConversationSelect = (conversationId, conversationData) => {
    console.log('📱 Student selecting conversation:', conversationId);
    selectConversation(conversationId, conversationData);
  };

  // Handle sending message
  const handleSendMessage = async (conversationId, content) => {
    try {
      console.log('📤 Student sending message:', { conversationId, content });
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
      console.log('🆕 Student starting new conversation:', formData);
      await startNewConversation(formData);
      message.success('Tin nhắn mới đã được gửi');
    } catch (err) {
      console.error('Error starting new conversation:', err);
      message.error('Không thể gửi tin nhắn mới. Vui lòng thử lại.');
      throw err; // Re-throw to prevent modal from closing
    }
  };

  // Handle view teacher info
  const handleViewInfo = (teacherId, teacherName) => {
    message.info(`Xem thông tin giáo viên: ${teacherName}`);
    // TODO: Implement teacher info modal
  };

  // Handle report teacher (if needed)
  const handleReportUser = (teacherId, teacherName) => {
    message.warning(`Báo cáo giáo viên: ${teacherName}`);
    // TODO: Implement report functionality
  };

  // Handle delete conversation
  const handleDeleteConversation = (conversationId, teacherName) => {
    message.warning(`Xóa cuộc trò chuyện với: ${teacherName}`);
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
        loading={loading}
        sending={sending}
        
        // Event handlers
        onConversationSelect={handleConversationSelect}
        onSendMessage={handleSendMessage}
        onNewConversation={handleNewConversation}
        
        // Optional handlers
        onViewInfo={handleViewInfo}
        onDeleteConversation={handleDeleteConversation}
        onReportUser={handleReportUser}
        
        // Customization props
        title="Tin nhắn với giáo viên"
        showNewMessageButton={true}
        showMessageActions={true}
      />
    </div>
  );
};

export default UnifiedStudentMessaging;
