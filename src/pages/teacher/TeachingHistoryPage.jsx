import { Alert, Space, Spin, Table, Typography } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { teacherClassroomService } from '../../services/teacherClassroomService';

const { Title, Paragraph } = Typography;

const TeachingHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await teacherClassroomService.getTeachingHistory();
                setHistory(response.data || response); // Handle both response formats
            } catch (err) {
                setError('Không thể tải lịch sử giảng dạy. Vui lòng thử lại.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const columns = [
        {
            title: 'Tên Buổi Học',
            dataIndex: 'lectureTitle',
            key: 'lectureTitle',
        },
        {
            title: 'Lớp Học',
            dataIndex: 'classroomName',
            key: 'classroomName',
        },
        {
            title: 'Ngày Dạy',
            dataIndex: 'lectureDate',
            key: 'lectureDate',
            render: (date) => moment(date).format('DD/MM/YYYY')
        },
        {
            title: 'Thời Gian Ghi Nhận',
            dataIndex: 'clockInTime',
            key: 'clockInTime',
            render: (time) => (
                <span style={{ color: '#52c41a', fontWeight: 500 }}>
                    {moment(time).format('HH:mm:ss, DD/MM/YYYY')}
                </span>
            )
        }
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Lỗi"
                description={error}
                type="error"
                showIcon
                style={{ maxWidth: '800px', margin: '50px auto' }}
            />
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Title level={2}>Lịch Sử Giảng Dạy</Title>
                    <Paragraph type="secondary">
                        Đây là danh sách các buổi dạy đã được hệ thống tự động ghi nhận dựa trên hành động điểm danh của bạn.
                    </Paragraph>
                </div>

                <Table
                    columns={columns}
                    dataSource={history}
                    rowKey="lectureId"
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: 'Chưa có lịch sử nào được ghi nhận' }}
                    bordered
                />
            </Space>
        </div>
    );
};

export default TeachingHistoryPage; 