import axiosInstance from "../config/axiosInstance";

const API_URL = "/exams";

const createExam = (examData) => {
    return axiosInstance.post(API_URL, examData);
};

const getExamsByClassroom = (classroomId) => {
    return axiosInstance.get(`/classrooms/${classroomId}/exams`);
};

const getExamById = (examId) => {
    return axiosInstance.get(`${API_URL}/${examId}`);
};

const updateExam = (examId, examData) => {
    return axiosInstance.put(`${API_URL}/${examId}`, examData);
};

const deleteExam = (examId) => {
    return axiosInstance.delete(`${API_URL}/${examId}`);
};

const examService = {
    createExam,
    getExamsByClassroom,
    getExamById,
    updateExam,
    deleteExam,
};

export default examService; 