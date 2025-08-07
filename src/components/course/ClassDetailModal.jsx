import { useEffect, useState } from 'react';
import FirebaseMaterialService from '../../services/firebaseMaterialService';
import { showNotification } from '../../utils/courseManagementUtils';
import CreateAssignmentModal from './CreateAssignmentModal';
import CreateLectureModal from './CreateLectureModal';
import LectureDetailModal from './LectureDetailModal';
import UploadMaterialModal from './UploadMaterialModal';

const ClassDetailModal = ({ visible, classData, onCancel }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [materials, setMaterials] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [classLessons, setClassLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showLectureDetailModal, setShowLectureDetailModal] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);

  // Load class details when modal opens
  useEffect(() => {
    if (visible && classData) {
      loadClassDetails();
    }
  }, [visible, classData]);
  const loadClassDetails = async () => {
    setLoading(true);
    
    try {
      console.log('📚 Loading details for class:', classData);
      console.log('🔍 Class ID:', classData.id);
      
      // Get auth token for API calls
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // ===== FIXED: MERGE Firebase + Backend Materials =====
      let allMaterials = [];
      
      try {
        console.log('🔥🔄 Loading ALL materials (Firebase + Backend)...');
        
        // 1. Get Firebase materials first
        if (FirebaseMaterialService.isAvailable()) {
          try {
            const firebaseMaterials = await FirebaseMaterialService.getMaterialsByClassroom(classData.id);
            console.log('✅ Firebase materials loaded:', firebaseMaterials.length);
            console.log('🔥 Firebase materials data:', firebaseMaterials);
            allMaterials = [...firebaseMaterials]; // Add Firebase materials
          } catch (firebaseError) {
            console.warn('❌ Firebase materials failed:', firebaseError.message);
          }
        }

        // 2. Get Backend materials and merge
        try {
          let materialsResponse;
          let materialsEndpoint = `http://localhost:8088/api/materials/classroom/${classData.id}`;

          console.log('📡 Loading backend materials from:', materialsEndpoint);
          try {
            materialsResponse = await fetch(materialsEndpoint, {
              method: 'GET',
              headers: headers
            });

            if (!materialsResponse.ok) {
              throw new Error(`Real API failed: ${materialsResponse.status}`);
            }
          } catch (realApiError) {
            console.warn('❌ Real materials API failed:', realApiError.message);
            console.log('🔄 Falling back to mock materials API...');
            materialsEndpoint = `http://localhost:8088/api/mock-materials`;
            materialsResponse = await fetch(materialsEndpoint, {
              method: 'GET',
              headers: headers
            });
          }

          if (materialsResponse.ok) {
            const materialsData = await materialsResponse.json();
            console.log('✅ Backend materials response:', materialsData);

            // Parse backend materials
            let backendMaterials = [];
            if (Array.isArray(materialsData)) {
              backendMaterials = materialsData;
            } else if (materialsData && Array.isArray(materialsData.data)) {
              backendMaterials = materialsData.data;
            } else if (materialsData && Array.isArray(materialsData.content)) {
              backendMaterials = materialsData.content;
            }

            // Add backend materials (avoid duplicates)
            backendMaterials.forEach(backendMaterial => {
              const exists = allMaterials.some(m => 
                m.fileName === backendMaterial.fileName || 
                m.name === backendMaterial.name ||
                m.id === backendMaterial.id
              );
              if (!exists) {
                allMaterials.push({
                  ...backendMaterial,
                  isFirebase: false // Mark as backend material
                });
              }
            });

            console.log('📡 Backend materials added:', backendMaterials.length);
          } else {
            console.warn('❌ Backend materials API failed');
          }
        } catch (backendError) {
          console.error('❌ Backend materials error:', backendError);
        }

        // 3. Set merged materials
        setMaterials(allMaterials);
        console.log('🎯 TOTAL MATERIALS SET:', allMaterials.length);
        console.log('🎯 Materials breakdown:', {
          firebase: allMaterials.filter(m => m.isFirebase).length,
          backend: allMaterials.filter(m => !m.isFirebase).length,
          total: allMaterials.length
        });

      } catch (error) {
        console.error('❌ Error loading materials:', error);
        setMaterials([]);
      }

      // ===== REST OF THE CODE (lectures, lessons) REMAINS THE SAME =====
      
      // Load real lectures from API
      try {
        console.log('🔄 Fetching lectures from:', `http://localhost:8088/api/lectures/classroom/${classData.id}`);
        const lecturesResponse = await fetch(`http://localhost:8088/api/lectures/classroom/${classData.id}`, {
          method: 'GET',
          headers: headers
        });
        console.log('📡 Lectures response status:', lecturesResponse.status);
        
        if (lecturesResponse.ok) {
          const lecturesData = await lecturesResponse.json();
          console.log('✅ Raw lectures response:', lecturesData);
          
          // Handle different response formats
          let finalLectures = [];
          if (Array.isArray(lecturesData)) {
            finalLectures = lecturesData;
          } else if (lecturesData && Array.isArray(lecturesData.data)) {
            finalLectures = lecturesData.data;
          } else if (lecturesData && Array.isArray(lecturesData.content)) {
            finalLectures = lecturesData.content;
          }
          
          setLectures(finalLectures);
          console.log('✅ Final lectures count:', finalLectures.length);
        } else {
          console.warn('❌ Lectures API failed with status:', lecturesResponse.status);
          setLectures([]);
        }
      } catch (error) {
        console.error('❌ Error loading lectures:', error);
        setLectures([]);
      }

      // Load class lessons from course template
      try {
        if (classData.courseTemplateId) {
          console.log('🔄 Fetching template lessons from:', `http://localhost:8088/api/course-templates/${classData.courseTemplateId}/lessons`);
          const lessonsResponse = await fetch(`http://localhost:8088/api/course-templates/${classData.courseTemplateId}/lessons`, {
            method: 'GET',
            headers: headers
          });
          console.log('📡 Template lessons response status:', lessonsResponse.status);
          
          if (lessonsResponse.ok) {
            const lessonsData = await lessonsResponse.json();
            console.log('✅ Raw template lessons response:', lessonsData);
            
            // Handle different response formats
            let finalLessons = [];
            if (Array.isArray(lessonsData)) {
              finalLessons = lessonsData;
            } else if (lessonsData && Array.isArray(lessonsData.data)) {
              finalLessons = lessonsData.data;
            } else if (lessonsData && Array.isArray(lessonsData.content)) {
              finalLessons = lessonsData.content;
            }
            
            setClassLessons(finalLessons);
            console.log('✅ Final lessons count:', finalLessons.length);
          } else {
            console.warn('❌ Template lessons API failed with status:', lessonsResponse.status);
            setClassLessons([]);
          }
        } else {
          console.warn('❌ No courseTemplateId found in classData');
          setClassLessons([]);
        }
      } catch (error) {
        console.error('❌ Error loading template lessons:', error);
        setClassLessons([]);
      }

      // For now, keep assignments as empty since no API found
      setAssignments([]);
      
    } catch (error) {
      console.error('❌ Error loading class details:', error);
      showNotification('Lỗi khi tải thông tin lớp học', 'error');
    } finally {
      setLoading(false);
    }
  };



  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    
    try {
      let date;
      if (Array.isArray(dateInput)) {
        date = new Date(dateInput[0], dateInput[1] - 1, dateInput[2]);
      } else {
        date = new Date(dateInput);
      }
      
      return date.toLocaleDateString('vi-VN');
    } catch {
      return String(dateInput);
    }
  };

  const getFileTypeIcon = (material) => {
    // If it's a Firebase material, use Firebase service
    if (material.isFirebase) {
      return '🔥' + FirebaseMaterialService.getFileTypeIcon(material.fileType || material.type);
    }
    
    // Backend material icons
    const type = material.type || material.fileType;
    const icons = {
      'presentation': '📊',
      'document': '📄',
      'video': '🎥',
      'audio': '🎵',
      'image': '🖼️',
      'archive': '📦'
    };
    return icons[type] || '📁';
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': { text: 'Đang hoạt động', color: 'bg-green-100 text-green-800' },
      'completed': { text: 'Đã hoàn thành', color: 'bg-blue-100 text-blue-800' },
      'scheduled': { text: 'Đã lên lịch', color: 'bg-yellow-100 text-yellow-800' },
      'draft': { text: 'Bản nháp', color: 'bg-gray-100 text-gray-800' }
    };
    
    const badge = badges[status] || { text: status || 'Không xác định', color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  // Handle material download - Firebase first, then backend fallback
  const handleDownloadMaterial = async (material) => {
    try {
      console.log('📥 Downloading material:', material);
      
      // Check if this is a Firebase material
      if (material.isFirebase && material.downloadUrl) {
        console.log('🔥 Using Firebase download...');
        try {
          await FirebaseMaterialService.downloadMaterial(material);
          showNotification(`🔥 Tải xuống Firebase "${material.name || material.fileName}" thành công!`, 'success');
          return;
        } catch (firebaseError) {
          console.warn('❌ Firebase download failed:', firebaseError.message);
          // Continue to backend fallback
        }
      }
      
      // Backend download fallback
      console.log('📡 Using backend download...');
      const downloadUrls = [
        `http://localhost:8088/api/materials/download/${material.id}`,
        `http://localhost:8088/api/mock-materials/download/${material.id}`,
        `http://localhost:8088/api/mock-materials/${material.id}/download`
      ];
      
      let response;
      let successUrl;
      
      for (const downloadUrl of downloadUrls) {
        try {
          console.log('🔄 Trying download from:', downloadUrl);
          response = await fetch(downloadUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            },
          });
          
          if (response.ok) {
            successUrl = downloadUrl;
            break;
          }
        } catch (error) {
          console.warn(`Download attempt failed for ${downloadUrl}:`, error.message);
        }
      }
      
      if (!response || !response.ok) {
        throw new Error('All download methods failed');
      }
      
      console.log('✅ Backend download successful from:', successUrl);
      
      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = material.name || material.fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL
      window.URL.revokeObjectURL(link.href);
      
      showNotification(`📡 Tải xuống backend "${material.name || material.fileName}" thành công!`, 'success');
      
    } catch (error) {
      console.error('❌ Download error:', error);
      showNotification('Lỗi khi tải xuống tài liệu', 'error');
    }
  };

  // Handle material delete - Firebase first, then backend fallback
  const handleDeleteMaterial = async (material) => {
    const materialName = material.name || material.fileName;
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa "${materialName}"?`);
    if (!confirmed) return;

    try {
      console.log('🗑️ Deleting material:', material);
      
      // Check if this is a Firebase material
      if (material.isFirebase && material.firebaseRef) {
        console.log('🔥 Using Firebase delete...');
        try {
          await FirebaseMaterialService.deleteMaterial(material);
          // Remove from state only after successful deletion
          setMaterials(prev => prev.filter(m => m.id !== material.id));
          showNotification(`🔥 Đã xóa Firebase "${materialName}"`, 'success');
          return;
        } catch (firebaseError) {
          console.warn('❌ Firebase delete failed:', firebaseError.message);
          // Continue to backend fallback
        }
      }
      
      // Backend delete fallback
      console.log('📡 Using backend delete...');
      const deleteUrls = [
        `http://localhost:8088/api/materials/${material.id}`,
        `http://localhost:8088/api/mock-materials/${material.id}`
      ];
      
      let response;
      let successUrl;
      
      for (const deleteUrl of deleteUrls) {
        try {
          console.log('🔄 Trying delete from:', deleteUrl);
          response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            successUrl = deleteUrl;
            break;
          }
        } catch (error) {
          console.warn(`Delete attempt failed for ${deleteUrl}:`, error.message);
        }
      }

      if (response && response.ok) {
        console.log('✅ Backend delete successful from:', successUrl);
        // Remove from state only after successful API call
        setMaterials(prev => prev.filter(m => m.id !== material.id));
        showNotification(`📡 Đã xóa backend "${materialName}"`, 'success');
      } else {
        console.error('All delete methods failed');
        showNotification('Lỗi khi xóa tài liệu', 'error');
      }
      
    } catch (error) {
      console.error('❌ Delete error:', error);
      showNotification('Lỗi khi xóa tài liệu', 'error');
    }
  };

  // Handle upload success
  const handleUploadSuccess = async (uploadResult) => {
    console.log('🎯 Upload success, force reloading ALL materials...', uploadResult);
    
    // Force reload ALL materials data to see the new file
    await loadClassDetails();
    
    showNotification('🔥 Tài liệu đã được thêm và sẽ hiển thị ngay!', 'success');
  };

  // Handle lecture success
  const handleLectureSuccess = (lectureData) => {
    setShowLectureModal(false);
    setLectures(prev => [lectureData, ...prev]); // Add to state
    showNotification('Bài giảng đã được thêm vào lớp học', 'success');
  };

  // Handle assignment success
  const handleAssignmentSuccess = (assignmentData) => {
    setShowAssignmentModal(false);
    setAssignments(prev => [assignmentData, ...prev]); // Add to state
    showNotification('Bài tập đã được thêm vào lớp học', 'success');
  };

  if (!visible || !classData) return null;

  const tabs = [
    { key: 'overview', label: '📋 Tổng quan', icon: '' },
    { key: 'lessons', label: '📖 Bài học', icon: '', count: classLessons.length },
    { key: 'materials', label: '📚 Tài liệu', icon: '', count: materials.length },
    { key: 'lectures', label: '🎓 Bài giảng', icon: '', count: lectures.length },
    { key: 'assignments', label: '📝 Bài tập', icon: '', count: assignments.length },
    { key: 'students', label: '👥 Học viên', icon: '', count: classData.currentStudents || 0 }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="text-2xl mr-3">🏫</span>
                {classData.className || classData.class_name || 'Lớp học'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                ID: {classData.id} • Template: {classData.courseTemplateName || classData.template_name || 'N/A'}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-gray-200 bg-white">
          <nav className="flex space-x-6">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Đang tải thông tin...</p>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tên lớp:</span>
                          <span className="font-medium">{classData.className || classData.class_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Giáo viên:</span>
                          <span className="font-medium">{classData.teacherName || classData.teacher_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phòng học:</span>
                          <span className="font-medium">{classData.roomName || classData.room_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Học viên:</span>
                          <span className="font-medium">{classData.currentStudents || 0}/{classData.maxStudents || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Thời gian:</span>
                          <span className="font-medium">
                            {formatDate(classData.startDate)} → {formatDate(classData.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3">Thống kê nhanh</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-indigo-600">{classLessons.length}</div>
                          <div className="text-indigo-700">Bài học</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{materials.length}</div>
                          <div className="text-blue-700">Tài liệu</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{lectures.length}</div>
                          <div className="text-green-700">Bài giảng</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{assignments.length}</div>
                          <div className="text-yellow-700">Bài tập</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{classData.currentStudents || 0}</div>
                          <div className="text-purple-700">Học viên</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {classData.description && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Mô tả</h4>
                      <p className="text-sm text-gray-700">{classData.description}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Lessons Tab */}
              {activeTab === 'lessons' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-gray-900">Bài học lớp ({classLessons.length})</h4>
                  </div>
                  
                  {classLessons.length > 0 ? (
                    <div className="space-y-3">
                      {classLessons.map((lesson, index) => (
                        <div key={lesson.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                                Tuần {lesson.weekNumber || lesson.week}
                              </span>
                              <h5 className="font-medium text-gray-900 inline">{lesson.topicName || lesson.topic}</h5>
                            </div>
                            <span className="text-xs text-gray-500">{lesson.durationMinutes || 120} phút</span>
                          </div>
                          {lesson.lessonType && (
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Loại:</span> {lesson.lessonType}
                            </div>
                          )}
                          {lesson.objectives && (
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Mục tiêu:</span> {lesson.objectives}
                            </div>
                          )}
                          {lesson.requirements && (
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Yêu cầu:</span> {lesson.requirements}
                            </div>
                          )}
                          {lesson.preparations && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Chuẩn bị:</span> {lesson.preparations}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-2">📖</div>
                      <p>Chưa có bài học nào</p>
                    </div>
                  )}
                </div>
              )}

              {/* Materials Tab */}
              {activeTab === 'materials' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-gray-900">Tài liệu lớp học ({materials.length})</h4>
                    <button 
                      onClick={() => setShowUploadModal(true)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
                    >
                      <span className="mr-2">📤</span>
                      Thêm tài liệu
                    </button>
                  </div>
                  
                  {materials.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {materials.map(material => (
                        <div key={material.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{getFileTypeIcon(material)}</span>
                              <div>
                                <h5 className="font-medium text-gray-900 text-sm">{material.name}</h5>
                                <p className="text-xs text-gray-500">Tải lên: {formatDate(material.uploadDate)}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2 mt-3">
                            <button 
                              onClick={() => handleDownloadMaterial(material)}
                              className="text-blue-500 hover:text-blue-700 text-xs flex items-center"
                            >
                              <span className="mr-1">📥</span>
                              Tải về
                            </button>
                            <button 
                              onClick={() => handleDeleteMaterial(material)}
                              className="text-red-500 hover:text-red-700 text-xs flex items-center"
                            >
                              <span className="mr-1">🗑️</span>
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-2">📚</div>
                      <p>Chưa có tài liệu nào</p>
                    </div>
                  )}
                </div>
              )}

              {/* Lectures Tab */}
              {activeTab === 'lectures' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-gray-900">Bài giảng ({lectures.length})</h4>
                    <button 
                      onClick={() => setShowLectureModal(true)}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
                    >
                      <span className="mr-2">➕</span>
                      Thêm bài giảng
                    </button>
                  </div>
                  
                  {lectures.length > 0 ? (
                    <div className="space-y-3">
                      {lectures.map(lecture => (
                        <div key={lecture.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium text-gray-900">{lecture.title}</h5>
                              <p className="text-sm text-gray-600">Thời lượng: {lecture.duration}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              {getStatusBadge(lecture.status)}
                              <button 
                                onClick={() => {
                                  setSelectedLecture(lecture);
                                  setShowLectureDetailModal(true);
                                }}
                                className="text-blue-500 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded border border-blue-200 hover:bg-blue-50"
                              >
                                📚 Chi tiết & Bài tập
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-2">🎓</div>
                      <p>Chưa có bài giảng nào</p>
                    </div>
                  )}
                </div>
              )}

              {/* Assignments Tab */}
              {activeTab === 'assignments' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-gray-900">Bài tập ({assignments.length})</h4>
                    <button 
                      onClick={() => setShowAssignmentModal(true)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 flex items-center"
                    >
                      <span className="mr-2">📝</span>
                      Thêm bài tập
                    </button>
                  </div>
                  
                  {assignments.length > 0 ? (
                    <div className="space-y-3">
                      {assignments.map(assignment => (
                        <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium text-gray-900">{assignment.title}</h5>
                              <p className="text-sm text-gray-600">Hạn nộp: {formatDate(assignment.dueDate)}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              {getStatusBadge(assignment.status)}
                              <button className="text-blue-500 hover:text-blue-700 text-sm">Chi tiết</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-2">📝</div>
                      <p>Chưa có bài tập nào</p>
                    </div>
                  )}
                </div>
              )}

              {/* Students Tab */}
              {activeTab === 'students' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-gray-900">Học viên ({classData.currentStudents || 0})</h4>
                    <button className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 flex items-center">
                      <span className="mr-2">👥</span>
                      Quản lý học viên
                    </button>
                  </div>
                  
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">👥</div>
                    <p>Chức năng quản lý học viên đang phát triển</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* Upload Material Modal */}
        <UploadMaterialModal
          visible={showUploadModal}
          classData={classData}
          onCancel={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />

        {/* Create Lecture Modal */}
        <CreateLectureModal
          visible={showLectureModal}
          classData={classData}
          onCancel={() => setShowLectureModal(false)}
          onSuccess={handleLectureSuccess}
        />

        {/* Create Assignment Modal */}
        <CreateAssignmentModal
          visible={showAssignmentModal}
          classData={classData}
          onCancel={() => setShowAssignmentModal(false)}
          onSuccess={handleAssignmentSuccess}
        />

        {/* Lecture Detail Modal */}
        <LectureDetailModal
          visible={showLectureDetailModal}
          lecture={selectedLecture}
          classData={classData}
          onCancel={() => {
            setShowLectureDetailModal(false);
            setSelectedLecture(null);
          }}
          onUpdate={(updatedLecture) => {
            // Update lecture in the list
            setLectures(prev => prev.map(l => l.id === updatedLecture.id ? updatedLecture : l));
          }}
        />
      </div>
    </div>
  );
};

export default ClassDetailModal;