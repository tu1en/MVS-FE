import { Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  UserSwitchOutlined,
  TeamOutlined,
  SmileOutlined,
} from '@ant-design/icons';

const roles = [
  {
    title: "Quản trị viên",
    key: "admin",
    colorFrom: "#f5222d",
    colorTo: "#ff7875",
    icon: <UserOutlined style={{ fontSize: 48 }} />,
    emoji: "🛡️",
  },
  {
    title: "Quản lý",
    key: "manager",
    colorFrom: "#1890ff",
    colorTo: "#69c0ff",
    icon: <UserSwitchOutlined style={{ fontSize: 48 }} />,
    emoji: "📊",
  },
  {
    title: "Giáo viên",
    key: "teacher",
    colorFrom: "#52c41a",
    colorTo: "#95de64",
    icon: <TeamOutlined style={{ fontSize: 48 }} />,
    emoji: "👨‍🏫",
  },
  {
    title: "Học viên",
    key: "student",
    colorFrom: "#faad14",
    colorTo: "#ffe58f",
    icon: <SmileOutlined style={{ fontSize: 48 }} />,
    emoji: "🎓",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#e0eafc] to-[#cfdef3] flex flex-col items-center py-20 px-6">
      <div className="text-center mb-16 mt-10">
        <h1 className="text-4xl md:text-5xl text-primary font-bold text-gray-800 leading-tight">
          Chào mừng đến với hệ thống
        </h1>
        <p className="mt-4 text-lg text-gray-600">Hãy chọn vai trò để bắt đầu đăng nhập</p>
      </div>

      <Row gutter={[24, 24]} justify="center" style={{ maxWidth: 1100, width: '100%' }}>
        {roles.map(({ title, key, colorFrom, colorTo, icon, emoji }) => (
          <Col xs={24} sm={12} md={12} lg={6} key={key}>
            <div
              onClick={() => navigate(`/login?role=${key}`)}
              className="cursor-pointer group transform transition-transform hover:scale-105"
            >
              <div
                className="rounded-2xl p-6 text-white shadow-lg transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
                  boxShadow: `0 15px 40px -10px ${colorFrom}`,
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* <div className="mb-4 group-hover:scale-110 transition-transform">{icon}</div> */}
                <div className="text-5xl mb-3">{emoji}</div>
                <div className="text-xl font-semibold">{title}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}
