import { Button } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CreateLectureModal from '../../components/teacher/CreateLectureModal';
import CreateRealtimeAttendanceModal from '../../components/teacher/CreateRealtimeAttendanceModal';
import EditClassroomModal from '../../components/teacher/EditClassroomModal';
import LectureList from '../../components/teacher/LectureList';
import StudentListTab from '../../components/teacher/StudentListTab';
import ClassroomService from '../../services/classroomService';
import ExamManagementTab from './ExamManagementTab';


const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('lectures');
  const [editingLecture, setEditingLecture] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // 1. State cho file
  const [isUploading, setIsUploading] = useState(false); // State cho trạng thái upload
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false); // State for enrollment modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Get auth state from Redux
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    if (courseId) {
      loadCourseDetail();
    }
  }, [courseId]);

  const handleSessionCreated = (newSession) => {
    // Navigate to the new real-time page, passing the session object in state
    navigate(`/teacher/courses/${courseId}/attendance-session`, { state: { session: newSession } });
  };

  const loadCourseDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ClassroomService.getClassroomDetails(courseId);
      setCourse(response.data);

    } catch (error) {
      console.error('Error loading course detail:', error);
      setError('Không thể tải thông tin khóa học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleLectureCreated = () => {
    setShowCreateModal(false);
    setEditingLecture(null);
    // Refresh course detail and lectures list
    loadCourseDetail();
  };

  const handleEditLecture = (lecture) => {
    setEditingLecture(lecture);
    setShowCreateModal(true);
  };

  // 2. Hàm xử lý khi chọn file
  const handleFileChange = (e) => {
      setSelectedFile(e.target.files[0]);
  };

  // 3. Hàm xử lý khi nhấn nút upload
  const handleUploadMaterial = async () => {
      if (!selectedFile) {
          alert("Please select a file to upload.");
          return;
      }
      try {
          setIsUploading(true);
          const formData = new FormData();
          formData.append('file', selectedFile); // File để upload
          
          // Các tham số bắt buộc từ CourseMaterialController
          formData.append('title', selectedFile.name); // Sử dụng tên file làm tiêu đề
          formData.append('description', 'Material uploaded from web interface'); // Mô tả mặc định
          
          // Ensure courseId is a valid number
          const parsedCourseId = parseInt(courseId);
          if (isNaN(parsedCourseId)) {
              throw new Error('Invalid classroom ID');
          }
          formData.append('classroomId', parsedCourseId); // ID lớp học - ensure it's a number
          
          formData.append('isPublic', 'true'); // Tài liệu được chia sẻ công khai
          
          // Get userId from Redux state - this is the most reliable source
          let userId = auth.userId;
          
          // Fallback to localStorage if Redux state doesn't have it
          if (!userId || userId === 'null' || userId === 'undefined') {
              userId = localStorage.getItem('userId');
          }
          
          // If still no userId, check user object in localStorage as a last resort
          if (!userId || userId === 'null' || userId === 'undefined') {
              const userDataStr = localStorage.getItem('user');
              if (userDataStr && userDataStr !== 'null' && userDataStr !== 'undefined') {
                  try {
                      const userData = JSON.parse(userDataStr);
                      userId = userData.id || userData.userId;
                  } catch (e) {
                      console.error('Failed to parse user data:', e);
                  }
              }
          }
          
          // Additional validation to ensure we have a valid userId
          if (!userId || userId === 'null' || userId === 'undefined' || userId.toString().trim() === '') {
              console.error('Auth state:', auth);
              console.error('LocalStorage userId:', localStorage.getItem('userId'));
              console.error('LocalStorage user:', localStorage.getItem('user'));
              throw new Error('User ID not found. Please log in again.');
          }
          
          // Ensure userId is a number - convert string to number if needed
          const parsedUserId = parseInt(userId.toString().trim());
          if (isNaN(parsedUserId) || parsedUserId <= 0) {
              console.error('Invalid userId value:', userId);
              throw new Error('Invalid user ID format. Please log in again.');
          }
          
          formData.append('uploadedBy', parsedUserId);

          // Import and use the actual MaterialService instead of setTimeout simulation
          const MaterialService = require('../../services/materialService').default;
          const response = await MaterialService.uploadMaterial(formData, (progress) => {
              console.log(`Upload progress: ${progress}%`);
          });
          
          console.log("Material uploaded successfully:", response);
          alert("Upload successful!");
          
          // Refresh the course details to show the newly uploaded material
          await loadCourseDetail();
      } catch (error) {
          console.error("Error uploading material:", error);
          alert(`Upload failed: ${error.message || 'Unknown error'}`);
      } finally {
          setIsUploading(false);
          setSelectedFile(null); // Reset input
      }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Chi tiết khóa học</h1>
        <p>Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Chi tiết khóa học</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Không tìm thấy khóa học.'}</p>
          <div className="mt-4 space-x-2">
            <button 
              onClick={loadCourseDetail}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Thử lại
            </button>
            <button 
              onClick={() => navigate('/teacher/courses')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <button 
              onClick={() => navigate('/teacher/courses')}
              className="text-blue-500 hover:text-blue-700 mb-2 flex items-center"
            >
              ← Quay lại danh sách khóa học
            </button>
            <h1 className="text-3xl font-bold mb-2">{course.name}</h1>
            <p className="text-gray-600 mb-6">Giáo viên: {course.teacher?.name}</p>
          </div>
          <div className="flex flex-col space-y-2">
            <Button 
              type="primary"
              onClick={() => setShowCreateModal(true)}
              className="bg-green-500 hover:bg-green-600 flex items-center justify-center"
            >
              Tạo bài giảng mới
            </Button>
            <Button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center justify-center"
            >
              Chỉnh sửa lớp học
            </Button>
            <CreateRealtimeAttendanceModal 
              classroomId={parseInt(courseId)}
              onSessionCreated={handleSessionCreated}
            />
          </div>
        </div>

        {/* Course Info Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{course.totalStudents || 0}</div>
            <div className="text-sm text-blue-800">Học viên</div>
          </div>
          <div className="bg-green-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{course.lectures?.length || 0}</div>
            <div className="text-sm text-green-800">Bài giảng</div>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{course.subject || 'N/A'}</div>
            <div className="text-sm text-purple-800">Môn học</div>
          </div>
          <div className="bg-orange-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{course.totalAssignments || 0}</div>
            <div className="text-sm text-orange-800">Bài tập</div>
          </div>
        </div>
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
            onClick={() => setActiveTab('students')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'students'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Học viên
          </button>
          <Link
            to={`/teacher/courses/${courseId}/assignments`}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assignments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('assignments')}
          >
            Bài tập
          </Link>
          <button
            onClick={() => setActiveTab('exams')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'exams'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Exams
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'lectures' && (
          <LectureList 
            lectures={course.lectures || []}
            courseId={courseId} 
            courseName={course.name} 
            onEditLecture={handleEditLecture}
          />
        )}
        
        {activeTab === 'students' && (
          <StudentListTab classroomId={parseInt(courseId)} />
        )}

        {activeTab === 'exams' && (
          <ExamManagementTab />
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Cài đặt khóa học</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên khóa học
                </label>
                <input 
                  type="text" 
                  defaultValue={course.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea 
                  defaultValue={course.description}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div className="flex space-x-2">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Lưu thay đổi
                </button>
                <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Material Form */}
      <div className="mt-8 p-4 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Upload New Material</h2>
        <div className="flex items-center">
            <input 
                type="file" 
                onChange={handleFileChange} 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button 
                onClick={handleUploadMaterial} 
                disabled={!selectedFile || isUploading}
                className="ml-4 px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
            >
                {isUploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
      </div>

      {/* Create Lecture Modal */}
      <CreateLectureModal
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          setEditingLecture(null);
        }}
        onSuccess={handleLectureCreated}
        courseId={parseInt(courseId)}
        editingLecture={editingLecture}
      />

      <EditClassroomModal
            visible={isEditModalOpen}
            onCancel={() => setIsEditModalOpen(false)}
            onOk={(updatedClassroom) => {
                setCourse(updatedClassroom);
                setIsEditModalOpen(false);
            }}
            classroom={course}
        />
    </div>
  );
};

export default CourseDetail;
