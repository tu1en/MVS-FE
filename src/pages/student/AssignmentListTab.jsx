import { CalendarOutlined, CheckCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Empty, message, Select, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssignmentService from '../../services/assignmentService';

const { Title, Text } = Typography;
const { Option } = Select;

const AssignmentListTab = () => {
    const [assignments, setAssignments] = useState([]);
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { courseId } = useParams();
    const navigate = useNavigate();

    console.log('AssignmentListTab rendered with courseId:', courseId);

    // Fetch classes for filter
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                // Giả sử có API để lấy danh sách lớp của học sinh
                // Nếu không có, bạn có thể hardcode hoặc lấy từ context
                const response = await AssignmentService.getStudentClasses();
                setClasses(response || []);
            } catch (err) {
                console.error('Error fetching classes:', err);
            }
        };
        fetchClasses();
    }, []);

    useEffect(() => {
        const fetchAssignments = async () => {
            setIsLoading(true);
            try {
                console.log('Fetching assignments for courseId:', courseId);
                console.log('Current URL:', window.location.href);
                
                const response = await AssignmentService.getAssignmentsByClassroom(courseId);
                console.log('Assignment response:', response);
                console.log('Assignment response type:', typeof response);
                console.log('Is response array:', Array.isArray(response));
                
                setAssignments(response || []);
                setFilteredAssignments(response || []);
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

    // Filter assignments when selectedClass changes
    useEffect(() => {
        if (selectedClass) {
            const filtered = assignments.filter(assignment => 
                assignment.classroomId === selectedClass || 
                assignment.classroom?.id === selectedClass ||
                assignment.classId === selectedClass
            );
            setFilteredAssignments(filtered);
        } else {
            setFilteredAssignments(assignments);
        }
    }, [selectedClass, assignments]);

    const handleClassChange = (value) => {
        setSelectedClass(value);
    };

    const clearFilter = () => {
        setSelectedClass(null);
    };

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

    if (filteredAssignments.length === 0 && selectedClass && !isLoading) {
        return (
            <div>
                <Title level={4}>Danh sách bài tập</Title>
                <div className="flex justify-end mb-4">
                    <Select
                        defaultValue="Tất cả lớp"
                        style={{ width: 120 }}
                        onChange={handleClassChange}
                        onClear={clearFilter}
                    >
                        <Option value="">Tất cả lớp</Option>
                        {classes.map(classItem => (
                            <Option key={classItem.id} value={classItem.id}>
                                {classItem.name}
                            </Option>
                        ))}
                    </Select>
                </div>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không có bài tập nào trong lớp đã chọn"
                />
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <Button 
                        type="default" 
                        onClick={clearFilter}
                    >
                        Xem tất cả bài tập
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Title level={4}>Danh sách bài tập</Title>
            
            {filteredAssignments.length > 0 && (
                <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-500">
                        {selectedClass 
                            ? `Đang hiển thị bài tập của lớp đã chọn (${filteredAssignments.length} bài tập)`
                            : `Tổng cộng ${assignments.length} bài tập`
                        }
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Lọc theo lớp:</span>
                        <Select
                            placeholder="Chọn lớp"
                            style={{ width: 150 }}
                            value={selectedClass || undefined}
                            onChange={handleClassChange}
                            allowClear
                            onClear={clearFilter}
                        >
                            <Option value="">Tất cả lớp</Option>
                            {classes.map(classItem => (
                                <Option key={classItem.id} value={classItem.id}>
                                    {classItem.name}
                                </Option>
                            ))}
                        </Select>
                        {selectedClass && (
                            <Button size="small" onClick={clearFilter}>
                                Xóa bộ lọc
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {filteredAssignments.map((assignment) => {
                const status = getAssignmentStatus(assignment.dueDate);
                
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
                                
                                {assignment.submitted && (
                                    <div className="flex items-center gap-1 text-green-600 text-xs">
                                        <CheckCircleOutlined />
                                        <span>Đã nộp</span>
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
