import { Carousel, Button, Card, Row, Col } from 'antd';
import { SmileOutlined, ReadOutlined, TeamOutlined } from '@ant-design/icons';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* 🔹 Banner / Slide */}
      <Carousel autoplay className="text-center">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-28 px-6">
          <h2 className="text-4xl font-bold mb-4">Chào mừng đến với hệ thống học trực tuyến</h2>
          <p className="text-lg mb-6">Nơi kết nối học sinh, giáo viên và quản lý trên cùng một nền tảng</p>
          <Button size="large" type="primary" href="/login?role=student">
            Bắt đầu học ngay
          </Button>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-28 px-6">
          <h2 className="text-4xl font-bold mb-4">Quản lý học tập dễ dàng và hiệu quả</h2>
          <p className="text-lg mb-6">Xem điểm, điểm danh, bài tập và báo cáo một cách trực quan</p>
          <Button size="large" type="primary" href="/login?role=teacher">
            Dành cho giáo viên
          </Button>
        </div>
      </Carousel>

      {/* 🔹 Giới thiệu */}
      <section className="py-20 px-6 text-center bg-gray-50">
        <h2 className="text-3xl font-bold mb-6">Tại sao chọn chúng tôi?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Hệ thống học trực tuyến giúp bạn quản lý điểm, bài tập, điểm danh và báo cáo một cách hiện đại, nhanh chóng và minh bạch.
        </p>
      </section>

      {/* 🔹 Vai trò */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} md={8}>
            <Card
              hoverable
              className="rounded-xl shadow-md text-center"
              onClick={() => (window.location.href = '/login?role=student')}
            >
              <SmileOutlined style={{ fontSize: 40, color: '#1677ff' }} />
              <h3 className="text-xl font-semibold mt-4">Học viên</h3>
              <p className="text-gray-500 mt-2">Xem điểm bài kiểm tra, nộp bài, xem lịch học và điểm danh.</p>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              hoverable
              className="rounded-xl shadow-md text-center"
              onClick={() => (window.location.href = '/login?role=teacher')}
            >
              <ReadOutlined style={{ fontSize: 40, color: '#52c41a' }} />
              <h3 className="text-xl font-semibold mt-4">Giáo viên</h3>
              <p className="text-gray-500 mt-2">Quản lý lớp học, giao bài, chấm điểm và theo dõi chuyên cần.</p>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              hoverable
              className="rounded-xl shadow-md text-center"
              onClick={() => (window.location.href = '/login?role=admin')}
            >
              <TeamOutlined style={{ fontSize: 40, color: '#f5222d' }} />
              <h3 className="text-xl font-semibold mt-4">Quản trị viên</h3>
              <p className="text-gray-500 mt-2">Quản lý hệ thống, thống kê và báo cáo toàn trung tâm.</p>
            </Card>
          </Col>
        </Row>
      </section>

      {/* 🔹 Tính năng nổi bật */}
      <section className="bg-gradient-to-r from-indigo-50 to-white py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-8">Tính năng nổi bật</h2>
        <Row gutter={[24, 24]} justify="center" className="mx-auto">
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="bg-white rounded-xl shadow-md p-6 h-full">
              <h3 className="text-lg font-semibold text-indigo-600">📊 Xem học lực</h3>
              <p className="text-gray-500 mt-2">Thống kê điểm, xếp loại, theo dõi quá trình học.</p>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="bg-white rounded-xl shadow-md p-6 h-full">
              <h3 className="text-lg font-semibold text-indigo-600">✅ Điểm danh thông minh</h3>
              <p className="text-gray-500 mt-2">Theo dõi chuyên cần theo buổi, trạng thái rõ ràng.</p>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="bg-white rounded-xl shadow-md p-6 h-full">
              <h3 className="text-lg font-semibold text-indigo-600">📝 Quản lý bài tập</h3>
              <p className="text-gray-500 mt-2">Giao, nộp và chấm bài tập nhanh chóng, dễ dàng.</p>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="bg-white rounded-xl shadow-md p-6 h-full">
              <h3 className="text-lg font-semibold text-indigo-600">🎓 Xem kết quả kiểm tra</h3>
              <p className="text-gray-500 mt-2">Cho phép theo dõi kết quả của các bài kiểm tra.</p>
            </Card>
          </Col>
        </Row>
      </section>

      {/* 🔹 Footer */}
      <footer className="bg-gray-100 text-center py-8 mt-20 text-sm text-gray-500">
        © {new Date().getFullYear()} Trung tâm học trực tuyến.
      </footer>
    </div>
  );
}
