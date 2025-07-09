import api from '../config/axiosInstance';

const requestService = {
    submitRequest: (data) => {
        // data must match CreateRequestDto
        return api.post('/auth/register', data);
    },
    getPendingRequests: () => {
        return api.get('/admin/requests/pending');
    },
    approveRequest: (requestId) => {
        return api.post(`/admin/requests/${requestId}/approve`);
    },
    rejectRequest: (requestId, reason) => {
        return api.post(`/admin/requests/${requestId}/reject`, { reason });
    }
};

export default requestService; 