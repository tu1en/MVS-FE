import jsPDF from 'jspdf';
import moment from 'moment';

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
    doc.setFont('helvetica');
    doc.setFontSize(14);
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
    doc.setFontSize(14);
    doc.text('1. Ben A (Ben thue):', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Trung tam boi duong kien thuc Minh Viet', 30, yPosition);
    yPosition += 10;
    doc.text('Ma so thue: 123456789', 30, yPosition);
    yPosition += 10;
    doc.text('Dia chi: 123 Duong Le Loi, Quan 1, TP. Ho Chi Minh', 30, yPosition);
    yPosition += 10;
    doc.text('Dai dien: Ong Nguyen Van A', 30, yPosition);
    yPosition += 10;
    doc.text('Chuc vu: Giam doc', 30, yPosition);
    yPosition += 10;
    doc.text('So dien thoai: 0123 456 789    Email: info@minhviet.edu.vn', 30, yPosition);
    yPosition += 10;
    
    // Party B (Employee)
    doc.setFontSize(14);
    doc.text('2. Ben B (Ben duoc thue):', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`Ho va ten: ${contractorInfo.fullName}`, 30, yPosition);
    yPosition += 10;
    doc.text(`Sinh ngay: ${contractorInfo.birthDate}`, 30, yPosition);
    yPosition += 10;
    doc.text(`So CCCD: ${contractorInfo.citizenId}`, 30, yPosition);
    yPosition += 10;
    doc.text(`Dia chi: ${contractorInfo.address}`, 30, yPosition);
    yPosition += 10;
    doc.text(`So dien thoai: ${contractorInfo.phoneNumber || 'N/A'}    Email: ${contractorInfo.email || 'N/A'}`, 30, yPosition);
    yPosition += 10;
    doc.text(`Trinh do chuyen mon: ${contractorInfo.qualification}`, 30, yPosition);
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
    
    doc.setFontSize(14);
    doc.text('Hai ben cung thong nhat ky ket hop dong voi cac dieu khoan sau:', 20, yPosition);
    yPosition += 10;
    doc.text('Dieu 1: Noi dung hop dong', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Ben A thue Ben B lam giao vien giang day voi noi dung cong viec nhu sau:', 30, yPosition);
    yPosition += 10;
    doc.text(`- Mon hoc giang day: ${terms.subject}`, 40, yPosition);
    yPosition += 10;
    doc.text(`- Lop hoc: ${terms.classLevel}`, 40, yPosition);
    yPosition += 10;
    doc.text(`- Thoi gian giang day: Tu ${terms.startDate} den ${terms.endDate}`, 40, yPosition);
    yPosition += 10;
    
    // Add working schedule information if available
    if (terms.workSchedule && terms.workSchedule !== 'N/A') {
      doc.text(`- Thoi gian lam viec: ${terms.workSchedule}`, 40, yPosition);
      yPosition += 10;
    }
    if (terms.workShifts && terms.workShifts !== 'N/A') {
      doc.text(`- Ca lam viec: ${terms.workShifts}`, 40, yPosition);
      yPosition += 10;
    }
    if (terms.workDays && terms.workDays !== 'N/A') {
      doc.text(`- Ngay trong tuan: ${terms.workDays}`, 40, yPosition);
      yPosition += 10;
    }
    
    doc.text('- Dia diem giang day: Trung tam boi duong kien thuc Minh Viet', 40, yPosition);
    yPosition += 10;
    doc.text('- Ben B phai tuan thu day du, dung chuong trinh day, dam bao chat luong hoc tap cua hoc sinh.', 40, yPosition);
    yPosition += 10;
    
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
    doc.setFontSize(14);
    doc.text('Dieu 2: Thoi han hop dong va che do lam viec', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('- Loai hop dong lao dong: Co ky han.', 30, yPosition);
    yPosition += 10;
    doc.text(`- Thoi han hop dong: Tu ${clauseData.startDate} den ${clauseData.endDate}`, 30, yPosition);
    yPosition += 10;
    doc.text('- Thoi gian lam viec cua ben B: 8 gio/ngay.', 30, yPosition);
    yPosition += 10;
    doc.text('- Ben B duoc cap phat nhung dung cu lam viec gom: Cac tai lieu phuc vu cho giang day, dung cu giang day, thiet bi day hoc.', 30, yPosition);
    yPosition += 10;
    
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Article 3: Salary and payment method
    doc.setFontSize(14);
    doc.text('Dieu 3: Muc luong va phuong thuc thanh toan', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`- Ben A dong y chi tra cho ben B muc luong viec giang day voi so tien la: ${clauseData.salary} dong/thang`, 30, yPosition);
    yPosition += 10;
    doc.text('- Thoi han tra tien luong: Ben A se tra tien luong cho ben B 01 lan vao cac ngay 5 hang thang.', 30, yPosition);
    yPosition += 10;
    doc.text('- Phuong thuc thanh toan: chuyen khoan.', 30, yPosition);
    yPosition += 10;
    doc.text('- Ben A co quyen dieu chinh muc luong theo hieu qua cong viec va cac yeu cau khac phat sinh ma khong can co su dong y cua ben B, nhung khong duoc thap hon qua 10% cua muc luong thang truoc do tai thoi diem dang chi tra luong cho ben B.', 30, yPosition);
    yPosition += 15;
    doc.text('- Ngoai muc luong ben A chi tra cho ben B, Ben B duoc huong tien thuong hang thang, hang ky, cuoi nam va cac khoan khac theo thoa thuan cua hai ben (neu co).', 30, yPosition);
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
    doc.setFontSize(14);
    doc.text('Dieu 4: Quyen va nghia vu cua ben A', 20, yPosition);
    yPosition += 10;
    doc.text('4.1. Quyen loi cua ben A:', 25, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('- Ben A co quyen yeu cau giao vien thuc hien dung noi dung giang day theo hop dong va co quyen kiem tra, danh gia chat luong giang day.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben A co quyen yeu cau dieu chinh phuong phap giang day cua Ben B neu thay khong phu hop voi yeu cau, tieu chuan giang day cua ben A.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben A co quyen cham dut hop dong ngay lap tuc neu Ben B vi pham nghiem trong cac quy dinh, noi quy cua lop hoc hoac hop dong.', 35, yPosition);
    yPosition += 10;
    doc.text('4.2. Nghia vu cua Ben A:', 25, yPosition);
    yPosition += 10;
    doc.text('- Ben A co nghia vu cung cap day du co so vat chat, trang thiet bi, tai lieu, dung cu giang day can thiet cho Ben B.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben A co nghia vu thanh toan dung han tien luong cho Ben B theo thoa thuan trong hop dong.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben A khong co nghia vu cung cap bat ky ho tro nao ngoai cac dieu khoan da ghi trong hop dong.', 35, yPosition);
    yPosition += 10;
    
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Article 5: Rights and obligations of Party B
    doc.setFontSize(14);
    doc.text('Dieu 5: Quyen va nghia vu cua ben B', 20, yPosition);
    yPosition += 10;
    doc.text('5.1. Quyen loi cua ben B:', 25, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('- Ben B co quyen yeu cau ben A thanh toan tien luong day du, dung han theo dieu 3 hop dong nay.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben B co quyen duoc yeu cau ho tro tai lieu, trang thiet bi day hoc tu ben A, nhung phai dam bao viec su dung nhung tai lieu nay chi phuc vu cho muc dich giang day o tren lop.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben B co quyen duoc nghi day trong truong hop co ly do chinh dang va phai thong bao cho ben A truoc 03 ngay.', 35, yPosition);
    yPosition += 10;
    doc.text('- Truong hop ben A cham thanh toan luong qua 15 ngay, ben B co quyen tam ngung giang day cho den khi duoc thanh toan.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben B duoc dam bao moi truong lam viec phu hop va duoc huong cac quyen loi khac (neu co).', 35, yPosition);
    yPosition += 10;
    doc.text('5.2. Nghia vu cua ben B:', 25, yPosition);
    yPosition += 10;
    doc.text('- Ben B phai thuc hien day du, dung chuong trinh day, dam bao chat luong hoc tap cua hoc sinh.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben B khong duoc nghi day dot xuat ma khong co ly do chinh dang, truong hop nghi phai thong bao truoc it nhat 3 ngay.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben B phai giu gin dao duc nghe nghiep, khong co hanh vi thieu chuyen nghiep hoac vi pham phap luat trong suot thoi gian lam viec, giao ket hop dong voi ben A.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben B khong duoc tu y su dung tai lieu, chuong trinh day hoc cua ben A cho muc dich ca nhan, khong lien quan den cong viec ben A thue ben B.', 35, yPosition);
    yPosition += 10;
    doc.text('- Ben B phai tuan thu day du, dung noi quy, quy dinh cua lop hoc va cac yeu cau cua ben A.', 35, yPosition);
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
    doc.setFontSize(14);
    doc.text('Dieu 6: Cham dut hop dong', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Hop dong se cham dut trong cac truong hop sau:', 30, yPosition);
    yPosition += 10;
    doc.text('- Het thoi han hop dong ma hai ben khong gia han.', 40, yPosition);
    yPosition += 10;
    doc.text('- Hai ben thoa thuan cham dut hop dong truoc thoi han.', 40, yPosition);
    yPosition += 10;
    doc.text('- Mot trong hai ben vi pham nghiem trong dieu khoan hop dong thi ben con lai duoc don phuong cham dut hop dong.', 40, yPosition);
    yPosition += 10;
    doc.text('- Giao vien khong dap ung yeu cau giang day, chat luong hoc sinh hoac vi pham noi quy cua ben thue dat ra.', 40, yPosition);
    yPosition += 10;
    doc.text('- Ben A khong thuc hien thanh toan dung han va khong khac phuc sau 15 ngay.', 40, yPosition);
    yPosition += 10;
    
    // Add new page if needed
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Article 7: Contract violation handling
    doc.setFontSize(14);
    doc.text('Dieu 7: Xu li vi pham hop dong', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('- Neu Ben B vi pham noi quy hoac tu y nghi day ma khong co ly do chinh dang, Ben A co quyen cham dut hop dong ngay lap tuc va khong thanh toan luong cho cac buoi day chua hoan thanh.', 30, yPosition);
    yPosition += 15;
    doc.text('- Neu Ben A khong thanh toan dung han, Ben B co quyen tam ngung giang day cho den khi duoc thanh toan day du.', 30, yPosition);
    yPosition += 10;
    doc.text('- Truong hop mot trong hai ben gay thiet hai do vi pham hop dong, ben bi thiet hai co quyen yeu cau boi thuong toan bo thiet hai do vi pham gay ra.', 30, yPosition);
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
    doc.setFontSize(14);
    doc.text('Dieu 8: Giai quyet tranh chap', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Moi tranh chap phat sinh se duoc giai quyet thong qua thuong luong, hoa giai. Neu khong dat duoc thoa thuan, tranh chap se duoc dua ra toa an co tham quyen giai quyet.', 30, yPosition);
    yPosition += 15;
    doc.text('Hop dong nay co hieu luc tu ngay ky va duoc lap thanh 02 ban, moi ben giu 01 ban co gia tri phap ly nhu nhau.', 30, yPosition);
    yPosition += 15;
    doc.text('Hai ben cam ket thuc hien dung cac dieu khoan cua hop dong.', 30, yPosition);
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
    doc.setFontSize(14);
    doc.text('DAI DIEN BEN A', 30, yPosition);
    doc.text('DAI DIEN BEN B', 130, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('(Ky va ghi ro ho ten)', 25, yPosition);
    doc.text('(Ky va ghi ro ho ten)', 125, yPosition);
  }
}

export default ContractPDFGenerator;
