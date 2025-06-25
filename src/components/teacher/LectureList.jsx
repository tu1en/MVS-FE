import { Modal, message } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LectureList = ({ courseId, courseName, onEditLecture }) => {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (courseId) {
      loadLectures();
    }
  }, [courseId]);

  const loadLectures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8088/api/courses/${courseId}/lectures`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Lectures response:', response.data);
      setLectures(response.data || []);
    } catch (error) {
      console.error('Error loading lectures:', error);
      setError('Không thể tải danh sách bài giảng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
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
    if (onEditLecture) {
      onEditLecture(lecture);
    } else {
      console.warn('onEditLecture callback not provided');
    }
  };
  const handleStartLecture = (lecture) => {
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
        <h2 className="text-xl font-bold">Bài giảng - {courseName}</h2>
        <span className="text-sm text-gray-500">{lectures.length} bài giảng</span>
      </div>

      {lectures.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Chưa có bài giảng nào cho khóa học này.</p>
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
                    <p className="text-gray-700 mb-3">{lecture.content}</p>
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

              {/* Actions */}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LectureList;
