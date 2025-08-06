import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import enrollmentService from '../../services/enrollmentService';

const EnrollmentRequestsManager = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await enrollmentService.getRequests(filter);
      setRequests(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load enrollment requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this enrollment request?')) {
      return;
    }

    setProcessingId(requestId);
    try {
      await enrollmentService.approveRequest(requestId);
      await fetchRequests(); // Refresh the list
      alert('Enrollment request approved successfully! The student will be notified via email.');
    } catch (error) {
      console.error('Error approving request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to approve request. Please try again.';
      alert(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason || reason.trim() === '') {
      return;
    }

    setProcessingId(requestId);
    try {
      await enrollmentService.rejectRequest(requestId, reason.trim());
      await fetchRequests(); // Refresh the list
      alert('Enrollment request rejected successfully! The student will be notified via email.');
    } catch (error) {
      console.error('Error rejecting request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reject request. Please try again.';
      alert(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = 'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
    switch (status) {
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'APPROVED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'REJECTED':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enrollment Requests</h1>
        <p className="text-gray-600">
          Review and manage student enrollment requests for your courses.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
          <button 
            onClick={fetchRequests}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'PENDING', label: 'Chờ duyệt' },
              { key: 'APPROVED', label: 'Đã duyệt' },
              { key: 'REJECTED', label: 'Từ chối' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {label} ({requests.length})
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No {filter.toLowerCase()} requests
            </h3>
            <p className="text-gray-600">
              {filter === 'PENDING' 
                ? 'There are no pending enrollment requests at the moment.'
                : `There are no ${filter.toLowerCase()} enrollment requests.`
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {filter === 'PENDING' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                  {filter === 'REJECTED' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.studentName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.studentEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {request.courseName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {request.message ? (
                          <div className="truncate" title={request.message}>
                            {request.message}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No message</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(request.status)}>
                        {request.status === 'PENDING' ? 'Chờ duyệt' : 
                         request.status === 'APPROVED' ? 'Đã duyệt' : 
                         request.status === 'REJECTED' ? 'Từ chối' : 
                         request.status}
                      </span>
                    </td>
                    {filter === 'PENDING' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleApprove(request.id)}
                            disabled={processingId === request.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                          >
                            {processingId === request.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button 
                            onClick={() => handleReject(request.id)}
                            disabled={processingId === request.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                    {filter === 'REJECTED' && (
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {request.rejectionReason ? (
                            <div className="truncate" title={request.rejectionReason}>
                              {request.rejectionReason}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No reason provided</span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistics Summary */}
      {requests.length > 0 && (
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Summary
          </h3>
          <p className="text-blue-700">
            Showing {requests.length} {filter.toLowerCase()} enrollment request{requests.length !== 1 ? 's' : ''}.
            {filter === 'PENDING' && requests.length > 0 && (
              <span> Please review and process these requests promptly.</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default EnrollmentRequestsManager;