import { DeleteOutlined, EyeOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Input, List, Modal, Tabs, Tag, message } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api-config';

const { TabPane } = Tabs;
const { TextArea } = Input;

const ManagerMessages = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  
  // Fetch messages from API
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
          message.error('Bạn chưa đăng nhập');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`${API_BASE_URL}/api/student-messages/messages/received/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data) {
          setMessages(response.data.map(msg => ({
            id: msg.id,
            sender: msg.senderName || 'Người dùng',
            senderRole: getRoleNameFromId(msg.senderId),
            senderEmail: msg.senderEmail || 'email@example.com',
            title: msg.subject || 'Không có tiêu đề',
            content: msg.content || 'Không có nội dung',
            date: msg.createdAt || new Date().toISOString(),
            status: msg.isRead ? 'read' : 'unread',
            priority: msg.priority ? msg.priority.toLowerCase() : 'normal'
          })));
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        message.error('Không thể tải tin nhắn');
        
        // Fallback to sample data if API fails
        setMessages([
          {
            id: 1,
            sender: 'Nguyễn Văn A',
            senderRole: 'TEACHER',
            senderEmail: 'teacher@example.com', 
            title: 'Yêu cầu hỗ trợ về lịch dạy',
            content: 'Kính gửi Ban quản lý, tôi cần được hỗ trợ về việc điều chỉnh lịch dạy tuần tới do có công việc đột xuất...',
            date: '2025-06-25T08:30:00',
            status: 'unread',
            priority: 'high'
          },
          {
            id: 2,
            sender: 'Trần Thị B',
            senderRole: 'STUDENT',
            senderEmail: 'student@example.com',
            title: 'Thắc mắc về học phí',
            content: 'Em muốn hỏi thông tin về chính sách học phí kỳ tới...',
            date: '2025-06-24T15:45:00',
            status: 'read',
            priority: 'normal' 
          },
          {
            id: 3,
            sender: 'Admin',
            senderRole: 'ADMIN',
            senderEmail: 'admin@example.com',
            title: 'Cập nhật chính sách mới',
            content: 'Thông báo về việc cập nhật chính sách đánh giá giảng viên...',
            date: '2025-06-23T11:20:00',
            status: 'read',
            priority: 'high'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, []);

  // Helper function to convert role ID to role name
  const getRoleNameFromId = (senderId) => {
    // This is a simple mapping based on user ID
    // In a real application, you would get this from the API
    if (senderId === 1) return 'STUDENT';
    if (senderId === 2) return 'TEACHER';
    if (senderId === 3) return 'MANAGER';
    if (senderId === 4) return 'ADMIN';
    return 'USER';
  };

  // Mark message as read
  const handleViewMessage = async (msg) => {
    setSelectedMessage(msg);
    setMessageModalVisible(true);
    
    // Mark as read if unread
    if (msg.status === 'unread') {
      try {
        const token = localStorage.getItem('token');
        
        // Update in the backend
        await axios.put(`${API_BASE_URL}/api/student-messages/messages/${msg.id}/read`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Update in the frontend
        setMessages(messages.map(item => 
          item.id === msg.id ? {...item, status: 'read'} : item
        ));
      } catch (error) {
        console.error('Error marking message as read:', error);
        // Still update UI even if API fails
        setMessages(messages.map(item => 
          item.id === msg.id ? {...item, status: 'read'} : item
        ));
      }
    }
  };

  // Handle delete message
  const handleDeleteMessage = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa tin nhắn',
      content: 'Bạn có chắc chắn muốn xóa tin nhắn này không?',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          
          // Delete in the backend
          await axios.delete(`${API_BASE_URL}/api/student-messages/messages/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          // Update in the frontend
          setMessages(messages.filter(msg => msg.id !== id));
          message.success('Đã xóa tin nhắn');
        } catch (error) {
          console.error('Error deleting message:', error);
          message.error('Không thể xóa tin nhắn');
          
          // Still update UI even if API fails
          setMessages(messages.filter(msg => msg.id !== id));
        }
      }
    });
  };

  // Handle reply to message
  const handleReply = async () => {
    if (!replyContent.trim()) {
      message.error('Vui lòng nhập nội dung trả lời');
      return;
    }

    const loadingMsg = message.loading('Đang gửi...', 0);
    
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        message.error('Bạn chưa đăng nhập');
        return;
      }
      
      // Create reply message
      const replyMessage = {
        senderId: parseInt(userId),
        recipientId: selectedMessage.id,
        subject: `Re: ${selectedMessage.title}`,
        content: replyContent,
        priority: selectedMessage.priority.toUpperCase(),
        messageType: 'REPLY'
      };
      
      // Send to backend
      await axios.post(`${API_BASE_URL}/api/student-messages/messages`, replyMessage, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      loadingMsg();
      message.success(`Đã gửi trả lời đến ${selectedMessage.sender}`);
      setReplyModalVisible(false);
      setReplyContent('');
    } catch (error) {
      loadingMsg();
      console.error('Error sending reply:', error);
      message.error('Không thể gửi trả lời');
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    return status === 'unread' ? 'blue' : 'default';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'red';
      case 'normal': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  return (
    <div className="p-6">
      <Card title="Quản lý Tin nhắn" className="shadow-md">
        <Tabs defaultActiveKey="all">
          <TabPane tab="Tất cả tin nhắn" key="all">
            <List
              loading={loading}
              dataSource={messages}
              locale={{ emptyText: <Empty description="Không có tin nhắn nào" /> }}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button icon={<EyeOutlined />} onClick={() => handleViewMessage(item)} />,
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteMessage(item.id)} />
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.title}</span>
                        <Tag color={getStatusColor(item.status)}>
                          {item.status === 'unread' ? 'Chưa đọc' : 'Đã đọc'}
                        </Tag>
                        <Tag color={getPriorityColor(item.priority)}>
                          {item.priority === 'high' ? 'Quan trọng' : 
                           item.priority === 'normal' ? 'Thông thường' : 'Thấp'}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div>
                          <UserOutlined /> {item.sender} ({item.senderRole})
                        </div>
                        <div>{formatDate(item.date)}</div>
                      </div>
                    }
                  />
                  <div className="truncate max-w-md">{item.content.substring(0, 100)}...</div>
                </List.Item>
              )}
              pagination={{
                pageSize: 10,
                position: 'bottom',
                align: 'center',
              }}
            />
          </TabPane>
          <TabPane tab="Chưa đọc" key="unread">
            <List
              loading={loading}
              dataSource={messages.filter(msg => msg.status === 'unread')}
              locale={{ emptyText: <Empty description="Không có tin nhắn chưa đọc" /> }}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button icon={<EyeOutlined />} onClick={() => handleViewMessage(item)} />,
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteMessage(item.id)} />
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.title}</span>
                        <Tag color="blue">Chưa đọc</Tag>
                        <Tag color={getPriorityColor(item.priority)}>
                          {item.priority === 'high' ? 'Quan trọng' : 
                           item.priority === 'normal' ? 'Thông thường' : 'Thấp'}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div>
                          <UserOutlined /> {item.sender} ({item.senderRole})
                        </div>
                        <div>{formatDate(item.date)}</div>
                      </div>
                    }
                  />
                  <div className="truncate max-w-md">{item.content.substring(0, 100)}...</div>
                </List.Item>
              )}
              pagination={{
                pageSize: 10,
                position: 'bottom',
                align: 'center',
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Message detail modal */}
      <Modal
        title={selectedMessage?.title}
        open={messageModalVisible}
        onCancel={() => setMessageModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setMessageModalVisible(false)}>
            Đóng
          </Button>,
          <Button 
            key="reply" 
            type="primary" 
            icon={<SendOutlined />}
            onClick={() => {
              setMessageModalVisible(false);
              setReplyModalVisible(true);
            }}
          >
            Trả lời
          </Button>
        ]}
        width={700}
      >
        {selectedMessage && (
          <div>
            <p>
              <strong>Người gửi:</strong> {selectedMessage.sender} ({selectedMessage.senderRole})
            </p>
            <p>
              <strong>Email:</strong> {selectedMessage.senderEmail}
            </p>
            <p>
              <strong>Thời gian:</strong> {formatDate(selectedMessage.date)}
            </p>
            <Card className="mt-4 bg-gray-50">
              <div style={{ whiteSpace: 'pre-wrap' }}>{selectedMessage.content}</div>
            </Card>
          </div>
        )}
      </Modal>

      {/* Reply modal */}
      <Modal
        title={`Trả lời: ${selectedMessage?.title || ''}`}
        open={replyModalVisible}
        onCancel={() => setReplyModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setReplyModalVisible(false)}>
            Hủy
          </Button>,
          <Button 
            key="send" 
            type="primary" 
            icon={<SendOutlined />}
            onClick={handleReply}
          >
            Gửi
          </Button>
        ]}
        width={700}
      >
        {selectedMessage && (
          <div>
            <p>
              <strong>Gửi đến:</strong> {selectedMessage.sender} ({selectedMessage.senderEmail})
            </p>
            <TextArea
              rows={10}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Nhập nội dung trả lời..."
              className="mt-4"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagerMessages;
