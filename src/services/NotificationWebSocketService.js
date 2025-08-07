// File: src/services/notificationWebSocket.js

class NotificationWebSocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.listeners = new Map();
    }

    // ✅ FIX: Connect to notifications endpoint
    connect() {
        try {
            const wsUrl = process.env.NODE_ENV === 'production' 
                ? 'wss://your-domain.com/notifications'
                : 'ws://localhost:8088/notifications';

            console.log('Connecting to WebSocket:', wsUrl);
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = (event) => {
                console.log('✅ WebSocket connected successfully');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.notifyListeners('connected', { event });
            };

            this.socket.onmessage = (event) => {
                try {
                    const notification = JSON.parse(event.data);
                    console.log('📨 Received notification:', notification);
                    
                    // ✅ FIX: Handle notifications with full data
                    this.handleNotification(notification);
                } catch (error) {
                    console.error('❌ Error parsing notification:', error);
                }
            };

            this.socket.onclose = (event) => {
                console.log('🔌 WebSocket connection closed:', event.code, event.reason);
                this.isConnected = false;
                this.notifyListeners('disconnected', { event });
                
                // Auto-reconnect
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect();
                }
            };

            this.socket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.notifyListeners('error', { error });
            };

        } catch (error) {
            console.error('❌ Failed to create WebSocket connection:', error);
        }
    }

    // ✅ FIX: Handle different notification types with full data
    handleNotification(notification) {
        const { type, message, data } = notification;

        switch (type) {
            case 'CLASS_CREATED':
                console.log('🎓 Class created:', data);
                this.notifyListeners('class_created', data);
                this.showToast('success', message);
                break;

            case 'CLASS_UPDATED':
                console.log('📝 Class updated:', data);
                this.notifyListeners('class_updated', data);
                this.showToast('info', message);
                break;

            case 'CLASS_DELETED':
                console.log('🗑️ Class deleted:', data);
                this.notifyListeners('class_deleted', data);
                this.showToast('warning', message);
                break;

            default:
                console.log('📢 General notification:', { type, message, data });
                this.notifyListeners('general', { type, message, data });
                this.showToast('info', message);
        }

        // Notify all listeners
        this.notifyListeners('notification', notification);
    }

    // Register event listeners
    addEventListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    // Remove event listeners
    removeEventListener(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    // Notify all listeners for an event
    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('❌ Error in event listener:', error);
                }
            });
        }
    }

    // Show toast notification
    showToast(type, message) {
        // Integrate with your toast library (react-toastify, etc.)
        console.log(`🍞 Toast [${type}]:`, message);
        
        // Example with react-toastify
        if (window.toast) {
            window.toast[type](message);
        }
    }

    // Schedule reconnection
    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
        
        setTimeout(() => {
            console.log(`🔄 Reconnect attempt ${this.reconnectAttempts}`);
            this.connect();
        }, delay);
    }

    // Send message (if needed)
    send(message) {
        if (this.isConnected && this.socket) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.warn('⚠️ WebSocket not connected, cannot send message');
        }
    }

    // Disconnect
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Get connection status
    getStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            readyState: this.socket ? this.socket.readyState : WebSocket.CLOSED
        };
    }
}

// Create singleton instance
const notificationWebSocket = new NotificationWebSocketService();

// Auto-connect on import
if (typeof window !== 'undefined') {
    // Connect after a short delay to ensure DOM is ready
    setTimeout(() => {
        notificationWebSocket.connect();
    }, 1000);
}

export default notificationWebSocket;