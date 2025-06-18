// scheduleService.js - Dịch vụ quản lý lịch học/dạy
import axios from 'axios';

// API Service cho lịch học/giảng dạy khi API thực sự sẵn sàng
export const fetchTeacherSchedule = async (token) => {
  try {
    const response = await axios.get('/api/teacher/schedule', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher schedule:', error);
    throw error;
  }
};

export const fetchTeacherScheduleByDay = async (token, dayOfWeek) => {
  try {
    const response = await axios.get(`/api/teacher/schedule/day/${dayOfWeek}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher schedule by day:', error);
    throw error;
  }
};

export const createScheduleEntry = async (token, scheduleData) => {
  try {
    const response = await axios.post('/api/teacher/schedule', scheduleData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating schedule entry:', error);
    throw error;
  }
};

// Dữ liệu mẫu cho lịch học/dạy (trong thực tế, dữ liệu này sẽ được lấy từ API)
const scheduleDatabase = [
  {
    id: 1,
    classId: 'A10',
    className: 'Lớp A10',
    subject: 'Môn Toán',
    day: 0, // Thứ 2
    start: '08:00',
    end: '10:00',
    teacherId: 1,
    teacherName: 'Cô Lan',
    studentIds: [101, 102, 103, 104, 105],
    materialsUrl: '#',
    meetUrl: null,
    room: 'P201'
  },
  {
    id: 2,
    classId: 'A11',
    className: 'Lớp A11',
    subject: 'Môn Tiếng Anh',
    day: 0, // Thứ 2
    start: '10:00',
    end: '12:00',
    teacherId: 2,
    teacherName: 'Cô Mai',
    studentIds: [101, 103, 105, 107, 109],
    materialsUrl: null,
    meetUrl: null,
    room: 'P202'
  },
  {
    id: 3,
    classId: 'A12',
    className: 'Lớp A12',
    subject: 'Môn Lý',
    day: 0, // Thứ 2
    start: '12:00',
    end: '14:00',
    teacherId: 3,
    teacherName: 'Cô Hương',
    studentIds: [102, 104, 106, 108],
    materialsUrl: '#',
    meetUrl: null,
    room: 'P203'
  },
  {
    id: 4,
    classId: 'A10',
    className: 'Lớp A10',
    subject: 'Môn Toán',
    day: 1, // Thứ 3
    start: '10:00',
    end: '12:00',
    teacherId: 1,
    teacherName: 'Cô Lan',
    studentIds: [101, 102, 103, 104, 105],
    materialsUrl: null,
    meetUrl: '#',
    room: 'P201'
  },
  {
    id: 5,
    classId: 'A13',
    className: 'Lớp A13',
    subject: 'Môn Hóa',
    day: 2, // Thứ 4
    start: '08:00',
    end: '10:00',
    teacherId: 4,
    teacherName: 'Cô Hà',
    studentIds: [101, 103, 105, 107],
    materialsUrl: '#',
    meetUrl: null,
    room: 'P204'
  },
  {
    id: 6,
    classId: 'A14',
    className: 'Lớp A14',
    subject: 'Môn Tiếng Anh',
    day: 2, // Thứ 4
    start: '15:00',
    end: '17:00',
    teacherId: 2,
    teacherName: 'Cô Mai',
    studentIds: [102, 104, 106, 108],
    materialsUrl: null,
    meetUrl: null,
    room: 'P205'
  },
  {
    id: 7,
    classId: 'A15',
    className: 'Lớp A15',
    subject: 'Môn Văn',
    day: 2, // Thứ 4
    start: '20:00',
    end: '22:00',
    teacherId: 3,
    teacherName: 'Cô Hương',
    studentIds: [101, 102, 103, 104],
    materialsUrl: null,
    meetUrl: '#',
    room: 'Online'
  },
  {
    id: 8,
    classId: 'B12',
    className: 'Lớp B12',
    subject: 'Môn Toán',
    day: 3, // Thứ 5
    start: '13:00',
    end: '15:00',
    teacherId: 1,
    teacherName: 'Cô Lan',
    studentIds: [110, 111, 112, 113],
    materialsUrl: null,
    meetUrl: null,
    room: 'P301'
  },
  {
    id: 9,
    classId: 'C15',
    className: 'Lớp C15',
    subject: 'Môn Toán',
    day: 4, // Thứ 6
    start: '08:00',
    end: '10:00',
    teacherId: 1,
    teacherName: 'Cô Lan',
    studentIds: [114, 115, 116],
    materialsUrl: '#',
    meetUrl: null,
    room: 'P302'
  },
  {
    id: 10,
    classId: 'D20',
    className: 'Lớp D20',
    subject: 'Toán Nâng Cao',
    day: 4, // Thứ 6
    start: '15:30',
    end: '17:30',
    teacherId: 1,
    teacherName: 'Cô Lan',
    studentIds: [101, 105, 110, 115],
    materialsUrl: null,
    meetUrl: '#',
    room: 'P303'
  }
];

// Hàm lấy tất cả lịch học
export const getSchedules = () => {
  return scheduleDatabase;
};

// Hàm lấy lịch học cho học sinh theo ID và tuần
export const getStudentSchedule = (studentId, weekStart) => {
  console.log(`Fetching schedule for student ${studentId} for week starting: ${weekStart}`);
  
  // Lọc các lớp học mà học sinh tham gia
  return scheduleDatabase.filter(schedule => schedule.studentIds.includes(studentId));
};

// Hàm lấy lịch dạy cho giáo viên theo ID và tuần
export const getTeacherSchedule = (teacherId, weekStart) => {
  console.log(`Fetching schedule for teacher ${teacherId} for week starting: ${weekStart}`);
  
  // Lọc các lớp học mà giáo viên dạy
  return scheduleDatabase.filter(schedule => schedule.teacherId === teacherId);
};

// Hàm lấy chi tiết buổi học theo ID
export const getScheduleDetail = (scheduleId) => {
  return scheduleDatabase.find(schedule => schedule.id === scheduleId);
};

// Hàm thêm lịch học mới (dành cho quản lý)
export const addSchedule = (scheduleData) => {
  const newSchedule = {
    ...scheduleData,
    id: Math.max(...scheduleDatabase.map(s => s.id), 0) + 1
  };
  scheduleDatabase.push(newSchedule);
  return newSchedule;
};

// Hàm cập nhật lịch học (dành cho quản lý)
export const updateSchedule = (scheduleId, scheduleData) => {
  const index = scheduleDatabase.findIndex(s => s.id === scheduleId);
  if (index !== -1) {
    scheduleDatabase[index] = { ...scheduleDatabase[index], ...scheduleData };
    return scheduleDatabase[index];
  }
  return null;
};

// Hàm xóa lịch học (dành cho quản lý)
export const deleteSchedule = (scheduleId) => {
  const index = scheduleDatabase.findIndex(s => s.id === scheduleId);
  if (index !== -1) {
    const deletedSchedule = scheduleDatabase[index];
    scheduleDatabase.splice(index, 1);
    return deletedSchedule;
  }
  return null;
};

export default {
  getStudentSchedule,
  getTeacherSchedule,
  getScheduleDetail,
  getSchedules,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  fetchTeacherSchedule,
  fetchTeacherScheduleByDay,
  createScheduleEntry
};
