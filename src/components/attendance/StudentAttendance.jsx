import { CheckCircleOutlined, CloseCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { App, Empty, Spin, Tag } from 'antd';
import { useEffect, useState } from 'react';
import attendanceService from '../../services/attendanceService';

// StudentAttendance Component để sinh viên điểm danh
const StudentAttendance = ({ onLogout, showMessageBox }) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);
  const [locationStatus, setLocationStatus] = useState('pending'); // 'pending', 'checking', 'passed', 'failed'
  const [selectedSession, setSelectedSession] = useState(null);  const [apiCallsInProgress, setApiCallsInProgress] = useState({ sessions: false, attendance: false });
  const [errorShown, setErrorShown] = useState({ sessions: false, attendance: false });
  const [hasApiError, setHasApiError] = useState({ sessions: false, attendance: false });
  // --- API Functions ---  // Lấy danh sách phiên điểm danh
  const fetchSessions = async () => {
    if (apiCallsInProgress.sessions) {
      return; // Prevent duplicate calls silently
    }
    
    setApiCallsInProgress(prev => ({ ...prev, sessions: true }));
    setLoading(true);
    try {
      const response = await attendanceService.getAttendanceSessions();
      setSessions(response || []);
      
      // Lọc ra các phiên đang hoạt động
      const active = response ? response.filter(s => s.status === 'ACTIVE') : [];
      setActiveSessions(active);
      
      // Clear any previous errors
      setHasApiError(prev => ({ ...prev, sessions: false }));
    } catch (error) {
      // This block should never be reached now that the service returns empty arrays instead of throwing
      console.error('Unexpected error in fetchSessions:', error);
      setSessions([]);
      setActiveSessions([]);
      setHasApiError(prev => ({ ...prev, sessions: true }));
      
      if (!errorShown.sessions) {
        setErrorShown(prev => ({ ...prev, sessions: true }));
        if (typeof showMessageBox === 'function') {
          showMessageBox('Lỗi', 'Không thể lấy danh sách phiên điểm danh. Vui lòng thử lại sau.');
        } else {
          message.error('Không thể lấy danh sách phiên điểm danh. Vui lòng thử lại sau.');
        }
      }
    } finally {
      setLoading(false);
      setApiCallsInProgress(prev => ({ ...prev, sessions: false }));
    }
  };    // Lấy lịch sử điểm danh
  const fetchMyAttendance = async () => {
    if (apiCallsInProgress.attendance) {
      return; // Prevent duplicate calls silently
    }
    
    setApiCallsInProgress(prev => ({ ...prev, attendance: true }));
    setLoading(true);
    try {
      const response = await attendanceService.getStudentAttendanceView();
      const records = response?.records || [];
      
      // Transform API response to match component's expected format
      const formattedRecords = records.map(record => ({
        id: record.id || `att-${Date.now()}`,
        sessionId: record.sessionId,
        sessionName: record.classroomName || 'Không có tên',
        date: record.sessionDate || new Date().toLocaleDateString(),
        time: record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        status: record.status === 'PRESENT' ? 'present' : 
                record.status === 'LATE' ? 'present' : 'absent'
      }));
      
      setMyAttendance(formattedRecords);
      
      // Clear any previous errors
      setHasApiError(prev => ({ ...prev, attendance: false }));
    } catch (error) {
      // This block should never be reached now that the service returns empty arrays instead of throwing
      console.error('Unexpected error in fetchMyAttendance:', error);
      setMyAttendance([]);
      setHasApiError(prev => ({ ...prev, attendance: true }));
      
      if (!errorShown.attendance) {
        setErrorShown(prev => ({ ...prev, attendance: true }));
        if (typeof showMessageBox === 'function') {
          showMessageBox('Lỗi', 'Không thể lấy lịch sử điểm danh. Vui lòng thử lại sau.');
        } else {
          message.error('Không thể lấy lịch sử điểm danh. Vui lòng thử lại sau.');
        }
      }
    } finally {
      setLoading(false);
      setApiCallsInProgress(prev => ({ ...prev, attendance: false }));
    }
  };
  
  // Gửi điểm danh
  const markAttendance = async (sessionId) => {
    setLoading(true);
    try {
      // Get current location for attendance
      const position = await getCurrentPositionPromise();
      
      // Send attendance data to API
      await attendanceService.markAttendance(sessionId, {
        sessionId,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
      
      // Update attendance history
      await fetchMyAttendance();
      
      // Update active sessions
      setActiveSessions(activeSessions.filter(s => s.id !== sessionId));
      
      message.success('Điểm danh thành công!');
      setLoading(false);    } catch (error) {
      console.error('Lỗi khi điểm danh:', error);
      if (typeof showMessageBox === 'function') {
        showMessageBox('Lỗi', 'Không thể điểm danh. Vui lòng thử lại sau.');
      } else {
        message.error('Không thể điểm danh. Vui lòng thử lại sau.');
      }
      setLoading(false);
    }
  };
  
  // Promise wrapper for getCurrentPosition
  const getCurrentPositionPromise = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Trình duyệt của bạn không hỗ trợ định vị vị trí.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(error),
        { enableHighAccuracy: true }
      );
    });
  };

  // Kiểm tra vị trí
  const checkLocation = async (sessionId) => {
    setLocationStatus('checking');
    
    try {      if (!navigator.geolocation) {
        if (typeof showMessageBox === 'function') {
          showMessageBox('Lỗi', 'Trình duyệt của bạn không hỗ trợ định vị vị trí.');
        } else {
          message.error('Trình duyệt của bạn không hỗ trợ định vị vị trí.');
        }
        setLocationStatus('failed');
        return;
      }

      // Get session location data from API or sessions state
      const session = sessions.find(s => s.id === sessionId);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
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
            console.log('Vị trí hợp lệ, khoảng cách:', distance, 'm');          } else {
            setLocationStatus('failed');
            console.log('Vị trí không hợp lệ, khoảng cách:', distance, 'm');
            if (typeof showMessageBox === 'function') {
              showMessageBox('Thông báo', `Bạn cách lớp học ${Math.round(distance)} mét. Vui lòng đến gần hơn để điểm danh.`);
            } else {
              message.warning(`Bạn cách lớp học ${Math.round(distance)} mét. Vui lòng đến gần hơn để điểm danh.`);
            }
          }
        },
        (error) => {
          console.error('Lỗi khi xác định vị trí:', error);
          if (typeof showMessageBox === 'function') {
            showMessageBox('Lỗi', 'Không thể xác định vị trí của bạn. Vui lòng cho phép truy cập vị trí và thử lại.');
          } else {
            message.error('Không thể xác định vị trí của bạn. Vui lòng cho phép truy cập vị trí và thử lại.');
          }
          setLocationStatus('failed');
        },
        { enableHighAccuracy: true }
      );    } catch (error) {
      console.error('Lỗi khi kiểm tra vị trí:', error);
      if (typeof showMessageBox === 'function') {
        showMessageBox('Lỗi', 'Xảy ra lỗi khi kiểm tra vị trí. Vui lòng thử lại sau.');
      } else {
        message.error('Xảy ra lỗi khi kiểm tra vị trí. Vui lòng thử lại sau.');
      }
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
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await fetchSessions();
        await fetchMyAttendance();
      }
    };
    
    loadData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
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
  
  // Retry function to reload data
  const handleRetry = () => {
    // Reset error states
    setErrorShown({ sessions: false, attendance: false });
    setHasApiError({ sessions: false, attendance: false });
    
    // Reload data
    fetchSessions();
    fetchMyAttendance();
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
          </div>        ) : activeSessions.length > 0 ? (
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
        ) : hasApiError.sessions ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <p className="text-red-500 mb-2">Không thể tải danh sách phiên điểm danh</p>
              <p className="text-gray-500 text-sm">Vui lòng kiểm tra kết nối mạng và thử lại</p>
            </div>
            <button
              onClick={handleRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200"
            >
              Thử lại
            </button>
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
          </div>        ) : upcomingSessions.length > 0 ? (
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
        ) : hasApiError.sessions ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <p className="text-red-500 mb-2">Không thể tải danh sách phiên sắp tới</p>
              <p className="text-gray-500 text-sm">Vui lòng kiểm tra kết nối mạng và thử lại</p>
            </div>
            <button
              onClick={handleRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200"
            >
              Thử lại
            </button>
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
          </div>        ) : myAttendance.length > 0 ? (
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
        ) : hasApiError.attendance ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <p className="text-red-500 mb-2">Không thể tải lịch sử điểm danh</p>
              <p className="text-gray-500 text-sm">Vui lòng kiểm tra kết nối mạng và thử lại</p>
            </div>
            <button
              onClick={handleRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <Empty description="Không có lịch sử điểm danh" />
        )}
      </div>
    );
  };
    // Get user info from localStorage
  const userInfo = {
    name: localStorage.getItem('fullName') || 'Sinh viên',
    studentCode: localStorage.getItem('studentId') || 'SV001',
    userId: localStorage.getItem('userId') || '1'
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
                src={`https://placehold.co/40x40/ADD8E6/000000?text=${userInfo.name.charAt(0)}`}
                alt={`Ảnh của ${userInfo.name}`}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-medium">{userInfo.name}</p>
                <p className="text-sm text-gray-600">{userInfo.studentCode}</p>
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