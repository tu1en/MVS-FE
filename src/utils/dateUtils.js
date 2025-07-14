/**
 * Robust date/time utility functions for handling various timestamp formats
 * Supports both array format (from Java LocalDateTime serialization) and ISO string format
 */

/**
 * Safely parse timestamp from various formats
 * @param {*} timestamp - Can be array, string, Date object, or number
 * @returns {Date|null} - Parsed Date object or null if invalid
 */
export const parseTimestamp = (timestamp) => {
  if (!timestamp) return null;

  try {
    // If it's already a Date object
    if (timestamp instanceof Date) {
      return isNaN(timestamp.getTime()) ? null : timestamp;
    }

    // If it's a number (Unix timestamp)
    if (typeof timestamp === 'number') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }

    // If it's an array (Java LocalDateTime serialization)
    // Format: [year, month, day, hour, minute, second, nanosecond]
    if (Array.isArray(timestamp)) {
      if (timestamp.length < 3) return null;
      
      const [year, month, day, hour = 0, minute = 0, second = 0, nanosecond = 0] = timestamp;
      
      // Validate basic components
      if (!year || !month || !day) return null;
      
      // Note: month is 1-based in Java but 0-based in JavaScript Date
      const date = new Date(year, month - 1, day, hour, minute, second, Math.floor(nanosecond / 1000000));
      return isNaN(date.getTime()) ? null : date;
    }

    // If it's a string
    if (typeof timestamp === 'string') {
      // Try parsing as ISO string first
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }

    return null;
  } catch (error) {
    console.warn('Error parsing timestamp:', timestamp, error);
    return null;
  }
};

/**
 * Format timestamp for Vietnamese display with relative time
 * @param {*} timestamp - Timestamp to format
 * @returns {string} - Formatted Vietnamese time string
 */
export const formatTimestamp = (timestamp) => {
  const date = parseTimestamp(timestamp);
  if (!date) return 'Không xác định';

  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Handle future dates
  if (diffInMs < 0) {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Less than 1 minute
  if (diffInMinutes < 1) {
    return 'Vừa xong';
  }

  // Less than 1 hour
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  // Less than 24 hours
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  // Less than 7 days
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  // More than 7 days - show full date
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Format timestamp for message bubbles (time only for today, date+time for older)
 * @param {*} timestamp - Timestamp to format
 * @returns {string} - Formatted time string
 */
export const formatMessageTime = (timestamp) => {
  const date = parseTimestamp(timestamp);
  if (!date) return '';

  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    // Show time only for messages within 24 hours
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else {
    // Show date and time for older messages
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

/**
 * Format date for date dividers in message lists
 * @param {*} timestamp - Timestamp to format
 * @returns {string} - Formatted date divider text
 */
export const formatDateDivider = (timestamp) => {
  const date = parseTimestamp(timestamp);
  if (!date) return '';

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Hôm nay';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Hôm qua';
  } else {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

/**
 * Format full date and time for detailed displays
 * @param {*} timestamp - Timestamp to format
 * @returns {string} - Formatted full date and time
 */
export const formatFullDateTime = (timestamp) => {
  const date = parseTimestamp(timestamp);
  if (!date) return 'Thời gian không xác định';

  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Check if a timestamp is valid
 * @param {*} timestamp - Timestamp to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidTimestamp = (timestamp) => {
  return parseTimestamp(timestamp) !== null;
};

/**
 * Get time ago text in Vietnamese
 * @param {*} timestamp - Timestamp to calculate from
 * @returns {string} - Vietnamese time ago text
 */
export const getTimeAgo = (timestamp) => {
  const date = parseTimestamp(timestamp);
  if (!date) return 'Không xác định';

  const now = new Date();
  const diffInMs = now - date;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) {
    return 'Vừa xong';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  } else if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} tuần trước`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  } else {
    return `${diffInYears} năm trước`;
  }
};

/**
 * Debug function to log timestamp parsing details
 * @param {*} timestamp - Timestamp to debug
 * @param {string} context - Context for debugging
 */
export const debugTimestamp = (timestamp, context = '') => {
  console.log(`🕐 Debug timestamp ${context}:`, {
    original: timestamp,
    type: typeof timestamp,
    isArray: Array.isArray(timestamp),
    parsed: parseTimestamp(timestamp),
    formatted: formatTimestamp(timestamp)
  });
};
