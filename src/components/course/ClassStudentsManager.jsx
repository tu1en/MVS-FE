import React, { useEffect, useState } from 'react';
import classManagementService from '../../services/classManagementService';
import { showNotification } from '../../utils/courseManagementUtils';

const ClassStudentsManager = ({ classId, className, maxStudents = 30, onClose }) => {
  const [state, setState] = useState({
    students: [],
    allStudents: [],
    searchTerm: '',
    selectedStudents: [],
    loading: {
      students: false,
      allStudents: false,
      enrolling: false,
      validating: false
    },
    showAddModal: false,
    scheduleConflicts: {},
    classSchedule: null
  });

  useEffect(() => {
    if (classId) {
      loadClassStudents();
      loadAllStudents();
      loadClassSchedule();
    }
  }, [classId]);

  const loadClassStudents = async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, students: true } }));
    try {
      const response = await classManagementService.getClassStudents(classId);
      const students = response.data?.data || response.data || [];
      setState(prev => ({
        ...prev,
        students: Array.isArray(students) ? students : [],
        loading: { ...prev.loading, students: false }
      }));
    } catch (error) {
      console.error('Error loading class students:', error);
      showNotification('Lỗi tải danh sách học viên: ' + error.message, 'error');
      setState(prev => ({
        ...prev,
        students: [],
        loading: { ...prev.loading, students: false }
      }));
    }
  };

  const loadAllStudents = async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, allStudents: true } }));
    try {
      // API để lấy tất cả học sinh
      const response = await fetch('http://localhost:8088/api/users/students', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Không thể tải danh sách học sinh');
      
      const data = await response.json();
      const allStudents = data.data || data || [];
      
      setState(prev => ({
        ...prev,
        allStudents: Array.isArray(allStudents) ? allStudents : [],
        loading: { ...prev.loading, allStudents: false }
      }));
    } catch (error) {
      console.error('Error loading all students:', error);
      setState(prev => ({
        ...prev,
        allStudents: [],
        loading: { ...prev.loading, allStudents: false }
      }));
    }
  };

  const loadClassSchedule = async () => {
    try {
      const response = await classManagementService.getClassById(classId);
      const classData = response.data?.data || response.data;
      
      if (classData && classData.scheduleJson) {
        const schedule = JSON.parse(classData.scheduleJson);
        setState(prev => ({ 
          ...prev, 
          classSchedule: {
            ...schedule,
            startDate: classData.startDate,
            endDate: classData.endDate
          }
        }));
      }
    } catch (error) {
      console.error('Error loading class schedule:', error);
    }
  };

  const checkStudentScheduleConflicts = async (studentIds) => {
    if (!state.classSchedule || studentIds.length === 0) return {};

    setState(prev => ({ ...prev, loading: { ...prev.loading, validating: true } }));
    
    try {
      const conflicts = {};
      
      // Kiểm tra conflict cho từng học sinh
      for (const studentId of studentIds) {
        try {
          // API kiểm tra lịch học của học sinh
          const response = await fetch(`http://localhost:8088/api/classes/students/${studentId}/schedule-conflicts`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              schedule: state.classSchedule,
              startDate: state.classSchedule.startDate,
              endDate: state.classSchedule.endDate
            })
          });

          if (response.ok) {
            const apiResponse = await response.json();
            const conflictData = apiResponse.data || apiResponse;
            if (conflictData.hasConflict) {
              conflicts[studentId] = conflictData.conflicts || [];
            }
          }
        } catch (error) {
          console.warn(`Error checking conflicts for student ${studentId}:`, error);
        }
      }

      setState(prev => ({ 
        ...prev, 
        scheduleConflicts: conflicts,
        loading: { ...prev.loading, validating: false }
      }));
      
      return conflicts;
    } catch (error) {
      console.error('Error checking schedule conflicts:', error);
      setState(prev => ({ ...prev, loading: { ...prev.loading, validating: false } }));
      return {};
    }
  };

  const handleAddStudents = async () => {
    if (state.selectedStudents.length === 0) {
      showNotification('Vui lòng chọn ít nhất một học viên', 'warning');
      return;
    }

    // Kiểm tra giới hạn học viên
    const totalAfterAdd = state.students.length + state.selectedStudents.length;
    if (totalAfterAdd > maxStudents) {
      showNotification(`Không thể thêm. Lớp chỉ cho phép tối đa ${maxStudents} học viên`, 'warning');
      return;
    }

    // Kiểm tra xung đột lịch học
    const conflicts = await checkStudentScheduleConflicts(state.selectedStudents);
    const conflictStudents = Object.keys(conflicts);
    
    if (conflictStudents.length > 0) {
      const conflictNames = conflictStudents.map(id => {
        const student = state.allStudents.find(s => s.id.toString() === id);
        return student?.fullName || student?.name || `ID: ${id}`;
      });
      
      const confirmed = window.confirm(
        `Phát hiện ${conflictStudents.length} học viên có xung đột lịch học:\n` +
        `${conflictNames.join(', ')}\n\n` +
        `Bạn có muốn tiếp tục thêm các học viên không có xung đột?`
      );
      
      if (!confirmed) {
        return;
      }
      
      // Chỉ thêm học viên không có xung đột
      const studentsToAdd = state.selectedStudents.filter(id => !conflicts[id]);
      if (studentsToAdd.length === 0) {
        showNotification('Tất cả học viên đã chọn đều có xung đột lịch học', 'warning');
        return;
      }
      
      setState(prev => ({ ...prev, selectedStudents: studentsToAdd }));
    }

    setState(prev => ({ ...prev, loading: { ...prev.loading, enrolling: true } }));

    try {
      const studentsToEnroll = state.selectedStudents.filter(id => !conflicts[id]);
      const enrollPromises = studentsToEnroll.map(studentId =>
        classManagementService.enrollStudent(classId, studentId)
      );

      await Promise.all(enrollPromises);

      const addedCount = studentsToEnroll.length;
      const conflictCount = state.selectedStudents.length - addedCount;
      
      let message = `Đã thêm ${addedCount} học viên vào lớp thành công!`;
      if (conflictCount > 0) {
        message += ` (${conflictCount} học viên bị loại do xung đột lịch)`;
      }
      
      showNotification(message, 'success');
      
      // Reload data and close modal
      setState(prev => ({
        ...prev,
        selectedStudents: [],
        showAddModal: false,
        scheduleConflicts: {},
        loading: { ...prev.loading, enrolling: false }
      }));
      
      loadClassStudents();
    } catch (error) {
      console.error('Error enrolling students:', error);
      showNotification('Lỗi thêm học viên: ' + error.message, 'error');
      setState(prev => ({ ...prev, loading: { ...prev.loading, enrolling: false } }));
    }
  };

  const handleRemoveStudent = async (studentId, studentName) => {
    if (!confirm(`Bạn có chắc muốn xóa học viên "${studentName}" khỏi lớp?`)) {
      return;
    }

    try {
      // API để xóa học viên khỏi lớp
      await fetch(`http://localhost:8088/api/classes/${classId}/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      showNotification(`Đã xóa học viên "${studentName}" khỏi lớp`, 'success');
      loadClassStudents();
    } catch (error) {
      console.error('Error removing student:', error);
      showNotification('Lỗi xóa học viên: ' + error.message, 'error');
    }
  };

  const handleStudentSelect = async (studentId) => {
    setState(prev => ({
      ...prev,
      selectedStudents: prev.selectedStudents.includes(studentId)
        ? prev.selectedStudents.filter(id => id !== studentId)
        : [...prev.selectedStudents, studentId]
    }));

    // Kiểm tra xung đột ngay khi chọn
    if (!state.selectedStudents.includes(studentId)) {
      await checkStudentScheduleConflicts([studentId]);
    }
  };

  const getAvailableStudents = () => {
    const enrolledIds = state.students.map(s => s.id);
    return state.allStudents
      .filter(student => !enrolledIds.includes(student.id))
      .filter(student => 
        !state.searchTerm || 
        student.fullName?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            👨‍🎓 Quản lý học viên - {className}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{state.students.length}</div>
              <div className="text-sm text-blue-800">Học viên hiện tại</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{maxStudents - state.students.length}</div>
              <div className="text-sm text-green-800">Chỗ trống</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{maxStudents}</div>
              <div className="text-sm text-gray-800">Tối đa</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Danh sách học viên</h3>
            <button
              onClick={() => setState(prev => ({ ...prev, showAddModal: true }))}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={state.students.length >= maxStudents}
            >
              + Thêm học viên
            </button>
          </div>

          {/* Students List */}
          {state.loading.students ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600">Đang tải danh sách học viên...</p>
            </div>
          ) : state.students.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <p className="text-gray-600">Chưa có học viên nào trong lớp</p>
              <p className="text-sm text-gray-500 mt-2">Nhấn "Thêm học viên" để bắt đầu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {state.students.map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{student.fullName || student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveStudent(student.id, student.fullName || student.name)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Students Modal */}
        {state.showAddModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg w-full max-w-2xl m-4">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Thêm học viên vào lớp</h3>
                <button
                  onClick={() => setState(prev => ({ ...prev, showAddModal: false, selectedStudents: [] }))}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                {/* Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Tìm kiếm học viên theo tên hoặc email..."
                    value={state.searchTerm}
                    onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Available Students */}
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {state.loading.allStudents ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-gray-600">Đang tải danh sách học sinh...</p>
                    </div>
                  ) : getAvailableStudents().length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      {state.searchTerm ? 'Không tìm thấy học sinh phù hợp' : 'Tất cả học sinh đã tham gia lớp'}
                    </div>
                  ) : (
                    getAvailableStudents().map(student => {
                      const hasConflict = state.scheduleConflicts[student.id];
                      const isSelected = state.selectedStudents.includes(student.id);
                      
                      return (
                        <label key={student.id} className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                          hasConflict 
                            ? 'border-red-200 bg-red-50 hover:bg-red-100' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleStudentSelect(student.id)}
                            className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className={`font-medium ${hasConflict ? 'text-red-900' : 'text-gray-900'}`}>
                              {student.fullName || student.name}
                              {hasConflict && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  ⚠️ Xung đột lịch
                                </span>
                              )}
                            </div>
                            <div className={`text-sm ${hasConflict ? 'text-red-600' : 'text-gray-500'}`}>
                              {student.email}
                            </div>
                            {hasConflict && (
                              <div className="text-xs text-red-600 mt-1">
                                Có xung đột với {hasConflict.length} lịch học khác
                              </div>
                            )}
                          </div>
                          {state.loading.validating && isSelected && (
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2"></div>
                          )}
                        </label>
                      );
                    })
                  )}
                </div>

                {/* Modal Actions */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                      Đã chọn: {state.selectedStudents.length} học viên
                    </div>
                    {state.loading.validating && (
                      <div className="flex items-center text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Đang kiểm tra xung đột...
                      </div>
                    )}
                  </div>
                  
                  {state.selectedStudents.length > 0 && Object.keys(state.scheduleConflicts).length > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-center">
                        <span className="text-yellow-600 mr-2">⚠️</span>
                        <div className="text-sm">
                          <div className="font-medium text-yellow-800">
                            Phát hiện xung đột lịch học
                          </div>
                          <div className="text-yellow-700 mt-1">
                            {Object.keys(state.scheduleConflicts).filter(id => state.selectedStudents.includes(parseInt(id))).length} học viên có xung đột.
                            Hệ thống sẽ chỉ thêm các học viên không có xung đột.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => setState(prev => ({ 
                        ...prev, 
                        showAddModal: false, 
                        selectedStudents: [],
                        scheduleConflicts: {}
                      }))}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleAddStudents}
                      disabled={state.selectedStudents.length === 0 || state.loading.enrolling || state.loading.validating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {state.loading.enrolling ? 'Đang thêm...' : `Thêm ${state.selectedStudents.length} học viên`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassStudentsManager;
