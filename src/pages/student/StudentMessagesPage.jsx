import { MenuOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Drawer, Empty, Grid, Input, Layout, List, Space, Spin, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

function StudentMessagesPage() {
  const { user } = useAuth();
  const userId = user?.id;

  const [teachers, setTeachers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  // Kích hoạt chế độ mobile khi nhỏ hơn 'lg' (~<992px) để dễ thấy hiệu ứng
  const isMobile = !screens.lg;

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

  const normalizeTeacher = (raw) => {
    if (!raw) return null;
    const id = raw.id || raw.teacherId || raw.userId || raw.teacher?.id;
    if (!id) return null;
    const fullName = raw.teacherName || raw.fullName || raw.username || raw.name || raw.teacher?.fullName || `Giáo viên #${id}`;
    return { id: Number(id), fullName };
  };

  const uniqueById = (arr) => {
    const map = new Map();
    (arr || []).forEach((x) => { if (x && x.id != null && !map.has(x.id)) map.set(x.id, x); });
    return Array.from(map.values());
  };

  const loadData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      console.log('Loading data for student:', userId);
      
      const [clsRes, inboxRes] = await Promise.all([
        apiClient.get('/classrooms/student/me').catch((err) => {
          console.warn('Error fetching classrooms:', err);
          return null;
        }),
        apiClient.get(`/student-messages/student/${userId}`).catch((err) => {
          console.warn('Error fetching inbox messages:', err);
          return { data: [] };
        }),
      ]);

      console.log('Classrooms response:', clsRes);
      console.log('Inbox response:', inboxRes);

      const inbox = Array.isArray(inboxRes?.data) ? inboxRes.data : (inboxRes?.data?.data || []);
      console.log('Processed inbox messages:', inbox);
      setMessages(inbox);

      const sentRes = await apiClient.get(`/student-messages/by-sender/${userId}`).catch((err) => {
        console.warn('Error fetching sent messages:', err);
        return { data: [] };
      });
      const sent = Array.isArray(sentRes?.data) ? sentRes.data : (sentRes?.data?.data || []);
      console.log('Processed sent messages:', sent);
      setSentMessages(sent);

      const classes = Array.isArray(clsRes?.data?.data) ? clsRes.data.data : (Array.isArray(clsRes?.data) ? clsRes.data : []);
      console.log('Processed classes:', classes);
      
      const fromClasses = (classes || []).map((c) => normalizeTeacher({
        id: c.teacherId || c.instructorId || c.teacher?.id,
        teacherName: c.teacherName || c.teacher?.fullName,
      })).filter(Boolean);

      // Derive teachers from messages if needed
      const allMsgs = [...inbox, ...sent];
      const fromMessages = allMsgs.map((m) => {
        const tid = m.senderId === userId ? m.recipientId : m.senderId;
        const tname = m.senderId === userId ? (m.recipientName) : (m.senderName);
        if (!tid) return null;
        return normalizeTeacher({ id: tid, teacherName: tname });
      }).filter(Boolean);

      const list = uniqueById([...(fromClasses || []), ...(fromMessages || [])]);
      console.log('Final teachers list:', list);
      setTeachers(list);
      if (!selectedTeacher && list.length) setSelectedTeacher(list[0]);
    } catch (error) {
      console.error('Error in loadData:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); /* eslint-disable-next-line */ }, [userId]);

  const conversation = useMemo(() => {
    if (!selectedTeacher) return [];
    const all = [...(messages || []), ...(sentMessages || [])];
    const filtered = all.filter((m) => m.senderId === selectedTeacher.id || m.recipientId === selectedTeacher.id);
    
    // Sort with error handling for invalid dates
    return filtered.sort((a, b) => {
      try {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        
        // Check if dates are valid
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1; // Invalid dates go to end
        if (isNaN(dateB.getTime())) return -1; // Invalid dates go to end
        
        return dateA - dateB;
      } catch (error) {
        console.warn('Error sorting conversation by date:', error);
        return 0;
      }
    });
  }, [messages, sentMessages, selectedTeacher]);

  const sendMessage = async () => {
    if (!selectedTeacher || !messageText.trim()) return;
    setSending(true);
    try {
      const payload = {
        senderId: userId,
        recipientId: selectedTeacher.id,
        content: messageText,
        subject: 'Tin nhắn từ học sinh',
        priority: 'MEDIUM',
        messageType: 'GENERAL',
        status: 'SENT'
      };
      const res = await apiClient.post('/student-messages', payload);
      const created = res?.data || { ...payload, id: Date.now(), createdAt: new Date().toISOString() };
      setSentMessages((prev) => [...prev, created]);
      setMessageText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout style={{ height: 'calc(100vh - 64px)' }}>
      {!isMobile && (
        <Sider
          width={340}
          breakpoint="lg"
          collapsedWidth={0}
          style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
        >
          <div style={{ padding: 16 }}>
            <Title level={4} style={{ margin: 0 }}>Tin nhắn</Title>
            <Text type="secondary">Giáo viên của tôi</Text>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
          ) : (
            <List
              dataSource={teachers}
              locale={{ emptyText: <Empty description="Chưa có giáo viên" /> }}
              renderItem={(t) => {
                const all = [...(messages || []), ...(sentMessages || [])];
                const last = all
                  .filter((m) => m.senderId === t.id || m.recipientId === t.id)
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                return (
                  <List.Item
                    onClick={() => setSelectedTeacher(t)}
                    style={{ cursor: 'pointer', background: selectedTeacher?.id === t.id ? '#f0faff' : 'transparent' }}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={t.fullName}
                      description={last ? `${(last.content || '').slice(0, 40)}${(last.content || '').length > 40 ? '…' : ''}` : '—'}
                    />
                    <div style={{ fontSize: 12, color: '#999' }}>{last?.createdAt ? formatDate(last.createdAt) : ''}</div>
                  </List.Item>
                );
              }}
            />
          )}
        </Sider>
      )}

      <Content style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <Avatar icon={<UserOutlined />} />
            <div>
              <Title level={5} style={{ margin: 0 }}>{selectedTeacher ? selectedTeacher.fullName : 'Chưa chọn giáo viên'}</Title>
              <Text type="secondary">Trao đổi với giáo viên</Text>
            </div>
          </Space>
          {isMobile && (
            <Button icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />
          )}
        </div>

        <div style={{ flex: 1, padding: 16, overflow: 'auto', background: '#fafafa' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
          ) : !selectedTeacher ? (
            <Empty description="Chọn 1 giáo viên để bắt đầu trò chuyện" />
          ) : conversation.length === 0 ? (
            <Empty description="Chưa có tin nhắn" />
          ) : (
            <List
              dataSource={conversation}
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
          )}
        </div>

        <div style={{ padding: 16, borderTop: '1px solid #f0f0f0', background: '#fff' }}>
          <Space.Compact style={{ width: '100%' }}>
            <Input.TextArea
              placeholder="Nhập tin nhắn..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              disabled={!selectedTeacher}
            />
            <Button type="primary" icon={<SendOutlined />} loading={sending} onClick={sendMessage} disabled={!selectedTeacher || !messageText.trim()} />
          </Space.Compact>
        </div>
      </Content>

      {isMobile && (
        <Drawer
          title="Giáo viên của tôi"
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          bodyStyle={{ padding: 0 }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
          ) : (
            <List
              dataSource={teachers}
              locale={{ emptyText: <Empty description="Chưa có giáo viên" /> }}
              renderItem={(t) => {
                const all = [...(messages || []), ...(sentMessages || [])];
                const last = all
                  .filter((m) => m.senderId === t.id || m.recipientId === t.id)
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                return (
                  <List.Item
                    onClick={() => { setSelectedTeacher(t); setDrawerOpen(false); }}
                    style={{ cursor: 'pointer', background: selectedTeacher?.id === t.id ? '#f0faff' : 'transparent' }}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={t.fullName}
                      description={last ? `${(last.content || '').slice(0, 40)}${(last.content || '').length > 40 ? '…' : ''}` : '—'}
                    />
                    <div style={{ fontSize: 12, color: '#999' }}>{last?.createdAt ? formatDate(last.createdAt) : ''}</div>
                  </List.Item>
                );
              }}
            />
          )}
        </Drawer>
      )}
    </Layout>
  );
}

export default StudentMessagesPage;


