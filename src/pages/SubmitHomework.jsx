import { FileTextOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Space, Spin, Typography, Upload } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const { TextArea } = Input;
const { Title, Text } = Typography;
// const { Option } = Select; // Unused

/**
 * SubmitHomework component for student homework submission
 * @returns {JSX.Element} SubmitHomework component
 */
function SubmitHomework() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Get user info from localStorage
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentDetails();
    }
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/assignments/${assignmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAssignment(response.data);
    } catch (error) {
      message.error('Không thể tải thông tin bài tập');
      console.error('Error fetching assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    if (!userId) {
      message.error('Vui lòng đăng nhập để nộp bài');
      return;
    }

    setSubmitting(true);
    try {
      // Upload files first if any
      let fileUrl = '';
      if (fileList.length > 0) {
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj);
        
        const uploadResponse = await axios.post('/api/files/upload', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        fileUrl = uploadResponse.data.fileUrl;
      }

      // Submit assignment
      const submissionData = {
        assignmentId: parseInt(assignmentId),
        comment: values.comment,
        fileSubmissionUrl: fileUrl
      };

      await axios.post(`/api/submissions?studentId=${userId}`, submissionData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      message.success('Nộp bài thành công!');
      navigate('/student/assignments');
    } catch (error) {
      console.error('Submission error:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Có lỗi xảy ra khi nộp bài');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File phải nhỏ hơn 10MB!');
        return false;
      }
      setFileList([file]);
      return false; // Prevent auto upload
    },
    fileList,
    onRemove: () => {
      setFileList([]);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thông tin bài tập...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text type="secondary">Không tìm thấy bài tập</Text>
      </div>
    );
  }

  const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Assignment Info */}
        <Card>
          <Title level={3}>
            <FileTextOutlined /> {assignment.title}
          </Title>
          <div style={{ marginBottom: 16 }}>
            <Text strong>Mô tả: </Text>
            <Text>{assignment.description}</Text>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text strong>Hạn nộp: </Text>
            <Text type={isOverdue ? "danger" : "secondary"}>
              {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString('vi-VN') : 'Không có hạn'}
            </Text>
            {isOverdue && <Text type="danger" style={{ marginLeft: 8 }}>(Đã quá hạn)</Text>}
          </div>
          <div>
            <Text strong>Điểm tối đa: </Text>
            <Text>{assignment.points || 10}/{assignment.points || 10}</Text>
          </div>
        </Card>

        {/* Submission Form */}
        <Card title="Nộp bài tập">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="comment"
              label="Nội dung bài làm"
              rules={[
                { required: true, message: 'Vui lòng nhập nội dung bài làm' },
                { min: 10, message: 'Nội dung phải có ít nhất 10 ký tự' }
              ]}
            >
              <TextArea
                rows={6}
                placeholder="Nhập nội dung bài làm, giải thích cách làm, kết quả..."
                showCount
                maxLength={1000}
              />
            </Form.Item>

            <Form.Item
              label="File đính kèm (không bắt buộc)"
              extra="Hỗ trợ các định dạng: PDF, DOC, DOCX, TXT, ZIP. Tối đa 10MB"
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>
                  Chọn file
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  disabled={isOverdue}
                >
                  {isOverdue ? 'Đã quá hạn nộp' : 'Nộp bài'}
                </Button>
                <Button onClick={() => navigate('/student/assignments')}>
                  Quay lại
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
}

export default SubmitHomework;
