import { MessageOutlined, SendOutlined, StarOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Input, List, message, Rate, Select, Space, Spin, Typography } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * MessagingPage component for student-teacher communication
 * @returns {JSX.Element} MessagingPage component
 */
function MessagingPage() {
  const [messages, setMessages] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');

  // Form states
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);

  // Get user info from localStorage
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    if (userId && token) {
      fetchMessages();
      fetchTeachers();
      fetchCourses();
    }
  }, [userId, token]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/student-messages/student/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('/api/users/teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      let response;
      if (userRole === '1') { // Student
        response = await axios.get(`/api/classrooms/student/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        response = await axios.get(`/api/classrooms/teacher/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedTeacher || !messageText.trim()) {
      message.error('Vui lòng chọn giáo viên và nhập nội dung tin nhắn');
      return;
    }

    setSending(true);
    try {
      const messageData = {
        senderId: parseInt(userId),
        receiverId: selectedTeacher,
        message: messageText,
        subject: 'Câu hỏi từ học sinh',
        priority: 'MEDIUM'
      };

      await axios.post('/api/student-messages', messageData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      message.success('Gửi tin nhắn thành công!');
      setMessageText('');
      setSelectedTeacher(null);
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
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
        studentId: parseInt(userId),
        classroomId: selectedCourse,
        overallRating: rating,
        contentQuality: rating,
        teachingEffectiveness: rating,
        courseDifficulty: rating,
        wouldRecommend: rating >= 4,
        comments: feedbackText,
        suggestions: feedbackText
      };

      await axios.post('/api/course-feedback', feedbackData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

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

  const renderMessages = () => (
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
                  {new Date(msg.sentAt).toLocaleString('vi-VN')}
                </Text>
              </Space>
            }
            description={
              <div>
                <Text>{msg.message}</Text>
                {msg.response && (
                  <div style={{ 
                    marginTop: 8, 
                    padding: 8, 
                    background: '#f0f2f5', 
                    borderRadius: 4 
                  }}>
                    <Text strong>Phản hồi từ giáo viên:</Text>
                    <br />
                    <Text>{msg.response}</Text>
                  </div>
                )}
              </div>
            }
          />
        </List.Item>
      )}
      locale={{ emptyText: 'Chưa có tin nhắn nào' }}
    />
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải...</div>
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
