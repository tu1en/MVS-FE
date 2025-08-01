import api from '../config/axiosInstance';

const absenceService = {
  // Teacher operations - submit leave request
  submitLeaveRequest: (data) => {
    return api.post('/teacher/absences', data);
  },

  // Teacher operations - get my leave requests
  getMyLeaveRequests: () => {
    return api.get('/teacher/absences');
  },

  // Teacher operations - get specific leave request
  getLeaveRequestById: (absenceId) => {
    return api.get(`/teacher/absences/${absenceId}`);
  },

  // Manager operations - get all absence requests
  getAllAbsenceRequests: () => {
    return api.get('/manager/absences/requests');
  },

  // Manager operations - get pending absence requests
  getPendingAbsenceRequests: () => {
    return api.get('/manager/absences/requests/pending');
  },

  // Manager operations - get all teachers leave information
  getAllTeachersLeaveInfo: () => {
    return api.get('/manager/absences/teachers');
  },

  // Manager operations - get specific teacher leave information
  getTeacherLeaveInfo: (teacherId) => {
    return api.get(`/manager/absences/teachers/${teacherId}`);
  },

  // Manager operations - approve absence request
  approveAbsenceRequest: (absenceId) => {
    return api.post(`/manager/absences/requests/${absenceId}/approve`);
  },

  // Manager operations - reject absence request
  rejectAbsenceRequest: (absenceId, reason) => {
    return api.post(`/manager/absences/requests/${absenceId}/reject`, reason, {
      headers: { 'Content-Type': 'text/plain' }
    });
  },

  // Manager operations - get all employees leave information (Teacher + Accountant)
  getAllEmployeesLeaveInfo: () => {
    return api.get('/manager/absences/employees');
  }
};

export default absenceService; 