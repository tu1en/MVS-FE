import React, { useState } from 'react';

/**
 * StudentsPage component for managing students
 * @returns {JSX.Element} StudentsPage component
 */
// Add these imports at the top of the file
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentsPage() {
  // Add navigation hook inside the component
  const navigate = useNavigate();

  // Move useEffect inside the component
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'STUDENT') {
      navigate('/');
    }
  }, [navigate]);

  // Sample students data
  const [students, setStudents] = useState([
    { id: 1, name: 'Nguyễn Văn An', email: 'an.nguyen@example.com', grade: 'Lớp 10', classes: ['Toán Học 101', 'Vật Lý Cơ Bản'] },
    { id: 2, name: 'Trần Thị Bình', email: 'binh.tran@example.com', grade: 'Lớp 10', classes: ['Toán Học 101', 'Văn Học Nhập Môn'] },
    { id: 3, name: 'Lê Văn Cường', email: 'cuong.le@example.com', grade: 'Lớp 11', classes: ['Lịch Sử Thế Giới', 'Văn Học Nhập Môn'] },
    { id: 4, name: 'Phạm Thị Dung', email: 'dung.pham@example.com', grade: 'Lớp 11', classes: ['Lịch Sử Thế Giới', 'Vật Lý Cơ Bản'] },
    { id: 5, name: 'Hoàng Văn Em', email: 'em.hoang@example.com', grade: 'Lớp 12', classes: ['Toán Học 101'] },
  ]);

  // Available classes for the form
  const availableClasses = [
    'Toán Học 101',
    'Vật Lý Cơ Bản',
    'Văn Học Nhập Môn',
    'Lịch Sử Thế Giới'
  ];

  // Available grades for the form
  const availableGrades = ['Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'];

  // State for new student form
  const [newStudent, setNewStudent] = useState({ 
    name: '', 
    email: '', 
    grade: '', 
    classes: [] 
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  
  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterClass, setFilterClass] = useState('all');

  /**
   * Handles input change in the form
   * @param {Event} e - Input change event
   */
  const HandleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'classes') {
      // Handle multi-select for classes
      const selectedClasses = Array.from(e.target.selectedOptions, option => option.value);
      setNewStudent({ ...newStudent, classes: selectedClasses });
    } else {
      setNewStudent({ ...newStudent, [name]: value });
    }
  };

  /**
   * Handles form submission to add a new student
   * @param {Event} e - Form submission event
   */
  const HandleSubmit = (e) => {
    e.preventDefault();
    const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    const studentToAdd = {
      id: newId,
      ...newStudent,
      classes: newStudent.classes || []
    };
    
    setStudents([...students, studentToAdd]);
    setNewStudent({ name: '', email: '', grade: '', classes: [] });
    setIsFormVisible(false);
  };

  /**
   * Handles student deletion
   * @param {number} id - ID of the student to delete
   */
  const HandleDelete = (id) => {
    setStudents(students.filter(s => s.id !== id));
  };

  /**
   * Filters students based on search term and filters
   * @returns {Array} Filtered students
   */
  const GetFilteredStudents = () => {
    return students.filter(student => {
      // Check if student name or email matches search term
      const matchesSearch = searchTerm === '' || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Check if student matches grade filter
      const matchesGrade = filterGrade === 'all' || student.grade === filterGrade;
      
      // Check if student is enrolled in the filtered class
      const matchesClass = filterClass === 'all' || student.classes.includes(filterClass);
      
      return matchesSearch && matchesGrade && matchesClass;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản Lý Học Sinh</h2>
        <button 
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {isFormVisible ? 'Hủy' : 'Thêm Học Sinh'}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="search" className="block mb-1 font-medium text-gray-700">Tìm Kiếm Học Sinh:</label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên hoặc email"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1">
            <label htmlFor="grade-filter" className="block mb-1 font-medium text-gray-700">Lọc theo Lớp:</label>
            <select
              id="grade-filter"
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất Cả Khối Lớp</option>
              {availableGrades.map((grade, index) => (
                <option key={index} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label htmlFor="class-filter" className="block mb-1 font-medium text-gray-700">Lọc theo Môn Học:</label>
            <select
              id="class-filter"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất Cả Môn Học</option>
              {availableClasses.map((cls, index) => (
                <option key={index} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* New Student Form */}
      {isFormVisible && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Thêm Học Sinh Mới</h3>
          <form onSubmit={HandleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1 font-medium">Họ Tên:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newStudent.name}
                onChange={HandleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block mb-1 font-medium">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={newStudent.email}
                onChange={HandleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="grade" className="block mb-1 font-medium">Khối Lớp:</label>
              <select
                id="grade"
                name="grade"
                value={newStudent.grade}
                onChange={HandleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Chọn khối lớp</option>
                {availableGrades.map((grade, index) => (
                  <option key={index} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="classes" className="block mb-1 font-medium">Các Môn Học:</label>
              <select
                id="classes"
                name="classes"
                value={newStudent.classes}
                onChange={HandleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                multiple
                size="4"
              >
                {availableClasses.map((cls, index) => (
                  <option key={index} value={cls}>{cls}</option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">Giữ phím Ctrl (hoặc Cmd) để chọn nhiều môn học.</p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Thêm Học Sinh
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Họ Tên</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Email</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Khối Lớp</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Các Môn Học</th>
              <th className="py-3 px-4 text-center font-semibold text-gray-700">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {GetFilteredStudents().map(student => (
              <tr key={student.id} className="hover:bg-gray-50 border-t border-gray-200">
                <td className="py-3 px-4 text-gray-700">{student.name}</td>
                <td className="py-3 px-4 text-gray-700">{student.email}</td>
                <td className="py-3 px-4 text-gray-700">{student.grade}</td>
                <td className="py-3 px-4 text-gray-700">
                  <div className="flex flex-wrap gap-1">
                    {student.classes.map((cls, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {cls}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    className="px-3 py-1 text-blue-600 hover:text-blue-800 transition-colors mr-2"
                    onClick={() => alert(`Xem chi tiết cho học sinh ${student.name}`)}
                  >
                    Xem
                  </button>
                  <button
                    className="px-3 py-1 text-red-600 hover:text-red-800 transition-colors"
                    onClick={() => HandleDelete(student.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Show message when no students match the filter */}
        {GetFilteredStudents().length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy học sinh nào phù hợp với điều kiện lọc.
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentsPage;