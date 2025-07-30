import { MessageOutlined, SendOutlined, StarOutlined, SyncOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Empty, Input, List, message, Rate, Select, Space, Spin, Tabs, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
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

  // Debug loading state changes
  const setLoadingWithLog = (value) => {
    console.log(`🔄 Loading state change: ${loading} → ${value}`);
    setLoading(value);
  };
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
  const isMountedRef = { current: true }; // Simple ref object

  useEffect(() => {
    let timeoutId;

    if (userId) {
      console.log(`🔄 useEffect triggered: userId=${userId}, retryCount=${retryCount}`);
      loadAllData();

      // Safety timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
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
      }, 10000); // Tăng lên 10 giây để đủ thời gian load
    }

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      isMountedRef.current = false;
    };
  }, [userId, retryCount]);

  // Hàm thử lại nếu tải dữ liệu thất bại
  const retryLoading = () => {
    if (retryCount < 3) {
      console.log(`🔄 Retry attempt ${retryCount + 1}/3`);
      message.info('Đang thử tải lại dữ liệu...');
      setRetryCount(prev => prev + 1);
    } else {
      console.log('❌ Max retries reached');
      message.error('Đã thử tải lại nhiều lần nhưng không thành công. Vui lòng làm mới trang.');
    }
  };

  // Emergency function to force stop loading
  const forceStopLoading = () => {
    console.log('🚨 Force stopping loading state');
    setLoadingWithLog(false);
    message.info('Đã dừng trạng thái tải. Trang có thể hoạt động với dữ liệu hiện có.');
  };

  const loadAllData = async () => {
    if (!isMountedRef.current) return;

    console.log('🔄 MessagingPage: Starting to load data...');
    console.log('🔄 Current loading state:', loading);
    setLoadingWithLog(true);

    try {
      // Debug: Kiểm tra tài khoản người dùng
      try {
        const userResponse = await apiClient.get(`/users/${userId}`);
        console.log(`👤 Thông tin người dùng hiện tại:`, userResponse.data);
      } catch (userError) {
        console.error('❌ Không thể lấy thông tin người dùng:', userError);
      }

      // Load all data sequentially with individual error handling
      const loadResults = {
        messages: false,
        sentMessages: false,
        teachers: false,
        courses: false
      };

      // Load messages (critical)
      try {
        console.log('📨 Loading messages...');
        await fetchMessages();
        loadResults.messages = true;
        console.log('✅ Messages loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load messages:', error);
        loadResults.messages = false;
      }

      // Load sent messages (non-critical)
      try {
        console.log('📤 Loading sent messages...');
        await fetchSentMessages();
        loadResults.sentMessages = true;
        console.log('✅ Sent messages loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load sent messages:', error);
        loadResults.sentMessages = false;
      }

      // Load teachers (critical for sending messages)
      try {
        console.log('👨‍🏫 Loading teachers...');
        await fetchTeachers();
        loadResults.teachers = true;
        console.log('✅ Teachers loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load teachers:', error);
        loadResults.teachers = false;
      }

      // Load courses (non-critical)
      try {
        console.log('📚 Loading courses...');
        await fetchCourses();
        loadResults.courses = true;
        console.log('✅ Courses loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load courses:', error);
        loadResults.courses = false;
      }

      console.log('📊 Loading results:', loadResults);

      // Check if critical data loaded successfully
      const criticalDataLoaded = loadResults.messages && loadResults.teachers;

      console.log('🔍 Critical data check:', { criticalDataLoaded, loadResults });

      // Emergency timeout to force stop loading
      setTimeout(() => {
        if (isMountedRef.current && loading) {
          console.warn('🚨 Emergency timeout: Force stopping loading state');
          setLoadingWithLog(false);
        }
      }, 1000);

      if (criticalDataLoaded) {
        console.log('✅ MessagingPage: Critical data loaded successfully');
        console.log('🔄 MessagingPage: Setting loading to false after successful load');
        setLoadingWithLog(false);
      } else {
        console.warn('⚠️ MessagingPage: Some critical data failed to load');
        if (!loadResults.messages) {
          message.warning('Không thể tải tin nhắn. Một số tính năng có thể không hoạt động.');
        }
        if (!loadResults.teachers) {
          message.warning('Không thể tải danh sách giáo viên. Không thể gửi tin nhắn mới.');
        }
        console.log('🔄 MessagingPage: Setting loading to false after partial load');
        setLoadingWithLog(false);
      }

    } catch (error) {
      console.error('💥 Unexpected error in loadAllData:', error);
      if (isMountedRef.current) {
        // Only show generic error if we haven't shown specific errors above
        message.error('Có lỗi không mong muốn xảy ra khi tải dữ liệu');

        // Auto-retry only for unexpected errors, not individual API failures
        if (retryCount < 1) { // Reduce retry attempts for unexpected errors
          console.log(`🔄 Auto-retrying due to unexpected error... (${retryCount + 1}/2)`);
          setTimeout(() => retryLoading(), 3000);
          return; // Don't set loading to false if we're retrying
        } else {
          console.log('❌ Max retries reached, giving up');
          message.error('Đã thử tải lại nhiều lần nhưng không thành công. Vui lòng làm mới trang.');
        }
      }
    } finally {
      if (isMountedRef.current) {
        console.log('✅ MessagingPage: Setting loading to false');
        setLoadingWithLog(false);
      }
    }
  };

  const fetchMessages = async () => {
    try {
      console.log(`📨 Fetching messages for user ${userId}...`);
      const response = await apiClient.get(`/student-messages/student/${userId}`);
      if (isMountedRef.current) {
        const messagesData = response.data || [];
        console.log(`✅ Messages fetched: ${messagesData.length} messages`);
        console.log('📊 Messages data:', messagesData);
        setMessages(messagesData);
        return messagesData; // Return data for verification
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('❌ Error fetching messages:', error);
        console.error('   Status:', error.response?.status);
        console.error('   Data:', error.response?.data);
        // Set empty array on error to prevent undefined state
        setMessages([]);
        // Only show error if it's not a cancellation error
        if (error.code !== 'ERR_CANCELED') {
          message.error('Không thể tải tin nhắn');
        }
        throw error; // Re-throw to let caller handle
      }
    }
  };

  // Thêm hàm fetch tin nhắn đã gửi
  const fetchSentMessages = async () => {
    try {
      console.log(`📤 Fetching sent messages for user ${userId}...`);

      const response = await apiClient.get(`/student-messages/by-sender/${userId}`);
      if (isMountedRef.current) {
        const sentMessagesData = response.data || [];
        console.log(`✅ Sent messages fetched: ${sentMessagesData.length} messages`);
        setSentMessages(sentMessagesData);

        // Cache for offline use
        try {
          localStorage.setItem(`sentMessages_${userId}`, JSON.stringify(sentMessagesData));
        } catch (cacheError) {
          console.warn('⚠️ Error caching sent messages:', cacheError);
        }

        return sentMessagesData;
      }
    } catch (error) {
      console.error('❌ Error fetching sent messages:', error);

      if (isMountedRef.current) {
        // Try to load from cache as fallback
        try {
          const cachedSentMessages = localStorage.getItem(`sentMessages_${userId}`);
          if (cachedSentMessages) {
            const parsedMessages = JSON.parse(cachedSentMessages);
            setSentMessages(parsedMessages);
            console.log('✅ Retrieved sent messages from cache:', parsedMessages.length);
            return parsedMessages;
          }
        } catch (cacheError) {
          console.warn('⚠️ Error retrieving from cache:', cacheError);
        }

        // Set empty array as final fallback
        setSentMessages([]);

        // Only show error if it's not a cancellation error
        if (error.code !== 'ERR_CANCELED') {
          console.warn('⚠️ Could not load sent messages, using empty array');
        }
      }
    }
  };

  const fetchTeachers = async () => {
    try {
      console.log('👨‍🏫 Fetching teachers...');
      const response = await apiClient.get('/users/teachers');
      if (isMountedRef.current) {
        const teachersData = response.data || [];
        console.log(`✅ Teachers fetched: ${teachersData.length} teachers`);
        setTeachers(teachersData);
        return teachersData;
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('❌ Error fetching teachers:', error);
        console.error('   Status:', error.response?.status);
        console.error('   Data:', error.response?.data);

        // Set empty array on error
        setTeachers([]);

        // Only show error if it's not a cancellation error
        if (error.code !== 'ERR_CANCELED') {
          message.error('Không thể tải danh sách giáo viên');
        }
        throw error;
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
        response = await apiClient.get(`/classroom-management/current-teacher`);
      }
      if (isMountedRef.current) {
        const coursesData = response.data || [];
        console.log(`✅ Courses fetched: ${coursesData.length} courses`);
        setCourses(coursesData);
        return coursesData;
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('❌ Error fetching courses:', error);
        console.error('   Status:', error.response?.status);
        console.error('   Data:', error.response?.data);

        // Set empty array on error
        setCourses([]);

        // Only show error if it's not a cancellation error
        if (error.code !== 'ERR_CANCELED') {
          message.error('Không thể tải danh sách khóa học');
        }
        throw error;
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

  // Debug loading state
  console.log('🔄 MessagingPage render:', { loading, retryCount, userId });

  if (loading) {
    console.log('🔄 MessagingPage: Rendering loading state', {
      loading,
      retryCount,
      userId,
      userRole,
      messagesLength: messages.length,
      sentMessagesLength: sentMessages.length,
      teachersLength: teachers.length,
      coursesLength: courses.length
    });

    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải...</div>
        <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
          User ID: {userId} | Role: {userRole}
        </div>
        <div style={{ marginTop: 4, fontSize: '11px', color: '#999' }}>
          Messages: {messages.length} | Sent: {sentMessages.length} | Teachers: {teachers.length} | Courses: {courses.length}
        </div>
        <div style={{ marginTop: 16 }}>
          <Button
            onClick={retryLoading}
            disabled={retryCount >= 3}
            style={{ marginRight: 8 }}
          >
            Thử lại ({retryCount}/3)
          </Button>
          <Button
            onClick={forceStopLoading}
            type="dashed"
            danger
          >
            Dừng tải
          </Button>
          <Button
            onClick={() => {
              console.log('🔍 Debug info:', { loading, retryCount, userId, userRole });
              console.log('🔍 Data counts:', {
                messages: messages.length,
                sentMessages: sentMessages.length,
                teachers: teachers.length,
                courses: courses.length
              });
            }}
            type="default"
            size="small"
          >
            Debug Info
          </Button>
        </div>
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
