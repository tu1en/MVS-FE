import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook for WebSocket connection
 * Handles connection, reconnection, and message sending
 */
export const useWebSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [readyState, setReadyState] = useState(WebSocket.CONNECTING);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  const optionsRef = useRef(options);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = options.maxReconnectAttempts || 5;
  const reconnectInterval = options.reconnectInterval || 3000;

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  /**
   * Create WebSocket connection
   */
  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = (event) => {
        console.log('WebSocket connected');
        setReadyState(WebSocket.OPEN);
        setConnectionAttempts(0);
        
        if (optionsRef.current.onOpen) {
          optionsRef.current.onOpen(event);
        }
      };

      ws.onmessage = (event) => {
        setLastMessage(event);
        
        // Dispatch custom event for components to listen
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('websocket-message', { detail: event }));
        }
        
        if (optionsRef.current.onMessage) {
          optionsRef.current.onMessage(event);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setReadyState(WebSocket.CLOSED);
        
        if (optionsRef.current.onClose) {
          optionsRef.current.onClose(event);
        }

        // Auto-reconnect if not manually closed
        if (event.code !== 1000 && connectionAttempts < maxReconnectAttempts) {
          console.log(`Reconnecting in ${reconnectInterval}ms... (attempt ${connectionAttempts + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setConnectionAttempts(prev => prev + 1);
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setReadyState(WebSocket.CLOSED);
        
        if (optionsRef.current.onError) {
          optionsRef.current.onError(error);
        }
      };

      setSocket(ws);
      
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setReadyState(WebSocket.CLOSED);
      
      if (optionsRef.current.onError) {
        optionsRef.current.onError(error);
      }
    }
  }, [url, connectionAttempts, maxReconnectAttempts, reconnectInterval]);

  /**
   * Send message through WebSocket
   */
  const sendMessage = useCallback((data) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        socket.send(message);
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    } else {
      console.warn('WebSocket is not connected');
      return false;
    }
  }, [socket]);

  /**
   * Close WebSocket connection
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socket) {
      socket.close(1000, 'Manual disconnect');
    }
  }, [socket]);

  /**
   * Manually trigger reconnection
   */
  const reconnect = useCallback(() => {
    disconnect();
    setConnectionAttempts(0);
    setTimeout(connect, 100);
  }, [disconnect, connect]);

  // Initialize connection
  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close(1000, 'Component unmount');
      }
    };
  }, [url]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket,
    sendMessage,
    lastMessage,
    readyState,
    disconnect,
    reconnect,
    connectionAttempts,
    isConnecting: readyState === WebSocket.CONNECTING,
    isOpen: readyState === WebSocket.OPEN,
    isClosed: readyState === WebSocket.CLOSED
  };
};