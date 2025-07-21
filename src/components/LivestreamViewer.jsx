import {
  AudioMutedOutlined,
  AudioOutlined,
  CommentOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  HeartOutlined,
  SendOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Input,
  List,
  Row,
  Space,
  Typography,
  message
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import useWebRTC from '../hooks/useWebRTC';

const { Title, Text } = Typography;
const { TextArea } = Input;

/**
 * LivestreamViewer component cho việc xem livestream
 * @param {Object} props - Component props
 * @param {string} props.streamId - ID của livestream
 * @param {string} props.userId - ID của user hiện tại
 * @param {string} props.userName - Tên của user hiện tại
 * @param {Object} props.streamInfo - Thông tin về livestream
 * @param {Function} props.onLeave - Callback khi rời khỏi stream
 * @returns {JSX.Element} LivestreamViewer component
 */
const LivestreamViewer = ({ 
  streamId, 
  userId, 
  userName = 'Học viên',
  streamInfo = {},
  onLeave 
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [reactions, setReactions] = useState([]);
  const [isChatVisible, setIsChatVisible] = useState(true);
  
  const videoContainerRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Sử dụng WebRTC hook cho livestream viewing
  const {
    remoteStreams,
    isConnected,
    connectionStatus,
    error,
    participants
  } = useWebRTC({
    roomId: streamId,
    userId,
    isInitiator: false // Viewer không phải là initiator
  });

  // Cập nhật viewer count
  useEffect(() => {
    setViewerCount(participants.length);
  }, [participants]);

  // Mock chat messages for demo
  useEffect(() => {
    const mockMessages = [
      { id: 1, user: 'Nguyễn Văn A', message: 'Chào thầy!', timestamp: new Date() },
      { id: 2, user: 'Trần Thị B', message: 'Bài học hôm nay rất hay ạ', timestamp: new Date() },
      { id: 3, user: 'Lê Văn C', message: 'Thầy có thể giải thích lại phần này được không?', timestamp: new Date() }
    ];
    setChatMessages(mockMessages);
  }, []);

  // Xử lý gửi tin nhắn
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      user: userName,
      message: newMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');

    // Scroll to bottom
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  // Xử lý reaction
  const handleReaction = () => {
    const reaction = {
      id: Date.now(),
      type: 'heart',
      x: Math.random() * 100,
      y: Math.random() * 100
    };

    setReactions(prev => [...prev, reaction]);

    // Remove reaction after animation
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 3000);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Lấy main stream (giả sử stream đầu tiên là main stream)
  const mainStream = remoteStreams.size > 0 ? Array.from(remoteStreams.values())[0] : null;

  return (
    <div className="livestream-viewer" style={{ height: '100vh', background: '#000' }}>
      <Row style={{ height: '100%' }}>
        {/* Video Area */}
        <Col span={isChatVisible ? 18 : 24} style={{ height: '100%', position: 'relative' }}>
          <div
            ref={videoContainerRef}
            style={{
              height: '100%',
              position: 'relative',
              background: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Main Video Stream */}
            {mainStream ? (
              <video
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
                ref={(el) => {
                  if (el && el.srcObject !== mainStream) {
                    el.srcObject = mainStream;
                  }
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: 'white' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📺</div>
                <Title level={3} style={{ color: 'white' }}>
                  {connectionStatus === 'connected' ? 'Đang chờ stream...' : 'Đang kết nối...'}
                </Title>
                <Text style={{ color: '#ccc' }}>
                  {error || 'Vui lòng chờ giáo viên bắt đầu livestream'}
                </Text>
              </div>
            )}

            {/* Stream Info Overlay */}
            <div
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: 8,
                backdropFilter: 'blur(10px)'
              }}
            >
              <Space direction="vertical" size="small">
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                  {streamInfo.title || 'Livestream'}
                </Text>
                <Space>
                  <Badge count={viewerCount} style={{ backgroundColor: '#52c41a' }}>
                    <UserOutlined style={{ color: 'white' }} />
                  </Badge>
                  <Text style={{ color: '#ccc', fontSize: '12px' }}>
                    {viewerCount} người xem
                  </Text>
                </Space>
              </Space>
            </div>

            {/* Control Overlay */}
            <div
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                display: 'flex',
                gap: 8
              }}
            >
              <Button
                type="text"
                shape="circle"
                icon={<HeartOutlined />}
                style={{ color: 'white', background: 'rgba(255,255,255,0.2)' }}
                onClick={handleReaction}
                title="Thích"
              />
              <Button
                type="text"
                shape="circle"
                icon={<CommentOutlined />}
                style={{ color: 'white', background: 'rgba(255,255,255,0.2)' }}
                onClick={() => setIsChatVisible(!isChatVisible)}
                title="Chat"
              />
              <Button
                type="text"
                shape="circle"
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                style={{ color: 'white', background: 'rgba(255,255,255,0.2)' }}
                onClick={toggleFullscreen}
                title="Toàn màn hình"
              />
            </div>

            {/* Reactions Animation */}
            {reactions.map(reaction => (
              <div
                key={reaction.id}
                style={{
                  position: 'absolute',
                  left: `${reaction.x}%`,
                  top: `${reaction.y}%`,
                  fontSize: '24px',
                  animation: 'float-up 3s ease-out forwards',
                  pointerEvents: 'none',
                  zIndex: 1000
                }}
              >
                ❤️
              </div>
            ))}
          </div>
        </Col>

        {/* Chat Area */}
        {isChatVisible && (
          <Col span={6} style={{ height: '100%', background: '#fff' }}>
            <Card
              title="Chat trực tiếp"
              size="small"
              style={{ height: '100%', border: 'none' }}
              bodyStyle={{ 
                height: 'calc(100% - 40px)', 
                padding: 0,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Chat Messages */}
              <div
                ref={chatContainerRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '8px 12px',
                  maxHeight: 'calc(100vh - 120px)'
                }}
              >
                <List
                  dataSource={chatMessages}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '4px 0', border: 'none' }}>
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                          <Avatar size="small" icon={<UserOutlined />} />
                          <Text strong style={{ marginLeft: 8, fontSize: '12px' }}>
                            {item.user}
                          </Text>
                        </div>
                        <Text style={{ fontSize: '13px', wordBreak: 'break-word' }}>
                          {item.message}
                        </Text>
                      </div>
                    </List.Item>
                  )}
                />
              </div>

              {/* Chat Input */}
              <div style={{ padding: '8px 12px', borderTop: '1px solid #f0f0f0' }}>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onPressEnter={handleSendMessage}
                    style={{ fontSize: '12px' }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  />
                </Space.Compact>
              </div>
            </Card>
          </Col>
        )}
      </Row>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(1.5);
          }
        }
      `}</style>
    </div>
  );
};

export default LivestreamViewer;
