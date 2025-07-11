import { DeleteOutlined, EyeOutlined, MessageOutlined, ReloadOutlined, SendOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Form, Input, List, message, Modal, Popconfirm, Space, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { managerService } from '../../services/managerService';

const { TextArea } = Input;

const ManagerMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await managerService.getMessages();
      // Ensure data is always an array
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      message.error('Không thể tải danh sách tin nhắn');
      setMessages([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await managerService.markMessageAsRead(messageId);
      message.success('Đã đánh dấu tin nhắn là đã đọc');
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
      message.error('Không thể đánh dấu tin nhắn');
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await managerService.deleteMessage(messageId);
      message.success('Xóa tin nhắn thành công');
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      message.error('Không thể xóa tin nhắn');
    }
  };

  const handleReply = (msg) => {
    setSelectedMessage(msg);
    form.setFieldsValue({
      subject: `Re: ${msg.subject}`,
      content: ''
    });
    setReplyModalVisible(true);
  };

  const handleViewMessage = (msg) => {
    setSelectedMessage(msg);
    setViewModalVisible(true);
    
    // Mark as read if unread
    if (!msg.isRead) {
      handleMarkAsRead(msg.id);
    }
  };

  const handleSendReply = async (values) => {
    try {
      const replyData = {
        ...values,
        parentMessageId: selectedMessage.id,
        receiverId: selectedMessage.senderId
      };
      
      await managerService.sendMessage(replyData);
      message.success('Gửi phản hồi thành công');
      setReplyModalVisible(false);
      form.resetFields();
      fetchMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      message.error('Không thể gửi phản hồi');
    }
  };

  const getMessageTypeColor = (type) => {
    const colors = {
      'COMPLAINT': 'red',
      'INQUIRY': 'blue',
      'FEEDBACK': 'green',
      'SUPPORT': 'orange',
      'OTHER': 'default'
    };
    return colors[type] || 'default';
  };

  const getMessageTypeText = (type) => {
    const texts = {
      'COMPLAINT': 'Khiếu nại',
      'INQUIRY': 'Văn hỏi',
      'FEEDBACK': 'Phản hồi',
      'SUPPORT': 'Hỗ trợ',
      'OTHER': 'Khác'
    };
    return texts[type] || type;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'HIGH': 'red',
      'MEDIUM': 'orange',
      'LOW': 'green'
    };
    return colors[priority] || 'default';
  };

  const getPriorityText = (priority) => {
    const texts = {
      'HIGH': 'Cao',
      'MEDIUM': 'Trung bình',
      'LOW': 'Thấp'
    };
    return texts[priority] || priority;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>
            <MessageOutlined style={{ marginRight: 8 }} />
            Quản lý tin nhắn
          </h2>
          <Button icon={<ReloadOutlined />} onClick={fetchMessages} loading={loading}>
            Tải lại
          </Button>
        </div>

        <List
          loading={loading}
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item
              key={msg.id}
              actions={[
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewMessage(msg)}
                >
                  Xem
                </Button>,
                <Button
                  type="text"
                  icon={<SendOutlined />}
                  onClick={() => handleReply(msg)}
                >
                  Trả lời
                </Button>,
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa tin nhắn này?"
                  onConfirm={() => handleDelete(msg.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                  >
                    Xóa
                  </Button>
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge dot={!msg.isRead}>
                      <span style={{ fontWeight: msg.isRead ? 'normal' : 'bold' }}>
                        {msg.subject}
                      </span>
                    </Badge>
                    <Tag color={getMessageTypeColor(msg.type)}>
                      {getMessageTypeText(msg.type)}
                    </Tag>
                    {msg.priority && (
                      <Tag color={getPriorityColor(msg.priority)}>
                        {getPriorityText(msg.priority)}
                      </Tag>
                    )}
                  </div>
                }
                description={
                  <div>
                    <div style={{ marginBottom: 4 }}>
                      <strong>Từ:</strong> {msg.senderName || msg.senderEmail}
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <strong>Nội dung:</strong> {msg.content?.substring(0, 100)}...
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleString('vi-VN') : ''}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} tin nhắn`
          }}
        />

        {/* View Message Modal */}
        <Modal
          title="Chi tiết tin nhắn"
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setViewModalVisible(false)}>
              Đóng
            </Button>,
            <Button key="reply" type="primary" onClick={() => {
              setViewModalVisible(false);
              handleReply(selectedMessage);
            }}>
              Trả lời
            </Button>
          ]}
          width={700}
        >
          {selectedMessage && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <strong>Chủ đề:</strong> {selectedMessage.subject}
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>Từ:</strong> {selectedMessage.senderName || selectedMessage.senderEmail}
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>Loại:</strong> 
                <Tag color={getMessageTypeColor(selectedMessage.type)} style={{ marginLeft: 8 }}>
                  {getMessageTypeText(selectedMessage.type)}
                </Tag>
              </div>
              {selectedMessage.priority && (
                <div style={{ marginBottom: 16 }}>
                  <strong>Độ ưu tiên:</strong> 
                  <Tag color={getPriorityColor(selectedMessage.priority)} style={{ marginLeft: 8 }}>
                    {getPriorityText(selectedMessage.priority)}
                  </Tag>
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <strong>Thời gian:</strong> {selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleString('vi-VN') : ''}
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>Nội dung:</strong>
                <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  {selectedMessage.content}
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Reply Modal */}
        <Modal
          title="Trả lời tin nhắn"
          open={replyModalVisible}
          onCancel={() => setReplyModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSendReply}
          >
            <Form.Item
              label="Chủ đề"
              name="subject"
              rules={[{ required: true, message: 'Vui lòng nhập chủ đề!' }]}
            >
              <Input placeholder="Nhập chủ đề" />
            </Form.Item>

            <Form.Item
              label="Nội dung"
              name="content"
              rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
            >
              <TextArea rows={6} placeholder="Nhập nội dung phản hồi" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setReplyModalVisible(false)}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  Gửi phản hồi
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default ManagerMessages;
