import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    DownloadOutlined,
    EditOutlined,
    ExportOutlined,
    EyeOutlined,
    FileTextOutlined,
    FilterOutlined,
    FolderOpenOutlined,
    PlusOutlined,
    UploadOutlined
} from '@ant-design/icons';
import {
    App as AntApp,
    Badge,
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tabs,
    Tag,
    Tooltip,
    Typography,
    Upload
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import accountantEvidenceService from '../../services/AccountantEvidenceService';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const AccountantEvidencePage = () => {
  const navigate = useNavigate();
  const { message: messageApi } = AntApp.useApp();
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({});
  const [evidenceList, setEvidenceList] = useState([]);
  const [filteredEvidence, setFilteredEvidence] = useState([]);
  const [pendingReview, setPendingReview] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [reviewedByMe, setReviewedByMe] = useState([]);
  const [allReviewed, setAllReviewed] = useState([]);
  
  // Modal states
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [bulkUploadModalVisible, setBulkUploadModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  
  // Selected data
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [selectedViolationId, setSelectedViolationId] = useState(null);
  
  // Forms
  const [uploadForm] = Form.useForm();
  const [bulkUploadForm] = Form.useForm();
  const [notesForm] = Form.useForm();
  
  // Filters
  const [dateRange, setDateRange] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Validate violationId exists before upload
  const preValidateViolationId = async (violationId) => {
    try {
      if (!violationId || Number.isNaN(Number(violationId))) {
        messageApi.error('Mã vi phạm phải là số hợp lệ');
        return false;
      }
      // This API returns 400 if violationId không tồn tại
      await accountantEvidenceService.getEvidenceByViolation(Number(violationId));
      return true;
    } catch (err) {
      messageApi.error(`Không tìm thấy vi phạm với ID: ${violationId}`);
      return false;
    }
  };

  useEffect(() => {
    // Prefill violationId from query if present
    try {
      const url = new URL(window.location.href);
      const vId = url.searchParams.get('violationId');
      if (vId) {
        setSelectedViolationId(vId);
        // prefill upload forms
        const vNum = Number(vId);
        if (!Number.isNaN(vNum)) {
          uploadForm?.setFieldsValue({ violationId: vNum });
          bulkUploadForm?.setFieldsValue({ violationId: vNum });
        }
      }
    } catch (_) {}

    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      const statsResponse = await accountantEvidenceService.getStatistics();
      setStatistics(statsResponse.data);
      
      // Load my uploads
      const uploadsResponse = await accountantEvidenceService.getMyUploads();
      setEvidenceList(uploadsResponse.data);
      setFilteredEvidence(uploadsResponse.data);
      
      // Load pending review
      const pendingResponse = await accountantEvidenceService.getPendingReview();
      setPendingReview(pendingResponse.data);
      
      // Load templates
      const templatesResponse = await accountantEvidenceService.getTemplates();
      setTemplates(templatesResponse.data);

      // Load reviewed-by-me list
      const reviewedResp = await accountantEvidenceService.getReviewedByMe();
      setReviewedByMe(reviewedResp.data || []);

      // Load all reviewed overview
      const allReviewedResp = await accountantEvidenceService.getAllReviewed();
      setAllReviewed(allReviewedResp.data || []);
      
    } catch (error) {
      messageApi.error('Không thể tải dữ liệu');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (values) => {
    try {
      setLoading(true);
      const ok = await preValidateViolationId(values.violationId);
      if (!ok) { setLoading(false); return; }
      
      const formData = new FormData();
      // Use violationId from the form input instead of a placeholder
      formData.append('violationId', values.violationId);
      const fileList = values.file;
      if (!fileList || fileList.length === 0) {
        messageApi.error('Vui lòng chọn file');
        setLoading(false);
        return;
      }
      formData.append('file', fileList[0].originFileObj);
      formData.append('description', values.description);
      formData.append('evidenceType', values.evidenceType);
      formData.append('category', values.category);
      
      const response = await accountantEvidenceService.uploadSupportingEvidence(formData);
      
      if (response.data) {
        messageApi.success('Tải lên minh chứng thành công');
        setUploadModalVisible(false);
        uploadForm.resetFields();
        loadData();
      }
      
    } catch (error) {
      messageApi.error('Lỗi khi tải lên minh chứng');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (values) => {
    try {
      setLoading(true);
      const ok = await preValidateViolationId(values.violationId);
      if (!ok) { setLoading(false); return; }
      
      const formData = new FormData();
      // Use violationId provided by the form for bulk upload
      formData.append('violationId', values.violationId);
      formData.append('category', values.category);
      
      const fileList = values.files || [];
      if (!fileList.length) {
        messageApi.error('Vui lòng chọn ít nhất 1 file');
        setLoading(false);
        return;
      }
      fileList.forEach(file => {
        formData.append('files', file.originFileObj);
      });
      
      if (values.descriptions) {
        values.descriptions.forEach(desc => {
          formData.append('descriptions', desc);
        });
      }
      
      const response = await accountantEvidenceService.bulkUploadEvidence(formData);
      
      if (response.data) {
        messageApi.success(`Đã tải lên ${response.data.length} files thành công`);
        setBulkUploadModalVisible(false);
        bulkUploadForm.resetFields();
        loadData();
      }
      
    } catch (error) {
      messageApi.error('Lỗi khi tải lên nhiều files');
      console.error('Bulk upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNotes = async (values) => {
    try {
      setLoading(true);
      
      await accountantEvidenceService.addNotes(selectedEvidence.id, values.notes);
      messageApi.success('Đã thêm ghi chú thành công');
      
      setNotesModalVisible(false);
      notesForm.resetFields();
      loadData();
      
    } catch (error) {
      messageApi.error('Lỗi khi thêm ghi chú');
      console.error('Add notes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = async (evidenceId) => {
    try {
      await accountantEvidenceService.markAsReviewed(evidenceId);
      messageApi.success('Đã đánh dấu đã xem xét');
      loadData();
    } catch (error) {
      messageApi.error('Lỗi khi đánh dấu đã xem xét');
    }
  };

  const handleDelete = async (evidenceId) => {
    try {
      await accountantEvidenceService.deleteEvidence(evidenceId);
      messageApi.success('Đã xóa minh chứng thành công');
      loadData();
    } catch (error) {
      messageApi.error('Lỗi khi xóa minh chứng');
    }
  };

  const handleDownload = async (evidenceId) => {
    try {
      const response = await accountantEvidenceService.generateDownloadUrl(evidenceId);
      window.open(response.data, '_blank');
    } catch (error) {
      messageApi.error('Lỗi khi tải xuống file');
    }
  };

  const handleExportReport = async (format = 'pdf') => {
    try {
      setLoading(true);
      const response = await accountantEvidenceService.exportReport(format, {
        startDate: dateRange[0]?.format('YYYY-MM-DD'),
        endDate: dateRange[1]?.format('YYYY-MM-DD')
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `evidence-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      messageApi.success('Đã xuất báo cáo thành công');
      
    } catch (error) {
      messageApi.error('Lỗi khi xuất báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...evidenceList];
    
    if (dateRange.length === 2) {
      filtered = filtered.filter(item => {
        const createdAt = moment(item.createdAt);
        return createdAt.isBetween(dateRange[0], dateRange[1], 'day', '[]');
      });
    }
    
    if (typeFilter) {
      filtered = filtered.filter(item => item.evidenceType === typeFilter);
    }
    
    if (statusFilter) {
      const isVerified = statusFilter === 'verified';
      filtered = filtered.filter(item => item.isVerified === isVerified);
    }
    
    if (categoryFilter) {
      filtered = filtered.filter(item => 
        item.description && item.description.includes(`[${categoryFilter}]`)
      );
    }
    
    setFilteredEvidence(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [dateRange, typeFilter, statusFilter, categoryFilter, evidenceList]);

  const evidenceColumns = [
    {
      title: 'Tên File',
      dataIndex: 'originalFilename',
      key: 'filename',
      render: (text, record) => (
        <Space>
          <FileTextOutlined style={{ color: record.isImage ? '#52c41a' : '#1890ff' }} />
          <Text>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'evidenceType',
      key: 'type',
      render: (type) => {
        const colors = {
          'DOCUMENT': 'blue',
          'IMAGE': 'green', 
          'MEDICAL_CERTIFICATE': 'orange',
          'OFFICIAL_LETTER': 'purple',
          'RECEIPT': 'cyan'
        };
        return <Tag color={colors[type]}>{type}</Tag>;
      }
    },
    {
      title: 'Kích thước',
      dataIndex: 'formattedFileSize',
      key: 'size'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isVerified',
      key: 'status',
      render: (isVerified) => (
        <Badge 
          status={isVerified ? 'success' : 'processing'} 
          text={isVerified ? 'Đã xem xét' : 'Chờ xem xét'} 
        />
      )
    },
    {
      title: 'Ngày tải lên',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => {
                setSelectedEvidence(record);
                setViewModalVisible(true);
              }}
            />
          </Tooltip>
          
          <Tooltip title="Thêm ghi chú">
            <Button 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => {
                setSelectedEvidence(record);
                setNotesModalVisible(true);
              }}
            />
          </Tooltip>
          
          {!record.isVerified && (
            <Tooltip title="Đánh dấu đã xem xét">
              <Button 
                icon={<CheckCircleOutlined />} 
                size="small"
                type="primary"
                onClick={() => handleMarkReviewed(record.id)}
              />
            </Tooltip>
          )}
          
          <Tooltip title="Tải xuống">
            <Button 
              icon={<DownloadOutlined />} 
              size="small"
              onClick={() => handleDownload(record.id)}
            />
          </Tooltip>
          
          <Popconfirm 
            title="Bạn có chắc muốn xóa file này?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xóa">
              <Button 
                icon={<DeleteOutlined />} 
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const pendingColumns = [
    {
      title: 'File',
      dataIndex: 'originalFilename',
      key: 'filename',
      render: (text, record) => (
        <Space>
          <FileTextOutlined />
          <Text>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Loại vi phạm',
      dataIndex: 'description',
      key: 'violation',
      render: (text) => <Text ellipsis style={{ maxWidth: 200 }}>{text}</Text>
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleMarkReviewed(record.id)}
          >
            Xem xét
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý Minh chứng Hỗ trợ</Title>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng số files đã tải"
              value={statistics.totalUploaded || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Chờ xem xét"
              value={statistics.pendingReview || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã xem xét"
              value={statistics.reviewedByMe || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng dung lượng"
              value="0 MB"
              prefix={<FolderOpenOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setUploadModalVisible(true)}
          >
            Tải lên minh chứng
          </Button>
        </Col>
        <Col>
          <Button 
            icon={<UploadOutlined />}
            onClick={() => setBulkUploadModalVisible(true)}
          >
            Tải lên nhiều files
          </Button>
        </Col>
        <Col>
          <Button 
            icon={<ExportOutlined />}
            onClick={() => handleExportReport('pdf')}
          >
            Xuất báo cáo PDF
          </Button>
        </Col>
        <Col>
          <Button 
            icon={<ExportOutlined />}
            onClick={() => handleExportReport('excel')}
          >
            Xuất Excel
          </Button>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Tabs defaultActiveKey="1" type="card">
        <TabPane tab="Minh chứng của tôi" key="1">
          {/* Filters */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8}>
                <RangePicker
                  placeholder={['Từ ngày', 'Đến ngày']}
                  onChange={setDateRange}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} sm={4}>
                <Select
                  placeholder="Loại file"
                  allowClear
                  style={{ width: '100%' }}
                  onChange={setTypeFilter}
                  options={[
                    { label: 'Tài liệu', value: 'DOCUMENT' },
                    { label: 'Hình ảnh', value: 'IMAGE' },
                    { label: 'Giấy khám bệnh', value: 'MEDICAL_CERTIFICATE' },
                    { label: 'Công văn', value: 'OFFICIAL_LETTER' },
                    { label: 'Hóa đơn', value: 'RECEIPT' }
                  ]}
                />
              </Col>
              <Col xs={24} sm={4}>
                <Select
                  placeholder="Trạng thái"
                  allowClear
                  style={{ width: '100%' }}
                  onChange={setStatusFilter}
                  options={[
                    { label: 'Đã xem xét', value: 'verified' },
                    { label: 'Chờ xem xét', value: 'pending' }
                  ]}
                />
              </Col>
              <Col xs={24} sm={4}>
                <Select
                  placeholder="Danh mục"
                  allowClear
                  style={{ width: '100%' }}
                  onChange={setCategoryFilter}
                  options={[
                    { label: 'Điểm danh', value: 'ATTENDANCE' },
                    { label: 'Lương', value: 'PAYROLL' },
                    { label: 'Hợp đồng', value: 'CONTRACT' },
                    { label: 'Khác', value: 'OTHER' }
                  ]}
                />
              </Col>
              <Col xs={24} sm={4}>
                <Button 
                  icon={<FilterOutlined />} 
                  onClick={applyFilters}
                  style={{ width: '100%' }}
                >
                  Lọc
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Evidence Table */}
          <Card>
            <Table
              columns={evidenceColumns}
              dataSource={filteredEvidence}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Tổng ${total} items`
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab={`Cần xem xét (${pendingReview.length})`} key="2">
          <Card>
            <Table
              columns={pendingColumns}
              dataSource={pendingReview}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab={`Đã xem xét bởi tôi (${reviewedByMe.length})`} key="3">
          <Card>
            <Table
              columns={evidenceColumns}
              dataSource={reviewedByMe}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab={`Tổng đã xem xét (${allReviewed.length})`} key="4">
          <Card>
            <Table
              columns={evidenceColumns}
              dataSource={allReviewed}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        {templates && templates.length > 0 && (
          <TabPane tab="Mẫu biểu" key="5">
            <Row gutter={[16, 16]}>
              {templates.map((template, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                  <Card
                    hoverable
                    cover={
                      <div style={{ padding: 20, textAlign: 'center' }}>
                        <FileTextOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                      </div>
                    }
                    actions={[
                      <DownloadOutlined key="download" onClick={() => window.open(template.downloadUrl)} />
                    ]}
                  >
                    <Card.Meta
                      title={template.name}
                      description={template.description}
                    />
                    <Tag color="blue" style={{ marginTop: 8 }}>
                      {template.category}
                    </Tag>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>
        )}
      </Tabs>

      {/* Upload Modal */}
      <Modal
        title="Tải lên minh chứng hỗ trợ"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={uploadForm}
          layout="vertical"
          onFinish={handleUpload}
        >
          <Form.Item
            name="violationId"
            label="Mã vi phạm"
            rules={[
              { required: true, message: 'Vui lòng nhập mã vi phạm' },
              { type: 'number', transform: (v) => (typeof v === 'string' ? Number(v) : v), message: 'Mã vi phạm phải là số' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1} placeholder="Nhập ID vi phạm (số)" />
          </Form.Item>

          <Form.Item
            name="file"
            label="Chọn file"
            rules={[{ required: true, message: 'Vui lòng chọn file' }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            >
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select placeholder="Chọn danh mục">
              <Select.Option value="ATTENDANCE">Điểm danh</Select.Option>
              <Select.Option value="PAYROLL">Lương</Select.Option>
              <Select.Option value="CONTRACT">Hợp đồng</Select.Option>
              <Select.Option value="MEDICAL">Y tế</Select.Option>
              <Select.Option value="OTHER">Khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="evidenceType"
            label="Loại minh chứng"
            rules={[{ required: true, message: 'Vui lòng chọn loại minh chứng' }]}
          >
            <Select placeholder="Chọn loại minh chứng">
              <Select.Option value="DOCUMENT">Tài liệu</Select.Option>
              <Select.Option value="IMAGE">Hình ảnh</Select.Option>
              <Select.Option value="MEDICAL_CERTIFICATE">Giấy khám bệnh</Select.Option>
              <Select.Option value="OFFICIAL_LETTER">Công văn</Select.Option>
              <Select.Option value="RECEIPT">Hóa đơn/Biên lai</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea 
              rows={3} 
              placeholder="Mô tả chi tiết về minh chứng..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tải lên
              </Button>
              <Button onClick={() => setUploadModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        title="Tải lên nhiều files"
        open={bulkUploadModalVisible}
        onCancel={() => setBulkUploadModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={bulkUploadForm}
          layout="vertical"
          onFinish={handleBulkUpload}
        >
          <Form.Item
            name="violationId"
            label="Mã vi phạm"
            rules={[
              { required: true, message: 'Vui lòng nhập mã vi phạm' },
              { type: 'number', transform: (v) => (typeof v === 'string' ? Number(v) : v), message: 'Mã vi phạm phải là số' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1} placeholder="Nhập ID vi phạm (số)" />
          </Form.Item>

          <Form.Item
            name="files"
            label="Chọn nhiều files"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 file' }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
          >
            <Upload
              beforeUpload={() => false}
              multiple
              maxCount={10}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            >
              <Button icon={<UploadOutlined />}>Chọn nhiều files</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="category"
            label="Danh mục chung"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select placeholder="Chọn danh mục cho tất cả files">
              <Select.Option value="ATTENDANCE">Điểm danh</Select.Option>
              <Select.Option value="PAYROLL">Lương</Select.Option>
              <Select.Option value="CONTRACT">Hợp đồng</Select.Option>
              <Select.Option value="MEDICAL">Y tế</Select.Option>
              <Select.Option value="OTHER">Khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tải lên tất cả
              </Button>
              <Button onClick={() => setBulkUploadModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        title="Chi tiết minh chứng"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedEvidence && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>Tên file:</strong> {selectedEvidence.originalFilename}
              </Col>
              <Col span={12}>
                <strong>Loại:</strong> <Tag>{selectedEvidence.evidenceType}</Tag>
              </Col>
              <Col span={12}>
                <strong>Kích thước:</strong> {selectedEvidence.formattedFileSize}
              </Col>
              <Col span={12}>
                <strong>Trạng thái:</strong> 
                <Badge 
                  status={selectedEvidence.isVerified ? 'success' : 'processing'} 
                  text={selectedEvidence.isVerified ? 'Đã xem xét' : 'Chờ xem xét'} 
                />
              </Col>
              <Col span={24}>
                <strong>Mô tả:</strong>
                <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
                  {selectedEvidence.description || 'Không có mô tả'}
                </div>
              </Col>
              <Col span={12}>
                <strong>Ngày tải lên:</strong> {moment(selectedEvidence.createdAt).format('DD/MM/YYYY HH:mm')}
              </Col>
              <Col span={12}>
                <strong>IP:</strong> {selectedEvidence.uploadIp || 'N/A'}
              </Col>
            </Row>
            
            {selectedEvidence.isImage && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <img 
                  src={selectedEvidence.fileUrl} 
                  alt={selectedEvidence.originalFilename}
                  style={{ maxWidth: '100%', maxHeight: 400 }}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Notes Modal */}
      <Modal
        title="Thêm ghi chú"
        open={notesModalVisible}
        onCancel={() => setNotesModalVisible(false)}
        footer={null}
      >
        <Form
          form={notesForm}
          layout="vertical"
          onFinish={handleAddNotes}
        >
          <Form.Item
            name="notes"
            label="Ghi chú của kế toán"
            rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập ghi chú, nhận xét về minh chứng này..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Lưu ghi chú
              </Button>
              <Button onClick={() => setNotesModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountantEvidencePage;