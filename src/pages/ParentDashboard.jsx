import { App, Card, Col, Row, Spin, Statistic, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOutlined, CalendarOutlined, MessageOutlined, TeamOutlined } from "@ant-design/icons";
import api from "../services/api";
import { ROLE } from "../constants/constants";

const { Title, Text } = Typography;

export default function ParentDashboard() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    childrenCount: 0,
    unreadMessages: 0,
    upcomingEvents: 0,
    activeCourses: 0,
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== ROLE.PARENT && role !== `ROLE_${ROLE.PARENT}`) {
      navigate("/");
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [childrenRes, messagesRes] = await Promise.allSettled([
        api.get('/parent/children'),
        api.get('/messages/dashboard/unread-count'),
      ]);

      let childrenCount = 0;
      let unread = 0;

      if (childrenRes.status === 'fulfilled') {
        const data = childrenRes.value.data;
        const list = Array.isArray(data) ? data : (data?.data || []);
        childrenCount = list.length;
      }
      if (messagesRes.status === 'fulfilled') {
        const m = messagesRes.value.data;
        unread = m?.data?.count || m?.count || 0;
      }

      setStats({
        childrenCount,
        unreadMessages: unread,
        upcomingEvents: 0,
        activeCourses: 0,
      });
    } catch (e) {
      message.error('Không thể tải dữ liệu phụ huynh');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Trang Phụ Huynh</h1>

      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Số con theo dõi" value={stats.childrenCount} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Tin nhắn chưa đọc" value={stats.unreadMessages} prefix={<MessageOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Sự kiện sắp tới" value={stats.upcomingEvents} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Khóa học đang học" value={stats.activeCourses} prefix={<BookOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable onClick={() => navigate('/parent') }>
            <div className="text-center">
              <TeamOutlined className="text-4xl text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Con em của tôi</h2>
              <Text>Theo dõi tiến độ học tập và điểm danh</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable onClick={() => navigate('/blog')}>
            <div className="text-center">
              <MessageOutlined className="text-4xl text-purple-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Tin tức & Thông báo</h2>
              <Text>Cập nhật thông báo từ trung tâm</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable onClick={() => navigate('/parent')}>
            <div className="text-center">
              <CalendarOutlined className="text-4xl text-green-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Lịch học</h2>
              <Text>Xem lịch học của con</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}


