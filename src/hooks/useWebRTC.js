import { useCallback, useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';

/**
 * Custom hook để quản lý WebRTC connections và signaling
 * @param {Object} options - Cấu hình cho WebRTC connection
 * @returns {Object} WebRTC state và methods
 */
const useWebRTC = (options = {}) => {
  const {
    roomId,
    userId,
    userName,
    isInitiator = false,
    stunServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ],
    turnServers = []
  } = options;

  // State management
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [peers, setPeers] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);

  // Refs
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const peersRef = useRef(new Map());

  // WebRTC configuration
  const rtcConfig = {
    iceServers: [...stunServers, ...turnServers]
  };

  /**
   * Khởi tạo socket connection
   */
  const initializeSocket = useCallback(() => {
    if (!roomId || !userId) return;

    try {
      // Kết nối đến signaling server qua WebSocket thuần
      const wsUrl = process.env.REACT_APP_SIGNALING_SERVER || 'ws://localhost:8088/signaling';
      socketRef.current = new WebSocket(wsUrl);

      const socket = socketRef.current;

      // WebSocket event handlers
      socket.onopen = () => {
        console.log('Connected to signaling server');
        setConnectionStatus('connected');

        // Send join room message
        const joinMessage = {
          type: 'join-room',
          roomId,
          user: { id: userId, name: userName || 'User' }
        };
        socket.send(JSON.stringify(joinMessage));
      };

      socket.onclose = () => {
        console.log('Disconnected from signaling server');
        setConnectionStatus('disconnected');
        setIsConnected(false);
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received message:', message);

          switch (message.type) {
            case 'user-joined':
              console.log('User joined:', message.user?.id);
              if (message.participants) {
                setParticipants(message.participants);
              }

              if (isInitiator && message.user?.id !== userId) {
                createPeerConnection(message.user.id, true);
              }
              break;

            case 'user-left':
              console.log('User left:', message.user?.id);
              if (message.participants) {
                setParticipants(message.participants);
              }
              if (message.user?.id) {
                removePeerConnection(message.user.id);
              }
              break;

            case 'offer':
              console.log('Received offer from:', message.from || message.userId);
              handleOffer(message.offer || message.data, message.from || message.userId);
              break;

            case 'answer':
              console.log('Received answer from:', message.from || message.userId);
              handleAnswer(message.answer || message.data, message.from || message.userId);
              break;

            case 'ice-candidate':
            case 'candidate':
              console.log('Received ICE candidate from:', message.from || message.userId);
              handleIceCandidate(message.candidate || message.data, message.from || message.userId);
              break;

            case 'room-info':
              if (message.participants) {
                setParticipants(message.participants);
              }
              break;

            case 'error':
              console.error('Socket error:', message.error);
              setError(message.error || 'Connection error');
              break;

            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
      };

    } catch (err) {
      console.error('Failed to initialize socket:', err);
      setError('Không thể kết nối đến server');
    }
  }, [roomId, userId, isInitiator]);

  /**
   * Lấy user media (camera và microphone)
   */
  const getUserMedia = useCallback(async (constraints = { video: true, audio: true }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      console.error('Failed to get user media:', err);
      setError('Không thể truy cập camera/microphone');
      throw err;
    }
  }, []);

  /**
   * Tạo peer connection
   */
  const createPeerConnection = useCallback((targetUserId, initiator = false) => {
    if (!localStream) {
      console.warn('No local stream available for peer connection');
      return;
    }

    try {
      const peer = new Peer({
        initiator,
        trickle: false,
        stream: localStream,
        config: rtcConfig
      });

      // Peer event handlers
      peer.on('signal', (data) => {
        console.log('Sending signal to:', targetUserId);
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          const message = {
            type: data.type === 'offer' ? 'offer' : data.type === 'answer' ? 'answer' : 'ice-candidate',
            roomId,
            userId,
            to: targetUserId,
            [data.type === 'offer' ? 'offer' : data.type === 'answer' ? 'answer' : 'candidate']: data
          };
          socketRef.current.send(JSON.stringify(message));
        }
      });

      peer.on('stream', (remoteStream) => {
        console.log('Received remote stream from:', targetUserId);
        setRemoteStreams(prev => new Map(prev.set(targetUserId, remoteStream)));
      });

      peer.on('connect', () => {
        console.log('Peer connected:', targetUserId);
        setIsConnected(true);
      });

      peer.on('close', () => {
        console.log('Peer connection closed:', targetUserId);
        removePeerConnection(targetUserId);
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        setError(`Connection error with ${targetUserId}`);
      });

      // Store peer reference
      peersRef.current.set(targetUserId, peer);
      setPeers(new Map(peersRef.current));

    } catch (err) {
      console.error('Failed to create peer connection:', err);
      setError('Không thể tạo kết nối');
    }
  }, [localStream, rtcConfig]);

  /**
   * Xử lý offer từ remote peer
   */
  const handleOffer = useCallback((offer, from) => {
    const peer = peersRef.current.get(from);
    if (peer) {
      peer.signal(offer);
    } else {
      createPeerConnection(from, false);
      // Wait for peer to be created then signal
      setTimeout(() => {
        const newPeer = peersRef.current.get(from);
        if (newPeer) {
          newPeer.signal(offer);
        }
      }, 100);
    }
  }, [createPeerConnection]);

  /**
   * Xử lý answer từ remote peer
   */
  const handleAnswer = useCallback((answer, from) => {
    const peer = peersRef.current.get(from);
    if (peer) {
      peer.signal(answer);
    }
  }, []);

  /**
   * Xử lý ICE candidate
   */
  const handleIceCandidate = useCallback((candidate, from) => {
    const peer = peersRef.current.get(from);
    if (peer) {
      peer.signal(candidate);
    }
  }, []);

  /**
   * Xóa peer connection
   */
  const removePeerConnection = useCallback((userId) => {
    const peer = peersRef.current.get(userId);
    if (peer) {
      peer.destroy();
      peersRef.current.delete(userId);
      setPeers(new Map(peersRef.current));
    }
    
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  }, []);

  /**
   * Toggle audio
   */
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  /**
   * Toggle video
   */
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  /**
   * Bắt đầu screen sharing
   */
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace video track in all peer connections
      const videoTrack = screenStream.getVideoTracks()[0];
      peersRef.current.forEach((peer) => {
        const sender = peer._pc?.getSenders?.().find(s =>
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Update local stream
      if (localStream) {
        const oldVideoTrack = localStream.getVideoTracks()[0];
        if (oldVideoTrack) {
          localStream.removeTrack(oldVideoTrack);
          oldVideoTrack.stop();
        }
        localStream.addTrack(videoTrack);
      }

      setIsScreenSharing(true);

      // Handle screen share end
      videoTrack.onended = () => {
        stopScreenShare();
      };

    } catch (err) {
      console.error('Failed to start screen share:', err);
      setError('Không thể chia sẻ màn hình');
    }
  }, [localStream]);

  /**
   * Dừng screen sharing
   */
  const stopScreenShare = useCallback(async () => {
    try {
      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      const videoTrack = cameraStream.getVideoTracks()[0];

      // Replace screen share track with camera track
      peersRef.current.forEach((peer) => {
        const sender = peer._pc?.getSenders?.().find(s =>
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Update local stream
      if (localStream) {
        const oldVideoTrack = localStream.getVideoTracks()[0];
        if (oldVideoTrack) {
          localStream.removeTrack(oldVideoTrack);
          oldVideoTrack.stop();
        }
        localStream.addTrack(videoTrack);
      }

      setIsScreenSharing(false);

    } catch (err) {
      console.error('Failed to stop screen share:', err);
      setError('Không thể dừng chia sẻ màn hình');
    }
  }, [localStream]);

  /**
   * Rời khỏi room
   */
  const leaveRoom = useCallback(() => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Close all peer connections
    peersRef.current.forEach((peer) => {
      peer.destroy();
    });
    peersRef.current.clear();
    setPeers(new Map());
    setRemoteStreams(new Map());

    // Disconnect socket
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const leaveMessage = {
        type: 'leave-room',
        roomId,
        userId
      };
      socketRef.current.send(JSON.stringify(leaveMessage));
      socketRef.current.close();
      socketRef.current = null;
    }

    // Reset state
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setParticipants([]);
    setError(null);
  }, [localStream, roomId, userId]);

  // Initialize when roomId and userId are available
  useEffect(() => {
    if (roomId && userId) {
      initializeSocket();
    }

    return () => {
      leaveRoom();
    };
  }, [roomId, userId, initializeSocket, leaveRoom]);

  return {
    // State
    localStream,
    remoteStreams,
    peers,
    isConnected,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    connectionStatus,
    error,
    participants,

    // Refs
    localVideoRef,

    // Methods
    getUserMedia,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    leaveRoom,
    createPeerConnection
  };
};

export default useWebRTC;
