import { Alert, Card, Col, Empty, Row, Spin, Statistic, Table, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import managerReportService from '../../services/managerReportService';

const { TabPane } = Tabs;

const ManagerReports = () => {
    const [reports, setReports] = useState({
        attendance: null,
        performance: null,
        financial: null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    useEffect(() => {
        const fetchReports = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const token = localStorage.getItem('token');
                
                if (!token) {
                    setError('Bạn chưa đăng nhập');
                    setIsLoading(false);
                    return;
                }
                
                // Fetch real data from API
                const [attendanceData, performanceData, financialData] = await Promise.all([
                    managerReportService.getAttendanceReport('month'),
                    managerReportService.getPerformanceReport('semester'),
                    managerReportService.getFinancialReport('quarter')
                ]);
                
                setReports({
                    attendance: attendanceData,
                    performance: performanceData,
                    financial: financialData
                });
                
            } catch (error) {
                console.error('Error fetching reports:', error);
                setError('Không thể tải báo cáo. Vui lòng thử lại.');
                setReports({
                    attendance: null,
                    performance: null,
                    financial: null
                });
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchReports();
    }, []);

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(value);
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-96">
            <Spin size="large" tip="Đang tải báo cáo..." />
        </div>
    );

    if (error) return (
        <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
        />
    );

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Báo cáo Quản lý</h1>
            
            <Tabs defaultActiveKey="attendance">
                {/* Attendance Report Tab */}
                <TabPane tab="Báo cáo Điểm danh" key="attendance">
                    {reports.attendance ? (
                        <Card title={reports.attendance.title} className="mb-6">
                            <p className="mb-4 text-gray-600">{reports.attendance.description}</p>
                            
                            <Row gutter={16} className="mb-6">
                                <Col span={6}>
                                    <Statistic 
                                        title="Tổng số buổi học" 
                                        value={reports.attendance.data.totalSessions} 
                                        suffix="buổi"
                                    />
                                </Col>
                                <Col span={6}>
                                    <Statistic 
                                        title="Tổng số học viên" 
                                        value={reports.attendance.data.totalStudents} 
                                        suffix="học viên"
                                    />
                                </Col>
                                <Col span={6}>
                                    <Statistic 
                                        title="Tỷ lệ điểm danh" 
                                        value={reports.attendance.data.attendanceRate} 
                                        suffix="%" 
                                        precision={1}
                                    />
                                </Col>
                                <Col span={6}>
                                    <Statistic 
                                        title="Học viên vắng mặt" 
                                        value={reports.attendance.data.absentStudents} 
                                        suffix="học viên"
                                    />
                                </Col>
                            </Row>
                            
                            <h3 className="text-lg font-medium mb-4">Tỷ lệ điểm danh theo lớp</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={reports.attendance.data.classData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="className" />
                                    <YAxis domain={[80, 100]} />
                                    <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ điểm danh']} />
                                    <Legend />
                                    <Bar dataKey="attendanceRate" name="Tỷ lệ điểm danh (%)" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                            
                            <h3 className="text-lg font-medium mt-6 mb-4">Chi tiết điểm danh theo lớp</h3>
                            <Table 
                                dataSource={reports.attendance.data.classData}
                                rowKey="className"
                                columns={[
                                    { title: 'Lớp', dataIndex: 'className', key: 'className' },
                                    { title: 'Số học viên', dataIndex: 'studentCount', key: 'studentCount' },
                                    { 
                                        title: 'Tỷ lệ điểm danh', 
                                        dataIndex: 'attendanceRate', 
                                        key: 'attendanceRate',
                                        render: (rate) => `${rate}%`,
                                        sorter: (a, b) => a.attendanceRate - b.attendanceRate
                                    }
                                ]}
                            />
                        </Card>
                    ) : (
                        <Empty description="Không có dữ liệu báo cáo điểm danh" />
                    )}
                </TabPane>
                
                {/* Performance Report Tab */}
                <TabPane tab="Báo cáo Học tập" key="performance">
                    {reports.performance ? (
                        <Card title={reports.performance.title} className="mb-6">
                            <p className="mb-4 text-gray-600">{reports.performance.description}</p>
                            
                            <Row gutter={16} className="mb-6">
                                <Col span={6}>
                                    <Statistic 
                                        title="Tổng số học viên" 
                                        value={reports.performance.data.totalStudents} 
                                        suffix="học viên"
                                    />
                                </Col>
                                <Col span={6}>
                                    <Statistic 
                                        title="Điểm trung bình" 
                                        value={reports.performance.data.averageScore} 
                                        precision={1}
                                    />
                                </Col>
                                <Col span={6}>
                                    <Statistic 
                                        title="Học viên xuất sắc" 
                                        value={reports.performance.data.excellentCount} 
                                        suffix="học viên"
                                    />
                                </Col>
                                <Col span={6}>
                                    <Statistic 
                                        title="Học viên giỏi" 
                                        value={reports.performance.data.goodCount} 
                                        suffix="học viên"
                                    />
                                </Col>
                            </Row>
                            
                            <h3 className="text-lg font-medium mb-4">Phân bố học lực</h3>
                            <Row>
                                <Col span={12}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Xuất sắc', value: reports.performance.data.excellentCount },
                                                    { name: 'Giỏi', value: reports.performance.data.goodCount },
                                                    { name: 'Trung bình', value: reports.performance.data.averageCount },
                                                    { name: 'Dưới trung bình', value: reports.performance.data.belowAverageCount }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {[
                                                    { name: 'Xuất sắc', value: reports.performance.data.excellentCount },
                                                    { name: 'Giỏi', value: reports.performance.data.goodCount },
                                                    { name: 'Trung bình', value: reports.performance.data.averageCount },
                                                    { name: 'Dưới trung bình', value: reports.performance.data.belowAverageCount }
                                                ].map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value} học viên`, 'Số lượng']} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Col>
                                <Col span={12}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            data={reports.performance.data.subjectData}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="subject" />
                                            <YAxis domain={[0, 10]} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="averageScore" name="Điểm trung bình" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Col>
                            </Row>
                            
                            <h3 className="text-lg font-medium mt-6 mb-4">Chi tiết điểm theo môn học</h3>
                            <Table 
                                dataSource={reports.performance.data.subjectData}
                                rowKey="subject"
                                columns={[
                                    { title: 'Môn học', dataIndex: 'subject', key: 'subject' },
                                    { 
                                        title: 'Điểm trung bình', 
                                        dataIndex: 'averageScore', 
                                        key: 'averageScore',
                                        render: (score) => score.toFixed(1),
                                        sorter: (a, b) => a.averageScore - b.averageScore
                                    },
                                    { 
                                        title: 'Điểm cao nhất', 
                                        dataIndex: 'highestScore', 
                                        key: 'highestScore',
                                        render: (score) => score.toFixed(1)
                                    },
                                    { 
                                        title: 'Điểm thấp nhất', 
                                        dataIndex: 'lowestScore', 
                                        key: 'lowestScore',
                                        render: (score) => score.toFixed(1)
                                    }
                                ]}
                            />
                        </Card>
                    ) : (
                        <Empty description="Không có dữ liệu báo cáo học tập" />
                    )}
                </TabPane>
                
                {/* Financial Report Tab */}
                <TabPane tab="Báo cáo Tài chính" key="financial">
                    {reports.financial ? (
                        <Card title={reports.financial.title} className="mb-6">
                            <p className="mb-4 text-gray-600">{reports.financial.description}</p>
                            
                            <Row gutter={16} className="mb-6">
                                <Col span={8}>
                                    <Statistic 
                                        title="Tổng doanh thu" 
                                        value={reports.financial.data.totalRevenue} 
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic 
                                        title="Tổng chi phí" 
                                        value={reports.financial.data.totalExpenses} 
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic 
                                        title="Lợi nhuận" 
                                        value={reports.financial.data.netProfit} 
                                        formatter={(value) => formatCurrency(value)}
                                        valueStyle={{ color: '#3f8600' }}
                                    />
                                </Col>
                            </Row>
                            
                            <h3 className="text-lg font-medium mb-4">Chi tiết chi phí</h3>
                            <Row>
                                <Col span={12}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={reports.financial.data.expenseData || []}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="amount"
                                                nameKey="category"
                                                label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {(reports.financial.data.expenseData || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [formatCurrency(value), 'Chi phí']} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Col>
                                <Col span={12}>
                                    <Table 
                                        dataSource={reports.financial.data.expenseData || []}
                                        rowKey="category"
                                        pagination={false}
                                        columns={[
                                            { title: 'Danh mục', dataIndex: 'category', key: 'category' },
                                            { 
                                                title: 'Số tiền', 
                                                dataIndex: 'amount', 
                                                key: 'amount',
                                                render: (amount) => formatCurrency(amount)
                                            },
                                            { 
                                                title: 'Tỷ lệ', 
                                                dataIndex: 'percentage', 
                                                key: 'percentage',
                                                render: (percentage) => `${percentage}%`
                                            }
                                        ]}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    ) : (
                        <Empty description="Không có dữ liệu báo cáo tài chính" />
                    )}
                </TabPane>
            </Tabs>
        </div>
    );
};

export default ManagerReports;
