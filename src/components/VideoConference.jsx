import {
  AudioMutedOutlined,
  AudioOutlined,
  DesktopOutlined,
  ExpandOutlined,
  EyeInvisibleOutlined,
  PhoneOutlined,
  SettingOutlined, // Thay thế VideoCameraSlashOutlined
  UserOutlined,
  VideoCameraOutlined
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const hideTimeoutRef = useRef(null);
  const containerRef = useRef(null);

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
    connectionStatus,
    error
  } = useWebRTCSignaling({ roomId, userId, userName, isTeacher });

  // Init media
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        await getUserMedia({ video: true, audio: true });
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to init media:', err);
        // Vẫn cho phép tham gia mà không có camera/mic
        setIsInitialized(true);
      }
    };

    initializeMedia();
  }, [getUserMedia]);

  // Auto-hide control bar
  const showControls = () => {
    setControlsVisible(true);
    clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      if (!showSettings) {
        setControlsVisible(false);
      }
    }, 3000);
  };

  const resetControlsTimer = () => {
    clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      if (!showSettings) {
        setControlsVisible(false);
      }
    }, 3000);
  };

  useEffect(() => {
    const handleMouseMove = () => showControls();
    const handleKeyPress = (e) => {
      // Keyboard shortcuts
      if (e.key === 'm' || e.key === 'M') {
        toggleAudio();
      } else if (e.key === 'v' || e.key === 'V') {
        toggleVideo();
      } else if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyPress);
      clearTimeout(hideTimeoutRef.current);
    };
  }, [toggleAudio, toggleVideo, isFullscreen]);

  // Fullscreen functionality
  const enterFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Bạn có chắc muốn rời khỏi phòng?')) {
      leaveRoom();
      if (onLeave) onLeave();
    }
  };

  // Get participant name
  const getParticipantName = (participantId) => {
    const participant = participants.find(p => p.id === participantId);
    return participant?.name || `Người dùng ${participantId.slice(-4)}`;
  };

  if (!isInitialized) {
    return (
      <div className="meet-loading">
        <div className="spinner"></div>
        <p>Đang khởi tạo camera & micro...</p>
        {error && (
          <div className="error-message">
            <p>Lỗi: {error}</p>
            <button onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`meet-container ${isFullscreen ? 'fullscreen' : ''}`} 
      ref={containerRef}
      onMouseMove={showControls}
    >
      {/* Header */}
      <header className={`meet-header ${controlsVisible ? 'visible' : ''}`}>
        <div className="header-left">
          <span className="room-info">
            <strong>Phòng: {roomId}</strong>
          </span>
        </div>
        <div className="header-right">
          <span className="connection-info">
            <span className={`status-indicator ${connectionStatus}`}></span>
            {connectionStatus === 'connected' ? 'Đã kết nối' : 'Đang kết nối...'}
            <UserOutlined style={{ margin: '0 4px' }} />
            {participants.length}
          </span>
          <button 
            className="btn-icon"
            onClick={isFullscreen ? exitFullscreen : enterFullscreen}
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
          >
            <ExpandOutlined />
          </button>
        </div>
      </header>

      {/* Video Grid */}
      <main className="video-grid">
        {/* Local Video */}
        <div className="video-tile local-video">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{ transform: 'scaleX(-1)' }}
            className={!isVideoEnabled ? 'video-disabled' : ''}
          />
          {!isVideoEnabled && (
            <div className="video-placeholder">
              <UserOutlined style={{ fontSize: '48px' }} />
            </div>
          )}
          <div className="name-tag">
            <span>{userName || 'Bạn'}</span>
            {!isAudioEnabled && <AudioMutedOutlined style={{ marginLeft: '4px' }} />}
            {isTeacher && <span className="teacher-badge">Giáo viên</span>}
          </div>
          <div className="video-controls">
            {isScreenSharing && <span className="sharing-indicator">Đang chia sẻ</span>}
          </div>
        </div>

        {/* Remote Videos */}
        {Array.from(remoteStreams.entries()).map(([id, stream]) => {
          const participant = participants.find(p => p.id === id);
          return (
            <div className="video-tile remote-video" key={id}>
              <video
                autoPlay
                playsInline
                ref={(el) => {
                  if (el && el.srcObject !== stream) {
                    el.srcObject = stream;
                  }
                }}
              />
              <div className="name-tag">
                <span>{getParticipantName(id)}</span>
                {participant?.isTeacher && <span className="teacher-badge">Giáo viên</span>}
              </div>
            </div>
          );
        })}

        {/* Empty state when no remote participants */}
        {remoteStreams.size === 0 && (
          <div className="empty-state">
            <UserOutlined style={{ fontSize: '64px', opacity: 0.3 }} />
            <p>Đang chờ người khác tham gia...</p>
          </div>
        )}
      </main>

      {/* Control Bar */}
      <footer className={`control-bar ${controlsVisible ? 'visible' : ''}`}>
        <div className="controls-left">
          <div className="meeting-info">
            <span>{new Date().toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</span>
          </div>
        </div>

        <div className="controls-center">
          <button
            className={`btn control-btn ${!isAudioEnabled ? 'off' : ''}`}
            onClick={toggleAudio}
            title={isAudioEnabled ? 'Tắt mic (M)' : 'Bật mic (M)'}
          >
            {isAudioEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
          </button>

          <button
            className={`btn control-btn ${!isVideoEnabled ? 'off' : ''}`}
            onClick={toggleVideo}
            title={isVideoEnabled ? 'Tắt camera (V)' : 'Bật camera (V)'}
          >
            {isVideoEnabled ? <VideoCameraOutlined /> : <EyeInvisibleOutlined />}
          </button>

          <button
            className={`btn control-btn ${isScreenSharing ? 'active' : ''}`}
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            title="Chia sẻ màn hình"
            disabled={!isTeacher && !isScreenSharing} // Chỉ giáo viên mới được chia sẻ
          >
            <DesktopOutlined />
          </button>

          <button 
            className="btn control-btn leave-btn" 
            onClick={handleLeaveRoom} 
            title="Rời phòng"
          >
            <PhoneOutlined />
          </button>
        </div>

        <div className="controls-right">
          <button
            className={`btn control-btn ${showSettings ? 'active' : ''}`}
            onClick={() => {
              setShowSettings(!showSettings);
              resetControlsTimer();
            }}
            title="Cài đặt"
          >
            <SettingOutlined />
          </button>
        </div>
      </footer>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <h3>Cài đặt</h3>
          <div className="setting-item">
            <label>
              <input 
                type="checkbox" 
                checked={isAudioEnabled} 
                onChange={toggleAudio}
              />
              Bật micro
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input 
                type="checkbox" 
                checked={isVideoEnabled} 
                onChange={toggleVideo}
              />
              Bật camera
            </label>
          </div>
          <div className="setting-item">
            <p><strong>Phím tắt:</strong></p>
            <p>M - Bật/tắt micro</p>
            <p>V - Bật/tắt camera</p>
            <p>ESC - Thoát toàn màn hình</p>
          </div>
          <button 
            className="btn close-settings"
            onClick={() => setShowSettings(false)}
          >
            Đóng
          </button>
        </div>
      )}

      {/* Connection Status */}
      {connectionStatus === 'connecting' && (
        <div className="connection-overlay">
          <div className="spinner small"></div>
          <span>Đang kết nối...</span>
        </div>
      )}

      {connectionStatus === 'failed' && (
        <div className="connection-overlay error">
          <span>Kết nối thất bại</span>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      )}
    </div>
  );
};

export default VideoConference;