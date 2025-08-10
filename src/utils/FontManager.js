/**
 * Font Manager for jsPDF Vietnamese Support
 * Centralized font management for PDF generation
 */

import ArialRegularFont from '../fonts/Arial-Regular';
import TimesRegularFont from '../fonts/Times-Regular';

class FontManager {
  static fonts = {
    ARIAL: {
      name: 'Arial',
      file: 'Arial-Regular.ttf',
      data: ArialRegularFont,
      description: 'Arial Regular - Clean, modern font with excellent Vietnamese support'
    },
    TIMES: {
      name: 'Times',
      file: 'Times-Regular.ttf', 
      data: TimesRegularFont,
      description: 'Times New Roman - Classic serif font with Vietnamese support'
    }
  };

  /**
   * Add Vietnamese fonts to jsPDF document
   * @param {jsPDF} doc - jsPDF document instance
   * @param {string} fontType - Font type (ARIAL, TIMES)
   */
  static addVietnameseFont(doc, fontType = 'ARIAL') {
    try {
      const font = this.fonts[fontType];
      if (!font) {
        console.warn(`Font type ${fontType} not found. Using Arial as fallback.`);
        fontType = 'ARIAL';
      }

      const selectedFont = this.fonts[fontType];
      
      // Add font to VFS and register it
      doc.addFileToVFS(selectedFont.file, selectedFont.data);
      doc.addFont(selectedFont.file, selectedFont.name, 'normal');
      
      console.log(`✅ Added Vietnamese font: ${selectedFont.description}`);
      return selectedFont.name;
    } catch (error) {
      console.error('❌ Error adding Vietnamese font:', error);
      throw error;
    }
  }

  /**
   * Set Vietnamese font for document
   * @param {jsPDF} doc - jsPDF document instance
   * @param {string} fontType - Font type (ARIAL, TIMES)
   * @param {number} fontSize - Font size (default: 12)
   */
  static setVietnameseFont(doc, fontType = 'ARIAL', fontSize = 12) {
    try {
      const fontName = this.addVietnameseFont(doc, fontType);
      doc.setFont(fontName);
      doc.setFontSize(fontSize);
      
      console.log(`✅ Set Vietnamese font: ${fontName}, size: ${fontSize}`);
      return fontName;
    } catch (error) {
      console.error('❌ Error setting Vietnamese font:', error);
      throw error;
    }
  }

  /**
   * Get available fonts
   */
  static getAvailableFonts() {
    return Object.keys(this.fonts).map(key => ({
      key,
      ...this.fonts[key]
    }));
  }

  /**
   * Test Vietnamese character rendering
   * @param {jsPDF} doc - jsPDF document instance
   * @param {string} fontType - Font type to test
   */
  static testVietnameseCharacters(doc, fontType = 'ARIAL') {
    this.setVietnameseFont(doc, fontType, 12);
    
    const testStrings = [
      'Tiếng Việt: áàảãạăắằẳẵặâấầẩẫậ',
      'Nguyên âm: éèẻẽẹêếềểễệíìỉĩị',
      'Nguyên âm: óòỏõọôốồổỗộơớờởỡợ',
      'Nguyên âm: úùủũụưứừửữựýỳỷỹỵ',
      'Phụ âm: đĐ',
      'Ví dụ: Nguyễn Văn Minh - TP.Hồ Chí Minh'
    ];
    
    let yPos = 50;
    doc.setFontSize(16);
    doc.text(`Test font ${this.fonts[fontType].name}:`, 20, 30);
    
    doc.setFontSize(12);
    testStrings.forEach(text => {
      doc.text(text, 20, yPos);
      yPos += 15;
    });
    
    return yPos;
  }

  /**
   * Create font comparison PDF
   */
  static createFontComparisonPDF() {
    try {
      const jsPDF = require('jspdf');
      const doc = new jsPDF();
      
      doc.setProperties({
        title: 'Vietnamese Font Comparison',
        subject: 'Font Testing for Vietnamese Characters',
        author: 'Font Manager',
        creator: 'jsPDF Vietnamese Font System'
      });

      let yPos = 20;
      
      // Test each available font
      Object.keys(this.fonts).forEach(fontKey => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        yPos = this.testVietnameseCharacters(doc, fontKey);
        yPos += 20; // Space between fonts
      });
      
      // Add usage instructions
      doc.addPage();
      doc.setFont('Arial');
      doc.setFontSize(16);
      doc.text('HƯỚNG DẪN SỬ DỤNG FONT TIẾNG VIỆT', 20, 30);
      
      doc.setFontSize(12);
      const instructions = [
        '',
        '1. Import FontManager:',
        '   import FontManager from "../utils/FontManager";',
        '',
        '2. Thêm font vào PDF:',
        '   FontManager.setVietnameseFont(doc, "ARIAL", 12);',
        '',
        '3. Các font có sẵn:',
        '   • ARIAL - Font hiện đại, rõ ràng',
        '   • TIMES - Font cổ điển, trang trọng',
        '',
        '4. Sử dụng trong ContractPDFGenerator:',
        '   FontManager.setVietnameseFont(doc, "ARIAL", 14);',
        '   doc.text("Hợp đồng lao động", 20, 50);',
        '',
        '5. Test font:',
        '   FontManager.testVietnameseCharacters(doc, "TIMES");'
      ];
      
      let instructionY = 50;
      instructions.forEach(line => {
        doc.text(line, 20, instructionY);
        instructionY += 8;
      });
      
      doc.save('vietnamese-font-comparison.pdf');
      console.log('✅ Font comparison PDF created: vietnamese-font-comparison.pdf');
      
      return true;
    } catch (error) {
      console.error('❌ Error creating font comparison PDF:', error);
      return false;
    }
  }
}

export default FontManager;
