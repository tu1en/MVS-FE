import { CheckOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Modal, Spin, Table } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { teacherAssignmentService } from '../../services/teacherAssignmentService';

const { TextArea } = Input;

/**
 * GradeHomework component for teachers to grade student submissions
 * @returns {JSX.Element} GradeHomework component
 */
function GradeHomework() {
  const { assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGradingModalVisible, setIsGradingModalVisible] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (assignmentId) {
      fetchSubmissions();
    }
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      // Fetch assignment details and submissions
      const [assignmentData, submissionsData] = await Promise.all([
        teacherAssignmentService.getAssignmentDetails(assignmentId),
        teacherAssignmentService.getAssignmentSubmissions(assignmentId)
      ]);
      
      setAssignment(assignmentData);
      setSubmissions(submissionsData || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      message.error('Không thể tải danh sách bài nộp. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = (submission) => {
    setCurrentSubmission(submission);
    form.setFieldsValue({
      score: submission.score || 0,
      feedback: submission.feedback || ''
    });
    setIsGradingModalVisible(true);
  };

  const handleGradingSubmit = async (values) => {
    try {
      await teacherAssignmentService.gradeSubmission(
        currentSubmission.id,
        {
          score: values.score,
          feedback: values.feedback
        }
      );
      
      message.success('Chấm điểm thành công!');
      setIsGradingModalVisible(false);
      setCurrentSubmission(null);
      form.resetFields();
      
      // Refresh submissions
      await fetchSubmissions();
    } catch (error) {
      console.error('Error grading submission:', error);
      message.error('Lỗi khi chấm điểm. Vui lòng thử lại.');
    }
  };

  const handleViewSubmission = (submission) => {
    if (submission.attachmentUrl) {
      window.open(submission.attachmentUrl, '_blank');
    } else {
      message.info('Không có file đính kèm');
    }
  };

  const handleDownloadSubmission = (submission) => {
    if (submission.attachmentUrl) {
      const link = document.createElement('a');
      link.href = submission.attachmentUrl;
      link.download = `${submission.studentName}_${submission.assignmentTitle}`;
      link.click();
    } else {
      message.info('Không có file đính kèm');
    }
  };

  const columns = [
    {
      title: 'Tên học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
      sorter: (a, b) => a.studentName.localeCompare(b.studentName),
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'submissionDate',
      key: 'submissionDate',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: (a, b) => new Date(a.submissionDate) - new Date(b.submissionDate),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          'SUBMITTED': { color: 'blue', text: 'Đã nộp' },
          'GRADED': { color: 'green', text: 'Đã chấm' },
          'LATE': { color: 'orange', text: 'Nộp muộn' },
          'NOT_SUBMITTED': { color: 'red', text: 'Chưa nộp' }
        };
        const statusInfo = statusMap[status] || { color: 'default', text: status };
        return <span style={{ color: statusInfo.color }}>{statusInfo.text}</span>;
      },
      filters: [
        { text: 'Đã nộp', value: 'SUBMITTED' },
        { text: 'Đã chấm', value: 'GRADED' },
        { text: 'Nộp muộn', value: 'LATE' },
        { text: 'Chưa nộp', value: 'NOT_SUBMITTED' }
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      key: 'score',
      render: (score) => score !== null ? score : 'Chưa chấm',
      sorter: (a, b) => (a.score || 0) - (b.score || 0),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => handleGrade(record)}
          >
            Chấm điểm
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewSubmission(record)}
          >
            Xem
          </Button>
          <Button
            type="default"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadSubmission(record)}
          >
            Tải xuống
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chấm điểm bài tập</h1>
          {assignment && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-700">{assignment.title}</h2>
              <p className="text-gray-600 mt-2">{assignment.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                <span>Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}</span>
                <span className="ml-4">Điểm tối đa: {assignment.maxScore}</span>
              </div>
            </div>
          )}
        </div>

        <Card title="Danh sách bài nộp" className="shadow-lg">
          <Table
            dataSource={submissions}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài nộp`,
            }}
            scroll={{ x: 800 }}
          />
        </Card>

        <Modal
          title="Chấm điểm bài tập"
          open={isGradingModalVisible}
          onCancel={() => {
            setIsGradingModalVisible(false);
            setCurrentSubmission(null);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          {currentSubmission && (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleGradingSubmit}
            >
              <div className="mb-4">
                <p><strong>Học sinh:</strong> {currentSubmission.studentName}</p>
                <p><strong>Ngày nộp:</strong> {new Date(currentSubmission.submissionDate).toLocaleDateString('vi-VN')}</p>
                {currentSubmission.attachmentUrl && (
                  <div className="mt-2">
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewSubmission(currentSubmission)}
                    >
                      Xem bài nộp
                    </Button>
                  </div>
                )}
              </div>

              <Form.Item
                label="Điểm"
                name="score"
                rules={[
                  { required: true, message: 'Vui lòng nhập điểm!' },
                  { type: 'number', min: 0, max: assignment?.maxScore || 10, message: `Điểm phải từ 0 đến ${assignment?.maxScore || 10}` }
                ]}
              >
                <Input
                  type="number"
                  placeholder="Nhập điểm"
                  min={0}
                  max={assignment?.maxScore || 10}
                  step={0.1}
                />
              </Form.Item>

              <Form.Item
                label="Nhận xét"
                name="feedback"
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập nhận xét cho học sinh..."
                />
              </Form.Item>

              <Form.Item>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      setIsGradingModalVisible(false);
                      setCurrentSubmission(null);
                      form.resetFields();
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Lưu điểm
                  </Button>
                </div>
              </Form.Item>
            </Form>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default GradeHomework;
