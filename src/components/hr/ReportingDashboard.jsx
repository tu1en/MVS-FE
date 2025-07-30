import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Select, Input, Space, Tag, Modal, Form, message, Tabs, Progress } from 'antd';
import { FileTextOutlined, DownloadOutlined, EyeOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';

const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

/**
 * Component dashboard báo cáo HR
 */
const ReportingDashboard = ({ userRole = 'EMPLOYEE' }) => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [completedReports, setCompletedReports] = useState([]);
  const [activeTab, setActiveTab] = useState('templates');
  const [generateModal, setGenerateModal] = useState({
    visible: false,
    template: null
  });
  const [form] = Form.useForm();

  // Load data on component mount
  useEffect(() => {
    loadTemplates();
    loadMyReports();
    if (userRole === 'MANAGER' || userRole === 'ADMIN') {
      loadCompletedReports();
    }
  }, [userRole]);

  // Load accessible templates
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/hr/reports/templates/accessible');
      setTemplates(response.data.content);
    } catch (error) {
      console.error('Error loading templates:', error);
      message.error('Lỗi khi tải danh sách mẫu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  // Load user's reports
  const loadMyReports = async () => {
    try {
      const response = await axios.get('/api/hr/reports/my');
      setMyReports(response.data.content);
    } catch (error) {
      console.error('Error loading my reports:', error);
      message.error('Lỗi khi tải báo cáo của tôi');
    }
  };

  // Load completed reports (for managers/admins)
  const loadCompletedReports = async () => {
    try {
      const response = await axios.get('/api/hr/reports/completed');
      setCompletedReports(response.data.content);
    } catch (error) {
      console.error('Error loading completed reports:', error);
      message.error('Lỗi khi tải báo cáo đã hoàn thành');
    }
  };

  // Handle generate report
  const handleGenerateReport = (template) => {
    setGenerateModal({
      visible: true,
      template: template
    });
    form.resetFields();
  };

  // Submit generate report
  const handleSubmitGenerate = async (values) => {
    try {
      const { template } = generateModal;
      const response = await axios.post('/api/hr/reports/generate-async', values.parameters || {}, {
        params: {
          templateId: template.id,
          format: values.format || 'PDF'
        }
      });

      message.success('Báo cáo đang được tạo. Vui lòng kiểm tra trong tab "Báo cáo của tôi"');
      setGenerateModal({ visible: false, template: null });
      loadMyReports();
    } catch (error) {
      console.error('Error generating report:', error);
      message.error('Lỗi khi tạo báo cáo');
    }
  };

  // Handle download report
  const handleDownloadReport = async (reportId, reportName) => {
    try {
      const response = await axios.get(`/api/hr/reports/${reportId}/download`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', reportName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('Tải báo cáo thành công');
    } catch (error) {
      console.error('Error downloading report:', error);
      message.error('Lỗi khi tải báo cáo');
    }
  };

  // Handle delete report
  const handleDeleteReport = async (reportId) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa báo cáo này?',
      onOk: async () => {
        try {
          await axios.delete(`/api/hr/reports/${reportId}`);
          message.success('Xóa báo cáo thành công');
          loadMyReports();
        } catch (error) {
          console.error('Error deleting report:', error);
          message.error('Lỗi khi xóa báo cáo');
        }
      }
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'GENERATING': 'blue',
      'COMPLETED': 'green',
      'FAILED': 'red',
      'EXPIRED': 'orange',
      'CANCELLED': 'default'
    };
    return colors[status] || 'default';
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'ATTENDANCE': 'blue',
      'PAYROLL': 'green',
      'VIOLATION': 'red',
      'PERFORMANCE': 'purple',
      'SUMMARY': 'orange',
      'ANALYTICS': 'cyan'
    };
    return colors[category] || 'default';
  };

  // Templates table columns
  const templateColumns = [
    {
      title: 'Tên mẫu báo cáo',
      dataIndex: 'templateName',
      key: 'templateName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <small style={{ color: '#666' }}>{record.description}</small>
        </div>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: 'reportCategory',
      key: 'reportCategory',
      render: (category) => (
        <Tag color={getCategoryColor(category)}>
          {category}
        </Tag>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'reportType',
      key: 'reportType',
      render: (type) => <Tag>{type}</Tag>
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            size="small"
            onClick={() => handleGenerateReport(record)}
          >
            Tạo báo cáo
          </Button>
        </Space>
      )
    }
  ];

  // My reports table columns
  const myReportsColumns = [
    {
      title: 'Tên báo cáo',
      dataIndex: 'reportName',
      key: 'reportName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <small style={{ color: '#666' }}>
            Từ mẫu: {record.template?.templateName}
          </small>
        </div>
      )
    },
    {
      title: 'Định dạng',
      dataIndex: 'format',
      key: 'format',
      render: (format) => <Tag>{format}</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <div>
          <Tag color={getStatusColor(status)}>
            {status}
          </Tag>
          {status === 'GENERATING' && (
            <Progress
              percent={50}
              size="small"
              status="active"
              showInfo={false}
              style={{ width: 100, marginTop: 4 }}
            />
          )}
        </div>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Kích thước',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size, record) => record.getFormattedFileSize?.() || (size ? `${(size / 1024).toFixed(1)} KB` : '-')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'COMPLETED' && (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size="small"
              onClick={() => handleDownloadReport(record.id, record.getSuggestedFilename?.() || record.reportName)}
            >
              Tải xuống
            </Button>
          )}
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteReport(record.id)}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  // Completed reports columns (for managers/admins)
  const completedReportsColumns = [
    {
      title: 'Tên báo cáo',
      dataIndex: 'reportName',
      key: 'reportName'
    },
    {
      title: 'Người tạo',
      key: 'generatedBy',
      render: (_, record) => (
        <div>
          <div>{record.generatedBy?.fullName}</div>
          <small style={{ color: '#666' }}>{record.generatedBy?.email}</small>
        </div>
      )
    },
    {
      title: 'Định dạng',
      dataIndex: 'format',
      key: 'format',
      render: (format) => <Tag>{format}</Tag>
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Lượt tải',
      dataIndex: 'downloadCount',
      key: 'downloadCount',
      align: 'center'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size="small"
            onClick={() => handleDownloadReport(record.id, record.getSuggestedFilename?.() || record.reportName)}
          >
            Tải xuống
          </Button>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              // View report details
              Modal.info({
                title: 'Chi tiết báo cáo',
                width: 600,
                content: (
                  <div>
                    <p><strong>Tên báo cáo:</strong> {record.reportName}</p>
                    <p><strong>Mẫu báo cáo:</strong> {record.template?.templateName}</p>
                    <p><strong>Người tạo:</strong> {record.generatedBy?.fullName}</p>
                    <p><strong>Ngày tạo:</strong> {moment(record.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                    <p><strong>Thời gian tạo:</strong> {record.getGenerationDurationSeconds?.()}s</p>
                    <p><strong>Số bản ghi:</strong> {record.recordCount}</p>
                    <p><strong>Kích thước:</strong> {record.getFormattedFileSize?.()}</p>
                    <p><strong>Lượt tải:</strong> {record.downloadCount}</p>
                    <p><strong>Hết hạn:</strong> {record.getTimeUntilExpiration?.()}</p>
                  </div>
                )
              });
            }}
          >
            Xem
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard Báo cáo</h2>
        {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
          <Button type="primary" icon={<PlusOutlined />}>
            Tạo mẫu báo cáo
          </Button>
        )}
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Mẫu báo cáo" key="templates">
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Search
                placeholder="Tìm kiếm mẫu báo cáo..."
                allowClear
                style={{ width: 300 }}
                onSearch={(value) => {
                  // TODO: Implement search
                  console.log('Search:', value);
                }}
              />
            </div>
            <Table
              columns={templateColumns}
              dataSource={templates}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} mẫu báo cáo`
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Báo cáo của tôi" key="my-reports">
          <Card>
            <Table
              columns={myReportsColumns}
              dataSource={myReports}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} báo cáo`
              }}
            />
          </Card>
        </TabPane>

        {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
          <TabPane tab="Tất cả báo cáo" key="all-reports">
            <Card>
              <Table
                columns={completedReportsColumns}
                dataSource={completedReports}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} của ${total} báo cáo`
                }}
              />
            </Card>
          </TabPane>
        )}
      </Tabs>

      {/* Generate Report Modal */}
      <Modal
        title={`Tạo báo cáo: ${generateModal.template?.templateName}`}
        visible={generateModal.visible}
        onCancel={() => setGenerateModal({ visible: false, template: null })}
        footer={null}
        width={600}
      >
        {generateModal.template && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmitGenerate}
          >
            <Form.Item
              name="format"
              label="Định dạng báo cáo"
              initialValue="PDF"
            >
              <Select>
                <Option value="PDF">PDF</Option>
                <Option value="EXCEL">Excel</Option>
                <Option value="CSV">CSV</Option>
                <Option value="JSON">JSON</Option>
              </Select>
            </Form.Item>

            {generateModal.template.hasParameters && (
              <Form.Item
                name="parameters"
                label="Tham số báo cáo"
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Nhập tham số dưới dạng JSON (tùy chọn)"
                />
              </Form.Item>
            )}

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Tạo báo cáo
                </Button>
                <Button onClick={() => setGenerateModal({ visible: false, template: null })}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ReportingDashboard;
