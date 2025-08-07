import api from '../config/axiosInstance';

const requestService = {
    submitRequest: (data) => {
        // data must match CreateRequestDto
        return api.post('/auth/register', data);
    },
    getPendingRequests: () => {
        return api.get('/manager/requests/pending');
    },
    approveRequest: (requestId) => {
        return api.post(`/manager/requests/${requestId}/approve`);
    },
    rejectRequest: (requestId, reason) => {
        // Backend nhận body là chuỗi lý do, không phải object
        return api.post(`/manager/requests/${requestId}/reject`, reason, {
            headers: { 'Content-Type': 'text/plain' }
        });
    },
    getAllRequests: () => {
        return api.get('/manager/requests');
    }
};

export default requestService; 