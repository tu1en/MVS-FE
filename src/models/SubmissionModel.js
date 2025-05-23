/**
 * Lớp SubmissionModel định nghĩa cấu trúc và xử lý dữ liệu bài nộp
 */
class SubmissionModel {
  /**
   * Khởi tạo đối tượng SubmissionModel
   * @param {Object} submissionData - Dữ liệu bài nộp từ API
   */
  constructor(submissionData = {}) {
    this.id = submissionData.id || null;
    this.assignmentId = submissionData.assignmentId || null;
    this.studentId = submissionData.studentId || null;
    this.content = submissionData.content || '';
    this.attachments = submissionData.attachments || [];
    this.grade = submissionData.grade || null;
    this.feedback = submissionData.feedback || '';
    this.status = submissionData.status || 'SUBMITTED'; // SUBMITTED, GRADED, RETURNED
    this.submittedAt = submissionData.submittedAt ? new Date(submissionData.submittedAt) : new Date();
    this.gradedAt = submissionData.gradedAt ? new Date(submissionData.gradedAt) : null;
  }

  /**
   * Chuyển đổi đối tượng SubmissionModel thành đối tượng để gửi lên API
   * @returns {Object} Đối tượng để gửi lên API
   */
  toApiObject() {
    return {
      id: this.id,
      assignmentId: this.assignmentId,
      studentId: this.studentId,
      content: this.content,
      grade: this.grade,
      feedback: this.feedback,
      status: this.status
    };
  }

  /**
   * Kiểm tra xem bài nộp đã được chấm điểm chưa
   * @returns {Boolean} True nếu đã chấm điểm
   */
  isGraded() {
    return this.status === 'GRADED' || this.status === 'RETURNED';
  }

  /**
   * Chuyển đổi dữ liệu từ API thành mảng SubmissionModel
   * @param {Array} submissionsData - Dữ liệu bài nộp từ API
   * @returns {Array<SubmissionModel>} Mảng đối tượng SubmissionModel
   */
  static fromApiArray(submissionsData) {
    if (!Array.isArray(submissionsData)) {
      return [];
    }
    
    return submissionsData.map(submissionData => new SubmissionModel(submissionData));
  }
}

export default SubmissionModel; 