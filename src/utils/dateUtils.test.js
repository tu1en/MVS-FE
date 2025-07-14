/**
 * Test file for dateUtils functions
 * Tests both array format (Java LocalDateTime serialization) and ISO string format
 */

import { 
  parseTimestamp, 
  formatTimestamp, 
  formatMessageTime, 
  formatDateDivider, 
  formatFullDateTime,
  isValidTimestamp,
  getTimeAgo
} from './dateUtils';

// Mock current time for consistent testing
const mockNow = new Date('2025-07-14T12:00:00.000Z');
const originalDate = Date;

beforeAll(() => {
  global.Date = class extends Date {
    constructor(...args) {
      if (args.length === 0) {
        return mockNow;
      }
      return new originalDate(...args);
    }
    
    static now() {
      return mockNow.getTime();
    }
  };
});

afterAll(() => {
  global.Date = originalDate;
});

describe('parseTimestamp', () => {
  test('should parse array format (Java LocalDateTime serialization)', () => {
    // [year, month, day, hour, minute, second, nanosecond]
    const arrayTimestamp = [2025, 7, 12, 12, 13, 22, 153221000];
    const result = parseTimestamp(arrayTimestamp);
    
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(6); // 0-based month
    expect(result.getDate()).toBe(12);
    expect(result.getHours()).toBe(12);
    expect(result.getMinutes()).toBe(13);
    expect(result.getSeconds()).toBe(22);
  });

  test('should parse ISO string format', () => {
    const isoString = '2025-07-12T12:13:22.153Z';
    const result = parseTimestamp(isoString);
    
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe(isoString);
  });

  test('should handle Date objects', () => {
    const dateObj = new Date('2025-07-12T12:13:22.153Z');
    const result = parseTimestamp(dateObj);
    
    expect(result).toBe(dateObj);
  });

  test('should handle number timestamps', () => {
    const timestamp = 1721649202153;
    const result = parseTimestamp(timestamp);
    
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(timestamp);
  });

  test('should return null for invalid inputs', () => {
    expect(parseTimestamp(null)).toBeNull();
    expect(parseTimestamp(undefined)).toBeNull();
    expect(parseTimestamp('')).toBeNull();
    expect(parseTimestamp([])).toBeNull();
    expect(parseTimestamp([2025])).toBeNull(); // Incomplete array
    expect(parseTimestamp('invalid-date')).toBeNull();
  });

  test('should handle array with missing components', () => {
    const arrayTimestamp = [2025, 7, 12]; // Only year, month, day
    const result = parseTimestamp(arrayTimestamp);
    
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(12);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });
});

describe('formatTimestamp', () => {
  test('should format recent timestamps in Vietnamese', () => {
    // 30 minutes ago
    const thirtyMinutesAgo = [2025, 7, 14, 11, 30, 0, 0];
    expect(formatTimestamp(thirtyMinutesAgo)).toBe('30 phút trước');

    // 2 hours ago
    const twoHoursAgo = [2025, 7, 14, 10, 0, 0, 0];
    expect(formatTimestamp(twoHoursAgo)).toBe('2 giờ trước');

    // 2 days ago
    const twoDaysAgo = [2025, 7, 12, 12, 0, 0, 0];
    expect(formatTimestamp(twoDaysAgo)).toBe('2 ngày trước');
  });

  test('should show "Vừa xong" for very recent timestamps', () => {
    const justNow = [2025, 7, 14, 11, 59, 30, 0]; // 30 seconds ago
    expect(formatTimestamp(justNow)).toBe('Vừa xong');
  });

  test('should show full date for old timestamps', () => {
    const oldTimestamp = [2025, 6, 1, 12, 0, 0, 0]; // More than 7 days ago
    const result = formatTimestamp(oldTimestamp);
    expect(result).toMatch(/01\/06\/2025/); // Vietnamese date format
  });

  test('should handle invalid timestamps', () => {
    expect(formatTimestamp(null)).toBe('Không xác định');
    expect(formatTimestamp(undefined)).toBe('Không xác định');
    expect(formatTimestamp('invalid')).toBe('Không xác định');
  });
});

