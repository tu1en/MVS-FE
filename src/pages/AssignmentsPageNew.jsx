import { ClockCircleOutlined, FileOutlined, FileTextOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { App, Button, DatePicker, Descriptions, Divider, Form, Input, InputNumber, Modal, Select, Space, Spin, Table, Tabs, Tag, Typography, Upload } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssignmentStatusCell from '../components/AssignmentStatusCell';
import DebugPanel from '../components/DebugPanel';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { useAuth } from '../context/AuthContext';
import AssignmentService from '../services/assignmentService';
import ClassroomService from '../services/classroomService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;
const { Option } = Select;

/**
 * AssignmentsPage component for managing assignments
 * @returns {JSX.Element} AssignmentsPage component
 */
function AssignmentsPageNew() {
  const { message } = App.useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { courseId } = useParams(); // Get courseId from URL
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [pastAssignments, setPastAssignments] = useState([]);
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
  const [teacherClassrooms, setTeacherClassrooms] = useState([]);
  const [form] = Form.useForm();
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
  const [isGradeModalVisible, setIsGradeModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [grading, setGrading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [submissionForm] = Form.useForm();
  const [gradeForm] = Form.useForm();
  const [assignmentForm] = Form.useForm();
  const [showSubmissionDetail, setShowSubmissionDetail] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [grades, setGrades] = useState({});

  // Load grades from localStorage when component mounts or selected assignment changes
  useEffect(() => {
    if (selectedAssignment) {
      const localStorageKey = `assignment_grades_${selectedAssignment.id}`;
      const savedGrades = localStorage.getItem(localStorageKey);
      if (savedGrades) {
        try {
          const parsedGrades = JSON.parse(savedGrades);
          console.log(`Loaded grades from localStorage for assignment ${selectedAssignment.id}:`, parsedGrades);
          setGrades(parsedGrades);
        } catch (error) {
          console.error('Error parsing grades from localStorage:', error);
        }
      }
    }
  }, [selectedAssignment]);

  // Get user info from context, not localStorage
  const userId = user?.id;
  const userRole = user?.role?.replace('ROLE_', '') || localStorage.getItem('role')?.replace('ROLE_', '');
  const isAdmin = userRole === 'TEACHER' || userRole === 'ADMIN'; // Adjust role name as per your system

  // Only log in development environment
  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_DEBUG_ROLES === 'true') {
    console.log('AssignmentsPageNew - Role Debug:', {
      userId,
      userRole,
      userFromContext: user
    });
  }

  useEffect(() => {
    // Use real API calls instead of mock data
    if (userId && userRole) { // Ensure user info is available before fetching
      fetchData();
    }
  }, [userId, userRole]); // Rerun when user info changes

  const fetchTeacherClassrooms = async () => {
    try {
      const response = await ClassroomService.getClassroomsByCurrentTeacher();
      console.log('Fetched teacher classrooms:', response);
      setTeacherClassrooms(response);
      setClassrooms(response);
    } catch (error) {
      console.error('Error fetching teacher classrooms:', error);
      // If error, set some mock classrooms for testing
      const mockClassrooms = [
        { id: 1, name: 'Lớp 10A1' },
        { id: 2, name: 'Lớp 11A2' },
        { id: 3, name: 'Lớp 12A3' }
      ];
      setTeacherClassrooms(mockClassrooms);
      setClassrooms(mockClassrooms);
    }
  };

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
      if (courseId) {
        // If courseId is present, fetch assignments for that specific course
        const assignments = await AssignmentService.getAssignmentsByClassroom(courseId);
        // You might want to split these into upcoming and past as well
        setUpcomingAssignments(assignments.filter(a => new Date(a.dueDate) >= new Date()));
        setPastAssignments(assignments.filter(a => new Date(a.dueDate) < new Date()));
      } else {
        // Fallback to original behavior if no courseId
        await fetchAssignments();
        if (userRole === 'STUDENT') {
          await fetchSubmissions();
        } else if (userRole === 'TEACHER') {
          await fetchTeacherClassrooms();
        }
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
      if (userRole === 'STUDENT') { // Adjust role name
        console.log('Fetching assignments for STUDENT role');
        const [upcoming, past] = await Promise.all([
          AssignmentService.getUpcomingAssignments(userId),
          AssignmentService.getPastAssignments(userId)
        ]);
        setUpcomingAssignments(Array.isArray(upcoming) ? upcoming : []);
        setPastAssignments(Array.isArray(past) ? past : []);
        // Combine for searching and other operations if needed, or remove if not necessary
        // setAssignments([...(Array.isArray(upcoming) ? upcoming : []), ...(Array.isArray(past) ? past : [])]);
      } else {
        let assignmentsData = [];
        if (userRole === 'TEACHER') { // Adjust role name
          console.log('Fetching assignments for TEACHER role');
          assignmentsData = await AssignmentService.getCurrentTeacherAssignments();
          console.log('Received teacher assignments data:', assignmentsData);
        } else {
          console.log('Fetching all assignments for ADMIN/MANAGER role');
          assignmentsData = await AssignmentService.getAllAssignments();
        }
        
        if (!Array.isArray(assignmentsData)) {
          console.warn('Assignments data is not an array:', assignmentsData);
          assignmentsData = [];
        }
        
        // For non-students, we can split into upcoming/past on the client
        const now = new Date();
        console.log('Current time:', now);
        console.log('Sample assignment data:', assignmentsData[0]);
        console.log('Total assignments from API:', assignmentsData.length);
        
        // Check what dueDate field is actually called
        const sampleAssignment = assignmentsData[0];
        if (sampleAssignment) {
          console.log('Assignment keys:', Object.keys(sampleAssignment));
          console.log('Due date field:', sampleAssignment.dueDate);
          console.log('End date field:', sampleAssignment.endDate);
          console.log('Deadline field:', sampleAssignment.deadline);
        }
        
        const upcoming = assignmentsData.filter(a => {
          // Handle different date formats from backend (LocalDateTime)
          let dueDate;
          if (a.dueDate) {
            // Check if dueDate is an array (Java LocalDateTime serialization)
            if (Array.isArray(a.dueDate)) {
              // Format: [year, month, day, hour, minute, second, nanosecond]
              // Note: month is 1-based in the array but 0-based in JavaScript Date
              const [year, month, day, hour, minute, second] = a.dueDate;
              dueDate = new Date(year, month - 1, day, hour, minute, second);
            } else {
              // Try to parse as ISO string or other format
              dueDate = new Date(a.dueDate);
            }
          } else if (a.endDate) {
            dueDate = Array.isArray(a.endDate) 
              ? new Date(a.endDate[0], a.endDate[1] - 1, a.endDate[2], a.endDate[3], a.endDate[4], a.endDate[5])
              : new Date(a.endDate);
          } else if (a.deadline) {
            dueDate = Array.isArray(a.deadline) 
              ? new Date(a.deadline[0], a.deadline[1] - 1, a.deadline[2], a.deadline[3], a.deadline[4], a.deadline[5])
              : new Date(a.deadline);
          } else {
            console.warn('No valid date field found for assignment:', a);
            return false;
          }
          
          const isValidDate = !isNaN(dueDate.getTime());
          const isUpcoming = isValidDate && dueDate >= now;
          
          console.log('Assignment:', a.title || a.name, 'Due:', dueDate, 'Valid:', isValidDate, 'Upcoming:', isUpcoming);
          return isUpcoming;
        });
        
        const past = assignmentsData.filter(a => {
          let dueDate;
          if (a.dueDate) {
            if (Array.isArray(a.dueDate)) {
              const [year, month, day, hour, minute, second] = a.dueDate;
              dueDate = new Date(year, month - 1, day, hour, minute, second);
            } else {
              dueDate = new Date(a.dueDate);
            }
          } else if (a.endDate) {
            dueDate = Array.isArray(a.endDate) 
              ? new Date(a.endDate[0], a.endDate[1] - 1, a.endDate[2], a.endDate[3], a.endDate[4], a.endDate[5])
              : new Date(a.endDate);
          } else if (a.deadline) {
            dueDate = Array.isArray(a.deadline) 
              ? new Date(a.deadline[0], a.deadline[1] - 1, a.deadline[2], a.deadline[3], a.deadline[4], a.deadline[5])
              : new Date(a.deadline);
          } else {
            return false;
          }
          
          const isValidDate = !isNaN(dueDate.getTime());
          return isValidDate && dueDate < now;
        });
        console.log('Setting upcoming assignments:', upcoming);
        console.log('Setting past assignments:', past);
        setUpcomingAssignments(upcoming);
        setPastAssignments(past);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        message.error('Bạn không có quyền xem bài tập.');
      } else {
        message.error('Không thể tải danh sách bài tập: ' + (error.response?.data?.message || error.message));
      }
      
      setUpcomingAssignments([]);
      setPastAssignments([]);
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
    if (!classroomId) {
      message.error("Vui lòng chọn lớp học.");
      return;
    }

    // Convert classroomId from object to number if needed
    const finalClassroomId = typeof classroomId === 'object' ? classroomId.id : classroomId;
    
    // Check if finalClassroomId is a valid number
    if (isNaN(parseInt(finalClassroomId))) {
      message.error("Mã lớp học không hợp lệ.");
      console.error("Invalid classroomId:", classroomId);
      return;
    }

    try {
      setCreating(true);
      const assignmentData = {
        title: values.title,
        description: values.description,
        dueDate: values.dueDate.toISOString(),
        points: values.points || values.maxScore || 10, // Backend expects 'points', not 'maxScore'
        classroomId: finalClassroomId, // Use the extracted ID
      };
      
      console.log('Assignment data to send:', assignmentData);
      
      // Call API to create assignment
      const result = await AssignmentService.createAssignment(assignmentData);
      console.log('Create assignment result:', result);
      
      message.success('Tạo bài tập thành công!');
      setIsCreateModalVisible(false);
      setEditingAssignment(null);
      assignmentForm.resetFields();
      
      // Refresh assignments list
      await fetchData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        message.error('Bạn không có quyền tạo bài tập.');
      } else {
        message.error('Không thể tạo bài tập: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setCreating(false);
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

  const fetchSubmissionsList = async (assignmentId) => {
    try {
      console.log(`Fetching submissions for assignment ${assignmentId}`);
      const fetchedSubmissions = await AssignmentService.getSubmissionsForAssignment(assignmentId);
      console.log(`Received ${fetchedSubmissions.length} submissions for assignment ${assignmentId}`);
      
      // Initialize grades state from fetched submissions
      const initialGrades = {};
      fetchedSubmissions.forEach(submission => {
        initialGrades[submission.id] = {
          score: submission.grade,
          feedback: submission.feedback
        };
      });
      
      setGrades(initialGrades);
      setSubmissionsList(fetchedSubmissions);
      return fetchedSubmissions;
    } catch (error) {
      console.error(`Error fetching submissions for assignment ${assignmentId}:`, error);
      message.error('Không thể tải danh sách bài nộp');
      return [];
    }
  };

  const handleGradeClick = async (assignment) => {
    console.log('Grading assignment:', assignment);
    setSelectedAssignment(assignment);
    setIsGradeModalVisible(true);
    
    // Fetch submissions for this assignment
    await fetchSubmissionsList(assignment.id);
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
    console.log('Editing assignment:', assignment);
    setEditingAssignment(assignment);
    
    // Reset form first
    assignmentForm.resetFields();
    
    // Convert dueDate from ISO string to moment object for DatePicker
    const initialValues = {
      ...assignment,
      dueDate: assignment.dueDate ? moment(assignment.dueDate) : null,
      classroomId: assignment.classroomId || (courseId ? parseInt(courseId, 10) : undefined)
    };
    
    console.log('Setting form values for editing:', initialValues);
    
    // Set the form values after reset
    assignmentForm.setFieldsValue(initialValues);
    
    // Open the creation modal in edit mode
    setIsCreateModalVisible(true);
  };

  const renderStudentDashboard = () => {
    return (
      <div className="student-dashboard">
        <div className="header-actions" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }} className="vietnamese-heading">
            <Tag color="blue" style={{ marginRight: 8, fontSize: '14px' }}>HỌC SINH</Tag>
            Bài tập của tôi
          </Title>
        </div>
        
        <Tabs 
          defaultActiveKey="pending"
          items={[
            {
              key: 'pending',
              label: 'Cần làm',
              children: renderStudentAssignmentsList(upcomingAssignments)
            },
            {
              key: 'submitted',
              label: 'Đã nộp',
              children: renderStudentAssignmentsList(upcomingAssignments.filter(assignment => 
                submissions[assignment?.id] && 
                (submissions[assignment?.id].score === null || submissions[assignment?.id].score === undefined)
              ))
            },
            {
              key: 'graded',
              label: 'Đã chấm điểm',
              children: renderStudentAssignmentsList(upcomingAssignments.filter(assignment => 
                submissions[assignment?.id] && submissions[assignment?.id].score !== null
              ))
            },
            {
              key: 'overdue',
              label: 'Quá hạn',
              children: renderStudentAssignmentsList(upcomingAssignments.filter(assignment => 
                !submissions[assignment?.id] && new Date(assignment?.dueDate) < new Date()
              ))
            }
          ]}
        />
      </div>
    );
  };

  const renderStudentAssignmentsList = (assignmentsList) => {
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
          // For students, show their specific submission status
          const { color, text } = getAssignmentStatus(record);
          return <Tag color={color} className="vietnamese-text">{text}</Tag>;
        },
      },
      {
        title: 'Hành động',
        key: 'actions',
        render: (_, record) => {
          if (userRole === 'STUDENT') {
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
          } else {
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

    return (
      <Table
        columns={columns}
        dataSource={assignmentsList}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '16px', backgroundColor: '#f9f9f9', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
              <Title level={5}>Chi tiết bài tập:</Title>
              <MarkdownRenderer content={record.description} />
              {record.fileAttachmentUrl && (
                <p style={{ marginTop: '10px' }}>
                  <strong>Tài liệu đính kèm:</strong>{' '}
                  <a href={record.fileAttachmentUrl} target="_blank" rel="noopener noreferrer">
                    Tải về
                  </a>
                </p>
              )}
            </div>
          ),
          rowExpandable: (record) => record.description,
        }}
      />
    );
  };

  // Teacher view components
  const renderTeacherDashboard = () => {
    return (
      <div className="teacher-dashboard">
        <div className="header-actions" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }} className="vietnamese-heading">
            <Tag color="green" style={{ marginRight: 8, fontSize: '14px' }}>GIẢNG VIÊN</Tag>
            Quản lý bài tập
          </Title>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              className="button-vietnamese" 
              onClick={() => {
                assignmentForm.resetFields();
                setIsCreateModalVisible(true);
              }}
            >
              Tạo bài tập
            </Button>
          </Space>
        </div>
        
        <Tabs 
          defaultActiveKey="all"
          items={[
            {
              key: 'all',
              label: 'Tất cả bài tập',
              children: renderTeacherAssignmentsList(upcomingAssignments)
            },
            {
              key: 'needGrading',
              label: 'Cần chấm điểm',
              children: renderTeacherAssignmentsList(upcomingAssignments.filter(assignment => {
                // Filter for assignments that have ungraded submissions
                const hasUngradedSubmissions = submissionsList.some(
                  sub => sub?.assignmentId === assignment?.id && (sub?.score === null || sub?.score === undefined)
                );
                return hasUngradedSubmissions;
              }))
            },
            {
              key: 'upcoming',
              label: 'Sắp đến hạn',
              children: renderTeacherAssignmentsList(upcomingAssignments.filter(assignment => 
                new Date(assignment?.dueDate) > new Date()
              ))
            },
            {
              key: 'past',
              label: 'Đã hết hạn',
              children: renderTeacherAssignmentsList(upcomingAssignments.filter(assignment => 
                new Date(assignment?.dueDate) < new Date()
              ))
            }
          ]}
        />
      </div>
    );
  };

  const renderTeacherAssignmentsList = (assignmentsList) => {
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
          // For teachers, use the dedicated component to show submission count
          return <AssignmentStatusCell assignmentId={record.id} />;
        },
      },
      {
        title: 'Hành động',
        key: 'actions',
        render: (_, record) => {
          if (userRole === 'STUDENT') {
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
          } else {
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
    
    return (
      <Table
        columns={columns}
        dataSource={assignmentsList}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '16px', backgroundColor: '#f9f9f9', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
              <Title level={5}>Mô tả chi tiết:</Title>
              <MarkdownRenderer content={record.description} />
            </div>
          ),
          rowExpandable: (record) => record.description,
        }}
      />
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
      title: `Điểm số: ${submission.score || 'Chưa chấm'}`,
      content: (
        <div>
          <p>Bài tập: {assignment.title}</p>
          <p>Điểm: {submission.score || 'Chưa chấm'}</p>
          <p>Nhận xét: {submission.feedback || 'Chưa có nhận xét'}</p>
        </div>
      ),
    });
  };

  const handleSaveGrade = async (submissionId) => {
    console.log(`Starting grade save for submission ${submissionId}`);
    setGrading(true);

    const score = grades[submissionId]?.score;
    const feedbackText = grades[submissionId]?.feedback;

    const gradeData = {
      score: score,
      feedback: feedbackText
    };
    console.log(`Grade data for submission ${submissionId}:`, gradeData);

    if (gradeData.score === undefined || gradeData.score === null) {
      console.log(`Missing grade data for submission ${submissionId}`);
      message.error('Vui lòng nhập điểm số.');
      setGrading(false);
      return;
    }

    try {
      console.log(`Saving grade for assignment ${selectedAssignment.id}, submission ${submissionId}:`, gradeData);
      await AssignmentService.gradeSubmission(selectedAssignment.id, submissionId, gradeData);
      message.success('Đã lưu điểm thành công!');
      
      // Refresh submissions for the current assignment
      console.log(`Refreshing submissions for assignment ${selectedAssignment.id}`);
      const updatedSubmissions = await fetchSubmissionsList(selectedAssignment.id);
      console.log(`Received ${updatedSubmissions.length} updated submissions after grading`);
      
      // Store the grades in localStorage to persist across page refreshes
      const localStorageKey = `assignment_grades_${selectedAssignment.id}`;
      localStorage.setItem(localStorageKey, JSON.stringify(grades));
      console.log(`Saved grades to localStorage with key: ${localStorageKey}`);

    } catch (error) {
      console.error('Error saving grade:', error);
      message.error('Đã xảy ra lỗi khi lưu điểm.');
    } finally {
      setGrading(false);
    }
  };

  const handleGradeChange = (submissionId, value) => {
    setGrades(prev => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], score: value }
    }));
  };

  const handleFeedbackChange = (submissionId, value) => {
    setGrades(prev => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], feedback: value }
    }));
  };

  // Render the appropriate dashboard based on user role
  return (
    <div className="assignments-container vietnamese-text">
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {userRole === 'STUDENT' ? renderStudentDashboard() : renderTeacherDashboard()}
        </>
      )}
      
      {/* Assignment submission modal */}
      <Modal
        title={currentAssignment ? `${isSubmitting ? 'Nộp bài:' : 'Chi tiết bài tập:'} ${currentAssignment.title}` : 'Nộp bài tập'}
        open={isSubmitModalVisible}
        onCancel={() => setIsSubmitModalVisible(false)}
        footer={null}
        width={800}
        className="vietnamese-text"
      >
        {currentAssignment && (
          <div>
            <Descriptions title="Thông tin bài tập" bordered column={1} className="vietnamese-text">
              <Descriptions.Item label="Tên bài tập">{currentAssignment.title}</Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                <MarkdownRenderer content={currentAssignment.description || 'Không có mô tả'} />
              </Descriptions.Item>
              <Descriptions.Item label="Hạn nộp">
                {currentAssignment.dueDate 
                  ? new Date(currentAssignment.dueDate).toLocaleString('vi-VN') 
                  : 'Không có hạn nộp'}
              </Descriptions.Item>
              <Descriptions.Item label="Điểm tối đa">{currentAssignment.points || 10} điểm</Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            {/* Display existing submission if available */}
            {submissions[currentAssignment.id] && (
              <>
                <Title level={5}>Bài nộp hiện tại:</Title>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Thời gian nộp">
                    {new Date(submissions[currentAssignment.id].submittedAt).toLocaleString('vi-VN')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nội dung">
                    <MarkdownRenderer content={submissions[currentAssignment.id].content || 'Không có nội dung'} />
                  </Descriptions.Item>
                  {submissions[currentAssignment.id].attachmentUrl && (
                    <Descriptions.Item label="Tệp đính kèm">
                      <a href={submissions[currentAssignment.id].attachmentUrl} target="_blank" rel="noopener noreferrer">
                        <FileOutlined /> {submissions[currentAssignment.id].attachmentName || 'Tải tệp đính kèm'}
                      </a>
                    </Descriptions.Item>
                  )}
                  {submissions[currentAssignment.id].score !== null && (
                    <Descriptions.Item label="Điểm số">
                      <Tag color="green">{submissions[currentAssignment.id].score} / {currentAssignment.points || 10}</Tag>
                    </Descriptions.Item>
                  )}
                  {submissions[currentAssignment.id].feedback && (
                    <Descriptions.Item label="Nhận xét">
                      {submissions[currentAssignment.id].feedback}
                    </Descriptions.Item>
                  )}
                </Descriptions>
                <Divider />
              </>
            )}
            
            {/* Submission form if due date has not passed or no submission exists */}
            {(!currentAssignment.dueDate || new Date() < new Date(currentAssignment.dueDate) || !submissions[currentAssignment.id]) && (
              <>
                <Title level={5}>{submissions[currentAssignment.id] ? 'Nộp lại bài:' : 'Nộp bài:'}</Title>
                <Form
                  form={submissionForm}
                  layout="vertical"
                  onFinish={handleSubmitAssignment}
                >
                  <Form.Item
                    name="content"
                    label="Nội dung bài nộp"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
                  >
                    <Input.TextArea rows={6} placeholder="Nhập nội dung bài nộp hoặc giải thích về file đính kèm..." />
                  </Form.Item>
                  
                  <Form.Item
                    name="attachment"
                    label="Tệp đính kèm (không bắt buộc)"
                  >
                    <Upload 
                      beforeUpload={file => {
                        setAttachmentFile(file);
                        return false;
                      }}
                      fileList={attachmentFile ? [attachmentFile] : []}
                      onRemove={() => setAttachmentFile(null)}
                    >
                      <Button icon={<UploadOutlined />}>Tải lên tệp</Button>
                    </Upload>
                  </Form.Item>
                  
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={submitting}>
                      Nộp bài
                    </Button>
                  </Form.Item>
                </Form>
              </>
            )}
          </div>
        )}
      </Modal>
      
      {/* Grade Submissions Modal */}
      <Modal
        title={`Chấm bài cho: ${selectedAssignment?.title}`}
        open={isGradeModalVisible}
        onCancel={() => setIsGradeModalVisible(false)}
        footer={null}
        width={1000}
        className="vietnamese-text"
      >
        {loading ? (
          <Spin />
        ) : submissionsList.length > 0 ? (
          <Table
            dataSource={submissionsList}
            rowKey="id"
            className="vietnamese-text"
            columns={[
              {
                title: 'Sinh viên',
                dataIndex: ['student', 'fullName'],
                key: 'studentName',
                className: 'vietnamese-text',
              },
              {
                title: 'Ngày nộp',
                dataIndex: 'submittedAt',
                key: 'submittedAt',
                render: (text) => moment(text).format('DD/MM/YYYY HH:mm'),
              },
              {
                title: 'Bài nộp',
                dataIndex: 'fileSubmissionUrl',
                key: 'file',
                render: (url) => <a href={url} target="_blank" rel="noopener noreferrer">Tải xuống</a>,
              },
              {
                title: 'Điểm',
                key: 'grade',
                render: (_, record) => (
                  <InputNumber
                    min={0}
                    max={selectedAssignment?.points || 100}
                    value={grades[record.id]?.score ?? record.score}
                    onChange={(value) => handleGradeChange(record.id, value)}
                    placeholder="Nhập điểm"
                  />
                ),
              },
              {
                title: 'Nhận xét',
                key: 'feedback',
                render: (_, record) => (
                  <TextArea
                    rows={2}
                    value={grades[record.id]?.feedback ?? record.feedback ?? ''}
                    onChange={(e) => handleFeedbackChange(record.id, e.target.value)}
                    placeholder="Nhập nhận xét"
                  />
                ),
              },
              {
                title: 'Hành động',
                key: 'action',
                render: (_, record) => (
                  <Button
                    type="primary"
                    onClick={() => handleSaveGrade(record.id)}
                    loading={grading && grades[record.id]}
                  >
                    Lưu
                  </Button>
                ),
              },
            ]}
          />
        ) : (
          <Text>Chưa có sinh viên nào nộp bài.</Text>
        )}
      </Modal>
      
      {/* Create/Edit Assignment Modal */}
      <Modal
        title={editingAssignment ? `Sửa bài tập: ${editingAssignment.title}` : 'Tạo bài tập mới'}
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={800}
        className="vietnamese-text"
      >
        <Form
          form={assignmentForm}
          layout="vertical"
          onFinish={handleCreateAssignment}
          className="form-vietnamese"
        >
          <Form.Item
            name="title"
            label="Tiêu đề bài tập"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài tập!' }]}
          >
            <Input placeholder="Nhập tiêu đề bài tập" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả bài tập"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả bài tập!' }]}
          >
            <Input.TextArea rows={6} placeholder="Nhập mô tả chi tiết bài tập..." />
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
          
          <Form.Item
            name="dueDate"
            label="Hạn nộp"
            rules={[{ required: true, message: 'Vui lòng chọn hạn nộp!' }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="Chọn hạn nộp"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < new Date().setHours(0,0,0,0)}
            />
          </Form.Item>
          
          <Form.Item
            name="points"
            label="Điểm tối đa"
            initialValue={10}
            rules={[{ required: true, message: 'Vui lòng nhập điểm tối đa!' }]}
          >
            <InputNumber min={1} max={100} placeholder="Nhập điểm tối đa" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={creating}>
              {editingAssignment ? "Cập nhật bài tập" : "Tạo bài tập"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Debug Panel - Only show in development environment */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel
          title="Assignment Debugging"
          data={{
            userId,
            userRole,
            courseId,
            assignmentCounts: {
              upcoming: upcomingAssignments.length,
              past: pastAssignments.length,
              submissionsList: submissionsList.length
            },
            uiState: {
              isGradeModalVisible,
              isCreateModalVisible,
              isSubmitModalVisible,
              loading,
              grading,
              creating
            },
            selectedAssignment: selectedAssignment ? {
              id: selectedAssignment.id,
              title: selectedAssignment.title,
              dueDate: selectedAssignment.dueDate
            } : null,
            classroomInfo: {
              courseId,
              classroomCount: classrooms.length,
              teacherClassroomCount: teacherClassrooms.length
            }
          }}
          onRunTest={() => {
            // Test function - fetch submissions for currently selected assignment
            if (selectedAssignment) {
              handleGradeClick(selectedAssignment);
            } else {
              console.log("No assignment selected for testing");
              message.info("Please select an assignment first");
            }
          }}
          onRefresh={() => fetchData()}
          collapsed={true}
        />
      )}
    </div>
  );
}

export default AssignmentsPageNew;