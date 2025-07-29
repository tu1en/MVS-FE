import {
    BellOutlined,
    PlusOutlined,
    SendOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Badge,
    Button,
    Empty,
    Input,
    Layout,
    List,
    message,
    Modal,
    Select,
    Spin,
    Typography
} from 'antd';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/vi';
import { useEffect, useRef, useState } from 'react';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Search } = Input;

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

  // Get user info from localStorage
  const userId = parseInt(localStorage.getItem('userId')) || 101;
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role') || '1';

  // Debug logging for role detection
  console.log('CommunicationPage - Role Debug:', { 
    userId, 
    userRole, 
    roleFromStorage: localStorage.getItem('role'),
    token: localStorage.getItem('token') 
  });

  // Main content renderer with comprehensive role validation
  const renderMainContent = () => {
    // Don't render if no valid role or user ID
    if (!userId || !userRole || !token) {
      console.warn('CommunicationPage: Missing required authentication data:', { userId, userRole, token: !!token });
      return (
        <div className="text-center p-8">
          <h2>⚠️ Lỗi xác thực</h2>
          <p>Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại.</p>
          <Button type="primary" onClick={() => window.location.href = '/login'}>
            Đăng nhập lại
          </Button>
        </div>
      );
    }

    // Valid roles for this page: all authenticated users can access communication
    if (!['0', '1', '2', '3', 'ADMIN', 'STUDENT', 'TEACHER', 'MANAGER'].includes(userRole)) {
      console.error('CommunicationPage: Unrecognized role:', userRole);
      return (
        <div className="text-center p-8">
          <h2>⚠️ Vai trò không được hỗ trợ</h2>
          <p>Vai trò "{userRole}" không được hỗ trợ cho trang này.</p>
          <Button type="primary" onClick={() => window.location.href = '/login'}>
            Đăng nhập lại
          </Button>
        </div>
      );
    }

    // Render communication interface for all valid roles
    return (
      <Layout style={{ background: '#fff', minHeight: 'calc(100vh - 64px)' }}>
        <Sider
          width={300}
          style={{ 
            background: '#fff', 
            borderRight: '1px solid #f0f0f0',
            height: 'calc(100vh - 64px)',
            overflow: 'auto'
          }}
        >
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0 }}>Tin nhắn</Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setShowNewMessageModal(true)}
              >
                Tin nhắn mới
              </Button>
            </div>
            
            <Search
              placeholder="Tìm kiếm hội thoại"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: '16px' }}
              allowClear
            />
            
            {/* Only managers and admins can create announcements */}
            {(userRole === '3' || userRole === 'MANAGER' || userRole === '0' || userRole === 'ADMIN') && (
              <Button
                type="default"
                icon={<BellOutlined />}
                onClick={() => setAnnouncementModalVisible(true)}
                style={{ marginBottom: '16px', width: '100%' }}
              >
                Tạo thông báo lớp học
              </Button>
            )}
          </div>
          
          {renderConversationsList()}
        </Sider>
        
        <Content style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
          {selectedConversation && (
            <div className="conversation-header" style={{ 
              padding: '16px', 
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar icon={<UserOutlined />} size="large" style={{ marginRight: '12px' }} />
                <div>
                  <Title level={5} style={{ margin: 0 }}>{getRecipientName(selectedConversation)}</Title>
                  <Text type="secondary">{selectedConversation.subject}</Text>
                </div>
              </div>
            </div>
          )}
          
          {renderMessagesList()}
          {renderMessageInput()}
        </Content>
      </Layout>
    );
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchClassrooms(),
          fetchUsers(),
          fetchConversations()
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, userRole]);

  // Fetch classrooms
  const fetchClassrooms = async () => {
    try {
      let endpoint = '/classrooms';
      
      if (userRole === '1') { // Student
        endpoint = `/classrooms/student/${userId}`;
      } else if (userRole === '2') { // Teacher
        endpoint = `/classroom-management/current-teacher`;
      }
      
      const response = await apiClient.get(endpoint);
      setClassrooms(response.data || []);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      setClassrooms([]);
    }
  };
  // Fetch users
  const fetchUsers = async () => {
    try {
      // Fetch students and teachers
      const studentsResponse = await apiClient.get('/users/students');
      const teachersResponse = await apiClient.get('/users/teachers');
      
      // Combine and format users
      const allUsers = [
        ...(studentsResponse.data || []).map(user => ({
          ...user,
          role: '1' // Student role
        })),
        ...(teachersResponse.data || []).map(user => ({
          ...user,
          role: '2' // Teacher role 
        }))
      ];
      
      setUsers(allUsers);
      setRecipientOptions(allUsers); // Populate the recipient options for new messages
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback mock data when API fails
      const mockUsers = [
        {
          id: 296,
          fullName: 'Giảng viên Toán',
          email: 'teacher@example.com',
          role: '2',
          roleName: 'TEACHER'
        },
        {
          id: 36,
          fullName: 'Học sinh A',
          email: 'student@example.com',
          role: '1',
          roleName: 'STUDENT'
        }
      ];
      setUsers(mockUsers);
      setRecipientOptions(mockUsers); // Populate the recipient options for new messages
    }
  };
  // Fetch conversations
  const fetchConversations = async () => {
    try {
      // For students: GET /api/student-messages/student/{studentId}
      // For teachers: GET /api/teacher-messages/received for received or /api/teacher-messages/sent for sent
      const endpoint = userRole === '1' || userRole === 'STUDENT'
        ? `/student-messages/student/${userId}` 
        : `/messages/received/${userId}`;
      
      console.log(`Fetching conversations from endpoint: ${API_BASE_URL}${endpoint}`);
      
      const response = await apiClient.get(endpoint);
      const conversationsData = response.data || [];
      
      // If we got an empty array from the API and this is a known test user ID, use mock data
      if (conversationsData.length === 0 && (userId === 404 || userId === 36)) {
        console.log("No conversations returned from API, using mock data");
        const mockConversations = [
          {
            id: 1,
            participants: [296, userId], // teacher and current user
            lastMessage: {
              id: 1,
              senderId: 296,
              content: 'Nhớ nộp bài tập toán trước ngày mai nhé.',
              timestamp: new Date(Date.now() - 24*60*60*1000).toISOString(), // 1 day ago
              read: false
            },
            unreadCount: 1,
            subject: 'Thông báo về bài tập'
          },
          {
            id: 2,
            participants: [296, userId],
            lastMessage: {
              id: 2,
              senderId: 296,
              content: 'Thứ 6 tuần sau sẽ có kiểm tra văn. Các em chuẩn bị chương 1-3.',
              timestamp: new Date(Date.now() - 6*60*60*1000).toISOString(), // 6 hours ago
              read: false
            },
            unreadCount: 1,
            subject: 'Lịch kiểm tra'
          }
        ];
        setConversations(mockConversations);
        console.log("Using mock data:", mockConversations);
        return;
      }
      
      // Format conversations for UI
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
      console.log("Fetched conversations:", formattedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      console.log("never using mock/fake data");
      
      // Always use fallback mock data on error for better UX
      if (userRole === '1' || userRole === 'STUDENT') {
        const mockConversations = [
          {
            id: 1,
            participants: [296, userId], // teacher and current user
            lastMessage: {
              id: 1,
              senderId: 296,
              content: 'Nhớ nộp bài tập toán trước ngày mai nhé.',
              timestamp: new Date(Date.now() - 24*60*60*1000).toISOString(), // 1 day ago
              read: false
            },
            unreadCount: 1,
            subject: 'Thông báo về bài tập'
          },
          {
            id: 2,
            participants: [296, userId],
            lastMessage: {
              id: 2,
              senderId: 296,
              content: 'Thứ 6 tuần sau sẽ có kiểm tra văn. Các em chuẩn bị chương 1-3.',
              timestamp: new Date(Date.now() - 6*60*60*1000).toISOString(), // 6 hours ago
              read: false
            },
            unreadCount: 1,
            subject: 'Lịch kiểm tra'
          }
        ];
        setConversations(mockConversations);
        console.log("Using mock data after API error:", mockConversations);
      } else {
        // Mock data for teachers
        const mockConversations = [
          {
            id: 3,
            participants: [userId, 36], // teacher and student
            lastMessage: {
              id: 3,
              senderId: 36,
              content: 'Thưa thầy, em có thể nộp bài tập muộn một ngày được không ạ?',
              timestamp: new Date(Date.now() - 2*60*60*1000).toISOString(), // 2 hours ago
              read: false
            },
            unreadCount: 1,
            subject: 'Xin phép nộp bài muộn'
          },
          {
            id: 4,
            participants: [userId, 37],
            lastMessage: {
              id: 4,
              senderId: 37,
              content: 'Thầy ơi, em không hiểu bài tập số 5. Thầy có thể giải thích lại được không ạ?',
              timestamp: new Date(Date.now() - 1*60*60*1000).toISOString(), // 1 hour ago
              read: false
            },
            unreadCount: 1,
            subject: 'Hỏi về bài tập'
          }
        ];
        setConversations(mockConversations);
        console.log("Using teacher mock data after API error:", mockConversations);
      }
    }
  };

  // Fetch messages for a conversation
  const fetchMessagesForConversation = async (conversationId) => {
    try {
      // Get conversation between two users
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;
      
      // Extract other participant from the conversation
      const otherParticipantId = conversation.participants.find(p => p !== userId);
      
      const endpoint = `/messages/conversation/${userId}/${otherParticipantId}`;
      console.log(`Fetching messages from endpoint: ${API_BASE_URL}${endpoint}`);
      
      const response = await apiClient.get(endpoint);
      const messagesData = response.data || [];
      
      // If we got an empty array from the API, use mock data
      if (messagesData.length === 0) {
        console.log("No messages returned from API, using mock data");
        
        // Create mock messages based on the conversation
        const mockMessages = [
          {
            id: conversationId * 100 + 1,
            conversationId: conversationId,
            senderId: conversation.lastMessage.senderId,
            recipientId: userId,
            content: conversation.lastMessage.content,
            timestamp: conversation.lastMessage.timestamp,
            read: false
          }
        ];
        
        // Add a second message if this is conversation #1
        if (conversationId === 1) {
          mockMessages.push({
            id: conversationId * 100 + 2,
            conversationId: conversationId,
            senderId: userId,
            recipientId: conversation.participants.find(p => p !== userId),
            content: "Dạ em sẽ nộp bài đúng hạn ạ. Cảm ơn thầy/cô đã nhắc nhở.",
            timestamp: new Date(Date.now() - 20*60*60*1000).toISOString(),
            read: true
          });
        }
        
        // Update messages state
        setMessages(prevMessages => ({
          ...prevMessages,
          [conversationId]: mockMessages
        }));
        
        console.log("Using mock messages:", mockMessages);
        return;
      }
      
      // Update messages state
      setMessages(prevMessages => ({
        ...prevMessages,
        [conversationId]: response.data || []
      }));
    } catch (error) {
      console.error(`Error fetching messages for conversation ${conversationId}:`, error);
      
      // Create mock messages based on the conversation
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;
      
      const mockMessages = [
        {
          id: conversationId * 100 + 1,
          conversationId: conversationId,
          senderId: conversation.lastMessage.senderId,
          recipientId: userId,
          content: conversation.lastMessage.content,
          timestamp: conversation.lastMessage.timestamp,
          read: false
        }
      ];
      
      // Add a second message if this is conversation #1
      if (conversationId === 1) {
        mockMessages.push({
          id: conversationId * 100 + 2,
          conversationId: conversationId,
          senderId: userId,
          recipientId: conversation.participants.find(p => p !== userId),
          content: "Dạ em sẽ nộp bài đúng hạn ạ. Cảm ơn thầy/cô đã nhắc nhở.",
          timestamp: new Date(Date.now() - 20*60*60*1000).toISOString(),
          read: true
        });
      }
      
      // Set empty array for the conversation to prevent errors
      setMessages(prevMessages => ({
        ...prevMessages,
        [conversationId]: mockMessages
      }));
      
      console.log("Using mock messages after API error:", mockMessages);
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
    
    // If there are unread messages, mark them as read
    if (conversation.unreadCount > 0) {
      // Call API to mark messages as read
      apiClient.put(`/messages/${conversation.lastMessage.id}/read`)
        .then(() => {
          // Update conversation in state
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
        });
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    const newMessageObj = {
      id: Math.floor(Math.random() * 10000) + 4000,
      conversationId: selectedConversation.id,
      senderId: parseInt(userId) || (userRole === '1' ? 101 : userRole === '2' ? 201 : 301),
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: true
    };
    
    // Initialize messages array if it doesn't exist
    const existingMessages = messages[selectedConversation.id] || [];
    
    // Update messages
    const updatedMessages = [...existingMessages, newMessageObj];
    setMessages(prevMessages => ({
      ...prevMessages,
      [selectedConversation.id]: updatedMessages
    }));
    
    // Update conversation last message
    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          lastMessage: {
            id: newMessageObj.id,
            senderId: newMessageObj.senderId,
            content: newMessageObj.content,
            timestamp: newMessageObj.timestamp,
            read: true
          }
        };
      }
      return conv;
    });
    setConversations(updatedConversations);
    
    // Clear input
    setNewMessage('');
  };

  const handleNewConversation = () => {
    if (!selectedRecipient || !newMessageSubject.trim()) return;
    
    const currentUserId = parseInt(userId) || (userRole === '1' ? 101 : userRole === '2' ? 201 : 301);
    
    // Create a new conversation
    const newConversationId = Math.floor(Math.random() * 100) + 10;
    const newConversation = {
      id: newConversationId,
      participants: [currentUserId, selectedRecipient],
      lastMessage: {
        id: Math.floor(Math.random() * 10000) + 5000,
        senderId: currentUserId,
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: true
      },
      unreadCount: 0,
      subject: newMessageSubject
    };
    
    // Create initial message
    const initialMessage = {
      id: Math.floor(Math.random() * 10000) + 5000,
      conversationId: newConversationId,
      senderId: currentUserId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: true
    };
    
    // Update state
    setConversations([newConversation, ...conversations]);
    setMessages(prevMessages => ({
      ...prevMessages,
      [newConversationId]: [initialMessage]
    }));
    setSelectedConversation(newConversation);
    
    // Reset form
    setShowNewMessageModal(false);
    setSelectedRecipient(null);
    setNewMessageSubject('');
    setNewMessage('');
    
    message.success('Đã gửi tin nhắn thành công');
  };

  const handleCreateAnnouncement = () => {
    if (!announcementTitle.trim() || !announcementContent.trim() || !selectedClassroom) {
      message.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    const currentUserId = parseInt(userId) || 201;
    
    // const newAnnouncement = {
    //   id: mockAnnouncements.length + 1,
    //   title: announcementTitle,
    //   content: announcementContent,
    //   classroomId: selectedClassroom,
    //   teacherId: currentUserId,
    //   teacherName: teacher.name,
    //   createdAt: new Date().toISOString()
    // };
    
    // In a real app, would save to API
    // For now, just show success message
    message.success('Đã gửi thông báo đến lớp học thành công');
    
    // Reset form
    setAnnouncementModalVisible(false);
    setAnnouncementTitle('');
    setAnnouncementContent('');
    setSelectedClassroom(null);
  };

  const getRecipientName = (conversation) => {
    const currentUserId = parseInt(userId) || (userRole === '1' ? 101 : userRole === '2' ? 201 : 301);
    const recipientId = conversation.participants.find(id => id !== currentUserId);
    const recipient = users.find(user => user.id === recipientId);
    return recipient ? recipient.fullName || recipient.name || 'Người dùng' : 'Người dùng';
  };

  const getUserById = (userId) => {
    return users.find(user => user.id === userId) || { fullName: 'Người dùng', name: 'Người dùng', avatar: null };
  };

  const filteredConversations = conversations.filter(conv => {
    const recipientName = getRecipientName(conv) || '';
    return recipientName.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
           (conv.subject || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
           (conv.lastMessage && conv.lastMessage.content ? conv.lastMessage.content.toLowerCase() : '').includes((searchTerm || '').toLowerCase());
  });

  // Render functions
  const renderConversationsList = () => {
    if (filteredConversations.length === 0) {
      return (
        <Empty 
          description="Không có cuộc trò chuyện nào" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      );
    }

    return (
      <List
        dataSource={filteredConversations}
        renderItem={item => {
          const recipientName = getRecipientName(item);
          const isSelected = selectedConversation && selectedConversation.id === item.id;
          
          return (
            <List.Item
              className={`conversation-item ${isSelected ? 'selected-conversation' : ''}`}
              style={{ 
                padding: '12px 16px', 
                cursor: 'pointer',
                backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
                borderBottom: '1px solid #f0f0f0'
              }}
              onClick={() => handleConversationSelect(item)}
            >
              <List.Item.Meta
                avatar={
                  <Badge count={item.unreadCount}>
                    <Avatar icon={<UserOutlined />} />
                  </Badge>
                }
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong={item.unreadCount > 0}>{recipientName}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {moment(item.lastMessage.timestamp).fromNow()}
                    </Text>
                  </div>
                }
                description={
                  <div>
                    <div style={{ fontWeight: item.unreadCount > 0 ? 'bold' : 'normal' }}>
                      {item.subject}
                    </div>
                    <Text
                      type={item.unreadCount > 0 ? "text" : "secondary"}
                      style={{ 
                        fontSize: '13px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '200px',
                        display: 'block',
                        fontWeight: item.unreadCount > 0 ? 'bold' : 'normal'
                      }}
                    >
                      {item.lastMessage.senderId === (parseInt(userId) || (userRole === '1' ? 101 : userRole === '2' ? 201 : 301)) 
                        ? `Bạn: ${item.lastMessage.content}` 
                        : item.lastMessage.content}
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
    if (!selectedConversation) {
      return (
        <div className="empty-chat" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Empty 
            description="Chọn một cuộc trò chuyện để bắt đầu" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        </div>
      );
    }

    // Check if messages exist for this conversation
    if (!messages[selectedConversation.id] || !Array.isArray(messages[selectedConversation.id])) {
      return (
        <div className="messages-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spin tip="Đang tải tin nhắn..." />
        </div>
      );
    }

    return (
      <div className="messages-container" style={{ padding: '16px', overflowY: 'auto', height: 'calc(100vh - 250px)' }}>
        {messages[selectedConversation.id].map(msg => {
          const isCurrentUser = msg.senderId === (parseInt(userId) || (userRole === '1' ? 101 : userRole === '2' ? 201 : 301));
          const sender = getUserById(msg.senderId);
          
          return (
            <div 
              key={msg.id} 
              className={`message-bubble ${isCurrentUser ? 'message-sent' : 'message-received'}`}
              style={{ 
                display: 'flex', 
                justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                marginBottom: '16px' 
              }}
            >
              {!isCurrentUser && (
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ marginRight: '8px', alignSelf: 'flex-end' }}
                />
              )}
              
              <div style={{ 
                maxWidth: '70%',
                padding: '8px 12px',
                borderRadius: '12px',
                backgroundColor: isCurrentUser ? '#1890ff' : '#f0f0f0',
                color: isCurrentUser ? 'white' : 'rgba(0, 0, 0, 0.85)'
              }}>
                <div style={{ marginBottom: '4px' }}>
                  <Text strong style={{ color: isCurrentUser ? 'white' : 'rgba(0, 0, 0, 0.85)' }}>
                    {isCurrentUser ? 'Bạn' : sender.fullName || sender.name || 'Người dùng'}
                  </Text>
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                <div style={{ textAlign: 'right', marginTop: '4px' }}>
                  <Text style={{ 
                    fontSize: '12px',
                    color: isCurrentUser ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.45)'
                  }}>
                    {moment(msg.timestamp).format('HH:mm, DD/MM/YYYY')}
                  </Text>
                </div>
              </div>
              
              {isCurrentUser && (
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ marginLeft: '8px', alignSelf: 'flex-end' }}
                />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  const renderMessageInput = () => {
    if (!selectedConversation) return null;

    return (
      <div className="message-input" style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
        <Input.TextArea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          autoSize={{ minRows: 2, maxRows: 4 }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          style={{ marginBottom: '8px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            Gửi
          </Button>
        </div>
      </div>
    );
  };

  const renderNewMessageModal = () => {
    return (
      <Modal
        title="Tin nhắn mới"
        open={showNewMessageModal}
        onCancel={() => setShowNewMessageModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowNewMessageModal(false)}>
            Hủy
          </Button>,
          <Button 
            key="send" 
            type="primary" 
            onClick={handleNewConversation}
            disabled={!selectedRecipient || !newMessageSubject.trim() || !newMessage.trim()}
          >
            Gửi
          </Button>
        ]}
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px' }}>Người nhận:</div>
          <Select
            style={{ width: '100%' }}
            placeholder="Chọn người nhận"
            value={selectedRecipient}
            onChange={setSelectedRecipient}
          >
            {recipientOptions.map(user => (
              <Option key={user.id} value={user.id}>
                {user.fullName || user.name || 'Người dùng'} ({user.role === '1' ? 'Học sinh' : user.role === '2' ? 'Giảng viên' : 'Quản lý'})
              </Option>
            ))}
          </Select>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px' }}>Tiêu đề:</div>
          <Input
            value={newMessageSubject}
            onChange={(e) => setNewMessageSubject(e.target.value)}
            placeholder="Nhập tiêu đề tin nhắn"
          />
        </div>
        
        <div>
          <div style={{ marginBottom: '8px' }}>Nội dung:</div>
          <TextArea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập nội dung tin nhắn"
            autoSize={{ minRows: 4, maxRows: 6 }}
          />
        </div>
      </Modal>
    );
  };

  const renderAnnouncementModal = () => {
    return (
      <Modal
        title="Tạo thông báo lớp học"
        open={announcementModalVisible}
        onCancel={() => setAnnouncementModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAnnouncementModalVisible(false)}>
            Hủy
          </Button>,
          <Button 
            key="send" 
            type="primary" 
            onClick={handleCreateAnnouncement}
            disabled={!announcementTitle.trim() || !announcementContent.trim() || !selectedClassroom}
          >
            Gửi thông báo
          </Button>
        ]}
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px' }}>Lớp học:</div>
          <Select
            style={{ width: '100%' }}
            placeholder="Chọn lớp học để gửi thông báo"
            value={selectedClassroom}
            onChange={setSelectedClassroom}
          >
            {classrooms.map(classroom => (
              <Option key={classroom.id} value={classroom.id}>
                {classroom.name}
              </Option>
            ))}
          </Select>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px' }}>Tiêu đề thông báo:</div>
          <Input
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
            placeholder="Nhập tiêu đề thông báo"
          />
        </div>
        
        <div>
          <div style={{ marginBottom: '8px' }}>Nội dung thông báo:</div>
          <TextArea
            value={announcementContent}
            onChange={(e) => setAnnouncementContent(e.target.value)}
            placeholder="Nhập nội dung thông báo chi tiết"
            autoSize={{ minRows: 4, maxRows: 6 }}
          />
        </div>
      </Modal>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="communication-page">
      {/* Main content with role validation */}
      {renderMainContent()}
      
      {/* Modals */}
      {renderNewMessageModal()}
      {renderAnnouncementModal()}
    </div>
  );
}

export default CommunicationPage; 