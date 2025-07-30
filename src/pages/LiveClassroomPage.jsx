import {
  AudioOutlined, DesktopOutlined,
  DisconnectOutlined,
  FileTextOutlined,
  FullscreenOutlined,
  MessageOutlined,
  SettingOutlined, UserOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Layout,
  message,
  Modal,
  Space,
  Spin,
  Tabs,
  Typography
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import ChatComponent from '../components/ChatComponent';
import DocumentSharingPanel from '../components/DocumentSharingPanel';
import PermissionPanel from '../components/PermissionPanel';
import WhiteboardComponent from '../components/WhiteboardComponent';
import { useDocumentSync } from '../hooks/useDocumentSync';
import { useWebSocketSTOMP } from '../hooks/useWebSocketSTOMP';

const { Header, Content, Sider } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const LiveClassroomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // States
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  const [showPermissions, setShowPermissions] = useState(false);
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef({});
  const peerConnectionsRef = useRef({});
  const localStreamRef = useRef(null);

  // ICE config
  const iceConfig = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  // Document sync
  const {
    currentDocument, documents, refreshDocuments, syncDocumentNavigation
  } = useDocumentSync(roomId);

  // STOMP WebSocket connection using custom hook
  const {
    isConnected,
    connectionStatus,
    lastMessage,
    sendSignal,
    joinRoom: joinRoomSignal,
    leaveRoom: leaveRoomSignal
  } = useWebSocketSTOMP(roomId, {
    onConnect: () => {
      console.log('✅ Connected to signaling server for room:', roomId);
      // Join room when connected
      const userInfo = {
        id: user.userId,
        name: user.fullName,
        role: user.role,
        avatar: user.avatar,
        isVideoEnabled: true,
        isAudioEnabled: true
      };
      joinRoomSignal(userInfo);
    },
    onDisconnect: () => {
      console.log('🔌 Disconnected from signaling server');
    },
    onError: (error) => {
      console.error('❌ Signaling connection error:', error);
      message.error('Lỗi kết nối đến server signaling');
    },
    debug: true
  });

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage) {
      const { topic, data } = lastMessage;
      
      if (topic.includes('/join')) {
        handleUserJoined(data);
      } else if (topic.includes('/leave')) {
        handleUserLeft(data);
      } else {
        handleWebSocketMessage(data);
      }
    }
  }, [lastMessage]);

  // Add fake participants for testing UI
  useEffect(() => {
    const timer = setTimeout(() => {
      setParticipants([
        { 
          id: "teacher-001", 
          name: "Nguyễn Văn Giáo", 
          role: "TEACHER",
          avatar: null,
          isVideoEnabled: true,
          isAudioEnabled: true
        },
        { 
          id: "student-001", 
          name: "Trần Thị Hoa", 
          role: "STUDENT",
          avatar: null,
          isVideoEnabled: true,
          isAudioEnabled: false
        },
        { 
          id: "student-002", 
          name: "Lê Văn Nam", 
          role: "STUDENT",
          avatar: null,
          isVideoEnabled: false,
          isAudioEnabled: true
        }
      ]);
      console.log("👥 Added fake participants for testing UI");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  /** Init camera/mic */
  useEffect(() => {
    initializeMediaStream();
    return () => cleanupMediaStream();
  }, []);

  const initializeMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      message.success('🎥 Đã bật camera & mic');
    } catch (err) {
      console.error('Error accessing media:', err);
      message.error('Không thể bật camera/mic');
      setConnectionStatus('error');
    }
  };

  /** Signaling Handlers */
  const handleWebSocketMessage = (msg) => {
    switch (msg.type) {
      case 'user-joined': handleUserJoined(msg); break;
      case 'user-left': handleUserLeft(msg); break;
      case 'offer': handleOffer(msg); break;
      case 'answer': handleAnswer(msg); break;
      case 'ice-candidate': handleIceCandidate(msg); break;
      case 'document-navigation': syncDocumentNavigation(msg); break;
      default: console.log('Unknown msg:', msg.type);
    }
  };

  const createPeerConnection = (userId) => {
    const pc = new RTCPeerConnection(iceConfig);
    localStreamRef.current?.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      if (!remoteVideosRef.current[userId]) {
        const videoEl = document.createElement('video');
        videoEl.srcObject = remoteStream;
        videoEl.autoplay = true;
        videoEl.playsInline = true;
        videoEl.style.width = '100%';
        videoEl.style.borderRadius = '8px';
        const container = document.querySelector('#remote-videos-container');
        if (container) {
          const wrapper = document.createElement('div');
          wrapper.style.border = '1px solid #404040';
          wrapper.style.borderRadius = '8px';
          wrapper.appendChild(videoEl);
          container.appendChild(wrapper);
        }
        remoteVideosRef.current[userId] = videoEl;
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal({ type: 'ice-candidate', roomId, candidate: e.candidate, senderId: user.userId, targetId: userId });
      }
    };
    return pc;
  };

  const handleUserJoined = async (newUser) => {
    // If it's a direct user object, use it; otherwise extract from message
    const userInfo = newUser.user || newUser;
    
    if (userInfo.id === user.userId) return;
    
    setParticipants(prev => {
      // Avoid duplicates
      if (prev.find(p => p.id === userInfo.id)) return prev;
      console.log("👤 User joined:", userInfo.name);
      return [...prev, userInfo];
    });
    
    // Only create peer connection if we have real signaling
    if (isConnected) {
      const pc = createPeerConnection(userInfo.id);
      peerConnectionsRef.current[userInfo.id] = pc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal({ type: 'offer', roomId, sdp: offer, senderId: user.userId, targetId: userInfo.id });
    }
  };

  const handleUserLeft = ({ userId }) => {
    setParticipants(prev => prev.filter(p => p.id !== userId));
    peerConnectionsRef.current[userId]?.close();
    delete peerConnectionsRef.current[userId];
    const video = remoteVideosRef.current[userId];
    if (video?.parentNode) video.parentNode.remove();
    delete remoteVideosRef.current[userId];
    console.log("👋 User left:", userId);
  };

  const handleOffer = async ({ senderId, sdp }) => {
    const pc = peerConnectionsRef.current[senderId] || createPeerConnection(senderId);
    peerConnectionsRef.current[senderId] = pc;
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    sendSignal({ type: 'answer', roomId, sdp: answer, senderId: user.userId, targetId: senderId });
  };

  const handleAnswer = async ({ senderId, sdp }) => {
    await peerConnectionsRef.current[senderId]?.setRemoteDescription(new RTCSessionDescription(sdp));
  };

  const handleIceCandidate = async ({ senderId, candidate }) => {
    const pc = peerConnectionsRef.current[senderId];
    if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
  };

  /** Toggles */
  const toggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsVideoEnabled(track.enabled);
    }
  };

  const toggleAudio = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsAudioEnabled(track.enabled);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getTracks()[0];
        Object.values(peerConnectionsRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });
        screenTrack.onended = () => toggleScreenShare();
        setIsScreenSharing(true);
      } else {
        const camTrack = localStreamRef.current.getVideoTracks()[0];
        Object.values(peerConnectionsRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(camTrack);
        });
        setIsScreenSharing(false);
      }
    } catch (err) {
      message.error('Không thể chia sẻ màn hình');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  const cleanupMediaStream = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};
    remoteVideosRef.current = {};
  };

  const leaveClassroom = () => {
    Modal.confirm({
      title: 'Rời khỏi lớp học?',
      onOk: () => {
        // Send leave signal
        leaveRoomSignal({ userId: user.userId, name: user.fullName });
        cleanupMediaStream();
        navigate('/teacher');
      }
    });
  };

  if (connectionStatus === 'connecting') {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" /><span style={{ marginLeft: 16 }}>Đang kết nối...</span>
    </div>;
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>🎓 Lớp học - Room {roomId}</Title>
        
        <Space>
          <Badge status={connectionStatus === 'connected' ? 'success' : 'error'}
                 text={connectionStatus === 'connected' ? 'Đã kết nối' : 'Mất kết nối'} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text>Thành viên ({participants.length + 1}):</Text>
            <Avatar.Group maxCount={4} size="small">
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} title="Bạn" />
              {participants.map(p => (
                <Avatar 
                  key={p.id} 
                  src={p.avatar} 
                  style={{ backgroundColor: p.role === 'TEACHER' ? '#52c41a' : '#fa8c16' }}
                  title={`${p.name} (${p.role})`}
                >
                  {p.name ? p.name[0] : 'U'}
                </Avatar>
              ))}
            </Avatar.Group>
          </div>
          
          <Button danger icon={<DisconnectOutlined />} onClick={leaveClassroom}>Rời khỏi</Button>
        </Space>
      </Header>

      <Layout>
        <Content style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, background: '#000', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '8px' }}>
            <Card style={{ border: '2px solid #1890ff' }} bodyStyle={{ padding: 0 }}>
              <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '100%', borderRadius: '8px' }} />
            </Card>
            <div id="remote-videos-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px,1fr))', gap: '8px' }}></div>
          </div>
          <div style={{ height: '300px', borderTop: '1px solid #ddd' }}>
            <WhiteboardComponent roomId={roomId} sendMessage={sendSignal} userRole={user.role} />
          </div>
        </Content>

        <Sider width={400} collapsed={siderCollapsed} onCollapse={setSiderCollapsed} style={{ background: '#fff' }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab={<span><MessageOutlined /> Chat</span>} key="chat">
              <ChatComponent roomId={roomId} sendMessage={sendSignal} currentUser={user} />
            </TabPane>
            <TabPane tab={<span><FileTextOutlined /> Tài liệu</span>} key="documents">
              <DocumentSharingPanel roomId={roomId} userRole={user.role} documents={documents} currentDocument={currentDocument} onDocumentChange={refreshDocuments} />
            </TabPane>
          </Tabs>
        </Sider>
      </Layout>

      <div style={{ background: '#fff', padding: '12px', display: 'flex', justifyContent: 'center' }}>
        <Space>
          <Button type={isVideoEnabled ? "primary" : "default"} icon={<VideoCameraOutlined />} onClick={toggleVideo}>{isVideoEnabled ? 'Tắt camera' : 'Bật camera'}</Button>
          <Button type={isAudioEnabled ? "primary" : "default"} icon={<AudioOutlined />} onClick={toggleAudio}>{isAudioEnabled ? 'Tắt mic' : 'Bật mic'}</Button>
          <Button icon={<DesktopOutlined />} onClick={toggleScreenShare}>{isScreenSharing ? 'Dừng chia sẻ' : 'Chia sẻ màn hình'}</Button>
          <Button icon={<FullscreenOutlined />} onClick={toggleFullscreen}>Toàn màn hình</Button>
          {user.role === 'TEACHER' && <Button icon={<SettingOutlined />} onClick={() => setShowPermissions(true)}>Quản lý quyền</Button>}
        </Space>
      </div>

      <Modal open={showPermissions} footer={null} onCancel={() => setShowPermissions(false)} width={600}>
        <PermissionPanel roomId={roomId} participants={participants} sendMessage={sendSignal} />
      </Modal>
    </Layout>
  );
};

export default LiveClassroomPage;
