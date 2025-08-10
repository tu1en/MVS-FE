/**
 * Vietnamese Font Test for jsPDF
 * This file tests Vietnamese character rendering in PDF
 */

import jsPDF from 'jspdf';
import ArialRegularFont from '../fonts/Arial-Regular';

/**
 * Test Vietnamese font rendering
 */
export const testVietnameseFont = () => {
  console.log('Testing Vietnamese font support...');
  
  try {
    const doc = new jsPDF();
    
    // Add Vietnamese font support
    doc.addFileToVFS('Arial-Regular.ttf', ArialRegularFont);
    doc.addFont('Arial-Regular.ttf', 'Arial', 'normal');
    doc.setFont('Arial');
    
    // Set document properties
    doc.setProperties({
      title: 'Test Tiếng Việt',
      subject: 'Vietnamese Font Test',
      author: 'Contract Management System',
      creator: 'jsPDF with Vietnamese Support'
    });
    
    // Title
    doc.setFontSize(20);
    doc.text('TEST TIẾNG VIỆT TRONG PDF', 20, 30);
    
    // Test all Vietnamese characters
    doc.setFontSize(12);
    let yPos = 50;
    
    const testTexts = [
      'Họ và tên: Nguyễn Văn Minh',
      'Địa chỉ: 123 Đường Lê Lợi, Quận 1, TP.HCM',
      'Số CCCD: 123456789012',
      'Ngày sinh: 15/08/1990',
      '',
      'CÁC KÝ TỰ TIẾNG VIỆT:',
      'Nguyên âm: a á à ả ã ạ ă ắ ằ ẳ ẵ ặ â ấ ầ ẩ ẫ ậ',
      'Nguyên âm: e é è ẻ ẽ ẹ ê ế ề ể ễ ệ',
      'Nguyên âm: i í ì ỉ ĩ ị',
      'Nguyên âm: o ó ò ỏ õ ọ ô ố ồ ổ ỗ ộ ơ ớ ờ ở ỡ ợ',
      'Nguyên âm: u ú ù ủ ũ ụ ư ứ ừ ử ữ ự',
      'Nguyên âm: y ý ỳ ỷ ỹ ỵ',
      'Phụ âm: đ Đ',
      '',
      'VÍ DỤ CÂU TIẾNG VIỆT:',
      '• Hợp đồng lao động có thời hạn',
      '• Mức lương: 15.000.000 VNĐ/tháng',
      '• Thời gian làm việc: 8h00 - 17h00',
      '• Ngày bắt đầu: 01/01/2024',
      '• Ngày kết thúc: 31/12/2024',
      '',
      'THÔNG TIN HỢP ĐỒNG:',
      'Bên A: Công ty TNHH Giáo dục ABC',
      'Bên B: Ông/Bà Nguyễn Thị Hương',
      'Chức vụ: Giáo viên Toán - Lý',
      'Trình độ: Thạc sĩ Sư phạm',
      'Kinh nghiệm: 5 năm giảng dạy'
    ];
    
    testTexts.forEach((text, index) => {
      if (text === '') {
        yPos += 5; // Add spacing for empty lines
      } else {
        doc.text(text, 20, yPos);
        yPos += 8;
        
        // Add new page if needed
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
      }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Trang ${i}/${pageCount} - Test font Tiếng Việt`, 20, 290);
    }
    
    // Save or display PDF
    doc.save('test-vietnamese-font.pdf');
    console.log('✅ Vietnamese font test completed! PDF saved as "test-vietnamese-font.pdf"');
    
    return true;
  } catch (error) {
    console.error('❌ Vietnamese font test failed:', error);
    return false;
  }
};

/**
 * Test function for contract PDF with Vietnamese text
 */
export const testContractWithVietnamese = () => {
  const testContract = {
    fullName: 'Nguyễn Thị Hương',
    birthDate: '1990-08-15',
    citizenId: '123456789012',
    address: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
    qualification: 'Thạc sĩ Sư phạm Toán học',
    subject: 'Toán - Lý',
    classLevel: 'Lớp 10, 11, 12',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    salary: 15000000,
    contractType: 'TEACHER',
    department: 'Phòng Giáo dục',
    comments: 'Giáo viên có kinh nghiệm, nhiệt tình',
    workSchedule: 'Ca sáng và chiều',
    workShifts: ['Sáng: 7h00-11h30', 'Chiều: 13h30-17h00'],
    workDays: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6']
  };
  
  console.log('Testing contract PDF with Vietnamese data...');
  
  // Import and test the actual ContractPDFGenerator
  // This would be called from your component
  console.log('Sample contract data for testing:', testContract);
  console.log('Use this data to test ContractPDFGenerator.generateContractPDF()');
  
  return testContract;
};

export default { testVietnameseFont, testContractWithVietnamese };
