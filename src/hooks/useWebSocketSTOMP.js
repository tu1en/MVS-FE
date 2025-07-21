import { Client } from '@stomp/stompjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';

/**
 * Custom hook for STOMP WebSocket connection
 * Compatible with browser environment
 */
export const useWebSocketSTOMP = (roomId, options = {}) => {
  const {
    serverUrl = 'http://localhost:8088/ws', // Updated to correct port
    reconnectDelay = 5000,
    debug = false,
    onConnect,
    onDisconnect,
    onError
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState(null);

  const clientRef = useRef(null);
  const subscriptionsRef = useRef(new Map());

  // Initialize STOMP client
  const initializeClient = useCallback(() => {
    if (clientRef.current) {
      return;
    }

    try {
      const socket = new SockJS(serverUrl);
      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay,
        debug: debug ? (msg) => console.log('🔌 STOMP:', msg) : undefined,
      });

      client.onConnect = (frame) => {
        console.log('✅ STOMP Connected to room:', roomId);
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Subscribe to room topics
        subscribeToRoomTopics(client);
        
        if (onConnect) {
          onConnect(frame);
        }
      };

      client.onDisconnect = (frame) => {
        console.log('🔌 STOMP Disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        if (onDisconnect) {
          onDisconnect(frame);
        }
      };

      client.onStompError = (frame) => {
        console.error('❌ STOMP Error:', frame.headers['message']);
        setConnectionStatus('error');
        
        if (onError) {
          onError(frame);
        }
      };

      client.onWebSocketClose = () => {
        console.log('🔌 WebSocket connection closed');
        setIsConnected(false);
        setConnectionStatus('disconnected');
      };

      clientRef.current = client;
      setConnectionStatus('connecting');
      client.activate();

    } catch (error) {
      console.error('❌ Failed to initialize STOMP client:', error);
      setConnectionStatus('error');
      if (onError) {
        onError(error);
      }
    }
  }, [serverUrl, roomId, reconnectDelay, debug, onConnect, onDisconnect, onError]);

  // Subscribe to room topics
  const subscribeToRoomTopics = useCallback((client) => {
    if (!roomId || !client) return;

    const topics = [
      `/topic/room/${roomId}`,
      `/topic/room/${roomId}/join`,
      `/topic/room/${roomId}/leave`
    ];

    topics.forEach(topic => {
      const subscription = client.subscribe(topic, (message) => {
        try {
          const data = JSON.parse(message.body);
          setLastMessage({ topic, data, timestamp: Date.now() });
          console.log(`📩 Received from ${topic}:`, data);
        } catch (error) {
          console.error('❌ Error parsing message:', error);
        }
      });

      subscriptionsRef.current.set(topic, subscription);
    });
  }, [roomId]);

  // Send message to specific destination
  const sendMessage = useCallback((destination, message) => {
    if (!clientRef.current || !clientRef.current.connected) {
      console.warn('⚠️ STOMP client not connected, cannot send message');
      return false;
    }

    try {
      const messageBody = typeof message === 'string' ? message : JSON.stringify(message);
      clientRef.current.publish({
        destination,
        body: messageBody
      });
      console.log(`📤 Sent to ${destination}:`, message);
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return false;
    }
  }, []);

  // Send signaling message
  const sendSignal = useCallback((message) => {
    return sendMessage(`/app/signal/${roomId}`, message);
  }, [roomId, sendMessage]);

  // Send join room message
  const joinRoom = useCallback((userInfo) => {
    return sendMessage(`/app/join/${roomId}`, userInfo);
  }, [roomId, sendMessage]);

  // Send leave room message
  const leaveRoom = useCallback((userInfo) => {
    return sendMessage(`/app/leave/${roomId}`, userInfo);
  }, [roomId, sendMessage]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      // Unsubscribe from all topics
      subscriptionsRef.current.forEach(subscription => {
        subscription.unsubscribe();
      });
      subscriptionsRef.current.clear();

      // Deactivate client
      clientRef.current.deactivate();
      clientRef.current = null;
      setIsConnected(false);
      setConnectionStatus('disconnected');
      console.log('🔌 STOMP client disconnected');
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (roomId) {
      initializeClient();
    }

    return () => {
      disconnect();
    };
  }, [roomId, initializeClient, disconnect]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    sendMessage,
    sendSignal,
    joinRoom,
    leaveRoom,
    disconnect,
    client: clientRef.current
  };
};
