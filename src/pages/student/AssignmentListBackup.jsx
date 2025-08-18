import { CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Typography } from 'antd';

const { Title, Text } = Typography;

const AssignmentListBackup = () => {
    // Sample data for testing
    const sampleAssignments = [
        {
            id: 1,
            title: "Bài tập 1: Giới thiệu bản thân",
            description: "Viết một đoạn văn ngắn giới thiệu về bản thân, sở thích và mục tiêu học tập. Độ dài khoảng 200-300 từ.",
            dueDate: "2024-12-30T23:59:59",
            points: 100,
            submitted: false
        },
        {
            id: 2,
            title: "Bài tập 2: Tìm hiểu về lập trình",
            description: "Nghiên cứu về một ngôn ngữ lập trình mà bạn quan tâm. Trình bày ưu điểm, nhược điểm và ứng dụng thực tế.",
            dueDate: "2025-01-15T23:59:59",
            points: 150,
            submitted: false
        },
        {
            id: 3,
            title: "Bài tập 3: Dự án nhóm",
            description: "Làm việc theo nhóm để tạo ra một ứng dụng web đơn giản. Yêu cầu có giao diện thân thiện và chức năng cơ bản.",
            dueDate: "2025-02-01T23:59:59",
            points: 200,
            submitted: false
        }
    ];

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

    return (
        <div className="space-y-4">
            <Title level={4}>Danh sách bài tập</Title>
            <div style={{ marginBottom: 16, padding: 8, backgroundColor: '#f0f0f0', border: '1px solid #d9d9d9', borderRadius: 4 }}>
                <Text type="secondary">
                    <strong>Lưu ý:</strong> Đây là dữ liệu mẫu. API đang được kết nối...
                </Text>
            </div>
            
            {sampleAssignments.map((assignment) => {
                const status = getAssignmentStatus(assignment.dueDate);
                
                return (
                    <Card 
                        key={assignment.id}
                        className="border border-gray-200 hover:shadow-md transition-shadow"
                        styles={{
                          body: { padding: '20px' }
                        }}
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
                                    
                                    <div className="flex items-center gap-1">
                                        <span>Điểm tối đa: {assignment.points}/{assignment.points}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <Button 
                                    type="primary" 
                                    size="small"
                                    onClick={() => {
                                        alert(`Xem chi tiết bài tập: ${assignment.title}`);
                                    }}
                                >
                                    Xem chi tiết
                                </Button>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default AssignmentListBackup;
