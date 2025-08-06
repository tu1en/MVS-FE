import axiosInstance from '../config/axiosInstance';

const parentService = {
  async getDashboardStats() {
    const res = await axiosInstance.get('/parent/dashboard-stats');
    return res.data;
  },
  async getChildren() {
    const res = await axiosInstance.get('/parent/children');
    return res.data;
  },
  async getChildAcademicPerformance(childId) {
    const res = await axiosInstance.get(`/parent/children/${childId}/academic-performance`);
    return res.data;
  },
  async getChildAttendance(childId) {
    const res = await axiosInstance.get(`/parent/children/${childId}/attendance`);
    return res.data;
  },
  async getChildSchedule(childId) {
    const res = await axiosInstance.get(`/parent/children/${childId}/schedule`);
    return res.data;
  },
  async getChildAssignments(childId) {
    const res = await axiosInstance.get(`/parent/children/${childId}/assignments`);
    return res.data;
  },
  async getRelationship(childId) {
    const res = await axiosInstance.get(`/parent/relationship/${childId}`);
    return res.data;
  },
};

export default parentService;