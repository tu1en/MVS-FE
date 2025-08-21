import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import API_CONFIG from '../../config/api-config';
import { useAuth } from '../../context/AuthContext';
import makeupAttendanceService from '../../services/makeupAttendanceService';
import { teacherAttendanceService } from '../../services/teacherAttendanceService';

const TakeAttendancePage = () => {
    const { classroomId, lectureId: urlLectureId } = useParams(); // Get IDs from URL
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading } = useAuth();
    const scheduleDate = location.state?.scheduleDate; // Get scheduleDate from navigation state
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null);
    const [actualLectureId, setActualLectureId] = useState(null);
    const [lectures, setLectures] = useState([]);
    const [attendanceStatus, setAttendanceStatus] = useState(null);
    const [isMakeupMode, setIsMakeupMode] = useState(false);
    const [showMakeupRequestForm, setShowMakeupRequestForm] = useState(false);
    const [makeupReason, setMakeupReason] = useState('');
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

            // Chọn bài giảng dựa trên URL
            if (lecturesData.length > 0) {
                console.log('TakeAttendancePage: lecturesData received:', lecturesData);
                console.log('TakeAttendancePage: urlLectureId:', urlLectureId);
                console.log('TakeAttendancePage: scheduleDate from navigation:', scheduleDate);
                console.log('TakeAttendancePage: Available lecture IDs:', lecturesData.map(l => l.id));
                console.log('TakeAttendancePage: urlLectureId type:', typeof urlLectureId);
                console.log('TakeAttendancePage: All lecture dates:', lecturesData.map(l => ({
                    id: l.id, 
                    title: l.title, 
                    rawDate: l.lectureDate,
                    rawDateType: typeof l.lectureDate,
                    isArray: Array.isArray(l.lectureDate)
                })));
                
                if (urlLectureId) {
                    // Tìm lecture dựa trên URL parameter
                    const validLecture = lecturesData.find(l => l.id.toString() === urlLectureId);
                    console.log('TakeAttendancePage: validLecture found:', validLecture);
                    
                    if (validLecture) {
                        setActualLectureId(validLecture.id);
                        console.log('TakeAttendancePage: Đã chọn lecture từ URL:', validLecture.id, validLecture.title);
                    } else {
                        console.warn('TakeAttendancePage: Lecture ID từ URL không hợp lệ:', urlLectureId);
                        console.warn('TakeAttendancePage: Available lectures:', lecturesData.map(l => ({id: l.id, title: l.title})));
                        setError(`Không tìm thấy bài giảng với ID ${urlLectureId} trong lớp này.`);
                        setIsLoading(false); // Stop loading to show error
                    }
                } else {
                    // Nếu không có lectureId trong URL, tìm lecture dựa trên scheduleDate
                    let selectedLecture = null;
                    
                    if (scheduleDate) {
                        // Trước tiên tìm lecture có lectureDate khớp chính xác
                        selectedLecture = lecturesData.find(lecture => {
                            if (lecture.lectureDate) {
                                try {
                                    let lectureDate;
                                    
                                    // Handle different date formats
                                    if (Array.isArray(lecture.lectureDate)) {
                                        // If it's an array [year, month, day], convert to date string
                                        const [year, month, day] = lecture.lectureDate;
                                        lectureDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                                    } else if (typeof lecture.lectureDate === 'string') {
                                        // If it's already a string, try to parse it
                                        if (lecture.lectureDate.includes('T')) {
                                            lectureDate = lecture.lectureDate.split('T')[0];
                                        } else {
                                            lectureDate = lecture.lectureDate;
                                        }
                                    } else {
                                        // Try to convert to date and format
                                        lectureDate = new Date(lecture.lectureDate).toISOString().split('T')[0];
                                    }
                                    
                                    console.log(`Comparing: Lecture ID ${lecture.id} - ${lectureDate} === ${scheduleDate} (${lecture.title})`);
                                    return lectureDate === scheduleDate;
                                } catch (error) {
                                    console.warn(`Error parsing date for lecture ${lecture.id}:`, error);
                                    return false;
                                }
                            }
                            return false;
                        });
                        
                        if (selectedLecture) {
                            console.log('TakeAttendancePage: Tìm thấy lecture cho ngày:', scheduleDate, selectedLecture);
                        } else {
                            console.log('TakeAttendancePage: Không tìm thấy lecture chính xác cho ngày:', scheduleDate);
                            
                            // Nếu không tìm thấy chính xác, tìm lecture gần nhất
                            const targetDate = new Date(scheduleDate);
                            let closestLecture = null;
                            let minDifference = Infinity;
                            
                            lecturesData.forEach(lecture => {
                                if (lecture.lectureDate) {
                                    try {
                                        let lectureDate;
                                        
                                        if (Array.isArray(lecture.lectureDate)) {
                                            const [year, month, day] = lecture.lectureDate;
                                            lectureDate = new Date(year, month - 1, day); // month is 0-indexed in Date
                                        } else {
                                            lectureDate = new Date(lecture.lectureDate + 'T00:00:00');
                                        }
                                        
                                        const difference = Math.abs(lectureDate - targetDate);
                                        if (difference < minDifference) {
                                            minDifference = difference;
                                            closestLecture = lecture;
                                        }
                                    } catch (error) {
                                        console.warn(`Error parsing date for closest lecture ${lecture.id}:`, error);
                                    }
                                }
                            });
                            
                            if (closestLecture) {
                                selectedLecture = closestLecture;
                                console.log('TakeAttendancePage: Chọn lecture gần nhất:', closestLecture.id, 'cho ngày:', scheduleDate);
                            }
                        }
                    }
                    
                    // Fallback về lecture đầu tiên nếu không tìm thấy
                    if (!selectedLecture) {
                        selectedLecture = lecturesData[0];
                        console.log('TakeAttendancePage: Fallback to first lecture:', selectedLecture.id);
                    }
                    
                    setActualLectureId(selectedLecture.id);
                    console.log('TakeAttendancePage: Selected lecture:', selectedLecture.id, selectedLecture.title);
                }
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

    // Fetch attendance status
    const fetchAttendanceStatus = useCallback(async () => {
        if (!actualLectureId || !classroomId) return;

        try {
            console.log(`Fetching attendance status for lecture ${actualLectureId} in classroom ${classroomId}`);
            const status = await teacherAttendanceService.getAttendanceStatus(actualLectureId, classroomId);
            console.log('Attendance status:', status);
            setAttendanceStatus(status);

            // Auto-enable makeup mode if needed
            if (status.overallStatus === 'MAKEUP_APPROVED') {
                setIsMakeupMode(true);
            }
        } catch (error) {
            console.error('Error fetching attendance status:', error);
            // Don't set error here as it's not critical
        }
    }, [actualLectureId, classroomId]);

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
        console.log('🔄 URL parameters changed - classroomId:', classroomId, 'urlLectureId:', urlLectureId);
        // Reset state khi URL thay đổi
        setActualLectureId(null);
        setStudents([]);
        setError(null);
        fetchAttempted.current = false;
        
        fetchLectures();
    }, [fetchLectures]);

    // Tải dữ liệu điểm danh khi đã có actualLectureId
    useEffect(() => {
        if (actualLectureId) {
            // Reset the fetch attempted flag when IDs change
            fetchAttempted.current = false;

            // Fetch both attendance status and data
            fetchAttendanceStatus();
            fetchAttendanceData();

            // Cleanup function to prevent state updates if component unmounts
            return () => {
                fetchAttempted.current = true; // Ngăn cập nhật state khi rời trang
            };
        }
    }, [fetchAttendanceData, fetchAttendanceStatus, actualLectureId]);

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

            // If this was makeup attendance, mark the request as completed
            if (isMakeupMode && attendanceStatus?.makeupRequestId) {
                try {
                    await makeupAttendanceService.markRequestAsCompleted(attendanceStatus.makeupRequestId);
                    console.log('Marked makeup request as completed');
                } catch (markError) {
                    console.warn('Failed to mark makeup request as completed:', markError);
                    // Don't fail the whole operation for this
                }
            }

            setSubmitSuccess(true);

            // Refresh status after successful submission
            await fetchAttendanceStatus();

            setTimeout(() => {
                setSubmitSuccess(false);
            }, 3000);
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

    // Handle makeup attendance request creation
    const handleCreateMakeupRequest = async () => {
        const trimmedReason = makeupReason.trim();

        if (!trimmedReason) {
            setError('Vui lòng nhập lý do điểm danh bù');
            return;
        }

        if (trimmedReason.length < 10) {
            setError('Lý do điểm danh bù phải có ít nhất 10 ký tự (không tính khoảng trắng)');
            return;
        }

        if (trimmedReason.length > 2000) {
            setError('Lý do điểm danh bù không được vượt quá 2000 ký tự');
            return;
        }

        try {
            setIsSubmitting(true);
            await makeupAttendanceService.createRequest({
                lectureId: parseInt(actualLectureId, 10),
                classroomId: parseInt(classroomId, 10),
                reason: trimmedReason
            });

            setShowMakeupRequestForm(false);
            setMakeupReason('');
            setSubmitSuccess(true);

            // Refresh status
            await fetchAttendanceStatus();

            setTimeout(() => {
                setSubmitSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Error creating makeup request:', error);
            setError(`Không thể tạo yêu cầu điểm danh bù: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle retaking attendance (overwrite existing)
    const handleRetakeAttendance = () => {
        setIsMakeupMode(false);
        // Continue with normal attendance flow
    };

    // Làm mới thủ công
    const handleRefresh = () => {
        fetchAttempted.current = false; // Reset the flag to allow a new fetch
        fetchAttendanceStatus();
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
                        {lectures.find(l => l.id === actualLectureId)?.lectureDate && (
                            <span className="ml-2">
                                - Ngày: {(() => {
                                    const lecture = lectures.find(l => l.id === actualLectureId);
                                    const date = lecture?.lectureDate;
                                    
                                    if (Array.isArray(date)) {
                                        const [year, month, day] = date;
                                        return new Date(year, month - 1, day).toLocaleDateString('vi-VN');
                                    } else {
                                        return new Date(date + 'T00:00:00').toLocaleDateString('vi-VN');
                                    }
                                })()}
                            </span>
                        )}
                    </span>
                )}
            </h2>
            
            {/* Debug info để kiểm tra */}
            <div className="bg-gray-100 p-3 rounded mb-4">
                <details>
                    <summary className="cursor-pointer font-bold">Debug Info (Click để mở)</summary>
                    <div className="mt-2 text-sm">
                        <p><strong>URL Lecture ID:</strong> {urlLectureId}</p>
                        <p><strong>Schedule Date:</strong> {scheduleDate || 'None'}</p>
                        <p><strong>Actual Lecture ID:</strong> {actualLectureId}</p>
                        <p><strong>Classroom ID:</strong> {classroomId}</p>
                        <p><strong>Available Lectures:</strong></p>
                        <ul className="ml-4">
                            {lectures.map(lecture => (
                                <li key={lecture.id} className={lecture.id === actualLectureId ? "font-bold text-blue-600" : ""}>
                                    ID: {lecture.id} - {lecture.title} 
                                    {lecture.lectureDate && ` (${(() => {
                                        const date = lecture.lectureDate;
                                        try {
                                            if (Array.isArray(date)) {
                                                const [year, month, day] = date;
                                                return new Date(year, month - 1, day).toLocaleDateString('vi-VN');
                                            } else {
                                                return new Date(date + 'T00:00:00').toLocaleDateString('vi-VN');
                                            }
                                        } catch (error) {
                                            return 'Invalid Date';
                                        }
                                    })()})`}
                                </li>
                            ))}
                        </ul>
                    </div>
                </details>
            </div>
            
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

            {/* Attendance Status Indicator */}
            {attendanceStatus && (
                <div className={`px-4 py-3 rounded relative mb-4 ${
                    attendanceStatus.overallStatus === 'ALREADY_TAKEN' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
                    attendanceStatus.overallStatus === 'MAKEUP_APPROVED' ? 'bg-green-50 border border-green-200 text-green-800' :
                    attendanceStatus.overallStatus === 'CAN_TAKE_NORMAL' ? 'bg-blue-50 border border-blue-200 text-blue-800' :
                    attendanceStatus.overallStatus === 'NEEDS_MAKEUP_REQUEST' ? 'bg-orange-50 border border-orange-200 text-orange-800' :
                    attendanceStatus.overallStatus === 'TOO_EARLY' ? 'bg-gray-50 border border-gray-200 text-gray-800' :
                    'bg-red-50 border border-red-200 text-red-800'
                }`} role="alert">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-lg mr-2">
                                {attendanceStatus.overallStatus === 'ALREADY_TAKEN' ? '✅' :
                                 attendanceStatus.overallStatus === 'MAKEUP_APPROVED' ? '🔄' :
                                 attendanceStatus.overallStatus === 'CAN_TAKE_NORMAL' ? '⏰' :
                                 attendanceStatus.overallStatus === 'NEEDS_MAKEUP_REQUEST' ? '⚠️' :
                                 attendanceStatus.overallStatus === 'TOO_EARLY' ? '⏳' : '❌'}
                            </span>
                            <div>
                                <strong className="font-bold">
                                    {attendanceStatus.overallStatus === 'ALREADY_TAKEN' ? 'Đã điểm danh' :
                                     attendanceStatus.overallStatus === 'MAKEUP_APPROVED' ? 'Điểm danh bù đã được phê duyệt' :
                                     attendanceStatus.overallStatus === 'CAN_TAKE_NORMAL' ? 'Có thể điểm danh bình thường' :
                                     attendanceStatus.overallStatus === 'NEEDS_MAKEUP_REQUEST' ? 'Cần tạo yêu cầu điểm danh bù' :
                                     attendanceStatus.overallStatus === 'TOO_EARLY' ? 'Chưa đến thời gian điểm danh' : 'Đã hết thời gian điểm danh'}
                                </strong>
                                <div className="text-sm mt-1">
                                    {attendanceStatus.overallStatus === 'ALREADY_TAKEN' &&
                                        `Đã có ${attendanceStatus.existingRecordsCount} bản ghi điểm danh. Bạn có muốn điểm danh lại không?`}
                                    {attendanceStatus.overallStatus === 'MAKEUP_APPROVED' &&
                                        `Yêu cầu điểm danh bù đã được phê duyệt. Lý do: ${attendanceStatus.makeupRequestReason}`}
                                    {attendanceStatus.overallStatus === 'CAN_TAKE_NORMAL' &&
                                        'Bạn có thể thực hiện điểm danh bình thường trong khung thời gian cho phép.'}
                                    {attendanceStatus.overallStatus === 'NEEDS_MAKEUP_REQUEST' &&
                                        'Đã quá thời gian điểm danh bình thường. Bạn cần tạo yêu cầu điểm danh bù để được manager phê duyệt.'}
                                    {attendanceStatus.overallStatus === 'TOO_EARLY' &&
                                        'Chưa đến thời gian có thể điểm danh. Vui lòng quay lại sau.'}
                                </div>
                            </div>
                        </div>

                        {/* Action buttons based on status */}
                        <div className="flex gap-2">
                            {attendanceStatus.overallStatus === 'ALREADY_TAKEN' && (
                                <button
                                    onClick={handleRetakeAttendance}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                                >
                                    Điểm danh lại
                                </button>
                            )}
                            {attendanceStatus.overallStatus === 'NEEDS_MAKEUP_REQUEST' && attendanceStatus.canCreateMakeupRequest && (
                                <button
                                    onClick={() => setShowMakeupRequestForm(true)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                                >
                                    Tạo yêu cầu điểm danh bù
                                </button>
                            )}
                            {attendanceStatus.overallStatus === 'MAKEUP_APPROVED' && (
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="makeupMode"
                                        checked={isMakeupMode}
                                        onChange={(e) => setIsMakeupMode(e.target.checked)}
                                        className="mr-2"
                                    />
                                    <label htmlFor="makeupMode" className="text-sm">Điểm danh bù</label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Makeup Request Form Modal */}
            {showMakeupRequestForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">Tạo yêu cầu điểm danh bù</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Lý do điểm danh bù: <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={makeupReason}
                                onChange={(e) => setMakeupReason(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                rows="4"
                                placeholder="Vui lòng nhập lý do cần điểm danh bù (tối thiểu 10 ký tự)..."
                                maxLength={2000}
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Tối thiểu 10 ký tự (không tính khoảng trắng)</span>
                                <span>{makeupReason.trim().length}/2000</span>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => {
                                    setShowMakeupRequestForm(false);
                                    setMakeupReason('');
                                }}
                                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreateMakeupRequest}
                                disabled={isSubmitting || !makeupReason.trim() || makeupReason.trim().length < 10}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                            >
                                {isSubmitting ? 'Đang tạo...' : 'Tạo yêu cầu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Time window warning - only show if no specific status */}
            {!attendanceStatus && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded relative mb-4" role="alert">
                    <div className="flex items-center">
                        <span className="text-lg mr-2">⏰</span>
                        <div>
                            <strong className="font-bold">Lưu ý về thời gian điểm danh:</strong>
                            <span className="block sm:inline"> Chỉ có thể điểm danh trong vòng 24 giờ trước và sau buổi học.</span>
                        </div>
                    </div>
                </div>
            )}

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

                <div className="mt-6 flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={isSubmitting || students.length === 0 ||
                                 (attendanceStatus?.overallStatus === 'NEEDS_MAKEUP_REQUEST' && !isMakeupMode) ||
                                 attendanceStatus?.overallStatus === 'TOO_EARLY' ||
                                 attendanceStatus?.overallStatus === 'TIME_EXPIRED'}
                        className={`font-bold py-2 px-4 rounded disabled:bg-gray-400 ${
                            isMakeupMode ? 'bg-green-500 hover:bg-green-700' : 'bg-blue-500 hover:bg-blue-700'
                        } text-white`}
                    >
                        {isSubmitting ? 'Đang lưu...' :
                         isMakeupMode ? 'Lưu điểm danh bù' :
                         attendanceStatus?.overallStatus === 'ALREADY_TAKEN' ? 'Cập nhật điểm danh' :
                         'Lưu điểm danh'}
                    </button>

                    {isMakeupMode && (
                        <div className="flex items-center text-green-600">
                            <span className="text-sm">🔄 Đang thực hiện điểm danh bù</span>
                        </div>
                    )}

                    {attendanceStatus?.overallStatus === 'ALREADY_TAKEN' && !isMakeupMode && (
                        <div className="flex items-center text-yellow-600">
                            <span className="text-sm">⚠️ Điểm danh này sẽ ghi đè lên dữ liệu cũ</span>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default TakeAttendancePage; 