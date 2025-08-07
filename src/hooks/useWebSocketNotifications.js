// File: src/hooks/useWebSocketNotifications.js

import { useEffect, useRef, useState } from 'react';
import notificationWebSocket from '../services/NotificationWebSocketService';

/**
 * Custom hook for WebSocket notifications
 * @param {Object} options - Configuration options
 * @returns {Object} - WebSocket state and methods
 */
const useWebSocketNotifications = (options = {}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    
    const listenersRef = useRef({});
    const optionsRef = useRef(options);

    // Update options ref
    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    // Setup event listeners
    useEffect(() => {
        // Connection status listeners
        const onConnected = () => {
            setIsConnected(true);
            setConnectionStatus('connected');
            console.log('✅ WebSocket connected via hook');
        };

        const onDisconnected = () => {
            setIsConnected(false);
            setConnectionStatus('disconnected');
            console.log('🔌 WebSocket disconnected via hook');
        };

        const onError = (error) => {
            setConnectionStatus('error');
            console.error('❌ WebSocket error via hook:', error);
        };

        // Notification listener
        const onNotification = (notification) => {
            console.log('📨 Received notification via hook:', notification);
            
            // Add to notifications list
            setNotifications(prev => [
                {
                    ...notification,
                    id: Date.now() + Math.random(),
                    timestamp: new Date()
                },
                ...prev.slice(0, 99) // Keep only 100 most recent
            ]);

            // Call custom handler if provided
            if (optionsRef.current.onNotification) {
                optionsRef.current.onNotification(notification);
            }
        };

        // ✅ FIX: Specific class event listeners
        const onClassCreated = (classData) => {
            console.log('🎓 Class created via hook:', classData);
            
            if (optionsRef.current.onClassCreated) {
                optionsRef.current.onClassCreated(classData);
            }
        };

        const onClassUpdated = (classData) => {
            console.log('📝 Class updated via hook:', classData);
            
            if (optionsRef.current.onClassUpdated) {
                optionsRef.current.onClassUpdated(classData);
            }
        };

        const onClassDeleted = (classData) => {
            console.log('🗑️ Class deleted via hook:', classData);
            
            if (optionsRef.current.onClassDeleted) {
                optionsRef.current.onClassDeleted(classData);
            }
        };

        // Register listeners
        notificationWebSocket.addEventListener('connected', onConnected);
        notificationWebSocket.addEventListener('disconnected', onDisconnected);
        notificationWebSocket.addEventListener('error', onError);
        notificationWebSocket.addEventListener('notification', onNotification);
        notificationWebSocket.addEventListener('class_created', onClassCreated);
        notificationWebSocket.addEventListener('class_updated', onClassUpdated);
        notificationWebSocket.addEventListener('class_deleted', onClassDeleted);

        // Store references for cleanup
        listenersRef.current = {
            onConnected,
            onDisconnected,
            onError,
            onNotification,
            onClassCreated,
            onClassUpdated,
            onClassDeleted
        };

        // Cleanup function
        return () => {
            Object.entries(listenersRef.current).forEach(([event, callback]) => {
                const eventName = event.replace('on', '').toLowerCase().replace('connected', 'connected');
                notificationWebSocket.removeEventListener(eventName, callback);
            });
        };
    }, []); // Empty dependency array since we use refs for options

    // Initialize connection status
    useEffect(() => {
        const status = notificationWebSocket.getStatus();
        setIsConnected(status.isConnected);
        setConnectionStatus(status.isConnected ? 'connected' : 'disconnected');
    }, []);

    // Methods
    const sendMessage = (message) => {
        notificationWebSocket.send(message);
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getConnectionInfo = () => {
        return notificationWebSocket.getStatus();
    };

    return {
        isConnected,
        connectionStatus,
        notifications,
        sendMessage,
        clearNotifications,
        removeNotification,
        getConnectionInfo
    };
};

export default useWebSocketNotifications;