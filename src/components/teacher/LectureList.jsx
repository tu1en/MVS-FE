import { App, Modal } from 'antd';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import scheduleService from '../../services/scheduleService';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';

const LectureList = ({ courseId, courseName, isStudentView = false }) => {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [lecturesByDate, setLecturesByDate] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastLoadedCourseId, setLastLoadedCourseId] = useState(null);

  // Get message API from App context
  const { message } = App.useApp();

  // Function to load classroom schedules
  const loadSchedules = useCallback(async () => {
    try {
      console.log(`📅 LectureList: Loading schedules for courseId: ${courseId}`);
      const scheduleData = await scheduleService.getClassroomSchedule(courseId);
      console.log(`📅 LectureList: Loaded ${scheduleData.length} schedules`);
      setSchedules(scheduleData);
      return scheduleData;
    } catch (error) {
      console.error('❌ LectureList: Error loading schedules:', error);
      return [];
    }
  }, [courseId]);

  // Function to organize lectures by schedule dates
  const organizeLecturesByDate = useCallback((lecturesData, scheduleData) => {
    console.log('🔍 organizeLecturesByDate: Starting organization...');
    console.log('📅 Schedules data:', scheduleData);
    console.log('📚 Lectures data:', lecturesData);
    
    const organized = {};
    
    // Create date groups from schedule
    scheduleData.forEach(schedule => {
      const scheduleDate = schedule.date || schedule.classDate;
      console.log(`📅 Schedule ${schedule.id}: date=${scheduleDate}, dayOfWeek=${schedule.day}, dayName=${schedule.dayName}`);
      
      if (scheduleDate) {
        const dateKey = new Date(scheduleDate).toISOString().split('T')[0];
        console.log(`📅 Creating date group for: ${dateKey}`);
        
        if (!organized[dateKey]) {
          organized[dateKey] = {
            date: scheduleDate,
            schedule: schedule,
            lectures: []
          };
        }
      } else {
        console.warn(`⚠️ Schedule ${schedule.id} has no date:`, schedule);
      }
    });

    console.log('📅 Created date groups:', Object.keys(organized));

    // Organize lectures into date groups
    lecturesData.forEach(lecture => {
      let assigned = false;
      
      // Try to match lecture to schedule by date
      if (lecture.startTime || lecture.lectureDate) {
        const lectureDate = new Date(lecture.startTime || lecture.lectureDate);
        const lectureDateKey = lectureDate.toISOString().split('T')[0];
        
        if (organized[lectureDateKey]) {
          organized[lectureDateKey].lectures.push(lecture);
          assigned = true;
          console.log(`✅ Lecture ${lecture.id} assigned to date: ${lectureDateKey}`);
        }
      }
      
      // NEW LOGIC: Try to match lecture with schedule by content similarity
      if (!assigned && lecture.content) {
        // Extract chapter information from lecture content
        const content = lecture.content.toLowerCase();
        let matchedDate = null;
        
        // Look for chapter patterns in content
        if (content.includes('chương 1') || content.includes('hàm số') || content.includes('đồ thị')) {
          // Chapter 1: Functions and Graphs - assign to first available date
          const availableDates = Object.keys(organized).filter(key => key !== 'unscheduled');
          if (availableDates.length > 0) {
            matchedDate = availableDates[0]; // Monday
          }
        } else if (content.includes('chương 2') || content.includes('phương trình') || content.includes('bất phương trình')) {
          // Chapter 2: Equations and Inequalities - assign to second available date
          const availableDates = Object.keys(organized).filter(key => key !== 'unscheduled');
          if (availableDates.length > 1) {
            matchedDate = availableDates[1]; // Tuesday
          }
        } else if (content.includes('chương 3') || content.includes('thực hành') || content.includes('ứng dụng')) {
          // Chapter 3: Practice and Application - assign to third available date
          const availableDates = Object.keys(organized).filter(key => key !== 'unscheduled');
          if (availableDates.length > 2) {
            matchedDate = availableDates[2]; // Wednesday
          }
        }
        
        if (matchedDate && organized[matchedDate]) {
          organized[matchedDate].lectures.push(lecture);
          assigned = true;
          console.log(`✅ Lecture ${lecture.id} assigned to date ${matchedDate} by content matching`);
        }
      }
      
      // If no matching date found, add to "Chưa lên lịch" group
      if (!assigned) {
        const unscheduledKey = 'unscheduled';
        if (!organized[unscheduledKey]) {
          organized[unscheduledKey] = {
            date: null,
            schedule: null,
            lectures: []
          };
        }
        organized[unscheduledKey].lectures.push(lecture);
        console.log(`⚠️ Lecture ${lecture.id} assigned to unscheduled group`);
      }
    });

    // Sort dates
    const sortedEntries = Object.entries(organized).sort(([dateA], [dateB]) => {
      if (dateA === 'unscheduled') return 1;
      if (dateB === 'unscheduled') return -1;
      return new Date(dateA) - new Date(dateB);
    });

    const result = Object.fromEntries(sortedEntries);
    console.log('📋 Final organized result:', result);
    
    return result;
  }, []);

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

      // Load schedules and organize lectures by date
      const scheduleData = await loadSchedules();
      const organizedLectures = organizeLecturesByDate(lecturesWithMaterials, scheduleData);
      console.log(`📋 LectureList: Organized lectures by date:`, organizedLectures);
      setLecturesByDate(organizedLectures);
    } catch (error) {
      console.error('❌ LectureList: Error loading lectures:', error);
      console.error('   Status:', error.response?.status);
      console.error('   Data:', error.response?.data);
      setError('Không thể tải danh sách bài giảng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [courseId, lastLoadedCourseId, message, loadSchedules, organizeLecturesByDate]);

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
        <span className="text-sm text-gray-500">
          {lectures.length} bài giảng ({Object.keys(lecturesByDate).length} ngày học)
        </span>
      </div>

      {lectures.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Chưa có bài giảng nào cho khóa học này.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(lecturesByDate).map(([dateKey, dateGroup]) => (
            <div key={dateKey} className="border-l-4 border-blue-500 pl-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-700">
                  {dateKey === 'unscheduled' 
                    ? '📚 Chưa lên lịch' 
                    : `${new Date(dateGroup.date).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}`
                  }
                </h3>
                {dateGroup.schedule && (
                  <div className="text-sm text-gray-600 space-y-1">
                    {dateGroup.schedule.startTimeString && dateGroup.schedule.endTimeString && (
                      <div className="flex items-center">
                        <span className="mr-2">⏰</span>
                        <span className="font-medium">
                          {dateGroup.schedule.startTimeString} - {dateGroup.schedule.endTimeString}
                        </span>
                      </div>
                    )}
                    {dateGroup.schedule.room && (
                      <div className="flex items-center">
                        <span className="mr-2">📍</span>
                        <span>Phòng: <span className="font-medium">{dateGroup.schedule.room}</span></span>
                      </div>
                    )}
                    {dateGroup.schedule.dayName && (
                      <div className="flex items-center">
                        <span className="mr-2">📅</span>
                        <span className="font-medium">{dateGroup.schedule.dayName}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {dateKey === 'unscheduled' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    💡 <strong>Hướng dẫn:</strong> Những bài giảng này chưa được gán vào lịch học cụ thể. 
                    Bạn có thể kéo thả để sắp xếp hoặc liên hệ giáo viên để cập nhật lịch học.
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {dateGroup.lectures.map((lecture) => (
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
                  <span>⏰ Bắt đầu: {lecture.startTime}</span>
                )}
                {lecture.endTime && (
                  <span>⏱️ Kết thúc: {lecture.endTime}</span>
                )}
                {lecture.isRecordingEnabled && (
                  <span className="text-red-500">🔴 Ghi hình</span>
                )}
              </div>

              {/* Actions - Only show for teacher view */}
              {!isStudentView && (
                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() => handleStartLecture(lecture)}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Bắt đầu
                  </button>
                </div>
              )}
            </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LectureList;
