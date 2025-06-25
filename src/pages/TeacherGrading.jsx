import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    DownloadOutlined,
    EditOutlined,
    EyeOutlined,
    PlusOutlined
} from '@ant-design/icons';
import {
    App,
    Button,
    Card,
    Col,
    Descriptions,
    Form,
    Input,
    Modal,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tabs,
    Tag
} from 'antd';
import { useEffect, useState } from 'react';
import api from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

export default function TeacherGrading() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [gradingModalVisible, setGradingModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [form] = Form.useForm();
  const [gradingForm] = Form.useForm();
  const [stats, setStats] = useState({
    totalAssignments: 0,
    pendingGrading: 0,
    gradedToday: 0,
    averageScore: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, classroomsRes, submissionsRes] = await Promise.all([
        api.get('/assignments/current-teacher'),
        api.get('/classrooms/current-teacher'),
        api.get('/api/submissions/teacher')
      ]);

      const assignmentData = assignmentsRes.data.data || [];
      const submissionData = submissionsRes.data.data || [];
      
      setAssignments(assignmentData);
      setClassrooms(classroomsRes.data.data || []);
      setSubmissions(submissionData);

      // Calculate stats
      const pendingCount = submissionData.filter(s => !s.isGraded).length;
      const gradedToday = submissionData.filter(s => 
        s.isGraded && new Date(s.gradedAt).toDateString() === new Date().toDateString()
      ).length;
      const gradedSubmissions = submissionData.filter(s => s.isGraded && s.score !== null);
      const averageScore = gradedSubmissions.length > 0 
        ? gradedSubmissions.reduce((sum, s) => sum + s.score, 0) / gradedSubmissions.length 
        : 0;

      setStats({
        totalAssignments: assignmentData.length,
        pendingGrading: pendingCount,
        gradedToday: gradedToday,
        averageScore: Math.round(averageScore * 10) / 10
      });

    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (values) => {
    try {
      setLoading(true);
      await api.post('/api/assignments', values);
      message.success('Tạo bài tập thành công!');
      setCreateModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      message.error('Không thể tạo bài tập');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (values) => {
    try {
      setLoading(true);
      await api.put(`/api/submissions/${selectedSubmission.id}/grade`, {
        score: values.score,
        feedback: values.feedback,
        isGraded: true
      });
      message.success('Chấm điểm thành công!');
      setGradingModalVisible(false);
      gradingForm.resetFields();
      setSelectedSubmission(null);
      loadData();
    } catch (error) {
      console.error('Error grading submission:', error);
      message.error('Không thể chấm điểm');
    } finally {
      setLoading(false);
    }
  };

  const openGradingModal = (submission) => {
    setSelectedSubmission(submission);
    gradingForm.setFieldsValue({
      score: submission.score,
      feedback: submission.feedback
    });
    setGradingModalVisible(true);
  };

  const downloadSubmission = async (submission) => {
    try {
      const response = await api.get(`/api/submissions/${submission.id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', submission.fileName || 'submission.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading submission:', error);
      message.error('Không thể tải xuống bài nộp');
    }
  };

  const assignmentColumns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Lớp học',
      dataIndex: 'classroomName',
      key: 'classroomName',
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'orange'}>
          {status === 'ACTIVE' ? 'Đang mở' : 'Đã đóng'}
        </Tag>
      ),
    },
    {
      title: 'Số bài nộp',
      key: 'submissionCount',
      render: (_, record) => {
        const count = submissions.filter(s => s.assignmentId === record.id).length;
        return count;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => setSelectedAssignment(record)}
          >
            Xem bài nộp
          </Button>
        </Space>
      ),
    },
  ];

  const submissionColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      key: 'score',
      render: (score, record) => (
        record.isGraded ? (
          <Tag color={score >= 8 ? 'green' : score >= 6.5 ? 'orange' : 'red'}>
            {score}/10
          </Tag>
        ) : (
          <Tag color="default">Chưa chấm</Tag>
        )
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isGraded',
      key: 'isGraded',
      render: (isGraded) => (
        <Tag color={isGraded ? 'green' : 'orange'} icon={isGraded ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
          {isGraded ? 'Đã chấm' : 'Chờ chấm'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={() => downloadSubmission(record)}
          >
            Tải xuống
          </Button>
          <Button 
            type="default" 
            icon={<EditOutlined />} 
            onClick={() => openGradingModal(record)}
          >
            Chấm điểm
          </Button>
        </Space>
      ),
    },
  ];

  const getAssignmentSubmissions = () => {
    if (!selectedAssignment) return [];
    return submissions.filter(s => s.assignmentId === selectedAssignment.id);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Quản lý chấm điểm</h1>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng bài tập"
              value={stats.totalAssignments}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Chờ chấm điểm"
              value={stats.pendingGrading}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Chấm hôm nay"
              value={stats.gradedToday}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Điểm trung bình"
              value={stats.averageScore}
              precision={1}
              valueStyle={{ color: stats.averageScore >= 7 ? '#52c41a' : '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs 
        defaultActiveKey="assignments"
        items={[
          {
            key: 'assignments',
            label: 'Quản lý bài tập',
            children: (
              <Card 
                title="Danh sách bài tập" 
                extra={
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setCreateModalVisible(true)}
                  >
                    Tạo bài tập mới
                  </Button>
                }
              >
                <Table
                  columns={assignmentColumns}
                  dataSource={assignments}
                  loading={loading}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            )
          },
          {
            key: 'pending',
            label: 'Bài nộp chờ chấm',
            children: (
              <Card title="Bài nộp chờ chấm điểm">
                <Table
                  columns={submissionColumns}
                  dataSource={submissions.filter(s => !s.isGraded)}
                  loading={loading}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            )
          }
        ]}
      />

      {/* Assignment Submissions Modal */}
      <Modal
        title={`Bài nộp - ${selectedAssignment?.title}`}
        open={!!selectedAssignment}
        onCancel={() => setSelectedAssignment(null)}
        width={1000}
        footer={null}
      >
        {selectedAssignment && (
          <div>
            <Descriptions bordered column={2} className="mb-4">
              <Descriptions.Item label="Mô tả">{selectedAssignment.description}</Descriptions.Item>
              <Descriptions.Item label="Hạn nộp">
                {new Date(selectedAssignment.dueDate).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Điểm tối đa">{selectedAssignment.maxScore}</Descriptions.Item>
              <Descriptions.Item label="Lớp học">{selectedAssignment.classroomName}</Descriptions.Item>
            </Descriptions>
            
            <Table
              columns={submissionColumns}
              dataSource={getAssignmentSubmissions()}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </div>
        )}
      </Modal>

      {/* Create Assignment Modal */}
      <Modal
        title="Tạo bài tập mới"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAssignment}
        >
          <Form.Item
            name="title"
            label="Tiêu đề bài tập"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Nhập tiêu đề bài tập" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả bài tập" />
          </Form.Item>

          <Form.Item
            name="classroomId"
            label="Lớp học"
            rules={[{ required: true, message: 'Vui lòng chọn lớp học!' }]}
          >
            <Select placeholder="Chọn lớp học">
              {classrooms.map(classroom => (
                <Option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Hạn nộp"
                rules={[{ required: true, message: 'Vui lòng chọn hạn nộp!' }]}
              >
                <Input type="datetime-local" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxScore"
                label="Điểm tối đa"
                rules={[{ required: true, message: 'Vui lòng nhập điểm tối đa!' }]}
              >
                <Input type="number" min={1} max={10} placeholder="10" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo bài tập
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Grading Modal */}
      <Modal
        title="Chấm điểm bài nộp"
        open={gradingModalVisible}
        onCancel={() => setGradingModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedSubmission && (
          <div>
            <Descriptions bordered column={1} className="mb-4">
              <Descriptions.Item label="Học sinh">{selectedSubmission.studentName}</Descriptions.Item>
              <Descriptions.Item label="Ngày nộp">
                {new Date(selectedSubmission.submittedAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Tên file">{selectedSubmission.fileName}</Descriptions.Item>
            </Descriptions>

            <Form
              form={gradingForm}
              layout="vertical"
              onFinish={handleGradeSubmission}
            >
              <Form.Item
                name="score"
                label="Điểm số"
                rules={[
                  { required: true, message: 'Vui lòng nhập điểm!' },
                  { type: 'number', min: 0, max: 10, message: 'Điểm phải từ 0-10!' }
                ]}
              >
                <Input type="number" min={0} max={10} step={0.1} placeholder="Nhập điểm (0-10)" />
              </Form.Item>

              <Form.Item
                name="feedback"
                label="Nhận xét"
                rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}
              >
                <TextArea rows={4} placeholder="Nhập nhận xét cho bài làm" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Lưu điểm
                  </Button>
                  <Button onClick={() => downloadSubmission(selectedSubmission)}>
                    Tải xuống bài nộp
                  </Button>
                  <Button onClick={() => setGradingModalVisible(false)}>
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}
