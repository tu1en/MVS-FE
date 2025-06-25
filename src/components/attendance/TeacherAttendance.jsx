import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Button, Empty, Input, message, Modal, Spin, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';

// TeacherAttendance Component
const TeacherAttendance = ({ onLogout, showMessageBox }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [locationNetworkPassed] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  
  // --- Mock Data ---
  // Mock students by class
  const mockStudentsByClass = {
    'KTPM1': [
      { id: '1', userId: '101', name: 'Nguyễn Văn A', studentCode: 'SV001' },
      { id: '2', userId: '102', name: 'Trần Thị B', studentCode: 'SV002' },
      { id: '3', userId: '103', name: 'Lê Văn C', studentCode: 'SV003' },
    ],
    'CNTT2': [
      { id: '4', userId: '104', name: 'Phạm Thị D', studentCode: 'SV004' },
      { id: '5', userId: '105', name: 'Hoàng Văn E', studentCode: 'SV005' },
    ],
    'QTKD3': [
      { id: '6', userId: '106', name: 'Ngô Thị F', studentCode: 'SV006' },
      { id: '7', userId: '107', name: 'Đặng Văn G', studentCode: 'SV007' },
      { id: '8', userId: '108', name: 'Vũ Thị H', studentCode: 'SV008' },
    ]
  };
  
  // Mock timetable data
  const mockTimetable = [
    {
      id: 'session-001',
      name: 'Buổi học Lập trình Web',
      class: 'KTPM1',
      classroomName: 'KTPM1',
      time: '18/06/2025 08:00 - 11:00',
      status: 'Đang hoạt động',
      studentCount: mockStudentsByClass['KTPM1'].length,
    },
    {
      id: 'session-002',
      name: 'Buổi học Cơ sở dữ liệu',
      class: 'CNTT2',
      classroomName: 'CNTT2',
      time: '18/06/2025 13:00 - 16:00',
      status: 'Đang hoạt động',
      studentCount: mockStudentsByClass['CNTT2'].length,
    },
    {
      id: 'session-003',
      name: 'Buổi học Marketing căn bản',
      class: 'QTKD3',
      classroomName: 'QTKD3',
      time: '19/06/2025 09:00 - 12:00',
      status: 'Sắp tới',
      studentCount: mockStudentsByClass['QTKD3'].length,
    },
    {
      id: 'session-004',
      name: 'Buổi học Cấu trúc dữ liệu',
      class: 'KTPM1',
      classroomName: 'KTPM1',
      time: '20/06/2025 10:00 - 13:00',
      status: 'Đã kết thúc',
      studentCount: mockStudentsByClass['KTPM1'].length,
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
        setLoading(false);
      }, 600);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phiên điểm danh:', error);
      showMessageBox('Lỗi', 'Không thể lấy danh sách phiên điểm danh. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };
  
  // Lấy danh sách sinh viên cho phiên điểm danh
  const fetchStudentsForSession = async (sessionId) => {
    setSessionLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        // Find the class of selected session
        const session = mockTimetable.find(s => s.id === sessionId);
        if (!session) {
          showMessageBox('Lỗi', 'Không tìm thấy thông tin phiên điểm danh.');
          setSessionLoading(false);
          return;
        }
        
        const className = session.class;
        const students = mockStudentsByClass[className] || [];
        
        // Khởi tạo dữ liệu điểm danh
        const initialAttendance = students.map(student => ({
          id: student.id,
          userId: student.userId,
          name: student.name,
          studentCode: student.studentCode,
          isPresent: true, // Default to present
          comment: '',
        }));
        
        setAttendanceData(initialAttendance);
        setSessionLoading(false);
      }, 800);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sinh viên:', error);
      showMessageBox('Lỗi', 'Không thể lấy danh sách sinh viên. Vui lòng thử lại sau.');
      setSessionLoading(false);
    }
  };
  
  // Lấy dữ liệu điểm danh cho phiên học
  const fetchAttendanceBySession = async (sessionId) => {
    setSessionLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        // Find the class of selected session
        const session = mockTimetable.find(s => s.id === sessionId);
        if (!session) {
          showMessageBox('Lỗi', 'Không tìm thấy thông tin phiên điểm danh.');
          setSessionLoading(false);
          return;
        }
        
        const className = session.class;
        const students = mockStudentsByClass[className] || [];
        
        // Tạo dữ liệu điểm danh mock
        const mockAttendanceData = students.map(student => ({
          id: student.id,
          userId: student.userId,
          name: student.name,
          studentCode: student.studentCode,
          isPresent: Math.random() > 0.2, // 80% chance to be present
          comment: '',
          createdAt: '12/06/2023 08:30'
        }));
        
        setAttendanceData(mockAttendanceData);
        setSessionLoading(false);
      }, 600);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu điểm danh:', error);
      showMessageBox('Lỗi', 'Không thể lấy dữ liệu điểm danh. Vui lòng thử lại sau.');
      setSessionLoading(false);
    }
  };
  
  // Gửi dữ liệu điểm danh
  const submitAttendance = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        console.log('Dữ liệu điểm danh đã được gửi:', attendanceData);
        message.success('Điểm danh đã được lưu thành công!');
        setCurrentPage('dashboard');
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Lỗi khi gửi dữ liệu điểm danh:', error);
      showMessageBox('Lỗi', 'Không thể lưu dữ liệu điểm danh. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };
  
  // Load dữ liệu khi component được mount
  useEffect(() => {
    fetchSessions();
  }, []);
  
  const handleSelectSession = (session) => {
    if (locationNetworkPassed) {
      setSelectedSession(session);
      fetchStudentsForSession(session.id);
      setCurrentPage('takeAttendance');
    } else {
      showMessageBox('Thông báo', 'Bạn cần vượt qua kiểm tra Vị trí & Mạng trước khi điểm danh.');
    }
  };
  
  const handleViewSessionDetails = (session) => {
    setSelectedSession(session);
    fetchAttendanceBySession(session.id);
    setDetailModalVisible(true);
  };
  
  const handlePresenceChange = (id, isPresent) => {
    setAttendanceData(prevData =>
      prevData.map(student =>
        student.id === id ? { ...student, isPresent: isPresent } : student
      )
    );
  };

  const handleCommentChange = (id, comment) => {
    setAttendanceData(prevData =>
      prevData.map(student =>
        student.id === id ? { ...student, comment: comment } : student
      )
    );
  };
  
  // Tính toán thống kê
  const calculateStats = () => {
    const activeSessionsCount = sessions.filter(s => s.status === 'ACTIVE' || s.status === 'Đang hoạt động').length;
    const upcomingSessionsCount = sessions.filter(s => s.status === 'PENDING' || s.status === 'Sắp tới').length;
    
    // Tính tỷ lệ tham gia trung bình
    let totalAttendance = 0;
    let totalStudents = 0;
    
    sessions.forEach(session => {
      if (session.attendanceRate) {
        totalAttendance += session.attendanceRate;
        totalStudents += 1;
      }
    });
    
    const averageAttendanceRate = totalStudents ? (totalAttendance / totalStudents).toFixed(2) : "85.50";
    
    // Tính tổng số sinh viên (ước tính)
    const studentEstimate = sessions.reduce((acc, session) => acc + (session.studentCount || 0), 0);
    
    return {
      activeSessionsCount,
      upcomingSessionsCount,
      averageAttendanceRate,
      totalStudents: studentEstimate
    };
  };
  
  // Faculty Dashboard Component
  const FacultyDashboard = () => {
    const [activeTab, setActiveTab] = useState('Đang diễn ra');

    const stats = calculateStats();

    const getFilteredSessions = () => {
      return sessions.filter(session => {
        if (activeTab === 'Đang diễn ra') {
          return session.status === 'ACTIVE' || session.status === 'Đang hoạt động';
        } else if (activeTab === 'Sắp tới') {
          return session.status === 'PENDING' || session.status === 'Sắp tới';
        } else if (activeTab === 'Đã kết thúc') {
          return session.status === 'ENDED' || session.status === 'Đã kết thúc';
        }
        return true;
      });
    };

    const filteredSessions = getFilteredSessions();

    return (
      <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-6xl mt-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Quản lý điểm danh</h2>

          {/* Dashboard Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 text-center">
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100">
              <p className="text-xl font-bold text-blue-700">{stats.activeSessionsCount}</p>
              <p className="text-gray-600">Phiên đang diễn ra</p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg shadow-sm border border-yellow-100">
              <p className="text-xl font-bold text-yellow-700">{stats.upcomingSessionsCount}</p>
              <p className="text-gray-600">Phiên điểm danh sắp tới</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100">
              <p className="text-xl font-bold text-green-700">{stats.averageAttendanceRate}%</p>
              <p className="text-gray-600">Tỷ lệ điểm danh trung bình</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg shadow-sm border border-purple-100">
              <p className="text-xl font-bold text-purple-700">{stats.totalStudents}</p>
              <p className="text-gray-600">Tổng số học sinh</p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Thời khóa biểu</h3>
            <button
              onClick={() => showMessageBox('Thông báo', 'Chức năng "Tạo phiên điểm danh" đang được phát triển.')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200"
            >
              + Tạo phiên điểm danh
            </button>
          </div>

          {/* Tabs for Timetable Status */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 text-base font-medium ${activeTab === 'Đang diễn ra' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('Đang diễn ra')}
            >
              Đang diễn ra
            </button>
            <button
              className={`ml-4 py-2 px-4 text-base font-medium ${activeTab === 'Sắp tới' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('Sắp tới')}
            >
              Sắp tới
            </button>
            <button
              className={`ml-4 py-2 px-4 text-base font-medium ${activeTab === 'Đã kết thúc' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('Đã kết thúc')}
            >
              Đã kết thúc
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <Spin size="large" />
              <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tl-lg">Tên phiên</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Lớp học</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Thời gian</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Số SV</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.length > 0 ? (
                    filteredSessions.map((session, index) => (
                      <tr key={session.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200`}>
                        <td className="py-3 px-4 text-gray-800 whitespace-nowrap">{session.name}</td>
                        <td className="py-3 px-4 text-gray-800 whitespace-nowrap">{session.classroomName || session.class}</td>
                        <td className="py-3 px-4 text-gray-800 whitespace-nowrap">
                          {session.time || `${session.startTime} - ${session.endTime}`}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            (session.status === 'ACTIVE' || session.status === 'Đang hoạt động') ? 'bg-green-100 text-green-800' :
                            (session.status === 'PENDING' || session.status === 'Sắp tới') ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {(session.status === 'ACTIVE' || session.status === 'Đang hoạt động') ? 'Đang hoạt động' :
                             (session.status === 'PENDING' || session.status === 'Sắp tới') ? 'Sắp tới' : 'Đã kết thúc'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-800 whitespace-nowrap text-center">{session.studentCount || '0'}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSelectSession(session)}
                              disabled={!locationNetworkPassed || 
                                        (session.status !== 'ACTIVE' && session.status !== 'Đang hoạt động')}
                              className={`bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition duration-200 ${
                                !locationNetworkPassed || (session.status !== 'ACTIVE' && session.status !== 'Đang hoạt động') ? 
                                'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              Điểm danh
                            </button>
                            <button
                              onClick={() => handleViewSessionDetails(session)}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200"
                            >
                              Chi tiết
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-gray-500">
                        {loading ? <Spin size="small" /> : 'Không có phiên học nào trong mục này.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <button
            onClick={onLogout}
            className="mt-8 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-200"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  };

  // Attendance Form Component
  const AttendanceForm = () => {
    // Định dạng dữ liệu cho bảng Ant Design
    const columns = [
      {
        title: 'Ảnh',
        dataIndex: 'photoUrl',
        key: 'photoUrl',
        render: (text, record) => (
          <div className="flex justify-center">
            <img
              src={text || `https://placehold.co/50x50/ADD8E6/000000?text=${record.name?.charAt(0)}`}
              alt={`Ảnh của ${record.name}`}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/cccccc/ffffff?text=SV'; }}
            />
          </div>
        ),
      },
      {
        title: 'Mã SV',
        dataIndex: 'studentCode',
        key: 'studentCode',
      },
      {
        title: 'Tên Sinh viên',
        dataIndex: 'name',
        key: 'name',
        render: text => <span className="font-medium">{text}</span>
      },
      {
        title: 'Có mặt',
        dataIndex: 'isPresent',
        key: 'isPresent',
        render: (text, record) => (
          <div className="flex justify-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name={`status-${record.id}`}
                checked={record.isPresent === true}
                onChange={() => handlePresenceChange(record.id, true)}
                className="hidden"
              />
              <span className={`w-5 h-5 rounded-full border ${record.isPresent ? 'bg-green-500 border-green-600' : 'bg-white border-gray-300'} flex items-center justify-center`}>
                {record.isPresent && (
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                )}
              </span>
            </label>
          </div>
        ),
      },
      {
        title: 'Vắng mặt',
        dataIndex: 'isAbsent',
        key: 'isAbsent',
        render: (text, record) => (
          <div className="flex justify-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name={`status-${record.id}`}
                checked={record.isPresent === false}
                onChange={() => handlePresenceChange(record.id, false)}
                className="hidden"
              />
              <span className={`w-5 h-5 rounded-full border ${!record.isPresent ? 'bg-red-500 border-red-600' : 'bg-white border-gray-300'} flex items-center justify-center`}>
                {!record.isPresent && (
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                )}
              </span>
            </label>
          </div>
        ),
      },
      {
        title: 'Bình luận',
        dataIndex: 'comment',
        key: 'comment',
        render: (text, record) => (
          <Input
            placeholder="Thêm bình luận..."
            value={record.comment}
            onChange={(e) => handleCommentChange(record.id, e.target.value)}
            className="text-sm"
            size="small"
          />
        ),
      },
    ];

    return (
      <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl mt-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">
            {selectedSession ? `Điểm danh: ${selectedSession.name}` : 'Đang tải...'}
          </h2>
          <p className="text-center text-gray-600 mb-4">
            {selectedSession ? 
              `Lớp: ${selectedSession.classroomName || selectedSession.class} | Tổng số sinh viên: ${attendanceData.length}` 
              : 'Đang tải thông tin lớp...'}
          </p>

          {sessionLoading ? (
            <div className="py-12 text-center">
              <Spin size="large" />
              <p className="mt-3 text-gray-500">Đang tải danh sách sinh viên...</p>
            </div>
          ) : attendanceData.length > 0 ? (
            <div className="mb-4">
              <Table 
                columns={columns} 
                dataSource={attendanceData}
                rowKey="id"
                pagination={false}
                bordered
                size="middle"
                className="mb-6"
              />
            </div>
          ) : (
            <Empty 
              description="Không có sinh viên nào trong lớp này" 
              className="my-8"
            />
          )}

          <div className="flex space-x-4">
            <button
              onClick={submitAttendance}
              disabled={loading || attendanceData.length === 0}
              className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200 ${(loading || attendanceData.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Đang lưu...' : 'Lưu Điểm danh'}
            </button>
            <button
              onClick={() => {setCurrentPage('dashboard'); setSelectedSession(null);}}
              disabled={loading}
              className={`w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Quay lại Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render session detail modal
  const renderSessionDetailModal = () => {
    const columns = [
      {
        title: 'Mã SV',
        dataIndex: 'studentCode',
        key: 'studentCode',
      },
      {
        title: 'Họ và tên',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Trạng thái',
        dataIndex: 'isPresent',
        key: 'status',
        render: (isPresent) => (
          isPresent ? 
            <Tag icon={<CheckCircleOutlined />} color="success">Có mặt</Tag> : 
            <Tag icon={<CloseCircleOutlined />} color="error">Vắng mặt</Tag>
        ),
      },
      {
        title: 'Thời gian điểm danh',
        dataIndex: 'createdAt',
        key: 'createdAt',
      },
      {
        title: 'Ghi chú',
        dataIndex: 'comment',
        key: 'comment',
      },
    ];

    return (
      <Modal
        title={`Chi tiết phiên điểm danh: ${selectedSession?.name || ''}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="back" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        {sessionLoading ? (
          <div className="py-8 text-center">
            <Spin />
            <p className="mt-2">Đang tải dữ liệu điểm danh...</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p><strong>Lớp học:</strong> {selectedSession?.classroomName || selectedSession?.class}</p>
              <p><strong>Thời gian:</strong> {selectedSession?.time || `${selectedSession?.startTime} - ${selectedSession?.endTime}`}</p>
              <p><strong>Trạng thái:</strong> {
                (selectedSession?.status === 'ACTIVE' || selectedSession?.status === 'Đang hoạt động') ? 'Đang hoạt động' :
                (selectedSession?.status === 'PENDING' || selectedSession?.status === 'Sắp tới') ? 'Sắp tới' : 'Đã kết thúc'
              }</p>
            </div>
            
            <h3 className="text-lg font-semibold mb-3">Danh sách điểm danh</h3>
            <Table
              columns={columns}
              dataSource={attendanceData}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </>
        )}
      </Modal>
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

  return (
    <div className="teacher-attendance">
      <style dangerouslySetInnerHTML={{
        __html: `
          input[type="radio"].form-radio {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            display: inline-block;
            vertical-align: middle;
            background-repeat: no-repeat;
            background-position: center;
            background-size: contain;
            border-radius: 50%;
            border: 2px solid #ccc;
            outline: none;
            transition: all 0.2s ease-in-out;
            cursor: pointer;
            width: 1.25rem;
            height: 1.25rem;
          }
          input[type="radio"].form-radio:checked {
            border-color: currentColor;
            background-color: currentColor;
            background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e");
          }
        `
      }} />
      
      {(() => {
        switch (currentPage) {
          case 'dashboard':
            return <FacultyDashboard />;
          case 'takeAttendance':
            if (!selectedSession) {
              return <FacultyDashboard />;
            }
            return <AttendanceForm />;
          default:
            return <FacultyDashboard />;
        }
      })()}

      {renderSessionDetailModal()}
    </div>
  );
};

export default TeacherAttendance;