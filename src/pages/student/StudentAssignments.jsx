import {
    BookOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DownloadOutlined,
    ExclamationCircleOutlined,
    FileTextOutlined,
    FilterOutlined,
    ReloadOutlined,
    SearchOutlined,
    UploadOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Descriptions,
    Divider,
    Empty,
    Form,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Spin,
    Table,
    Tag,
    Typography,
    Upload
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AssignmentService from '../../services/assignmentService';
import FileUploadService from '../../services/fileUploadService';
import SubmissionService from '../../services/submissionService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * Student Assignments component - for viewing and submitting assignments
 * According to UC: "Xem và Nộp Bài Tập" in the UserRoleScreenAnalysis guide
 */
const StudentAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({}); // Store submissions by assignment ID
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [submissionDetailModalVisible, setSubmissionDetailModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [richTextContent, setRichTextContent] = useState('');
  const [form] = Form.useForm();

  // Filter and search states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classroomFilter, setClassroomFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [sortField, setSortField] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await AssignmentService.getCurrentStudentAssignments();
      console.log('📋 Fetched assignments:', data);
      console.log('📋 First assignment:', data[0]);
      setAssignments(data);
      
      // Fetch submissions for each assignment
      if (user?.id && data.length > 0) {
        const submissionPromises = data.map(assignment => 
          SubmissionService.getStudentSubmission(assignment.id, user.id)
        );
        
        const submissionResults = await Promise.allSettled(submissionPromises);
        const submissionsMap = {};
        
        submissionResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            submissionsMap[data[index].id] = result.value;
          }
        });
        
        setSubmissions(submissionsMap);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      message.error('Không thể tải danh sách bài tập');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort assignments
  const filteredAndSortedAssignments = () => {
    let filtered = assignments.filter(assignment => {
      // Search filter
      const matchesSearch = !searchText ||
        assignment.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        assignment.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        assignment.classroomName?.toLowerCase().includes(searchText.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        const now = dayjs();
        const dueDate = dayjs(assignment.dueDate);
        const submission = submissions[assignment.id];
        const hasActualSubmission = submission && (
          submission.fileSubmissionUrl ||
          submission.content ||
          (submission.attachments && submission.attachments.length > 0)
        );

        switch (statusFilter) {
          case 'submitted':
            matchesStatus = hasActualSubmission;
            break;
          case 'pending':
            matchesStatus = !hasActualSubmission && now.isBefore(dueDate);
            break;
          case 'overdue':
            matchesStatus = !hasActualSubmission && now.isAfter(dueDate);
            break;
          default:
            matchesStatus = true;
        }
      }

      // Classroom filter
      const matchesClassroom = classroomFilter === 'all' || assignment.classroomName === classroomFilter;

      // Date range filter (due date)
      const matchesDateRange = !dateRange ||
        (dayjs(assignment.dueDate).isSameOrAfter(dateRange[0], 'day') &&
         dayjs(assignment.dueDate).isSameOrBefore(dateRange[1], 'day'));

      return matchesSearch && matchesStatus && matchesClassroom && matchesDateRange;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'dueDate' || sortField === 'createdAt') {
        aValue = dayjs(aValue);
        bValue = dayjs(bValue);
        return sortOrder === 'asc' ? aValue.diff(bValue) : bValue.diff(aValue);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Get unique classrooms for filter
  const getUniqueClassrooms = () => {
    const classrooms = assignments.map(assignment => assignment.classroomName).filter(Boolean);
    return [...new Set(classrooms)];
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchText('');
    setStatusFilter('all');
    setClassroomFilter('all');
    setDateRange(null);
    setSortField('dueDate');
    setSortOrder('asc');
  };

  const getStatusTag = (assignment) => {
    const now = dayjs();
    const dueDate = dayjs(assignment.dueDate);
    const submission = submissions[assignment.id];
    
    // Kiểm tra submission có nội dung thực sự (có file đính kèm hoặc attachments)
    const hasActualSubmission = submission && (
      submission.fileSubmissionUrl || 
      submission.content || 
      (submission.attachments && submission.attachments.length > 0)
    );
    
    if (hasActualSubmission) {
      if (submission.isGraded) {
        return <Tag color="blue" icon={<CheckCircleOutlined />}>Đã chấm điểm</Tag>;
      }
      
      if (submission.isLate) {
        return <Tag color="orange" icon={<ExclamationCircleOutlined />}>Nộp muộn</Tag>;
      }
      
      return <Tag color="green" icon={<CheckCircleOutlined />}>Đã nộp</Tag>;
    }
    
    if (now.isAfter(dueDate)) {
      return <Tag color="red" icon={<ExclamationCircleOutlined />}>Quá hạn</Tag>;
    }
    
    return <Tag color="default" icon={<ClockCircleOutlined />}>Chưa nộp</Tag>;
  };

  const showAssignmentDetails = (assignment) => {
    console.log('🔍 Selected assignment:', assignment);
    console.log('🔍 fileAttachmentUrl:', assignment.fileAttachmentUrl);
    console.log('🔍 attachments:', assignment.attachments);
    setSelectedAssignment(assignment);
    setModalVisible(true);
  };

  const showSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmitModalVisible(true);
    form.resetFields();
    setFileList([]);
    setRichTextContent('');
  };

  const showSubmissionDetail = (assignment) => {
    const submission = submissions[assignment.id];
    if (submission) {
      setSelectedSubmission(submission);
      setSelectedAssignment(assignment);
      setSubmissionDetailModalVisible(true);
    }
  };

  const handleSubmit = async (values) => {
    if (fileList.length === 0 && !richTextContent.trim()) {
      message.error('Vui lòng chọn file hoặc nhập nội dung bài làm');
      return;
    }

    try {
      setSubmitting(true);
      
      // Prepare submission data
      const submissionData = {
        assignmentId: selectedAssignment.id,
        comment: values.comment || '',
        richTextContent: richTextContent || '',
        attachments: []
      };

      // Upload file if exists
      if (fileList.length > 0) {
        const file = fileList[0];
        
        return new Promise((resolve, reject) => {
          FileUploadService.uploadFile({
            file,
            onSuccess: async (uploadedFileData) => {
              try {
                console.log('File uploaded successfully:', uploadedFileData);
                
                submissionData.attachments.push({
                  fileName: uploadedFileData.name,
                  fileUrl: uploadedFileData.url,
                  fileType: uploadedFileData.type,
                  size: uploadedFileData.size
                });

                console.log('Submitting assignment data:', submissionData);
                const submissionResult = await SubmissionService.submitAssignment(submissionData);
                console.log('Submission result:', submissionResult);
                message.success('Nộp bài thành công!');
                
                setSubmitModalVisible(false);
                fetchAssignments(); // Refresh the list to update submission status
                resolve();
              } catch (submitError) {
                console.error('Error submitting assignment:', submitError);
                message.error('Có lỗi xảy ra khi lưu thông tin bài nộp');
                reject(submitError);
              }
            },
            onError: (error) => {
              console.error('Error uploading file:', error);
              message.error('Có lỗi xảy ra khi tải file lên');
              reject(error);
            },
            onProgress: (progress) => {
              console.log('Upload progress:', progress.percent);
            }
          }, `assignments/${selectedAssignment.id}`);
        });
      } else {
        // No file to upload, just submit the rich text content
        console.log('Submitting assignment data (no file):', submissionData);
        const submissionResult = await SubmissionService.submitAssignment(submissionData);
        console.log('Submission result:', submissionResult);
        message.success('Nộp bài thành công!');
        
        setSubmitModalVisible(false);
        fetchAssignments(); // Refresh the list to update submission status
      }
      
    } catch (error) {
      console.error('Error in submission process:', error);
      message.error('Có lỗi xảy ra khi nộp bài');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    beforeUpload: (file) => {
      setFileList([file]);
      return false; // Prevent automatic upload
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  const columns = [
    {
      title: 'Tên bài tập',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => showAssignmentDetails(record)}
          style={{ padding: 0, height: 'auto' }}
        >
          <FileTextOutlined style={{ marginRight: 8 }} />
          {text}
        </Button>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortDirections: ['ascend', 'descend']
    },
    {
      title: 'Khóa học',
      dataIndex: 'classroomName',
      key: 'classroomName',
      render: (text) => text || 'Chưa xác định',
      sorter: (a, b) => (a.classroomName || '').localeCompare(b.classroomName || ''),
      sortDirections: ['ascend', 'descend']
    },
    {
      title: 'Ngày giao',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => {
        if (!date) return 'Chưa có thông tin';
        const createdDate = dayjs(date);
        return createdDate.isValid() ? createdDate.format('DD/MM/YYYY') : 'Chưa có thông tin';
      },
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      sortDirections: ['ascend', 'descend']
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => (
        <Space>
          <ClockCircleOutlined />
          {dayjs(date).format('DD/MM/YYYY HH:mm')}
        </Space>
      ),
      sorter: (a, b) => dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix(),
      sortDirections: ['ascend', 'descend']
    },
    {
      title: 'Điểm tối đa',
      dataIndex: 'points',
      key: 'points',
      render: (points) => `${points || 0}/${points || 0}`,
    },
    {
      title: 'Điểm đạt được',
      key: 'score',
      render: (_, record) => {
        const submission = submissions[record.id];
        const hasActualSubmission = submission && (
          submission.fileSubmissionUrl || 
          submission.content || 
          submission.richTextContent ||
          (submission.attachments && submission.attachments.length > 0)
        );
        
        if (hasActualSubmission && submission?.score !== null && submission?.score !== undefined) {
          return (
            <Text strong style={{ color: '#52c41a' }}>
              {submission.score}/{record.points || 0}
            </Text>
          );
        }
        return <Text type="secondary">Chưa chấm</Text>;
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => getStatusTag(record),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => {
        const now = dayjs();
        const dueDate = dayjs(record.dueDate);
        const submission = submissions[record.id];
        // Chỉ cho phép nộp bài nếu chưa quá hạn và chưa có submission thực sự
        const hasActualSubmission = submission && (
          submission.fileSubmissionUrl || 
          submission.content || 
          submission.richTextContent ||
          (submission.attachments && submission.attachments.length > 0)
        );
        const canSubmit = now.isBefore(dueDate) && !hasActualSubmission;
        
        return (
          <Space>
            <Button 
              size="small" 
              onClick={() => showAssignmentDetails(record)}
            >
              Xem chi tiết
            </Button>
            {canSubmit && (
              <Button 
                type="primary" 
                size="small"
                onClick={() => showSubmitModal(record)}
              >
                Nộp bài
              </Button>
            )}
            {hasActualSubmission && (
              <Button 
                size="small"
                onClick={() => showSubmissionDetail(record)}
              >
                Xem bài nộp
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải danh sách bài tập...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
          <BookOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
          Bài Tập Của Tôi
        </Title>
        <p style={{ color: '#666', marginTop: '8px' }}>
          Xem và nộp bài tập từ các khóa học đã đăng ký
        </p>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <Empty
            description="Chưa có bài tập nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <>
          {/* Filters */}
          <Card style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={6}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  <SearchOutlined /> Tìm kiếm:
                </label>
                <Search
                  placeholder="Tìm theo tên bài tập, mô tả, lớp học..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: '100%' }}
                  allowClear
                />
              </Col>
              <Col span={4}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  <FilterOutlined /> Trạng thái:
                </label>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: '100%' }}
                  placeholder="Chọn trạng thái"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="pending">Chưa nộp</Option>
                  <Option value="submitted">Đã nộp</Option>
                  <Option value="overdue">Quá hạn</Option>
                </Select>
              </Col>
              <Col span={4}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Lớp học:
                </label>
                <Select
                  value={classroomFilter}
                  onChange={setClassroomFilter}
                  style={{ width: '100%' }}
                  placeholder="Chọn lớp học"
                >
                  <Option value="all">Tất cả</Option>
                  {getUniqueClassrooms().map(classroom => (
                    <Option key={classroom} value={classroom}>{classroom}</Option>
                  ))}
                </Select>
              </Col>
              <Col span={5}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  <CalendarOutlined /> Hạn nộp:
                </label>
                <RangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  placeholder={['Từ ngày', 'Đến ngày']}
                />
              </Col>
              <Col span={5}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Sắp xếp:
                </label>
                <Space style={{ width: '100%' }}>
                  <Select
                    value={sortField}
                    onChange={setSortField}
                    style={{ width: '140px' }}
                  >
                    <Option value="dueDate">Hạn nộp</Option>
                    <Option value="createdAt">Ngày giao</Option>
                    <Option value="title">Tên bài tập</Option>
                    <Option value="classroomName">Lớp học</Option>
                  </Select>
                  <Select
                    value={sortOrder}
                    onChange={setSortOrder}
                    style={{ width: '80px' }}
                  >
                    <Option value="asc">Tăng</Option>
                    <Option value="desc">Giảm</Option>
                  </Select>
                </Space>
              </Col>
            </Row>
            <Row style={{ marginTop: 16 }}>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Space>
                  <Button
                    icon={<FilterOutlined />}
                    onClick={handleResetFilters}
                  >
                    Đặt lại bộ lọc
                  </Button>
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={fetchAssignments}
                    loading={loading}
                  >
                    Làm mới
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Assignments Table */}
          <Card>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0 }}>
                Danh sách bài tập ({filteredAndSortedAssignments().length}/{assignments.length})
              </Title>
            </div>
            <Table
              columns={columns}
              dataSource={filteredAndSortedAssignments()}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Tổng ${total} bài tập`,
              }}
            />
          </Card>
        </>
      )}

      {/* Assignment Details Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            Chi tiết bài tập
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>,
          selectedAssignment && dayjs().isBefore(dayjs(selectedAssignment.dueDate)) && (
            <Button
              key="submit"
              type="primary"
              onClick={() => {
                setModalVisible(false);
                showSubmitModal(selectedAssignment);
              }}
            >
              Nộp bài
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedAssignment && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Tên bài tập">
                {selectedAssignment.title}
              </Descriptions.Item>
              <Descriptions.Item label="Khóa học">
                {selectedAssignment.classroomName || 'Chưa xác định'}
              </Descriptions.Item>
              <Descriptions.Item label="Điểm tối đa">
                {selectedAssignment.points || 0}/{selectedAssignment.points || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày giao">
                {selectedAssignment.createdAt ? 
                  dayjs(selectedAssignment.createdAt).isValid() ? 
                    dayjs(selectedAssignment.createdAt).format('DD/MM/YYYY HH:mm') : 
                    'Chưa có thông tin' : 
                  'Chưa có thông tin'}
              </Descriptions.Item>
              <Descriptions.Item label="Hạn nộp">
                <Space>
                  <ClockCircleOutlined />
                  {dayjs(selectedAssignment.dueDate).format('DD/MM/YYYY HH:mm')}
                  {dayjs().isAfter(dayjs(selectedAssignment.dueDate)) && (
                    <Tag color="red">Đã quá hạn</Tag>
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(selectedAssignment)}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider>Mô tả bài tập</Divider>
            <Paragraph>
              {selectedAssignment.description || 'Không có mô tả'}
            </Paragraph>
            
            {/* Show assignment attachments */}
            {(selectedAssignment.fileAttachmentUrl || (selectedAssignment.attachments && selectedAssignment.attachments.length > 0)) && (
              <>
                <Divider>Tài liệu đính kèm</Divider>
                <div>
                  {selectedAssignment.fileAttachmentUrl && (
                    <div style={{ marginBottom: 8 }}>
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => window.open(selectedAssignment.fileAttachmentUrl, '_blank')}
                        style={{ marginRight: 8 }}
                      >
                        Tải về đề bài
                      </Button>
                    </div>
                  )}
                  {selectedAssignment.attachments && selectedAssignment.attachments.map((attachment, index) => (
                    <div key={index} style={{ marginBottom: 8 }}>
                      <Button
                        type="default"
                        icon={<DownloadOutlined />}
                        onClick={() => window.open(attachment.fileUrl, '_blank')}
                        style={{ marginRight: 8 }}
                      >
                        {attachment.fileName || `Tài liệu ${index + 1}`}
                      </Button>
                      {attachment.fileSize && (
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          ({Math.round(attachment.fileSize / 1024)} KB)
                        </Text>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Submit Assignment Modal */}
      <Modal
        title={
          <Space>
            <UploadOutlined />
            Nộp bài tập
          </Space>
        }
        open={submitModalVisible}
        onCancel={() => setSubmitModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedAssignment && (
          <div>
            <Text strong>Bài tập: </Text>
            <Text>{selectedAssignment.title}</Text>
            <br />
            <Text strong>Hạn nộp: </Text>
            <Text type={dayjs().isAfter(dayjs(selectedAssignment.dueDate)) ? 'danger' : 'default'}>
              {dayjs(selectedAssignment.dueDate).format('DD/MM/YYYY HH:mm')}
            </Text>
            
            <Divider />
            
            <Form form={form} onFinish={handleSubmit} layout="vertical">
              {/* <Form.Item
                label="Nội dung bài làm (Rich Text Editor)"
              >
                <WysiwygEditor
                  value={richTextContent}
                  onChange={setRichTextContent}
                  placeholder="Nhập nội dung bài làm với formatting, hình ảnh, file đính kèm..."
                  height="300px"
                  // allowFileUpload={true}
                  // allowImageUpload={true}
                  className="w-full"
                />
              </Form.Item> */}

              <Form.Item
                name="file"
                label="File nộp bài"
              >
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Kéo thả file vào đây hoặc click để chọn file
                  </p>
                  <p className="ant-upload-hint">
                    Hỗ trợ các định dạng: PDF, DOC, DOCX, ZIP
                  </p>
                </Dragger>
              </Form.Item>
              
              <Form.Item
                name="comment"
                label="Ghi chú (tùy chọn)"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Thêm ghi chú cho bài nộp của bạn..."
                />
              </Form.Item>
              
              <Form.Item>
                <Space>
                  <Button onClick={() => setSubmitModalVisible(false)}>
                    Hủy
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={submitting}
                    disabled={fileList.length === 0 && !richTextContent.trim()}
                  >
                    Nộp bài
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* Submission Detail Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            Chi tiết bài nộp
          </Space>
        }
        open={submissionDetailModalVisible}
        onCancel={() => setSubmissionDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setSubmissionDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedSubmission && selectedAssignment && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Bài tập">
                {selectedAssignment.title}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian nộp">
                {dayjs(selectedSubmission.submittedAt).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {selectedSubmission.isLate ? (
                  <Tag color="orange" icon={<ExclamationCircleOutlined />}>Nộp muộn</Tag>
                ) : (
                  <Tag color="green" icon={<CheckCircleOutlined />}>Nộp đúng hạn</Tag>
                )}
              </Descriptions.Item>
              {selectedSubmission.score !== null && selectedSubmission.score !== undefined && (
                <Descriptions.Item label="Điểm số">
                  <Text strong style={{ color: '#52c41a' }}>
                    {selectedSubmission.score}/{selectedAssignment.points || 0}
                  </Text>
                </Descriptions.Item>
              )}
              {selectedSubmission.feedback && (
                <Descriptions.Item label="Nhận xét của giáo viên">
                  <Text>{selectedSubmission.feedback}</Text>
                </Descriptions.Item>
              )}
              {selectedSubmission.comment && (
                <Descriptions.Item label="Ghi chú của học sinh">
                  <Text>{selectedSubmission.comment}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
            
            {/* Show file attachments */}
            {((selectedSubmission.attachments && selectedSubmission.attachments.length > 0) || selectedSubmission.fileSubmissionUrl) && (
              <>
                <Divider>File đã nộp</Divider>
                <div>
                  {selectedSubmission.fileSubmissionUrl && (
                    <div style={{ marginBottom: 8 }}>
                      <Button 
                        type="link"
                        icon={<DownloadOutlined />}
                        onClick={() => window.open(selectedSubmission.fileSubmissionUrl, '_blank')}
                      >
                        Tải về file đã nộp
                      </Button>
                    </div>
                  )}
                  {selectedSubmission.attachments && selectedSubmission.attachments.map((attachment, index) => (
                    <div key={index} style={{ marginBottom: 8 }}>
                      <Button 
                        type="link"
                        icon={<DownloadOutlined />}
                        onClick={() => window.open(attachment.fileUrl, '_blank')}
                      >
                        {attachment.fileName || `File ${index + 1}`}
                      </Button>
                      {attachment.size && (
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          ({Math.round(attachment.size / 1024)} KB)
                        </Text>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Show submission content if any */}
            {(selectedSubmission.content || selectedSubmission.richTextContent) && (
              <>
                <Divider>Nội dung bài nộp</Divider>
                {selectedSubmission.richTextContent ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedSubmission.richTextContent }} />
                ) : (
                  <Paragraph>
                    {selectedSubmission.content}
                  </Paragraph>
                )}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentAssignments;
