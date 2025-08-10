import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';

import LectureList from '../../components/teacher/LectureList';
import StudentListTab from '../../components/teacher/StudentListTab';
import { ROLE } from '../../constants/constants';
import ClassroomService from '../../services/classroomService';
import ExamManagementTab from './ExamManagementTab';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('lectures');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    if (courseId) loadCourseDetail();
  }, [courseId]);

  const loadCourseDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ClassroomService.getClassroomDetails(courseId);
      setCourse(response.data);
    } catch (err) {
      console.error('Error loading course detail:', err);
      setError('Không thể tải thông tin khóa học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUploadMaterial = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', selectedFile.name);
      formData.append('description', 'Material uploaded from web interface');
      const parsedCourseId = parseInt(courseId);
      if (isNaN(parsedCourseId)) throw new Error('Invalid classroom ID');
      formData.append('classroomId', parsedCourseId);
      formData.append('isPublic', 'true');
      let userId = auth.userId || localStorage.getItem('userId');
      if (!userId || userId === 'null' || userId === 'undefined') {
        const userDataStr = localStorage.getItem('user');
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            userId = userData.id || userData.userId;
          } catch (e) {
            console.error('Failed to parse user data:', e);
          }
        }
      }
      const parsedUserId = parseInt(userId?.toString().trim());
      if (isNaN(parsedUserId) || parsedUserId <= 0) throw new Error('Invalid user ID');
      formData.append('uploadedBy', parsedUserId);
      const MaterialService = require('../../services/materialService').default;
      const response = await MaterialService.uploadMaterial(formData, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });
      console.log("Material uploaded successfully:", response);
      alert("Upload successful!");
      await loadCourseDetail();
    } catch (error) {
      console.error("Error uploading material:", error);
      alert(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  if (loading) return <div className="p-8"><h1 className="text-2xl font-bold mb-4">Chi tiết khóa học</h1><p>Đang tải thông tin khóa học...</p></div>;
  if (error || !course) return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Chi tiết khóa học</h1>
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error || 'Không tìm thấy khóa học.'}</p>
        <div className="mt-4 space-x-2">
          <button onClick={loadCourseDetail} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Thử lại</button>
          <button onClick={() => navigate('/teacher/courses')} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Quay lại</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => {
                const token = localStorage.getItem('token');
                const role = localStorage.getItem('role');
                if (!token) navigate('/');
                else {
                  switch (role) {
                    case ROLE.ADMIN: navigate('/admin'); break;
                    case ROLE.TEACHER: navigate('/teacher'); break;
                    case ROLE.MANAGER: navigate('/manager'); break;
                    case ROLE.STUDENT: navigate('/student'); break;
                    case ROLE.ACCOUNTANT: navigate('/accountant'); break;
                    default: navigate('/');
                  }
                }
              }}
              className="text-blue-500 hover:text-blue-700 mb-2 flex items-center"
            >← Quay lại danh sách khóa học</button>
            <h1 className="text-3xl font-bold mb-2">{course.name}</h1>
            <p className="text-gray-600 mb-6">Giáo viên: {course.teacher?.fullName || course.teacher?.name || 'Chưa xác định'}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{course.totalStudents || course.students?.length || 0}</div>
            <div className="text-sm text-blue-800">Học viên</div>
          </div>
          <div className="bg-green-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{course.totalLectures || course.lectures?.length || 0}</div>
            <div className="text-sm text-green-800">Bài giảng</div>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{course.subject || 'Chưa xác định'}</div>
            <div className="text-sm text-purple-800">Môn học</div>
          </div>
          <div className="bg-orange-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{course.section || 'Chưa xác định'}</div>
            <div className="text-sm text-orange-800">Lớp</div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button onClick={() => setActiveTab('lectures')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'lectures' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Bài giảng</button>
          <button onClick={() => setActiveTab('students')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'students' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Học viên</button>
          <Link to={`/teacher/courses/${courseId}/assignments`} onClick={() => setActiveTab('assignments')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'assignments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Bài tập</Link>
          <button onClick={() => setActiveTab('exams')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'exams' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Exams</button>
        </nav>
      </div>

      <div className="tab-content">
        {activeTab === 'lectures' && <LectureList lectures={course.lectures || []} courseId={courseId} courseName={course.name} />}
        {activeTab === 'students' && <StudentListTab classroomId={parseInt(courseId)} />}
        {activeTab === 'exams' && <ExamManagementTab />}
      </div>

      <div className="mt-8 p-4 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Upload New Material</h2>
        <div className="flex items-center">
          <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          <button onClick={handleUploadMaterial} disabled={!selectedFile || isUploading} className="ml-4 px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400">{isUploading ? 'Uploading...' : 'Upload'}</button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
