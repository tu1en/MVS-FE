import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, message, Badge, Tag, Space, Tooltip, Descriptions } from 'antd';
import { CheckOutlined, CloseOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:8088';

  const fetchPendingRequests = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/admin/requests/pending` 
        : `${baseUrl}/api/admin/requests/pending`;
      
      console.log('Fetching requests from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json; charset=utf-8'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Request data structure:', data[0]); // Debug đối tượng request đầu tiên
        setRequests(data);
      } else if (response.status === 401 || response.status === 403) {
        // Xử lý lỗi JWT không hợp lệ
        console.error('JWT token không hợp lệ hoặc đã hết hạn');
        message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        // Chuyển hướng đến trang đăng nhập
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
  }, [baseUrl]);

  // Fetch requests when component mounts
  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleApprove = (e, requestId) => {
    e.stopPropagation(); // Ngăn sự kiện click lan sang row
    
    confirm({
      title: 'Bạn có chắc chắn muốn phê duyệt yêu cầu này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Sau khi phê duyệt, người dùng sẽ được cấp quyền tương ứng.',
      okText: 'Phê duyệt',
      okType: 'primary',
      cancelText: 'Hủy',
      async onOk() {
        try {
          const token = localStorage.getItem('token');
          const apiUrl = baseUrl.endsWith('/api') 
            ? `${baseUrl}/admin/requests/${requestId}/approve` 
            : `${baseUrl}/api/admin/requests/${requestId}/approve`;
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json; charset=utf-8',
              'Accept': 'application/json; charset=utf-8'
            }
          });
          
          if (response.ok) {
            message.success('Phê duyệt yêu cầu thành công');
            fetchPendingRequests(); // Refresh the list
          } else {
            throw new Error('Failed to approve request');
          }
        } catch (error) {
          console.error('Error approving request:', error);
          message.error('Không thể phê duyệt yêu cầu');
        }
      },
    });
  };

  const showRejectModal = (e, requestId) => {
    e.stopPropagation(); // Ngăn sự kiện click lan sang row
    setSelectedRequestId(requestId);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const showDetailModal = (record) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);
    
    // Fetch thêm chi tiết của request
    fetchRequestDetails(record.id);
  };

  // Hàm fetch chi tiết của request
  const fetchRequestDetails = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/admin/requests/${requestId}/details` 
        : `${baseUrl}/api/admin/requests/${requestId}/details`;
      
      console.log('Fetching request details from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json; charset=utf-8'
        }
      });
      
      if (response.ok) {
        const detailData = await response.json();
        console.log('Request detail data:', detailData);
        
        // Nếu có formResponses, parse JSON để lấy thông tin chi tiết
        let parsedFormData = {};
        if (detailData.formResponses) {
          try {
            console.log('Raw formResponses:', detailData.formResponses);
            // Loại bỏ escape characters nếu có
            const cleanedJson = detailData.formResponses.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            console.log('Cleaned JSON:', cleanedJson);
            
            // Nếu chuỗi JSON bắt đầu và kết thúc bằng dấu ngoặc kép, loại bỏ chúng
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
        
        // Cập nhật selected request với thông tin chi tiết
        setSelectedRequest(prevState => ({
          ...prevState,
          ...detailData,
          // Thêm các trường từ form responses nếu có
          phoneNumber: parsedFormData.phoneNumber || detailData.phoneNumber,
          qualifications: parsedFormData.qualifications,
          experience: parsedFormData.experience,
          subjects: parsedFormData.subjects,
          additionalInfo: parsedFormData.additionalInfo,
          // Thêm các trường cho học sinh nếu có
          grade: parsedFormData.grade,
          parentContact: parsedFormData.parentContact
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
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/admin/requests/${selectedRequestId}/reject` 
        : `${baseUrl}/api/admin/requests/${selectedRequestId}/reject`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: rejectReason })
      });
      
      if (response.ok) {
        message.success('Từ chối yêu cầu thành công');
        setRejectModalVisible(false);
        fetchPendingRequests(); // Refresh the list
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
        return <Badge status="processing" text="Đang chờ" />;
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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Vai trò yêu cầu',
      dataIndex: 'requestedRole',
      key: 'requestedRole',
      render: role => (
        <Tag color={role === 'TEACHER' ? 'blue' : 'green'}>
          {role === 'TEACHER' ? 'Giáo viên' : 'Học sinh'}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => getStatusBadge(status)
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Phê duyệt">
            <Button 
              type="primary" 
              icon={<CheckOutlined />} 
              onClick={(e) => handleApprove(e, record.id)}
              disabled={record.status !== 'PENDING'}
            />
          </Tooltip>
          <Tooltip title="Từ chối">
            <Button 
              danger 
              icon={<CloseOutlined />} 
              onClick={(e) => showRejectModal(e, record.id)}
              disabled={record.status !== 'PENDING'}
            />
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<InfoCircleOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                showDetailModal(record);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý yêu cầu đăng ký</h1>
        <Button type="primary" onClick={fetchPendingRequests}>Làm mới</Button>
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

      {/* Modal từ chối yêu cầu */}
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

      {/* Modal xem chi tiết yêu cầu */}
      <Modal
        title="Thông tin chi tiết yêu cầu đăng ký"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          selectedRequest && selectedRequest.status === 'PENDING' && (
            <Button 
              key="approve" 
              type="primary" 
              onClick={(e) => handleApprove(e, selectedRequest.id)}
            >
              Phê duyệt
            </Button>
          ),
          selectedRequest && selectedRequest.status === 'PENDING' && (
            <Button 
              key="reject" 
              danger 
              onClick={(e) => {
                setDetailModalVisible(false);
                showRejectModal(e, selectedRequest.id);
              }}
            >
              Từ chối
            </Button>
          ),
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
            
            {/* Thông tin bổ sung cho giáo viên */}
            {selectedRequest.requestedRole === 'TEACHER' && (
              <>
                <Descriptions.Item label="Trình độ chuyên môn">
                  {selectedRequest.qualifications || 
                   selectedRequest.qualification || 
                   selectedRequest.educationLevel || 
                   'Không có'}
                </Descriptions.Item>
                <Descriptions.Item label="Kinh nghiệm giảng dạy">
                  {selectedRequest.experience || 
                   selectedRequest.teachingExperience || 
                   selectedRequest.yearsOfExperience || 
                   'Không có'}
                </Descriptions.Item>
                <Descriptions.Item label="Môn học dạy">
                  {selectedRequest.subjects || 
                   selectedRequest.teachingSubjects || 
                   selectedRequest.preferredSubjects || 
                   'Không có'}
                </Descriptions.Item>
              </>
            )}
            
            {/* Thông tin bổ sung cho học sinh */}
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
              {selectedRequest.additionalInfo || 
               selectedRequest.additionalInformation || 
               selectedRequest.notes || 
               selectedRequest.comments || 
               'Không có'}
            </Descriptions.Item>
            
            {selectedRequest.status === 'REJECTED' && (
              <Descriptions.Item label="Lý do từ chối">
                {selectedRequest.rejectionReason || 
                 selectedRequest.rejectionNote || 
                 selectedRequest.rejectReason || 
                 'Không có'}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default RequestList; 