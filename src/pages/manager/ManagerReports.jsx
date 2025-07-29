import { Alert, Card, Col, Empty, Row, Spin, Statistic, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import managerReportService from '../../services/managerReportService';

const ManagerReports = () => {
  const [reports, setReports] = useState({ attendance: null, performance: null, financial: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [attendanceData, performanceData, financialData] = await Promise.all([
          managerReportService.getAttendanceReport('month'),
          managerReportService.getPerformanceReport('semester'),
          managerReportService.getFinancialReport('quarter')
        ]);
        setReports({ attendance: attendanceData, performance: performanceData, financial: financialData });
      } catch (err) {
        setError('Không thể tải báo cáo. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

  if (isLoading) return <div className="flex justify-center items-center h-96"><Spin size="large" tip="Đang tải báo cáo..." /></div>;
  if (error) return <Alert message="Lỗi" description={error} type="error" showIcon />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Báo cáo Quản lý</h1>
      <Tabs
        defaultActiveKey="attendance"
        items={[
          {
            key: 'attendance',
            label: 'Báo cáo Điểm danh',
            children: reports.attendance ? (
              <Card title={reports.attendance.title} className="mb-6">
                <Row gutter={16} className="mb-6">
                  <Col span={6}><Statistic title="Tổng buổi học" value={reports.attendance.data.totalSessions} suffix="buổi" /></Col>
                  <Col span={6}><Statistic title="Tổng học viên" value={reports.attendance.data.totalStudents} suffix="học viên" /></Col>
                  <Col span={6}><Statistic title="Tỷ lệ điểm danh" value={reports.attendance.data.attendanceRate} suffix="%" precision={1} /></Col>
                  <Col span={6}><Statistic title="Học viên vắng" value={reports.attendance.data.absentStudents} suffix="học viên" /></Col>
                </Row>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reports.attendance.data.classData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="className" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Tỷ lệ điểm danh']} />
                    <Legend />
                    <Bar dataKey="attendanceRate" name="Tỷ lệ điểm danh (%)" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            ) : <Empty description="Không có dữ liệu" />
          },
          {
            key: 'performance',
            label: 'Báo cáo Học tập',
            children: reports.performance ? (
              <Card title={reports.performance.title}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie dataKey="value" data={[
                      { name: 'Xuất sắc', value: reports.performance.data.excellentCount },
                      { name: 'Giỏi', value: reports.performance.data.goodCount },
                      { name: 'TB', value: reports.performance.data.averageCount },
                      { name: 'Yếu', value: reports.performance.data.belowAverageCount }
                    ]} label>
                      {[...Array(4)].map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} học viên`, 'Số lượng']} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            ) : <Empty description="Không có dữ liệu" />
          },
          {
            key: 'financial',
            label: 'Báo cáo Tài chính',
            children: reports.financial ? (
              <Card title={reports.financial.title}>
                <Row gutter={16}>
                  <Col span={8}><Statistic title="Doanh thu" value={reports.financial.data.totalRevenue} formatter={formatCurrency} /></Col>
                  <Col span={8}><Statistic title="Chi phí" value={reports.financial.data.totalExpenses} formatter={formatCurrency} /></Col>
                  <Col span={8}><Statistic title="Lợi nhuận" value={reports.financial.data.netProfit} formatter={formatCurrency} valueStyle={{ color: '#3f8600' }} /></Col>
                </Row>
              </Card>
            ) : <Empty description="Không có dữ liệu" />
          }
        ]}
      />
    </div>
  );
};

export default ManagerReports;
