import { Alert, Button, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LectureList from '../../components/teacher/LectureList'; // Re-using this component for now
import ClassroomService from '../../services/classroomService';
import AssignmentListTab from './AssignmentListTab'; // Import the new assignment tab
import ExamListTab from './ExamListTab'; // Import the new exam tab
import ScheduleTab from './ScheduleTab'; // Assuming this exists

const { Title, Text, Paragraph } = Typography;

const StudentCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('lectures');

  useEffect(() => {
    if (courseId) {
      loadCourseDetails();
    }
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      console.log(`📚 Loading course details for courseId: ${courseId}`);
      setLoading(true);
      setError(null);

      const response = await ClassroomService.getClassroomDetails(courseId);
      console.log('✅ Course details response:', response);

      // Extract data from response
      const courseData = response.data || response;
      console.log('📊 Course data:', courseData);

      setCourse(courseData);
    } catch (err) {
      console.error('❌ Error loading course details:', err);
      console.error('   Status:', err.response?.status);
      console.error('   Data:', err.response?.data);
      setError('Không thể tải thông tin chi tiết khóa học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'lectures':
        return <LectureList 
          courseId={courseId}
          courseName={course?.name} // Add courseName prop
          isStudentView={true} // Pass a prop to indicate student view
        />;
      case 'schedule':
        return <ScheduleTab schedule={course?.schedule} />;
      case 'exams':
        return <ExamListTab />;
      case 'assignments':
        return <AssignmentListTab />; // Use real component now that backend is fixed
      case 'attendance':
        return (
          <div>
            <Title level={4}>Hồ sơ chuyên cần</Title>
            <Paragraph>
              Xem lại lịch sử điểm danh và tỷ lệ chuyên cần của bạn trong khóa học này.
            </Paragraph>
            <Link to={`/student/courses/${courseId}/my-attendance`}>
              <Button type="primary" size="large">
                Xem chi tiết điểm danh
              </Button>
            </Link>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Spin size="large" />
        <div className="mt-4">
          <p>Đang tải thông tin khóa học...</p>
          <p className="text-sm text-gray-500">Course ID: {courseId}</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-8">
        <Alert
          message={error || 'Không tìm thấy thông tin khóa học.'}
          type="error"
          showIcon
          description={
            <div>
              <p>Course ID: {courseId}</p>
              <p>Vui lòng kiểm tra lại đường dẫn hoặc liên hệ quản trị viên.</p>
            </div>
          }
        />
        <div className="mt-4 space-x-2">
          <button
            onClick={loadCourseDetails}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Thử lại
          </button>
          <button
            onClick={() => navigate('/student/my-courses')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/student/my-courses')}
          className="text-blue-500 hover:text-blue-700 mb-2"
        >
          &larr; Quay lại danh sách khóa học
        </button>
        <Title level={2} className="mb-1">{course.classroomName}</Title>
        <Text type="secondary">
          Giáo viên: {course.teacher?.fullName || course.teacherName || 'Chưa có thông tin'}
        </Text>
        <Paragraph className="mt-4">{course.description}</Paragraph>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('lectures')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'lectures'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bài giảng
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedule'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Lịch học
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'exams' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Kiểm tra
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assignments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bài tập
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'attendance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Điểm danh
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default StudentCourseDetail; 