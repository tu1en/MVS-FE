import { App, Button, Modal } from 'antd';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';

const LectureList = ({ courseId, courseName, onEditLecture, isStudentView = false }) => {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [creatingData, setCreatingData] = useState(false);
  const [lastLoadedCourseId, setLastLoadedCourseId] = useState(null);

  // Get message API from App context
  const { message } = App.useApp();

  // Memoize loadLectures to prevent unnecessary re-renders
  const loadLectures = useCallback(async () => {
    try {
      console.log(`📚 LectureList: Loading lectures for courseId: ${courseId}`);
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const endpoint = `http://localhost:8088/api/courses/${courseId}/lectures`;

      console.log(`📡 LectureList: Fetching from ${endpoint}`);

      // Fetch lectures
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ LectureList: Response status: ${response.status}`);
      console.log(`📊 LectureList: Response data:`, response.data);

      // Mark this courseId as loaded to prevent duplicate calls
      setLastLoadedCourseId(courseId);
      
      // Process lectures data
      const lecturesData = response.data || [];
      console.log(`📋 LectureList: Processing ${lecturesData.length} lectures`);

      // Verify data structure of first lecture
      if (lecturesData.length > 0) {
        const firstLecture = lecturesData[0];
        console.log(`🔍 LectureList: Sample lecture structure:`, {
          id: firstLecture.id,
          title: firstLecture.title,
          lectureDate: firstLecture.lectureDate,
          hasContent: !!firstLecture.content,
          contentLength: firstLecture.content ? firstLecture.content.length : 0,
          hasMaterials: !!firstLecture.materials,
          materialsCount: firstLecture.materials ? firstLecture.materials.length : 0
        });
      }

      // For now, use lectures as-is without fetching additional materials
      // This reduces API calls and improves performance
      const lecturesWithMaterials = lecturesData.map(lecture => ({
        ...lecture,
        materials: lecture.materials || [] // Ensure materials is always an array
      }));

      console.log(`📋 LectureList: Final lectures ready (${lecturesWithMaterials.length} items)`);
      setLectures(lecturesWithMaterials);
    } catch (error) {
      console.error('❌ LectureList: Error loading lectures:', error);
      console.error('   Status:', error.response?.status);
      console.error('   Data:', error.response?.data);
      setError('Không thể tải danh sách bài giảng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [courseId, lastLoadedCourseId, message]);

  // Optimized useEffect with proper dependencies and loading state check
  useEffect(() => {
    console.log(`[DEBUG] LectureList useEffect triggered. courseId: ${courseId}, lastLoadedCourseId: ${lastLoadedCourseId}, loading: ${loading}`);
    // Only load if courseId is valid, different from last loaded, and not currently loading
    if (courseId && courseId !== lastLoadedCourseId && !loading) {
      console.log(`🔄 LectureList: CourseId changed from ${lastLoadedCourseId} to ${courseId}, loading lectures...`);
      loadLectures();
    } else if (courseId === lastLoadedCourseId) {
      console.log(`⏭️ LectureList: CourseId ${courseId} already loaded, skipping duplicate call`);
    } else if (!courseId) {
      console.log(`⚠️ LectureList: No courseId provided, skipping load`);
    } else if (loading) {
      console.log(`⏳ LectureList: Already loading lectures for courseId ${courseId}, skipping duplicate call`);
    }
  }, [courseId, lastLoadedCourseId, loadLectures, loading]);

  const createSampleLectures = async () => {
    try {
      setCreatingData(true);
      const token = localStorage.getItem('token');
      
      // Gọi API để tạo bài giảng mẫu
      await axios.post(`http://localhost:8088/api/courses/${courseId}/sample-lectures`, {}, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      // Tải lại danh sách bài giảng sau khi tạo
      await loadLectures();
      
      message.success('Đã tạo bài giảng mẫu thành công');
    } catch (error) {
      console.error('Error creating sample lectures:', error);
      message.error('Không thể tạo bài giảng mẫu: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreatingData(false);
    }
  };

  const renderYouTubeEmbed = (url) => {
    if (!url || !url.includes('youtube.com/embed/')) return null;
    
    return (
      <div className="mt-3">
        <iframe
          width="100%"
          height="200"
          src={url}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded"
        ></iframe>
      </div>
    );
  };
  const handleDeleteLecture = async (lectureId, lectureTitle) => {
    // Only allow deleting in teacher view
    if (isStudentView) return;
    
    Modal.confirm({
      title: 'Xác nhận xóa bài giảng',
      content: `Bạn có chắc chắn muốn xóa bài giảng "${lectureTitle || 'này'}"? Tất cả tài liệu bên trong cũng sẽ bị xóa.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setDeletingId(lectureId);
          const token = localStorage.getItem('token');
          
          const response = await fetch(`http://localhost:8088/api/courses/${courseId}/lectures/${lectureId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`Failed to delete lecture: ${response.status}`);
          }

          // Remove from local state
          setLectures(prev => prev.filter(lecture => lecture.id !== lectureId));
          message.success('Đã xóa bài giảng thành công');
          console.log('Lecture deleted successfully');
          
        } catch (error) {
          console.error('Error deleting lecture:', error);
          message.error('Lỗi xóa bài giảng: ' + error.message);
        } finally {
          setDeletingId(null);
        }
      },
      onCancel() {
        console.log('Delete cancelled');
      }
    });
  };
  const handleEditLecture = (lecture) => {
    // Only allow editing in teacher view
    if (isStudentView) return;
    
    if (onEditLecture) {
      onEditLecture(lecture);
    } else {
      console.warn('onEditLecture callback not provided');
    }
  };
  const handleStartLecture = (lecture) => {
    // Only allow starting lecture in teacher view
    if (isStudentView) return;
    
    Modal.confirm({
      title: 'Bắt đầu bài giảng',
      content: `Bạn có muốn bắt đầu bài giảng "${lecture.title}" ngay bây giờ không? Hệ thống sẽ chuyển bạn đến phòng học trực tuyến.`,
      okText: 'Bắt đầu',
      okType: 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          // Navigate to teacher online classes page
          navigate('/teacher/online-classes');
          
          // Show success message
          message.success(`Đã bắt đầu bài giảng "${lecture.title}". Chuyển đến phòng học trực tuyến.`);
          
          console.log('Starting lecture:', lecture);
          
          // Optional: You could call an API to mark lecture as started
          // await markLectureAsStarted(lecture.id);
          
        } catch (error) {
          console.error('Error starting lecture:', error);
          message.error('Lỗi khi bắt đầu bài giảng: ' + error.message);
        }
      },
      onCancel() {
        console.log('Start lecture cancelled');
      }
    });
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Bài giảng - {courseName}</h2>
        <p>Đang tải danh sách bài giảng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Bài giảng - {courseName}</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={loadLectures}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">
          {isStudentView ? 'Danh sách bài giảng' : `Bài giảng - ${courseName}`}
        </h2>
        <span className="text-sm text-gray-500">{lectures.length} bài giảng</span>
      </div>

      {lectures.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Chưa có bài giảng nào cho khóa học này.</p>
          <Button
            type="primary"
            loading={creatingData}
            onClick={createSampleLectures}
            className="mt-4"
          >
            Tạo bài giảng mẫu
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {lectures.map((lecture) => (
            <div key={lecture.id} className="bg-white rounded-lg shadow-md p-6 border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{lecture.title}</h3>
                  {lecture.description && (
                    <p className="text-gray-600 text-sm mb-2">{lecture.description}</p>
                  )}
                  {lecture.content && (
                    <div className="mb-3">
                      <MarkdownRenderer content={lecture.content} />
                    </div>
                  )}
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {lecture.type || 'ONLINE'}
                </span>
              </div>

              {/* Materials Section */}
              {lecture.materials && lecture.materials.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-3">Tài liệu bài giảng:</h4>
                  <div className="space-y-3">
                    {lecture.materials.map((material, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm">
                              {material.contentType === 'video/youtube' ? '🎥' : '📄'}
                            </span>
                            <span className="ml-2 font-medium">{material.fileName}</span>
                          </div>
                          {material.contentType !== 'video/youtube' && (
                            <a 
                              href={material.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 text-sm"
                            >
                              Tải xuống
                            </a>
                          )}
                        </div>
                        
                        {/* Render YouTube video if it's a YouTube material */}
                        {material.contentType === 'video/youtube' && renderYouTubeEmbed(material.downloadUrl)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lecture Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {lecture.startTime && (
                  <span>⏰ Bắt đầu: {new Date(lecture.startTime).toLocaleString()}</span>
                )}
                {lecture.endTime && (
                  <span>⏱️ Kết thúc: {new Date(lecture.endTime).toLocaleString()}</span>
                )}
                {lecture.isRecordingEnabled && (
                  <span className="text-red-500">🔴 Ghi hình</span>
                )}
              </div>

              {/* Actions - Only show for teacher view */}
              {!isStudentView && (
                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() => handleEditLecture(lecture)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Chỉnh sửa
                  </button>                <button 
                    onClick={() => handleStartLecture(lecture)}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Bắt đầu
                  </button><button 
                    onClick={() => handleDeleteLecture(lecture.id, lecture.title)}
                    disabled={deletingId === lecture.id}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
                  >
                    {deletingId === lecture.id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LectureList;
