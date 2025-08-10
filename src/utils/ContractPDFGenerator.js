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
   * Translate work shifts from English to Vietnamese
   * @param {string} shifts - Comma-separated work shifts in English
   * @returns {string} - Work shifts in Vietnamese
   */
  static translateWorkShifts(shifts) {
    if (!shifts) return 'N/A';
    
    const shiftTranslations = {
      'morning': 'sáng',
      'afternoon': 'chiều', 
      'evening': 'tối',
      'night': 'đêm'
    };
    
    return shifts.split(',')
      .map(shift => shift.trim().toLowerCase())
      .map(shift => shiftTranslations[shift] || shift)
      .join(', ');
  }

  /**
   * Translate work days from English to Vietnamese
   * @param {string} days - Comma-separated work days in English
   * @returns {string} - Work days in Vietnamese
   */
  static translateWorkDays(days) {
    if (!days) return 'N/A';
    
    const dayTranslations = {
      'monday': 'thứ hai',
      'tuesday': 'thứ ba',
      'wednesday': 'thứ tư',
      'thursday': 'thứ năm',
      'friday': 'thứ sáu',
      'saturday': 'thứ bảy',
      'sunday': 'chủ nhật'
    };
    
    return days.split(',')
      .map(day => day.trim().toLowerCase())
      .map(day => dayTranslations[day] || day)
      .join(', ');
  }

  /**
   * Generate and display contract PDF
   * @param {Object} contract - Contract data object
   */
  static generateContractPDF(contract) {
    console.log('Generating PDF for contract:', contract);
    
    // Determine contract type based on contractType or position
    const isTeacher = contract.contractType === 'TEACHER' || 
                     (contract.position && contract.position.toLowerCase().includes('giáo viên'));
    
    if (isTeacher) {
      this.generateTeacherContract(contract);
    } else {
      this.generateStaffContract(contract);
    }
  }

  /**
   * Generate Teacher Contract PDF (existing template)
   * @param {Object} contract - Contract data object
   */
  static generateTeacherContract(contract) {
    console.log('Generating Teacher PDF for contract:', contract);
    const doc = new jsPDF();
    
    // Add Vietnamese font support using FontManager
    FontManager.setVietnameseFont(doc, 'ARIAL', 12);
    
    // Extract contract details with fallback values
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
    const contractType = 'Giáo viên';
    const department = this.getValue(contract.department);
    const comments = this.getValue(contract.comments || contract.evaluation);
    const workSchedule = this.getValue(contract.workSchedule);
    const workShifts = contract.workShifts ? (Array.isArray(contract.workShifts) ? contract.workShifts.join(', ') : contract.workShifts) : 'N/A';
    const workDays = contract.workDays ? (Array.isArray(contract.workDays) ? contract.workDays.join(', ') : contract.workDays) : 'N/A';
    
    console.log('Extracted Teacher PDF values:', { citizenId, classLevel, subject, comments, workSchedule });
    
    // Set document properties
    doc.setProperties({
      title: `Hợp đồng ${contractType} - ${fullName}`,
      subject: 'Hợp đồng lao động',
      author: 'ClassroomApp',
      keywords: 'hợp đồng, lao động, giáo viên',
      creator: 'ClassroomApp'
    });
    
    // Add document header
    this.addDocumentHeader(doc, contract);
    
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
   * Generate Staff Contract PDF (HR/Accountant template)
   * @param {Object} contract - Contract data object
   */
  static generateStaffContract(contract) {
    console.log('Generating Staff PDF for contract:', contract);
    const doc = new jsPDF();
    
    // Add Vietnamese font support using FontManager
    FontManager.setVietnameseFont(doc, 'ARIAL', 12);
    
    // Extract contract details with fallback values
    const fullName = this.getValue(contract.fullName);
    const birthDate = contract.birthDate ? moment(contract.birthDate).format('DD/MM/YYYY') : 'N/A';
    const citizenId = this.getValue(contract.citizenId || contract.cccd);
    const address = this.getValue(contract.address);
    const qualification = this.getValue(contract.qualification);
    const position = this.getValue(contract.position);
    const startDate = contract.startDate ? moment(contract.startDate).format('DD/MM/YYYY') : 'N/A';
    const endDate = contract.endDate ? moment(contract.endDate).format('DD/MM/YYYY') : 'N/A';
    const netSalary = contract.netSalary ? contract.netSalary.toLocaleString('vi-VN') : 
                     (contract.salary ? contract.salary.toLocaleString('vi-VN') : 'N/A');
    // Get contract ID - prioritize contractId field from backend
    const contractId = this.getValue(
      contract.contractId || 
      contract.id || 
      contract.contractNumber || 
      contract.number,
      'N/A'
    );
    
    console.log('Extracted Staff PDF values:', { fullName, position, netSalary, contractId });
    
    // Set document properties
    doc.setProperties({
      title: `Hợp đồng Nhân viên - ${fullName}`,
      subject: 'Hợp đồng lao động',
      author: 'ClassroomApp',
      keywords: 'hợp đồng, lao động, nhân viên, hr, kế toán',
      creator: 'ClassroomApp'
    });
    
    // Add staff contract content
    this.addStaffContractHeader(doc, contractId);
    let yPosition = this.addStaffContractParties(doc, {
      fullName,
      birthDate,
      qualification,
      address
    });
    
    yPosition = this.addStaffContractTerms(doc, yPosition, {
      startDate,
      endDate,
      position
    });
    
    yPosition = this.addStaffWorkingConditions(doc, yPosition);
    yPosition = this.addStaffRightsObligations(doc, yPosition, netSalary);
    yPosition = this.addStaffEmployerRightsObligations(doc, yPosition);
    yPosition = this.addStaffImplementationClauses(doc, yPosition, startDate);
    this.addStaffSignatures(doc, yPosition);
    
    // Open PDF in new tab
    window.open(doc.output('bloburl'), '_blank');
  }

  /**
   * Add document header
   * @param {jsPDF} doc - PDF document instance
   * @param {Object} contract - Contract data object
   */
  static addDocumentHeader(doc, contract) {
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
    
    // Get contract ID - prioritize contractId field from backend
    const contractId = this.getValue(
      contract.contractId || 
      contract.id || 
      contract.contractNumber || 
      contract.number,
      'N/A'
    );
    doc.text(`Số: ${contractId}/HĐLĐ`, 20, 70);
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
      const vietnameseShifts = this.translateWorkShifts(terms.workShifts);
      doc.text(`- Ca làm việc: ${vietnameseShifts}`, 40, yPosition);
      yPosition += 10;
    }
    if (terms.workDays && terms.workDays !== 'N/A') {
      const vietnameseDays = this.translateWorkDays(terms.workDays);
      doc.text(`- Ngày trong tuần: ${vietnameseDays}`, 40, yPosition);
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

  // =================== STAFF CONTRACT METHODS ===================

  /**
   * Add staff contract header
   * @param {jsPDF} doc - PDF document instance
   * @param {string} contractId - Contract ID
   */
  static addStaffContractHeader(doc, contractId) {
    // Left side - Center info
    FontManager.setVietnameseFont(doc, 'ARIAL', 12);
    doc.text('Trung tâm bồi dưỡng kiến thức', 20, 20);
    doc.text('Minh Việt', 20, 30);
    doc.text(`Số: ${contractId}/HĐLĐ`, 20, 40);
    
    // Right side - Vietnam header
    doc.text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', 105, 20);
    doc.text('Độc lập – Tự do – Hạnh phúc', 125, 30);
    doc.text('-------- o0o --------', 135, 40);
    
    // Main title
    FontManager.setVietnameseFont(doc, 'ARIAL', 16);
    doc.text('HỢP ĐỒNG LAO ĐỘNG', 75, 60);
    FontManager.setVietnameseFont(doc, 'ARIAL', 12);
    doc.text('(Căn cứ Luật Lao động 2019 và các văn bản hiện hành)', 55, 70);
  }

  /**
   * Add staff contract parties
   * @param {jsPDF} doc - PDF document instance
   * @param {Object} contractorInfo - Contractor information
   * @returns {number} - Next Y position
   */
  static addStaffContractParties(doc, contractorInfo) {
    let yPosition = 90;
    
    FontManager.setVietnameseFont(doc, 'ARIAL', 12);
    
    // Party A (Employer)
    const partyAText = doc.splitTextToSize('Chúng tôi, một bên là: Ông Nguyễn Văn An', 160);
    doc.text(partyAText, 20, yPosition);
    yPosition += partyAText.length * 7;
    
    doc.text('Quốc tịch: VIỆT NAM', 20, yPosition);
    doc.text('Chức vụ: GIÁM ĐỐC', 120, yPosition);
    yPosition += 10;
    
    const representText = doc.splitTextToSize('Đại diện cho (1): Trung tâm bồi dưỡng kiến thức Minh Việt', 160);
    doc.text(representText, 20, yPosition);
    yPosition += representText.length * 7;
    
    doc.text('Mã số thuế: 123456789', 20, yPosition);
    doc.text('Điện thoại: 0123 456 789', 120, yPosition);
    yPosition += 10;
    
    const addressText = doc.splitTextToSize('Địa chỉ: 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', 160);
    doc.text(addressText, 20, yPosition);
    yPosition += addressText.length * 7 + 10;
    
    // Party B (Employee)
    const partyBText = doc.splitTextToSize(`Và một bên là Ông (Bà): ${contractorInfo.fullName}`, 160);
    doc.text(partyBText, 20, yPosition);
    yPosition += partyBText.length * 7;
    
    doc.text('Quốc tịch: Việt Nam', 20, yPosition);
    yPosition += 10;
    
    doc.text(`Sinh ngày: ${contractorInfo.birthDate}`, 20, yPosition);
    yPosition += 10;
    
    const qualificationText = doc.splitTextToSize(`Bằng cấp chuyên môn (2): ${contractorInfo.qualification}`, 160);
    doc.text(qualificationText, 20, yPosition);
    yPosition += qualificationText.length * 7;
    
    const addressEmployeeText = doc.splitTextToSize(`Địa chỉ thường trú: ${contractorInfo.address}`, 160);
    doc.text(addressEmployeeText, 20, yPosition);
    yPosition += addressEmployeeText.length * 7;
    
    doc.text('Số sổ BHXH (nếu có):', 20, yPosition);
    yPosition += 10;
    doc.text('Mã số thuế (nếu có):', 20, yPosition);
    yPosition += 10;
    
    doc.text('Sau đây gọi tắt là Người lao động', 20, yPosition);
    yPosition += 15;
    
    const agreementText = doc.splitTextToSize('Hai bên thỏa thuận ký kết hợp đồng lao động và cam kết làm đúng những điều khoản sau đây:', 160);
    doc.text(agreementText, 20, yPosition);
    yPosition += agreementText.length * 7 + 15;
    
    return yPosition;
  }

  /**
   * Add staff contract terms
   * @param {jsPDF} doc - PDF document instance
   * @param {number} yPosition - Current Y position
   * @param {Object} terms - Contract terms
   * @returns {number} - Next Y position
   */
  static addStaffContractTerms(doc, yPosition, terms) {
    // Add new page if needed
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    
    FontManager.setVietnameseFont(doc, 'ARIAL', 14);
    doc.text('Điều 1: Thời hạn và công việc hợp đồng', 20, yPosition);
    yPosition += 10;
    
    FontManager.setVietnameseFont(doc, 'ARIAL', 12);
    doc.text('- Loại hợp đồng lao động (3): Xác định thời hạn', 30, yPosition);
    yPosition += 10;
    
    doc.text(`Từ ngày ${terms.startDate} đến ${terms.endDate}`, 30, yPosition);
    yPosition += 10;
    
    const workplaceText = doc.splitTextToSize('- Địa điểm làm việc (4): Trung tâm bồi dưỡng kiến thức Minh Việt', 160);
    doc.text(workplaceText, 30, yPosition);
    yPosition += workplaceText.length * 7;
    
    doc.text(`Chức danh chuyên môn: ${terms.position}`, 30, yPosition);
    yPosition += 20;
    
    return yPosition;
  }

  /**
   * Add staff working conditions
   * @param {jsPDF} doc - PDF document instance
   * @param {number} yPosition - Current Y position
   * @returns {number} - Next Y position
   */
  static addStaffWorkingConditions(doc, yPosition) {
    // Add new page if needed
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    
    FontManager.setVietnameseFont(doc, 'ARIAL', 14);
    doc.text('Điều 2: Chế độ làm việc', 20, yPosition);
    yPosition += 10;
    
    FontManager.setVietnameseFont(doc, 'ARIAL', 12);
    const workingTimeText = doc.splitTextToSize('- Thời gian làm việc (6): 8 giờ/ngày; 40 giờ/tuần. Sáng từ 08:30 – 12:00. Chiều từ 13:00 – 17:30', 160);
    doc.text(workingTimeText, 30, yPosition);
    yPosition += workingTimeText.length * 7;
    
    const equipmentText = doc.splitTextToSize('- Được cấp phát những dụng cụ làm việc gồm: Theo quy định của Trung tâm', 160);
    doc.text(equipmentText, 30, yPosition);
    yPosition += equipmentText.length * 7 + 15;
    
    return yPosition;
  }

  /**
   * Add staff rights and obligations
   * @param {jsPDF} doc - PDF document instance
   * @param {number} yPosition - Current Y position
   * @param {string} netSalary - Net salary
   * @returns {number} - Next Y position
   */
  static addStaffRightsObligations(doc, yPosition, netSalary) {
    // Add new page if needed
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    FontManager.setVietnameseFont(doc, 'ARIAL', 14);
    doc.text('Điều 3: Nghĩa vụ và quyền lợi của người lao động', 20, yPosition);
    yPosition += 15;
    
    FontManager.setVietnameseFont(doc, 'ARIAL', 12);
    doc.text('1. Quyền lợi:', 30, yPosition);
    yPosition += 10;
    
    doc.text('- Phương tiện đi lại làm việc (7): Tự túc', 30, yPosition);
    yPosition += 10;
    
    doc.text(`- Mức lương căn bản (8): ${netSalary} VNĐ`, 30, yPosition);
    yPosition += 10;
    
    doc.text('- Được trả lương vào (9): Trước ngày 05 của tháng tiếp theo', 30, yPosition);
    yPosition += 10;
    
    const insuranceText = doc.splitTextToSize('- BHXH, BHYT, BHTN (10): Công ty 17%; người lao động 8% theo luật BHXH', 160);
    doc.text(insuranceText, 30, yPosition);
    yPosition += insuranceText.length * 7;
    
    const trainingText = doc.splitTextToSize('- Chế độ đào tạo (11): Theo yêu cầu công việc của Trung tâm', 160);
    doc.text(trainingText, 30, yPosition);
    yPosition += trainingText.length * 7;
    
    doc.text('- Trợ cấp và hỗ trợ khác (12)', 30, yPosition);
    yPosition += 10;
    
    doc.text('Điện thoại: 500.000 VNĐ', 40, yPosition);
    yPosition += 7;
    doc.text('Xăng xe: 500.000 VNĐ', 40, yPosition);
    yPosition += 7;
    
    const allowanceText = doc.splitTextToSize('Phụ cấp chuyên cần: Dựa vào bảng đánh giá năng suất, chuyên cần hàng tháng', 150);
    doc.text(allowanceText, 40, yPosition);
    yPosition += allowanceText.length * 7 + 10;
    
    doc.text('2. Nghĩa vụ:', 30, yPosition);
    yPosition += 10;
    
    const obligationText1 = doc.splitTextToSize('- Hoàn thành những công việc theo yêu cầu và qui định trách nhiệm quyền hạn do Trung tâm giao và những điều đã cam kết trong hợp đồng lao động.', 160);
    doc.text(obligationText1, 30, yPosition);
    yPosition += obligationText1.length * 7;
    
    doc.text('- Bồi thường vi phạm và vật chất (13):', 30, yPosition);
    yPosition += 10;
    
    const compensationText1 = doc.splitTextToSize('+ Người lao động phải bồi thường cho Trung tâm những thiệt hại về vật chất và chịu trách nhiệm trước pháp luật do làm trái nội qui, làm trái những qui định hiện hành về vệ sinh – an toàn lao động, phòng chống cháy nổ.', 160);
    doc.text(compensationText1, 35, yPosition);
    yPosition += compensationText1.length * 7;
    
    const compensationText2 = doc.splitTextToSize('+ Người lao động làm hư hỏng hoặc làm thất lạc, mất mát thiết bị dụng cụ phương tiện làm việc của Trung tâm phải có trách nhiệm bồi thường cho Trung tâm. Mức bồi thường và phương thức thanh toán do 2 bên thỏa thuận.', 160);
    doc.text(compensationText2, 35, yPosition);
    yPosition += compensationText2.length * 7 + 15;
    
    return yPosition;
  }

  /**
   * Add employer rights and obligations
   * @param {jsPDF} doc - PDF document instance
   * @param {number} yPosition - Current Y position
   * @returns {number} - Next Y position
   */
  static addStaffEmployerRightsObligations(doc, yPosition) {
    // Add new page if needed
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    FontManager.setVietnameseFont(doc, 'ARIAL', 14);
    doc.text('Điều 4: Nghĩa vụ và quyền hạn của người sử dụng lao động', 20, yPosition);
    yPosition += 15;
    
    FontManager.setVietnameseFont(doc, 'ARIAL', 12);
    doc.text('1. Nghĩa vụ:', 30, yPosition);
    yPosition += 10;
    
    const obligation1Text = doc.splitTextToSize('- Bảo đảm việc làm và thực hiện đầy đủ những điều đã cam kết trong hợp đồng lao động.', 160);
    doc.text(obligation1Text, 30, yPosition);
    yPosition += obligation1Text.length * 7;
    
    const obligation2Text = doc.splitTextToSize('- Thanh toán đầy đủ, đúng thời hạn các chế độ và quyền lợi cho người lao động theo hợp đồng lao động, thỏa ước lao động tập thể.', 160);
    doc.text(obligation2Text, 30, yPosition);
    yPosition += obligation2Text.length * 7 + 10;
    
    doc.text('2. Quyền hạn:', 30, yPosition);
    yPosition += 10;
    
    const right1Text = doc.splitTextToSize('- Điều hành người lao động hoàn thành công việc theo hợp đồng (bố trí, điều chuyển, tạm ngưng việc ……)', 160);
    doc.text(right1Text, 30, yPosition);
    yPosition += right1Text.length * 7;
    
    const right2Text = doc.splitTextToSize('- Tạm hoãn, chấm dứt hợp đồng lao động, kỷ luật người lao động theo quy định của pháp luật, thoả ước lao động tập thể và nội quy lao động của Doanh nghiệp.', 160);
    doc.text(right2Text, 30, yPosition);
    yPosition += right2Text.length * 7 + 15;
    
    return yPosition;
  }

  /**
   * Add implementation clauses
   * @param {jsPDF} doc - PDF document instance
   * @param {number} yPosition - Current Y position
   * @param {string} startDate - Contract start date
   * @returns {number} - Next Y position
   */
  static addStaffImplementationClauses(doc, yPosition, startDate) {
    // Add new page if needed
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    FontManager.setVietnameseFont(doc, 'ARIAL', 14);
    doc.text('Điều 5: Điều khoản thi hành', 20, yPosition);
    yPosition += 15;
    
    FontManager.setVietnameseFont(doc, 'ARIAL', 12);
    const termination1Text = doc.splitTextToSize('- Khi muốn chấm dứt hợp đồng; mỗi bên phải thực hiện đúng qui định báo trước 30 ngày theo Điều 35 và Điều 36 của Bộ Luật Lao Động số 45/2019/QH14 ngày 20/11/2019 và có hiệu lực thi hành từ 01/01/2021.', 160);
    doc.text(termination1Text, 30, yPosition);
    yPosition += termination1Text.length * 7;
    
    const termination2Text = doc.splitTextToSize('- Những vấn đề về lao động không ghi trong hợp động lao động này thì áp dụng quy định của thỏa ước tập thể, trường hợp chưa có thỏa ước của tập thể thì áp dụng quy định của pháp luật lao động.', 160);
    doc.text(termination2Text, 30, yPosition);
    yPosition += termination2Text.length * 7;
    
    const effectiveText = doc.splitTextToSize(`- Hợp đồng lao động được làm thành 02 bản có giá trị ngang nhau, mỗi bên giữ một bản và có hiệu lực từ ngày ${startDate}. Khi hai bên ký kết phụ lục hợp đồng lao động thì nội dung của phụ lục hợp đồng lao động cũng có giá trị như các nội dung của bản hợp đồng lao động này.`, 160);
    doc.text(effectiveText, 30, yPosition);
    yPosition += effectiveText.length * 7;
    
    const locationText = doc.splitTextToSize('Hợp đồng này làm tại Văn phòng Trung tâm bồi dưỡng kiến thức Minh Việt ngày 01 tháng 12 năm 2022.', 160);
    doc.text(locationText, 30, yPosition);
    yPosition += locationText.length * 7 + 20;
    
    return yPosition;
  }

  /**
   * Add staff contract signatures
   * @param {jsPDF} doc - PDF document instance
   * @param {number} yPosition - Current Y position
   */
  static addStaffSignatures(doc, yPosition) {
    // Add new page if needed
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    
    FontManager.setVietnameseFont(doc, 'ARIAL', 12);
    doc.text('NGƯỜI LAO ĐỘNG', 40, yPosition);
    doc.text('NGƯỜI SỬ DỤNG LAO ĐỘNG', 130, yPosition);
    yPosition += 10;
    
    doc.text('(Ký tên)', 50, yPosition);
    doc.text('(Ký tên, đóng dấu)', 145, yPosition);
    yPosition += 10;
    
    doc.text('Ghi rõ họ và tên', 45, yPosition);
    doc.text('Ghi rõ họ và tên', 140, yPosition);
  }
}

export default ContractPDFGenerator;
