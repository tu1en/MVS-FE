import { CalendarOutlined, CheckCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Empty, Spin, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssignmentService from '../../services/assignmentService';

const { Title, Text } = Typography;

const AssignmentListTab = () => {
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState({}); // Store submissions by assignment ID
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { courseId } = useParams();
    const navigate = useNavigate();

    console.log('AssignmentListTab rendered with courseId:', courseId);

    useEffect(() => {
        const fetchAssignments = async () => {
            setIsLoading(true);
            try {
                console.log('🔍 DEBUG AssignmentListTab - Fetching assignments for courseId:', courseId);
                console.log('Current URL:', window.location.href);

                const response = await AssignmentService.getAssignmentsByClassroom(courseId);
                console.log('🔍 DEBUG AssignmentListTab - Assignment response:', response);
                console.log('Assignment response type:', typeof response);
                console.log('Is response array:', Array.isArray(response));

                setAssignments(response || []);

                // Fetch submissions for each assignment
                // Note: We'll use a hardcoded student ID for now since user context might not be available
                const studentId = 1; // TODO: Get from user context
                console.log('🔍 DEBUG AssignmentListTab - Fetching submissions for student:', studentId);

                if (response && response.length > 0) {
                    const submissionPromises = response.map(async (assignment) => {
                        try {
                            const submission = await SubmissionService.getStudentSubmission(assignment.id, studentId);
                            return { assignmentId: assignment.id, submission };
                        } catch (error) {
                            console.log(`🔍 DEBUG AssignmentListTab - No submission for assignment ${assignment.id}:`, error.message);
                            return { assignmentId: assignment.id, submission: null };
                        }
                    });

                    const submissionResults = await Promise.allSettled(submissionPromises);
                    const submissionsMap = {};

                    submissionResults.forEach((result) => {
                        if (result.status === 'fulfilled' && result.value) {
                            const { assignmentId, submission } = result.value;
                            if (submission) {
                                submissionsMap[assignmentId] = submission;
                                console.log(`🔍 DEBUG AssignmentListTab - Found submission for assignment ${assignmentId}:`, submission);
                            }
                        }
                    });

                    console.log('🔍 DEBUG AssignmentListTab - Final submissions map:', submissionsMap);
                    setSubmissions(submissionsMap);
                }

                setError(null);
            } catch (err) {
                console.error('Assignment fetch error:', err);
                console.error('Error response:', err.response);
                setError(`Failed to fetch assignments: ${err.message}`);
                message.error('Không thể tải danh sách bài tập');
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId) {
            fetchAssignments();
        }
    }, [courseId]);

    const getAssignmentStatus = (dueDate) => {
        const now = new Date();
        const due = new Date(dueDate);

        if (now > due) return { text: "Hết hạn", color: "red" };
        
        const timeDiff = due - now;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 1) return { text: "Sắp hết hạn", color: "orange" };
        if (daysDiff <= 3) return { text: "Còn ít thời gian", color: "yellow" };
        return { text: "Còn thời gian", color: "green" };
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) return <div className="text-center py-8"><Spin size="large" /></div>;
    if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

    if (assignments.length === 0 && !isLoading && !error) {
        return (
            <div>
                <Title level={4}>Danh sách bài tập</Title>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có bài tập nào được giao cho khóa học này"
                />
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <Button 
                        type="primary" 
                        onClick={() => window.location.reload()}
                    >
                        Tải lại
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Title level={4}>Danh sách bài tập</Title>
            
            {assignments.map((assignment) => {
                const status = getAssignmentStatus(assignment.dueDate);
                const submission = submissions[assignment.id]; // Get submission for this assignment

                return (
                    <Card 
                        key={assignment.id}
                        className="border border-gray-200 hover:shadow-md transition-shadow"
                        styles={{ body: { padding: '20px' } }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileTextOutlined className="text-blue-500" />
                                    <Title level={5} className="mb-0">{assignment.title}</Title>
                                    <Badge color={status.color} text={status.text} />
                                </div>
                                
                                <Text className="text-gray-600 block mb-3">
                                    {assignment.description}
                                </Text>
                                
                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <CalendarOutlined />
                                        <span>Hạn nộp: {formatDate(assignment.dueDate)}</span>
                                    </div>
                                    
                                    {assignment.maxGrade && (
                                        <div className="flex items-center gap-1">
                                            <span>Điểm tối đa: {assignment.maxGrade}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <Button 
                                    type="primary" 
                                    size="small"
                                    onClick={() => {
                                        // Navigate to assignment detail/submission page
                                        navigate(`/student/assignments/${assignment.id}`);
                                    }}
                                >
                                    Xem chi tiết
                                </Button>
                                
                                {submission && (
                                    <div className="flex items-center gap-1 text-green-600 text-xs">
                                        <CheckCircleOutlined />
                                        <span>Đã nộp</span>
                                        {submission.score !== null && (
                                            <span className="ml-2 text-blue-600 font-semibold">
                                                {submission.score}/{assignment.points || 100}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default AssignmentListTab;
