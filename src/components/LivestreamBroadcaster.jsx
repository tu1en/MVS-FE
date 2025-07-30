import {
  AudioMutedOutlined,
  AudioOutlined,
  CommentOutlined,
  DesktopOutlined,
  EyeOutlined,
  RecordingOutlined,
  StopOutlined,
  UserOutlined,
  VideoCameraOutlined,
  VideoCameraSlashOutlined
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
  Statistic,
  Typography,
  message,
  Modal,
  Form
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import useWebRTC from '../hooks/useWebRTC';
import livestreamService from '../services/livestreamService';

const { Title, Text } = Typography;

/**
 * LivestreamBroadcaster component cho giáo viên phát livestream
 * @param {Object} props - Component props
 * @param {string} props.lectureId - ID của bài giảng
 * @param {string} props.userId - ID của giáo viên
 * @param {string} props.userName - Tên của giáo viên
 * @param {Function} props.onEnd - Callback khi kết thúc livestream
 * @returns {JSX.Element} LivestreamBroadcaster component
 */
const LivestreamBroadcaster = ({ 
  lectureId, 
  userId, 
  userName = 'Giáo viên',
  onEnd 
}) => {
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState('');
  const [livestreamData, setLivestreamData] = useState(null);
  
  const chatContainerRef = useRef(null);
  const streamStartTime = useRef(null);
  const durationInterval = useRef(null);
  const [form] = Form.useForm();

  // Sử dụng WebRTC hook cho broadcasting
  const {
    localStream,
    remoteStreams,
    isConnected,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    connectionStatus,
    error,
    participants,
    localVideoRef,
    getUserMedia,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    leaveRoom
  } = useWebRTC({
    roomId: `lecture-${lectureId}`,
    userId,
    isInitiator: true // Broadcaster là initiator
  });

  // Cập nhật viewer count
  useEffect(() => {
    setViewerCount(participants.length);
  }, [participants]);

  // Khởi tạo media stream khi component mount
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        await getUserMedia({ video: true, audio: true });
      } catch (err) {
        console.error('Failed to initialize media:', err);
        message.error('Không thể truy cập camera/microphone');
      }
    };

    initializeMedia();
  }, [getUserMedia]);

  // Bắt đầu livestream
  const startLivestream = async () => {
    try {
      const response = await livestreamService.createLivestream({ lectureId });
      setLivestreamData(response);
      setIsLive(true);
      streamStartTime.current = Date.now();
      
      // Start duration timer
      durationInterval.current = setInterval(() => {
        if (streamStartTime.current) {
          setStreamDuration(Math.floor((Date.now() - streamStartTime.current) / 1000));
        }
      }, 1000);

      message.success('Đã bắt đầu livestream thành công!');
    } catch (err) {
      console.error('Failed to start livestream:', err);
      message.error('Không thể bắt đầu livestream');
    }
  };

  // Kết thúc livestream
  const endLivestream = async () => {
    try {
      if (livestreamData) {
        await livestreamService.endLivestream(livestreamData.id);
      }
      
      setIsLive(false);
      setIsRecording(false);
      
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      leaveRoom();
      setShowEndModal(true);
      
    } catch (err) {
      console.error('Failed to end livestream:', err);
      message.error('Có lỗi khi kết thúc livestream');
    }
  };

  // Lưu recording URL
  const handleSaveRecording = async () => {
    try {
      if (livestreamData && recordingUrl) {
        await livestreamService.updateRecordingUrl(livestreamData.id, recordingUrl);
        message.success('Đã lưu liên kết bản ghi thành công!');
      }
      setShowEndModal(false);
      if (onEnd) onEnd();
    } catch (err) {
      console.error('Failed to save recording URL:', err);
      message.error('Không thể lưu liên kết bản ghi');
    }
  };

  // Xử lý gửi tin nhắn
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      user: userName,
      message: newMessage,
      timestamp: new Date(),
      isTeacher: true
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

  // Format duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="livestream-broadcaster" style={{ height: '100vh', background: '#f0f2f5' }}>
      <Row style={{ height: '100%' }}>
        {/* Main Video Area */}
        <Col span={isChatVisible ? 18 : 24} style={{ height: '100%', padding: 16 }}>
          <Card
            title={
              <Space>
                <Title level={4} style={{ margin: 0 }}>
                  {isLive ? '🔴 ĐANG PHÁT TRỰC TIẾP' : 'Chuẩn bị livestream'}
                </Title>
                {isLive && (
                  <Badge 
                    count={`${formatDuration(streamDuration)}`} 
                    style={{ backgroundColor: '#52c41a' }} 
                  />
                )}
              </Space>
            }
            extra={
              <Space>
                <Statistic
                  title="Người xem"
                  value={viewerCount}
                  prefix={<EyeOutlined />}
                  valueStyle={{ fontSize: '16px' }}
                />
                {!isLive ? (
                  <Button
                    type="primary"
                    size="large"
                    onClick={startLivestream}
                    disabled={!localStream}
                    loading={connectionStatus === 'connecting'}
                  >
                    Bắt đầu phát trực tiếp
                  </Button>
                ) : (
                  <Button
                    danger
                    size="large"
                    onClick={endLivestream}
                    icon={<StopOutlined />}
                  >
                    Kết thúc
                  </Button>
                )}
              </Space>
            }
            style={{ height: '100%' }}
            bodyStyle={{ height: 'calc(100% - 64px)', padding: 0 }}
          >
            <div style={{ height: '100%', position: 'relative', background: '#000' }}>
              {/* Local Video Preview */}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)' // Mirror effect
                }}
              />

              {/* Status Overlays */}
              <div
                style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}
              >
                {!isAudioEnabled && (
                  <div
                    style={{
                      background: 'rgba(255,0,0,0.8)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: '12px'
                    }}
                  >
                    <AudioMutedOutlined /> Microphone tắt
                  </div>
                )}
                {!isVideoEnabled && (
                  <div
                    style={{
                      background: 'rgba(255,0,0,0.8)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: '12px'
                    }}
                  >
                    <VideoCameraSlashOutlined /> Camera tắt
                  </div>
                )}
                {isScreenSharing && (
                  <div
                    style={{
                      background: 'rgba(0,255,0,0.8)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: '12px'
                    }}
                  >
                    <DesktopOutlined /> Đang chia sẻ màn hình
                  </div>
                )}
                {isRecording && (
                  <div
                    style={{
                      background: 'rgba(255,0,0,0.8)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: '12px',
                      animation: 'blink 1s infinite'
                    }}
                  >
                    <RecordingOutlined /> Đang ghi hình
                  </div>
                )}
              </div>

              {/* Control Panel */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.8)',
                  padding: '12px 20px',
                  borderRadius: 25,
                  zIndex: 1000
                }}
              >
                <Space size="middle">
                  <Button
                    type={isAudioEnabled ? 'default' : 'primary'}
                    danger={!isAudioEnabled}
                    shape="circle"
                    size="large"
                    icon={isAudioEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
                    onClick={toggleAudio}
                    title={isAudioEnabled ? 'Tắt microphone' : 'Bật microphone'}
                  />
                  
                  <Button
                    type={isVideoEnabled ? 'default' : 'primary'}
                    danger={!isVideoEnabled}
                    shape="circle"
                    size="large"
                    icon={isVideoEnabled ? <VideoCameraOutlined /> : <VideoCameraSlashOutlined />}
                    onClick={toggleVideo}
                    title={isVideoEnabled ? 'Tắt camera' : 'Bật camera'}
                  />
                  
                  <Button
                    type={isScreenSharing ? 'primary' : 'default'}
                    shape="circle"
                    size="large"
                    icon={<DesktopOutlined />}
                    onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                    title={isScreenSharing ? 'Dừng chia sẻ màn hình' : 'Chia sẻ màn hình'}
                    disabled={!isLive}
                  />
                  
                  <Button
                    type={isRecording ? 'primary' : 'default'}
                    danger={isRecording}
                    shape="circle"
                    size="large"
                    icon={<RecordingOutlined />}
                    onClick={() => setIsRecording(!isRecording)}
                    title={isRecording ? 'Dừng ghi hình' : 'Bắt đầu ghi hình'}
                    disabled={!isLive}
                  />
                  
                  <Button
                    type="default"
                    shape="circle"
                    size="large"
                    icon={<CommentOutlined />}
                    onClick={() => setIsChatVisible(!isChatVisible)}
                    title="Toggle chat"
                  />
                </Space>
              </div>
            </div>
          </Card>
        </Col>

        {/* Chat Area */}
        {isChatVisible && (
          <Col span={6} style={{ height: '100%', padding: '16px 16px 16px 0' }}>
            <Card
              title="Chat với học viên"
              size="small"
              style={{ height: '100%' }}
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
                          <Avatar 
                            size="small" 
                            icon={<UserOutlined />}
                            style={{ 
                              backgroundColor: item.isTeacher ? '#1890ff' : '#52c41a' 
                            }}
                          />
                          <Text 
                            strong 
                            style={{ 
                              marginLeft: 8, 
                              fontSize: '12px',
                              color: item.isTeacher ? '#1890ff' : '#000'
                            }}
                          >
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
                    placeholder="Nhập tin nhắn cho học viên..."
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

      {/* End Stream Modal */}
      <Modal
        title="Kết thúc livestream"
        open={showEndModal}
        onCancel={() => setShowEndModal(false)}
        footer={[
          <Button key="skip" onClick={() => { setShowEndModal(false); if (onEnd) onEnd(); }}>
            Bỏ qua
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveRecording}>
            Lưu bản ghi
          </Button>
        ]}
      >
        <p>Bạn có muốn lưu liên kết bản ghi của buổi livestream này không?</p>
        <Input
          placeholder="https://youtu.be/xxxxxxxx hoặc link Google Drive"
          value={recordingUrl}
          onChange={(e) => setRecordingUrl(e.target.value)}
          style={{ marginTop: 16 }}
        />
        <p style={{ marginTop: 8, fontSize: '0.9em', color: '#888' }}>
          Học viên sẽ có thể xem lại bản ghi thông qua liên kết này.
        </p>
      </Modal>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default LivestreamBroadcaster;
