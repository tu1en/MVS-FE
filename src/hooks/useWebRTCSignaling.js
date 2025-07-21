import { useCallback, useEffect, useRef, useState } from 'react';
import signalingService from '../services/signalingService';

/**
 * Custom hook quản lý WebRTC với signaling thật (STOMP WebSocket)
 * Thay thế hoàn toàn mock signaling
 */
const useWebRTCSignaling = (options = {}) => {
  const {
    roomId,
    userId,
    userName,
    isTeacher = false,
    stunServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
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
  const localVideoRef = useRef(null);
  const peersRef = useRef(new Map());
  const localStreamRef = useRef(null);

  // WebRTC configuration
  const rtcConfig = {
    iceServers: stunServers
  };

  /**
   * Initialize signaling service
   */
  const initializeSignaling = useCallback(async () => {
    if (!roomId || !userId) {
      console.warn('⚠️ Missing roomId or userId for signaling');
      return;
    }

    try {
      setConnectionStatus('connecting');
      
      // Setup event handlers
      signalingService.onConnected = () => {
        console.log('✅ Signaling connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
      };

      signalingService.onDisconnected = () => {
        console.log('🔌 Signaling disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');
      };

      signalingService.onError = (err) => {
        console.error('❌ Signaling error:', err);
        setError(err.message || 'Signaling connection error');
        setConnectionStatus('error');
      };

      signalingService.onSignalReceived = (data) => {
        handleSignalReceived(data);
      };

      signalingService.onUserJoined = (user) => {
        console.log('👥 User joined room:', user);
        setParticipants(prev => {
          const existing = prev.find(p => p.id === user.id);
          if (!existing) {
            return [...prev, user];
          }
          return prev;
        });

        // If we're the teacher or initiator, create offer for new user
        if (isTeacher && user.id !== userId && localStreamRef.current) {
          createPeerConnection(user.id, true);
        }
      };

      signalingService.onUserLeft = (user) => {
        console.log('👋 User left room:', user);
        setParticipants(prev => prev.filter(p => p.id !== user.id));
        removePeerConnection(user.id);
      };

      // Connect to signaling server
      await signalingService.connect(roomId, userId, {
        userName,
        isTeacher,
        serverUrl: 'http://localhost:8088/ws'
      });

    } catch (error) {
      console.error('❌ Failed to initialize signaling:', error);
      setError('Không thể kết nối signaling server');
      setConnectionStatus('error');
    }
  }, [roomId, userId, userName, isTeacher]);

  /**
   * Handle signaling messages
   */
  const handleSignalReceived = useCallback((data) => {
    console.log('📩 Handling signal:', data);

    switch (data.type) {
      case 'offer':
        handleOffer(data);
        break;
      case 'answer':
        handleAnswer(data);
        break;
      case 'candidate':
        handleIceCandidate(data);
        break;
      default:
        console.log('🤷 Unknown signal type:', data.type);
    }
  }, []);

  /**
   * Handle WebRTC offer
   */
  const handleOffer = useCallback(async (data) => {
    if (!localStreamRef.current) {
      console.warn('⚠️ No local stream for handling offer');
      return;
    }

    console.log('📞 Handling offer from:', data.senderId);

    try {
      const peer = createPeerConnection(data.senderId, false);
      
      // Set remote description
      await peer.setRemoteDescription({
        type: 'offer',
        sdp: data.sdp
      });

      // Create and send answer
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      signalingService.sendAnswer(answer, data.senderId);
      console.log('📞 Sent answer to:', data.senderId);

    } catch (error) {
      console.error('❌ Error handling offer:', error);
    }
  }, []);

  /**
   * Handle WebRTC answer
   */
  const handleAnswer = useCallback(async (data) => {
    console.log('📞 Handling answer from:', data.senderId);

    const peer = peersRef.current.get(data.senderId);
    if (!peer) {
      console.warn('⚠️ No peer found for answer from:', data.senderId);
      return;
    }

    try {
      await peer.setRemoteDescription({
        type: 'answer',
        sdp: data.sdp
      });
      console.log('✅ Set remote description for:', data.senderId);
    } catch (error) {
      console.error('❌ Error handling answer:', error);
    }
  }, []);

  /**
   * Handle ICE candidate
   */
  const handleIceCandidate = useCallback(async (data) => {
    console.log('🧊 Handling ICE candidate from:', data.senderId);

    const peer = peersRef.current.get(data.senderId);
    if (!peer) {
      console.warn('⚠️ No peer found for ICE candidate from:', data.senderId);
      return;
    }

    try {
      await peer.addIceCandidate(new RTCIceCandidate({
        candidate: data.candidate.candidate,
        sdpMid: data.candidate.sdpMid,
        sdpMLineIndex: data.candidate.sdpMLineIndex
      }));
      console.log('✅ Added ICE candidate for:', data.senderId);
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error);
    }
  }, []);

  /**
   * Create peer connection
   */
  const createPeerConnection = useCallback((targetUserId, isInitiator = false) => {
    console.log(`🔗 Creating peer connection to ${targetUserId}, initiator: ${isInitiator}`);

    if (peersRef.current.has(targetUserId)) {
      console.log('⚠️ Peer connection already exists for:', targetUserId);
      return peersRef.current.get(targetUserId);
    }

    try {
      const peer = new RTCPeerConnection(rtcConfig);

      // Add local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          peer.addTrack(track, localStreamRef.current);
        });
      }

      // Handle ICE candidates
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 Sending ICE candidate to:', targetUserId);
          signalingService.sendIceCandidate(event.candidate, targetUserId);
        }
      };

      // Handle remote stream
      peer.ontrack = (event) => {
        console.log('📺 Received remote stream from:', targetUserId);
        const [stream] = event.streams;
        setRemoteStreams(prev => new Map(prev.set(targetUserId, stream)));
      };

      // Handle connection state changes
      peer.onconnectionstatechange = () => {
        console.log(`🔗 Connection state changed for ${targetUserId}:`, peer.connectionState);
        if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
          removePeerConnection(targetUserId);
        }
      };

      // Store peer
      peersRef.current.set(targetUserId, peer);
      setPeers(new Map(peersRef.current));

      // Create offer if initiator
      if (isInitiator) {
        peer.createOffer()
          .then(offer => peer.setLocalDescription(offer))
          .then(() => {
            console.log('📞 Sending offer to:', targetUserId);
            signalingService.sendOffer(peer.localDescription, targetUserId);
          })
          .catch(error => {
            console.error('❌ Error creating offer:', error);
          });
      }

      return peer;

    } catch (error) {
      console.error('❌ Error creating peer connection:', error);
      return null;
    }
  }, [rtcConfig]);

  /**
   * Remove peer connection
   */
  const removePeerConnection = useCallback((targetUserId) => {
    console.log('🗑️ Removing peer connection for:', targetUserId);

    const peer = peersRef.current.get(targetUserId);
    if (peer) {
      peer.close();
      peersRef.current.delete(targetUserId);
      setPeers(new Map(peersRef.current));
    }

    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(targetUserId);
      return newMap;
    });
  }, []);

  /**
   * Get user media
   */
  const getUserMedia = useCallback(async (constraints = { video: true, audio: true }) => {
    try {
      console.log('📹 Getting user media...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setLocalStream(stream);
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log('✅ Got user media');
      return stream;
    } catch (err) {
      console.error('❌ Failed to get user media:', err);
      setError('Không thể truy cập camera/microphone');
      throw err;
    }
  }, []);

  /**
   * Toggle audio
   */
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        console.log('🎤 Audio toggled:', audioTrack.enabled);
      }
    }
  }, []);

  /**
   * Toggle video
   */
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        console.log('📹 Video toggled:', videoTrack.enabled);
      }
    }
  }, []);

  /**
   * Start screen sharing
   */
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace video track in all peer connections
      const videoTrack = screenStream.getVideoTracks()[0];
      peersRef.current.forEach((peer, userId) => {
        const sender = peer.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Update local stream
      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (oldVideoTrack) {
        localStreamRef.current.removeTrack(oldVideoTrack);
        oldVideoTrack.stop();
      }
      localStreamRef.current.addTrack(videoTrack);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      setIsScreenSharing(true);
      console.log('🖥️ Screen sharing started');

      // Handle screen share end
      videoTrack.onended = () => {
        setIsScreenSharing(false);
        console.log('🖥️ Screen sharing ended');
        // TODO: Switch back to camera
      };

    } catch (error) {
      console.error('❌ Error starting screen share:', error);
      setError('Không thể chia sẻ màn hình');
    }
  }, []);

  /**
   * Stop screen sharing
   */
  const stopScreenShare = useCallback(() => {
    // TODO: Switch back to camera
    setIsScreenSharing(false);
    console.log('🖥️ Screen sharing stopped');
  }, []);

  /**
   * Leave room
   */
  const leaveRoom = useCallback(() => {
    console.log('👋 Leaving room...');
    
    // Close all peer connections
    peersRef.current.forEach((peer, userId) => {
      peer.close();
    });
    peersRef.current.clear();
    setPeers(new Map());
    setRemoteStreams(new Map());

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // Disconnect signaling
    signalingService.disconnect();
    setIsConnected(false);
    setConnectionStatus('disconnected');
    
    console.log('✅ Left room');
  }, []);

  // Initialize when roomId and userId are available
  useEffect(() => {
    if (roomId && userId) {
      initializeSignaling();
    }

    return () => {
      leaveRoom();
    };
  }, [roomId, userId]);

  return {
    // Stream states
    localStream,
    remoteStreams,
    localVideoRef,
    
    // Connection states
    isConnected,
    connectionStatus,
    error,
    participants,
    
    // Media states
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    
    // Methods
    getUserMedia,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    leaveRoom,
    
    // Peer management
    peers,
    createPeerConnection,
    removePeerConnection
  };
};

export default useWebRTCSignaling;
