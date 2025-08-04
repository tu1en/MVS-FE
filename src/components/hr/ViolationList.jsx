import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, message, Pagination, Select, DatePicker, Input } from 'antd';
import { EyeOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

/**
 * Component hiển thị danh sách vi phạm chấm công
 */
const ViolationList = ({ userId, isManager = false }) => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: null,
    violationType: null,
    dateRange: null,
    search: null
  });

  // Load violations data
  const loadViolations = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = {
        page: page - 1,
        size: pageSize,
        sortBy: 'violationDate',
        sortDir: 'desc'
      };

      // Add filters
      if (filters.status) params.status = filters.status;
      if (filters.violationType) params.violationType = filters.violationType;
      if (filters.dateRange) {
        params.startDate = filters.dateRange[0].format('YYYY-MM-DD');
        params.endDate = filters.dateRange[1].format('YYYY-MM-DD');
      }

      const endpoint = isManager 
        ? '/api/hr/violations/pending-review'
        : '/api/hr/violations/my';
      
      const response = await axios.get(endpoint, { params });
      
      setViolations(response.data.content);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.data.totalElements
      });
    } catch (error) {
      console.error('Error loading violations:', error);
      message.error('Lỗi khi tải danh sách vi phạm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadViolations();
  }, [filters]);

  // Handle pagination change
  const handleTableChange = (pagination) => {
    loadViolations(pagination.current, pagination.pageSize);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'PENDING_EXPLANATION': 'red',
      'EXPLANATION_SUBMITTED': 'blue',
      'UNDER_REVIEW': 'orange',
      'APPROVED': 'green',
      'REJECTED': 'red',
      'RESOLVED': 'green',
      'ESCALATED': 'purple'
    };
    return colors[status] || 'default';
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    const colors = {
      'MINOR': 'blue',
      'MODERATE': 'orange',
      'MAJOR': 'red',
      'CRITICAL': 'purple'
    };
    return colors[severity] || 'default';
  };

  // Get violation type description
  const getViolationTypeDescription = (type) => {
    const descriptions = {
      'LATE_ARRIVAL': 'Đi trễ',
      'EARLY_DEPARTURE': 'Về sớm',
      'MISSING_CHECK_IN': 'Thiếu chấm công vào',
      'MISSING_CHECK_OUT': 'Thiếu chấm công ra',
      'ABSENT_WITHOUT_LEAVE': 'Vắng không phép'
    };
    return descriptions[type] || type;
  };

  // Handle view violation details
  const handleViewDetails = (violation) => {
    Modal.info({
      title: 'Chi tiết vi phạm',
      width: 600,
      content: (
        <div>
          <p><strong>Nhân viên:</strong> {violation.userFullName}</p>
          <p><strong>Ngày vi phạm:</strong> {moment(violation.violationDate).format('DD/MM/YYYY')}</p>
          <p><strong>Loại vi phạm:</strong> {getViolationTypeDescription(violation.violationType)}</p>
          <p><strong>Độ nghiêm trọng:</strong> 
            <Tag color={getSeverityColor(violation.severity)} style={{ marginLeft: 8 }}>
              {violation.severity}
            </Tag>
          </p>
          <p><strong>Thời gian dự kiến:</strong> {violation.expectedTime}</p>
          <p><strong>Thời gian thực tế:</strong> {violation.actualTime || 'Không có'}</p>
          <p><strong>Chênh lệch:</strong> {violation.deviationMinutes} phút</p>
          <p><strong>Mô tả hệ thống:</strong> {violation.systemDescription}</p>
          <p><strong>Trạng thái:</strong> 
            <Tag color={getStatusColor(violation.status)} style={{ marginLeft: 8 }}>
              {violation.statusDescription}
            </Tag>
          </p>
          {violation.hasExplanation && (
            <p><strong>Có giải trình:</strong> 
              <Tag color="blue" style={{ marginLeft: 8 }}>
                {violation.explanationCount} giải trình
              </Tag>
            </p>
          )}
        </div>
      )
    });
  };

  // Handle submit explanation
  const handleSubmitExplanation = (violation) => {
    // This would open the ExplanationForm component
    Modal.confirm({
      title: 'Gửi giải trình',
      content: 'Bạn có muốn gửi giải trình cho vi phạm này?',
      onOk: () => {
        // Navigate to explanation form or open modal
        window.location.href = `/hr/explanations/create?violationId=${violation.id}`;
      }
    });
  };

  // Table columns
  const columns = [
    {
      title: 'Ngày vi phạm',
      dataIndex: 'violationDate',
      key: 'violationDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: true
    },
    {
      title: 'Loại vi phạm',
      dataIndex: 'violationType',
      key: 'violationType',
      render: (type) => (
        <Tag color="blue">
          {getViolationTypeDescription(type)}
        </Tag>
      )
    },
    {
      title: 'Độ nghiêm trọng',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>
          {severity}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Tag color={getStatusColor(status)}>
          {record.statusDescription}
        </Tag>
      )
    },
    {
      title: 'Chênh lệch',
      dataIndex: 'deviationMinutes',
      key: 'deviationMinutes',
      render: (minutes) => minutes ? `${minutes} phút` : '-'
    },
    {
      title: 'Giải trình',
      key: 'explanation',
      render: (_, record) => (
        <div>
          {record.hasExplanation ? (
            <Tag color="green">{record.explanationCount} giải trình</Tag>
          ) : (
            <Tag color="red">Chưa có</Tag>
          )}
          {record.isOverdueForExplanation && (
            <Tag color="red">Quá hạn</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Xem
          </Button>
          {record.canBeExplained && !isManager && (
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => handleSubmitExplanation(record)}
            >
              Giải trình
            </Button>
          )}
        </Space>
      )
    }
  ];

  // Add user column for manager view
  if (isManager) {
    columns.splice(1, 0, {
      title: 'Nhân viên',
      dataIndex: 'userFullName',
      key: 'userFullName',
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <small style={{ color: '#666' }}>{record.userEmail}</small>
        </div>
      )
    });
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => handleFilterChange('status', value)}
          >
            <Option value="PENDING_EXPLANATION">Chờ giải trình</Option>
            <Option value="EXPLANATION_SUBMITTED">Đã gửi giải trình</Option>
            <Option value="UNDER_REVIEW">Đang xem xét</Option>
            <Option value="APPROVED">Đã duyệt</Option>
            <Option value="REJECTED">Từ chối</Option>
            <Option value="RESOLVED">Đã giải quyết</Option>
          </Select>

          <Select
            placeholder="Lọc theo loại vi phạm"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => handleFilterChange('violationType', value)}
          >
            <Option value="LATE_ARRIVAL">Đi trễ</Option>
            <Option value="EARLY_DEPARTURE">Về sớm</Option>
            <Option value="MISSING_CHECK_IN">Thiếu chấm công vào</Option>
            <Option value="MISSING_CHECK_OUT">Thiếu chấm công ra</Option>
            <Option value="ABSENT_WITHOUT_LEAVE">Vắng không phép</Option>
          </Select>

          <RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            onChange={(dates) => handleFilterChange('dateRange', dates)}
          />

          <Button onClick={() => loadViolations()}>
            Làm mới
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={violations}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} vi phạm`
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default ViolationList;
