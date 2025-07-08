import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import API_CONFIG from '../../config/api-config';
import { teacherAttendanceService } from '../../services/teacherAttendanceService';

const TakeAttendancePage = () => {
    const { classroomId, lectureId } = useParams(); // Get IDs from URL
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null);
    const fetchAttempted = useRef(false);

    // Debug function to log API configuration
    const logDebugInfo = useCallback(() => {
        const info = {
            baseUrl: API_CONFIG.BASE_URL,
            classroomId,
            lectureId,
            attendanceEndpoints: {
                attendance: API_CONFIG.ENDPOINTS.ATTENDANCE,
                attendanceSessions: API_CONFIG.ENDPOINTS.ATTENDANCE_SESSIONS,
                attendanceTeacher: API_CONFIG.ENDPOINTS.ATTENDANCE_TEACHER
            },
            fullPath: `${API_CONFIG.BASE_URL}/attendance/lecture/${lectureId}`
        };
        
        console.log('Debug Info:', info);
        setDebugInfo(info);
        return info;
    }, [classroomId, lectureId]);

    const fetchAttendanceData = useCallback(async () => {
        // Prevent multiple fetch attempts
        if (fetchAttempted.current) return;
        
        if (!lectureId || !classroomId) return; // Don't fetch if IDs are missing

        fetchAttempted.current = true;
        setIsLoading(true);
        setError(null);
        
        // Log debug info
        logDebugInfo();
        console.log(`Attempting to fetch attendance data for lecture ID: ${lectureId} in classroom ID: ${classroomId}`);
        
        try {
            // Pass both lectureId and classroomId to the service method
            const data = await teacherAttendanceService.getAttendanceForLecture(lectureId, classroomId);
            console.log('Attendance data received:', data);
            
            if (!data || data.length === 0) {
                console.warn('No attendance data received for this lecture');
                setStudents([]);
                setError('No students found for this lecture. Please check if students are enrolled in this classroom.');
                return;
            }
            
            const studentsWithStatus = data.map(student => ({
                ...student,
                status: student.status || 'PRESENT'
            }));
            setStudents(studentsWithStatus);
        } catch (err) {
            console.error('Detailed error:', err);
            
            // Don't treat cancellations as errors to display
            if (err.code === 'ERR_CANCELED') {
                console.log('Request was cancelled, likely due to component unmount or navigation');
                return;
            }
            
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response:', err.response);
                setError(`Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
            } else if (err.request) {
                // The request was made but no response was received
                console.error('Error request:', err.request);
                setError('No response from server. Please check your connection and try again.');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error message:', err.message);
                setError(`Failed to fetch attendance data: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    }, [lectureId, classroomId, logDebugInfo]);

    useEffect(() => {
        // Reset the fetch attempted flag when IDs change
        fetchAttempted.current = false;
        fetchAttendanceData();
        
        // Cleanup function to prevent state updates if component unmounts
        return () => {
            fetchAttempted.current = true; // Prevent any pending callbacks from updating state
        };
    }, [fetchAttendanceData]);

    const handleStatusChange = (studentId, newStatus) => {
        setStudents(prevStudents =>
            prevStudents.map(student =>
                student.studentId === studentId ? { ...student, status: newStatus } : student
            )
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSubmitSuccess(false);

        const attendanceData = {
            lectureId: parseInt(lectureId, 10),
            classroomId: parseInt(classroomId, 10),
            records: students.map(({ studentId, status }) => ({ studentId, status })),
        };

        try {
            console.log('Submitting attendance data:', attendanceData);
            await teacherAttendanceService.submitAttendance(attendanceData);
            setSubmitSuccess(true);
            setTimeout(() => {
                setSubmitSuccess(false);
            }, 2000);
        } catch (err) {
            console.error('Detailed submission error:', err);
            console.error('Error config:', err.config);
            console.error('Error response:', err.response);
            
            setError(`Failed to submit attendance. Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle manual refresh
    const handleRefresh = () => {
        fetchAttempted.current = false; // Reset the flag to allow a new fetch
        fetchAttendanceData();
    };

    if (isLoading) {
        return <div className="text-center p-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Take Attendance</h1>
            <h2 className="text-lg mb-2">Lecture ID: {lectureId} | Classroom ID: {classroomId}</h2>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                    <button 
                        onClick={handleRefresh} 
                        className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    >
                        Retry
                    </button>
                </div>
            )}
            
            {submitSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline"> Attendance has been submitted.</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="py-2 px-4 border-b">Student ID</th>
                                <th className="py-2 px-4 border-b">Full Name</th>
                                <th className="py-2 px-4 border-b">Status</th>
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
                                                <option value="PRESENT">Present</option>
                                                <option value="ABSENT">Absent</option>
                                                <option value="LATE">Late</option>
                                                <option value="EXCUSED">Excused</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="py-4 px-4 text-center">
                                        No student data available for this lecture.
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
                        {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TakeAttendancePage; 