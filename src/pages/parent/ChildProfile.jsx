import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  UserOutlined, 
  TrophyOutlined, 
  CheckCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MessageOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  BookOutlined,
  StarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import parentService from '../../services/parentService';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export default function ChildProfile() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for demonstration
  const mockChild = {
    id: childId,
    username: 'student1',
    fullName: 'Nguyễn Văn An',
    email: 'an@example.com',
    phone: '0123456789',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    avatar: 'A',
    grade: 8.7,
    attendance: 95,
    status: 'active',
    lastActive: '2024-01-15T10:30:00',
    joinDate: '2023-09-01',
    subjects: [
      { name: 'Toán học', grade: 9.2, teacher: 'Cô Nguyễn Thị Hoa' },
      { name: 'Văn học', grade: 8.5, teacher: 'Thầy Trần Văn Nam' },
      { name: 'Tiếng Anh', grade: 8.8, teacher: 'Cô Sarah Johnson' },
      { name: 'Vật lý', grade: 8.1, teacher: 'Thầy Lê Văn Minh' },
      { name: 'Hóa học', grade: 8.9, teacher: 'Cô Phạm Thị Lan' }
    ],
    achievements: [
      { title: 'Học sinh giỏi', date: '2023-12-15', description: 'Đạt danh hiệu học sinh giỏi học kỳ 1' },
      { title: 'Thành tích xuất sắc', date: '2023-11-20', description: 'Đạt giải nhất cuộc thi Toán học' },
      { title: 'Học sinh tiên tiến', date: '2023-10-10', description: 'Đạt danh hiệu học sinh tiên tiến tháng 10' }
    ],
    recentActivities: [
      { type: 'assignment', title: 'Nộp bài tập Toán', time: '2 giờ trước', status: 'completed' },
      { type: 'attendance', title: 'Tham gia lớp học trực tuyến', time: '4 giờ trước', status: 'present' },
      { type: 'exam', title: 'Hoàn thành bài kiểm tra Văn học', time: '1 ngày trước', status: 'completed' },
      { type: 'message', title: 'Gửi tin nhắn cho giáo viên', time: '2 ngày trước', status: 'sent' }
    ],
    upcomingEvents: [
      { title: 'Bài kiểm tra Toán', date: '2024-01-20', time: '08:00', type: 'exam' },
      { title: 'Lớp học trực tuyến Văn học', date: '2024-01-18', time: '14:00', type: 'class' },
      { title: 'Hạn nộp bài tập Tiếng Anh', date: '2024-01-17', time: '23:59', type: 'assignment' }
    ]
  };

  useEffect(() => {
    async function fetchChildData() {
      try {
        // In a real app, you would call: const data = await parentService.getChildProfile(childId);
        // For now, using mock data
        setChild(mockChild);
      } catch (err) {
        console.log('Using mock data due to API error:', err);
        setChild(mockChild);
      } finally {
        setLoading(false);
      }
    }
    fetchChildData();
  }, [childId]);

  const handleBack = () => {
    navigate('/parent/children');
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'assignment': return <FileTextOutlined />;
      case 'attendance': return <CheckCircleOutlined />;
      case 'exam': return <BookOutlined />;
      case 'message': return <MessageOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'assignment': return 'text-blue-600';
      case 'attendance': return 'text-green-600';
      case 'exam': return 'text-purple-600';
      case 'message': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'exam': return <BookOutlined />;
      case 'class': return <CalendarOutlined />;
      case 'assignment': return <FileTextOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'exam': return 'bg-red-100 text-red-800';
      case 'class': return 'bg-blue-100 text-blue-800';
      case 'assignment': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
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

  if (!child) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBack} className="flex items-center">
                <ArrowLeftOutlined className="mr-2" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hồ sơ học sinh</h1>
                <p className="text-sm text-gray-600">Thông tin chi tiết về {child.fullName}</p>
              </div>
            </div>
            <Button className="flex items-center">
              <EditOutlined className="mr-2" />
              Chỉnh sửa
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <Card className="mb-6">
              <CardBody className="text-center">
                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-3xl mx-auto mb-4">
                  {child.avatar}
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{child.fullName}</h2>
                <p className="text-gray-600 mb-4">@{child.username}</p>
                
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    child.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {child.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Điểm TB</p>
                    <p className="text-2xl font-bold text-green-600">{child.grade}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Điểm danh</p>
                    <p className="text-2xl font-bold text-blue-600">{child.attendance}%</p>
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <MailOutlined className="text-gray-400" />
                    <span className="text-sm text-gray-600">{child.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PhoneOutlined className="text-gray-400" />
                    <span className="text-sm text-gray-600">{child.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <EnvironmentOutlined className="text-gray-400" />
                    <span className="text-sm text-gray-600">{child.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CalendarOutlined className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Tham gia: {new Date(child.joinDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê nhanh</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Môn học đang học</span>
                    <span className="font-semibold">{child.subjects.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Thành tích</span>
                    <span className="font-semibold">{child.achievements.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Hoạt động gần đây</span>
                    <span className="font-semibold">{child.recentActivities.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sự kiện sắp tới</span>
                    <span className="font-semibold">{child.upcomingEvents.length}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subjects Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Kết quả học tập theo môn</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {child.subjects.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{subject.name}</h4>
                        <p className="text-sm text-gray-600">Giáo viên: {subject.teacher}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{subject.grade}</p>
                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(subject.grade / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrophyOutlined className="mr-2 text-yellow-500" />
                  Thành tích & Danh hiệu
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {child.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                      <StarOutlined className="text-yellow-500 text-xl mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{achievement.title}</h4>
                        <p className="text-sm text-gray-600 mb-1">{achievement.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(achievement.date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Recent Activities & Upcoming Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle>Hoạt động gần đây</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {child.recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`text-lg ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                          activity.status === 'present' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status === 'completed' ? 'Hoàn thành' :
                           activity.status === 'present' ? 'Có mặt' : 'Đã gửi'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Sự kiện sắp tới</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {child.upcomingEvents.map((event, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`text-lg ${getEventColor(event.type).replace('bg-', 'text-').replace(' text-', '')}`}>
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{event.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleDateString('vi-VN')} - {event.time}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getEventColor(event.type)}`}>
                          {event.type === 'exam' ? 'Kiểm tra' :
                           event.type === 'class' ? 'Lớp học' : 'Bài tập'}
                        </span>
                      </div>
                    ))}
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
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                    <TrophyOutlined className="text-xl mb-1" />
                    <span className="text-xs">Kết quả học tập</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                    <CheckCircleOutlined className="text-xl mb-1" />
                    <span className="text-xs">Điểm danh</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                    <CalendarOutlined className="text-xl mb-1" />
                    <span className="text-xs">Lịch học</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                    <MessageOutlined className="text-xl mb-1" />
                    <span className="text-xs">Liên lạc</span>
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}