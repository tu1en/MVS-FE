import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  DashboardOutlined, 
  BookOutlined, 
  CheckCircleOutlined, 
  MessageOutlined, 
  CalendarOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  TrophyOutlined,
  BarChartOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import parentService from '../services/parentService';
import { Card, CardHeader, CardBody, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function ParentDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const navigate = useNavigate();

  // Mock data for demonstration
  const mockStats = {
    childrenStats: { totalChildren: 2, activeChildren: 2 },
    academicStats: { averageGrade: 8.5, attendanceRate: 92, improvementRate: 5.2 },
    notificationStats: { unreadMessages: 3, newAnnouncements: 2 },
    children: [
      { id: 1, username: 'student1', fullName: 'Nguyễn Văn An', email: 'an@example.com', avatar: 'A', grade: 8.7, attendance: 95 },
      { id: 2, username: 'student2', fullName: 'Trần Thị Bình', email: 'binh@example.com', avatar: 'B', grade: 8.3, attendance: 89 }
    ]
  };

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await parentService.getDashboardStats();
        setStats(data);
        if (data.children && data.children.length > 0) {
          setSelectedChild(data.children[0]);
        }
      } catch (err) {
        console.log('Using mock data due to API error:', err);
        setStats(mockStats);
        setSelectedChild(mockStats.children[0]);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const navigationItems = [
    { icon: <DashboardOutlined />, label: 'Tổng quan', path: '/parent/dashboard', active: true },
    { icon: <TrophyOutlined />, label: 'Kết quả học tập', path: '/parent/academic-performance' },
    { icon: <CheckCircleOutlined />, label: 'Điểm danh', path: '/parent/attendance' },
    { icon: <MessageOutlined />, label: 'Tin nhắn', path: '/parent/messages' },
    { icon: <CalendarOutlined />, label: 'Lịch học', path: '/parent/schedule' },
    { icon: <FileTextOutlined />, label: 'Bài tập', path: '/parent/assignments' },
    { icon: <BellOutlined />, label: 'Thông báo', path: '/parent/notifications' },
    { icon: <UserOutlined />, label: 'Hồ sơ con', path: '/parent/children' },
  ];

  const quickActions = [
    { icon: <SettingOutlined />, label: 'Cài đặt', path: '/parent/settings' },
    { icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: handleLogout },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Navigation */}
      <div className="w-1/5 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Lớp Học Trực Tuyến</h1>
          <p className="text-sm text-gray-600 mt-1">Phụ huynh Dashboard</p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">CHÍNH</h3>
            {navigationItems.slice(0, 1).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 mb-2 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">CON CÁI</h3>
            {navigationItems.slice(1, 6).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center px-3 py-2 mb-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">THÔNG TIN</h3>
            {navigationItems.slice(6, 8).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center px-3 py-2 mb-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">THAO TÁC NHANH</h3>
            {quickActions.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex items-center w-full px-3 py-2 mb-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Center Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Chào mừng trở lại!</h1>
            <p className="text-gray-600">Theo dõi tiến độ học tập của con bạn</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Tổng số con</p>
                    <p className="text-3xl font-bold">{stats.childrenStats?.totalChildren || 0}</p>
                  </div>
                  <div className="text-4xl opacity-20">
                    <UserOutlined />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Điểm trung bình</p>
                    <p className="text-3xl font-bold">{stats.academicStats?.averageGrade || 0}</p>
                  </div>
                  <div className="text-4xl opacity-20">
                    <TrophyOutlined />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Tỉ lệ điểm danh</p>
                    <p className="text-3xl font-bold">{stats.academicStats?.attendanceRate || 0}%</p>
                  </div>
                  <div className="text-4xl opacity-20">
                    <CheckCircleOutlined />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Tin nhắn mới</p>
                    <p className="text-3xl font-bold">{stats.notificationStats?.unreadMessages || 0}</p>
                  </div>
                  <div className="text-4xl opacity-20">
                    <MessageOutlined />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Tiến độ học tập</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Toán học</span>
                      <span className="text-sm text-gray-500">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Văn học</span>
                      <span className="text-sm text-gray-500">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Tiếng Anh</span>
                      <span className="text-sm text-gray-500">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Hoàn thành bài tập Toán</p>
                      <p className="text-xs text-gray-500">2 giờ trước</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Tham gia lớp học trực tuyến</p>
                      <p className="text-xs text-gray-500">4 giờ trước</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Nộp bài kiểm tra</p>
                      <p className="text-xs text-gray-500">1 ngày trước</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <BookOutlined className="text-2xl mb-2" />
                  <span>Xem bài tập</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <CalendarOutlined className="text-2xl mb-2" />
                  <span>Lịch học</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <MessageOutlined className="text-2xl mb-2" />
                  <span>Tin nhắn</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <BarChartOutlined className="text-2xl mb-2" />
                  <span>Báo cáo</span>
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Right Sidebar - Children List */}
      <div className="w-1/5 bg-white shadow-lg border-l border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Con của tôi</h2>
          <p className="text-sm text-gray-600">Chọn để xem chi tiết</p>
        </div>

        <div className="p-4">
          {stats.children && stats.children.length > 0 ? (
            <div className="space-y-3">
              {stats.children.map((child) => (
                <div
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedChild?.id === child.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {child.avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{child.fullName}</h3>
                      <p className="text-sm text-gray-600">@{child.username}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Điểm: {child.grade || 'N/A'}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Điểm danh: {child.attendance || 'N/A'}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">
                <UserOutlined />
              </div>
              <p className="text-gray-600">Chưa có con nào được liên kết</p>
              <Button className="mt-4" size="sm">
                Liên kết con
              </Button>
            </div>
          )}
        </div>

        {/* Selected Child Details */}
        {selectedChild && (
          <div className="p-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Thông tin chi tiết</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Họ tên:</span>
                <span className="font-medium">{selectedChild.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{selectedChild.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Điểm TB:</span>
                <span className="font-medium text-green-600">{selectedChild.grade || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Điểm danh:</span>
                <span className="font-medium text-blue-600">{selectedChild.attendance || 'N/A'}%</span>
              </div>
            </div>
            <Button className="w-full mt-4" size="sm">
              Xem chi tiết
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 