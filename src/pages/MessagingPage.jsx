import { SendOutlined, StarOutlined, SyncOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Empty, Input, Layout, List, message, Rate, Select, Space, Spin, Tabs, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

const { Title, Text } = Typography;
const { Sider, Content } = Layout;
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

  // UI mới: sidebar + khung chat
  const [selectedTeacherObj, setSelectedTeacherObj] = useState(null);

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
  
  // Debug user context
  console.log('🔧 MessagingPage user context:', { user, userId, userRole });

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
    console.log('📋 Current user info:', { userId, userRole, token: !!localStorage.getItem('token') });
    setLoading(true);

    try {
      // Debug: Kiểm tra tài khoản người dùng
      try {
        const userResponse = await apiClient.get(`/users/${userId}`);
        console.log(`👤 Thông tin người dùng hiện tại:`, userResponse.data);
      } catch (userError) {
        console.error('❌ Không thể lấy thông tin người dùng:', userError);
        if (userError.response?.status === 401) {
          console.error('🔒 Authentication failed - redirecting to login');
          localStorage.clear();
          window.location.href = '/login';
          return;
        }
      }

      // Load all data in parallel for better performance, but handle individual failures
      const results = await Promise.allSettled([
        fetchMessages(),
        fetchSentMessages(),
        fetchTeachers(),
        fetchCourses()
      ]);

      // Log results for debugging
      results.forEach((result, index) => {
        const operation = ['fetchMessages', 'fetchSentMessages', 'fetchTeachers', 'fetchCourses'][index];
        if (result.status === 'rejected') {
          console.error(`❌ ${operation} failed:`, result.reason);
        } else {
          console.log(`✅ ${operation} completed`);
        }
      });
      
      console.log('✅ MessagingPage: Data loading completed');
      
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

  // Chuẩn hóa dữ liệu giáo viên từ nhiều nguồn khác nhau
  const normalizeTeacher = (raw) => {
    if (!raw) return null;
    const id = raw.id || raw.teacherId || raw.userId || raw.instructorId || raw.teacher?.id;
    if (!id) return null;
    const fullName = raw.fullName || raw.username || raw.name || raw.teacherName || raw.teacher?.fullName || `Giáo viên #${id}`;
    const username = raw.username || raw.email || raw.teacher?.email || undefined;
    return { id: Number(id), fullName, username };
  };

  const uniqueById = (list) => {
    const map = new Map();
    list.forEach((t) => { if (t && t.id != null && !map.has(t.id)) map.set(t.id, t); });
    return Array.from(map.values());
  };

  const fetchTeachers = async () => {
    try {
      console.log('👨‍🏫 Fetching teachers...');

      // Ưu tiên lấy từ lớp học của học sinh để đúng phạm vi giao tiếp
      if (userRole === 'STUDENT' || userRole === 'ROLE_STUDENT' || userRole === '1') {
        try {
          const clsRes = await apiClient.get('/classrooms/student/me');
          const cls = clsRes.data?.data || clsRes.data || [];
          const fromClasses = (Array.isArray(cls) ? cls : []).map((c) => (
            normalizeTeacher({
              id: c.teacherId || c.instructorId || c.teacher?.id,
              fullName: c.teacherName || c.teacher?.fullName,
              username: c.teacher?.username,
            })
          )).filter(Boolean);
          if (fromClasses.length) {
            if (isMountedRef.current) setTeachers(uniqueById(fromClasses));
            return;
          }
        } catch (e) {
          console.warn('⚠️ Cannot derive teachers from classrooms, fallback to /users/teachers');
        }
      }

      // Fallback: lấy toàn bộ giáo viên (BE có thể trả nhiều format)
      const response = await apiClient.get('/users/teachers');
      const raw = response?.data;
      let list = [];
      if (Array.isArray(raw)) list = raw;
      else if (Array.isArray(raw?.data)) list = raw.data;
      else if (Array.isArray(raw?.content)) list = raw.content;
      else if (raw && typeof raw === 'object') list = Object.values(raw).find(Array.isArray) || [];

      const normalized = list.map(normalizeTeacher).filter(Boolean);
      if (isMountedRef.current) {
        setTeachers(uniqueById(normalized));
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('❌ Error fetching teachers:', error);
        if (error.code !== 'ERR_CANCELED') {
          message.error('Không thể tải danh sách giáo viên');
        }
        setTeachers([]);
      }
    }
  };

  const fetchCourses = async () => {
    try {
      console.log(`📚 Fetching courses for role: ${userRole}, userId: ${userId}...`);
      console.log(`🔍 Role check: userRole === 'STUDENT': ${userRole === 'STUDENT'}, userRole === '1': ${userRole === '1'}`);
      console.log(`🔍 Role type: ${typeof userRole}, Role value: "${userRole}"`);
      let response;
      
      // Check for student role - handle both string numbers and role names
      console.log('🚨 ENTERING ROLE CHECK - userRole:', userRole, 'type:', typeof userRole);
      if (userRole === 'STUDENT' || userRole === 'ROLE_STUDENT' || userRole === '1') {
        console.log('🎓 STUDENT ROLE DETECTED - using student endpoints');
        // Use direct API call since ClassroomService has URL issues
        try {
          console.log('✅ Using direct API call to /classrooms/student/me');
          response = await apiClient.get('/classrooms/student/me');
          console.log('📊 Direct API response:', response);
        } catch (error) {
          console.warn('⚠️ direct API call failed:', error);
          console.warn('⚠️ Error response:', error.response?.data);
          console.warn('⚠️ Trying fallback student/{userId}');
          // Fallback to specific student ID endpoint
          response = await apiClient.get(`/classrooms/student/${userId}`);
          console.log('📊 Full response from /student/{userId}:', response);
        }
      } else if (userRole === 'TEACHER' || userRole === 'ROLE_TEACHER' || userRole === '2') {
        console.log('👨‍🏫 TEACHER ROLE DETECTED - using teacher endpoints');
        response = await apiClient.get('/classrooms/current-teacher');
      } else {
        console.log('❓ UNKNOWN ROLE DETECTED - using fallback endpoints');
        // For other roles (admin, manager), try both endpoints
        try {
          response = await apiClient.get('/classrooms/current-teacher');
        } catch (error) {
          response = await apiClient.get('/classrooms');
        }
      }
      
      if (isMountedRef.current) {
        console.log(`✅ Courses fetched:`, response.data);
        // Handle nested response structure
        const coursesData = response.data?.data || response.data || [];
        console.log(`📊 Final coursesData:`, coursesData);
        console.log(`📊 coursesData.length:`, coursesData.length);
        setCourses(coursesData);
        console.log(`📊 After setCourses, courses state should be updated`);
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
        // Set empty array to prevent infinite loading
        setCourses([]);
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
    return teacher ? (teacher.username || teacher.fullName || `Giáo viên #${teacherId}`) : `Giáo viên #${teacherId}`;
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
          {(Array.isArray(teachers) ? teachers : []).map(teacher => (
            <Option key={teacher.id} value={teacher.id}>
              {teacher.fullName || teacher.username || `Giáo viên #${teacher.id}`}
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

  // ===== UI MỚI: 1 giao diện chung với Sidebar hội thoại =====
  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  const getTeacherLabel = (t) => t?.fullName || t?.username || `Giáo viên #${t?.id}`;

  const conversationList = () => {
    // Tạo danh sách hội thoại từ teachers; nếu trống, lấy từ messages đã nhận/gửi
    const teacherMap = new Map();
    (Array.isArray(teachers) ? teachers : []).forEach((t) => {
      if (t && t.id != null) teacherMap.set(Number(t.id), t);
    });

    const all = [...(messages || []), ...(sentMessages || [])];
    all.forEach((m) => {
      const tid = m.senderId === userId ? m.recipientId : m.senderId;
      if (tid != null && !teacherMap.has(Number(tid))) {
        teacherMap.set(Number(tid), { id: Number(tid), fullName: m.senderName || m.recipientName });
      }
    });

    const items = Array.from(teacherMap.values()).map((t) => {
      const conv = all
        .filter((m) => m.senderId === t.id || m.recipientId === t.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const last = conv[0];
      return {
        id: t.id,
        teacher: t,
        lastMessage: last?.content || '',
        lastTime: last?.createdAt || null,
      };
    });

    return items;
  };

  const getConversationMessages = () => {
    if (!selectedTeacherObj) return [];
    const all = [...(messages || []), ...(sentMessages || [])];
    return all
      .filter((m) => m.senderId === selectedTeacherObj.id || m.recipientId === selectedTeacherObj.id)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  const renderFeedback = () => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Text strong>Chọn khóa học:</Text>
        <Select
          style={{ width: '100%', marginTop: 8 }}
          placeholder={courses.length === 0 ? "Đang tải khóa học..." : "Chọn khóa học để đánh giá"}
          value={selectedCourse}
          onChange={setSelectedCourse}
          loading={loading}
          notFoundContent={courses.length === 0 ? "Không có khóa học nào" : "Không tìm thấy"}
        >
          {courses.map(course => (
            <Option key={course.id} value={course.id}>
              {course.name || course.className || `Khóa học #${course.id}`}
            </Option>
          ))}
        </Select>
        {courses.length === 0 && !loading && (
          <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: '12px' }}>
            Không tìm thấy khóa học nào. <Button type="link" size="small" onClick={() => fetchCourses()}>Thử lại</Button>
          </div>
        )}
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

  // Không chặn toàn trang khi loading; sẽ hiển thị spinner cục bộ trong layout bên dưới

  return (
    <Layout style={{ height: 'calc(100vh - 64px)' }}>
      {/* Sidebar danh bạ */}
      <Sider width={340} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: 16 }}>
          <Title level={4} style={{ margin: 0 }}>Tin nhắn</Title>
          <Text type="secondary">Chọn giáo viên để trò chuyện</Text>
        </div>
        <List
          dataSource={conversationList()}
          renderItem={(item) => (
            <List.Item
              onClick={() => { setSelectedTeacherObj(item.teacher); setActiveTab('messages'); }}
              style={{ cursor: 'pointer', background: selectedTeacherObj?.id === item.id ? '#f0faff' : 'transparent' }}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={getTeacherLabel(item.teacher)}
                description={item.lastMessage ? `${item.lastMessage.slice(0, 40)}${item.lastMessage.length>40?'…':''}` : '—'}
              />
              <div style={{ fontSize: 12, color: '#999' }}>{item.lastTime ? formatDate(item.lastTime) : ''}</div>
            </List.Item>
          )}
          locale={{ emptyText: <Empty description="Không có đối tượng để nhắn" /> }}
        />
      </Sider>

      {/* Khung nội dung */}
      <Content style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
          <Space>
            <Avatar icon={<UserOutlined />} />
            <div>
              <Title level={5} style={{ margin: 0 }}>{selectedTeacherObj ? getTeacherLabel(selectedTeacherObj) : 'Chưa chọn đối tượng'}</Title>
              <Text type="secondary">Giao tiếp và phản hồi</Text>
            </div>
          </Space>
        </div>

        <div style={{ padding: 16 }}>
          <Card style={{ marginBottom: 12 }}>
            {activeTab === 'messages' ? (
              // hiển thị hội thoại của giáo viên đã chọn hoặc fallback danh sách hộp thư/đã gửi
              selectedTeacherObj ? (
                <List
                  dataSource={getConversationMessages()}
                  renderItem={(m) => (
                    <List.Item style={{ justifyContent: m.senderId === userId ? 'flex-end' : 'flex-start' }}>
                      <Card style={{ maxWidth: '70%', background: m.senderId === userId ? '#e6f7ff' : '#fff' }}>
                        <div style={{ marginBottom: 6 }}><Text strong>{m.subject || 'Tin nhắn'}</Text></div>
                        <div>{m.content}</div>
                        <div style={{ marginTop: 6, fontSize: 12, color: '#999' }}>{formatDate(m.createdAt)}</div>
                      </Card>
                    </List.Item>
                  )}
                />
              ) : (
                renderMessages()
              )
            ) : activeTab === 'send' ? renderSendMessage() : renderFeedback()}
          </Card>

          {activeTab !== 'feedback' && (
            <Card>
              <Space.Compact style={{ width: '100%' }}>
                <Input.TextArea
                  placeholder="Nhập tin nhắn..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <Button type="primary" icon={<SendOutlined />} onClick={() => {
                  if (selectedTeacherObj) { setSelectedTeacher(selectedTeacherObj.id); sendMessage(); }
                  else if (selectedTeacher) { sendMessage(); }
                  else { message.error('Chọn người nhận trước khi gửi'); }
                }} />
              </Space.Compact>
            </Card>
          )}
        </div>
      </Content>
    </Layout>
  );
}

export default MessagingPage;
