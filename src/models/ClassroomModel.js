/**
 * Lớp ClassroomModel định nghĩa cấu trúc và xử lý dữ liệu lớp học
 */
class ClassroomModel {
  /**
   * Khởi tạo đối tượng ClassroomModel
   * @param {Object} classroomData - Dữ liệu lớp học từ API
   */
  constructor(classroomData = {}) {
    this.id = classroomData.id || null;
    this.name = classroomData.name || '';
    this.teacherId = classroomData.teacherId || null;
    this.description = classroomData.description || '';
    this.code = classroomData.code || '';
    this.students = classroomData.students || [];
    this.assignments = classroomData.assignments || [];
    this.createdAt = classroomData.createdAt ? new Date(classroomData.createdAt) : new Date();
    this.updatedAt = classroomData.updatedAt ? new Date(classroomData.updatedAt) : new Date();
  }

  /**
   * Chuyển đổi đối tượng ClassroomModel thành đối tượng để gửi lên API
   * @returns {Object} Đối tượng để gửi lên API
   */
  toApiObject() {
    return {
      id: this.id,
      name: this.name,
      teacherId: this.teacherId,
      description: this.description,
      code: this.code
    };
  }

  /**
   * Chuyển đổi dữ liệu từ API thành mảng ClassroomModel
   * @param {Array} classroomsData - Dữ liệu lớp học từ API
   * @returns {Array<ClassroomModel>} Mảng đối tượng ClassroomModel
   */
  static fromApiArray(classroomsData) {
    if (!Array.isArray(classroomsData)) {
      return [];
    }
    
    return classroomsData.map(classroomData => new ClassroomModel(classroomData));
  }
}

export default ClassroomModel; 