import {
    CalendarOutlined,
    MessageOutlined,
    NotificationOutlined,
    PlusOutlined,
    SendOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Alert,
    Avatar,
    Badge,
    Button,
    Card,
    Empty,
    Input,
    Layout,
    List,
    message,
    Modal,
    Select,
    Spin,
    Tabs,
    Typography
} from 'antd';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/vi';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Search } = Input;
const { Option } = Select;

const API_BASE_URL = 'http://localhost:8088/api';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
});

// Add axios interceptor to handle token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * CommunicationPage component for messaging and announcements
 * @returns {JSX.Element} CommunicationPage component
 */
function CommunicationPage() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [newMessageSubject, setNewMessageSubject] = useState('');  
  const [searchTerm, setSearchTerm] = useState('');
  const [announcementModalVisible, setAnnouncementModalVisible] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [users, setUsers] = useState([]);
  const [recipientOptions, setRecipientOptions] = useState([]);
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Get user info from localStorage
  const userId = parseInt(localStorage.getItem('userId'), 10);
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Check if user is a manager (role = 3 or MANAGER)
  const isManager = userRole === '3' || userRole === 'MANAGER';
  
  // Define the tabs to show based on user role
  const getTabs = () => {
    const commonTabs = [
      { key: 'messages', label: 'Tin nhắn', icon: <MessageOutlined /> },
      { key: 'announcements', label: 'Thông báo', icon: <NotificationOutlined /> },
    ];
    
    // Add schedule tab for managers
    if (isManager) {
      return [
        ...commonTabs,
        { key: 'schedule', label: 'Lịch học', icon: <CalendarOutlined /> }
      ];
    }
    
    return commonTabs;
  };

  const [activeTab, setActiveTab] = useState('messages');

  // Fetch data on component mount
  useEffect(() => {
    if (!userId || !token) {
        message.error("Thông tin xác thực không hợp lệ. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchClassrooms(),
          fetchUsers(),
          fetchConversations()
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        message.error("Không thể tải dữ liệu ban đầu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, userRole, token]);

  // Fetch classrooms
  const fetchClassrooms = async () => {
    try {
      let endpoint = '/classrooms';
      
      if (userRole === '1') { // Student
        endpoint = `/classrooms/student/${userId}`;
      } else if (userRole === '2') { // Teacher
        endpoint = `/classrooms/current-teacher`;
      }
      
      const response = await apiClient.get(endpoint);
      setClassrooms(response.data || []);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      setClassrooms([]);
      message.error("Không thể tải danh sách lớp học.");
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const [studentsResponse, teachersResponse] = await Promise.all([
        apiClient.get('/users/students'),
        apiClient.get('/users/teachers')
      ]);
      
      const allUsers = [
        ...(studentsResponse.data || []).map(user => ({ ...user, role: '1' })),
        ...(teachersResponse.data || []).map(user => ({ ...user, role: '2' }))
      ];
      
      setUsers(allUsers);
      setRecipientOptions(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setRecipientOptions([]);
      message.error("Không thể tải danh sách người dùng.");
    }
  };

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const endpoint = userRole === '1' || userRole === 'STUDENT'
        ? `/student-messages/student/${userId}` 
        : `/messages/received/${userId}`;
      
      const response = await apiClient.get(endpoint);
      const conversationsData = response.data || [];
      
      const formattedConversations = conversationsData.map(conv => ({
        id: conv.id,
        participants: [conv.senderId, conv.recipientId],
        lastMessage: {
          id: conv.id,
          senderId: conv.senderId,
          content: conv.content,
          timestamp: conv.sentAt || new Date().toISOString(),
          read: conv.read
        },
        unreadCount: conv.read ? 0 : 1,
        subject: conv.subject || 'Không có chủ đề'
      }));
      
      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
      message.error("Không thể tải danh sách hội thoại.");
    }
  };

  // Fetch messages for a conversation
  const fetchMessagesForConversation = async (conversationId) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;
      
      const otherParticipantId = conversation.participants.find(p => p !== userId);
      if (!otherParticipantId) return;

      const endpoint = `/messages/conversation/${userId}/${otherParticipantId}`;
      const response = await apiClient.get(endpoint);
      
      setMessages(prevMessages => ({
        ...prevMessages,
        [conversationId]: response.data || []
      }));
    } catch (error) {
      console.error(`Error fetching messages for conversation ${conversationId}:`, error);
      setMessages(prevMessages => ({
        ...prevMessages,
        [conversationId]: []
      }));
      message.error("Không thể tải tin nhắn cho cuộc hội thoại này.");
    }
  };

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessagesForConversation(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    
    if (conversation.unreadCount > 0) {
      apiClient.put(`/messages/${conversation.lastMessage.id}/read`)
        .then(() => {
          setConversations(prevConversations => 
            prevConversations.map(c => 
              c.id === conversation.id 
                ? { ...c, unreadCount: 0, lastMessage: { ...c.lastMessage, read: true } } 
                : c
            )
          );
        })
        .catch(error => {
          console.error('Error marking message as read:', error);
          message.error("Không thể đánh dấu tin nhắn đã đọc.");
        });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    const recipientId = selectedConversation.participants.find(p => p !== userId);
    
    const newMessagePayload = {
      senderId: userId,
      recipientId: recipientId,
      subject: selectedConversation.subject,
      content: newMessage,
    };

    try {
        const response = await apiClient.post('/messages/send', newMessagePayload);
        const savedMessage = response.data;

        const updatedMessages = [...(messages[selectedConversation.id] || []), savedMessage];
        setMessages(prev => ({ ...prev, [selectedConversation.id]: updatedMessages }));

        const updatedConversations = conversations.map(conv => {
            if (conv.id === selectedConversation.id) {
                return {
                    ...conv,
                    lastMessage: {
                        id: savedMessage.id,
                        senderId: savedMessage.senderId,
                        content: savedMessage.content,
                        timestamp: savedMessage.sentAt,
                        read: true
                    }
                };
            }
            return conv;
        });
        setConversations(updatedConversations);
        setNewMessage('');
    } catch (error) {
        console.error('Error sending message:', error);
        message.error("Gửi tin nhắn thất bại.");
    }
  };

  const handleNewConversation = async () => {
    if (!selectedRecipient || !newMessageSubject.trim() || !newMessage.trim()) return;
    
    const newConversationPayload = {
        senderId: userId,
        recipientId: selectedRecipient,
        subject: newMessageSubject,
        content: newMessage,
    };

    try {
        const response = await apiClient.post('/messages/send', newConversationPayload);
        message.success('Đã gửi tin nhắn thành công');
        setShowNewMessageModal(false);
        setNewMessage('');
        setNewMessageSubject('');
        setSelectedRecipient(null);
        fetchConversations(); // Refresh conversations list
    } catch (error) {
        console.error('Error creating new conversation:', error);
        message.error("Tạo cuộc hội thoại mới thất bại.");
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementContent.trim() || !selectedClassroom) {
      message.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    const announcementPayload = {
      title: announcementTitle,
      content: announcementContent,
      classroomId: selectedClassroom,
      teacherId: userId
    };

    try {
        await apiClient.post('/announcements', announcementPayload);
        message.success('Đã gửi thông báo đến lớp học thành công');
        setAnnouncementModalVisible(false);
        setAnnouncementTitle('');
        setAnnouncementContent('');
        setSelectedClassroom(null);
        // Optionally refresh announcements list if displayed here
    } catch(error) {
        console.error('Error creating announcement:', error);
        message.error('Tạo thông báo thất bại.');
    }
  };

  const getRecipientName = (conversation) => {
    if (!conversation || !conversation.participants) return 'Người dùng';
    const recipientId = conversation.participants.find(id => id !== userId);
    const recipient = users.find(user => user.id === recipientId);
    return recipient ? recipient.fullName || recipient.name : 'Người dùng';
  };

  const getUserById = (id) => {
    return users.find(user => user.id === id) || { fullName: 'Người dùng', avatar: null };
  };

  const filteredConversations = conversations.filter(conv => {
    const recipientName = getRecipientName(conv) || '';
    return recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (conv.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (conv.lastMessage?.content || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const renderMainContent = () => {
    if (!userId || !token) {
      return (
        <div className="error-container" style={{padding: '20px'}}>
          <Alert
            message="Lỗi xác thực"
            description="Vui lòng đăng nhập lại để tiếp tục."
            type="error"
            showIcon
          />
        </div>
      );
    }

    return (
      <div className="communication-container">
        <div className="communication-header">
          <h1>Quản lý Giao tiếp</h1>
          <div className="action-buttons">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setShowNewMessageModal(true)}
            >
              Tin nhắn mới
            </Button>
            {isManager && (
              <Button
                type="primary"
                icon={<NotificationOutlined />}
                onClick={() => setAnnouncementModalVisible(true)}
                style={{ marginLeft: 10 }}
              >
                Thông báo mới
              </Button>
            )}
          </div>
        </div>
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          className="communication-tabs"
          items={getTabs()}
        />
        <div className="tab-content">
          {activeTab === 'messages' && renderMessagesTab()}
          {activeTab === 'announcements' && renderAnnouncementsTab()}
          {activeTab === 'schedule' && isManager && renderScheduleTab()}
        </div>
      </div>
    );
  };

  const renderMessagesTab = () => (
    <Layout style={{ background: '#fff', minHeight: 'calc(100vh - 180px)' }}>
        <Sider width={300} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', height: 'calc(100vh - 180px)', overflow: 'auto' }}>
            <div style={{ padding: '16px' }}>
                <Search placeholder="Tìm kiếm hội thoại" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ marginBottom: '16px' }} allowClear />
                {renderConversationsList()}
            </div>
        </Sider>
        <Content style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
                <>
                    <div className="conversation-header" style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar icon={<UserOutlined />} size="large" style={{ marginRight: '12px' }} />
                            <div>
                                <Title level={5} style={{ margin: 0 }}>{getRecipientName(selectedConversation)}</Title>
                                <Text type="secondary">{selectedConversation.subject}</Text>
                            </div>
                        </div>
                    </div>
                    {renderMessagesList()}
                    {renderMessageInput()}
                </>
            ) : (
                <div className="empty-chat" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Empty description="Chọn một cuộc trò chuyện để bắt đầu" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
            )}
        </Content>
    </Layout>
  );

  const renderConversationsList = () => {
    if (filteredConversations.length === 0) {
      return <Empty description="Không có cuộc trò chuyện nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    return (
      <List
        dataSource={filteredConversations}
        renderItem={item => {
          const recipientName = getRecipientName(item);
          const isSelected = selectedConversation?.id === item.id;
          return (
            <List.Item className={`conversation-item ${isSelected ? 'selected-conversation' : ''}`} style={{ padding: '12px 16px', cursor: 'pointer', backgroundColor: isSelected ? '#e6f7ff' : 'transparent', borderBottom: '1px solid #f0f0f0' }} onClick={() => handleConversationSelect(item)}>
              <List.Item.Meta
                avatar={<Badge count={item.unreadCount}><Avatar icon={<UserOutlined />} /></Badge>}
                title={<div style={{ display: 'flex', justifyContent: 'space-between' }}><Text strong={item.unreadCount > 0}>{recipientName}</Text><Text type="secondary" style={{ fontSize: '12px' }}>{moment(item.lastMessage.timestamp).fromNow()}</Text></div>}
                description={
                  <div>
                    <div style={{ fontWeight: item.unreadCount > 0 ? 'bold' : 'normal' }}>{item.subject}</div>
                    <Text type={item.unreadCount > 0 ? "text" : "secondary"} style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px', display: 'block', fontWeight: item.unreadCount > 0 ? 'bold' : 'normal' }}>
                      {item.lastMessage.senderId === userId ? `Bạn: ${item.lastMessage.content}` : item.lastMessage.content}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
    );
  };
  
  const renderMessagesList = () => {
    const currentMessages = messages[selectedConversation?.id] || [];
    if (currentMessages.length === 0) {
        return (
            <div className="messages-container" style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
                <Empty description="Chưa có tin nhắn nào trong cuộc trò chuyện này." />
            </div>
        );
    }

    return (
        <div className="messages-container" style={{ flexGrow: 1, padding: '16px', overflowY: 'auto' }}>
            {currentMessages.map(msg => {
                const isCurrentUser = msg.senderId === userId;
                const sender = getUserById(msg.senderId);
                return (
                    <div key={msg.id} className={`message-bubble ${isCurrentUser ? 'message-sent' : 'message-received'}`} style={{ display: 'flex', justifyContent: isCurrentUser ? 'flex-end' : 'flex-start', marginBottom: '16px' }}>
                        {!isCurrentUser && <Avatar icon={<UserOutlined />} style={{ marginRight: '8px', alignSelf: 'flex-end' }} />}
                        <div style={{ maxWidth: '70%', padding: '8px 12px', borderRadius: '12px', backgroundColor: isCurrentUser ? '#1890ff' : '#f0f0f0', color: isCurrentUser ? 'white' : 'rgba(0, 0, 0, 0.85)' }}>
                            <div style={{ marginBottom: '4px' }}><Text strong style={{ color: isCurrentUser ? 'white' : 'rgba(0, 0, 0, 0.85)' }}>{isCurrentUser ? 'Bạn' : sender.fullName}</Text></div>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                            <div style={{ textAlign: 'right', marginTop: '4px' }}><Text style={{ fontSize: '12px', color: isCurrentUser ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.45)' }}>{moment(msg.sentAt).format('HH:mm, DD/MM/YYYY')}</Text></div>
                        </div>
                        {isCurrentUser && <Avatar icon={<UserOutlined />} style={{ marginLeft: '8px', alignSelf: 'flex-end' }} />}
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
  };

  const renderMessageInput = () => (
    <div className="message-input" style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
        <Input.TextArea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Nhập tin nhắn..." autoSize={{ minRows: 2, maxRows: 4 }} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} style={{ marginBottom: '8px' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage} disabled={!newMessage.trim()}>Gửi</Button>
        </div>
    </div>
  );

  const renderNewMessageModal = () => (
    <Modal
        title="Tin nhắn mới"
        open={showNewMessageModal}
        onCancel={() => setShowNewMessageModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowNewMessageModal(false)}>Hủy</Button>,
          <Button key="send" type="primary" onClick={handleNewConversation} disabled={!selectedRecipient || !newMessageSubject.trim() || !newMessage.trim()}>Gửi</Button>
        ]}
    >
        <div style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '8px' }}>Người nhận:</div>
            <Select style={{ width: '100%' }} placeholder="Chọn người nhận" value={selectedRecipient} onChange={setSelectedRecipient}>
                {recipientOptions.map(user => (
                    <Option key={user.id} value={user.id}>{`${user.fullName} (${user.role === '1' ? 'Học sinh' : 'Giảng viên'})`}</Option>
                ))}
            </Select>
        </div>
        <div style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '8px' }}>Tiêu đề:</div>
            <Input value={newMessageSubject} onChange={(e) => setNewMessageSubject(e.target.value)} placeholder="Nhập tiêu đề tin nhắn" />
        </div>
        <div>
            <div style={{ marginBottom: '8px' }}>Nội dung:</div>
            <TextArea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Nhập nội dung tin nhắn" autoSize={{ minRows: 4, maxRows: 6 }} />
        </div>
    </Modal>
  );
  
  const renderAnnouncementModal = () => (
    <Modal
        title="Tạo thông báo lớp học"
        open={announcementModalVisible}
        onCancel={() => setAnnouncementModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAnnouncementModalVisible(false)}>Hủy</Button>,
          <Button key="send" type="primary" onClick={handleCreateAnnouncement} disabled={!announcementTitle.trim() || !announcementContent.trim() || !selectedClassroom}>Gửi thông báo</Button>
        ]}
    >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px' }}>Lớp học:</div>
          <Select style={{ width: '100%' }} placeholder="Chọn lớp học" value={selectedClassroom} onChange={setSelectedClassroom}>
            {classrooms.map(c => (<Option key={c.id} value={c.id}>{c.name}</Option>))}
          </Select>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px' }}>Tiêu đề thông báo:</div>
          <Input value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} placeholder="Nhập tiêu đề" />
        </div>
        <div>
          <div style={{ marginBottom: '8px' }}>Nội dung thông báo:</div>
          <TextArea value={announcementContent} onChange={(e) => setAnnouncementContent(e.target.value)} placeholder="Nhập nội dung" autoSize={{ minRows: 4, maxRows: 6 }} />
        </div>
    </Modal>
  );

  const renderAnnouncementsTab = () => (
    <div className="announcements-tab">
        <div className="announcements-header">
            <h2>Quản lý Thông báo</h2>
            {isManager && (<Button type="primary" onClick={() => navigate('/manager/announcements')}>Xem tất cả thông báo</Button>)}
        </div>
        <div className="announcements-content">
            <Alert message="Quản lý thông báo" description="Xem, tạo, sửa và xóa thông báo." type="info" showIcon />
            <div style={{ marginTop: '20px' }}>
                <Card title="Thao tác nhanh">
                    {isManager ? (
                        <>
                            <Button type="primary" style={{ marginRight: '10px' }} onClick={() => navigate('/manager/announcements')}>Xem thông báo</Button>
                            <Button onClick={() => navigate('/manager/announcements/create')}>Tạo thông báo mới</Button>
                        </>
                    ) : (
                        <Empty description="Chức năng này chỉ dành cho quản lý" />
                    )}
                </Card>
            </div>
        </div>
    </div>
  );

  const renderScheduleTab = () => (
    <div className="schedule-tab">
        <div className="schedule-header">
            <h2>Quản lý Lịch học</h2>
            <Button type="primary" onClick={() => navigate('/manager/schedule')}>Xem chi tiết lịch học</Button>
        </div>
        <div className="schedule-content">
            <Alert message="Quản lý lịch học" description="Quản lý lịch học cho các lớp trong hệ thống." type="info" showIcon />
            <div style={{ marginTop: '20px' }}>
                <Card title="Thao tác nhanh">
                    <Button type="primary" style={{ marginRight: '10px' }} onClick={() => navigate('/manager/schedule')}>Xem lịch học</Button>
                    <Button onClick={() => navigate('/manager/schedule/create')}>Tạo lịch học mới</Button>
                </Card>
            </div>
        </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="communication-page">
      {renderMainContent()}
      {renderNewMessageModal()}
      {renderAnnouncementModal()}
    </div>
  );
}

export default CommunicationPage; 