/**
 * Lớp AssignmentModel định nghĩa cấu trúc và xử lý dữ liệu bài tập
 */
class AssignmentModel {
  /**
   * Khởi tạo đối tượng AssignmentModel
   * @param {Object} assignmentData - Dữ liệu bài tập từ API
   */
  constructor(assignmentData = {}) {
    this.id = assignmentData.id || null;
    this.title = assignmentData.title || '';
    this.description = assignmentData.description || '';
    this.classId = assignmentData.classId || null;
    this.dueDate = assignmentData.dueDate ? new Date(assignmentData.dueDate) : null;
    this.maxPoints = assignmentData.maxPoints || 100;
    this.attachments = assignmentData.attachments || [];
    this.submissions = assignmentData.submissions || [];
    this.createdAt = assignmentData.createdAt ? new Date(assignmentData.createdAt) : new Date();
    this.updatedAt = assignmentData.updatedAt ? new Date(assignmentData.updatedAt) : new Date();
  }

  /**
   * Chuyển đổi đối tượng AssignmentModel thành đối tượng để gửi lên API
   * @returns {Object} Đối tượng để gửi lên API
   */
  toApiObject() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      classId: this.classId,
      dueDate: this.dueDate ? this.dueDate.toISOString() : null,
      maxPoints: this.maxPoints
    };
  }

  /**
   * Kiểm tra xem bài tập có quá hạn không
   * @returns {Boolean} True nếu quá hạn
   */
  isOverdue() {
    if (!this.dueDate) return false;
    return new Date() > this.dueDate;
  }

  /**
   * Tính toán thời gian còn lại cho bài tập
   * @returns {Object} Thời gian còn lại định dạng { days, hours, minutes }
   */
  getRemainingTime() {
    if (!this.dueDate || this.isOverdue()) {
      return { days: 0, hours: 0, minutes: 0 };
    }
    
    const now = new Date();
    const diff = this.dueDate.getTime() - now.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  }

  /**
   * Chuyển đổi dữ liệu từ API thành mảng AssignmentModel
   * @param {Array} assignmentsData - Dữ liệu bài tập từ API
   * @returns {Array<AssignmentModel>} Mảng đối tượng AssignmentModel
   */
  static fromApiArray(assignmentsData) {
    if (!Array.isArray(assignmentsData)) {
      return [];
    }
    
    return assignmentsData.map(assignmentData => new AssignmentModel(assignmentData));
  }
}

export default AssignmentModel; 