import jsPDF from 'jspdf';
import moment from 'moment';
import FontManager from './FontManager';

/**
 * Contract PDF Generator Utility
 * Handles all PDF generation logic for contracts
 */
class ContractPDFGenerator {
  
  /**
   * Helper function to handle undefined/null values
   * @param {*} value - The value to check
   * @param {string} defaultValue - Default value if original is null/undefined
   * @returns {string} - The value or default
   */
  static getValue(value, defaultValue = 'N/A') {
    return value || defaultValue;
  }

  /**
   * Generate and display contract PDF
   * @param {Object} contract - Contract data object
   */
  static generateContractPDF(contract) {
    console.log('Generating PDF for contract:', contract);
    const doc = new jsPDF();
    
    // Add Vietnamese font support using FontManager
    FontManager.setVietnameseFont(doc, 'ARIAL', 12);
    
    // Extract contract details with fallback values
    // Try both possible field names to handle mapping issues
    const fullName = this.getValue(contract.fullName);
    const birthDate = contract.birthDate ? moment(contract.birthDate).format('DD/MM/YYYY') : 'N/A';
    const citizenId = this.getValue(contract.citizenId || contract.cccd);
    const address = this.getValue(contract.address);
    const qualification = this.getValue(contract.qualification);
    const subject = this.getValue(contract.subject || contract.position);
    const classLevel = this.getValue(contract.classLevel || contract.educationLevel || contract.level);
    const startDate = contract.startDate ? moment(contract.startDate).format('DD/MM/YYYY') : 'N/A';
    const endDate = contract.endDate ? moment(contract.endDate).format('DD/MM/YYYY') : 'N/A';
    const salary = contract.salary ? contract.salary.toLocaleString('vi-VN') : 'N/A';
    const contractType = contract.type === 'teacher' ? 'Giáo viên' : 'Nhân viên';
    const department = this.getValue(contract.department);
    const comments = this.getValue(contract.comments || contract.evaluation);
    const workSchedule = this.getValue(contract.workSchedule);
    const workShifts = contract.workShifts ? (Array.isArray(contract.workShifts) ? contract.workShifts.join(', ') : contract.workShifts) : 'N/A';
    const workDays = contract.workDays ? (Array.isArray(contract.workDays) ? contract.workDays.join(', ') : contract.workDays) : 'N/A';
    
    console.log('Extracted PDF values:', { citizenId, classLevel, subject, comments, workSchedule });
    
    // Set document properties
    doc.setProperties({
      title: `Hợp đồng ${contractType} - ${fullName}`,
      subject: 'Hợp đồng lao động',
      author: 'ClassroomApp',
      keywords: 'hợp đồng, lao động, giáo viên, nhân viên',
      creator: 'ClassroomApp'
    });
    
    // Add document header
    this.addDocumentHeader(doc);
    
    // Add contract parties information
    let yPosition = this.addContractParties(doc, {
      fullName,
      birthDate,
      citizenId,
      address,
      qualification,
      phoneNumber: contract.phoneNumber,
      email: contract.email
    });
    
    // Add contract terms
    yPosition = this.addContractTerms(doc, yPosition, {
      subject,
      classLevel,
      startDate,
      endDate,
      salary,
      workSchedule,
      workShifts,
      workDays
    });
    
    // Add contract clauses
    yPosition = this.addContractClauses(doc, yPosition, {
      startDate,
      endDate,
      salary
    });
    
    // Add signatures
    this.addSignatures(doc, yPosition);
    
    // Open PDF in new tab
    window.open(doc.output('bloburl'), '_blank');
  }

