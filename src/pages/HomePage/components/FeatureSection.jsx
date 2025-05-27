import { Card, Col, Row } from 'antd';

export default function FeatureSection() {
  const features = [
    {
      title: '📊 Xem học lực',
      desc: 'Thống kê điểm, xếp loại, theo dõi quá trình học.',
    },
    {
      title: '✅ Điểm danh thông minh',
      desc: 'Theo dõi chuyên cần theo buổi, trạng thái rõ ràng.',
    },
    {
      title: '📝 Quản lý bài tập',
      desc: 'Giao, nộp và chấm bài tập nhanh chóng, dễ dàng.',
    },
    {
      title: '📝 Xem kết quả bài kiểm tra',
      desc: 'Cho phép theo dõi kết quả của các bài kiểm tra.',
    },
  ];

  return (
    <section className="bg-gradient-to-r from-indigo-50 to-indigo py-20 px-6 text-center">
      <h2 className="text-3xl font-bold mb-8">Tính năng nổi bật</h2>
      <Row gutter={[24, 24]} justify="center" className="mx-auto">
        {features.map((f, i) => (
          <Col xs={24} sm={12} md={6} key={i}>
            <Card bordered={false} className="bg-white rounded-xl shadow-md p-6 h-full">
              <h3 className="text-lg font-semibold text-indigo-600">{f.title}</h3>
              <p className="text-gray-500 mt-2">{f.desc}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
}
