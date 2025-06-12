import { ClockCircleOutlined, FileTextOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Drawer, Empty, Form, Input, message, Modal, Space, Spin, Table, Tabs, Tag, Typography, Upload } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import AssignmentService from '../services/assignmentService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

/**
 * AssignmentsPage component for managing assignments
 * @returns {JSX.Element} AssignmentsPage component
 */
function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [gradingDrawerVisible, setGradingDrawerVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [submitDrawerVisible, setSubmitDrawerVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [submissionComment, setSubmissionComment] = useState('');
  const [gradeValue, setGradeValue] = useState('');
  const [feedback, setFeedback] = useState('');
  const [form] = Form.useForm();

  // Get user info from localStorage
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('role');
  const isAdmin = userRole === '0'; // Check if user is admin

  // Debug logging for role detection
  console.log('AssignmentsPageNew - Role Debug:', { 
    userId, 
    userRole, 
    roleFromStorage: localStorage.getItem('role'),
    token: localStorage.getItem('token') 
  });

  useEffect(() => {
    // Use real API calls instead of mock data
    fetchData();
  }, [userId, userRole]);

  // Fetch all necessary data based on user role
  const fetchData = async () => {
    console.log('fetchData called with role:', userRole, 'userId:', userId);
    
    // Don't fetch if no valid role or user ID
    if (!userRole || !userId) {
      console.warn('Cannot fetch data: missing role or userId');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      await fetchAssignments();
      if (userRole === '1' || userRole === 'STUDENT') { // Student role
        await fetchSubmissions();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      let assignmentsData = [];
      
      // Role-based assignment fetching
      if (userRole === '1' || userRole === 'STUDENT') {
        // Student: Get assignments from their enrolled classrooms
        console.log('Fetching assignments for STUDENT role');
        assignmentsData = await AssignmentService.getAssignmentsByStudent(userId);
      } else if (userRole === '2' || userRole === 'TEACHER') {
        // Teacher: Get assignments they created
        console.log('Fetching assignments for TEACHER role');
        assignmentsData = await AssignmentService.getAssignmentsByTeacher(userId);
      } else {
        // Admin/Manager: Get all assignments
        console.log('Fetching all assignments for ADMIN/MANAGER role');
        assignmentsData = await AssignmentService.getAllAssignments();
      }
      
      // Ensure assignmentsData is always an array
      if (!Array.isArray(assignmentsData)) {
        console.warn('Assignments data is not an array:', assignmentsData);
        assignmentsData = [];
      }
      
      console.log('Fetched assignments:', assignmentsData.length, 'items');
      setAssignments(assignmentsData);
    } catch (error) {
      message.error('Không thể tải danh sách bài tập');
      console.error('Error fetching assignments:', error);
      // Set empty array on error to prevent runtime errors
      setAssignments([]);
      throw error;
    }
  };

  const fetchSubmissions = async () => {
    try {
      if (!userId) {
        console.error('User ID not available');
        throw new Error('User ID not available');
      }
      
      const submissions = await AssignmentService.getSubmissionsByStudent(userId);
      
      // Convert array to object indexed by assignment ID
      const submissionsObject = {};
      submissions.forEach(submission => {
        submissionsObject[submission.assignmentId] = submission;
      });
      
      setSubmissions(submissionsObject);
    } catch (error) {
      message.error('Không thể tải dữ liệu bài làm');
      console.error('Error fetching submissions:', error);
      throw error;
    }
  };

  // const fetchSubmissionsForAssignment = async (assignmentId) => {
  //   setLoading(true);
  //   try {
  //     const submissionsData = await AssignmentService.getSubmissionsForAssignment(assignmentId);
  //     setSubmissionsList(submissionsData);
  //   } catch (error) {
  //     console.error(`Error fetching submissions for assignment ${assignmentId}:`, error);
  //     message.error('Không thể tải danh sách bài làm');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getAssignmentStatus = (assignment) => {
    const now = new Date();
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
    const submission = submissions[assignment.id];

    if (submission) {
      if (submission.score !== null && submission.score !== undefined) {
        return { status: 'graded', color: 'success', text: `Đã chấm: ${submission.score}/${assignment.points}` };
      }
      return { status: 'submitted', color: 'processing', text: 'Đã nộp' };
    }

    if (dueDate && now > dueDate) {
      return { status: 'overdue', color: 'error', text: 'Quá hạn' };
    }

    return { status: 'pending', color: 'warning', text: 'Chưa nộp' };
  };

  const handleCreateAssignment = async (values) => {
    try {
      setLoading(true);
      
      // Convert form values to assignment data format
      const assignmentData = {
        title: values.title,
        description: values.description,
        dueDate: values.dueDate.toISOString(),
        points: values.points,
        classroomId: values.classroomId,
        fileAttachmentUrl: values.fileAttachmentUrl || null
      };
      
      // Call API to create assignment
      await AssignmentService.createAssignment(assignmentData);
      
      message.success('Tạo bài tập thành công!');
      setCreateModalVisible(false);
      form.resetFields();
      
      // Refresh assignments list
      await fetchAssignments();
    } catch (error) {
      console.error('Error creating assignment:', error);
      message.error('Không thể tạo bài tập');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission || !selectedAssignment) return;
    
    try {
      const gradeData = {
        submissionId: selectedSubmission.id,
        score: parseFloat(gradeValue),
        feedback
      };
      
      // Call service to save grade
      await AssignmentService.gradeSubmission(selectedAssignment.id, gradeData);
      
      message.success('Đã chấm điểm bài nộp thành công');
      
      // Update the submission in the list
      const updatedSubmission = {
        ...selectedSubmission,
        score: parseFloat(gradeValue),
        feedback
      };
      
      setSubmissionsList(prev => 
        prev.map(sub => sub.id === updatedSubmission.id ? updatedSubmission : sub)
      );
      
      // Close drawer and reset form
      setGradingDrawerVisible(false);
      setGradeValue('');
      setFeedback('');
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Error grading submission:', error);
      message.error('Không thể chấm điểm bài nộp');
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      if (fileList.length > 0) {
        formData.append('file', fileList[0].originFileObj);
      }
      
      const submissionData = {
        assignmentId: selectedAssignment.id,
        studentId: userId,
        comment: submissionComment,
        submittedAt: new Date().toISOString()
      };
      
      // Call service to upload file first if there's a file
      let fileUrl = null;
      if (fileList.length > 0) {
        const uploadResult = await AssignmentService.uploadFile(formData);
        fileUrl = uploadResult.fileUrl;
      }
      
      // Add file URL to submission data if a file was uploaded
      if (fileUrl) {
        submissionData.fileSubmissionUrl = fileUrl;
      }
      
      // Call service to save submission
      const submission = await AssignmentService.submitAssignment(submissionData);
      
      message.success('Đã nộp bài thành công');
      
      // Update submissions state
      setSubmissions(prev => ({
        ...prev,
        [selectedAssignment.id]: submission
      }));
      
      // Close drawer and reset form
      setSubmitDrawerVisible(false);
      setFileList([]);
      setSubmissionComment('');
      setSelectedAssignment(null);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      message.error('Không thể nộp bài');
    }
  };

  const handleGradeClick = async (assignment) => {
    setSelectedAssignment(assignment);
    setGradingDrawerVisible(true);
    
    // For testing, use the mock data directly
    const filteredSubmissions = submissionsList.filter(
      sub => sub.assignmentId === assignment.id
    );
    
    if (filteredSubmissions.length > 0) {
      setSubmissionsList(filteredSubmissions);
    } else {
      // If no submissions exist for this assignment in mock data, create some
      const generatedSubmissions = [
        {
          id: 201,
          assignmentId: assignment.id,
          student: {
            id: 1,
            fullName: 'Nguyễn Văn A',
            email: 'student@classroom.com'
          },
          submittedAt: moment().subtract(1, 'days').toISOString(),
          fileSubmissionUrl: 'https://example.com/submission_new.pdf',
          comment: 'Em đã hoàn thành bài tập.',
          score: null,
          feedback: null
        },
        {
          id: 202,
          assignmentId: assignment.id,
          student: {
            id: 2,
            fullName: 'Trần Thị B',
            email: 'student2@classroom.com'
          },
          submittedAt: moment().subtract(6, 'hours').toISOString(),
          fileSubmissionUrl: 'https://example.com/submission_new2.pdf',
          comment: 'Bài tập của em đây ạ.',
          score: null,
          feedback: null
        }
      ];
      setSubmissionsList(generatedSubmissions);
    }
  };

  const handleSubmitClick = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmitDrawerVisible(true);
    
    // Pre-fill with existing submission if available
    const existingSubmission = submissions[assignment.id];
    if (existingSubmission) {
      setSubmissionComment(existingSubmission.comment || '');
      
      // Simulate existing file
      if (existingSubmission.fileSubmissionUrl) {
        setFileList([
          {
            uid: '-1',
            name: existingSubmission.fileSubmissionUrl.split('/').pop() || 'existing-file.pdf',
            status: 'done',
            url: existingSubmission.fileSubmissionUrl,
          },
        ]);
      }
    } else {
      // Clear form
      setSubmissionComment('');
      setFileList([]);
    }
  };

  const handleEditAssignment = (assignment) => {
    form.setFieldsValue({
      title: assignment.title,
      description: assignment.description,
      dueDate: moment(assignment.dueDate),
      points: assignment.points
    });
    setSelectedAssignment(assignment);
    setCreateModalVisible(true);
  };

  const handleSeedMockData = async () => {
    try {
      setLoading(true);
      await AssignmentService.seedAssignmentData();
      message.success('Dữ liệu mẫu đã được tạo thành công!');
      // Refresh assignments list
      await fetchAssignments();
    } catch (error) {
      console.error('Error seeding mock data:', error);
      message.error('Không thể tạo dữ liệu mẫu');
    } finally {
      setLoading(false);
    }
  };

  // COMMENTED OUT - This table columns definition is not used in current implementation
  /*
  const columns = [
    {
      title: 'Tên bài tập',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <Space>
          <FileTextOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => {
        if (!date) return 'Không có hạn';
        const dueDate = new Date(date);
        const now = new Date();
        const isOverdue = now > dueDate;
        
        return (
          <Space>
            <ClockCircleOutlined style={{ color: isOverdue ? '#ff4d4f' : '#1890ff' }} />
            <span style={{ color: isOverdue ? '#ff4d4f' : 'inherit' }}>
              {dueDate.toLocaleDateString('vi-VN')}
            </span>
          </Space>
        );
      },
    },
    {
      title: 'Điểm',
      dataIndex: 'points',
      key: 'points',
      render: (points) => `${points || 10} điểm`,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        if (userRole !== '1') {
          // For teachers, show submission count
          const submissionCount = submissionsList.filter(sub => sub.assignmentId === record.id).length;
          return <Tag color="blue">{`Đã nộp: ${submissionCount || 0}`}</Tag>;
        }
        
        // For students
        const { color, text } = getAssignmentStatus(record);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => {
        if (userRole === '1') { // Student actions
          const submission = submissions[record.id];
          const isOverdue = record.dueDate && new Date() > new Date(record.dueDate);
          
          if (submission) {
            return (
              <Space>
                <Button 
                  size="small" 
                  onClick={() => handleSubmitClick(record)}
                >
                  Xem bài nộp
                </Button>
                {!submission.score && !isOverdue && (
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleSubmitClick(record)}
                  >
                    Nộp lại
                  </Button>
                )}
              </Space>
            );
          }
          
          return (
            <Button 
              type="primary" 
              size="small"
              disabled={isOverdue}
              onClick={() => handleSubmitClick(record)}
            >
              {isOverdue ? 'Đã quá hạn' : 'Nộp bài'}
            </Button>
          );
        } else { // Teacher actions
          return (
            <Space>
              <Button 
                type="primary"
                size="small"
                onClick={() => handleGradeClick(record)}
              >
                Chấm bài
              </Button>
              <Button 
                size="small"
                onClick={() => {
                  handleEditAssignment(record);
                }}
              >
                Sửa
              </Button>
            </Space>
          );
        }
      },
    },
  ];
  */

  // RENDER FUNCTIONS BASED ON USER ROLE

  // Student view components
  const renderStudentDashboard = () => {
    return (
      <div className="student-dashboard">
        <div className="header-actions" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            <Tag color="blue" style={{ marginRight: 8, fontSize: '14px' }}>HỌC SINH</Tag>
            Bài tập của tôi
          </Title>
        </div>
        
        <Tabs defaultActiveKey="pending" items={[
          {
            key: 'pending',
            label: 'Cần làm',
            children: renderStudentAssignmentsList(assignments.filter(assignment => {
              // Filter for assignments that are not overdue and not submitted
              return !submissions[assignment.id] && new Date(assignment.dueDate) > new Date();
            }))
          },
          {
            key: 'submitted',
            label: 'Đã nộp',
            children: renderStudentAssignmentsList(assignments.filter(assignment => 
              submissions[assignment.id] && 
              (submissions[assignment.id].score === null || submissions[assignment.id].score === undefined)
            ))
          },
          {
            key: 'graded',
            label: 'Đã chấm điểm',
            children: renderStudentAssignmentsList(assignments.filter(assignment => 
              submissions[assignment.id] && submissions[assignment.id].score !== null
            ))
          },
          {
            key: 'overdue',
            label: 'Quá hạn',
            children: renderStudentAssignmentsList(assignments.filter(assignment => 
              !submissions[assignment.id] && new Date(assignment.dueDate) < new Date()
            ))
          }
        ]} />
      </div>
    );
  };

  const renderStudentAssignmentsList = (assignmentsList) => {
    // Debug logging
    console.log('renderStudentAssignmentsList called with:', assignmentsList, 'Type:', typeof assignmentsList, 'IsArray:', Array.isArray(assignmentsList));
    
    // Ensure assignmentsList is an array
    if (!Array.isArray(assignmentsList) || assignmentsList.length === 0) {
      return <Empty description="Không có bài tập nào" />;
    }

    return (
      <div className="assignments-list">
        {assignmentsList.map(assignment => {
          const status = getAssignmentStatus(assignment);
          const submission = submissions[assignment.id];
          
          return (
            <Card 
              key={assignment.id}
              style={{ marginBottom: 16 }}
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FileTextOutlined style={{ marginRight: 8 }} />
                  {assignment.title}
                </div>
              }
              extra={
                <Space>
                  <Tag color="blue">
                    <ClockCircleOutlined /> Hạn nộp: {moment(assignment.dueDate).format('DD/MM/YYYY HH:mm')}
                  </Tag>
                  <Tag color={status.color}>{status.text}</Tag>
                </Space>
              }
              actions={[
                submission ? (
                  submission.score !== null ? (
                    <Button key="view" onClick={() => handleViewGraded(assignment)}>
                      Xem điểm & Nhận xét
                    </Button>
                  ) : (
                    <Button key="edit" onClick={() => handleSubmitClick(assignment)}>
                      Sửa bài nộp
                    </Button>
                  )
                ) : (
                  <Button 
                    key="submit" 
                    type="primary" 
                    disabled={new Date(assignment.dueDate) < new Date()}
                    onClick={() => handleSubmitClick(assignment)}
                  >
                    Nộp bài
                  </Button>
                )
              ]}
            >
              <div className="assignment-description" style={{ marginBottom: 16 }}>
                {assignment.description}
              </div>
              <div className="assignment-details">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Điểm tối đa: {assignment.points}</Text>
                  {submission && submission.score !== null && (
                    <Text strong>Điểm của bạn: {submission.score}/{assignment.points}</Text>
                  )}
                </div>
                {submission && submission.submittedAt && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Đã nộp lúc: {moment(submission.submittedAt).format('DD/MM/YYYY HH:mm')}</Text>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  // Teacher view components
  const renderTeacherDashboard = () => {
    return (
      <div className="teacher-dashboard">
        <div className="header-actions" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            <Tag color="green" style={{ marginRight: 8, fontSize: '14px' }}>GIẢNG VIÊN</Tag>
            Quản lý bài tập
          </Title>
          <Space>
            {isAdmin && (
              <Button 
                onClick={handleSeedMockData}
                style={{ marginRight: 8 }}
              >
                Tạo dữ liệu mẫu
              </Button>
            )}
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => {
                form.resetFields();
                setCreateModalVisible(true);
              }}
            >
              Tạo bài tập
            </Button>
          </Space>
        </div>
        
        <Tabs defaultActiveKey="all" items={[
          {
            key: 'all',
            label: 'Tất cả bài tập',
            children: renderTeacherAssignmentsList(assignments)
          },
          {
            key: 'needGrading',
            label: 'Cần chấm điểm',
            children: renderTeacherAssignmentsList(assignments.filter(assignment => {
              // Filter for assignments that have ungraded submissions
              const hasUngradedSubmissions = submissionsList.some(
                sub => sub.assignmentId === assignment.id && (sub.score === null || sub.score === undefined)
              );
              return hasUngradedSubmissions;
            }))
          },
          {
            key: 'upcoming',
            label: 'Sắp đến hạn',
            children: renderTeacherAssignmentsList(assignments.filter(assignment => 
              new Date(assignment.dueDate) > new Date()
            ))
          },
          {
            key: 'past',
            label: 'Đã hết hạn',
            children: renderTeacherAssignmentsList(assignments.filter(assignment => 
              new Date(assignment.dueDate) < new Date()
            ))
          }
        ]} />
      </div>
    );
  };

  const renderTeacherAssignmentsList = (assignmentsList) => {
    // Debug logging
    console.log('renderTeacherAssignmentsList called with:', assignmentsList, 'Type:', typeof assignmentsList, 'IsArray:', Array.isArray(assignmentsList));
    
    // Ensure assignmentsList is an array
    if (!Array.isArray(assignmentsList) || assignmentsList.length === 0) {
      return <Empty description="Không có bài tập nào" />;
    }

    return (
      <div className="assignments-list">
        {assignmentsList.map(assignment => (
          <Card 
            key={assignment.id}
            style={{ marginBottom: 16 }}
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FileTextOutlined style={{ marginRight: 8 }} />
                {assignment.title}
              </div>
            }
            extra={
              <Space>
                <Tag color="blue">
                  <ClockCircleOutlined /> Hạn nộp: {moment(assignment.dueDate).format('DD/MM/YYYY HH:mm')}
                </Tag>
                <Tag color="purple">Điểm: {assignment.points}</Tag>
              </Space>
            }
            actions={[
              <Button key="grade" type="primary" onClick={() => handleGradeClick(assignment)}>
                Xem & Chấm bài nộp
              </Button>,
              <Button key="edit" onClick={() => handleEditAssignment(assignment)}>
                Sửa bài tập
              </Button>
            ]}
          >
            <div className="assignment-description" style={{ marginBottom: 16 }}>
              {assignment.description}
            </div>
            <div className="assignment-stats">
              {renderSubmissionStats(assignment)}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderSubmissionStats = (assignment) => {
    // Count submissions for this assignment
    const totalSubmissions = submissionsList.filter(sub => sub.assignmentId === assignment.id).length;
    const gradedSubmissions = submissionsList.filter(
      sub => sub.assignmentId === assignment.id && sub.score !== null && sub.score !== undefined
    ).length;
    
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Text>Đã nộp: {totalSubmissions} sinh viên</Text>
        <Text>Đã chấm: {gradedSubmissions}/{totalSubmissions}</Text>
      </div>
    );
  };

  const handleViewGraded = (assignment) => {
    const submission = submissions[assignment.id];
    if (!submission) return;
    
    Modal.info({
      title: `Kết quả bài tập: ${assignment.title}`,
      width: 600,
      content: (
        <div className="graded-submission-details">
          <div style={{ marginBottom: 16 }}>
            <Text strong>Điểm số:</Text> {submission.score}/{assignment.points}
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <Text strong>Nhận xét của giáo viên:</Text>
            <div style={{ padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 4, marginTop: 8 }}>
              {submission.feedback || 'Không có nhận xét'}
            </div>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <Text strong>Bài nộp của bạn:</Text>
            <div style={{ marginTop: 8 }}>
              <a href={submission.fileSubmissionUrl} target="_blank" rel="noopener noreferrer">
                {submission.fileSubmissionUrl.split('/').pop()}
              </a>
            </div>
          </div>
          
          {submission.comment && (
            <div>
              <Text strong>Ghi chú của bạn:</Text>
              <div style={{ padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 4, marginTop: 8 }}>
                {submission.comment}
              </div>
            </div>
          )}
        </div>
      ),
      okText: 'Đóng',
    });
  };

  // Shared UI Components
  const renderAssignmentCreationModal = () => {
    return (
      <Modal
        title="Giao bài tập mới"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAssignment}
        >
          <Form.Item
            name="title"
            label="Tiêu đề bài tập"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài tập' }]}
          >
            <Input placeholder="Nhập tiêu đề bài tập" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả / Hướng dẫn"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả bài tập' }]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả chi tiết và hướng dẫn làm bài" />
          </Form.Item>
          
          <Form.Item
            name="dueDate"
            label="Hạn nộp bài"
            rules={[{ required: true, message: 'Vui lòng chọn hạn nộp bài' }]}
          >
            <DatePicker 
              showTime 
              format="DD/MM/YYYY HH:mm" 
              placeholder="Chọn ngày và giờ"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="points"
            label="Điểm tối đa"
            rules={[{ required: true, message: 'Vui lòng nhập điểm tối đa' }]}
            initialValue={100}
          >
            <Input type="number" min={0} max={1000} />
          </Form.Item>
          
          <Form.Item
            name="fileAttachmentUrl"
            label="Tệp đính kèm (Tùy chọn)"
          >
            <Upload
              maxCount={1}
              beforeUpload={() => false}
            >
              <Button icon={<FileTextOutlined />}>Chọn tệp</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button style={{ marginRight: 8 }} onClick={() => setCreateModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Giao bài
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  const renderGradingDrawer = () => {
    return (
      <Drawer
        title={
          <div>
            <div>Chấm bài tập</div>
            {selectedAssignment && (
              <Text type="secondary" style={{ fontSize: 14 }}>
                {selectedAssignment.title}
              </Text>
            )}
          </div>
        }
        width={720}
        onClose={() => {
          setGradingDrawerVisible(false);
          setSelectedSubmission(null);
        }}
        visible={gradingDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          selectedSubmission ? (
            <Button type="primary" onClick={handleGradeSubmission}>
              Lưu điểm
            </Button>
          ) : null
        }
      >
        {selectedSubmission ? (
          <div className="submission-details">
            <div style={{ marginBottom: 16 }}>
              <Text strong>Sinh viên:</Text> {selectedSubmission.student.fullName}
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>Thời gian nộp:</Text> {moment(selectedSubmission.submittedAt).format('DD/MM/YYYY HH:mm')}
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>Bài nộp:</Text>
              <div style={{ marginTop: 8 }}>
                <a href={selectedSubmission.fileSubmissionUrl} target="_blank" rel="noopener noreferrer">
                  {selectedSubmission.fileSubmissionUrl.split('/').pop()}
                </a>
              </div>
            </div>
            
            {selectedSubmission.comment && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>Ghi chú của sinh viên:</Text>
                <div style={{ padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 4, marginTop: 8 }}>
                  {selectedSubmission.comment}
                </div>
              </div>
            )}
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>Điểm số:</Text>
              <Input 
                type="number" 
                min={0} 
                max={selectedAssignment ? selectedAssignment.points : 100}
                value={gradeValue}
                onChange={e => setGradeValue(e.target.value)}
                placeholder={`Điểm (tối đa: ${selectedAssignment ? selectedAssignment.points : 100})`}
                style={{ width: '100%', marginTop: 8 }}
              />
            </div>
            
            <div>
              <Text strong>Nhận xét:</Text>
              <TextArea 
                rows={4} 
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Nhập nhận xét cho sinh viên"
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
        ) : (
          <div className="submissions-list">
            <Table
              dataSource={submissionsList}
              rowKey="id"
              columns={[
                {
                  title: 'Sinh viên',
                  dataIndex: ['student', 'fullName'],
                  key: 'studentName',
                },
                {
                  title: 'Thời gian nộp',
                  dataIndex: 'submittedAt',
                  key: 'submittedAt',
                  render: text => moment(text).format('DD/MM/YYYY HH:mm'),
                },
                {
                  title: 'Trạng thái',
                  key: 'status',
                  render: (_, record) => (
                    <Tag color={record.score !== null && record.score !== undefined ? 'success' : 'processing'}>
                      {record.score !== null && record.score !== undefined ? 'Đã chấm điểm' : 'Chưa chấm điểm'}
                    </Tag>
                  ),
                },
                {
                  title: 'Thao tác',
                  key: 'action',
                  render: (_, record) => (
                    <Button type="primary" onClick={() => {
                      setSelectedSubmission(record);
                      setGradeValue(record.score !== null && record.score !== undefined ? record.score.toString() : '');
                      setFeedback(record.feedback || '');
                    }}>
                      {record.score !== null && record.score !== undefined ? 'Sửa điểm' : 'Chấm điểm'}
                    </Button>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Drawer>
    );
  };

  const renderSubmissionDrawer = () => {
    return (
      <Drawer
        title={
          <div>
            <div>Nộp bài tập</div>
            {selectedAssignment && (
              <Text type="secondary" style={{ fontSize: 14 }}>
                {selectedAssignment.title}
              </Text>
            )}
          </div>
        }
        width={520}
        onClose={() => {
          setSubmitDrawerVisible(false);
          setSelectedAssignment(null);
        }}
        visible={submitDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Button type="primary" onClick={handleSubmitAssignment}>
            Nộp bài
          </Button>
        }
      >
        {selectedAssignment && (
          <div className="submission-form">
            <div style={{ marginBottom: 16 }}>
              <Text strong>Hạn nộp:</Text> {moment(selectedAssignment.dueDate).format('DD/MM/YYYY HH:mm')}
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <Text strong>Tải lên bài làm:</Text>
              <Dragger
                fileList={fileList}
                beforeUpload={() => false}
                onChange={info => {
                  setFileList(info.fileList.slice(-1));
                }}
                onRemove={() => {
                  setFileList([]);
                }}
                maxCount={1}
                style={{ marginTop: 8 }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Nhấp hoặc kéo tệp vào khu vực này để tải lên</p>
                <p className="ant-upload-hint">Chỉ hỗ trợ tải lên một tệp duy nhất.</p>
              </Dragger>
            </div>
            
            <div>
              <Text strong>Ghi chú (không bắt buộc):</Text>
              <TextArea 
                rows={4} 
                value={submissionComment}
                onChange={e => setSubmissionComment(e.target.value)}
                placeholder="Nhập ghi chú cho giáo viên"
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
        )}
      </Drawer>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Render appropriate view based on user role
  const renderMainContent = () => {
    // If no role is detected, show error message
    if (!userRole || !userId) {
      return (
        <div className="text-center p-8">
          <h2>⚠️ Lỗi phân quyền</h2>
          <p>Không thể xác định vai trò người dùng. Vui lòng đăng nhập lại.</p>
          <Button type="primary" onClick={() => window.location.href = '/login'}>
            Đăng nhập lại
          </Button>
        </div>
      );
    }

    // Student view for role '1' or 'STUDENT'
    if (userRole === '1' || userRole === 'STUDENT') {
      return renderStudentDashboard();
    }
    
    // Teacher view for role '2' or 'TEACHER' 
    if (userRole === '2' || userRole === 'TEACHER') {
      return renderTeacherDashboard();
    }
    
    // Admin view for role '0' or 'ADMIN'
    if (userRole === '0' || userRole === 'ADMIN') {
      return renderTeacherDashboard(); // Admins can see teacher view
    }
    
    // Manager view for role '3' or 'MANAGER'
    if (userRole === '3' || userRole === 'MANAGER') {
      return renderTeacherDashboard(); // Managers can see teacher view
    }
    
    // If role is not recognized, show error
    return (
      <div className="text-center p-8">
        <h2>⚠️ Vai trò không được hỗ trợ</h2>
        <p>Vai trò "{userRole}" không được hỗ trợ cho trang này.</p>
        <Button type="primary" onClick={() => window.location.href = '/login'}>
          Đăng nhập lại
        </Button>
      </div>
    );
  };

  return (
    <div className="assignments-page">
      {/* Main content based on user role */}
      {renderMainContent()}
      
      {/* Shared UI components */}
      {renderAssignmentCreationModal()}
      {renderGradingDrawer()}
      {renderSubmissionDrawer()}
    </div>
  );
}

export default AssignmentsPage;
