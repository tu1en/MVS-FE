import {
    Button,
    DatePicker,
    Form,
    message,
    Modal,
    Select,
    Spin,
    Typography
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { StudentAttendance, TeacherAttendance } from '../components/attendance';
import attendanceService from '../services/attendanceService';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * AttendancePage component for managing attendance with separate teacher and student views
 * @returns {JSX.Element} AttendancePage component
 */
function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [sessionToMark, setSessionToMark] = useState(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    averageAttendance: 0,
    totalStudents: 0,
    attendedSessions: 0,
    totalClasses: 0
  });
  
  // Get user info from localStorage
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Debug logging for role detection
  console.log('AttendancePage - Role Debug:', { 
    userId, 
    userRole, 
    roleFromStorage: localStorage.getItem('role'),
    token: localStorage.getItem('token') 
  });

  // Mock data for testing
  const mockClassrooms = [
    { id: 1, name: 'Lớp Toán 10A1', subject: 'Toán học', section: 'Khối 10' },
    { id: 2, name: 'Lớp Ngữ văn 11B2', subject: 'Ngữ văn', section: 'Khối 11' },
    { id: 3, name: 'Lớp Vật lý 12C3', subject: 'Vật lý', section: 'Khối 12' }
  ];

  const mockSessions = [
    {
      id: 1,
      name: 'Buổi học ngày 10/06/2025',
      classroomId: 1,
      classroomName: 'Lớp Toán 10A1',
      startTime: dayjs().subtract(2, 'hours').toISOString(),
      endTime: dayjs().add(2, 'hours').toISOString(),
      status: 'ACTIVE',
      requireLocation: true,
      maxDistance: 100,
      teacherId: 2
    },
    {
      id: 2,
      name: 'Buổi học ngày 08/06/2025',
      classroomId: 1,
      classroomName: 'Lớp Toán 10A1',
      startTime: dayjs().subtract(2, 'days').toISOString(),
      endTime: dayjs().subtract(2, 'days').add(2, 'hours').toISOString(),
      status: 'ENDED',
      requireLocation: false,
      maxDistance: null,
      teacherId: 2
    },
    {
      id: 3,
      name: 'Buổi học ngày 12/06/2025',
      classroomId: 2,
      classroomName: 'Lớp Ngữ văn 11B2',
      startTime: dayjs().add(1, 'days').toISOString(),
      endTime: dayjs().add(1, 'days').add(3, 'hours').toISOString(),
      status: 'PENDING',
      requireLocation: true,
      maxDistance: 200,
      teacherId: 2
    }
  ];

  const mockAttendanceRecords = [
    {
      id: 101,
      sessionId: 2,
      studentId: 1,
      studentName: 'Nguyễn Văn A',
      studentCode: 'SV001',
      status: 'PRESENT',
      checkedAt: dayjs().subtract(2, 'days').add(15, 'minutes').toISOString(),
      latitude: 21.0245,
      longitude: 105.8412
    },
    {
      id: 102,
      sessionId: 2,
      studentId: 2,
      studentName: 'Trần Thị B',
      studentCode: 'SV002',
      status: 'LATE',
      checkedAt: dayjs().subtract(2, 'days').add(45, 'minutes').toISOString(),
      latitude: 21.0246,
      longitude: 105.8413
    },
    {
      id: 103,
      sessionId: 2,
      studentId: 3,
      studentName: 'Lê Văn C',
      studentCode: 'SV003',
      status: 'ABSENT',
      checkedAt: null,
      latitude: null,
      longitude: null
    },
    {
      id: 104,
      sessionId: 1,
      studentId: 1,
      studentName: 'Nguyễn Văn A',
      studentCode: 'SV001',
      status: 'PRESENT',
      checkedAt: dayjs().subtract(30, 'minutes').toISOString(),
      latitude: 21.0245,
      longitude: 105.8412
    }
  ];

  const mockStudentAttendance = {
    totalClasses: 10,
    attendedClasses: 8,
    lateClasses: 1,
    absentClasses: 1,
    bySubject: [
      { subject: 'Toán học', present: 5, late: 0, absent: 0, total: 5 },
      { subject: 'Ngữ văn', present: 3, late: 1, absent: 1, total: 5 }
    ]
  };

  useEffect(() => {
    // Load data from API or use mock data
    loadData();
  }, [userId, token, userRole]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Try to load real data from API
      let sessionsData = [];
      let classroomsData = [];
      let attendanceData = [];
      
      try {
        if (userRole === '2' || userRole === 'TEACHER') {
          // Teacher view - load sessions created by this teacher
          const sessionsResponse = await attendanceService.getTeacherSessions(userId);
          if (sessionsResponse && Array.isArray(sessionsResponse)) {
            sessionsData = sessionsResponse;
          }
          
          // Load classrooms taught by this teacher
          const classroomsResponse = await attendanceService.getTeacherClassrooms(userId);
          if (classroomsResponse && Array.isArray(classroomsResponse)) {
            classroomsData = classroomsResponse;
          }
          
          // Load attendance records for teacher's sessions
          const attendanceResponse = await attendanceService.getTeacherAttendanceRecords(userId);
          if (attendanceResponse && Array.isArray(attendanceResponse)) {
            attendanceData = attendanceResponse;
          }
        } else if (userRole === '1' || userRole === 'STUDENT') {
          // Student view - load sessions for student's classes
          const sessionsResponse = await attendanceService.getStudentSessions(userId);
          if (sessionsResponse && Array.isArray(sessionsResponse)) {
            sessionsData = sessionsResponse;
          }
          
          // Load student's attendance records
          const attendanceResponse = await attendanceService.getStudentAttendanceRecords(userId);
          if (attendanceResponse && Array.isArray(attendanceResponse)) {
            attendanceData = attendanceResponse;
          }
        }
      } catch (error) {
        console.error('Error loading data from API:', error);
        // Fall back to mock data
        sessionsData = mockSessions;
        classroomsData = mockClassrooms;
        attendanceData = mockAttendanceRecords;
      }
      
      // If no data was loaded from API, use mock data
      if (sessionsData.length === 0) sessionsData = mockSessions;
      if (classroomsData.length === 0) classroomsData = mockClassrooms;
      if (attendanceData.length === 0) attendanceData = mockAttendanceRecords;
      
      setSessions(sessionsData);
      setClassrooms(classroomsData);
      setAttendanceRecords(attendanceData);
      
      // Calculate stats
      calculateStats(sessionsData, attendanceData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error in loadData:', error);
      message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const calculateStats = (sessionsData, attendanceData) => {
    if (userRole === '2' || userRole === 'TEACHER') { // Teacher
      const activeSessions = sessionsData.filter(s => s.status === 'ACTIVE').length;
      const totalStudents = [...new Set(attendanceData.map(a => a.studentId))].length;
      const presentCount = attendanceData.filter(a => a.status === 'PRESENT').length;
      const averageAttendance = attendanceData.length > 0 ? 
        Math.round((presentCount / attendanceData.length) * 100) : 0;

      setStats({
        totalSessions: sessionsData.length,
        activeSessions: activeSessions,
        averageAttendance: averageAttendance,
        totalStudents: totalStudents
      });
    } else { // Student
      setStats({
        totalClasses: mockStudentAttendance.totalClasses,
        attendedSessions: mockStudentAttendance.attendedClasses,
        attendanceRate: Math.round((mockStudentAttendance.attendedClasses / mockStudentAttendance.totalClasses) * 100)
      });
    }
  };

  // Teacher functions
  const calculateAttendanceRate = (sessionId) => {
    const sessionAttendances = attendanceRecords.filter(a => a.sessionId === sessionId);
    if (sessionAttendances.length === 0) return 0;
    
    const presentCount = sessionAttendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    return Math.round((presentCount / sessionAttendances.length) * 100);
  };

  const getSessionAttendance = (sessionId) => {
    return attendanceRecords.filter(a => a.sessionId === sessionId);
  };

  const toggleSessionStatus = (sessionId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'ENDED' : 'ACTIVE';
    
    // Update in the backend
    attendanceService.updateSessionStatus(sessionId, newStatus)
      .then(() => {
        // Update local state
        const updatedSessions = sessions.map(session => 
          session.id === sessionId ? { ...session, status: newStatus } : session
        );
        
        setSessions(updatedSessions);
        message.success(`Phiên điểm danh đã được ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'kết thúc'}`);
      })
      .catch(error => {
        console.error('Error updating session status:', error);
        message.error('Không thể cập nhật trạng thái phiên điểm danh');
      });
  };

  const handleCreateSession = (values) => {
    const startTime = values.timeRange[0].toISOString();
    const endTime = values.timeRange[1].toISOString();
    
    const sessionData = {
      name: values.name,
      classroomId: values.classroomId,
      startTime: startTime,
      endTime: endTime,
      requireLocation: values.requireLocation,
      maxDistance: values.requireLocation ? values.maxDistance : null,
      teacherId: parseInt(userId) || 2
    };
    
    // Create session in the backend
    attendanceService.createAttendanceSession(sessionData)
      .then(newSession => {
        // Update local state
        setSessions([...sessions, newSession]);
        setCreateModalVisible(false);
        form.resetFields();
        message.success('Phiên điểm danh mới đã được tạo');
      })
      .catch(error => {
        console.error('Error creating session:', error);
        message.error('Không thể tạo phiên điểm danh');
      });
  };

  const viewSessionDetails = (session) => {
    setSelectedSession(session);
    setDetailModalVisible(true);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          message.error('Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập vị trí.');
        }
      );
    } else {
      message.error('Trình duyệt của bạn không hỗ trợ định vị.');
    }
  };

  const markAttendance = async (session) => {
    if (!location) {
      setSessionToMark(session);
      setShowLocationPrompt(true);
      return;
    }
    
    setMarkingAttendance(true);
    
    try {
      // Check if location is required and within range
      if (session.requireLocation) {
        const distance = calculateDistance(
          location.latitude, 
          location.longitude, 
          session.latitude || 0, 
          session.longitude || 0
        );
        
        if (distance > (session.maxDistance || 100)) {
          message.error(`Bạn đang ở ngoài phạm vi cho phép (${session.maxDistance || 100}m). Không thể điểm danh.`);
          setMarkingAttendance(false);
          return;
        }
      }
      
      // Mark attendance in the backend
      await attendanceService.markAttendance({
        sessionId: session.id,
        studentId: parseInt(userId),
        latitude: location?.latitude,
        longitude: location?.longitude,
        status: 'PRESENT'
      });
      
      message.success('Điểm danh thành công!');
      
      // Refresh data
      loadData();
    } catch (error) {
      console.error('Error marking attendance:', error);
      message.error('Không thể điểm danh. Vui lòng thử lại sau.');
    } finally {
      setMarkingAttendance(false);
    }
  };

  const handleLocationPrompt = () => {
    getCurrentLocation();
    setShowLocationPrompt(false);
    
    if (sessionToMark && location) {
      markAttendance(sessionToMark);
      setSessionToMark(null);
    }
  };

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const isStudentAttended = (sessionId) => {
    return attendanceRecords.some(record => 
      record.sessionId === sessionId && 
      record.studentId === parseInt(userId) && 
      (record.status === 'PRESENT' || record.status === 'LATE')
    );
  };

  // UI Components
  const showMessageBox = (title, message) => {
    Modal.info({
      title: title,
      content: message,
    });
  };

  // Render the main content based on user role
  const renderMainContent = () => {
    // If no role is detected, show error message
    if (!userRole || !userId) {
      return (
        <div className="text-center p-8">
          <h2>⚠️ Lỗi phân quyền</h2>
          <p>Không thể xác định vai trò người dùng. Vui lòng đăng nhập lại.</p>
          <Button type="primary" onClick={() => window.location.href = '/login'}>
            Đăng nhập lại
          </Button>
        </div>
      );
    }

    // Use the dedicated components based on user role
    if (userRole === '1' || userRole === 'STUDENT') {
      return (
        <StudentAttendance 
          showMessageBox={showMessageBox}
          onLogout={() => window.location.href = '/login'}
        />
      );
    } else if (userRole === '2' || userRole === 'TEACHER' || 
               userRole === '0' || userRole === 'ADMIN' || 
               userRole === '3' || userRole === 'MANAGER') {
      return (
        <TeacherAttendance 
          showMessageBox={showMessageBox}
          onLogout={() => window.location.href = '/login'}
        />
      );
    }
    
    // If role is not recognized, show error
    return (
      <div className="text-center p-8">
        <h2>⚠️ Vai trò không được hỗ trợ</h2>
        <p>Vai trò "{userRole}" không được hỗ trợ cho trang này.</p>
        <Button type="primary" onClick={() => window.location.href = '/login'}>
          Đăng nhập lại
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="attendance-page">
      {renderMainContent()}
    </div>
  );
}

export default AttendancePage; 