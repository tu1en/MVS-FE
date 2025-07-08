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
      setLoading(true);
      setError(null);
      // We need a new service method to get details for a single course
      const courseData = await ClassroomService.getClassroomDetails(courseId);
      setCourse(courseData);
    } catch (err) {
      console.error('Error loading course details:', err);
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
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-8">
        <Alert message={error || 'Không tìm thấy thông tin khóa học.'} type="error" showIcon />
        <button 
          onClick={() => navigate('/student/my-courses')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Quay lại danh sách
        </button>
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
        <Title level={2} className="mb-1">{course.name}</Title>
        <Text type="secondary">Giáo viên: {course.teacherName}</Text>
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