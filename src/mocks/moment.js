// Mock moment.js for compilation
const moment = (date) => {
  const d = new Date(date || Date.now());
  
  return {
    format: (format) => {
      if (format === 'DD/MM/YYYY') return d.toLocaleDateString('vi-VN');
      if (format === 'HH:mm') return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      if (format === 'YYYY-MM-DD') return d.toISOString().split('T')[0];
      return d.toLocaleDateString('vi-VN');
    },
    fromNow: () => 'a few moments ago',
    startOf: (unit) => moment(d),
    endOf: (unit) => moment(d),
    add: (amount, unit) => moment(new Date(d.getTime() + (amount * 86400000))),
    subtract: (amount, unit) => moment(new Date(d.getTime() - (amount * 86400000))),
    isSame: (other, unit) => true,
    isBefore: (other, unit) => false,
    isAfter: (other, unit) => false,
    valueOf: () => d.getTime(),
    toDate: () => d
  };
};

moment.locale = (locale) => {};
moment.updateLocale = (locale, config) => {};

export default moment;
