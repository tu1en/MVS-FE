import { Card, Table, Tag, Select, Row, Col } from 'antd';
import { useState } from 'react';

const allSubjects = ['Toán', 'Văn', 'Anh', 'Lý', 'Hóa'];

const rawData = [
  {
    name: 'Bài 1: Hàm số bậc nhất',
    subject: 'Toán',
    due: '2024-05-03',
    score: 9.5,
    status: 'Đã chấm',
  },
  {
    name: 'Bài đọc hiểu Văn',
    subject: 'Văn',
    due: '2024-05-04',
    score: null,
    status: 'Đã nộp',
  },
  {
    name: 'Unit 5 Homework',
    subject: 'Anh',
    due: '2024-05-05',
    score: null,
    status: 'Chưa nộp',
  },
  {
    name: 'Điện học',
    subject: 'Lý',
    due: '2024-05-06',
    score: 7.5,
    status: 'Đã chấm',
  },
  {
    name: 'Bài tập axit bazơ',
    subject: 'Hóa',
    due: '2024-05-07',
    score: null,
    status: 'Chưa nộp',
  },
];

const statusTag = {
  'Đã nộp': <Tag color="blue">Đã nộp</Tag>,
  'Chưa nộp': <Tag color="gray">Chưa nộp</Tag>,
  'Đã chấm': <Tag color="green">Đã chấm</Tag>,
};

export default function HomeworkScores() {
  const [subjectFilter, setSubjectFilter] = useState('Tất cả');

  const filtered = subjectFilter === 'Tất cả'
    ? rawData
    : rawData.filter((h) => h.subject === subjectFilter);

  const summary = {
    total: filtered.length,
    graded: filtered.filter((h) => h.status === 'Đã chấm').length,
    submitted: filtered.filter((h) => h.status === 'Đã nộp').length,
    pending: filtered.filter((h) => h.status === 'Chưa nộp').length,
  };

  const columns = [
    {
      title: '📘 Bài tập',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-medium text-gray-800">{text}</span>,
    },
    {
      title: '📚 Môn',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: '🗓️ Hạn nộp',
      dataIndex: 'due',
      key: 'due',
    },
    {
      title: '✅ Điểm',
      dataIndex: 'score',
      key: 'score',
      render: (score) =>
        score !== null ? (
          <span className="font-semibold text-green-600">{score}</span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      title: '📌 Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => statusTag[status],
    },
  ];

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-[#fef9e7] to-[#f5f5f5]">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">📒 Bài tập</h1>
          <p className="text-gray-600 text-lg">Xem điểm và trạng thái các bài đã giao</p>
        </div>

        {/* Thống kê */}
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} md={6}>
            <Card className="rounded-xl shadow-sm border">
              <p className="text-sm text-gray-500">Tổng bài tập</p>
              <p className="text-2xl font-bold text-indigo-600">{summary.total}</p>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card className="rounded-xl shadow-sm border">
              <p className="text-sm text-gray-500">Đã chấm</p>
              <p className="text-2xl font-bold text-green-600">{summary.graded}</p>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card className="rounded-xl shadow-sm border">
              <p className="text-sm text-gray-500">Đã nộp</p>
              <p className="text-2xl font-bold text-blue-600">{summary.submitted}</p>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card className="rounded-xl shadow-sm border">
              <p className="text-sm text-gray-500">Chưa nộp</p>
              <p className="text-2xl font-bold text-gray-500">{summary.pending}</p>
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

        {/* Bảng bài tập */}
        <Card title="📋 Danh sách bài tập" className="rounded-xl shadow border">
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
