import { Card, Table, Statistic, Row, Col } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { subject: 'Toán', score: 8.2 },
  { subject: 'Văn', score: 7.5 },
  { subject: 'Lý', score: 9.0 },
  { subject: 'Hóa', score: 6.8 },
  { subject: 'Anh', score: 8.9 },
];

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
    render: (_, record) => {
      const s = record.score;
      if (s >= 8.5) return <span className="text-green-600 font-semibold">Giỏi</span>;
      if (s >= 6.5) return <span className="text-yellow-600 font-semibold">Khá</span>;
      return <span className="text-red-500 font-semibold">Trung bình</span>;
    },
  },
];

const colors = ['#1677ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96'];

export default function AcademicPerformance() {
  const avgScore = (data.reduce((acc, cur) => acc + cur.score, 0) / data.length).toFixed(2);

  return (
    <div className="min-h-screen px-6 py-10 mt-20 bg-gradient-to-br from-[#e0f7ff] to-[#f5f7fa]">
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
      </div>
    </div>
  );
}