  /**
   * Add document header
   * @param {jsPDF} doc - PDF document instance
   */
  static addDocumentHeader(doc) {
    doc.setCharSpace(0);
    // Ensure Vietnamese font is set for header
    FontManager.setVietnameseFont(doc, 'ARIAL', 14);
    doc.text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', 55, 20);
    doc.setFontSize(12);
    doc.text('Độc lập - Tự do - Hạnh phúc', 75, 30);
    doc.text('---------------------', 80, 35);
    doc.setFontSize(14);
    doc.text('HỢP ĐỒNG LAO ĐỘNG', 70, 50);
    doc.setFontSize(12);
    doc.text('(Về việc: Tuyển dụng giáo viên giảng dạy)', 60, 60);
    doc.text('Số: ........../HĐLĐ', 20, 70);
    doc.text('Căn cứ:', 20, 80);
    
    let y = 90;
    [
      '- Bộ luật Lao động nước Cộng hòa xã hội chủ nghĩa Việt Nam năm 2019;',
      '- Luật Giáo dục năm 2019 và các văn bản hướng dẫn thi hành;',
      '- Nhu cầu và năng lực của hai bên.'
    ].forEach(line => {
      const wrapped = doc.splitTextToSize(line, 160);
      doc.text(wrapped, 30, y);
      y += wrapped.length * 7;
    });
    
    const wrappedIntro = doc.splitTextToSize('Hôm nay, ngày .... tháng .... năm ........, tại Trung tâm bồi dưỡng kiến thức Minh Việt, chúng tôi gồm:', 160);
    doc.text(wrappedIntro, 20, y);
  }

