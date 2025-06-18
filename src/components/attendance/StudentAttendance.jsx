import { CheckCircleOutlined, CloseCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Empty, Spin, Tag, message } from 'antd';
import React, { useEffect, useState } from 'react';

// StudentAttendance Component để sinh viên điểm danh
const StudentAttendance = ({ onLogout, showMessageBox }) => {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);
  const [locationStatus, setLocationStatus] = useState('pending'); // 'pending', 'checking', 'passed', 'failed'
  const [selectedSession, setSelectedSession] = useState(null);
  
  // --- Mock Data ---
  const mockUserInfo = {
    id: 'SV001',
    name: 'Nguyễn Văn A',
    studentCode: 'SV001',
    class: 'KTPM1',
  };
  
  const mockTimetable = [
    {
      id: 'session-001',
      name: 'Buổi học Lập trình Web',
      class: 'KTPM1',
      classroomName: 'KTPM1',
      time: '18/06/2025 08:00 - 11:00',
      status: 'Đang hoạt động',
      location: { latitude: 21.028511, longitude: 105.804817, radius: 200 }, // 200 meters
    },
    {
      id: 'session-002',
      name: 'Buổi học Cơ sở dữ liệu',
      class: 'KTPM1',
      classroomName: 'KTPM1',
      time: '19/06/2025 13:00 - 16:00',
      status: 'Sắp tới',
    },
    {
      id: 'session-003',
      name: 'Buổi học Thiết kế phần mềm',
      class: 'KTPM1',
      classroomName: 'KTPM1',
      time: '20/06/2025 09:00 - 12:00',
      status: 'Sắp tới',
    },
    {
      id: 'session-004',
      name: 'Buổi học Cấu trúc dữ liệu',
      class: 'KTPM1',
      classroomName: 'KTPM1',
      time: '15/06/2025 10:00 - 13:00',
      status: 'Đã kết thúc',
    },
  ];
  
  const mockAttendanceHistory = [
    {
      id: 'att-001',
      sessionId: 'session-004',
      sessionName: 'Buổi học Cấu trúc dữ liệu',
      date: '15/06/2025',
      time: '10:15',
      status: 'present',
    },
    {
      id: 'att-002',
      sessionId: 'past-session-001',
      sessionName: 'Buổi học Lập trình hướng đối tượng',
      date: '10/06/2025',
      time: '09:30',
      status: 'present',
    },
    {
      id: 'att-003',
      sessionId: 'past-session-002',
      sessionName: 'Buổi học Mạng máy tính',
      date: '08/06/2025',
      time: '14:00',
      status: 'absent',
    },
  ];

  // --- API Mock Functions ---
  
  // Lấy danh sách phiên điểm danh
  const fetchSessions = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setSessions(mockTimetable);
        
        // Lọc ra các phiên đang hoạt động
        const active = mockTimetable.filter(s => s.status === 'ACTIVE' || s.status === 'Đang hoạt động');
        setActiveSessions(active);
        
        setLoading(false);
      }, 600);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phiên điểm danh:', error);
      showMessageBox('Lỗi', 'Không thể lấy danh sách phiên điểm danh. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };
  
  // Lấy lịch sử điểm danh
  const fetchMyAttendance = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setMyAttendance(mockAttendanceHistory);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử điểm danh:', error);
      showMessageBox('Lỗi', 'Không thể lấy lịch sử điểm danh. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };
  
  // Gửi điểm danh
  const markAttendance = async (sessionId) => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        console.log('Đã điểm danh cho phiên:', sessionId);
        
        // Cập nhật lịch sử điểm danh
        const session = sessions.find(s => s.id === sessionId);
        const now = new Date();
        const newAttendance = {
          id: `att-${Date.now()}`,
          sessionId: sessionId,
          sessionName: session.name,
          date: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`,
          time: `${now.getHours()}:${now.getMinutes()}`,
          status: 'present',
        };
        
        setMyAttendance([newAttendance, ...myAttendance]);
        
        // Cập nhật danh sách phiên điểm danh
        setActiveSessions(activeSessions.filter(s => s.id !== sessionId));
        
        message.success('Điểm danh thành công!');
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Lỗi khi điểm danh:', error);
      showMessageBox('Lỗi', 'Không thể điểm danh. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Kiểm tra vị trí
  const checkLocation = async (sessionId) => {
    setLocationStatus('checking');
    
    try {
      if (!navigator.geolocation) {
        showMessageBox('Lỗi', 'Trình duyệt của bạn không hỗ trợ định vị vị trí.');
        setLocationStatus('failed');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Tìm phiên học và kiểm tra vị trí
          const session = sessions.find(s => s.id === sessionId);
          
          if (!session || !session.location) {
            // Nếu phiên không có thông tin vị trí, coi như đã vượt qua
            setLocationStatus('passed');
            return;
          }
          
          // Tính khoảng cách giữa vị trí hiện tại và vị trí lớp học
          const distance = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            session.location.latitude,
            session.location.longitude
          );
          
          if (distance <= session.location.radius) {
            setLocationStatus('passed');
            console.log('Vị trí hợp lệ, khoảng cách:', distance, 'm');
          } else {
            setLocationStatus('failed');
            console.log('Vị trí không hợp lệ, khoảng cách:', distance, 'm');
            showMessageBox('Thông báo', `Bạn cách lớp học ${Math.round(distance)} mét. Vui lòng đến gần hơn để điểm danh.`);
          }
        },
        (error) => {
          console.error('Lỗi khi xác định vị trí:', error);
          showMessageBox('Lỗi', 'Không thể xác định vị trí của bạn. Vui lòng cho phép truy cập vị trí và thử lại.');
          setLocationStatus('failed');
        },
        { enableHighAccuracy: true }
      );
    } catch (error) {
      console.error('Lỗi khi kiểm tra vị trí:', error);
      showMessageBox('Lỗi', 'Xảy ra lỗi khi kiểm tra vị trí. Vui lòng thử lại sau.');
      setLocationStatus('failed');
    }
  };
  
  // Hàm tính khoảng cách giữa hai điểm bằng công thức Haversine
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Bán kính Trái Đất (mét)
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  };
  
  // Load dữ liệu khi component được mount
  useEffect(() => {
    fetchSessions();
    fetchMyAttendance();
  }, []);
  
  const handleAttendSession = (session) => {
    setSelectedSession(session);
    checkLocation(session.id);
  };
  
  const handleConfirmAttendance = () => {
    if (selectedSession && locationStatus === 'passed') {
      markAttendance(selectedSession.id);
      setSelectedSession(null);
      setLocationStatus('pending');
    }
  };
  
  // --- Component UI ---
  
  // Active Sessions Component
  const ActiveSessionsPanel = () => {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Phiên đang diễn ra</h3>
        
        {loading ? (
          <div className="py-6 text-center">
            <Spin size="default" />
            <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : activeSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <h4 className="font-bold text-lg text-gray-800">{session.name}</h4>
                <p className="text-gray-600 mb-2">Lớp: {session.classroomName || session.class}</p>
                <p className="text-gray-600 mb-3">Thời gian: {session.time}</p>
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    Đang hoạt động
                  </span>
                  <button
                    onClick={() => handleAttendSession(session)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200"
                  >
                    Điểm danh
                  </button>
                </div>
                {selectedSession?.id === session.id && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">Trạng thái vị trí:</span>
                      {locationStatus === 'checking' && <Spin size="small" />}
                      {locationStatus === 'passed' && <Tag color="success">Hợp lệ</Tag>}
                      {locationStatus === 'failed' && <Tag color="error">Không hợp lệ</Tag>}
                    </div>
                    {locationStatus === 'passed' && (
                      <button
                        onClick={handleConfirmAttendance}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 mt-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-200"
                      >
                        Xác nhận điểm danh
                      </button>
                    )}
                    {locationStatus === 'failed' && (
                      <div className="flex items-center mt-2 text-red-500">
                        <EnvironmentOutlined style={{ marginRight: '8px' }} />
                        <span>Vị trí không hợp lệ, vui lòng đến gần lớp học hơn</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Empty description="Không có phiên điểm danh nào đang diễn ra" />
        )}
      </div>
    );
  };
  
  // Upcoming Sessions Component
  const UpcomingSessionsPanel = () => {
    const upcomingSessions = sessions.filter(s => s.status === 'PENDING' || s.status === 'Sắp tới');
    
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Phiên sắp tới</h3>
        
        {loading ? (
          <div className="py-6 text-center">
            <Spin size="default" />
            <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : upcomingSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Tên phiên</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Lớp học</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {upcomingSessions.map((session, index) => (
                  <tr key={session.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200`}>
                    <td className="py-2 px-4 text-gray-800">{session.name}</td>
                    <td className="py-2 px-4 text-gray-800">{session.classroomName || session.class}</td>
                    <td className="py-2 px-4 text-gray-800">{session.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty description="Không có phiên điểm danh sắp tới" />
        )}
      </div>
    );
  };
  
  // Attendance History Component
  const AttendanceHistoryPanel = () => {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Lịch sử điểm danh</h3>
        
        {loading ? (
          <div className="py-6 text-center">
            <Spin size="default" />
            <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : myAttendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Buổi học</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Ngày</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Giờ điểm danh</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {myAttendance.map((record, index) => (
                  <tr key={record.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200`}>
                    <td className="py-2 px-4 text-gray-800">{record.sessionName}</td>
                    <td className="py-2 px-4 text-gray-800">{record.date}</td>
                    <td className="py-2 px-4 text-gray-800">{record.time}</td>
                    <td className="py-2 px-4">
                      {record.status === 'present' ? (
                        <Tag icon={<CheckCircleOutlined />} color="success">Có mặt</Tag>
                      ) : (
                        <Tag icon={<CloseCircleOutlined />} color="error">Vắng mặt</Tag>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty description="Không có lịch sử điểm danh" />
        )}
      </div>
    );
  };
  
  // Main Dashboard Component
  const StudentDashboard = () => {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-6xl mt-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Điểm danh sinh viên</h2>
            <div className="flex items-center">
              <img
                src={`https://placehold.co/40x40/ADD8E6/000000?text=${mockUserInfo.name.charAt(0)}`}
                alt={`Ảnh của ${mockUserInfo.name}`}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-medium">{mockUserInfo.name}</p>
                <p className="text-sm text-gray-600">{mockUserInfo.studentCode}</p>
              </div>
            </div>
          </div>
          
          {/* Phiên đang diễn ra */}
          <ActiveSessionsPanel />
          
          {/* Phiên sắp tới */}
          <UpcomingSessionsPanel />
          
          {/* Lịch sử điểm danh */}
          <AttendanceHistoryPanel />
          
          <button
            onClick={onLogout}
            className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-200"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  };
  
  // --- Main Render Logic ---
  if (loading && !sessions.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-3 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }
  
  return <StudentDashboard />;
};

export default StudentAttendance; 