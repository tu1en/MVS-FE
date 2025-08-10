// Real moment.js implementation
// Install: npm install moment

import moment from 'moment';
import 'moment/locale/vi'; // Vietnamese locale

// Configure Vietnamese locale
moment.locale('vi');

// Override some Vietnamese translations for better UX
moment.updateLocale('vi', {
  calendar: {
    lastDay: '[Hôm qua lúc] LT',
    sameDay: '[Hôm nay lúc] LT',
    nextDay: '[Ngày mai lúc] LT',
    lastWeek: '[Tuần trước] dddd [lúc] LT',
    nextWeek: 'dddd [tuần tới lúc] LT',
    sameElse: 'L'
  },
  relativeTime: {
    future: 'trong %s',
    past: '%s trước',
    s: 'vài giây',
    ss: '%d giây',
    m: '1 phút',
    mm: '%d phút',
    h: '1 giờ',
    hh: '%d giờ',
    d: '1 ngày',
    dd: '%d ngày',
    M: '1 tháng',
    MM: '%d tháng',
    y: '1 năm',
    yy: '%d năm'
  }
});

// Utility functions for common date operations
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  return moment(date).format(format);
};

export const formatDateTime = (date, format = 'DD/MM/YYYY HH:mm') => {
  return moment(date).format(format);
};

export const formatTime = (date, format = 'HH:mm') => {
  return moment(date).format(format);
};

export const fromNow = (date) => {
  return moment(date).fromNow();
};

export const isToday = (date) => {
  return moment(date).isSame(moment(), 'day');
};

export const isThisWeek = (date) => {
  return moment(date).isSame(moment(), 'week');
};

export const isThisMonth = (date) => {
  return moment(date).isSame(moment(), 'month');
};

export const addDays = (date, days) => {
  return moment(date).add(days, 'days');
};

export const subtractDays = (date, days) => {
  return moment(date).subtract(days, 'days');
};

export const startOfWeek = (date) => {
  return moment(date).startOf('week');
};

export const endOfWeek = (date) => {
  return moment(date).endOf('week');
};

export const startOfMonth = (date) => {
  return moment(date).startOf('month');
};

export const endOfMonth = (date) => {
  return moment(date).endOf('month');
};

// Export moment as default for backward compatibility
export default moment;
