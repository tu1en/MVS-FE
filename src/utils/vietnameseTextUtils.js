/**
 * Vietnamese Text Utilities
 * Các tiện ích xử lý text tiếng Việt
 */

/**
 * Sửa lỗi encoding tiếng Việt phổ biến
 * @param {string} text - Text cần sửa lỗi encoding
 * @returns {string} Text đã được sửa lỗi
 */
export const fixVietnameseEncoding = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Map of common encoding issues for Vietnamese characters
  const encodingFixes = {
    // Từ phổ biến
    'V?t': 'Vật',
    'v?t': 'vật',
    'Chuyên d?': 'Chuyên đề',
    'chuyên d?': 'chuyên đề',
    'L?p': 'Lớp',
    'l?p': 'lớp',
    'Hóa h?c': 'Hóa học',
    'hóa h?c': 'hóa học',
    'Tr?ng tâm': 'Trọng tâm',
    'tr?ng tâm': 'trọng tâm',
    'Th?y': 'Thầy',
    'th?y': 'thầy',
    'V?n': 'Văn',
    'v?n': 'văn',
    'L?ch s?': 'Lịch sử',
    'l?ch s?': 'lịch sử',
    'Ð?a lý': 'Địa lý',
    'ð?a lý': 'địa lý',
    'To?n': 'Toán',
    'to?n': 'toán',
    'Ti?ng': 'Tiếng',
    'ti?ng': 'tiếng',
    'Anh': 'Anh',
    'Qu?n lý': 'Quản lý',
    'qu?n lý': 'quản lý',
    
    // Ký tự đơn lẻ thường gặp lỗi
    'À': 'À', 'à': 'à',
    'Á': 'Á', 'á': 'á', 
    'Ạ': 'Ạ', 'ạ': 'ạ',
    'Ả': 'Ả', 'ả': 'ả',
    'Ã': 'Ã', 'ã': 'ã',
    'Â': 'Â', 'â': 'â',
    'Ầ': 'Ầ', 'ầ': 'ầ',
    'Ấ': 'Ấ', 'ấ': 'ấ',
    'Ậ': 'Ậ', 'ậ': 'ậ',
    'Ẩ': 'Ẩ', 'ẩ': 'ẩ',
    'Ẫ': 'Ẫ', 'ẫ': 'ẫ',
    'Ă': 'Ă', 'ă': 'ă',
    'Ằ': 'Ằ', 'ằ': 'ằ',
    'Ắ': 'Ắ', 'ắ': 'ắ',
    'Ặ': 'Ặ', 'ặ': 'ặ',
    'Ẳ': 'Ẳ', 'ẳ': 'ẳ',
    'Ẵ': 'Ẵ', 'ẵ': 'ẵ',
    'È': 'È', 'è': 'è',
    'É': 'É', 'é': 'é',
    'Ẹ': 'Ẹ', 'ẹ': 'ẹ',
    'Ẻ': 'Ẻ', 'ẻ': 'ẻ',
    'Ẽ': 'Ẽ', 'ẽ': 'ẽ',
    'Ê': 'Ê', 'ê': 'ê',
    'Ề': 'Ề', 'ề': 'ề',
    'Ế': 'Ế', 'ế': 'ế',
    'Ệ': 'Ệ', 'ệ': 'ệ',
    'Ể': 'Ể', 'ể': 'ể',
    'Ễ': 'Ễ', 'ễ': 'ễ',
    'Ì': 'Ì', 'ì': 'ì',
    'Í': 'Í', 'í': 'í',
    'Ị': 'Ị', 'ị': 'ị',
    'Ỉ': 'Ỉ', 'ỉ': 'ỉ',
    'Ĩ': 'Ĩ', 'ĩ': 'ĩ',
    'Ò': 'Ò', 'ò': 'ò',
    'Ó': 'Ó', 'ó': 'ó',
    'Ọ': 'Ọ', 'ọ': 'ọ',
    'Ỏ': 'Ỏ', 'ỏ': 'ỏ',
    'Õ': 'Õ', 'õ': 'õ',
    'Ô': 'Ô', 'ô': 'ô',
    'Ồ': 'Ồ', 'ồ': 'ồ',
    'Ố': 'Ố', 'ố': 'ố',
    'Ộ': 'Ộ', 'ộ': 'ộ',
    'Ổ': 'Ổ', 'ổ': 'ổ',
    'Ỗ': 'Ỗ', 'ỗ': 'ỗ',
    'Ơ': 'Ơ', 'ơ': 'ơ',
    'Ờ': 'Ờ', 'ờ': 'ờ',
    'Ớ': 'Ớ', 'ớ': 'ớ',
    'Ợ': 'Ợ', 'ợ': 'ợ',
    'Ở': 'Ở', 'ở': 'ở',
    'Ỡ': 'Ỡ', 'ỡ': 'ỡ',
    'Ù': 'Ù', 'ù': 'ù',
    'Ú': 'Ú', 'ú': 'ú',
    'Ụ': 'Ụ', 'ụ': 'ụ',
    'Ủ': 'Ủ', 'ủ': 'ủ',
    'Ũ': 'Ũ', 'ũ': 'ũ',
    'Ư': 'Ư', 'ư': 'ư',
    'Ừ': 'Ừ', 'ừ': 'ừ',
    'Ứ': 'Ứ', 'ứ': 'ứ',
    'Ự': 'Ự', 'ự': 'ự',
    'Ử': 'Ử', 'ử': 'ử',
    'Ữ': 'Ữ', 'ữ': 'ữ',
    'Ỳ': 'Ỳ', 'ỳ': 'ỳ',
    'Ý': 'Ý', 'ý': 'ý',
    'Ỵ': 'Ỵ', 'ỵ': 'ỵ',
    'Ỷ': 'Ỷ', 'ỷ': 'ỷ',
    'Ỹ': 'Ỹ', 'ỹ': 'ỹ',
    'Đ': 'Đ', 'đ': 'đ',
    
    // Fallback cho ký tự ? thường gặp
    '?': '', // Loại bỏ dấu ? lạ
  };
  
  let fixedText = text;
  
  // Áp dụng từng fix một cách cẩn thận
  Object.keys(encodingFixes).forEach(badChar => {
    const regex = new RegExp(badChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    fixedText = fixedText.replace(regex, encodingFixes[badChar]);
  });
  
  return fixedText;
};

/**
 * Normalize Vietnamese text for comparison
 * @param {string} text - Text cần normalize
 * @returns {string} Text đã được normalize
 */
export const normalizeVietnameseText = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  return text
    .normalize('NFD') // Tách các dấu thanh ra
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu thanh
    .toLowerCase()
    .trim();
};

/**
 * Check if text contains Vietnamese characters
 * @param {string} text - Text cần kiểm tra
 * @returns {boolean} True nếu có ký tự tiếng Việt
 */
export const hasVietnameseCharacters = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  return vietnameseRegex.test(text);
};

/**
 * Clean and format Vietnamese text for display
 * @param {string} text - Text cần format
 * @returns {string} Text đã được format
 */
export const formatVietnameseText = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  return fixVietnameseEncoding(text)
    .trim()
    .replace(/\s+/g, ' '); // Loại bỏ khoảng trắng thừa
};

/**
 * Apply Vietnamese CSS classes based on text content
 * @param {string} baseClasses - CSS classes cơ bản
 * @param {string} text - Text để kiểm tra
 * @returns {string} CSS classes với Vietnamese classes
 */
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
  getVietnameseClasses
};



