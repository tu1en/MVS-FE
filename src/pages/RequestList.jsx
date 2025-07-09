import { CheckOutlined, CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Button, Descriptions, Form, Input, Modal, Space, Table, Tag, Tooltip, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import requestService from '../services/requestService'; // Using the new service

/**
 * A safe JSON parser that can handle double-encoded strings.
 */
const safeJsonParse = (jsonString) => {
  if (typeof jsonString !== 'string') {
    return jsonString; // It's already an object
  }
  try {
    // First attempt to parse directly
    return JSON.parse(jsonString);
  } catch (e) {
    try {
      // Second attempt: handle cases where the string is double-encoded
      return JSON.parse(JSON.parse(`"${jsonString}"`));
    } catch (e2) {
      console.error("Failed to parse JSON string:", jsonString, e2);
      return {}; // Return an empty object on failure
    }
  }
};

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchAllRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await requestService.getAllRequests();
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      message.error(error.response?.data?.message || 'Không thể tải dữ liệu yêu cầu');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
    setApproveModalVisible(true);
  };

  const handleApprove = async () => {
    if (!selectedRequestId) return;
    try {
      message.loading({ content: 'Đang xử lý...', key: 'approveLoading' });
      await requestService.approveRequest(selectedRequestId);
      message.success({ content: 'Phê duyệt yêu cầu thành công', key: 'approveLoading' });
      setApproveModalVisible(false);
      setSelectedRequestId(null);
      setSelectedRequest(null);
      fetchAllRequests();
    } catch (error) {
      console.error("Approve endpoint error:", error);
      message.error({ content: `Không thể phê duyệt: ${error.response?.data?.message || error.message}`, key: 'approveLoading' });
    }
  };

  const showRejectModal = (e, requestId) => {
    e.stopPropagation();
    setSelectedRequestId(requestId);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const showDetailModal = (record) => {
    const formResponses = safeJsonParse(record.formResponses);
    const fullDetails = {
        ...record,
        ...formResponses
    };
    setSelectedRequest(fullDetails);
    setDetailModalVisible(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.error('Vui lòng nhập lý do từ chối');
      return;
    }

    if (!selectedRequestId) return;
    try {
      await requestService.rejectRequest(selectedRequestId, rejectReason);
      message.success('Từ chối yêu cầu thành công');
      setRejectModalVisible(false);
      setSelectedRequestId(null);
      setSelectedRequest(null);
      fetchAllRequests(); // Refresh list
    } catch (error) {
      console.error('Error rejecting request:', error);
      message.error(`Lỗi: ${error.response?.data?.message || error.message}`);
    }
  };

  const getStatusBadge = (status, resultStatus) => {
    if (status === 'COMPLETED') {
      if (resultStatus === 'APPROVED') return <Tag color="green">Đã Duyệt</Tag>;
      if (resultStatus === 'REJECTED') return <Tag color="red">Đã Từ Chối</Tag>;
      return <Tag color="blue">Hoàn Thành</Tag>;
    }
    if (status === 'PENDING') return <Tag color="orange">Đang Chờ</Tag>;
    return <Tag>{status}</Tag>;
  };

  const renderDetailContent = () => {
    if (!selectedRequest) return null;
    
    // selectedRequest is now the full detailed object
    const formDetails = selectedRequest;

    const commonItems = [
      { key: '1', label: 'ID Yêu cầu', children: formDetails.id},
      { key: '2', label: 'Họ và Tên', children: formDetails.fullName },
      { key: '3', label: 'Email', children: formDetails.email },
      { key: '4', label: 'Số điện thoại', children: formDetails.phoneNumber || 'N/A' },
      { key: '5', label: 'Ngày yêu cầu', children: new Date(formDetails.createdAt).toLocaleString() },
      { key: '6', label: 'Trạng thái', children: getStatusBadge(formDetails.status, formDetails.resultStatus) },
    ];
    
    const teacherItems = formDetails.requestedRole === 'TEACHER' ? [
      { key: 't1', label: 'Trình độ', children: formDetails.qualifications || 'N/A' },
      { key: 't2', label: 'Kinh nghiệm', children: formDetails.experience || 'N/A' },
      { key: 't3', label: 'Môn dạy', children: formDetails.subjects || 'N/A' },
      { 
        key: 't4', 
        label: 'File CV', 
        children: formDetails.cvFileUrl ? (
          <a href={formDetails.cvFileUrl} target="_blank" rel="noopener noreferrer">
            Xem CV
          </a>
        ) : 'Không có'
      },
      { key: 't5', label: 'Thông tin thêm', children: formDetails.additionalInfo || 'N/A', span: 2 },
    ] : [];

    const studentItems = formDetails.requestedRole === 'STUDENT' ? [
      { key: 's1', label: 'Lớp/Khối', children: formDetails.grade || 'N/A' },
      { key: 's2', label: 'Liên hệ phụ huynh', children: formDetails.parentContact || 'N/A' },
      { key: 's3', label: 'Thông tin thêm', children: formDetails.additionalInfo || 'N/A', span: 2 },
    ] : [];
    
    const allItems = [...commonItems, ...teacherItems, ...studentItems];
    
    return <Descriptions bordered column={2} items={allItems} />;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Vai trò',
      dataIndex: 'requestedRole',
      key: 'requestedRole',
      render: (role) => (role === 'TEACHER' ? 'Giáo viên' : 'Học sinh'),
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Ngày Yêu Cầu',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusBadge(status, selectedRequest?.resultStatus),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button icon={<InfoCircleOutlined />} onClick={() => showDetailModal(record)} />
          </Tooltip>
          {record.status === 'PENDING' && (
            <>
              <Tooltip title="Phê duyệt">
                <Button type="primary" icon={<CheckOutlined />} onClick={(e) => showApproveModal(e, record.id)} />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button type="primary" danger icon={<CloseOutlined />} onClick={(e) => showRejectModal(e, record.id)} />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Danh Sách Yêu Cầu</h1>
      <Table 
        columns={columns} 
        dataSource={requests.map((req) => ({ ...req, key: req.id }))}
        loading={loading}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => showDetailModal(record),
        })}
        rowClassName="cursor-pointer"
      />

      {/* Approve Modal */}
      <Modal
        title="Phê duyệt yêu cầu"
        open={approveModalVisible}
        onOk={handleApprove}
        onCancel={() => setApproveModalVisible(false)}
        okText="Phê duyệt"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn phê duyệt yêu cầu này và tạo tài khoản cho người dùng không?</p>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ Chối Yêu Cầu"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="Từ chối"
        cancelText="Hủy"
      >
        <p>Vui lòng nhập lý do từ chối yêu cầu này. Lý do sẽ được gửi đến người dùng.</p>
        <Form layout="vertical">
            <Form.Item label="Lý do từ chối" required>
                <Input.TextArea 
          rows={4}
          value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)} 
        />
            </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi Tiết Yêu Cầu"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {renderDetailContent()}
      </Modal>
    </div>
  );
};

export default RequestList; 