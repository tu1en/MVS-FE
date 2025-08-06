import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserOutlined, 
  EditOutlined, 
  EyeOutlined, 
  TrophyOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import parentService from '../../services/parentService';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export default function ChildrenList() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const navigate = useNavigate();

  // Mock data for demonstration
  const mockChildren = [
    {
      id: 1,
      username: 'student1',
      fullName: 'Nguyễn Văn An',
      email: 'an@example.com',
      avatar: 'A',
      grade: 8.7,
      attendance: 95,
      status: 'active',
      lastActive: '2024-01-15T10:30:00',
      subjects: ['Toán', 'Văn', 'Tiếng Anh'],
      achievements: ['Học sinh giỏi', 'Thành tích xuất sắc']
    },
    {
      id: 2,
      username: 'student2',
      fullName: 'Trần Thị Bình',
      email: 'binh@example.com',
      avatar: 'B',
      grade: 8.3,
      attendance: 89,
      status: 'active',
      lastActive: '2024-01-15T09:15:00',
      subjects: ['Toán', 'Văn', 'Lịch sử'],
      achievements: ['Học sinh tiên tiến']
    }
  ];

  useEffect(() => {
    async function fetchChildren() {
      try {
        const data = await parentService.getChildren();
        setChildren(data);
      } catch (err) {
        console.log('Using mock data due to API error:', err);
        setChildren(mockChildren);
      } finally {
        setLoading(false);
      }
    }
    fetchChildren();
  }, []);

  const handleBack = () => {
    navigate('/parent/dashboard');
  };

  const filteredChildren = children.filter(child => {
    const matchesSearch = child.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         child.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || child.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 9.0) return 'text-green-600';
    if (grade >= 8.0) return 'text-blue-600';
    if (grade >= 7.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAttendanceColor = (attendance) => {
    if (attendance >= 90) return 'text-green-600';
    if (attendance >= 80) return 'text-blue-600';
    if (attendance >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

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
                <h1 className="text-2xl font-bold text-gray-900">Quản lý con cái</h1>
                <p className="text-sm text-gray-600">Theo dõi và quản lý thông tin học tập của con bạn</p>
              </div>
            </div>
            <Button className="flex items-center">
              <PlusOutlined className="mr-2" />
              Thêm con
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FilterOutlined className="text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Tổng số con</p>
                  <p className="text-2xl font-bold">{children.length}</p>
                </div>
                <UserOutlined className="text-3xl opacity-20" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Điểm TB cao nhất</p>
                  <p className="text-2xl font-bold">
                    {Math.max(...children.map(c => c.grade || 0)).toFixed(1)}
                  </p>
                </div>
                <TrophyOutlined className="text-3xl opacity-20" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Điểm danh TB</p>
                  <p className="text-2xl font-bold">
                    {Math.round(children.reduce((sum, c) => sum + (c.attendance || 0), 0) / children.length)}%
                  </p>
                </div>
                <CheckCircleOutlined className="text-3xl opacity-20" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Đang hoạt động</p>
                  <p className="text-2xl font-bold">
                    {children.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <CheckCircleOutlined className="text-3xl opacity-20" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Children List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredChildren.map((child) => (
            <Card key={child.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardBody>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                    {child.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{child.fullName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(child.status)}`}>
                        {child.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">@{child.username}</p>
                    <p className="text-sm text-gray-500 mb-3">{child.email}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Điểm TB</p>
                        <p className={`text-lg font-semibold ${getGradeColor(child.grade)}`}>
                          {child.grade || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Điểm danh</p>
                        <p className={`text-lg font-semibold ${getAttendanceColor(child.attendance)}`}>
                          {child.attendance || 'N/A'}%
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Môn học:</p>
                      <div className="flex flex-wrap gap-1">
                        {child.subjects?.slice(0, 3).map((subject, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {subject}
                          </span>
                        ))}
                        {child.subjects?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{child.subjects.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Thành tích:</p>
                      <div className="flex flex-wrap gap-1">
                        {child.achievements?.slice(0, 2).map((achievement, index) => (
                          <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Hoạt động cuối: {new Date(child.lastActive).toLocaleDateString('vi-VN')}
                      </p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex items-center">
                          <EyeOutlined className="mr-1" />
                          Xem
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center">
                          <EditOutlined className="mr-1" />
                          Sửa
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredChildren.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              <UserOutlined />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedFilter !== 'all' ? 'Không tìm thấy kết quả' : 'Chưa có con nào được liên kết'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedFilter !== 'all' 
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                : 'Bắt đầu bằng cách liên kết tài khoản của con bạn'
              }
            </p>
            <Button className="flex items-center mx-auto">
              <PlusOutlined className="mr-2" />
              Liên kết con
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/parent/academic-performance">
                  <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                    <TrophyOutlined className="text-2xl mb-2" />
                    <span>Kết quả học tập</span>
                  </Button>
                </Link>
                <Link to="/parent/attendance">
                  <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                    <CheckCircleOutlined className="text-2xl mb-2" />
                    <span>Điểm danh</span>
                  </Button>
                </Link>
                <Link to="/parent/schedule">
                  <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                    <CalendarOutlined className="text-2xl mb-2" />
                    <span>Lịch học</span>
                  </Button>
                </Link>
                <Link to="/parent/assignments">
                  <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                    <FileTextOutlined className="text-2xl mb-2" />
                    <span>Bài tập</span>
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}