import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * Service để xử lý WebRTC signaling qua STOMP WebSocket
 * Thay thế hoàn toàn mock signaling
 */
class SignalingService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.roomId = null;
    this.userId = null;
    this.subscriptions = new Map();
    
    // Event handlers
    this.onSignalReceived = null;
    this.onUserJoined = null;
    this.onUserLeft = null;
    this.onConnected = null;
    this.onDisconnected = null;
    this.onError = null;
  }

  /**
   * Kết nối đến STOMP signaling server
   */
  connect(roomId, userId, options = {}) {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        console.log('✅ Already connected to signaling server');
        resolve();
        return;
      }

      this.roomId = roomId;
      this.userId = userId;

      const serverUrl = options.serverUrl || 'http://localhost:8088/ws';
      
      console.log(`🔌 Connecting to signaling server: ${serverUrl}`);
      console.log(`📍 Room: ${roomId}, User: ${userId}`);

      try {
        // Tạo SockJS connection
        const socket = new SockJS(serverUrl);
        
        // Tạo STOMP client
        this.client = new Client({
          webSocketFactory: () => socket,
          reconnectDelay: 5000,
          debug: (msg) => console.log('🔌 STOMP Debug:', msg),
        });

        // Connection handlers
        this.client.onConnect = (frame) => {
          console.log('✅ Connected to signaling server');
          this.connected = true;
          
          // Subscribe to room signaling
          this.subscribeToRoom();
          
          // Send join message
          this.joinRoom({
            id: userId,
            name: options.userName || `User-${userId}`,
            isTeacher: options.isTeacher || false
          });

          if (this.onConnected) {
            this.onConnected(frame);
          }
          
          resolve();
        };

        this.client.onDisconnect = (frame) => {
          console.log('🔌 Disconnected from signaling server');
          this.connected = false;
          this.unsubscribeAll();
          
          if (this.onDisconnected) {
            this.onDisconnected(frame);
          }
        };

        this.client.onStompError = (frame) => {
          console.error('❌ STOMP Error:', frame.headers['message']);
          this.connected = false;
          
          if (this.onError) {
            this.onError(new Error(frame.headers['message']));
          }
          
          reject(new Error(frame.headers['message']));
        };

        this.client.onWebSocketClose = (event) => {
          console.log('🔌 WebSocket connection closed');
          this.connected = false;
        };

        // Activate connection
        this.client.activate();

      } catch (error) {
        console.error('❌ Failed to connect to signaling server:', error);
        reject(error);
      }
    });
  }

  /**
   * Subscribe đến room signaling
   */
  subscribeToRoom() {
    if (!this.client || !this.connected || !this.roomId) {
      console.warn('⚠️ Cannot subscribe: not connected or no room ID');
      return;
    }

    // Subscribe to room-wide messages
    const roomTopic = `/topic/room-${this.roomId}`;
    const roomSubscription = this.client.subscribe(roomTopic, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log(`📩 Received from ${roomTopic}:`, data);
        this.handleMessage(data);
      } catch (error) {
        console.error('❌ Error parsing room message:', error);
      }
    });

    this.subscriptions.set('room', roomSubscription);
    console.log(`📡 Subscribed to room: ${roomTopic}`);

    // Subscribe to user-specific messages
    const userTopic = `/topic/room-${this.roomId}/user-${this.userId}`;
    const userSubscription = this.client.subscribe(userTopic, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log(`📩 Received from ${userTopic}:`, data);
        this.handleMessage(data);
      } catch (error) {
        console.error('❌ Error parsing user message:', error);
      }
    });

    this.subscriptions.set('user', userSubscription);
    console.log(`📡 Subscribed to user: ${userTopic}`);
  }

  /**
   * Xử lý message nhận được
   */
  handleMessage(data) {
    switch (data.type) {
      case 'offer':
      case 'answer':
      case 'candidate':
        if (this.onSignalReceived) {
          this.onSignalReceived(data);
        }
        break;

      case 'user-joined':
        console.log('👥 User joined:', data.user);
        if (this.onUserJoined) {
          this.onUserJoined(data.user);
        }
        break;

      case 'user-left':
        console.log('👋 User left:', data.user);
        if (this.onUserLeft) {
          this.onUserLeft(data.user);
        }
        break;

      default:
        console.log('📝 Received unknown message type:', data.type);
    }
  }

  /**
   * Gửi WebRTC offer
   */
  sendOffer(offer, targetUserId = null) {
    const message = {
      type: 'offer',
      roomId: this.roomId,
      senderId: this.userId,
      targetId: targetUserId,
      sdp: offer.sdp
    };

    return this.sendSignal(message);
  }

  /**
   * Gửi WebRTC answer
   */
  sendAnswer(answer, targetUserId) {
    const message = {
      type: 'answer',
      roomId: this.roomId,
      senderId: this.userId,
      targetId: targetUserId,
      sdp: answer.sdp
    };

    return this.sendSignal(message);
  }

  /**
   * Gửi ICE candidate
   */
  sendIceCandidate(candidate, targetUserId) {
    const message = {
      type: 'candidate',
      roomId: this.roomId,
      senderId: this.userId,
      targetId: targetUserId,
      candidate: {
        candidate: candidate.candidate,
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex
      }
    };

    return this.sendSignal(message);
  }

  /**
   * Gửi signal message
   */
  sendSignal(message) {
    if (!this.client || !this.connected) {
      console.warn('⚠️ Cannot send signal: not connected to server');
      return false;
    }

    try {
      const destination = `/app/room/${this.roomId}/signal`;
      this.client.publish({
        destination,
        body: JSON.stringify(message)
      });
      
      console.log(`📤 Sent signal to ${destination}:`, message);
      return true;
    } catch (error) {
      console.error('❌ Error sending signal:', error);
      return false;
    }
  }

  /**
   * Join room
   */
  joinRoom(userInfo) {
    if (!this.client || !this.connected) {
      console.warn('⚠️ Cannot join room: not connected to server');
      return false;
    }

    try {
      const message = {
        type: 'join',
        roomId: this.roomId,
        senderId: this.userId,
        user: userInfo
      };

      const destination = `/app/room/${this.roomId}/join`;
      this.client.publish({
        destination,
        body: JSON.stringify(message)
      });
      
      console.log(`📤 Sent join to ${destination}:`, message);
      return true;
    } catch (error) {
      console.error('❌ Error joining room:', error);
      return false;
    }
  }

  /**
   * Leave room
   */
  leaveRoom() {
    if (!this.client || !this.connected) {
      return;
    }

    try {
      const message = {
        type: 'leave',
        roomId: this.roomId,
        senderId: this.userId,
        user: { id: this.userId }
      };

      const destination = `/app/room/${this.roomId}/leave`;
      this.client.publish({
        destination,
        body: JSON.stringify(message)
      });
      
      console.log(`📤 Sent leave to ${destination}:`, message);
    } catch (error) {
      console.error('❌ Error leaving room:', error);
    }
  }

  /**
   * Unsubscribe from all topics
   */
  unsubscribeAll() {
    this.subscriptions.forEach((subscription, key) => {
      try {
        subscription.unsubscribe();
        console.log(`📡 Unsubscribed from: ${key}`);
      } catch (error) {
        console.error(`❌ Error unsubscribing from ${key}:`, error);
      }
    });
    this.subscriptions.clear();
  }

  /**
   * Disconnect từ signaling server
   */
  disconnect() {
    if (this.client) {
      this.leaveRoom();
      this.unsubscribeAll();
      
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      
      console.log('🔌 Disconnected from signaling server');
    }
  }

  /**
   * Check connection status
   */
  isConnected() {
    return this.connected && this.client && this.client.connected;
  }
}

// Export singleton instance
const signalingService = new SignalingService();
export default signalingService;
