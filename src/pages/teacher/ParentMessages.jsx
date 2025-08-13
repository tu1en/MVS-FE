import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  List,
  Input,
  Button,
  Avatar,
  Badge,
  Space,
  Typography,
  Form,
  message,
  Empty,
  Spin,
  Tag,
  Tooltip,
  Modal,
  Select
} from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  SearchOutlined,
  UserOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * Teacher Parent Messages Page - 1-1 messaging with parents
 * Based on PARENT_ROLE_SPEC.md Phase 2 requirements
 */
const TeacherParentMessages = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageForm] = Form.useForm();
  const [newMessageForm] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessageModalVisible, setNewMessageModalVisible] = useState(false);
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);

  useEffect(() => {
    loadConversations();
    loadUnreadCount();
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.parentId, selectedConversation.studentId);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teacher/messages/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      message.error('Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (parentId, studentId) => {
    try {
      const response = await api.get(`/teacher/messages/conversations/${parentId}/students/${studentId}`);
      setMessages(response.data);
      
      // Update unread count
      loadUnreadCount();
    } catch (error) {
      console.error('Error loading messages:', error);
      message.error('Không thể tải tin nhắn');
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await api.get('/teacher/messages/unread/count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadStudents = async () => {
    try {
      // This would need to be implemented based on your student API
      // const response = await api.get('/teacher/students');
      // setStudents(response.data);
      
      // Mock data for now
      setStudents([
        { id: 1, name: 'Nguyễn Văn A', class: '12A1' },
        { id: 2, name: 'Trần Thị B', class: '12A1' },
        { id: 3, name: 'Lê Văn C', class: '12A2' }
      ]);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadParentsForStudent = async (studentId) => {
    try {
      // This would need to be implemented based on your parent API
      // const response = await api.get(`/teacher/students/${studentId}/parents`);
      // setParents(response.data);
      
      // Mock data for now
      setParents([
        { id: 1, name: 'Nguyễn Văn Cha', relationship: 'Bố' },
        { id: 2, name: 'Nguyễn Thị Mẹ', relationship: 'Mẹ' }
      ]);
    } catch (error) {
      console.error('Error loading parents:', error);
    }
  };

  const sendMessage = async (values) => {
    if (!selectedConversation) {
      message.error('Vui lòng chọn cuộc trò chuyện');
      return;
    }

    try {
      setSendingMessage(true);
      
      await api.post('/teacher/messages/send', {
        parentId: selectedConversation.parentId,
        studentId: selectedConversation.studentId,
        subject: values.subject || 'Tin nhắn từ giáo viên',
        messageContent: values.messageContent
      });

      message.success('Tin nhắn đã được gửi thành công');
      messageForm.resetFields();
      
      // Reload messages
      loadMessages(selectedConversation.parentId, selectedConversation.studentId);
      loadConversations();
      
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Không thể gửi tin nhắn');
    } finally {
      setSendingMessage(false);
    }
  };

  const sendNewMessage = async (values) => {
    try {
      setSendingMessage(true);
      
      await api.post('/teacher/messages/send', {
        parentId: values.parentId,
        studentId: values.studentId,
        subject: values.subject,
        messageContent: values.messageContent
      });

      message.success('Tin nhắn đã được gửi thành công');
      newMessageForm.resetFields();
      setNewMessageModalVisible(false);
      
      // Reload conversations
      loadConversations();
      
    } catch (error) {
      console.error('Error sending new message:', error);
      message.error('Không thể gửi tin nhắn');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return `Hôm qua ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays <= 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const getSenderName = (msg) => {
    return msg.senderType === 'TEACHER' ? 'Bạn' : selectedConversation?.parentName || 'Phụ huynh';
  };

  const filteredConversations = conversations.filter(conv =>
    conv.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderConversationList = () => (
    <List
      loading={loading}
      dataSource={filteredConversations}
      renderItem={(conversation) => (
        <List.Item
          onClick={() => setSelectedConversation(conversation)}
          style={{
            cursor: 'pointer',
            background: selectedConversation?.parentId === conversation.parentId && 
                       selectedConversation?.studentId === conversation.studentId ? '#f0f2f5' : 'white'
          }}
        >
          <List.Item.Meta
            avatar={
              <Badge count={conversation.unreadCount || 0} size="small">
                <Avatar icon={<UserOutlined />} size="large" />
              </Badge>
            }
            title={
              <Space>
                <Text strong>{conversation.parentName}</Text>
                <Tag color="green" size="small">{conversation.studentName}</Tag>
              </Space>
            }
            description={
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <Text ellipsis style={{ width: '200px' }}>
                  {conversation.lastMessage}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <ClockCircleOutlined /> {conversation.lastMessageTime}
                </Text>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );

  const renderMessageBubble = (msg) => (
    <div
      key={msg.id}
      style={{
        display: 'flex',
        justifyContent: msg.senderType === 'TEACHER' ? 'flex-end' : 'flex-start',
        marginBottom: '16px'
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          padding: '12px 16px',
          borderRadius: '18px',
          backgroundColor: msg.senderType === 'TEACHER' ? '#52c41a' : '#f0f0f0',
          color: msg.senderType === 'TEACHER' ? 'white' : 'black'
        }}
      >
        <div style={{ marginBottom: '4px' }}>
          <Text strong style={{ color: msg.senderType === 'TEACHER' ? 'white' : 'inherit' }}>
            {getSenderName(msg)}
          </Text>
        </div>
        {msg.subject && (
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
            {msg.subject}
          </div>
        )}
        <div style={{ marginBottom: '8px' }}>
          {msg.messageContent}
        </div>
        <div style={{ fontSize: '11px', opacity: 0.8 }}>
          {formatMessageTime(msg.createdAt)}
          {msg.isRead && msg.senderType === 'TEACHER' && (
            <span style={{ marginLeft: '8px' }}>✓ Đã xem</span>
          )}
        </div>
      </div>
    </div>
  );

  const renderMessageArea = () => {
    if (!selectedConversation) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          flexDirection: 'column'
        }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chọn một cuộc trò chuyện để bắt đầu nhắn tin"
          />
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{ 
          padding: '16px', 
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: 'white'
        }}>
          <Space>
            <Avatar icon={<UserOutlined />} />
            <div>
              <Title level={5} style={{ margin: 0 }}>
                {selectedConversation.parentName}
              </Title>
              <Text type="secondary">
                Về học sinh: {selectedConversation.studentName}
              </Text>
            </div>
          </Space>
        </div>

        {/* Messages */}
        <div style={{ 
          flex: 1, 
          padding: '16px', 
          overflowY: 'auto',
          backgroundColor: '#fafafa'
        }}>
          {messages.length === 0 ? (
            <Empty description="Chưa có tin nhắn nào" />
          ) : (
            messages.map(renderMessageBubble)
          )}
        </div>

        {/* Message Input */}
        <div style={{ 
          padding: '16px', 
          borderTop: '1px solid #f0f0f0',
          backgroundColor: 'white'
        }}>
          <Form form={messageForm} onFinish={sendMessage}>
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item name="messageContent" style={{ flex: 1, margin: 0 }}>
                <Input.TextArea
                  placeholder="Nhập tin nhắn..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      messageForm.submit();
                    }
                  }}
                />
              </Form.Item>
              <Form.Item style={{ margin: 0 }}>
                <Button 
                  type="primary" 
                  icon={<SendOutlined />}
                  htmlType="submit"
                  loading={sendingMessage}
                >
                  Gửi
                </Button>
              </Form.Item>
            </Space.Compact>
          </Form>
        </div>
      </div>
    );
  };

  return (
    <Layout style={{ height: 'calc(100vh - 64px)' }}>
      {/* Conversations Sidebar */}
      <Sider 
        width={350} 
        style={{ 
          backgroundColor: 'white',
          borderRight: '1px solid #f0f0f0'
        }}
      >
        <div style={{ padding: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0 }}>
                <MessageOutlined /> Tin nhắn phụ huynh
                {unreadCount > 0 && (
                  <Badge count={unreadCount} style={{ marginLeft: '8px' }} />
                )}
              </Title>
              <Space>
                <Tooltip title="Tin nhắn mới">
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setNewMessageModalVisible(true)}
                    size="small"
                  />
                </Tooltip>
                <Tooltip title="Làm mới">
                  <Button 
                    type="text" 
                    icon={<ReloadOutlined />}
                    onClick={loadConversations}
                    size="small"
                  />
                </Tooltip>
              </Space>
            </div>
            
            <Input
              prefix={<SearchOutlined />}
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Space>
        </div>

        <div style={{ height: 'calc(100% - 120px)', overflow: 'auto' }}>
          {renderConversationList()}
        </div>
      </Sider>

      {/* Message Area */}
      <Content>
        {renderMessageArea()}
      </Content>

      {/* New Message Modal */}
      <Modal
        title="Gửi tin nhắn mới"
        open={newMessageModalVisible}
        onCancel={() => {
          setNewMessageModalVisible(false);
          newMessageForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={newMessageForm}
          layout="vertical"
          onFinish={sendNewMessage}
        >
          <Form.Item
            name="studentId"
            label="Học sinh"
            rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}
          >
            <Select
              placeholder="Chọn học sinh"
              onChange={(studentId) => loadParentsForStudent(studentId)}
              showSearch
              optionFilterProp="children"
            >
              {students.map(student => (
                <Option key={student.id} value={student.id}>
                  {student.name} - {student.class}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="parentId"
            label="Phụ huynh"
            rules={[{ required: true, message: 'Vui lòng chọn phụ huynh' }]}
          >
            <Select
              placeholder="Chọn phụ huynh"
              disabled={parents.length === 0}
            >
              {parents.map(parent => (
                <Option key={parent.id} value={parent.id}>
                  {parent.name} ({parent.relationship})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subject"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề tin nhắn" />
          </Form.Item>

          <Form.Item
            name="messageContent"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung tin nhắn' }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập nội dung tin nhắn..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setNewMessageModalVisible(false);
                newMessageForm.resetFields();
              }}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={sendingMessage}
                icon={<SendOutlined />}
              >
                Gửi tin nhắn
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default TeacherParentMessages;