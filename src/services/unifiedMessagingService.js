import apiClient from './api';

/**
 * Unified Messaging Service
 * 
 * Provides consistent messaging functionality for both student and teacher roles
 * while handling role-specific permissions and data transformations
 */
class UnifiedMessagingService {
  
  /**
   * Get conversations for current user based on role
   * @param {string} userRole - 'student' or 'teacher'
   * @param {number} userId - Current user ID
   * @returns {Promise<Array>} List of conversations
   */
  static async getConversations(userRole, userId) {
    try {
      let endpoint;
      
      if (userRole === 'teacher') {
        // Teachers get list of students they can message
        endpoint = `/student-messages/teacher/${userId}/conversations`;
      } else {
        // Students get their message conversations
        endpoint = `/student-messages/student/${userId}/conversations`;
      }
      
      console.log('🔄 UnifiedMessagingService.getConversations:', { userRole, userId, endpoint });
      
      const response = await apiClient.get(endpoint);
      const conversations = response.data || [];
      
      console.log('✅ API Response for conversations:', { 
        endpoint, 
        responseStatus: response.status,
        conversationsCount: conversations.length,
        conversations: conversations.slice(0, 2) // Log first 2 conversations for debug
      });
      
      // Transform data for consistent interface
      const transformedConversations = conversations.map(conv => this.transformConversation(conv, userRole));
      console.log('✅ Transformed conversations:', transformedConversations.slice(0, 2));
      
      return transformedConversations;
      
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      
      // Fallback: try alternative endpoints
      if (userRole === 'teacher') {
        return await this.getTeacherConversationsFallback(userId);
      } else {
        return await this.getStudentConversationsFallback(userId);
      }
    }
  }

