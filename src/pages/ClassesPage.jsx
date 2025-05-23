import React, { useState } from 'react';

/**
 * ClassesPage component for managing classes
 * @returns {JSX.Element} ClassesPage component
 */
function ClassesPage() {
  // Sample classes data
  const [classes, setClasses] = useState([
    { id: 1, name: 'Toán Học 101', teacher: 'Thầy Nguyễn Văn A', students: 28, schedule: 'Thứ Hai, Thứ Tư 10:00' },
    { id: 2, name: 'Vật Lý Cơ Bản', teacher: 'Cô Trần Thị B', students: 22, schedule: 'Thứ Ba, Thứ Năm 14:00' },
    { id: 3, name: 'Văn Học Nhập Môn', teacher: 'Cô Lê Thị C', students: 30, schedule: 'Thứ Hai, Thứ Sáu 13:00' },
    { id: 4, name: 'Lịch Sử Thế Giới', teacher: 'Thầy Phạm Văn D', students: 25, schedule: 'Thứ Tư, Thứ Sáu 11:00' },
  ]);

  // State for new class form
  const [newClass, setNewClass] = useState({ name: '', teacher: '', schedule: '' });
  const [isFormVisible, setIsFormVisible] = useState(false);

  /**
   * Handles input change in the form
   * @param {Event} e - Input change event
   */
  const HandleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass({ ...newClass, [name]: value });
  };

  /**
   * Handles form submission to add a new class
   * @param {Event} e - Form submission event
   */
  const HandleSubmit = (e) => {
    e.preventDefault();
    const newId = classes.length > 0 ? Math.max(...classes.map(c => c.id)) + 1 : 1;
    const classToAdd = {
      id: newId,
      ...newClass,
      students: 0, // New class has no students initially
    };
    
    setClasses([...classes, classToAdd]);
    setNewClass({ name: '', teacher: '', schedule: '' });
    setIsFormVisible(false);
  };

  /**
   * Handles class deletion
   * @param {number} id - ID of the class to delete
   */
  const HandleDelete = (id) => {
    setClasses(classes.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản Lý Lớp Học</h2>
        <button 
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {isFormVisible ? 'Hủy' : 'Thêm Lớp Mới'}
        </button>
      </div>

      {/* New Class Form */}
      {isFormVisible && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Thêm Lớp Học Mới</h3>
          <form onSubmit={HandleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1 font-medium">Tên Lớp Học:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newClass.name}
                onChange={HandleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="teacher" className="block mb-1 font-medium">Giáo Viên:</label>
              <input
                type="text"
                id="teacher"
                name="teacher"
                value={newClass.teacher}
                onChange={HandleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="schedule" className="block mb-1 font-medium">Lịch Học:</label>
              <input
                type="text"
                id="schedule"
                name="schedule"
                value={newClass.schedule}
                onChange={HandleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Ví dụ: Thứ Hai, Thứ Tư 10:00"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Tạo Lớp Học
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Classes List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Tên Lớp Học</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Giáo Viên</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Học Sinh</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Lịch Học</th>
              <th className="py-3 px-4 text-center font-semibold text-gray-700">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(cls => (
              <tr key={cls.id} className="hover:bg-gray-50 border-t border-gray-200">
                <td className="py-3 px-4 text-gray-700">{cls.name}</td>
                <td className="py-3 px-4 text-gray-700">{cls.teacher}</td>
                <td className="py-3 px-4 text-gray-700">{cls.students}</td>
                <td className="py-3 px-4 text-gray-700">{cls.schedule}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    className="px-3 py-1 text-blue-600 hover:text-blue-800 transition-colors mr-2"
                    onClick={() => alert(`Xem chi tiết cho lớp ${cls.name}`)}
                  >
                    Xem
                  </button>
                  <button
                    className="px-3 py-1 text-red-600 hover:text-red-800 transition-colors"
                    onClick={() => HandleDelete(cls.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClassesPage; 