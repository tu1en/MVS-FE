/**
 * Unified Messaging Components
 * 
 * This module exports standardized messaging components that provide
 * consistent user interface and experience across student and teacher
 * messaging interfaces in the Vietnamese classroom management system.
 * 
 * Components:
 * - MessageBubble: Individual message display with consistent styling
 * - MessageList: Conversation message list with auto-scroll and grouping
 * - MessageInput: Unified message input with send functionality
 * - ConversationList: Contact/conversation list with status indicators
 * - MessageHeader: Conversation header with contact info and actions
 * 
 * Features:
 * - Consistent Vietnamese text rendering and formatting
 * - Role-based styling and functionality
 * - Responsive design for different screen sizes
 * - Accessibility support
 * - Unified color scheme and typography
 */

export { default as ConversationList } from './ConversationList';
export { default as MessageBubble } from './MessageBubble';
export { default as MessageHeader } from './MessageHeader';
export { default as MessageInput } from './MessageInput';
export { default as MessageList } from './MessageList';
export { default as MessagingLayout } from './MessagingLayout';

// Re-export all components as a single object for convenience
import ConversationList from './ConversationList';
import MessageBubble from './MessageBubble';
import MessageHeader from './MessageHeader';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import MessagingLayout from './MessagingLayout';

export const MessagingComponents = {
  MessageBubble,
  MessageList,
  MessageInput,
  ConversationList,
  MessageHeader,
  MessagingLayout
};

export default MessagingComponents;
