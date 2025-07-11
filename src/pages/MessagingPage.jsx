import { MessageOutlined, SendOutlined, StarOutlined, SyncOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Empty, Input, List, message, Rate, Select, Space, Spin, Tabs, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * MessagingPage component for student-teacher communication
 * @returns {JSX.Element} MessagingPage component
 */
function MessagingPage() {
  const [messages, setMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');
  const [messagesTabKey, setMessagesTabKey] = useState('received');
  const [retryCount, setRetryCount] = useState(0);

  // Form states
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);

  // Thêm trạng thái loading cho từng danh sách tin nhắn
  const [refreshingInbox, setRefreshingInbox] = useState(false);
  const [refreshingSent, setRefreshingSent] = useState(false);

  // Hàm để làm mới hộp thư đến
  const refreshInbox = async () => {
    setRefreshingInbox(true);
    try {
      await fetchMessages();
      message.success('Đã cập nhật hộp thư đến');
    } catch (error) {
      message.error('Không thể cập nhật hộp thư đến');
    } finally {
      setRefreshingInbox(false);
    }
  };

  // Hàm để làm mới tin nhắn đã gửi
  const refreshSent = async () => {
    setRefreshingSent(true);
    try {
      await fetchSentMessages();
      message.success('Đã cập nhật tin nhắn đã gửi');
    } catch (error) {
      message.error('Không thể cập nhật tin nhắn đã gửi');
    } finally {
      setRefreshingSent(false);
    }
  };

  // Get user info from context
  const { user } = useAuth();
  const userId = user?.id;
  const userRole = user?.role;

  // Add ref to track if component is mounted
  const isMountedRef = { current: true };

  useEffect(() => {
    if (userId) {
      loadAllData();

      // Safety timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current && loading) {
          console.warn('⚠️ Loading timeout reached, forcing loading to false');
          setLoading(false);
          message.warning('Tải dữ liệu mất nhiều thời gian hơn dự kiến. Vui lòng làm mới trang nếu dữ liệu không hiển thị.');
          
          // Hiển thị nút làm mới
          message.info({
            content: 'Bấm F5 hoặc làm mới trang để tải lại dữ liệu',
            duration: 5
          });
        }
      }, 5000); // Giảm xuống 5 giây

      return () => {
        clearTimeout(timeoutId);
        isMountedRef.current = false;
      };
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [userId, retryCount]);

  // Hàm thử lại nếu tải dữ liệu thất bại
  const retryLoading = () => {
    if (retryCount < 3) {
      message.info('Đang thử tải lại dữ liệu...');
      setRetryCount(prev => prev + 1);
    } else {
      message.error('Đã thử tải lại nhiều lần nhưng không thành công. Vui lòng làm mới trang.');
    }
  };

  const loadAllData = async () => {
    if (!isMountedRef.current) return;

    console.log('🔄 MessagingPage: Starting to load data...');
    setLoading(true);

    try {
      // Debug: Kiểm tra tài khoản người dùng
      try {
        const userResponse = await apiClient.get(`/users/${userId}`);
        console.log(`👤 Thông tin người dùng hiện tại:`, userResponse.data);
      } catch (userError) {
        console.error('❌ Không thể lấy thông tin người dùng:', userError);
      }

      // Load all data sequentially to ensure data is set before turning off loading
      await fetchMessages();
      await fetchSentMessages(); // Thêm lấy tin nhắn đã gửi
      await fetchTeachers();
      await fetchCourses();
      
      console.log('✅ MessagingPage: Data loading completed');
      
      // Kiểm tra xem dữ liệu đã được tải thành công hay chưa
      const dataCheck = {
        messages: Array.isArray(messages),
        sentMessages: Array.isArray(sentMessages),
        teachers: Array.isArray(teachers),
        courses: Array.isArray(courses)
      };
      
      console.log('📊 Data check:', dataCheck);
      
      // Nếu có bất kỳ dữ liệu nào không đúng dạng mảng, thử tải lại
      if (!dataCheck.messages || !dataCheck.sentMessages || !dataCheck.teachers || !dataCheck.courses) {
        console.warn('⚠️ Dữ liệu chưa được tải đầy đủ, đang tải lại...');
        if (retryCount < 3) {
          setTimeout(() => retryLoading(), 1000);
        }
      }
    } catch (error) {
      console.error('💥 Error loading data:', error);
      if (isMountedRef.current) {
        message.error('Có lỗi xảy ra khi tải dữ liệu');
        // Tự động thử lại nếu có lỗi
        if (retryCount < 2) {
          setTimeout(() => retryLoading(), 2000);
        }
      }
    } finally {
      if (isMountedRef.current) {
        console.log('✅ MessagingPage: Setting loading to false');
        setLoading(false);
      }
    }
  };

  const fetchMessages = async () => {
    try {
      console.log(`📨 Fetching messages for user ${userId}...`);
      const response = await apiClient.get(`/student-messages/student/${userId}`);
      if (isMountedRef.current) {
        console.log(`✅ Messages fetched:`, response.data);
        setMessages(response.data || []);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('❌ Error fetching messages:', error);
        console.error('   Status:', error.response?.status);
        console.error('   Data:', error.response?.data);
        // Only show error if it's not a cancellation error
        if (error.code !== 'ERR_CANCELED') {
          message.error('Không thể tải tin nhắn');
        }
      }
    }
  };

  // Thêm hàm fetch tin nhắn đã gửi
  const fetchSentMessages = async () => {
    try {
      console.log(`📤 Fetching sent messages for user ${userId}...`);
      
      // Phương án 1: Sử dụng endpoint có sẵn từ controller mới đã thêm vào
      try {
        const response = await apiClient.get(`/student-messages/by-sender/${userId}`);
        if (isMountedRef.current) {
          console.log(`✅ Sent messages fetched:`, response.data);
          setSentMessages(response.data || []);
          
          // Lưu vào cache để sử dụng khi offline
          try {
            localStorage.setItem(`sentMessages_${userId}`, JSON.stringify(response.data || []));
          } catch (cacheError) {
            console.warn('⚠️ Error caching messages:', cacheError);
          }
          
          return; // Nếu thành công thì không cần thực hiện các phương án sau
        }
      } catch (endpointError) {
        console.warn('⚠️ Cannot fetch sent messages:', endpointError.message);
      }
      
      // Phương án 2: Kiểm tra từ cache
      try {
        const cachedSentMessages = localStorage.getItem(`sentMessages_${userId}`);
        if (cachedSentMessages) {
          const parsedMessages = JSON.parse(cachedSentMessages);
          setSentMessages(parsedMessages);
          console.log('✅ Retrieved sent messages from cache:', parsedMessages.length);
          return;
        }
      } catch (cacheError) {
        console.warn('⚠️ Error retrieving from cache:', cacheError.message);
      }
      
      // Nếu tất cả đều thất bại, hiển thị mảng rỗng
      setSentMessages([]);
      
    } catch (error) {
      console.error('❌ Error in fetchSentMessages:', error);
      // Không hiển thị lỗi cho người dùng vì đây là tính năng phụ
      setSentMessages([]);
    }
  };

  const fetchTeachers = async () => {
    try {
      console.log('👨‍🏫 Fetching teachers...');
      const response = await apiClient.get('/users/teachers');
      if (isMountedRef.current) {
        console.log(`✅ Teachers fetched:`, response.data);
        setTeachers(response.data || []);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('❌ Error fetching teachers:', error);
        console.error('   Status:', error.response?.status);
        console.error('   Data:', error.response?.data);
        // Only show error if it's not a cancellation error
        if (error.code !== 'ERR_CANCELED') {
          message.error('Không thể tải danh sách giáo viên');
        }
      }
    }
  };

  const fetchCourses = async () => {
    try {
      console.log(`📚 Fetching courses for role: ${userRole}...`);
      let response;
      if (userRole === 'STUDENT') {
        response = await apiClient.get(`/classrooms/student/${userId}`);
      } else {
        response = await apiClient.get(`/classrooms/current-teacher`);
      }
      if (isMountedRef.current) {
        console.log(`✅ Courses fetched:`, response.data);
        setCourses(response.data || []);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('❌ Error fetching courses:', error);
        console.error('   Status:', error.response?.status);
        console.error('   Data:', error.response?.data);
        // Only show error if it's not a cancellation error
        if (error.code !== 'ERR_CANCELED') {
          message.error('Không thể tải danh sách khóa học');
        }
      }
    }
  };

  const sendMessage = async () => {
    if (!selectedTeacher || !messageText.trim()) {
      message.error('Vui lòng chọn giáo viên và nhập nội dung tin nhắn');
      return;
    }

    setSending(true);
    try {
      // Đảm bảo đủ các trường bắt buộc theo DTO backend
      const messageData = {
        senderId: userId,
        recipientId: selectedTeacher,  // Thay đổi từ receiverId thành recipientId
        content: messageText,          // Thay đổi từ message thành content
        subject: 'Câu hỏi từ học sinh', // Trường bắt buộc không được để trống
        priority: 'MEDIUM',
        messageType: 'GENERAL',
        status: 'SENT'
      };

      console.log('Gửi dữ liệu tin nhắn:', messageData);
      const response = await apiClient.post('/student-messages', messageData);
      console.log('Kết quả gửi tin nhắn:', response.data);

      // Lưu tin nhắn đã gửi vào cache để hiển thị ngay cả khi không có endpoint
      try {
        // Tạo một tin nhắn đã gửi từ response hoặc từ dữ liệu đã gửi
        const sentMessage = response.data || {
          ...messageData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Lưu vào state và cache
        const updatedSentMessages = [sentMessage, ...sentMessages];
        setSentMessages(updatedSentMessages);
        localStorage.setItem(`sentMessages_${userId}`, JSON.stringify(updatedSentMessages));
        console.log('✅ Added message to sent messages cache');
      } catch (cacheError) {
        console.warn('⚠️ Error caching sent message:', cacheError);
      }

      message.success('Gửi tin nhắn thành công!');
      setMessageText('');
      setSelectedTeacher(null);
      
      // Cập nhật cả hai danh sách tin nhắn
      await fetchMessages();
      await fetchSentMessages();
      
      // Chuyển sang tab đã gửi để người dùng xem tin nhắn vừa gửi
      setMessagesTabKey('sent');
      
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response && error.response.data) {
        console.error('Response data:', error.response.data);
      }
      message.error('Có lỗi xảy ra khi gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const sendFeedback = async () => {
    if (!selectedCourse || !feedbackText.trim()) {
      message.error('Vui lòng chọn khóa học và nhập nội dung phản hồi');
      return;
    }

    setSending(true);
    try {
      const feedbackData = {
        studentId: userId,
        classroomId: selectedCourse,
        overallRating: rating,
        contentQuality: rating,
        teachingEffectiveness: rating,
        courseDifficulty: rating,
        wouldRecommend: rating >= 4,
        comments: feedbackText,
        suggestions: feedbackText
      };

      await apiClient.post('/course-feedback', feedbackData);

      message.success('Gửi phản hồi thành công!');
      setFeedbackText('');
      setSelectedCourse(null);
      setRating(5);
    } catch (error) {
      console.error('Error sending feedback:', error);
      message.error('Có lỗi xảy ra khi gửi phản hồi');
    } finally {
      setSending(false);
    }
  };

  // Helper function để lấy tên giáo viên từ id
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.fullName || teacher.username : `Giáo viên #${teacherId}`;
  };

  const renderMessages = () => (
    <Tabs defaultActiveKey="received" activeKey={messagesTabKey} onChange={key => setMessagesTabKey(key)}>
      <Tabs.TabPane 
        tab={
          <span>
            Hộp thư đến ({messages.length})
            {refreshingInbox && <Spin size="small" style={{ marginLeft: 8 }} />}
          </span>
        } 
        key="received"
        extra={
          <Button 
            size="small" 
            type="text" 
            icon={<SyncOutlined />} 
            loading={refreshingInbox}
            onClick={(e) => { e.stopPropagation(); refreshInbox(); }}
          >
            Làm mới
          </Button>
        }
      >
        <List
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <Space>
                    <Text strong>{msg.subject || 'Tin nhắn'}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {new Date(msg.createdAt).toLocaleString('vi-VN')}
                    </Text>
                  </Space>
                }
                description={
                  <div>
                    <Text>Từ: {msg.senderName || getTeacherName(msg.senderId) || `Người dùng #${msg.senderId}`}</Text>
                    <br />
                    <Text>{msg.content}</Text>
                    {msg.reply && (
                      <div style={{ 
                        marginTop: 8, 
                        padding: 8, 
                        background: '#f0f2f5', 
                        borderRadius: 4 
                      }}>
                        <Text strong>Phản hồi từ giáo viên:</Text>
                        <br />
                        <Text>{msg.reply}</Text>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ 
            emptyText: (
              <div style={{ padding: '20px 0' }}>
                <Empty description="Chưa có tin nhắn nào" />
                <Button type="primary" style={{ marginTop: 16 }} onClick={refreshInbox}>
                  Làm mới
                </Button>
              </div>
            ) 
          }}
        />
      </Tabs.TabPane>
      <Tabs.TabPane 
        tab={
          <span>
            Đã gửi ({sentMessages.length})
            {refreshingSent && <Spin size="small" style={{ marginLeft: 8 }} />}
          </span>
        } 
        key="sent"
        extra={
          <Button 
            size="small" 
            type="text" 
            icon={<SyncOutlined />} 
            loading={refreshingSent}
            onClick={(e) => { e.stopPropagation(); refreshSent(); }}
          >
            Làm mới
          </Button>
        }
      >
        <List
          dataSource={sentMessages}
          renderItem={(msg) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<SendOutlined />} />}
                title={
                  <Space>
                    <Text strong>{msg.subject || 'Tin nhắn'}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {new Date(msg.createdAt).toLocaleString('vi-VN')}
                    </Text>
                  </Space>
                }
                description={
                  <div>
                    <Text>Tới: {msg.recipientName || getTeacherName(msg.recipientId) || `Người dùng #${msg.recipientId}`}</Text>
                    <br />
                    <Text>{msg.content}</Text>
                    <div style={{ 
                      marginTop: 4, 
                      fontSize: '12px',
                      color: '#8c8c8c'
                    }}>
                      {msg.status === 'DELIVERED' ? 'Đã nhận' : 
                       msg.status === 'READ' ? 'Đã xem' : 'Đã gửi'}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ 
            emptyText: (
              <div style={{ padding: '20px 0' }}>
                <Empty description="Chưa gửi tin nhắn nào" />
                <Button type="primary" style={{ marginTop: 16 }} onClick={refreshSent}>
                  Làm mới
                </Button>
              </div>
            ) 
          }}
        />
      </Tabs.TabPane>
    </Tabs>
  );

  const renderSendMessage = () => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Text strong>Chọn giáo viên:</Text>
        <Select
          style={{ width: '100%', marginTop: 8 }}
          placeholder="Chọn giáo viên để gửi tin nhắn"
          value={selectedTeacher}
          onChange={setSelectedTeacher}
        >
          {teachers.map(teacher => (
            <Option key={teacher.id} value={teacher.id}>
              {teacher.fullName || teacher.username}
            </Option>
          ))}
        </Select>
      </div>

      <div>
        <Text strong>Nội dung tin nhắn:</Text>
        <TextArea
          style={{ marginTop: 8 }}
          rows={6}
          placeholder="Nhập câu hỏi hoặc nội dung cần trao đổi với giáo viên..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          maxLength={500}
          showCount
        />
      </div>

      <Button
        type="primary"
        icon={<SendOutlined />}
        loading={sending}
        onClick={sendMessage}
        style={{ alignSelf: 'flex-end' }}
      >
        Gửi tin nhắn
      </Button>
    </Space>
  );

  const renderFeedback = () => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Text strong>Chọn khóa học:</Text>
        <Select
          style={{ width: '100%', marginTop: 8 }}
          placeholder="Chọn khóa học để đánh giá"
          value={selectedCourse}
          onChange={setSelectedCourse}
        >
          {courses.map(course => (
            <Option key={course.id} value={course.id}>
              {course.name}
            </Option>
          ))}
        </Select>
      </div>

      <div>
        <Text strong>Đánh giá tổng thể:</Text>
        <div style={{ marginTop: 8 }}>
          <Rate value={rating} onChange={setRating} />
          <Text style={{ marginLeft: 8 }}>({rating} sao)</Text>
        </div>
      </div>

      <div>
        <Text strong>Nội dung phản hồi:</Text>
        <TextArea
          style={{ marginTop: 8 }}
          rows={6}
          placeholder="Chia sẻ ý kiến của bạn về khóa học: nội dung, phương pháp giảng dạy, đề xuất cải thiện..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          maxLength={1000}
          showCount
        />
      </div>

      <Button
        type="primary"
        icon={<StarOutlined />}
        loading={sending}
        onClick={sendFeedback}
        style={{ alignSelf: 'flex-end' }}
      >
        Gửi phản hồi
      </Button>
    </Space>
  );

  // Show error if no user ID
  if (!userId) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ marginBottom: 16 }}>❌ Không tìm thấy thông tin người dùng</div>
        <div>Vui lòng đăng nhập lại</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải...</div>
        <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
          User ID: {userId} | Role: {userRole}
        </div>
        <Button 
          style={{ marginTop: 16 }} 
          onClick={retryLoading}
          disabled={retryCount >= 3}
        >
          Thử lại ({retryCount}/3)
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2}>Giao tiếp và phản hồi</Title>
          <Text type="secondary">
            Gửi tin nhắn cho giáo viên và đánh giá khóa học
          </Text>
        </div>

        {/* Tab Navigation */}
        <Card>
          <Space size="large">
            <Button
              type={activeTab === 'messages' ? 'primary' : 'default'}
              icon={<MessageOutlined />}
              onClick={() => setActiveTab('messages')}
            >
              Tin nhắn ({messages.length})
            </Button>
            <Button
              type={activeTab === 'send' ? 'primary' : 'default'}
              icon={<SendOutlined />}
              onClick={() => setActiveTab('send')}
            >
              Gửi tin nhắn
            </Button>
            <Button
              type={activeTab === 'feedback' ? 'primary' : 'default'}
              icon={<StarOutlined />}
              onClick={() => setActiveTab('feedback')}
            >
              Đánh giá khóa học
            </Button>
          </Space>
        </Card>

        {/* Tab Content */}
        <Card>
          {activeTab === 'messages' && renderMessages()}
          {activeTab === 'send' && renderSendMessage()}
          {activeTab === 'feedback' && renderFeedback()}
        </Card>
      </Space>
    </div>
  );
}

export default MessagingPage;
