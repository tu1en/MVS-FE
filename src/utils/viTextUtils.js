/**
 * Vietnamese Text Utilities (UTF-8 safe)
 */

export const fixVietnameseEncoding = (text) => {
  if (!text || typeof text !== 'string') return text;

  const replacements = [
    [/Tu\?n/gi, 'Tuần'],
    [/\bTuan\b/gi, 'Tuần'],
    [/Bài h\?c/gi, 'Bài học'],
    [/\bBai hoc\b/gi, 'Bài học'],
    [/\bBài hoc\b/gi, 'Bài học'],
    [/\bBài hc\b/gi, 'Bài học'],
    [/h\?c/gi, 'học'],
    [/ch\? d\?/gi, 'chủ đề'],
    [/\bchu de\b/gi, 'chủ đề'],
    [/V\?t/gi, 'Vật'],
    [/L\?p/gi, 'Lớp'],
    [/Hóa h\?c/gi, 'Hóa học'],
    [/hoa h\?c/gi, 'hóa học'],
    [/Tr\?ng tâm/gi, 'Trọng tâm'],
    [/Th\?y/gi, 'Thầy'],
    [/V\?n/gi, 'Văn'],
    [/L\?ch s\?/gi, 'Lịch sử'],
    [/Ð\?a lý/gi, 'Địa lý'],
    [/To\?n/gi, 'Toán'],
    [/Ti\?ng/gi, 'Tiếng'],
    [/Qu\?n lý/gi, 'Quản lý'],
    // Lý thuyết variants
    [/Lý thuy\?t/gi, 'Lý thuyết'],
    [/Ly thuy\?t/gi, 'Lý thuyết'],
    [/thuy\?t/gi, 'thuyết'],
  ];

  let output = text;
  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement);
  }
  return output;
};

export const normalizeVietnameseText = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

export const hasVietnameseCharacters = (text) => {
  if (!text || typeof text !== 'string') return false;
  const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  return vietnameseRegex.test(text);
};

export const formatVietnameseText = (text) => {
  if (!text || typeof text !== 'string') return text;
  return fixVietnameseEncoding(text).trim().replace(/\s+/g, ' ');
};

export const getVietnameseClasses = (baseClasses = '', text = '') => {
  const classes = [baseClasses];
  if (hasVietnameseCharacters(text)) {
    classes.push('vietnamese-text', 'crisp-text', 'fix-vietnamese-diacritics');
  }
  return classes.filter(Boolean).join(' ');
};

export default {
  fixVietnameseEncoding,
  normalizeVietnameseText,
  hasVietnameseCharacters,
  formatVietnameseText,
  getVietnameseClasses,
};


