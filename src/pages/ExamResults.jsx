import { Card, Table, Tag, Select, Row, Col } from 'antd';
import { useState } from 'react';

const allSubjects = ['Toán', 'Văn', 'Anh', 'Lý', 'Hóa'];

const rawData = [
  {
    name: 'Giữa kỳ Toán',
    subject: 'Toán',
    date: '2024-04-10',
    score: 8.8,
  },
  {
    name: 'Giữa kỳ Văn',
    subject: 'Văn',
    date: '2024-04-12',
    score: 6.5,
  },
  {
    name: 'Speaking Test',
    subject: 'Anh',
    date: '2024-04-15',
    score: 9.2,
  },
  {
    name: 'Kiểm tra chương 2',
    subject: 'Lý',
    date: '2024-04-18',
    score: 7.1,
  },
  {
    name: 'Hóa Hữu Cơ',
    subject: 'Hóa',
    date: '2024-04-20',
    score: 5.4,
  },
];

const gradeTag = (score) => {
  if (score >= 8.5) return <Tag color="green">Giỏi</Tag>;
  if (score >= 6.5) return <Tag color="gold">Khá</Tag>;
  return <Tag color="red">Trung bình</Tag>;
};

export default function ExamResults() {
  const [subjectFilter, setSubjectFilter] = useState('Tất cả');

  const filtered = subjectFilter === 'Tất cả'
    ? rawData
    : rawData.filter((h) => h.subject === subjectFilter);

  const avgScore = (
    filtered.reduce((sum, item) => sum + item.score, 0) / filtered.length || 0
  ).toFixed(2);

  const columns = [
    {
      title: '📝 Bài kiểm tra',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-medium text-gray-800">{text}</span>,
    },
    {
      title: '📘 Môn học',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: '📅 Ngày',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '✅ Điểm',
      dataIndex: 'score',
      key: 'score',
      render: (score) => (
        <span className="font-semibold text-indigo-600">{score}</span>
      ),
    },
    {
      title: '🏅 Xếp loại',
      dataIndex: 'score',
      key: 'grade',
      render: gradeTag,
    },
  ];

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-[#e6f7ff] to-[#fafafa]">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Tiêu đề */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">🎓 Kết quả kiểm tra</h1>
          <p className="text-gray-600 text-lg">Xem điểm và đánh giá các bài thi đã thực hiện</p>
        </div>

        {/* Thống kê nhanh */}
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} md={8}>
            <Card className="rounded-xl shadow-sm border">
              <p className="text-sm text-gray-500">Tổng số bài kiểm tra</p>
              <p className="text-2xl font-bold text-indigo-600">{filtered.length}</p>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="rounded-xl shadow-sm border">
              <p className="text-sm text-gray-500">Điểm trung bình</p>
              <p className="text-2xl font-bold text-green-600">{avgScore}</p>
            </Card>
          </Col>
        </Row>

        {/* Bộ lọc */}
        <Card className="rounded-xl shadow border">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="font-medium text-gray-700">Chọn môn học:</label>
            <Select
              value={subjectFilter}
              onChange={setSubjectFilter}
              options={[{ label: 'Tất cả', value: 'Tất cả' }, ...allSubjects.map((s) => ({ label: s, value: s }))]}
              style={{ width: 200 }}
            />
          </div>
        </Card>

        {/* Bảng bài kiểm tra */}
        <Card title="📋 Danh sách bài kiểm tra" className="rounded-xl shadow border">
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey={(record, idx) => `${record.name}-${idx}`}
            pagination={false}
            className="text-base"
          />
        </Card>
      </div>
    </div>
  );
}
