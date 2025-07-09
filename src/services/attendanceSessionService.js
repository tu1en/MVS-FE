import apiClient from '../config/axiosInstance';

const SESSION_API_URL = '/sessions';
const ATTENDANCE_API_URL = '/attendance'; // For the result endpoint

const attendanceSessionService = {
    /**
     * Creates a new real-time attendance session.
     * @param {object} sessionData - The data to create the session.
     * @param {number} sessionData.classroomId - The ID of the classroom.
     * @param {number} sessionData.durationInMinutes - The duration of the session in minutes.
     * @returns {Promise<any>} The created session object.
     */
    createSession: async (sessionData) => {
        try {
            const response = await apiClient.post(SESSION_API_URL, sessionData);
            return response.data;
        } catch (error) {
            console.error("Error creating attendance session:", error);
            throw error;
        }
    },

    /**
     * Closes an active attendance session.
     * @param {number} sessionId - The ID of the session to close.
     * @returns {Promise<any>} The updated session object.
     */
    closeSession: async (sessionId) => {
        try {
            const response = await apiClient.post(`${SESSION_API_URL}/${sessionId}/close`);
            return response.data;
        } catch (error) {
            console.error(`Error closing attendance session ${sessionId}:`, error);
            throw error;
        }
    },

    /**
     * Gets all attendance records for a specific session.
     * @param {number} sessionId - The ID of the session.
     * @returns {Promise<any>} A list of student attendance records.
     */
    getSessionAttendance: async (sessionId) => {
        try {
            const response = await apiClient.get(`${SESSION_API_URL}/${sessionId}/attendance`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching attendance for session ${sessionId}:`, error);
            throw error;
        }
    },

    /**
     * Records attendance for the current student.
     * @param {number} sessionId - The ID of the session.
     * @param {string} studentCode - A unique code for attendance (e.g., from QR scan).
     * @returns {Promise<any>} The created attendance record.
     */
    recordStudentAttendance: async (sessionId, studentCode) => {
        try {
            const response = await apiClient.post(`${SESSION_API_URL}/${sessionId}/record`, { studentCode });
            return response.data;
        } catch (error) {
            console.error(`Error recording student attendance for session ${sessionId}:`, error);
            throw error;
        }
    },

    /**
     * Gets the overall attendance result for a student in a classroom.
     * @param {number} classroomId The ID of the classroom.
     * @param {number} studentId The ID of the student.
     * @returns {Promise<Array>} A promise that resolves to the student's attendance history.
     */
    getAttendanceResult: async (classroomId, studentId) => {
        try {
            const response = await apiClient.get(`${ATTENDANCE_API_URL}/classroom/${classroomId}/student/${studentId}`);
            return response.data;
        } catch (error)            {
            console.error(`Error fetching attendance result for student ${studentId} in classroom ${classroomId}:`, error);
            throw error;
        }
    },
};

export default attendanceSessionService; 