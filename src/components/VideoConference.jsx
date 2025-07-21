import {
  AudioMutedOutlined,
  AudioOutlined,
  DesktopOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  VideoCameraSlashOutlined
} from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import useWebRTCSignaling from '../hooks/useWebRTCSignaling';
import './VideoConference.css';

/**
 * VideoConference UI kiểu Google Meet
 * @param {string} roomId
 * @param {string} userId
 * @param {string} userName
 * @param {boolean} isTeacher
 * @param {Function} onLeave
 */
const VideoConference = ({ roomId, userId, userName, isTeacher = false, onLeave }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimeoutRef = useRef(null);

  const {
    localVideoRef,
    remoteStreams,
    getUserMedia,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    leaveRoom,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    participants,
    connectionStatus
  } = useWebRTCSignaling({ roomId, userId, userName, isTeacher });

  // Init media
  useEffect(() => {
    (async () => {
      try {
        await getUserMedia({ video: true, audio: true });
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to init media:', err);
      }
    })();
  }, [getUserMedia]);

  // Auto-hide control bar
  const showControls = () => {
    setControlsVisible(true);
    clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setControlsVisible(false), 3000);
  };

  useEffect(() => {
    document.addEventListener('mousemove', showControls);
    return () => {
      document.removeEventListener('mousemove', showControls);
    };
  }, []);

  const handleLeaveRoom = () => {
    leaveRoom();
    if (onLeave) onLeave();
  };

  if (!isInitialized) {
    return (
      <div className="meet-loading">
        <div className="spinner"></div>
        <p>Đang khởi tạo camera & micro...</p>
      </div>
    );
  }

  return (
    <div className="meet-container" onMouseMove={showControls}>
      {/* Header */}
      <header className="meet-header">
        <span>Phòng: {roomId}</span>
        <span>{connectionStatus === 'connected' ? 'Đã kết nối' : 'Đang kết nối...'} • {participants.length} người</span>
      </header>

      {/* Video Grid */}
      <main className="video-grid">
        {/* Local Video */}
        <div className="video-tile">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{ transform: 'scaleX(-1)' }}
          />
          <div className="name-tag">{userName || 'Bạn'}</div>
        </div>

        {/* Remote Videos */}
        {Array.from(remoteStreams.entries()).map(([id, stream]) => (
          <div className="video-tile" key={id}>
            <video
              autoPlay
              playsInline
              ref={(el) => el && (el.srcObject = stream)}
            />
            <div className="name-tag">Người dùng {id}</div>
          </div>
        ))}
      </main>

      {/* Control Bar */}
      {controlsVisible && (
        <footer className="control-bar">
          <button
            className={`btn ${isAudioEnabled ? '' : 'off'}`}
            onClick={toggleAudio}
            title={isAudioEnabled ? 'Tắt mic' : 'Bật mic'}
          >
            {isAudioEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
          </button>

          <button
            className={`btn ${isVideoEnabled ? '' : 'off'}`}
            onClick={toggleVideo}
            title={isVideoEnabled ? 'Tắt camera' : 'Bật camera'}
          >
            {isVideoEnabled ? <VideoCameraOutlined /> : <VideoCameraSlashOutlined />}
          </button>

          <button
            className={`btn ${isScreenSharing ? 'active' : ''}`}
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            title="Chia sẻ màn hình"
          >
            <DesktopOutlined />
          </button>

          <button className="btn leave" onClick={handleLeaveRoom} title="Rời phòng">
            <PhoneOutlined />
          </button>
        </footer>
      )}
    </div>
  );
};

export default VideoConference;
