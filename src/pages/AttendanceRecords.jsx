import { Card, Table, Tag, Select, Row, Col } from 'antd';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

const allSubjects = ['Toán', 'Văn', 'Anh', 'Lý', 'Hóa'];

const attendanceData = [
  { date: '2024-05-01', subject: 'Toán', status: 'Có mặt' },
  { date: '2024-05-02', subject: 'Toán', status: 'Vắng có phép' },
  { date: '2024-05-03', subject: 'Văn', status: 'Có mặt' },
  { date: '2024-05-04', subject: 'Anh', status: 'Vắng không phép' },
  { date: '2024-05-05', subject: 'Lý', status: 'Có mặt' },
  { date: '2024-05-06', subject: 'Hóa', status: 'Có mặt' },
  { date: '2024-05-07', subject: 'Toán', status: 'Có mặt' },
];

const COLORS = {
  'Có mặt': '#52c41a',
  'Vắng có phép': '#faad14',
  'Vắng không phép': '#f5222d',
};

const statusTag = {
  'Có mặt': <Tag color="green">Có mặt</Tag>,
  'Vắng có phép': <Tag color="gold">Vắng có phép</Tag>,
  'Vắng không phép': <Tag color="red">Vắng không phép</Tag>,
};

export default function AttendanceRecords() {
  const [selectedSubject, setSelectedSubject] = useState('Tất cả');

  const filteredData =
    selectedSubject === 'Tất cả'
      ? attendanceData
      : attendanceData.filter((item) => item.subject === selectedSubject);

  const summary = {
    'Có mặt': filteredData.filter((d) => d.status === 'Có mặt').length,
    'Vắng có phép': filteredData.filter((d) => d.status === 'Vắng có phép').length,
    'Vắng không phép': filteredData.filter((d) => d.status === 'Vắng không phép').length,
  };

  const chartData = Object.entries(summary)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count,
    }));

  const columns = [
    {
      title: '📅 Ngày',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '📘 Môn học',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: '📌 Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => statusTag[status],
    },
  ];

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br mt-20 from-[#fff1f0] to-[#f0f5ff]">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Tiêu đề */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">📊 Điểm danh</h1>
          <p className="text-gray-600 text-lg">Theo dõi tình hình chuyên cần của bạn</p>
        </div>

        {/* Bộ lọc */}
        <Card className="rounded-xl shadow border">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="font-medium text-gray-700">Chọn môn học:</label>
            <Select
              value={selectedSubject}
              onChange={setSelectedSubject}
              options={[{ label: 'Tất cả', value: 'Tất cả' }, ...allSubjects.map((s) => ({ label: s, value: s }))]}
              style={{ width: 200 }}
            />
          </div>
        </Card>

        {/* Biểu đồ chuyên cần */}
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={12}>
            <Card
              title="📈 Tỷ lệ chuyên cần"
              className="rounded-xl shadow border"
              bodyStyle={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Thống kê tổng */}
          <Col xs={24} md={12}>
            <Card title="📋 Tổng kết" className="rounded-xl shadow border">
              <ul className="space-y-2 text-base">
                {Object.keys(summary).map((status) => (
                  <li key={status} className="flex justify-between">
                    <span>{status}</span>
                    <span className="font-semibold text-gray-800">{summary[status]} buổi</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Col>
        </Row>

        {/* Bảng điểm danh */}
        <Card title="📅 Danh sách điểm danh" className="rounded-xl shadow border">
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey={(record, idx) => `${record.date}-${idx}`}
            pagination={false}
          />
        </Card>
      </div>
    </div>
  );
}
