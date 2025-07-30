import {
    AuditOutlined,
    DashboardOutlined,
    PlayCircleOutlined,
    SettingOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { Card, Col, Row } from 'antd';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE } from '../constants/constants';
import { useBackButton } from '../hooks/useBackButton';

export default function AdminDashboard() {
  const navigate = useNavigate();
  useBackButton(); // Thêm hook xử lý nút back

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== ROLE.ADMIN) {
      navigate('/');
    }
  }, [navigate]);

  const dashboardCards = [
    {
      title: 'Audit Logs',
      description: 'Xem và quản lý tất cả hoạt động hệ thống',
      icon: <AuditOutlined className="text-2xl text-blue-500" />,
      path: '/admin/audit-logs',
      color: 'border-blue-200 hover:border-blue-400'
    },
    {
      title: 'Cài đặt hệ thống',
      description: 'Quản lý cấu hình hệ thống',
      icon: <SettingOutlined className="text-2xl text-green-500" />,
      path: '/admin/settings',
      color: 'border-green-200 hover:border-green-400'
    },
    {
      title: 'Quản lý người dùng',
      description: 'Xem và quản lý tất cả người dùng trong hệ thống',
      icon: <TeamOutlined className="text-2xl text-purple-500" />,
      path: '/manager/hr',
      color: 'border-purple-200 hover:border-purple-400'
    },
    {
      title: 'Workflow Editor',
      description: 'Quản lý và thiết kế các workflow hệ thống',
      icon: <PlayCircleOutlined className="text-2xl text-orange-500" />,
      path: '/admin/workflows',
      color: 'border-orange-200 hover:border-orange-400'
    },
    {
      title: 'System Dashboard',
      description: 'Xem tổng quan trạng thái hệ thống chi tiết',
      icon: <DashboardOutlined className="text-2xl text-cyan-500" />,
      path: '/admin/system-dashboard',
      color: 'border-cyan-200 hover:border-cyan-400'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Trang Quản Trị</h1>
        <p className="text-gray-600">Quản lý và giám sát hệ thống học tập</p>
      </div>

      <Row gutter={[24, 24]}>
        {dashboardCards.map((card, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card 
              className={`h-full cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${card.color}`}
              onClick={() => navigate(card.path)}
              hoverable
            >
              <div className="flex flex-col items-center text-center p-4">
                <div className="mb-4">
                  {card.icon}
                </div>
                <h2 className="text-xl font-semibold mb-3 text-gray-800">
                  {card.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}