  /**
   * Add contract parties information
   * @param {jsPDF} doc - PDF document instance
   * @param {Object} contractorInfo - Contractor information
   * @returns {number} - Next Y position
   */
  static addContractParties(doc, contractorInfo) {
    let yPosition = 130;
    
    // Party A (Employer)
    // Ensure Vietnamese font is set
    FontManager.setVietnameseFont(doc, 'ARIAL', 14);
    doc.text('1. Bên A (Bên thuê):', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Trung tâm bồi dưỡng kiến thức Minh Việt', 30, yPosition);
    yPosition += 10;
    doc.text('Mã số thuế: 123456789', 30, yPosition);
    yPosition += 10;
    doc.text('Địa chỉ: 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', 30, yPosition);
    yPosition += 10;
    doc.text('Đại diện: Ông Nguyễn Văn A', 30, yPosition);
    yPosition += 10;
    doc.text('Chức vụ: Giám đốc', 30, yPosition);
    yPosition += 10;
    doc.text('Số điện thoại: 0123 456 789    Email: info@minhviet.edu.vn', 30, yPosition);
    yPosition += 10;
    
    // Party B (Employee)
    FontManager.setVietnameseFont(doc, 'ARIAL', 14);
    doc.text('2. Bên B (Bên được thuê):', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`Họ và tên: ${contractorInfo.fullName}`, 30, yPosition);
    yPosition += 10;
    doc.text(`Sinh ngày: ${contractorInfo.birthDate}`, 30, yPosition);
    yPosition += 10;
    doc.text(`Số CCCD: ${contractorInfo.citizenId}`, 30, yPosition);
    yPosition += 10;
    doc.text(`Địa chỉ: ${contractorInfo.address}`, 30, yPosition);
    yPosition += 10;
    doc.text(`Số điện thoại: ${contractorInfo.phoneNumber || 'N/A'}    Email: ${contractorInfo.email || 'N/A'}`, 30, yPosition);
    yPosition += 10;
    doc.text(`Trình độ chuyên môn: ${contractorInfo.qualification}`, 30, yPosition);
    yPosition += 10;
    
    return yPosition;
  }

  /**
   * Add contract terms
   * @param {jsPDF} doc - PDF document instance
   * @param {number} yPosition - Current Y position
   * @param {Object} terms - Contract terms
   * @returns {number} - Next Y position
   */
  static addContractTerms(doc, yPosition, terms) {
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Ensure Vietnamese font is set for contract terms
    FontManager.setVietnameseFont(doc, 'ARIAL', 14);
    doc.text('Hai bên cùng thống nhất ký kết hợp đồng với các điều khoản sau:', 20, yPosition);
    yPosition += 10;
    doc.text('Điều 1: Nội dung hợp đồng', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Bên A thuê Bên B làm giáo viên giảng dạy với nội dung công việc như sau:', 30, yPosition);
    yPosition += 10;
    doc.text(`- Môn học giảng dạy: ${terms.subject}`, 40, yPosition);
    yPosition += 10;
    doc.text(`- Lớp học: ${terms.classLevel}`, 40, yPosition);
    yPosition += 10;
    doc.text(`- Thời gian giảng dạy: Từ ${terms.startDate} đến ${terms.endDate}`, 40, yPosition);
    yPosition += 10;
    
    // Add working schedule information if available
    if (terms.workSchedule && terms.workSchedule !== 'N/A') {
      doc.text(`- Thời gian làm việc: ${terms.workSchedule}`, 40, yPosition);
      yPosition += 10;
    }
    if (terms.workShifts && terms.workShifts !== 'N/A') {
      doc.text(`- Ca làm việc: ${terms.workShifts}`, 40, yPosition);
      yPosition += 10;
    }
    if (terms.workDays && terms.workDays !== 'N/A') {
      doc.text(`- Ngày trong tuần: ${terms.workDays}`, 40, yPosition);
      yPosition += 10;
    }
    
    // Use splitTextToSize for long text to prevent cutting
    const locationText = doc.splitTextToSize('- Địa điểm giảng dạy: Trung tâm bồi dưỡng kiến thức Minh Việt', 150);
    doc.text(locationText, 40, yPosition);
    yPosition += locationText.length * 7;
    
    const qualityText = doc.splitTextToSize('- Bên B phải tuân thủ đầy đủ, đúng chương trình dạy, đảm bảo chất lượng học tập của học sinh.', 150);
    doc.text(qualityText, 40, yPosition);
    yPosition += qualityText.length * 7;
    
    return yPosition;
  }

  /**
   * Add contract clauses
   * @param {jsPDF} doc - PDF document instance
   * @param {number} yPosition - Current Y position
   * @param {Object} clauseData - Clause data
   * @returns {number} - Next Y position
   */
  static addContractClauses(doc, yPosition, clauseData) {
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Article 2: Contract duration and working regime
    FontManager.setVietnameseFont(doc, 'ARIAL', 14);
    doc.text('Điều 2: Thời hạn hợp đồng và chế độ làm việc', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('- Loại hợp đồng lao động: Có kỳ hạn.', 30, yPosition);
    yPosition += 10;
    doc.text(`- Thời hạn hợp đồng: Từ ${clauseData.startDate} đến ${clauseData.endDate}`, 30, yPosition);
    yPosition += 10;
    doc.text('- Thời gian làm việc của bên B: 8 giờ/ngày.', 30, yPosition);
    yPosition += 10;
    // Wrap equipment text
    const equipmentText = doc.splitTextToSize('- Bên B được cấp phát những dụng cụ làm việc gồm: Các tài liệu phục vụ cho giảng dạy, dụng cụ giảng dạy, thiết bị dạy học.', 160);
    doc.text(equipmentText, 30, yPosition);
    yPosition += equipmentText.length * 7;
    
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Article 3: Salary and payment method
    FontManager.setVietnameseFont(doc, 'ARIAL', 14);
    doc.text('Điều 3: Mức lương và phương thức thanh toán', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    // Wrap salary text
    const salaryText = doc.splitTextToSize(`- Bên A đồng ý chi trả cho bên B mức lương việc giảng dạy với số tiền là: ${clauseData.salary} đồng/tháng`, 160);
    doc.text(salaryText, 30, yPosition);
    yPosition += salaryText.length * 7;
    
    const paymentText = doc.splitTextToSize('- Thời hạn trả tiền lương: Bên A sẽ trả tiền lương cho bên B 01 lần vào các ngày 5 hàng tháng.', 160);
    doc.text(paymentText, 30, yPosition);
    yPosition += paymentText.length * 7;
    yPosition += 10;
    doc.text('- Phương thức thanh toán: chuyển khoản.', 30, yPosition);
    yPosition += 10;
    // Wrap long salary adjustment text
    const salaryAdjustText = doc.splitTextToSize('- Bên A có quyền điều chỉnh mức lương theo hiệu quả công việc và các yêu cầu khác phát sinh mà không cần có sự đồng ý của bên B, nhưng không được thấp hơn quá 10% của mức lương tháng trước đó tại thời điểm đang chi trả lương cho bên B.', 160);
    doc.text(salaryAdjustText, 30, yPosition);
    yPosition += salaryAdjustText.length * 7;
    
    const bonusText = doc.splitTextToSize('- Ngoài mức lương bên A chi trả cho bên B, Bên B được hưởng tiền thưởng hàng tháng, hàng kỳ, cuối năm và các khoản khác theo thỏa thuận của hai bên (nếu có).', 160);
    doc.text(bonusText, 30, yPosition);
    yPosition += bonusText.length * 7;
    yPosition += 15;
    
    // Continue with other articles (Rights and obligations, termination, etc.)
    yPosition = this.addRightsAndObligations(doc, yPosition);
    yPosition = this.addTerminationClauses(doc, yPosition);
    yPosition = this.addDisputeResolution(doc, yPosition);
    
    return yPosition;
  }

  /**
   * Add rights and obligations clauses
   * @param {jsPDF} doc - PDF document instance
   * @param {number} yPosition - Current Y position
   * @returns {number} - Next Y position
   */
  static addRightsAndObligations(doc, yPosition) {
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Article 4: Rights and obligations of Party A
    FontManager.setVietnameseFont(doc, 'ARIAL', 14);
    doc.text('Điều 4: Quyền và nghĩa vụ của bên A', 20, yPosition);
    yPosition += 10;
    doc.text('4.1. Quyền lợi của bên A:', 25, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    // Wrap long rights text
    const rightText1 = doc.splitTextToSize('- Bên A có quyền yêu cầu giáo viên thực hiện đúng nội dung giảng dạy theo hợp đồng và có quyền kiểm tra, đánh giá chất lượng giảng dạy.', 155);
    doc.text(rightText1, 35, yPosition);
    yPosition += rightText1.length * 7;
    
    const rightText2 = doc.splitTextToSize('- Bên A có quyền yêu cầu điều chỉnh phương pháp giảng dạy của Bên B nếu thấy không phù hợp với yêu cầu, tiêu chuẩn giảng dạy của bên A.', 155);
    doc.text(rightText2, 35, yPosition);
    yPosition += rightText2.length * 7;
    
    const rightText3 = doc.splitTextToSize('- Bên A có quyền chấm dứt hợp đồng ngay lập tức nếu Bên B vi phạm nghiêm trọng các quy định, nội quy của lớp học hoặc hợp đồng.', 155);
    doc.text(rightText3, 35, yPosition);
    yPosition += rightText3.length * 7;
    doc.text('4.2. Nghĩa vụ của Bên A:', 25, yPosition);
    yPosition += 10;
    // Wrap obligations text
    const obligText1 = doc.splitTextToSize('- Bên A có nghĩa vụ cung cấp đầy đủ cơ sở vật chất, trang thiết bị, tài liệu, dụng cụ giảng dạy cần thiết cho Bên B.', 155);
    doc.text(obligText1, 35, yPosition);
    yPosition += obligText1.length * 7;
    
    const obligText2 = doc.splitTextToSize('- Bên A có nghĩa vụ thanh toán đúng hạn tiền lương cho Bên B theo thỏa thuận trong hợp đồng.', 155);
    doc.text(obligText2, 35, yPosition);
    yPosition += obligText2.length * 7;
    
    const obligText3 = doc.splitTextToSize('- Bên A không có nghĩa vụ cung cấp bất kỳ hỗ trợ nào ngoài các điều khoản đã ghi trong hợp đồng.', 155);
    doc.text(obligText3, 35, yPosition);
    yPosition += obligText3.length * 7;
    yPosition += 10;
    
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Article 5: Rights and obligations of Party B
    FontManager.setVietnameseFont(doc, 'ARIAL', 14);
    doc.text('Điều 5: Quyền và nghĩa vụ của bên B', 20, yPosition);
    yPosition += 10;
    doc.text('5.1. Quyền lợi của bên B:', 25, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('- Bên B có quyền yêu cầu bên A thanh toán tiền lương đầy đủ, đúng hạn theo điều 3 hợp đồng này.', 35, yPosition);
    yPosition += 10;
    // Wrap Party B rights text
    const rightBText1 = doc.splitTextToSize('- Bên B có quyền được yêu cầu hỗ trợ tài liệu, trang thiết bị dạy học từ bên A, nhưng phải đảm bảo việc sử dụng những tài liệu này chỉ phục vụ cho mục đích giảng dạy ở trên lớp.', 155);
    doc.text(rightBText1, 35, yPosition);
    yPosition += rightBText1.length * 7;
    
    const rightBText2 = doc.splitTextToSize('- Bên B có quyền được nghỉ dạy trong trường hợp có lý do chính đáng và phải thông báo cho bên A trước 03 ngày.', 155);
    doc.text(rightBText2, 35, yPosition);
    yPosition += rightBText2.length * 7;
    
    const rightBText3 = doc.splitTextToSize('- Trường hợp bên A chậm thanh toán lương quá 15 ngày, bên B có quyền tạm ngưng giảng dạy cho đến khi được thanh toán.', 155);
    doc.text(rightBText3, 35, yPosition);
    yPosition += rightBText3.length * 7;
    yPosition += 10;
    // Wrap work environment text
    const workEnvText = doc.splitTextToSize('- Bên B được đảm bảo môi trường làm việc phù hợp và được hưởng các quyền lợi khác (nếu có).', 155);
    doc.text(workEnvText, 35, yPosition);
    yPosition += workEnvText.length * 7;
    yPosition += 10;
    doc.text('5.2. Nghĩa vụ của bên B:', 25, yPosition);
    yPosition += 10;
    // Wrap Party B obligations text
    const obligBText1 = doc.splitTextToSize('- Bên B phải thực hiện đầy đủ, đúng chương trình dạy, đảm bảo chất lượng học tập của học sinh.', 155);
    doc.text(obligBText1, 35, yPosition);
    yPosition += obligBText1.length * 7;
    
    const obligBText2 = doc.splitTextToSize('- Bên B không được nghỉ dạy đột xuất mà không có lý do chính đáng, trường hợp nghỉ phải thông báo trước ít nhất 3 ngày.', 155);
    doc.text(obligBText2, 35, yPosition);
    yPosition += obligBText2.length * 7;
    
    const obligBText3 = doc.splitTextToSize('- Bên B phải giữ gìn đạo đức nghề nghiệp, không có hành vi thiếu chuyên nghiệp hoặc vi phạm pháp luật trong suốt thời gian làm việc, giao kết hợp đồng với bên A.', 155);
    doc.text(obligBText3, 35, yPosition);
    yPosition += obligBText3.length * 7;
    
    const obligBText4 = doc.splitTextToSize('- Bên B không được tự ý sử dụng tài liệu, chương trình dạy học của bên A cho mục đích cá nhân, không liên quan đến công việc bên A thuê bên B.', 155);
    doc.text(obligBText4, 35, yPosition);
    yPosition += obligBText4.length * 7;
    
    const obligBText5 = doc.splitTextToSize('- Bên B phải tuân thủ đầy đủ, đúng nội quy, quy định của lớp học và các yêu cầu của bên A.', 155);
    doc.text(obligBText5, 35, yPosition);
    yPosition += obligBText5.length * 7;
    yPosition += 10;
    
    return yPosition;
  }

  /**
   * Add contract termination clauses
   * @param {jsPDF} doc - PDF document instance
   * @param {number} yPosition - Current Y position
   * @returns {number} - Next Y position
   */
  static addTerminationClauses(doc, yPosition) {
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Article 6: Contract termination
    FontManager.setVietnameseFont(doc, 'ARIAL', 14);
    doc.text('Điều 6: Chấm dứt hợp đồng', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Hợp đồng sẽ chấm dứt trong các trường hợp sau:', 30, yPosition);
    yPosition += 10;
    doc.text('- Hết thời hạn hợp đồng mà hai bên không gia hạn.', 40, yPosition);
    yPosition += 10;
    doc.text('- Hai bên thỏa thuận chấm dứt hợp đồng trước thời hạn.', 40, yPosition);
    yPosition += 10;
    // Wrap termination text
    const termText1 = doc.splitTextToSize('- Một trong hai bên vi phạm nghiêm trọng điều khoản hợp đồng thì bên còn lại được đơn phương chấm dứt hợp đồng.', 150);
    doc.text(termText1, 40, yPosition);
    yPosition += termText1.length * 7;
    
    const termText2 = doc.splitTextToSize('- Giáo viên không đáp ứng yêu cầu giảng dạy, chất lượng học sinh hoặc vi phạm nội quy của bên thuê đặt ra.', 150);
    doc.text(termText2, 40, yPosition);
    yPosition += termText2.length * 7;
    yPosition += 10;
    doc.text('- Bên A không thực hiện thanh toán đúng hạn và không khắc phục sau 15 ngày.', 40, yPosition);
    yPosition += 10;
    
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Article 7: Contract violation handling
    FontManager.setVietnameseFont(doc, 'ARIAL', 14);
    doc.text('Điều 7: Xử lý vi phạm hợp đồng', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    // Wrap violation handling text
    const violText1 = doc.splitTextToSize('- Nếu Bên B vi phạm nội quy hoặc tự ý nghỉ dạy mà không có lý do chính đáng, Bên A có quyền chấm dứt hợp đồng ngay lập tức và không thanh toán lương cho các buổi dạy chưa hoàn thành.', 160);
    doc.text(violText1, 30, yPosition);
    yPosition += violText1.length * 7;
    
    const violText2 = doc.splitTextToSize('- Nếu Bên A không thanh toán đúng hạn, Bên B có quyền tạm ngưng giảng dạy cho đến khi được thanh toán đầy đủ.', 160);
    doc.text(violText2, 30, yPosition);
    yPosition += violText2.length * 7;
    
    const violText3 = doc.splitTextToSize('- Trường hợp một trong hai bên gây thiệt hại do vi phạm hợp đồng, bên bị thiệt hại có quyền yêu cầu bồi thường toàn bộ thiệt hại do vi phạm gây ra.', 160);
    doc.text(violText3, 30, yPosition);
    yPosition += violText3.length * 7;
    yPosition += 15;
    
    return yPosition;
  }

  /**
   * Add dispute resolution clause
   * @param {jsPDF} doc - PDF document instance
   * @param {number} yPosition - Current Y position
   * @returns {number} - Next Y position
   */
  static addDisputeResolution(doc, yPosition) {
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Article 8: Dispute resolution
    FontManager.setVietnameseFont(doc, 'ARIAL', 14);
    doc.text('Điều 8: Giải quyết tranh chấp', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    // Wrap dispute resolution text
    const disputeText1 = doc.splitTextToSize('Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng, hòa giải. Nếu không đạt được thỏa thuận, tranh chấp sẽ được đưa ra tòa án có thẩm quyền giải quyết.', 160);
    doc.text(disputeText1, 30, yPosition);
    yPosition += disputeText1.length * 7;
    
    const disputeText2 = doc.splitTextToSize('Hợp đồng này có hiệu lực từ ngày ký và được lập thành 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý như nhau.', 160);
    doc.text(disputeText2, 30, yPosition);
    yPosition += disputeText2.length * 7;
    
    const disputeText3 = doc.splitTextToSize('Hai bên cam kết thực hiện đúng các điều khoản của hợp đồng.', 160);
    doc.text(disputeText3, 30, yPosition);
    yPosition += disputeText3.length * 7;
    yPosition += 20;
    
    return yPosition;
  }

  /**
   * Add signature section
   * @param {jsPDF} doc - PDF document instance
   * @param {number} yPosition - Current Y position
   */
  static addSignatures(doc, yPosition) {
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Signatures
    FontManager.setVietnameseFont(doc, 'ARIAL', 14);
    doc.text('ĐẠI DIỆN BÊN A', 30, yPosition);
    doc.text('ĐẠI DIỆN BÊN B', 130, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('(Ký và ghi rõ họ tên)', 25, yPosition);
    doc.text('(Ký và ghi rõ họ tên)', 125, yPosition);
  }
}

export default ContractPDFGenerator;
