import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, message, Badge, Tag, Space, Tooltip, Descriptions, Form, Input } from 'antd';
import { CheckOutlined, CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approveComment, setApproveComment] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  const baseUrl = (process.env.REACT_APP_BASE_URL || 'http://localhost:8088').replace(/\/$/, '');

  const getApiUrl = useCallback((endpoint) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    if (baseUrl.includes('/api')) {
      return `${baseUrl}/${cleanEndpoint}`;
    } else {
      return `${baseUrl}/api/${cleanEndpoint}`;
    }
  }, [baseUrl]);

  const fetchAllRequests = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Không tìm thấy token đăng nhập!');
        return;
      }
      
      const apiUrl = getApiUrl('admin/requests/all');
      console.log('Fetching all requests from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Request data structure:', data[0]); 
        setRequests(data);
      } else if (response.status === 401 || response.status === 403) {
        console.error('JWT token không hợp lệ hoặc đã hết hạn');
        message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        throw new Error('Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      message.error('Không thể tải dữ liệu yêu cầu');
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  useEffect(() => {
    fetchAllRequests();
    
    const interval = setInterval(() => {
      fetchAllRequests();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchAllRequests]);

  const showApproveModal = (e, requestId) => {
    e.stopPropagation();
    setSelectedRequestId(requestId);
    setApproveComment('');
    setApproveModalVisible(true);
  };

  const handleApprove = async () => {
    try {
      message.loading({ content: 'Đang xử lý...', key: 'approveLoading' });
      
      const token = localStorage.getItem('token');
      if (!token) {
        message.error({ content: 'Không tìm thấy token đăng nhập!', key: 'approveLoading' });
        return;
      }
      
      const approveUrl = getApiUrl(`admin/requests/${selectedRequestId}/approve`);
      
      console.log('Sending approval request to:', approveUrl);
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      const response = await fetch(approveUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ comment: approveComment })
      });
        
      console.log("Approve endpoint status:", response.status);
        
      if (response.ok) {
        message.success({ content: 'Phê duyệt yêu cầu thành công', key: 'approveLoading' });
        setApproveModalVisible(false);
        fetchAllRequests();
      } else {
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = errorData.message || errorData.error || 'Unknown error';
        } catch (e) {
          try {
            errorText = await response.text();
          } catch (e2) {
            errorText = 'Unknown error';
          }
        }
        console.error("Approve endpoint failed:", errorText);
        message.error({ content: `Không thể phê duyệt: ${errorText}`, key: 'approveLoading' });
      }
    } catch (error) {
      console.error("Approve endpoint error:", error);
      message.error({ content: `Lỗi: ${error.message}`, key: 'approveLoading' });
    }
  };

  const showRejectModal = (e, requestId) => {
    e.stopPropagation();
    setSelectedRequestId(requestId);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const showDetailModal = (record) => {
    console.log("showDetailModal called with record:", record);
    setSelectedRequest(record);
    setDetailModalVisible(true);
    
    fetchRequestDetails(record.id);
  };

  const fetchRequestDetails = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Không tìm thấy token đăng nhập!');
        return;
      }
      
      const apiUrl = getApiUrl(`admin/requests/${requestId}/details`);
      console.log('Fetching request details from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const detailData = await response.json();
        console.log('Request detail data:', detailData);
        
        let parsedFormData = {};
        if (detailData.formResponses) {
          try {
            console.log('Raw formResponses:', detailData.formResponses);
            const cleanedJson = detailData.formResponses.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            console.log('Cleaned JSON:', cleanedJson);
            
            let jsonToParse = cleanedJson;
            if (cleanedJson.startsWith('"') && cleanedJson.endsWith('"')) {
              jsonToParse = cleanedJson.substring(1, cleanedJson.length - 1);
              console.log('Unquoted JSON:', jsonToParse);
            }
            
            parsedFormData = JSON.parse(jsonToParse);
            console.log('Parsed form data:', parsedFormData);
          } catch (error) {
            console.error('Error parsing form responses:', error);
          }
        }
        
        // Trích xuất thông tin CV từ formResponses nếu là yêu cầu giáo viên
        const cvFileUrl = parsedFormData.cvFileUrl || detailData.cvFileUrl;
        const cvFileData = parsedFormData.cvFileData || detailData.cvFileData;
        const cvFileName = parsedFormData.cvFileName || detailData.cvFileName;
        
        setSelectedRequest(prevState => ({
          ...prevState,
          ...detailData,
          phoneNumber: parsedFormData.phoneNumber || detailData.phoneNumber,
          qualifications: parsedFormData.qualifications,
          experience: parsedFormData.experience,
          subjects: parsedFormData.subjects,
          additionalInfo: parsedFormData.additionalInfo,
          grade: parsedFormData.grade,
          parentContact: parsedFormData.parentContact,
          // Thông tin CV
          cvFileUrl: cvFileUrl,
          cvFileData: cvFileData,
          cvFileName: cvFileName
        }));
      } else {
        console.error('Failed to fetch request details');
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Không tìm thấy token đăng nhập!');
        return;
      }
      
      const apiUrl = getApiUrl(`admin/requests/${selectedRequestId}/reject`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason })
      });
      
      if (response.ok) {
        message.success('Từ chối yêu cầu thành công');
        setRejectModalVisible(false);
        fetchAllRequests();
      } else {
        throw new Error('Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      message.error('Không thể từ chối yêu cầu');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING':
        return <Badge status="processing" text="Đang chờ xử lý" />;
      case 'APPROVED':
        return <Badge status="success" text="Đã phê duyệt" />;
      case 'REJECTED':
        return <Badge status="error" text="Đã từ chối" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  const columns = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò đăng ký',
      dataIndex: 'requestedRole',
      key: 'requestedRole',
      render: (role) => (
        <Tag color={role === 'TEACHER' ? 'blue' : 'green'}>
          {role === 'TEACHER' ? 'Giáo viên' : 'Học sinh'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusBadge(status),
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<InfoCircleOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                showDetailModal(record);
              }}
            >
              Chi tiết
            </Button>
          </Tooltip>
          
          {record.status === 'PENDING' && (
            <>
              <Tooltip title="Phê duyệt">
                <Button 
                  type="primary" 
                  icon={<CheckOutlined />} 
                  onClick={(e) => showApproveModal(e, record.id)}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                />
              </Tooltip>
              
              <Tooltip title="Từ chối">
                <Button 
                  danger 
                  icon={<CloseOutlined />} 
                  onClick={(e) => showRejectModal(e, record.id)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý yêu cầu đăng ký</h1>
        <Button type="primary" onClick={fetchAllRequests}>Làm mới</Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={requests}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        onRow={(record) => ({
          onClick: () => showDetailModal(record),
          style: { cursor: 'pointer' }
        })}
      />

      <Modal
        title="Phê duyệt yêu cầu"
        open={approveModalVisible}
        onOk={handleApprove}
        onCancel={() => setApproveModalVisible(false)}
        okText="Phê duyệt"
        cancelText="Hủy"
      >
        <p className="mb-2">Bạn có chắc chắn muốn phê duyệt yêu cầu này?</p>
        <p className="mb-4">Sau khi phê duyệt, người dùng sẽ được cấp quyền tương ứng và nhận được email thông báo.</p>
        <Form layout="vertical">
          <Form.Item label="Ghi chú (tùy chọn)">
            <Input.TextArea
              rows={4}
              value={approveComment}
              onChange={e => setApproveComment(e.target.value)}
              placeholder="Nhập ghi chú nếu cần..."
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Từ chối yêu cầu"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="Từ chối"
        cancelText="Hủy"
      >
        <p className="mb-2">Vui lòng nhập lý do từ chối yêu cầu:</p>
        <textarea
          className="w-full p-2 border border-gray-300 rounded"
          rows={4}
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          placeholder="Nhập lý do từ chối..."
        />
      </Modal>

      <Modal
        title="Thông tin chi tiết yêu cầu đăng ký"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedRequest && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Họ và tên">{selectedRequest.fullName}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedRequest.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedRequest.phoneNumber || 'Không có'}
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò yêu cầu">
              {selectedRequest.requestedRole === 'TEACHER' ? 'Giáo viên' : 'Học sinh'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusBadge(selectedRequest.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(selectedRequest.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            
            {selectedRequest.requestedRole === 'TEACHER' && (
              <>
                <Descriptions.Item label="CV / Hồ sơ">
                  {selectedRequest.cvFileUrl ? (
                    <div>
                      <p>Tên file: {selectedRequest.cvFileName || selectedRequest.cvFileUrl.split('/').pop() || 'CV'}</p>
                      {selectedRequest.cvFileUrl.startsWith('http') && (
                        <Button 
                          type="primary" 
                          href={selectedRequest.cvFileUrl} 
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Xem / Tải xuống
                        </Button>
                      )}
                      
                      {selectedRequest.cvFileUrl.startsWith('local://') && (
                        <div>
                          <Tag color="orange">File chưa được upload lên cloud</Tag>
                        </div>
                      )}
                      
                      {selectedRequest.cvFileUrl.startsWith('error://') && (
                        <div>
                          <Tag color="red">Lỗi khi xử lý file</Tag>
                        </div>
                      )}
                      
                      {selectedRequest.cvFileUrl.startsWith('pending://') && (
                        <div>
                          <Tag color="blue">File đang chờ xử lý</Tag>
                        </div>
                      )}
                    </div>
                  ) : (
                    'Không có file CV'
                  )}
                </Descriptions.Item>
              </>
            )}
            
            {selectedRequest.requestedRole === 'STUDENT' && (
              <>
                <Descriptions.Item label="Lớp học">
                  {selectedRequest.grade || 'Không có'}
                </Descriptions.Item>
                <Descriptions.Item label="Thông tin phụ huynh">
                  {selectedRequest.parentContact || 'Không có'}
                </Descriptions.Item>
              </>
            )}
            
            <Descriptions.Item label="Thông tin thêm">
              {selectedRequest.additionalInfo || 'Không có'}
            </Descriptions.Item>
            
            {selectedRequest.status === 'REJECTED' && (
              <Descriptions.Item label="Lý do từ chối">
                {selectedRequest.rejectionReason || 'Không có'}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default RequestList; 