import {
    DownloadOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    FileTextOutlined,
    MoreOutlined
} from '@ant-design/icons';
import {
    App,
    Button,
    Card,
    Col,
    Dropdown,
    Form,
    Input,
    InputNumber,
    Menu,
    Modal,
    Progress,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tabs,
    Tag,
    Tooltip
} from 'antd';
import { ArcElement, CategoryScale, Chart as ChartJS, Tooltip as ChartTooltip, Legend, LinearScale } from 'chart.js';
import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import GradingService from '../services/gradingService';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale);

const { Option } = Select;
const { TextArea } = Input;

const AdvancedGrading = () => {
  const { message } = App.useApp();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingForm] = Form.useForm();
  // const [bulkGrading, setBulkGrading] = useState(false); // Unused
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    if (selectedAssignment) {
      loadSubmissions();
      loadRubrics();
      loadAnalytics();
    }
  }, [selectedAssignment]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      // This would typically load assignments for the current teacher
      // For now, using mock data
      const mockAssignments = [
        {
          id: 1,
          title: 'Software Engineering Project',
          courseId: 1,
          courseName: 'Software Engineering',
          dueDate: '2024-01-20',
          maxScore: 100,
          submissionCount: 45,
          gradedCount: 30,
          status: 'active'
        },
        {
          id: 2,
          title: 'Database Design Assignment',
          courseId: 2,
          courseName: 'Database Systems',
          dueDate: '2024-01-25',
          maxScore: 80,
          submissionCount: 38,
          gradedCount: 38,
          status: 'completed'
        }
      ];
      setAssignments(mockAssignments);
      if (mockAssignments.length > 0) {
        setSelectedAssignment(mockAssignments[0]);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      message.error('Không thể tải danh sách bài tập');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await GradingService.getSubmissionsForGrading(selectedAssignment.id);
      setSubmissions(data);
    } catch (error) {
      console.error('Error loading submissions:', error);
      // Fallback to mock data
      const mockSubmissions = [
        {
          id: 1,
          studentId: 1,
          studentName: 'Nguyễn Văn A',
          studentEmail: 'nguyenvana@example.com',
          submittedAt: '2024-01-18T10:30:00',
          status: 'submitted',
          score: 85,
          maxScore: 100,
          isGraded: true,
          files: ['project.zip', 'documentation.pdf']
        },
        {
          id: 2,
          studentId: 2,
          studentName: 'Trần Thị B',
          studentEmail: 'tranthib@example.com',
          submittedAt: '2024-01-19T14:15:00',
          status: 'submitted',
          score: null,
          maxScore: 100,
          isGraded: false,
          files: ['assignment.zip']
        }
      ];
      setSubmissions(mockSubmissions);
    } finally {
      setLoading(false);
    }
  };

  const loadRubrics = async () => {
    try {
      const data = await GradingService.getGradingRubrics(selectedAssignment.id);
      setRubrics(data);
    } catch (error) {
      console.error('Error loading rubrics:', error);
      // Fallback to mock data
      const mockRubrics = [
        {
          id: 1,
          criteria: 'Code Quality',
          description: 'Clean, readable, and well-documented code',
          maxPoints: 30,
          levels: [
            { name: 'Excellent', points: 30, description: 'Exceptional code quality' },
            { name: 'Good', points: 24, description: 'Good code quality' },
            { name: 'Satisfactory', points: 18, description: 'Acceptable code quality' },
            { name: 'Needs Improvement', points: 12, description: 'Poor code quality' }
          ]
        },
        {
          id: 2,
          criteria: 'Functionality',
          description: 'All features work as expected',
          maxPoints: 40,
          levels: [
            { name: 'Excellent', points: 40, description: 'All features work perfectly' },
            { name: 'Good', points: 32, description: 'Most features work well' },
            { name: 'Satisfactory', points: 24, description: 'Basic functionality works' },
            { name: 'Needs Improvement', points: 16, description: 'Many issues with functionality' }
          ]
        }
      ];
      setRubrics(mockRubrics);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await GradingService.getGradingAnalytics(selectedAssignment.id);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Fallback to mock data
      const mockAnalytics = {
        averageScore: 78.5,
        highestScore: 95,
        lowestScore: 45,
        gradedSubmissions: 30,
        totalSubmissions: 45,
        gradeDistribution: {
          'A (90-100)': 8,
          'B (80-89)': 12,
          'C (70-79)': 7,
          'D (60-69)': 2,
          'F (0-59)': 1
        }
      };
      setAnalytics(mockAnalytics);
    }
  };

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setGradeModalVisible(true);
    gradingForm.setFieldsValue({
      score: submission.score,
      feedback: submission.feedback || ''
    });
  };

  const handleGradeSubmission = async (values) => {
    try {
      await GradingService.gradeSubmission(selectedSubmission.id, values);
      message.success('Đã chấm điểm thành công');
      setGradeModalVisible(false);
      loadSubmissions();
    } catch (error) {
      console.error('Error grading submission:', error);
      message.error('Không thể chấm điểm');
    }
  };

  // const handleBulkGrading = async (gradeData) => {
  //   try {
  //     await GradingService.bulkGradeSubmissions(selectedAssignment.id, gradeData);
  //     message.success('Đã chấm điểm hàng loạt thành công');
  //     setBulkGrading(false);
  //     setSelectedSubmissions([]);
  //     loadSubmissions();
  //   } catch (error) {
  //     console.error('Error bulk grading:', error);
  //     message.error('Không thể chấm điểm hàng loạt');
  //   }
  // };

  const exportGrades = async (format = 'csv') => {
    try {
      const blob = await GradingService.exportGrades(selectedAssignment.id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grades-${selectedAssignment.title}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('Đã xuất file điểm thành công');
    } catch (error) {
      console.error('Error exporting grades:', error);
      message.error('Không thể xuất file điểm');
    }
  };

  const getStatusTag = (submission) => {
    if (submission.isGraded) {
      return <Tag color="green">Đã chấm</Tag>;
    } else if (submission.status === 'submitted') {
      return <Tag color="orange">Chờ chấm</Tag>;
    } else {
      return <Tag color="red">Chưa nộp</Tag>;
    }
  };

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return '#52c41a';
    if (percentage >= 80) return '#1890ff';
    if (percentage >= 70) return '#fa8c16';
    if (percentage >= 60) return '#faad14';
    return '#f5222d';
  };

  const submissionColumns = [
    {
      title: 'Sinh viên',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.studentEmail}</div>
        </div>
      )
    },
    {
      title: 'Thời gian nộp',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (text) => new Date(text).toLocaleString('vi-VN')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => getStatusTag(record)
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      key: 'score',
      render: (score, record) => {
        if (record.isGraded) {
          return (
            <Tag color={getScoreColor(score, record.maxScore)}>
              {score}/{record.maxScore}
            </Tag>
          );
        }
        return <span style={{ color: '#999' }}>Chưa chấm</span>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem bài nộp">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => viewSubmission(record)}
            />
          </Tooltip>
          <Tooltip title="Chấm điểm">
            <Button 
              type="link" 
              icon={<FileTextOutlined />}
              onClick={() => openGradeModal(record)}
            />
          </Tooltip>
          <Dropdown overlay={
            <Menu>
              <Menu.Item key="download" icon={<DownloadOutlined />}>
                Tải xuống
              </Menu.Item>
              <Menu.Item key="plagiarism" icon={<ExclamationCircleOutlined />}>
                Kiểm tra đạo văn
              </Menu.Item>
            </Menu>
          }>
            <Button type="link" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  const viewSubmission = (submission) => {
    // Implementation for viewing submission details
    Modal.info({
      title: `Bài nộp của ${submission.studentName}`,
      content: (
        <div>
          <p><strong>Thời gian nộp:</strong> {new Date(submission.submittedAt).toLocaleString('vi-VN')}</p>
          <p><strong>Files đã nộp:</strong></p>
          <ul>
            {submission.files.map((file, index) => (
              <li key={index}>{file}</li>
            ))}
          </ul>
        </div>
      ),
      width: 600
    });
  };

  const renderAnalytics = () => {
    if (!analytics) return null;

    const gradeDistributionData = {
      labels: Object.keys(analytics.gradeDistribution),
      datasets: [{
        data: Object.values(analytics.gradeDistribution),
        backgroundColor: [
          '#52c41a', '#1890ff', '#faad14', '#fa8c16', '#f5222d'
        ]
      }]
    };

    return (
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Điểm trung bình"
              value={analytics.averageScore}
              precision={1}
              suffix="/ 100"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Điểm cao nhất"
              value={analytics.highestScore}
              suffix="/ 100"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Điểm thấp nhất"
              value={analytics.lowestScore}
              suffix="/ 100"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tiến độ chấm"
              value={analytics.gradedSubmissions}
              suffix={`/ ${analytics.totalSubmissions}`}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Phân bố điểm">
            <Doughnut data={gradeDistributionData} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Tiến độ chấm điểm">
            <Progress
              type="circle"
              percent={Math.round((analytics.gradedSubmissions / analytics.totalSubmissions) * 100)}
              status={analytics.gradedSubmissions === analytics.totalSubmissions ? 'success' : 'active'}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Chấm điểm nâng cao" extra={
        <Space>
          <Select
            value={selectedAssignment?.id}
            onChange={(value) => setSelectedAssignment(assignments.find(a => a.id === value))}
            style={{ width: 200 }}
          >
            {assignments.map(assignment => (
              <Option key={assignment.id} value={assignment.id}>
                {assignment.title}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => exportGrades('xlsx')}
          >
            Xuất điểm
          </Button>
        </Space>
      }>
        <Tabs 
          defaultActiveKey="submissions"
          items={[
            {
              key: 'submissions',
              label: 'Danh sách bài nộp',
              children: (
                <>
                  <Table
                    columns={submissionColumns}
                    dataSource={submissions}
                    loading={loading}
                    rowKey="id"
                    rowSelection={{
                      selectedRowKeys: selectedSubmissions,
                      onChange: setSelectedSubmissions,
                      checkStrictly: false
                    }}
                  />
                  {selectedSubmissions.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <Button
                        type="primary"
                        onClick={() => setBulkGrading(true)}
                      >
                        Chấm điểm hàng loạt ({selectedSubmissions.length} bài)
                      </Button>
                    </div>
                  )}
                </>
              )
            },
            {
              key: 'analytics',
              label: 'Thống kê',
              children: renderAnalytics()
            },
            {
              key: 'rubrics',
              label: 'Rubric chấm điểm',
              children: (
                <div>
                  <Button type="primary" style={{ marginBottom: 16 }}>
                    Thêm tiêu chí mới
                  </Button>
              {rubrics.map(rubric => (
                <Card key={rubric.id} style={{ marginBottom: 16 }}>
                  <h4>{rubric.criteria} ({rubric.maxPoints} điểm)</h4>
                  <p>{rubric.description}</p>
                  <Row gutter={8}>
                    {rubric.levels.map((level, index) => (
                      <Col span={6} key={index}>
                        <Card size="small">
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold' }}>{level.name}</div>
                            <div style={{ fontSize: '18px', color: '#1890ff' }}>
                              {level.points} điểm
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {level.description}
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card>
              ))}
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* Grade Modal */}
      <Modal
        title={`Chấm điểm - ${selectedSubmission?.studentName}`}
        open={gradeModalVisible}
        onCancel={() => setGradeModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={gradingForm}
          onFinish={handleGradeSubmission}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="score"
                label="Điểm số"
                rules={[
                  { required: true, message: 'Vui lòng nhập điểm số' },
                  { type: 'number', min: 0, max: selectedAssignment?.maxScore, message: `Điểm phải từ 0 đến ${selectedAssignment?.maxScore}` }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={`0 - ${selectedAssignment?.maxScore}`}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tiến độ">
                <Progress
                  percent={gradingForm.getFieldValue('score') ? 
                    Math.round((gradingForm.getFieldValue('score') / selectedAssignment?.maxScore) * 100) : 0}
                  status="active"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="feedback"
            label="Nhận xét"
          >
            <TextArea
              rows={6}
              placeholder="Nhập nhận xét cho sinh viên..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Lưu điểm
              </Button>
              <Button onClick={() => setGradeModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdvancedGrading;