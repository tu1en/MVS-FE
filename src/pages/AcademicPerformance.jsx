import { Card, Col, Empty, message, Row, Spin, Statistic, Table } from 'antd';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import academicPerformanceService from '../services/academicPerformanceService';

const columns = [
  {
    title: '📘 Môn học',
    dataIndex: 'subject',
    key: 'subject',
    render: (text) => <span className="font-medium text-gray-700">{text}</span>,
  },
  {
    title: '🎯 Điểm TB',
    dataIndex: 'score',
    key: 'score',
    render: (score) => <span className="font-semibold text-indigo-600">{score.toFixed(1)}</span>,
  },
  {
    title: '🏅 Xếp loại',
    key: 'rank',
    dataIndex: 'rank',
    render: (rank) => {
      if (rank === 'Giỏi') return <span className="text-green-600 font-semibold">Giỏi</span>;
      if (rank === 'Khá') return <span className="text-yellow-600 font-semibold">Khá</span>;
      return <span className="text-red-500 font-semibold">Trung bình</span>;
    },
  },
];

const colors = ['#1677ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96'];

export default function AcademicPerformance() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [avgScore, setAvgScore] = useState(0);

  useEffect(() => {
    const fetchAcademicPerformance = async () => {
      try {
        setLoading(true);
        const response = await academicPerformanceService.getAcademicPerformance();
        
        if (response && response.subjects) {
          setData(response.subjects);
          setAvgScore(response.averageScore);
        } else {
          message.error('Không thể tải dữ liệu học tập');
          setData([]);
          setAvgScore(0);
        }
      } catch (error) {
        console.error('Error fetching academic performance:', error);
        message.error('Đã xảy ra lỗi khi tải dữ liệu học tập');
        setData([]);
        setAvgScore(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicPerformance();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spin size="large" tip="Đang tải dữ liệu học tập..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-[#e0f7ff] to-[#f5f7fa]">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            📊 Tổng quan học lực
          </h1>
          <p className="text-gray-500 text-lg">Theo dõi thành tích học tập của bạn một cách trực quan</p>
        </div>

        {/* Stats */}
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} md={8}>
            <Card className="rounded-xl shadow-md border border-gray-200">
              <Statistic
                title="🎓 Điểm trung bình"
                value={avgScore}
                suffix="/10"
                precision={2}
                valueStyle={{ color: '#1677ff', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="rounded-xl shadow-md border border-gray-200">
              <Statistic
                title="📈 Xếp loại"
                value={
                  avgScore >= 8.5
                    ? 'Giỏi'
                    : avgScore >= 6.5
                    ? 'Khá'
                    : 'Trung bình'
                }
                valueStyle={{
                  color:
                    avgScore >= 8.5
                      ? '#52c41a'
                      : avgScore >= 6.5
                      ? '#faad14'
                      : '#f5222d',
                  fontWeight: 'bold',
                }}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="rounded-xl shadow-md border border-gray-200">
              <Statistic
                title="📚 Số môn học"
                value={data.length}
                valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        {data.length > 0 ? (
          <>
            {/* Chart */}
            <Card
              title="🔍 Biểu đồ điểm theo môn học"
              className="rounded-xl shadow-sm border border-gray-100"
            >
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data}>
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="score" barSize={40}>
                    {data.map((_, index) => (
                      <Cell key={index} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Table */}
            <Card
              title="📋 Bảng chi tiết điểm từng môn"
              className="rounded-xl shadow-sm border border-gray-100"
            >
              <Table
                columns={columns}
                dataSource={data}
                rowKey="subject"
                pagination={false}
                className="text-base"
              />
            </Card>
          </>
        ) : (
          <Card className="rounded-xl shadow-sm border border-gray-100">
            <Empty description="Không có dữ liệu học tập" />
          </Card>
        )}
      </div>
    </div>
  );
}
