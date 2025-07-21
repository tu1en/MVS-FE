import axiosInstance from '../config/axiosInstance';

const API_URL = '/classroom-management/classrooms';

const ClassroomService = {
  getAllClassrooms: () => axiosInstance.get(API_URL),

  getClassroomById: (id) => axiosInstance.get(`${API_URL}/${id}`),

  getClassroomsByCurrentTeacher: () => axiosInstance.get(`${API_URL}/current-teacher`),

  createClassroom: (classroomData) => axiosInstance.post(API_URL, classroomData),

  updateClassroom: (id, classroomData) => axiosInstance.put(`${API_URL}/${id}`, classroomData),

  deleteClassroom: (id) => axiosInstance.delete(`${API_URL}/${id}`),

  enrollStudent: (classroomId, studentId) =>
    axiosInstance.post(`${API_URL}/${classroomId}/enrollments`, { studentId }),

  getStudentsInClassroom: (classroomId) =>
    axiosInstance.get(`${API_URL}/${classroomId}/students`),

  removeStudent: (classroomId, studentId) =>
    axiosInstance.delete(`${API_URL}/${classroomId}/enrollments/${studentId}`),

  getStudentCourses: (studentId) => axiosInstance.get(`${API_URL}/student/${studentId}`),

  getMyStudentCourses: () => axiosInstance.get(`${API_URL}/student/me`),

  getClassroomDetails: (id) => axiosInstance.get(`${API_URL}/${id}/details`),

  getEnrolledCourses: () => axiosInstance.get(`${API_URL}/student/me`),
};

export default ClassroomService;
