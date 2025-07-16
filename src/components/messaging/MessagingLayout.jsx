import { MessageOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, message, Modal, Row, Select } from 'antd';
import { useState } from 'react';
import {
    ConversationList,
    MessageHeader,
    MessageInput,
    MessageList
} from './index';

const { Option } = Select;
const { TextArea } = Input;

/**
 * Unified MessagingLayout component for both student and teacher messaging interfaces
 * Provides consistent two-column layout with conversation list and message view
 */
const MessagingLayout = ({
  // Data props
  conversations = [],
  messages = [],
  contacts = [], // For new message modal
  currentUserId,
  userRole = 'student', // 'student' or 'teacher'
  
  // State props
  selectedConversationId,
  loading = false, // For backward compatibility - used for conversations
  loadingMessages = false, // Specific loading state for messages
  sending = false,
  
  // Event handlers
  onConversationSelect,
  onSendMessage,
  onNewConversation,
  onLoadMoreMessages,
  
  // Optional handlers
  onCall,
  onVideoCall,
  onViewInfo,
  onDeleteConversation,
  onReportUser,
  
  // Customization props
  title = 'Tin nhắn',
  showNewMessageButton = true,
  showMessageActions = true,
  className = '',
  style = {}
}) => {
  const [newMessageModalVisible, setNewMessageModalVisible] = useState(false);
  const [newMessageForm] = Form.useForm();
  const [messageText, setMessageText] = useState('');

  // Get selected conversation data
  const selectedConversation = conversations.find(
    conv => (conv.id || conv.studentId || conv.teacherId) === selectedConversationId
  );

  // Get contact name for header
  const getContactName = () => {
    if (!selectedConversation) return '';
    
    if (userRole === 'teacher') {
      return selectedConversation.studentName || 
             selectedConversation.recipientName || 
             `Học sinh #${selectedConversation.studentId || selectedConversation.recipientId}`;
    } else {
      return selectedConversation.teacherName || 
             selectedConversation.senderName || 
             `Giáo viên #${selectedConversation.teacherId || selectedConversation.senderId}`;
    }
  };

  // Get contact role for header
  const getContactRole = () => {
    return userRole === 'teacher' ? 'student' : 'teacher';
  };

  // Handle sending message
  const handleSendMessage = (content) => {
    if (!selectedConversationId || !content.trim()) {
      message.error('Vui lòng chọn cuộc trò chuyện và nhập nội dung tin nhắn');
      return;
    }

    onSendMessage?.(selectedConversationId, content.trim());
    setMessageText('');
  };

  // Handle new message modal
  const handleNewMessage = () => {
    setNewMessageModalVisible(true);
  };

  const handleNewMessageSubmit = async (values) => {
    try {
      await onNewConversation?.(values);
      setNewMessageModalVisible(false);
      newMessageForm.resetFields();
      message.success('Tin nhắn đã được gửi thành công');
    } catch (error) {
      message.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  const handleNewMessageCancel = () => {
    setNewMessageModalVisible(false);
    newMessageForm.resetFields();
  };

  // Get user name for message display
  const getUserName = (userId) => {
    const contact = contacts.find(c => c.id === userId);
    if (contact) {
      return contact.fullName || contact.name || contact.username;
    }
    
    // Fallback based on role
    if (userRole === 'teacher') {
      return `Học sinh #${userId}`;
    } else {
      return `Giáo viên #${userId}`;
    }
  };

  return (
    <div 
      className={`messaging-layout ${className}`}
      style={{
        height: 'calc(100vh - 120px)',
        ...style
      }}
    >
      <Row gutter={0} style={{ height: '100%' }}>
        {/* Left Column - Conversation List */}
        <Col 
          xs={24} 
          sm={24} 
          md={8} 
          lg={6} 
          xl={6}
          style={{ 
            height: '100%',
            borderRight: '1px solid #f0f0f0'
          }}
        >
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{title}</span>
                {showNewMessageButton && onNewConversation && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={handleNewMessage}
                  >
                    Tin nhắn mới
                  </Button>
                )}
              </div>
            }
            style={{ 
              height: '100%',
              border: 'none',
              borderRadius: 0
            }}
            styles={{
              header: {
                borderBottom: '1px solid #f0f0f0',
                padding: '12px 16px'
              },
              body: {
                padding: 0,
                height: 'calc(100% - 57px)',
                overflow: 'hidden'
              }
            }}
          >
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onConversationSelect={onConversationSelect}
              loading={loading}
              userRole={userRole}
              emptyText={userRole === 'teacher' ? 'Chưa có tin nhắn từ học sinh' : 'Chưa có tin nhắn từ giáo viên'}
              style={{ height: '100%', overflow: 'auto' }}
            />
          </Card>
        </Col>

        {/* Right Column - Message View */}
        <Col 
          xs={24} 
          sm={24} 
          md={16} 
          lg={18} 
          xl={18}
          style={{ height: '100%' }}
        >
          <Card
            style={{ 
              height: '100%',
              border: 'none',
              borderRadius: 0,
              display: 'flex',
              flexDirection: 'column'
            }}
            styles={{
              body: {
                padding: 0,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }
            }}
          >
            {/* Message Header */}
            <MessageHeader
              contactName={getContactName()}
              contactId={selectedConversation?.studentId || selectedConversation?.teacherId}
              contactRole={getContactRole()}
              conversationId={selectedConversationId}
              showActions={showMessageActions}
              onCall={onCall}
              onVideoCall={onVideoCall}
              onViewInfo={onViewInfo}
              onDeleteConversation={onDeleteConversation}
              onReportUser={onReportUser}
            />

            {/* Message List */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {selectedConversationId ? (
                <MessageList
                  messages={messages}
                  currentUserId={currentUserId}
                  loading={loadingMessages}
                  getUserName={getUserName}
                  emptyText="Chưa có tin nhắn nào trong cuộc trò chuyện này"
                  showStatus={true}
                  style={{ height: '100%' }}
                />
              ) : (
                <div style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#8c8c8c'
                }}>
                  <MessageOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            {selectedConversationId && (
              <MessageInput
                value={messageText}
                onChange={setMessageText}
                onSend={handleSendMessage}
                loading={sending}
                placeholder={`Nhập tin nhắn cho ${getContactName()}...`}
                showAttachment={false}
                showEmoji={false}
                maxLength={1000}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* New Message Modal */}
      <Modal
        title="Soạn tin nhắn mới"
        open={newMessageModalVisible}
        onCancel={handleNewMessageCancel}
        footer={null}
        width={600}
      >
        <Form
          form={newMessageForm}
          layout="vertical"
          onFinish={handleNewMessageSubmit}
        >
          <Form.Item
            name="recipientId"
            label={userRole === 'teacher' ? 'Gửi đến học sinh' : 'Gửi đến giáo viên'}
            rules={[{ required: true, message: 'Vui lòng chọn người nhận' }]}
          >
            <Select
              placeholder={userRole === 'teacher' ? 'Chọn học sinh' : 'Chọn giáo viên'}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {contacts.map(contact => (
                <Option key={contact.id} value={contact.id}>
                  {contact.fullName || contact.name || contact.username} 
                  {contact.id && ` (ID: ${contact.id})`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subject"
            label="Chủ đề"
            rules={[{ required: true, message: 'Vui lòng nhập chủ đề' }]}
          >
            <Input placeholder="Nhập chủ đề tin nhắn" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung tin nhắn' }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập nội dung tin nhắn..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={handleNewMessageCancel} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={sending}>
              Gửi tin nhắn
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MessagingLayout;
