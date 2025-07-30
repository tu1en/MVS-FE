# Unified Messaging System

## Overview

The Unified Messaging System provides standardized messaging interfaces for both student and teacher views in the Vietnamese classroom management system. This ensures consistent user experience, visual coherence, and maintainable code across different user roles.

## Architecture

### Components Structure

```
src/components/messaging/
├── index.js                    # Main exports
├── MessageBubble.jsx          # Individual message display
├── MessageList.jsx            # Conversation message list
├── MessageInput.jsx           # Message input with send functionality
├── ConversationList.jsx       # Contact/conversation list
├── MessageHeader.jsx          # Conversation header
├── MessagingLayout.jsx        # Unified two-column layout
└── README.md                  # This documentation
```

### Services and Hooks

```
src/services/
└── unifiedMessagingService.js  # Role-based messaging API

src/hooks/
└── useUnifiedMessaging.js      # Messaging state management

src/styles/
└── messaging.css               # Vietnamese text and styling
```

### Pages

```
src/pages/
├── UnifiedStudentMessaging.jsx  # Student messaging interface
└── UnifiedTeacherMessaging.jsx  # Teacher messaging interface
```

## Features

### ✅ Consistent Design
- **Identical Layout**: Two-column layout (conversation list + message view)
- **Unified Styling**: Consistent colors, fonts, spacing, and visual elements
- **Vietnamese Text Support**: Proper font rendering and text encoding
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### ✅ Role-Based Functionality
- **Student Interface**: Can message teachers, reply to conversations
- **Teacher Interface**: Can message students, initiate conversations
- **Permission Control**: Role-specific features while maintaining identical UI

### ✅ Message Features
- **Real-time Messaging**: Send and receive messages instantly
- **Message Status**: Read/unread indicators, delivery status
- **Conversation Threading**: Organized message history
- **Vietnamese Timestamps**: Proper date/time formatting

### ✅ User Experience
- **Auto-scroll**: Messages automatically scroll to bottom
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages

## Usage

### Basic Implementation

```jsx
import { MessagingLayout } from '../components/messaging';
import useUnifiedMessaging from '../hooks/useUnifiedMessaging';

const MyMessagingPage = () => {
  const {
    conversations,
    messages,
    contacts,
    selectedConversationId,
    loading,
    sending,
    selectConversation,
    sendMessage,
    startNewConversation
  } = useUnifiedMessaging('student', userId);

  return (
    <MessagingLayout
      conversations={conversations}
      messages={messages}
      contacts={contacts}
      currentUserId={userId}
      userRole="student"
      selectedConversationId={selectedConversationId}
      loading={loading}
      sending={sending}
      onConversationSelect={selectConversation}
      onSendMessage={sendMessage}
      onNewConversation={startNewConversation}
      title="Tin nhắn với giáo viên"
    />
  );
};
```

### Individual Components

```jsx
import { 
  MessageBubble, 
  MessageList, 
  MessageInput, 
  ConversationList, 
  MessageHeader 
} from '../components/messaging';

// Message bubble
<MessageBubble
  message={messageData}
  isCurrentUser={true}
  senderName="Nguyễn Văn A"
  showTimestamp={true}
  showStatus={true}
/>

// Message list
<MessageList
  messages={messages}
  currentUserId={userId}
  loading={false}
  getUserName={(id) => `User ${id}`}
/>

// Message input
<MessageInput
  value={inputValue}
  onChange={setInputValue}
  onSend={handleSend}
  placeholder="Nhập tin nhắn..."
  maxLength={1000}
/>
```

## API Integration

### UnifiedMessagingService

```javascript
import UnifiedMessagingService from '../services/unifiedMessagingService';

// Get conversations
const conversations = await UnifiedMessagingService.getConversations('student', userId);

// Get messages
const messages = await UnifiedMessagingService.getMessages('student', userId, conversationId);

// Send message
const sentMessage = await UnifiedMessagingService.sendMessage('student', senderId, recipientId, content);

// Get contacts
const contacts = await UnifiedMessagingService.getContacts('student', userId);
```

### useUnifiedMessaging Hook

