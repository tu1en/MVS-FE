/**
 * Lớp UserModel định nghĩa cấu trúc và xử lý dữ liệu người dùng
 */
class UserModel {
  /**
   * Khởi tạo đối tượng UserModel
   * @param {Object} userData - Dữ liệu người dùng từ API
   */
  constructor(userData = {}) {
    this.id = userData.id || null;
    this.name = userData.name || '';
    this.role = userData.role || 'student';
    this.email = userData.email || '';
    this.createdAt = userData.createdAt ? new Date(userData.createdAt) : new Date();
    this.updatedAt = userData.updatedAt ? new Date(userData.updatedAt) : new Date();
  }

  /**
   * Chuyển đổi đối tượng UserModel thành đối tượng để gửi lên API
   * @returns {Object} Đối tượng để gửi lên API
   */
  toApiObject() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      email: this.email
    };
  }

  /**
   * Chuyển đổi dữ liệu từ API thành mảng UserModel
   * @param {Array} usersData - Dữ liệu người dùng từ API
   * @returns {Array<UserModel>} Mảng đối tượng UserModel
   */
  static fromApiArray(usersData) {
    if (!Array.isArray(usersData)) {
      return [];
    }
    
    return usersData.map(userData => new UserModel(userData));
  }
}

export default UserModel; 