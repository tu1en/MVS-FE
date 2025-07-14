import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import UnifiedMessagingService from '../services/unifiedMessagingService';

/**
 * Unified messaging hook for both student and teacher interfaces
 * Manages messaging state and provides consistent API
 */
const useUnifiedMessaging = (userRole, userId) => {
  // State
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Refs for cleanup
  const isMountedRef = useRef(true);
  const refreshIntervalRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  /**
   * Load conversations for current user
   */
  const loadConversations = useCallback(async () => {
    if (!userId || !userRole) {
      console.log('❌ Cannot load conversations - missing userId or userRole:', { userId, userRole });
      return;
    }

    try {
      console.log('🔄 START loading conversations for:', { userRole, userId });
      setLoadingConversations(true);
      setError(null);

      const conversationsData = await UnifiedMessagingService.getConversations(userRole, userId);
      
      if (isMountedRef.current) {
        setConversations(conversationsData);
        console.log(`📨 Loaded ${conversationsData.length} conversations for ${userRole}:`, conversationsData);
        console.log('🎯 Conversations updated');
      }
    } catch (err) {
      console.error('❌ Error loading conversations:', err);
      if (isMountedRef.current) {
        setError('Không thể tải danh sách cuộc trò chuyện');
      }
    } finally {
      // Remove isMountedRef guard for loading state - React handles unmounted setState safely
      setLoadingConversations(false);
      console.log('🏁 loadConversations: LoadingConversations state set to FALSE');
    }
  }, [userRole, userId]);

  /**
   * Load messages for selected conversation
   */
  const loadMessages = useCallback(async (conversationId) => {
    if (!userId || !userRole || !conversationId) return;

    try {
      console.log('🔄 START loading messages for conversation:', conversationId);
      setLoadingMessages(true);
      setError(null);

      const messagesData = await UnifiedMessagingService.getMessages(userRole, userId, conversationId);
      
      if (isMountedRef.current) {
        setMessages(messagesData);
        console.log(`💬 Loaded ${messagesData.length} messages for conversation ${conversationId}`);
        
        // Mark messages as read
        const unreadMessages = messagesData.filter(msg => 
          !msg.isRead && msg.senderId?.toString() !== userId?.toString()
        );
        
        unreadMessages.forEach(msg => {
          UnifiedMessagingService.markAsRead(msg.id).catch(console.error);
        });
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      if (isMountedRef.current) {
        setError('Không thể tải tin nhắn');
      }
    } finally {
      // Remove isMountedRef guard for loading state - React handles unmounted setState safely
      setLoadingMessages(false);
      console.log('🏁 loadMessages: LoadingMessages state set to FALSE');
    }
  }, [userRole, userId]);

  /**
   * Load contacts for new message
   */
  const loadContacts = useCallback(async () => {
    if (!userId || !userRole) return;

    try {
      const contactsData = await UnifiedMessagingService.getContacts(userRole, userId);
      
      if (isMountedRef.current) {
        setContacts(contactsData);
        console.log(`👥 Loaded ${contactsData.length} contacts for ${userRole}`);
      }
    } catch (err) {
      console.error('Error loading contacts:', err);
    }
  }, [userRole, userId]);

  /**
   * Send a message in current conversation
   */
  const sendMessage = useCallback(async (conversationId, content) => {
    if (!userId || !userRole || !conversationId || !content.trim()) {
      throw new Error('Missing required parameters for sending message');
    }

    try {
      setSending(true);
      setError(null);

      const sentMessage = await UnifiedMessagingService.sendMessage(
        userRole, 
        userId, 
        conversationId, 
        content.trim()
      );

      if (isMountedRef.current) {
        // Add message to current messages
        setMessages(prev => [...prev, sentMessage]);
        
        // Update conversation list
        setConversations(prev => prev.map(conv => {
          const convId = conv.id || conv.studentId || conv.teacherId;
          if (convId === conversationId) {
            return {
              ...conv,
              lastMessage: content.trim(),
              lastMessageAt: sentMessage.createdAt || new Date().toISOString()
            };
          }
          return conv;
        }));

        console.log('✅ Message sent successfully');
      }

      return sentMessage;
    } catch (err) {
      console.error('Error sending message:', err);
      if (isMountedRef.current) {
        setError('Không thể gửi tin nhắn');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSending(false);
      }
    }
  }, [userRole, userId]);

  /**
   * Start a new conversation
   */
  const startNewConversation = useCallback(async (formData) => {
    if (!userId || !userRole) {
      throw new Error('User not authenticated');
    }

    try {
      setSending(true);
      setError(null);

      const sentMessage = await UnifiedMessagingService.sendMessage(
        userRole,
        userId,
        formData.recipientId,
        formData.content,
        formData.subject
      );

      if (isMountedRef.current) {
        // Reload conversations to include new one
        await loadConversations();
        
        // Select the new conversation
        setSelectedConversationId(formData.recipientId);
        
        console.log('✅ New conversation started');
      }

      return sentMessage;
    } catch (err) {
      console.error('Error starting new conversation:', err);
      if (isMountedRef.current) {
        setError('Không thể tạo cuộc trò chuyện mới');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSending(false);
      }
    }
  }, [userRole, userId, loadConversations]);

  /**
   * Select a conversation
   */
  const selectConversation = useCallback((conversationId, conversationData) => {
    setSelectedConversationId(conversationId);
    loadMessages(conversationId);
  }, [loadMessages]);

  /**
   * Refresh data
   */
  const refresh = useCallback(async () => {
    await loadConversations();
    if (selectedConversationId) {
      await loadMessages(selectedConversationId);
    }
  }, [loadConversations, loadMessages, selectedConversationId]);

  /**
   * Setup auto-refresh
   */
  const setupAutoRefresh = useCallback((intervalMs = 30000) => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        refresh();
      }
    }, intervalMs);
  }, [refresh]);

  /**
   * Stop auto-refresh
   */
  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Initial load
  useEffect(() => {
    // Reset mounted ref on every mount (HMR-safe)
    isMountedRef.current = true;
    
    if (userId && userRole) {
      console.log('🚀 Initial load effect triggered for:', { userId, userRole });
      loadConversations();
      loadContacts();
    }

    return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [userId, userRole]); // Only depend on the actual values that should trigger a reload

  // Auto-refresh setup
  useEffect(() => {
    if (userId && userRole) {
      setupAutoRefresh();
    }

    return () => {
      stopAutoRefresh();
    };
  }, [userId, userRole]); // Only depend on the actual values that should trigger setup

  return {
    // State
    conversations,
    messages,
    contacts,
    selectedConversationId,
    loadingConversations,
    loadingMessages,
    loading: loadingConversations || loadingMessages, // For backward compatibility
    sending,
    error,

    // Actions
    selectConversation,
    sendMessage,
    startNewConversation,
    refresh,
    setupAutoRefresh,
    stopAutoRefresh,

    // Utilities
    getUserName: (userId) => {
      const contact = contacts.find(c => c.id === userId);
      return contact?.fullName || contact?.name || contact?.username || `Người dùng #${userId}`;
    }
  };
};

export default useUnifiedMessaging;
