import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Button, Empty, Input, message, Modal, Spin, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { safeDataSource } from '../../utils/tableUtils';
import MakeupAttendanceRequestForm from './MakeupAttendanceRequestForm';

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
  const [makeupRequestModalVisible, setMakeupRequestModalVisible] = useState(false);
  const [selectedLectureForMakeup, setSelectedLectureForMakeup] = useState(null);
  const [selectedClassroomForMakeup, setSelectedClassroomForMakeup] = useState(null);
  
  // --- Real API Functions ---
  
  // Lấy danh sách phiên điểm danh
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/attendance/sessions/teacher');
      const sessionsData = response.data.data || [];
      
      // Transform API data to match UI expectations
      const transformedSessions = sessionsData.map(session => ({
        id: session.id,
        name: session.name || 'Attendance Session',
        classroomName: session.classroomName,
        classroomId: session.classroomId,
        time: `${new Date(session.startTime).toLocaleDateString('vi-VN')} ${new Date(session.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})} - ${new Date(session.endTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}`,
        status: session.status === 'ACTIVE' ? 'Đang hoạt động' : session.status === 'ENDED' ? 'Đã kết thúc' : 'Sắp tới',
        studentCount: 0, // Will be filled when we get student data
        rawData: session
      }));
      
      setSessions(transformedSessions);
      setLoading(false);
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
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        showMessageBox('Lỗi', 'Không tìm thấy thông tin phiên điểm danh.');
        setSessionLoading(false);
        return;
      }
      
      // Get enrolled students for this classroom
      const response = await apiClient.get(`/classrooms/${session.classroomId}/students`);
      const students = response.data || [];
      
      // Initialize attendance data with all students as present by default
      const initialAttendance = students.map(student => ({
        id: student.id,
        userId: student.id,
        name: student.fullName || student.name,
        studentCode: student.email,
        isPresent: true,
        comment: '',
      }));
      
      setAttendanceData(initialAttendance);
      setSessionLoading(false);
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
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        showMessageBox('Lỗi', 'Không tìm thấy thông tin phiên điểm danh.');
        setSessionLoading(false);
        return;
      }
      
      // Get attendance data for this session
      const response = await apiClient.get('/attendance/teacher');
      const allAttendance = response.data.data || [];
      
      // Filter attendance records for this session
      const sessionAttendance = allAttendance.filter(record => record.sessionId === sessionId);
      
      // Transform to match UI expectations
      const attendanceData = sessionAttendance.map(record => ({
        id: record.studentId,
        userId: record.studentId,
        name: record.studentName,
        studentCode: record.studentCode,
        isPresent: record.status === 'PRESENT',
        comment: '',
        createdAt: new Date(record.checkedAt).toLocaleString('vi-VN')
      }));
      
      setAttendanceData(attendanceData);
      setSessionLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu điểm danh:', error);
      showMessageBox('Lỗi', 'Không thể lấy dữ liệu điểm danh. Vui lòng thử lại sau.');
      setSessionLoading(false);
    }
  };
  
  // Gửi dữ liệu điểm danh
  const submitAttendance = async () => {
    if (!selectedSession) {
      showMessageBox('Lỗi', 'Không có phiên điểm danh được chọn.');
      return;
    }
    // Ràng buộc: không cho phép điểm danh sau 24 giờ kể từ thời điểm kết thúc phiên
    try {
      const endTime = selectedSession?.rawData?.endTime || selectedSession?.rawData?.expiresAt || selectedSession?.rawData?.end;
      if (endTime) {
        const end = dayjs(endTime);
        const now = dayjs();
        if (end.isValid() && now.diff(end, 'hour') > 24) {
          // Force makeup attendance request - no option to skip
          Modal.info({
            title: 'Bắt buộc tạo yêu cầu điểm danh bù',
            content: 'Đã quá 24 giờ kể từ khi kết thúc phiên. Bạn phải tạo yêu cầu điểm danh bù để được manager xác nhận.',
            okText: 'Tạo yêu cầu điểm danh bù',
            icon: <ClockCircleOutlined style={{ color: '#ff7a00' }} />,
            onOk: () => handleShowMakeupRequestForm()
          });
          return;
        }
      }
    } catch {}
    
    setLoading(true);
    try {
      // Transform attendance data for API
      const attendanceRecords = attendanceData.map(student => ({
        studentId: student.userId,
        status: student.isPresent ? 'PRESENT' : 'ABSENT',
        note: student.comment || ''
      }));
      
      const submitData = {
        lectureId: selectedSession.rawData?.lectureId || null,
        classroomId: selectedSession.classroomId,
        records: attendanceRecords
      };
      
      await apiClient.post('/attendance/submit', submitData);
      
      message.success('Điểm danh đã được lưu thành công!');
      setCurrentPage('dashboard');
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi gửi dữ liệu điểm danh:', error);
      showMessageBox('Lỗi', 'Không thể lưu dữ liệu điểm danh. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };
  
  // Create new attendance session
  const createNewSession = async (sessionData) => {
    try {
      const response = await apiClient.post('/attendance/sessions', sessionData);
      message.success('Phiên điểm danh mới đã được tạo thành công!');
      fetchSessions(); // Refresh sessions list
      return response.data.data;
    } catch (error) {
      console.error('Lỗi khi tạo phiên điểm danh:', error);
      showMessageBox('Lỗi', 'Không thể tạo phiên điểm danh mới. Vui lòng thử lại sau.');
      throw error;
    }
  };
  
  // Update session status
  const updateSessionStatus = async (sessionId, status) => {
    try {
      await apiClient.put(`/attendance/sessions/${sessionId}/status`, { status });
      message.success('Trạng thái phiên điểm danh đã được cập nhật!');
      fetchSessions(); // Refresh sessions list
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái phiên:', error);
      showMessageBox('Lỗi', 'Không thể cập nhật trạng thái phiên điểm danh. Vui lòng thử lại sau.');
    }
  };
  
  // Load dữ liệu khi component được mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Makeup attendance handlers
  const handleShowMakeupRequestForm = () => {
    if (!selectedSession) {
      message.error('Không có phiên điểm danh được chọn');
      return;
    }

    // Extract lecture and classroom info from session
    const lecture = {
      id: selectedSession.rawData?.lectureId || selectedSession.rawData?.lecture?.id,
      title: selectedSession.name || selectedSession.rawData?.lecture?.title || 'N/A',
      description: selectedSession.rawData?.lecture?.description,
      schedule: selectedSession.rawData?.lecture?.schedule,
      lectureDate: selectedSession.rawData?.lecture?.lectureDate
    };

    const classroom = {
      id: selectedSession.classroomId,
      name: selectedSession.classroomName
    };

    setSelectedLectureForMakeup(lecture);
    setSelectedClassroomForMakeup(classroom);
    setMakeupRequestModalVisible(true);
  };

  const handleMakeupRequestSuccess = () => {
    setMakeupRequestModalVisible(false);
    setSelectedLectureForMakeup(null);
    setSelectedClassroomForMakeup(null);
    message.success('Yêu cầu điểm danh bù đã được gửi thành công!');
    // Optionally refresh sessions to show updated status
    fetchSessions();
  };

  const handleMakeupRequestCancel = () => {
    setMakeupRequestModalVisible(false);
    setSelectedLectureForMakeup(null);
    setSelectedClassroomForMakeup(null);
  };
  
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

  const handleEndSession = async (sessionId) => {
    await updateSessionStatus(sessionId, 'ENDED');
  };

  const handleReactivateSession = async (sessionId) => {
    await updateSessionStatus(sessionId, 'ACTIVE');
  };

  // Dashboard View
  const renderDashboard = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Điểm danh</h2>
        <div className="flex gap-3">
          <Button
            type="primary"
            onClick={() => setCurrentPage('createSession')}
          >
            Tạo phiên điểm danh mới
          </Button>
          <Button
            type="default"
            icon={<ClockCircleOutlined />}
            onClick={handleShowMakeupRequestForm}
            disabled={!selectedSession}
          >
            Tạo yêu cầu điểm danh bù
          </Button>
          <Button onClick={onLogout}>Đăng xuất</Button>
        </div>
      </div>

      {/* Hướng dẫn sử dụng */}
      {!selectedSession && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Hướng dẫn:</strong> Chọn một phiên điểm danh bên dưới để có thể tạo yêu cầu điểm danh bù.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.length === 0 ? (
            <div className="col-span-full">
              <Empty 
                description="Không có phiên điểm danh nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-800 truncate flex-1 mr-2">{session.name}</h3>
                  <Tag color={session.status === 'Đang hoạt động' ? 'green' : session.status === 'Đã kết thúc' ? 'red' : 'blue'}>
                    {session.status}
                  </Tag>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <div><strong>Lớp:</strong> {session.classroomName}</div>
                  <div><strong>Thời gian:</strong> {session.time}</div>
                  <div><strong>Sinh viên:</strong> {session.studentCount} người</div>
                </div>
                
                <div className="flex gap-2">
                  {session.status === 'Đang hoạt động' && (
                    <>
                      <Button 
                        type="primary" 
                        size="small" 
                        onClick={() => handleSelectSession(session)}
                        className="flex-1"
                      >
                        Điểm danh
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => handleEndSession(session.id)}
                      >
                        Kết thúc
                      </Button>
                    </>
                  )}
                  {session.status === 'Đã kết thúc' && (
                    <>
                      <Button 
                        size="small" 
                        onClick={() => handleViewSessionDetails(session)}
                        className="flex-1"
                      >
                        Xem chi tiết
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => handleReactivateSession(session.id)}
                      >
                        Kích hoạt lại
                      </Button>
                    </>
                  )}
                  {session.status === 'Sắp tới' && (
                    <Button 
                      size="small" 
                      disabled
                      className="flex-1"
                    >
                      Chưa đến giờ
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  // Take Attendance View
  const renderTakeAttendance = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Điểm danh - {selectedSession?.name}</h2>
          <p className="text-gray-600">Lớp: {selectedSession?.classroomName} | {selectedSession?.time}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setCurrentPage('dashboard')}>Quay lại</Button>
          <Button 
            type="primary" 
            onClick={submitAttendance}
            loading={loading}
            disabled={attendanceData.length === 0}
          >
            Lưu điểm danh
          </Button>
        </div>
      </div>

      {sessionLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <Table
            dataSource={safeDataSource(attendanceData, 'TeacherAttendance-takeAttendance')}
            pagination={false}
            rowKey="id"
            columns={[
              {
                title: 'Tên sinh viên',
                dataIndex: 'name',
                key: 'name',
                width: '30%',
              },
              {
                title: 'Mã sinh viên',
                dataIndex: 'studentCode', 
                key: 'studentCode',
                width: '25%',
              },
              {
                title: 'Trạng thái',
                key: 'status',
                width: '20%',
                render: (_, record) => (
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      type={record.isPresent ? "primary" : "default"}
                      icon={<CheckCircleOutlined />}
                      onClick={() => handlePresenceChange(record.id, true)}
                    >
                      Có mặt
                    </Button>
                    <Button
                      size="small"
                      type={!record.isPresent ? "primary" : "default"}
                      danger={!record.isPresent}
                      icon={<CloseCircleOutlined />}
                      onClick={() => handlePresenceChange(record.id, false)}
                    >
                      Vắng mặt
                    </Button>
                  </div>
                ),
              },
              {
                title: 'Ghi chú',
                key: 'comment',
                width: '25%',
                render: (_, record) => (
                  <Input
                    placeholder="Ghi chú..."
                    value={record.comment}
                    onChange={(e) => handleCommentChange(record.id, e.target.value)}
                  />
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  );

  // Session Details Modal
  const renderSessionDetailsModal = () => (
    <Modal
      title={`Chi tiết điểm danh - ${selectedSession?.name}`}
      open={detailModalVisible}
      onCancel={() => setDetailModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setDetailModalVisible(false)}>
          Đóng
        </Button>
      ]}
      width={800}
    >
      {sessionLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          dataSource={safeDataSource(attendanceData, 'TeacherAttendance-modal')}
          pagination={false}
          rowKey="id"
          size="small"
          columns={[
            {
              title: 'Tên sinh viên',
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: 'Mã sinh viên',
              dataIndex: 'studentCode',
              key: 'studentCode',
            },
            {
              title: 'Trạng thái',
              key: 'status',
              render: (_, record) => (
                <Tag color={record.isPresent ? 'green' : 'red'}>
                  {record.isPresent ? 'Có mặt' : 'Vắng mặt'}
                </Tag>
              ),
            },
            {
              title: 'Thời gian điểm danh',
              dataIndex: 'createdAt',
              key: 'createdAt',
            },
          ]}
        />
      )}
    </Modal>
  );

  // Main render
  switch (currentPage) {
    case 'takeAttendance':
      return renderTakeAttendance();
    default:
      return (
        <>
          {renderDashboard()}
          {renderSessionDetailsModal()}

          {/* Makeup Attendance Request Form */}
          <MakeupAttendanceRequestForm
            visible={makeupRequestModalVisible}
            onCancel={handleMakeupRequestCancel}
            onSuccess={handleMakeupRequestSuccess}
            lecture={selectedLectureForMakeup}
            classroom={selectedClassroomForMakeup}
          />
        </>
      );
  }
};

export default TeacherAttendance;