describe('formatMessageTime', () => {
  test('should format time only for recent messages', () => {
    const recentMessage = [2025, 7, 14, 10, 30, 0, 0];
    const result = formatMessageTime(recentMessage);
    expect(result).toMatch(/10:30/);
  });

  test('should format date and time for older messages', () => {
    const oldMessage = [2025, 7, 12, 15, 30, 0, 0];
    const result = formatMessageTime(oldMessage);
    expect(result).toMatch(/12\/07.*15:30/);
  });
});

describe('formatDateDivider', () => {
  test('should return "Hôm nay" for today', () => {
    const today = [2025, 7, 14, 10, 0, 0, 0];
    expect(formatDateDivider(today)).toBe('Hôm nay');
  });

  test('should return "Hôm qua" for yesterday', () => {
    const yesterday = [2025, 7, 13, 10, 0, 0, 0];
    expect(formatDateDivider(yesterday)).toBe('Hôm qua');
  });

  test('should return full date for older dates', () => {
    const oldDate = [2025, 7, 10, 10, 0, 0, 0];
    const result = formatDateDivider(oldDate);
    expect(result).toMatch(/thứ.*2025/i);
  });
});

describe('isValidTimestamp', () => {
  test('should validate various timestamp formats', () => {
    expect(isValidTimestamp([2025, 7, 14, 12, 0, 0, 0])).toBe(true);
    expect(isValidTimestamp('2025-07-14T12:00:00.000Z')).toBe(true);
    expect(isValidTimestamp(new Date())).toBe(true);
    expect(isValidTimestamp(Date.now())).toBe(true);
    
    expect(isValidTimestamp(null)).toBe(false);
    expect(isValidTimestamp(undefined)).toBe(false);
    expect(isValidTimestamp('invalid')).toBe(false);
    expect(isValidTimestamp([])).toBe(false);
  });
});

describe('getTimeAgo', () => {
  test('should return Vietnamese time ago expressions', () => {
    const fiveMinutesAgo = [2025, 7, 14, 11, 55, 0, 0];
    expect(getTimeAgo(fiveMinutesAgo)).toBe('5 phút trước');

    const threeHoursAgo = [2025, 7, 14, 9, 0, 0, 0];
    expect(getTimeAgo(threeHoursAgo)).toBe('3 giờ trước');

    const fiveDaysAgo = [2025, 7, 9, 12, 0, 0, 0];
    expect(getTimeAgo(fiveDaysAgo)).toBe('5 ngày trước');
  });
});

describe('Integration tests', () => {
  test('should handle real backend response format', () => {
    // Simulate real backend response with array format
    const backendResponse = {
      id: 1,
      content: 'Test message',
      createdAt: [2025, 7, 14, 10, 30, 22, 153221000],
      updatedAt: [2025, 7, 14, 11, 0, 0, 0]
    };

    const createdDate = parseTimestamp(backendResponse.createdAt);
    const updatedDate = parseTimestamp(backendResponse.updatedAt);

    expect(createdDate).toBeInstanceOf(Date);
    expect(updatedDate).toBeInstanceOf(Date);
    expect(formatTimestamp(backendResponse.createdAt)).toBe('1 giờ trước');
    expect(formatTimestamp(backendResponse.updatedAt)).toBe('1 giờ trước');
  });

  test('should handle mixed format responses', () => {
    // Some fields as arrays, some as ISO strings
    const mixedResponse = {
      createdAt: [2025, 7, 14, 10, 0, 0, 0],
      lastMessageAt: '2025-07-14T11:30:00.000Z'
    };

    expect(isValidTimestamp(mixedResponse.createdAt)).toBe(true);
    expect(isValidTimestamp(mixedResponse.lastMessageAt)).toBe(true);
    
    expect(formatTimestamp(mixedResponse.createdAt)).toBe('2 giờ trước');
    expect(formatTimestamp(mixedResponse.lastMessageAt)).toBe('30 phút trước');
  });
});

// Console test for debugging
describe('Debug functionality', () => {
  test('should not throw errors when debugging timestamps', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    expect(() => {
      const { debugTimestamp } = require('./dateUtils');
      debugTimestamp([2025, 7, 14, 12, 0, 0, 0], 'test context');
    }).not.toThrow();
    
    consoleSpy.mockRestore();
  });
});
