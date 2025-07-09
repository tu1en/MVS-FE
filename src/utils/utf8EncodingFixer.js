/**
 * UTF-8 Encoding Fix Utilities for Vietnamese Text
 * Provides functions to detect and fix common UTF-8 encoding issues
 */

class UTF8EncodingFixer {
  /**
   * Fix common UTF-8 encoding issues in Vietnamese text
   * @param {string} text - The text to fix
   * @returns {string} - Fixed text
   */
  static fixVietnameseText(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    // Common encoding fix mappings for Vietnamese
    const encodingFixes = {
      // "rất" corruptions
      'r?t': 'rất',
      'r??t': 'rất',
      'r�t': 'rất',
      'rĂ¢Ë†ĹĄt': 'rất',
      
      // "tốt" corruptions  
      't?t': 'tốt',
      't??t': 'tốt',
      't�t': 'tốt',
      'tĂË†Â°Ă¢Ë†ÂºÄ‚Â¬Äąt': 'tốt',
      
      // "đầy" corruptions
      '??y': 'đầy',
      'Ă¡ÂÂ­y': 'đầy',
      'đĂ¢ÂÂ§y': 'đầy',
      
      // "đủ" corruptions
      '??': 'đủ',
      'Ă¡Â»ĹĄ': 'đủ',
      'đĂ»': 'đủ',
      
      // "điểm" corruptions
      '?i?m': 'điểm',
      'Ă¡Â»iĂ¡Â»m': 'điểm',
      'điĂ¡Â»m': 'điểm',
      
      // "đúng" corruptions
      '??ng': 'đúng',
      'Ă¡ÂÂºĂ‚Âºng': 'đúng',
      'đĂºng': 'đúng',
      
      // "được" corruptions
      '???c': 'được',
      'Ă¡Â»Ââ€œc': 'được',
      'đĂ°Ă¡Â»c': 'được',
      
      // "việc" corruptions
      'vi?c': 'việc',
      'viĂ¡Â»c': 'việc',
      
      // "kiến" corruptions
      'ki?n': 'kiến',
      'kiĂ¡Â»n': 'kiến',
      
      // "thiết" corruptions
      'thi?t': 'thiết',
      'thiĂ¡Â»t': 'thiết',
      
      // "kế" corruptions
      'k?': 'kế',
      'kĂ¡Â»': 'kế'
    };

    let fixedText = text;

    // Apply encoding fixes
    Object.entries(encodingFixes).forEach(([corrupted, correct]) => {
      const regex = new RegExp(corrupted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      fixedText = fixedText.replace(regex, correct);
    });

    return fixedText;
  }

  /**
   * Detect if text has potential UTF-8 encoding issues
   * @param {string} text - Text to check
   * @returns {boolean} - True if encoding issues detected
   */
  static hasEncodingIssues(text) {
    if (!text || typeof text !== 'string') {
      return false;
    }

    // Common signs of encoding issues
    const encodingIssuePatterns = [
      /\?{2,}/,  // Multiple question marks
      /�/,       // Replacement character
      /[ĂÂ]{2,}/, // Multiple accented characters in sequence
      /r\?+t/,   // "rất" with question marks
      /\?\?ng/,  // "đúng" with question marks
      /\?\?y/,   // "đầy" with question marks
      /\?i\?m/,  // "điểm" with question marks
    ];

    return encodingIssuePatterns.some(pattern => pattern.test(text));
  }

  /**
   * Clean and normalize Vietnamese text
   * @param {string} text - Text to clean
   * @returns {string} - Cleaned text
   */
  static normalizeVietnameseText(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    let normalized = text
      .trim()
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width characters

    return this.fixVietnameseText(normalized);
  }

  /**
   * Validate Vietnamese text for display
   * @param {string} text - Text to validate
   * @returns {Object} - Validation result
   */
  static validateVietnameseText(text) {
    const result = {
      isValid: true,
      hasEncodingIssues: false,
      fixedText: text,
      issues: []
    };

    if (!text || typeof text !== 'string') {
      result.isValid = false;
      result.issues.push('Text is null or not a string');
      return result;
    }

    // Check for encoding issues
    if (this.hasEncodingIssues(text)) {
      result.hasEncodingIssues = true;
      result.fixedText = this.fixVietnameseText(text);
      result.issues.push('UTF-8 encoding issues detected and fixed');
    }

    return result;
  }

  /**
   * Apply encoding fix to an object's text properties
   * @param {Object} obj - Object to fix
   * @param {Array} textFields - Array of field names to fix
   * @returns {Object} - Fixed object
   */
  static fixObjectTextFields(obj, textFields = ['feedback', 'comment', 'description', 'title']) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const fixedObj = { ...obj };

    textFields.forEach(field => {
      if (fixedObj[field] && typeof fixedObj[field] === 'string') {
        const validation = this.validateVietnameseText(fixedObj[field]);
        if (validation.hasEncodingIssues) {
          console.warn(`Fixed encoding issue in field '${field}':`, {
            original: fixedObj[field],
            fixed: validation.fixedText
          });
          fixedObj[field] = validation.fixedText;
        }
      }
    });

    return fixedObj;
  }
}

// Export for use in React components
export default UTF8EncodingFixer;

// Add to window for debugging
if (typeof window !== 'undefined') {
  window.UTF8EncodingFixer = UTF8EncodingFixer;
}
