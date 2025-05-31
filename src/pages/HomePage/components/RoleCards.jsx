import { Card, Row, Col } from 'antd';
import { SmileOutlined, ReadOutlined, TeamOutlined, UserSwitchOutlined } from '@ant-design/icons';

export default function RoleCards() {
  return (
    <section className="py-20 px-6 w-full">
      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} md={6}>
          <Card hoverable className="rounded-xl shadow-md text-center" onClick={() => (window.location.href = '/login?role=student')}>
            <SmileOutlined style={{ fontSize: 40, color: '#1677ff' }} />
            <h3 className="text-xl font-semibold mt-4">Học viên</h3>
            <p className="text-gray-500 mt-2">Xem điểm bài kiểm tra, nộp bài, xem lịch học và điểm danh.</p>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card hoverable className="rounded-xl shadow-md text-center" onClick={() => (window.location.href = '/login?role=teacher')}>
            <ReadOutlined style={{ fontSize: 40, color: '#52c41a' }} />
            <h3 className="text-xl font-semibold mt-4">Giáo viên</h3>
            <p className="text-gray-500 mt-2">Quản lý lớp học, giao bài, chấm điểm và theo dõi chuyên cần.</p>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card hoverable className="rounded-xl shadow-md text-center" onClick={() => (window.location.href = '/login?role=manager')}>
            <UserSwitchOutlined style={{ fontSize: 40, color: '#1890ff' }} />
            <h3 className="text-xl font-semibold mt-4">Quản lý</h3>
            <p className="text-gray-500 mt-2">Quản lý yêu cầu đăng ký và phê duyệt tài khoản người dùng.</p>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card hoverable className="rounded-xl shadow-md text-center" onClick={() => (window.location.href = '/login?role=admin')}>
            <TeamOutlined style={{ fontSize: 40, color: '#f5222d' }} />
            <h3 className="text-xl font-semibold mt-4">Quản trị viên</h3>
            <p className="text-gray-500 mt-2">Quản lý hệ thống, thống kê và báo cáo toàn trung tâm.</p>
          </Card>
        </Col>
      </Row>
    </section>
  );
}