  /**
   * Get messages for a specific conversation
   * @param {string} userRole - 'student' or 'teacher'
   * @param {number} userId - Current user ID
   * @param {number} conversationId - Conversation/contact ID
   * @returns {Promise<Array>} List of messages
   */
  static async getMessages(userRole, userId, conversationId) {
    try {
      let endpoint;
      
      if (userRole === 'teacher') {
        // Get messages between teacher and specific student
        endpoint = `/student-messages/conversation/${userId}/${conversationId}`;
      } else {
        // Get messages between student and specific teacher
        endpoint = `/student-messages/conversation/${conversationId}/${userId}`;
      }
      
      const response = await apiClient.get(endpoint);
      const messages = response.data || [];
      
      // Transform messages for consistent interface
      return messages.map(msg => this.transformMessage(msg, userRole, userId));
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Send a new message
   * @param {string} userRole - 'student' or 'teacher'
   * @param {number} senderId - Sender user ID
   * @param {number} recipientId - Recipient user ID
   * @param {string} content - Message content
   * @param {string} subject - Message subject (optional)
   * @returns {Promise<Object>} Sent message data
   */
  static async sendMessage(userRole, senderId, recipientId, content, subject = null) {
    try {
      const messageData = {
        senderId,
        recipientId,
        content,
        subject: subject || (userRole === 'student' ? 'Câu hỏi từ học sinh' : 'Tin nhắn từ giáo viên'),
        messageType: 'GENERAL',
        priority: 'MEDIUM',
        status: 'SENT'
      };

      const response = await apiClient.post('/student-messages', messageData);
      return this.transformMessage(response.data, userRole, senderId);
      
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Reply to an existing message
   * @param {number} messageId - Original message ID
   * @param {string} replyContent - Reply content
   * @param {number} replierId - User ID of replier
   * @returns {Promise<Object>} Reply data
   */
  static async replyToMessage(messageId, replyContent, replierId) {
    try {
      const response = await apiClient.post(`/student-messages/${messageId}/reply`, {
        reply: replyContent,
        repliedBy: replierId
      });
      
      return response.data;
      
    } catch (error) {
      console.error('Error replying to message:', error);
      throw error;
    }
  }

  /**
   * Mark message as read
   * @param {number} messageId - Message ID
   * @returns {Promise<void>}
   */
  static async markAsRead(messageId) {
    try {
      await apiClient.put(`/student-messages/${messageId}/read`);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  /**
   * Get available contacts for new message
   * @param {string} userRole - 'student' or 'teacher'
   * @param {number} userId - Current user ID
   * @returns {Promise<Array>} List of contacts
   */
  static async getContacts(userRole, userId) {
    try {
      let endpoint;
      
      if (userRole === 'teacher') {
        // Teachers can message all students
        endpoint = '/users/students';
      } else {
        // Students can message all teachers
        endpoint = '/users/teachers';
      }
      
      const response = await apiClient.get(endpoint);
      return response.data || [];
      
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  }

  /**
   * Transform conversation data for consistent interface
   * @private
   */
  static transformConversation(conversation, userRole) {
    const baseConversation = {
      id: conversation.id,
      lastMessage: conversation.lastMessage || conversation.content,
      lastMessageAt: conversation.lastMessageAt || conversation.updatedAt || conversation.createdAt,
      unreadCount: conversation.unreadCount || 0,
      status: conversation.status,
      priority: conversation.priority
    };

    if (userRole === 'teacher') {
      return {
        ...baseConversation,
        studentId: conversation.senderId || conversation.studentId,
        studentName: conversation.senderName || conversation.studentName,
        recipientId: conversation.senderId || conversation.studentId,
        recipientName: conversation.senderName || conversation.studentName
      };
    } else {
      return {
        ...baseConversation,
        teacherId: conversation.recipientId || conversation.teacherId,
        teacherName: conversation.recipientName || conversation.teacherName,
        senderId: conversation.recipientId || conversation.teacherId,
        senderName: conversation.recipientName || conversation.teacherName
      };
    }
  }

  /**
   * Transform message data for consistent interface
   * @private
   */
  static transformMessage(message, userRole, currentUserId) {
    return {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      recipientId: message.recipientId,
      senderName: message.senderName,
      recipientName: message.recipientName,
      subject: message.subject,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      status: message.status,
      isRead: message.isRead,
      readAt: message.readAt,
      reply: message.reply,
      repliedAt: message.repliedAt,
      repliedBy: message.repliedBy,
      messageType: message.messageType,
      priority: message.priority,
      // Add computed fields
      isCurrentUser: message.senderId?.toString() === currentUserId?.toString(),
      timestamp: message.createdAt || message.updatedAt
    };
  }

  /**
   * Fallback method for teacher conversations
   * @private
   */
  static async getTeacherConversationsFallback(teacherId) {
    try {
      // Try to get students list and create conversation objects
      const studentsResponse = await apiClient.get('/users/students');
      const students = studentsResponse.data || [];
      
      // Get messages to determine which students have conversations
      const messagesResponse = await apiClient.get(`/student-messages/teacher/${teacherId}`);
      const messages = messagesResponse.data || [];
      
      // Group messages by student
      const conversationMap = new Map();
      messages.forEach(msg => {
        const studentId = msg.senderId === teacherId ? msg.recipientId : msg.senderId;
        if (!conversationMap.has(studentId)) {
          conversationMap.set(studentId, {
            studentId,
            messages: [],
            lastMessage: null,
            lastMessageAt: null,
            unreadCount: 0
          });
        }
        
        const conv = conversationMap.get(studentId);
        conv.messages.push(msg);
        
        if (!conv.lastMessageAt || new Date(msg.createdAt) > new Date(conv.lastMessageAt)) {
          conv.lastMessage = msg.content;
          conv.lastMessageAt = msg.createdAt;
        }
        
        if (!msg.isRead && msg.senderId !== teacherId) {
          conv.unreadCount++;
        }
      });
      
      // Create conversation objects
      const conversations = [];
      conversationMap.forEach((conv, studentId) => {
        const student = students.find(s => s.id === studentId);
        conversations.push({
          id: studentId,
          studentId,
          studentName: student?.fullName || `Học sinh #${studentId}`,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unreadCount: conv.unreadCount
        });
      });
      
      return conversations.sort((a, b) => 
        new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
      );
      
    } catch (error) {
      console.error('Error in teacher conversations fallback:', error);
      return [];
    }
  }

  /**
   * Fallback method for student conversations
   * @private
   */
  static async getStudentConversationsFallback(studentId) {
    try {
      // Get student's messages
      const response = await apiClient.get(`/student-messages/student/${studentId}`);
      const messages = response.data || [];
      
      // Group by teacher
      const conversationMap = new Map();
      messages.forEach(msg => {
        const teacherId = msg.senderId === studentId ? msg.recipientId : msg.senderId;
        if (!conversationMap.has(teacherId)) {
          conversationMap.set(teacherId, {
            teacherId,
            messages: [],
            lastMessage: null,
            lastMessageAt: null,
            unreadCount: 0
          });
        }
        
        const conv = conversationMap.get(teacherId);
        conv.messages.push(msg);
        
        if (!conv.lastMessageAt || new Date(msg.createdAt) > new Date(conv.lastMessageAt)) {
          conv.lastMessage = msg.content;
          conv.lastMessageAt = msg.createdAt;
        }
        
        if (!msg.isRead && msg.senderId !== studentId) {
          conv.unreadCount++;
        }
      });
      
      // Create conversation objects
      const conversations = [];
      conversationMap.forEach((conv, teacherId) => {
        conversations.push({
          id: teacherId,
          teacherId,
          teacherName: conv.messages[0]?.senderName || conv.messages[0]?.recipientName || `Giáo viên #${teacherId}`,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unreadCount: conv.unreadCount
        });
      });
      
      return conversations.sort((a, b) => 
        new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
      );
      
    } catch (error) {
      console.error('Error in student conversations fallback:', error);
      return [];
    }
  }
}

export default UnifiedMessagingService;