```javascript
const {
  // State
  conversations,
  messages,
  contacts,
  selectedConversationId,
  loading,
  sending,
  error,

  // Actions
  selectConversation,
  sendMessage,
  startNewConversation,
  refresh,

  // Utilities
  getUserName
} = useUnifiedMessaging(userRole, userId);
```

## Styling

### CSS Classes

```css
/* Main container */
.messaging-vietnamese-text { /* Vietnamese font stack */ }
.messaging-layout { /* Main layout container */ }

/* Conversation list */
.conversation-list-container { /* List container */ }
.conversation-item { /* Individual conversation */ }
.conversation-item.selected { /* Selected conversation */ }

/* Message display */
.message-bubble-container { /* Message wrapper */ }
.message-sent { /* Sent message styling */ }
.message-received { /* Received message styling */ }

/* Input and header */
.message-input-container { /* Input area */ }
.message-header-container { /* Header area */ }
```

### Vietnamese Text Optimization

```css
.messaging-vietnamese-text {
  font-family: 'Inter', 'Roboto', 'Noto Sans', sans-serif;
  font-feature-settings: 'kern' 1, 'liga' 1;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
```

## Routes

### Application Routes

```javascript
// Teacher messaging
<Route path="/teacher/messages-unified" 
       element={<UnifiedTeacherMessaging />} />

// Student messaging  
<Route path="/student/messages-unified" 
       element={<UnifiedStudentMessaging />} />
```

## Testing

### Manual Testing Checklist

#### ✅ Visual Consistency
- [ ] Both interfaces have identical layout structure
- [ ] Colors, fonts, and spacing are consistent
- [ ] Vietnamese text renders properly
- [ ] Responsive design works on all screen sizes

#### ✅ Functionality
- [ ] Messages send and receive correctly
- [ ] Conversation selection works
- [ ] New conversation creation works
- [ ] Message status indicators display correctly
- [ ] Auto-scroll functions properly

#### ✅ Role-Based Features
- [ ] Students can only message teachers
- [ ] Teachers can message all students
- [ ] Permissions are enforced correctly
- [ ] UI adapts to role without breaking consistency

#### ✅ Error Handling
- [ ] Network errors display user-friendly messages
- [ ] Loading states show appropriate indicators
- [ ] Empty states display helpful messages

## Migration Guide

### From Old Messaging Interfaces

1. **Replace Route**: Update route to use unified messaging page
2. **Update Navigation**: Point menu items to new routes
3. **Test Functionality**: Verify all features work correctly
4. **Remove Old Code**: Clean up old messaging components (optional)

### Example Migration

```javascript
// Before
<Route path="/teacher/messages" element={<TeacherMessagesPage />} />

// After  
<Route path="/teacher/messages" element={<UnifiedTeacherMessaging />} />
```

## Troubleshooting

### Common Issues

1. **Messages not loading**: Check API endpoints and user authentication
2. **Styling issues**: Ensure messaging.css is imported
3. **Vietnamese text problems**: Verify font stack and encoding
4. **Responsive issues**: Test on different screen sizes

### Debug Tools

```javascript
// Enable debug logging
console.log('📨 Messaging Debug:', {
  conversations,
  messages,
  selectedConversationId,
  userRole,
  userId
});
```

## Future Enhancements

### Planned Features
- [ ] File attachment support
- [ ] Emoji picker integration
- [ ] Message search functionality
- [ ] Push notifications
- [ ] Message encryption
- [ ] Voice messages
- [ ] Video call integration

### Performance Optimizations
- [ ] Message virtualization for large conversations
- [ ] Image lazy loading
- [ ] Connection pooling
- [ ] Offline message queuing

## Contributing

When contributing to the messaging system:

1. **Maintain Consistency**: Ensure changes work for both student and teacher interfaces
2. **Test Vietnamese Text**: Verify proper rendering and encoding
3. **Follow Patterns**: Use established component and service patterns
4. **Update Documentation**: Keep this README current with changes
5. **Test Responsively**: Verify changes work on all screen sizes

## Support

For issues or questions about the unified messaging system:

1. Check this documentation first
2. Review component props and API documentation
3. Test with different user roles and scenarios
4. Check browser console for error messages
5. Verify backend API endpoints are working correctly
