import React, { useState } from 'react';

/**
 * AssignmentsPage component for managing assignments
 * @returns {JSX.Element} AssignmentsPage component
 */
function AssignmentsPage() {
  // Sample assignments data
  const [assignments, setAssignments] = useState([
    { 
      id: 1, 
      title: 'Bài Tập Toán Số 1', 
      description: 'Hoàn thành các bài toán 1-20 trong Chương 3',
      class: 'Toán Học 101',
      dueDate: '2023-06-15',
      status: 'đang mở'
    },
    { 
      id: 2, 
      title: 'Báo Cáo Thí Nghiệm Vật Lý', 
      description: 'Viết báo cáo về thí nghiệm con lắc',
      class: 'Vật Lý Cơ Bản',
      dueDate: '2023-06-20',
      status: 'đang mở'
    },
    { 
      id: 3, 
      title: 'Bài Luận Văn Học', 
      description: 'Viết bài luận 5 trang về tác phẩm Hamlet của Shakespeare',
      class: 'Văn Học Nhập Môn',
      dueDate: '2023-06-25',
      status: 'đang mở'
    },
    { 
      id: 4, 
      title: 'Dự Án Nghiên Cứu Lịch Sử', 
      description: 'Nghiên cứu và trình bày về một sự kiện lịch sử từ 1900-1950',
      class: 'Lịch Sử Thế Giới',
      dueDate: '2023-07-01',
      status: 'đang mở'
    },
  ]);

  // Sample classes for the dropdown
  const classes = [
    'Toán Học 101',
    'Vật Lý Cơ Bản',
    'Văn Học Nhập Môn',
    'Lịch Sử Thế Giới'
  ];

  // State for new assignment form
  const [newAssignment, setNewAssignment] = useState({ 
    title: '', 
    description: '', 
    class: '', 
    dueDate: '' 
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [filter, setFilter] = useState('all');

  /**
   * Handles input change in the form
   * @param {Event} e - Input change event
   */
  const HandleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment({ ...newAssignment, [name]: value });
  };

  /**
   * Handles form submission to add a new assignment
   * @param {Event} e - Form submission event
   */
  const HandleSubmit = (e) => {
    e.preventDefault();
    const newId = assignments.length > 0 ? Math.max(...assignments.map(a => a.id)) + 1 : 1;
    const assignmentToAdd = {
      id: newId,
      ...newAssignment,
      status: 'đang mở'
    };
    
    setAssignments([...assignments, assignmentToAdd]);
    setNewAssignment({ title: '', description: '', class: '', dueDate: '' });
    setIsFormVisible(false);
  };

  /**
   * Handles assignment deletion
   * @param {number} id - ID of the assignment to delete
   */
  const HandleDelete = (id) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  /**
   * Formats the date to a more readable format
   * @param {string} dateString - Date string in YYYY-MM-DD format
   * @returns {string} Formatted date string
   */
  const FormatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  /**
   * Filters assignments based on the selected filter
   * @returns {Array} Filtered assignments
   */
  const GetFilteredAssignments = () => {
    if (filter === 'all') {
      return assignments;
    }
    // Use filter to get assignments by class
    return assignments.filter(a => a.class === filter);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản Lý Bài Tập</h2>
        <button 
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {isFormVisible ? 'Hủy' : 'Tạo Bài Tập'}
        </button>
      </div>

      {/* Filter controls */}
      <div className="flex items-center space-x-4">
        <label htmlFor="filter" className="font-medium text-gray-700">Lọc theo Lớp:</label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất Cả Lớp</option>
          {classes.map((cls, index) => (
            <option key={index} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      {/* New Assignment Form */}
      {isFormVisible && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Tạo Bài Tập Mới</h3>
          <form onSubmit={HandleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block mb-1 font-medium">Tiêu Đề:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newAssignment.title}
                onChange={HandleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block mb-1 font-medium">Mô Tả:</label>
              <textarea
                id="description"
                name="description"
                value={newAssignment.description}
                onChange={HandleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="class" className="block mb-1 font-medium">Lớp Học:</label>
              <select
                id="class"
                name="class"
                value={newAssignment.class}
                onChange={HandleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Chọn lớp học</option>
                {classes.map((cls, index) => (
                  <option key={index} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="dueDate" className="block mb-1 font-medium">Hạn Nộp:</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={newAssignment.dueDate}
                onChange={HandleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Tạo Bài Tập
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GetFilteredAssignments().map(assignment => (
          <div key={assignment.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold text-gray-800">{assignment.title}</h3>
              <div className="space-x-2">
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => alert(`Chỉnh sửa ${assignment.title}`)}
                >
                  Sửa
                </button>
                <button 
                  className="text-red-600 hover:text-red-800"
                  onClick={() => HandleDelete(assignment.id)}
                >
                  Xóa
                </button>
              </div>
            </div>
            <p className="text-sm mt-1 text-blue-600">{assignment.class}</p>
            <p className="mt-2 text-gray-700">{assignment.description}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">Hạn nộp: {FormatDate(assignment.dueDate)}</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {assignment.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Show message when no assignments match the filter */}
      {GetFilteredAssignments().length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Không tìm thấy bài tập nào cho lớp đã chọn.
        </div>
      )}
    </div>
  );
}

export default AssignmentsPage; 