import {
    PlusOutlined,
    SendOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    App,
    Avatar,
    Button,
    Card,
    Col,
    Form,
    Input,
    List,
    Modal,
    Row,
    Select,
    Spin,
    Typography
} from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Utility function to fix Vietnamese encoding issues
const fixEncoding = (text) => {
  if (!text) return '';
  
  // Vietnamese character mappings - expanded list
  const textReplacements = [
    // Classes and subjects
    { find: /L\?p/g, replace: 'Lớp' },
    { find: /H\?c/g, replace: 'Học' },
    { find: /Tr\?c/g, replace: 'Trực' },
    { find: /Vi\?t/g, replace: 'Việt' },

    // Common Vietnamese words
    { find: /h\?c/g, replace: 'học' },
    { find: /ti\?ng/g, replace: 'tiếng' },
    { find: /gi\?i/g, replace: 'giỏi' },
    { find: /hi\?n/g, replace: 'hiện' },
    { find: /d\?i/g, replace: 'đại' },
    { find: /\?i h\?c/g, replace: 'đại học' },
    { find: /t\?i/g, replace: 'tại' },
    { find: /\?y/g, replace: 'ấy' },
    { find: /\?u/g, replace: 'ều' },
    { find: /n\?i/g, replace: 'nội' },
    { find: /s\?/g, replace: 'số' },
    { find: /m\?n/g, replace: 'môn' },
    { find: /\?i\?m/g, replace: 'điểm' },
    { find: /\?i/g, replace: 'ời' },
    { find: /l\?i/g, replace: 'lời' },
    { find: /tr\?/g, replace: 'trả' },
    { find: /tr\? l\?i/g, replace: 'trả lời' },

    // Common ending syllables
    { find: /\?c/g, replace: 'ộc' },
    { find: /\?ng/g, replace: 'ống' },
    { find: /\?n/g, replace: 'ận' },
    { find: /\?o/g, replace: 'ạo' },
    { find: /\?a/g, replace: 'ưa' },
    { find: /\?m/g, replace: 'ấm' },
    { find: /\?t/g, replace: 'ất' },
    { find: /\?p/g, replace: 'ập' },
    { find: /\?u/g, replace: 'ều' },

    // Common diacritics combinations
    { find: /\?/g, replace: 'ế' } // Last resort - common case
  ];
  
  // Apply all the replacements
  let result = text;
  textReplacements.forEach(replacement => {
    result = result.replace(replacement.find, replacement.replace);
  });
  
  // If text still has ? but wasn't fixed by any of the above rules, log for debugging
  if (result.includes('?')) {
    console.log('Text still contains ? after replacements:', result);
  }
  
  return result;
};

// Helper function to normalize student data from different API structures
const normalizeStudentData = (student) => {
  // Ensure we have an object
  if (!student || typeof student !== 'object') {
    console.warn('Invalid student data received:', student);
    return null;
  }
  
  // Get ID from various possible fields
  const id = student.id || student.userId || student.studentId;
  if (!id) {
    console.warn('Student without ID:', student);
    return null;
  }
  
  // Get name from various possible fields
  const fullName = fixEncoding(
    student.fullName || 
    student.name || 
    student.username || 
    `Học sinh ${id}`
  );
  
  // Get other identifying information
  const username = student.username || 
                  student.email || 
                  student.userEmail || 
                  `student${id}`;
                  
  const studentCode = student.studentCode || 
                      student.code || 
                      student.enrollmentCode || 
                      `SV${id}`;
                      
  // Get classroom info if available
  const classroomId = student.classroomId || student.classId;
  const classroomName = student.classroomName ? 
                       fixEncoding(student.classroomName) :
                       student.className ? 
                       fixEncoding(student.className) :
                       classroomId ? `Lớp ${classroomId}` : null;
  
  // Return normalized object
  return {
    ...student, // Keep original data
    id: parseInt(id),
    fullName,
    username,
    studentCode,
    classroomId,
    classroomName
  };
};

// Helper to safely format date
const formatDate = (dateString) => {
  if (!dateString) return 'Không xác định';
  
  try {
    let date;
    
    // Handle different date formats from backend
    if (typeof dateString === 'string') {
      // Handle various string formats
      let isoString = dateString;
      
      // If it's already ISO format, use as is
      if (dateString.includes('T')) {
        isoString = dateString;
      } else if (dateString.includes(' ')) {
        // Replace space with 'T' for ISO format
        isoString = dateString.replace(' ', 'T');
      } else if (dateString.includes('-') && dateString.includes(':')) {
        // Format like "2024-01-01 10:30:00"
        isoString = dateString.replace(' ', 'T');
      }
      
      date = new Date(isoString);
    } else if (Array.isArray(dateString)) {
      // Handle array format [year, month, day, hour, minute, second, nano]
      if (dateString.length >= 3) {
        date = new Date(dateString[0], dateString[1] - 1, dateString[2], 
                       dateString[3] || 0, dateString[4] || 0, dateString[5] || 0);
      } else {
        date = new Date(dateString);
      }
    } else if (dateString && typeof dateString === 'object' && dateString.getTime) {
      // Already a Date object
      date = dateString;
    } else {
      date = new Date(dateString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString, 'type:', typeof dateString);
      return 'Ngày không hợp lệ';
    }
    
    return date.toLocaleString('vi-VN');
  } catch (error) {
    console.error('Error formatting date:', dateString, 'type:', typeof dateString, 'error:', error);
    return 'Ngày không hợp lệ';
  }
};

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const TeacherMessagesPage = () => {
  const { message } = App.useApp();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Get teacher ID from AuthContext
  const { user, loading: authLoading } = useAuth();
  const teacherId = user?.id;

  // Debug logging
  console.log('TeacherMessagesPage - Auth Debug:', {
    authLoading,
    user,
    teacherId,
    userFromLocalStorage: localStorage.getItem('userId')
  });

  const fetchStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);
      const studentsByRole = await api.GetUsersByRole(1); // Role ID 1 for students
      if (studentsByRole && Array.isArray(studentsByRole)) {
        const normalizedStudents = studentsByRole.map(student => ({
          id: student.id,
          fullName: student.fullName || student.name || student.username || `Học sinh ${student.id}`,
        })).filter(Boolean);
        console.log('Normalized students:', normalizedStudents);
        setStudents(normalizedStudents);
      } else {
        setStudents([]);
      }
    } catch (error) {
      message.error('Không thể tải danh sách học sinh.');
      console.error('Error fetching students:', error);
    } finally {
      setLoadingStudents(false);
      setLoading(false);
    }
  }, [message]);

  const fetchConversation = useCallback(async (student) => {
    if (!teacherId || !student || !student.id) return;

    console.log(`Attempting to fetch conversation between teacher ${teacherId} and student ${student.id}`);
    setLoadingConversation(true);
    setSelectedStudent(student);
    
    try {
      const conversationData = await api.GetConversation(teacherId, student.id);
      console.log('Raw conversation data:', conversationData);
      
      // Validate and clean conversation data
      const cleanedConversation = (conversationData || []).map(msg => {
        console.log('Processing message:', msg);
        console.log('Message createdAt:', msg.createdAt, 'type:', typeof msg.createdAt);
        
        // Ensure createdAt is properly formatted
        if (msg.createdAt) {
          try {
            // Test if the date can be parsed
            const testDate = new Date(msg.createdAt);
            if (isNaN(testDate.getTime())) {
              console.warn('Invalid createdAt in message:', msg.createdAt);
              // Set a fallback date
              msg.createdAt = new Date().toISOString();
            }
          } catch (dateError) {
            console.warn('Error parsing createdAt:', dateError);
            // Set a fallback date
            msg.createdAt = new Date().toISOString();
          }
        }
        
        return msg;
      });
      
      setConversation(cleanedConversation);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      message.error('Không thể tải cuộc trò chuyện.');
      setConversation([]); // Reset on error
    } finally {
      setLoadingConversation(false);
    }
  }, [teacherId, message]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleStudentSelect = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      fetchConversation(student);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent || !selectedStudent.id) return;
    
    setSending(true);
    const tempId = Date.now();
    const sentMessage = {
      id: tempId,
      content: newMessage,
      createdAt: new Date().toISOString(),
      senderId: parseInt(teacherId),
      recipientId: selectedStudent.id,
      sender: { id: parseInt(teacherId) }
    };
    setConversation(prev => [...prev, sentMessage]);
    setNewMessage('');

    try {
      const messageData = {
        senderId: teacherId,
        recipientId: selectedStudent.id,
        content: newMessage,
        subject: `Tin nhắn từ giảng viên`,
      };
      
      const response = await api.SendMessage(messageData);
      
      // Replace temporary message with the real one from the server
      setConversation(prev => prev.map(msg => (msg.id === tempId ? response : msg)));
    } catch (error) {
      message.error('Không thể gửi tin nhắn.');
      console.error('Error sending message:', error);
      // Remove the optimistic message if sending failed
      setConversation(prev => prev.filter(msg => msg.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const handleSendNewMessage = async (values) => {
    const { studentId, subject, content } = values;
    if (!studentId || !content.trim()) return;

    setSending(true);
    try {
      const messageData = {
        senderId: teacherId,
        recipientId: studentId,
        subject: subject || `Tin nhắn từ giảng viên`,
        content: content,
      };

      await api.SendMessage(messageData);
      
      message.success('Tin nhắn đã được gửi thành công!');
      setIsModalVisible(false);
      form.resetFields();
      
      // If the new message is to the selected student, refresh conversation
      if (selectedStudent && selectedStudent.id === studentId) {
        const student = students.find(s => s.id === studentId);
        fetchConversation(student);
      }
    } catch (error) {
      message.error('Gửi tin nhắn thất bại.');
      console.error('Error sending new message:', error);
    } finally {
      setSending(false);
    }
  };

  const renderConversation = () => {
    if (loadingConversation) {
      return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }
    if (!selectedStudent) {
      return (
        <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
          <UserOutlined style={{ fontSize: '48px' }} />
          <p>Vui lòng chọn một học sinh để xem cuộc trò chuyện</p>
        </div>
      );
    }
    if (conversation.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
          <p>Chưa có tin nhắn nào trong cuộc trò chuyện này.</p>
        </div>
      );
    }
    
    return (
      <List
        dataSource={conversation}
        renderItem={(item) => {
          const isTeacher = item.senderId?.toString() === teacherId;
          console.log('Rendering message item:', item);
          console.log('Message createdAt:', item.createdAt, 'type:', typeof item.createdAt);
          
          // Additional safety check for createdAt
          let displayDate = 'Ngày không xác định';
          try {
            if (item.createdAt) {
              displayDate = formatDate(item.createdAt);
            }
          } catch (dateError) {
            console.error('Error formatting date for display:', dateError);
            displayDate = 'Ngày không xác định';
          }
          
          return (
            <List.Item style={{ justifyContent: isTeacher ? 'flex-end' : 'flex-start' }}>
              <Card
                style={{
                  maxWidth: '70%',
                  backgroundColor: isTeacher ? '#e6f7ff' : '#fff',
                }}
              >
                <p>{item.content}</p>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {displayDate}
                </Text>
              </Card>
            </List.Item>
          );
        }}
      />
    );
  };

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  // Show error if no teacher ID found
  if (!teacherId) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: '#ff4d4f' }}>
        <p>Không thể xác định thông tin giảng viên. Vui lòng đăng nhập lại.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Row gutter={16} style={{ height: 'calc(100vh - 120px)' }}>
      <Col span={6}>
        <Card 
          title="Danh sách học sinh" 
          style={{ height: '100%', overflowY: 'auto' }}
          extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              size="small"
            >
              Tin nhắn mới
            </Button>
          }
        >
          {loadingStudents ? (
            <Spin />
          ) : (
            <List
              dataSource={students}
              renderItem={(student) => (
                <List.Item
                  onClick={() => handleStudentSelect(student.id)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedStudent && selectedStudent.id === student.id ? '#f0faff' : 'transparent',
                  }}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={student.fullName}
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </Col>
      <Col span={18}>
        <Card
          title={selectedStudent ? `Trò chuyện với ${selectedStudent.fullName || 'Học sinh'}` : 'Chọn một cuộc trò chuyện'}
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          styles={{ body: { flex: 1, overflowY: 'auto' } }}
          actions={[
            selectedStudent && (
              <div style={{ padding: '0 24px' }}>
                                 <Input.Group compact>
                   <TextArea
                     rows={3}
                     value={newMessage}
                     onChange={(e) => setNewMessage(e.target.value)}
                     placeholder="Nhập tin nhắn..."
                     disabled={sending}
                     style={{ minHeight: '80px' }}
                   />
                   <Button
                     type="primary"
                     icon={<SendOutlined />}
                     onClick={handleSendMessage}
                     loading={sending}
                     disabled={!newMessage.trim()}
                     style={{ height: '80px', marginLeft: '8px' }}
                   />
                 </Input.Group>
              </div>
            )
          ]}
        >
          {renderConversation()}
        </Card>
      </Col>
      <Modal
        title="Soạn tin nhắn mới"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSendNewMessage}>
          <Form.Item
            name="studentId"
            label="Gửi đến"
            rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}
          >
            <Select placeholder="Chọn học sinh">
              {students.map((student) => (
                <Option key={student.id} value={student.id}>
                  {student.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="subject"
            label="Chủ đề"
          >
            <Input placeholder="Nhập chủ đề" />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <TextArea rows={4} placeholder="Nhập nội dung tin nhắn" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={sending}>
              Gửi tin nhắn
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );
};

const TeacherMessagesPageWithApp = () => (
  <App>
    <TeacherMessagesPage />
  </App>
);

export default TeacherMessagesPageWithApp;
