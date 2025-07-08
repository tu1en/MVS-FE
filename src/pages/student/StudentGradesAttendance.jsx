import { AlertCircle, Award, Calendar, CheckCircle, Clock, TrendingUp, User, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import attendanceService from '../../services/attendanceService';
import classroomService from '../../services/classroomService';
import gradeService from '../../services/gradeService';

const StudentGradesAttendance = () => {
  const [grades, setGrades] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchGradesAndAttendance();
    }
  }, [selectedCourseId]);

  const fetchEnrolledCourses = async () => {
    try {
      const courses = await classroomService.getEnrolledCourses();
      setEnrolledCourses(courses);
      if (courses.length > 0) {
        setSelectedCourseId(courses[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching enrolled courses:', err);
      setError('Không thể tải danh sách khóa học');
    }
  };

  const fetchGradesAndAttendance = async () => {
    setLoading(true);
    try {
      const [gradesData, attendanceData] = await Promise.all([
        gradeService.getMyGrades(selectedCourseId),
        attendanceService.getMyAttendanceHistory(selectedCourseId)
      ]);
      
      setGrades(gradesData);
      setAttendanceHistory(attendanceData);
    } catch (err) {
      console.error('Error fetching grades and attendance:', err);
      setError('Không thể tải dữ liệu điểm số và điểm danh');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatusBadge = (status) => {
    const statusMap = {
      'PRESENT': { label: 'Có mặt', color: 'bg-green-500', icon: CheckCircle },
      'ABSENT': { label: 'Vắng', color: 'bg-red-500', icon: XCircle },
      'LATE': { label: 'Muộn', color: 'bg-yellow-500', icon: Clock },
      'EXCUSED': { label: 'Có phép', color: 'bg-blue-500', icon: AlertCircle }
    };
    
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-500', icon: AlertCircle };
    const Icon = statusInfo.icon;
    
    return (
      <Badge className={`${statusInfo.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {statusInfo.label}
      </Badge>
    );
  };

  const calculateAttendanceStats = () => {
    if (!attendanceHistory.length) return { total: 0, present: 0, rate: 0 };
    
    const total = attendanceHistory.length;
    const present = attendanceHistory.filter(record => 
      record.status === 'PRESENT' || record.status === 'LATE'
    ).length;
    const rate = Math.round((present / total) * 100);
    
    return { total, present, rate };
  };

  const calculateGradeStats = () => {
    if (!grades.length) return { average: 0, total: 0, passed: 0 };
    
    const validGrades = grades.filter(grade => grade.score !== null && grade.score !== undefined);
    if (!validGrades.length) return { average: 0, total: grades.length, passed: 0 };
    
    const total = validGrades.reduce((sum, grade) => sum + grade.score, 0);
    const average = Math.round((total / validGrades.length) * 100) / 100;
    const passed = validGrades.filter(grade => grade.score >= 5).length;
    
    return { average, total: validGrades.length, passed };
  };

  const getSelectedCourse = () => {
    return enrolledCourses.find(course => course.id.toString() === selectedCourseId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-2">
          <AlertCircle className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-medium">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!enrolledCourses.length) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-500 mb-2">
          <User className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg">Bạn chưa đăng ký khóa học nào</p>
        </div>
      </div>
    );
  }

  const attendanceStats = calculateAttendanceStats();
  const gradeStats = calculateGradeStats();
  const selectedCourse = getSelectedCourse();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Kết Quả Học Tập & Điểm Danh
        </h1>
        <p className="text-gray-600">
          Xem điểm số và lịch sử điểm danh của bạn
        </p>
      </div>

      {/* Course Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn khóa học
        </label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {enrolledCourses.map((course) => (
            <option key={course.id} value={course.id.toString()}>
              {course.name} - {course.teacherName}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm Trung Bình</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {gradeStats.average}/10
            </div>
            <p className="text-xs text-muted-foreground">
              {gradeStats.passed}/{gradeStats.total} bài đạt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ Lệ Tham Gia</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {attendanceStats.rate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {attendanceStats.present}/{attendanceStats.total} buổi học
            </p>
            <Progress value={attendanceStats.rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Quan</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600">
              {selectedCourse?.name || 'Khóa học'}
            </div>
            <p className="text-xs text-muted-foreground">
              Giảng viên: {selectedCourse?.teacherName || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grades">Bảng Điểm</TabsTrigger>
          <TabsTrigger value="attendance">Lịch Sử Điểm Danh</TabsTrigger>
        </TabsList>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bảng Điểm Chi Tiết</CardTitle>
            </CardHeader>
            <CardContent>
              {grades.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Chưa có điểm số nào</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-700">
                          Bài Tập/Kiểm Tra
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-700">
                          Điểm
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-700">
                          Trạng Thái
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-700">
                          Nhận Xét
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade) => (
                        <tr key={grade.id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2">
                            {grade.assignmentTitle || `Bài tập ${grade.id}`}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-center">
                            {grade.score !== null && grade.score !== undefined ? (
                              <span className={`font-bold ${
                                grade.score >= 8 ? 'text-green-600' :
                                grade.score >= 5 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {grade.score}/10
                              </span>
                            ) : (
                              <span className="text-gray-400">Chưa chấm</span>
                            )}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-center">
                            {grade.score !== null && grade.score !== undefined ? (
                              <Badge className={
                                grade.score >= 5 ? 'bg-green-500' : 'bg-red-500'
                              }>
                                {grade.score >= 5 ? 'Đạt' : 'Không đạt'}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Chưa chấm</Badge>
                            )}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                            {grade.feedback || 'Không có nhận xét'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lịch Sử Điểm Danh</CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Chưa có lịch sử điểm danh</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-700">
                          Ngày Học
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-700">
                          Bài Giảng
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-700">
                          Trạng Thái
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-700">
                          Ghi Chú
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceHistory.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2">
                            {new Date(record.date).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            {record.lectureTitle || `Buổi học ${record.id}`}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-center">
                            {getAttendanceStatusBadge(record.status)}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                            {record.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentGradesAttendance;
