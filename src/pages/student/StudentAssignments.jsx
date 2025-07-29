import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  UploadOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  Upload
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AssignmentService from '../../services/assignmentService';
import SubmissionService from '../../services/submissionService';
import DebugLogger from '../../utils/debugLogger';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

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
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  // Ref to prevent duplicate API calls
  const fetchingRef = useRef(false);

  useEffect(() => {
    // Only fetch assignments when user is available
    if (user?.id) {
      fetchAssignments();
    }
  }, [user?.id]); // Add user.id as dependency

  const fetchAssignments = async () => {
    // Prevent duplicate calls
    if (fetchingRef.current) {
      DebugLogger.warn('Already fetching, skipping duplicate call', null, 'StudentAssignments');
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      DebugLogger.apiCall('/assignments/student/me', 'GET', 'StudentAssignments');

      const data = await AssignmentService.getCurrentStudentAssignments();
      DebugLogger.apiSuccess('/assignments/student/me', data.length, 'StudentAssignments');
      setAssignments(data);

      // Fetch submissions for each assignment
      if (user?.id && data.length > 0) {
        DebugLogger.debug(`Fetching submissions for ${data.length} assignments`, null, 'StudentAssignments');
        const submissionPromises = data.map(assignment =>
          SubmissionService.getStudentSubmission(assignment.id, user.id)
        );

        const submissionResults = await Promise.allSettled(submissionPromises);

        const submissionsMap = {};
        let foundSubmissions = 0;

        submissionResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            submissionsMap[data[index].id] = result.value;
            foundSubmissions++;
          } else if (result.status === 'rejected') {
            DebugLogger.debug(`No submission for assignment ${data[index].id}`, result.reason, 'StudentAssignments');
          }
        });

        DebugLogger.info(`Found ${foundSubmissions} submissions out of ${data.length} assignments`, null, 'StudentAssignments');
        setSubmissions(submissionsMap);
      } else {
        DebugLogger.warn('Skipping submissions fetch', {
          hasUserId: !!user?.id,
          assignmentsLength: data.length
        }, 'StudentAssignments');
      }
    } catch (error) {
      DebugLogger.apiError('/assignments/student/me', error, 'StudentAssignments');
      message.error('Không thể tải danh sách bài tập');
    } finally {
      setLoading(false);
      fetchingRef.current = false; // Reset fetching flag
    }
  };

  const getStatusTag = (assignment) => {
    const now = dayjs();
    const dueDate = dayjs(assignment.dueDate);
    const submission = submissions[assignment.id];
    
    // Kiểm tra xem submission có nội dung thực tế không
    const hasActualSubmit = submission && 
      (submission.content?.trim().length > 0 || 
       (submission.attachments && submission.attachments.length > 0) ||
       submission.fileSubmissionUrl);
    
    if (submission && hasActualSubmit) {
      if (submission.isGraded && submission.score !== null && submission.score !== undefined) {
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
    setSelectedAssignment(assignment);
    setModalVisible(true);
  };

  const showSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmitModalVisible(true);
    form.resetFields();
    setFileList([]);
  };

  const handleSubmit = async (values) => {
    if (fileList.length === 0) {
      message.error('Vui lòng chọn file để nộp bài');
      return;
    }

    try {
      setSubmitting(true);
      
      // TODO: Upload file first to get file URL
      // For now, we'll use a placeholder URL
      const submissionData = {
        assignmentId: selectedAssignment.id,
        comment: values.comment || '',
        fileSubmissionUrl: `uploaded-file-${Date.now()}.pdf` // This should be the actual uploaded file URL
      };

      await SubmissionService.submitAssignment(submissionData);
      message.success('Nộp bài thành công!');
      
      setSubmitModalVisible(false);
      fetchAssignments(); // Refresh the list to update submission status
      
    } catch (error) {
      console.error('Error submitting assignment:', error);
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
    },
    {
      title: 'Khóa học',
      dataIndex: 'classroomName',
      key: 'classroomName',
      render: (text) => text || 'Chưa xác định',
    },
    {
      title: 'Ngày giao',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
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
    },
    {
      title: 'Điểm tối đa',
      dataIndex: 'points',
      key: 'points',
      render: (points) => `${points || 0} điểm`,
    },
    {
      title: 'Điểm đạt được',
      key: 'score',
      render: (_, record) => {
        const submission = submissions[record.id];
        if (submission?.score !== null && submission?.score !== undefined) {
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
        const canSubmit = now.isBefore(dueDate) && !submission;
        
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
            {submission && (
              <Button
                size="small"
                onClick={() => {
                  console.log('🔍 DEBUG - Viewing submission details:', {
                    assignmentId: record.id,
                    submissionId: submission.id,
                    submission
                  });
                  // Navigate to submission detail page
                  // For now, we'll create a simple modal to show submission details
                  Modal.info({
                    title: 'Chi tiết bài nộp',
                    width: 600,
                    content: (
                      <div>
                        <p><strong>Bài tập:</strong> {record.title}</p>
                        <p><strong>Ngày nộp:</strong> {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('vi-VN') : 'N/A'}</p>
                        <p><strong>Điểm:</strong> {submission.score !== null ? `${submission.score}/${record.points}` : 'Chưa chấm điểm'}</p>
                        <p><strong>Nhận xét:</strong> {submission.feedback || 'Chưa có nhận xét'}</p>
                        <p><strong>Ghi chú của sinh viên:</strong> {submission.comment || 'Không có ghi chú'}</p>
                        {submission.fileSubmissionUrl && (
                          <p><strong>File nộp:</strong> <a href={submission.fileSubmissionUrl} target="_blank" rel="noopener noreferrer">Tải xuống</a></p>
                        )}
                      </div>
                    ),
                    onOk() {
                      console.log('Submission detail modal closed');
                    },
                  });
                }}
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
        <Card>
          <Table
            columns={columns}
            dataSource={assignments}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Tổng ${total} bài tập`,
            }}
          />
        </Card>
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
                {selectedAssignment.points || 0} điểm
              </Descriptions.Item>
              <Descriptions.Item label="Ngày giao">
                {dayjs(selectedAssignment.createdAt).format('DD/MM/YYYY HH:mm')}
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
            
            {selectedAssignment.fileAttachmentUrl && (
              <>
                <Divider>Tài liệu đính kèm</Divider>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => window.open(selectedAssignment.fileAttachmentUrl, '_blank')}
                >
                  Tải về đề bài
                </Button>
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
              <Form.Item
                name="file"
                label="File nộp bài"
                rules={[{ required: true, message: 'Vui lòng chọn file để nộp' }]}
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
                    <br />
                    Hỗ trợ file tối đa 10mb
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
                    disabled={fileList.length === 0}
                  >
                    Nộp bài
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentAssignments;
