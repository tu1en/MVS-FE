import { Carousel, Button } from 'antd';

export default function HomeBanner() {
  return (
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
  );
}
