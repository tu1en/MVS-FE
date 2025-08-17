import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API_CONFIG from '../../config/api-config';
import { useAuth } from '../../context/AuthContext';
import { teacherAttendanceService } from '../../services/teacherAttendanceService';

const TakeAttendancePage = () => {
    const { classroomId, lectureId: urlLectureId } = useParams(); // Get IDs from URL
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null);
    const [actualLectureId, setActualLectureId] = useState(null);
    const [lectures, setLectures] = useState([]);
    const fetchAttempted = useRef(false);

    // Kiểm tra xác thực
    useEffect(() => {
        if (loading) return; // Wait for auth to load

        if (!user) {
            console.log('TakeAttendancePage: Không tìm thấy người dùng, chuyển tới trang đăng nhập');
            navigate('/login');
            return;
        }

        // Kiểm tra vai trò giáo viên
        const userRole = user.role?.replace('ROLE_', '');
        if (userRole !== 'TEACHER') {
            console.log('TakeAttendancePage: Người dùng không phải giáo viên, vai trò:', userRole);
            navigate('/login');
            return;
        }

        console.log('TakeAttendancePage: Xác thực thành công cho giáo viên:', user.username);
    }, [user, loading, navigate]);

    // Hàm debug để in cấu hình API
    const logDebugInfo = useCallback(() => {
        const info = {
            baseUrl: API_CONFIG.BASE_URL,
            classroomId,
            lectureId: actualLectureId,
            attendanceEndpoints: {
                attendance: API_CONFIG.ENDPOINTS.ATTENDANCE,
                attendanceSessions: API_CONFIG.ENDPOINTS.ATTENDANCE_SESSIONS,
                attendanceTeacher: API_CONFIG.ENDPOINTS.ATTENDANCE_TEACHER
            },
            fullPath: `${API_CONFIG.BASE_URL}/attendance/lecture/${actualLectureId}`
        };
        
        console.log('Debug Info:', info);
        setDebugInfo(info);
        return info;
    }, [classroomId, actualLectureId]);

    // Tải danh sách bài giảng của lớp
    const fetchLectures = useCallback(async () => {
        if (!classroomId) return;

        try {
            console.log('TakeAttendancePage: Đang tải bài giảng cho lớp', classroomId);
            const response = await fetch(`${API_CONFIG.BASE_URL}/lectures/classroom/${classroomId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const lecturesData = await response.json();
            console.log('TakeAttendancePage: Đã tải bài giảng:', lecturesData);
            setLectures(lecturesData);

            // Tự chọn bài giảng đầu tiên nếu URL không có hoặc không hợp lệ với lớp hiện tại
            if (lecturesData.length > 0) {
                const validLecture = lecturesData.find(l => l.id.toString() === urlLectureId);
                const selectedLecture = validLecture || lecturesData[0];
                setActualLectureId(selectedLecture.id);
                console.log('TakeAttendancePage: Đã chọn ID bài giảng:', selectedLecture.id);
            } else {
                // Không có bài giảng - dừng tải và báo lỗi
                console.log('TakeAttendancePage: Không có bài giảng cho lớp', classroomId);
                setIsLoading(false);
                setError('Không tìm thấy bài giảng cho lớp này. Vui lòng tạo bài giảng trước.');
            }
        } catch (error) {
            console.error('TakeAttendancePage: Lỗi khi tải danh sách bài giảng:', error);
            setIsLoading(false);
            setError('Không thể tải danh sách bài giảng');
        }
    }, [classroomId, urlLectureId]);

    const fetchAttendanceData = useCallback(async () => {
        // Tránh gọi API nhiều lần
        if (fetchAttempted.current) return;
        
        if (!actualLectureId || !classroomId) return; // Không tải nếu thiếu ID

        fetchAttempted.current = true;
        setIsLoading(true);
        setError(null);

        // In debug
        logDebugInfo();
        console.log(`Đang tải dữ liệu điểm danh cho bài giảng ID: ${actualLectureId} trong lớp ID: ${classroomId}`);

        try {
            // Truyền cả actualLectureId và classroomId vào service
            const data = await teacherAttendanceService.getAttendanceForLecture(actualLectureId, classroomId);
            console.log('Đã nhận dữ liệu điểm danh:', data);
            
            if (!data || data.length === 0) {
                console.warn('Không có dữ liệu điểm danh cho buổi học này');
                setStudents([]);
                setError('Không tìm thấy học viên cho buổi học này. Vui lòng kiểm tra danh sách ghi danh của lớp.');
                return;
            }
            
            const studentsWithStatus = data.map(student => ({
                ...student,
                status: student.status || 'PRESENT',
                note: student.note || ''
            }));
            setStudents(studentsWithStatus);
        } catch (err) {
            console.error('Lỗi chi tiết:', err);
            
            // Không hiển thị lỗi nếu request đã bị hủy
            if (err.code === 'ERR_CANCELED') {
                console.log('Yêu cầu đã bị hủy (có thể do rời trang)');
                return;
            }
            
            if (err.response) {
                console.error('Phản hồi lỗi:', err.response);
                setError(`Lỗi máy chủ: ${err.response.status} - ${err.response.data?.message || 'Không rõ nguyên nhân'}`);
            } else if (err.request) {
                console.error('Yêu cầu lỗi:', err.request);
                setError('Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối và thử lại.');
            } else {
                console.error('Thông báo lỗi:', err.message);
                setError(`Không thể tải dữ liệu điểm danh: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    }, [actualLectureId, classroomId, logDebugInfo]);

    // Tải danh sách bài giảng trước
    useEffect(() => {
        fetchLectures();
    }, [fetchLectures]);

    // Tải dữ liệu điểm danh khi đã có actualLectureId
    useEffect(() => {
        if (actualLectureId) {
            // Reset the fetch attempted flag when IDs change
            fetchAttempted.current = false;
            fetchAttendanceData();

            // Cleanup function to prevent state updates if component unmounts
            return () => {
                fetchAttempted.current = true; // Ngăn cập nhật state khi rời trang
            };
        }
    }, [fetchAttendanceData, actualLectureId]);

    const handleStatusChange = (studentId, newStatus) => {
        setStudents(prevStudents =>
            prevStudents.map(student =>
                student.studentId === studentId ? { ...student, status: newStatus } : student
            )
        );
    };

    const handleNoteChange = (studentId, newNote) => {
        setStudents(prevStudents =>
            prevStudents.map(student =>
                student.studentId === studentId ? { ...student, note: newNote } : student
            )
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSubmitSuccess(false);

        const attendanceData = {
            lectureId: parseInt(actualLectureId, 10),
            classroomId: parseInt(classroomId, 10),
            records: students.map(({ studentId, status, note }) => ({ studentId, status, note: note || '' })),
        };

        try {
            console.log('Gửi dữ liệu điểm danh:', attendanceData);
            await teacherAttendanceService.submitAttendance(attendanceData);
            setSubmitSuccess(true);
            setTimeout(() => {
                setSubmitSuccess(false);
            }, 2000);
        } catch (err) {
            console.error('Lỗi khi gửi dữ liệu:', err);
            console.error('Cấu hình lỗi:', err.config);
            console.error('Phản hồi lỗi:', err.response);
            
            // Check if it's a time validation error
            if (err.response && err.response.data && err.response.data.message) {
                const errorMessage = err.response.data.message;
                if (errorMessage.includes('24 giờ') || errorMessage.includes('quá sớm') || errorMessage.includes('quá muộn')) {
                    setError(`⏰ Lỗi thời gian điểm danh: ${errorMessage}`);
                } else {
                    setError(`Gửi điểm danh thất bại: ${errorMessage}`);
                }
            } else {
                setError(`Gửi điểm danh thất bại. Lỗi: ${err.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Làm mới thủ công
    const handleRefresh = () => {
        fetchAttempted.current = false; // Reset the flag to allow a new fetch
        fetchAttendanceData();
    };

    // Show loading while authentication is being checked
    if (loading) {
        return <div className="text-center p-8">Đang kiểm tra xác thực...</div>;
    }

    // Show loading while data is being fetched
    if (isLoading) {
        return <div className="text-center p-8">Đang tải dữ liệu điểm danh...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Điểm danh</h1>
            <h2 className="text-lg mb-2">
                Bài giảng ID: {actualLectureId || 'Đang tải...'} | Lớp học ID: {classroomId}
                {lectures.length > 0 && actualLectureId && (
                    <span className="text-sm text-gray-600 ml-2">
                        ({lectures.find(l => l.id === actualLectureId)?.title || 'Không rõ tiêu đề'})
                    </span>
                )}
            </h2>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Lỗi:</strong>
                    <span className="block sm:inline"> {error}</span>
                    <button 
                        onClick={handleRefresh} 
                        className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    >
                        Thử lại
                    </button>
                </div>
            )}
            
            {submitSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Thành công!</strong>
                    <span className="block sm:inline"> Đã lưu điểm danh.</span>
                </div>
            )}

            {/* Time window warning */}
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded relative mb-4" role="alert">
                <div className="flex items-center">
                    <span className="text-lg mr-2">⏰</span>
                    <div>
                        <strong className="font-bold">Lưu ý về thời gian điểm danh:</strong>
                        <span className="block sm:inline"> Chỉ có thể điểm danh trong vòng 24 giờ trước và sau buổi học.</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="py-2 px-4 border-b">Mã sinh viên</th>
                                <th className="py-2 px-4 border-b">Họ và tên</th>
                                <th className="py-2 px-4 border-b">Trạng thái</th>
                                <th className="py-2 px-4 border-b">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length > 0 ? (
                                students.map((student) => (
                                    <tr key={student.studentId}>
                                        <td className="py-2 px-4 border-b">{student.studentId}</td>
                                        <td className="py-2 px-4 border-b">{student.studentName}</td>
                                        <td className="py-2 px-4 border-b">
                                            <select
                                                value={student.status}
                                                onChange={(e) => handleStatusChange(student.studentId, e.target.value)}
                                                className="p-2 border rounded"
                                            >
                                                <option value="PRESENT">Có mặt</option>
                                                <option value="ABSENT">Vắng mặt</option>
                                                <option value="LATE">Đi trễ</option>
                                                <option value="EXCUSED">Có phép</option>
                                            </select>
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            <input
                                                type="text"
                                                value={student.note || ''}
                                                onChange={(e) => handleNoteChange(student.studentId, e.target.value)}
                                                placeholder="Ghi chú (nếu có)"
                                                className="p-2 border rounded w-full"
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-4 px-4 text-center">
                                        Không có dữ liệu sinh viên cho buổi học này.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting || students.length === 0}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Đang lưu...' : 'Lưu điểm danh'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TakeAttendancePage; 