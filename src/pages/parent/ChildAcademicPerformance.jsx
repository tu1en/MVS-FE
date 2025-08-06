import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  TrophyOutlined, 
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ArrowLeftOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  MinusOutlined,
  BookOutlined,
  StarOutlined,
  CalendarOutlined,
  FilterOutlined
} from '@ant-design/icons';
import parentService from '../../services/parentService';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export default function ChildAcademicPerformance() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Mock data for demonstration
  const mockPerformance = {
    childId: childId,
    childName: 'Nguyễn Văn An',
    overallGrade: 8.7,
    gradeTrend: 'up', // up, down, stable
    improvementRate: 5.2,
    subjects: [
      {
        name: 'Toán học',
        currentGrade: 9.2,
        previousGrade: 8.8,
        trend: 'up',
        assignments: 15,
        completed: 14,
        exams: 3,
        averageExamScore: 8.9,
        teacher: 'Cô Nguyễn Thị Hoa',
        lastUpdated: '2024-01-15'
      },
      {
        name: 'Văn học',
        currentGrade: 8.5,
        previousGrade: 8.7,
        trend: 'down',
        assignments: 12,
        completed: 11,
        exams: 2,
        averageExamScore: 8.3,
        teacher: 'Thầy Trần Văn Nam',
        lastUpdated: '2024-01-14'
      },
      {
        name: 'Tiếng Anh',
        currentGrade: 8.8,
        previousGrade: 8.2,
        trend: 'up',
        assignments: 18,
        completed: 17,
        exams: 4,
        averageExamScore: 8.7,
        teacher: 'Cô Sarah Johnson',
        lastUpdated: '2024-01-13'
      },
      {
        name: 'Vật lý',
        currentGrade: 8.1,
        previousGrade: 7.9,
        trend: 'up',
        assignments: 10,
        completed: 9,
        exams: 2,
        averageExamScore: 8.0,
        teacher: 'Thầy Lê Văn Minh',
        lastUpdated: '2024-01-12'
      },
      {
        name: 'Hóa học',
        currentGrade: 8.9,
        previousGrade: 8.6,
        trend: 'up',
        assignments: 14,
        completed: 13,
        exams: 3,
        averageExamScore: 8.8,
        teacher: 'Cô Phạm Thị Lan',
        lastUpdated: '2024-01-11'
      }
    ],
    gradeHistory: [
      { month: 'T9', grade: 8.2 },
      { month: 'T10', grade: 8.4 },
      { month: 'T11', grade: 8.1 },
      { month: 'T12', grade: 8.6 },
      { month: 'T1', grade: 8.7 }
    ],
    recentAssignments: [
      { subject: 'Toán học', title: 'Bài tập về phương trình bậc 2', grade: 9.5, date: '2024-01-15' },
      { subject: 'Văn học', title: 'Phân tích tác phẩm văn học', grade: 8.0, date: '2024-01-14' },
      { subject: 'Tiếng Anh', title: 'Bài tập ngữ pháp', grade: 9.0, date: '2024-01-13' },
      { subject: 'Vật lý', title: 'Bài tập về chuyển động', grade: 7.5, date: '2024-01-12' },
      { subject: 'Hóa học', title: 'Bài tập về phản ứng hóa học', grade: 9.2, date: '2024-01-11' }
    ],
    upcomingExams: [
      { subject: 'Toán học', title: 'Kiểm tra giữa kỳ', date: '2024-01-20', time: '08:00' },
      { subject: 'Văn học', title: 'Kiểm tra 15 phút', date: '2024-01-18', time: '14:00' },
      { subject: 'Tiếng Anh', title: 'Kiểm tra từ vựng', date: '2024-01-17', time: '10:00' }
    ],
    achievements: [
      { title: 'Học sinh giỏi', date: '2023-12-15', description: 'Đạt danh hiệu học sinh giỏi học kỳ 1' },
      { title: 'Thành tích xuất sắc Toán học', date: '2023-11-20', description: 'Đạt giải nhất cuộc thi Toán học cấp trường' },
      { title: 'Học sinh tiên tiến', date: '2023-10-10', description: 'Đạt danh hiệu học sinh tiên tiến tháng 10' }
    ]
  };

  useEffect(() => {
    async function fetchPerformance() {
      try {
        // In a real app, you would call: const data = await parentService.getChildAcademicPerformance(childId);
        // For now, using mock data
        setPerformance(mockPerformance);
      } catch (err) {
        console.log('Using mock data due to API error:', err);
        setPerformance(mockPerformance);
      } finally {
        setLoading(false);
      }
    }
    fetchPerformance();
  }, [childId]);

  const handleBack = () => {
    navigate('/parent/children');
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUpOutlined className="text-green-500" />;
      case 'down': return <TrendingDownOutlined className="text-red-500" />;
      default: return <MinusOutlined className="text-gray-500" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 9.0) return 'text-green-600';
    if (grade >= 8.0) return 'text-blue-600';
    if (grade >= 7.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBackground = (grade) => {
    if (grade >= 9.0) return 'bg-green-100';
    if (grade >= 8.0) return 'bg-blue-100';
    if (grade >= 7.0) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const filteredSubjects = selectedSubject === 'all' 
    ? performance?.subjects 
    : performance?.subjects.filter(s => s.name === selectedSubject);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu học tập...</p>
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

  if (!performance) return null;

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
                <h1 className="text-2xl font-bold text-gray-900">Kết quả học tập</h1>
                <p className="text-sm text-gray-600">Theo dõi tiến độ học tập của {performance.childName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FilterOutlined className="text-gray-400" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả môn học</option>
                {performance.subjects.map((subject) => (
                  <option key={subject.name} value={subject.name}>{subject.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Điểm trung bình</p>
                  <p className="text-3xl font-bold">{performance.overallGrade}</p>
                </div>
                <div className="text-4xl opacity-20">
                  <TrophyOutlined />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Tỷ lệ cải thiện</p>
                  <p className="text-3xl font-bold">{performance.improvementRate}%</p>
                </div>
                <div className="text-4xl opacity-20">
                  <TrendingUpOutlined />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Xu hướng</p>
                  <p className="text-3xl font-bold flex items-center">
                    {getTrendIcon(performance.gradeTrend)}
                  </p>
                </div>
                <div className="text-4xl opacity-20">
                  <LineChartOutlined />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Môn học</p>
                  <p className="text-3xl font-bold">{performance.subjects.length}</p>
                </div>
                <div className="text-4xl opacity-20">
                  <BookOutlined />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Subject Performance */}
          <div className="lg:col-span-2">
            {/* Subject Performance Cards */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChartOutlined className="mr-2" />
                  Kết quả theo môn học
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {filteredSubjects?.map((subject, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">{subject.name}</h4>
                          <p className="text-sm text-gray-600">Giáo viên: {subject.teacher}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className={`text-2xl font-bold ${getGradeColor(subject.currentGrade)}`}>
                              {subject.currentGrade}
                            </span>
                            {getTrendIcon(subject.trend)}
                          </div>
                          <p className="text-xs text-gray-500">
                            Trước: {subject.previousGrade}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Bài tập</p>
                          <p className="font-semibold">{subject.completed}/{subject.assignments}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Kiểm tra</p>
                          <p className="font-semibold">{subject.exams}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Điểm TB KT</p>
                          <p className="font-semibold">{subject.averageExamScore}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Tiến độ</span>
                          <span>{Math.round((subject.completed / subject.assignments) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(subject.completed / subject.assignments) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Recent Assignments */}
            <Card>
              <CardHeader>
                <CardTitle>Bài tập gần đây</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {performance.recentAssignments.map((assignment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{assignment.title}</h4>
                        <p className="text-sm text-gray-600">{assignment.subject}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(assignment.date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeBackground(assignment.grade)} ${getGradeColor(assignment.grade)}`}>
                          {assignment.grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Charts and Details */}
          <div className="space-y-6">
            {/* Grade History Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChartOutlined className="mr-2" />
                  Lịch sử điểm
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {performance.gradeHistory.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{item.month}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(item.grade / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{item.grade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Upcoming Exams */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarOutlined className="mr-2" />
                  Kiểm tra sắp tới
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {performance.upcomingExams.map((exam, index) => (
                    <div key={index} className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                      <h4 className="font-medium text-gray-800">{exam.title}</h4>
                      <p className="text-sm text-gray-600">{exam.subject}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(exam.date).toLocaleDateString('vi-VN')} - {exam.time}
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <StarOutlined className="mr-2 text-yellow-500" />
                  Thành tích
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {performance.achievements.map((achievement, index) => (
                    <div key={index} className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                      <h4 className="font-medium text-gray-800">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(achievement.date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Nhận xét</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">Điểm mạnh</h4>
                    <p className="text-sm text-green-700">Toán học và Tiếng Anh có tiến bộ rõ rệt</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-800">Cần cải thiện</h4>
                    <p className="text-sm text-orange-700">Văn học cần chú ý hơn về cách diễn đạt</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">Khuyến nghị</h4>
                    <p className="text-sm text-blue-700">Tăng cường luyện tập bài tập Vật lý</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}