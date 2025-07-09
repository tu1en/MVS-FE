import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Alert, Card, Col, Row, Spin, Statistic, Table, Tag, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import attendanceService from '../../services/attendanceService';

const { Title, Text } = Typography;

const MyAttendancePage = () => {
    console.log("MyAttendancePage rendered");
    const { courseId } = useParams();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("useEffect triggered. courseId:", courseId);
        const fetchHistory = async () => {
            if (!courseId) {
                console.error("Course ID is missing from URL params.");
                setError("Course ID is missing.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                console.log(`Attempting to fetch attendance history for courseId: ${courseId}`);
                const data = await attendanceService.getMyAttendanceHistory(courseId);
                console.log("API call successful. Data received:", data);
                setHistory(data);
            } catch (err) {
                console.error("API call failed:", err);
                setError('Failed to load attendance history. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [courseId]);

    const attendanceStats = useMemo(() => {
        if (!history || history.length === 0) {
            return { present: 0, absent: 0, late: 0, excused: 0, total: 0, percentage: 0 };
        }
        const stats = history.reduce((acc, record) => {
            acc[record.status.toLowerCase()] = (acc[record.status.toLowerCase()] || 0) + 1;
            return acc;
        }, {});

        const total = history.length;
        const present = stats.present || 0;
        const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

        return {
            present,
            absent: stats.absent || 0,
            late: stats.late || 0,
            excused: stats.excused || 0,
            total,
            percentage,
        };
    }, [history]);

    const columns = [
        {
            title: 'Lecture Title',
            dataIndex: 'lectureTitle',
            key: 'lectureTitle',
        },
        {
            title: 'Date',
            dataIndex: 'sessionDate',
            key: 'sessionDate',
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.sessionDate) - new Date(b.sessionDate),
            defaultSortOrder: 'descend',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Present', value: 'PRESENT' },
                { text: 'Absent', value: 'ABSENT' },
                { text: 'Late', value: 'LATE' },
                { text: 'Excused', value: 'EXCUSED' },
            ],
            onFilter: (value, record) => record.status.indexOf(value) === 0,
            render: (status) => {
                let color;
                let icon;
                switch (status) {
                    case 'PRESENT':
                        color = 'green';
                        icon = <CheckCircleOutlined />;
                        break;
                    case 'ABSENT':
                        color = 'red';
                        icon = <CloseCircleOutlined />;
                        break;
                    case 'LATE':
                        color = 'orange';
                        icon = <ClockCircleOutlined />;
                        break;
                    case 'EXCUSED':
                        color = 'blue';
                        icon = <QuestionCircleOutlined />;
                        break;
                    default:
                        color = 'grey';
                }
                return <Tag color={color} icon={icon} key={status}>{status}</Tag>;
            },
        },
    ];

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
    }

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon />;
    }

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>My Attendance Record</Title>
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                    <Col span={6}>
                        <Statistic title="Attendance Rate" value={attendanceStats.percentage} suffix="%" />
                    </Col>
                    <Col span={4}>
                        <Statistic title="Present" value={attendanceStats.present} valueStyle={{ color: '#3f8600' }} />
                    </Col>
                    <Col span={4}>
                        <Statistic title="Absent" value={attendanceStats.absent} valueStyle={{ color: '#cf1322' }} />
                    </Col>
                    <Col span={4}>
                        <Statistic title="Late" value={attendanceStats.late} valueStyle={{ color: '#faad14' }} />
                    </Col>
                    <Col span={6}>
                         <Statistic title="Total Sessions" value={attendanceStats.total} />
                    </Col>
                </Row>
            </Card>

            <Table
                columns={columns}
                dataSource={history}
                rowKey={(record) => `${record.lectureId}-${record.sessionDate}`}
                pagination={{ pageSize: 10 }}
                bordered
                title={() => 'Detailed History'}
            />

            <Text type="secondary" style={{ marginTop: 16, display: 'block' }}>
                Note: If you find any discrepancies in your attendance record, please contact your instructor directly for assistance.
            </Text>
        </div>
    );
};

export default MyAttendancePage; 