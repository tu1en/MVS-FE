import axiosInstance from "../config/axiosInstance";

const startExam = (examId) => {
    return axiosInstance.post(`/api/exams/${examId}/start`);
};

const submitExam = (submissionId, submissionData) => {
    return axiosInstance.post(`/api/exam-submissions/${submissionId}`, submissionData);
};

const getSubmissionsForExam = (examId) => {
    return axiosInstance.get(`/api/exams/${examId}/submissions`);
};

const getMySubmissionForExam = (examId) => {
    return axiosInstance.get(`/api/exams/${examId}/submission/me`);
};

const gradeSubmission = (submissionId, gradeData) => {
    return axiosInstance.put(`/api/exam-submissions/${submissionId}/grade`, gradeData);
};


const examSubmissionService = {
    startExam,
    submitExam,
    getSubmissionsForExam,
    getMySubmissionForExam,
    gradeSubmission,
};

export default examSubmissionService; 