import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { formatVietnameseText } from '../../utils/viTextUtils';
import YouTubeEmbed from '../ui/YouTubeEmbed';

const CourseDescription = ({ description, courseId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [showCurriculum, setShowCurriculum] = useState(true);
  const [showVideos, setShowVideos] = useState(false);
  
  // Load lessons/curriculum when component mounts or course changes
  useEffect(() => {
    if (courseId) {
      loadCourseLessons();
    }
  }, [courseId]);

  const normalizeLessons = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map((it) => ({
      id: it.id,
      title: formatVietnameseText(it.topicName || it.title || it.name),
      description: formatVietnameseText(it.objectives || it.description || ''),
      type: formatVietnameseText(it.lessonType || it.type || '').replace(/\bLy thuyt\b|\bLy thuyet\b/gi, 'Lý thuyết'),
      duration: it.durationMinutes ? `${it.durationMinutes} phút` : it.duration,
      materials: it.materials || it.lectureMaterials || [],
    }));
  };

  const loadCourseLessons = async () => {
    try {
      setLoadingLessons(true);
      const token = localStorage.getItem('token');
      
      // Try to get lessons from course template first
      let endpoint = `http://localhost:8088/api/course-templates/${courseId}/lessons`;
      
      try {
        const response = await axios.get(endpoint, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        
        // Ensure we always work with arrays
        const data = response.data;
        const lessonsArray = Array.isArray(data) ? data : 
                          (data && data.data && Array.isArray(data.data) ? data.data : []);
        setLessons(normalizeLessons(lessonsArray));
      } catch (templateError) {
        // If template lessons fail, try course lectures
        endpoint = `http://localhost:8088/api/courses/${courseId}/lectures`;
        const response = await axios.get(endpoint, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        
        const data = response.data;
        const lessonsArray = Array.isArray(data) ? data : 
                          (data && data.data && Array.isArray(data.data) ? data.data : []);
        setLessons(normalizeLessons(lessonsArray));
      }
    } catch (error) {
      console.error('Error loading course curriculum:', error);
      setLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  };
  
  if (!description && (!courseId || lessons.length === 0)) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <div className="text-gray-500 italic">⚠️ Chưa có mô tả khóa học</div>
      </div>
    );
  }
  
  // Parse description for curriculum info
  const lines = description ? description.split('\n').filter(line => line.trim()) : [];
  const previewLength = 3;
  const previewLines = lines.slice(0, previewLength);
  const displayLines = isExpanded ? lines : previewLines;
  
  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      .replace(/^• (.*?)$/gm, '<div class="mb-1">• $1</div>')
      .replace(/^✅ (.*?)$/gm, '<div class="mb-1 text-green-600">✅ $1</div>')
      .replace(/^🎯 (.*?)$/gm, '<div class="mb-1 text-blue-600">🎯 $1</div>')
      .replace(/^⭐ (.*?)$/gm, '<div class="mb-1 text-yellow-600">⭐ $1</div>');
  };
  
  const hasMore = lines.length > previewLength;
  const videoLinks = description ? (description.match(/https:\/\/www\.youtube\.com\/watch\?v=[\w-]+(?:&[\w=]+)*/g) || 
                                   description.match(/https:\/\/youtu\.be\/[a-zA-Z0-9_-]+/g) || []) : [];
  const demoLinks = description ? (description.match(/https:\/\/[a-zA-Z0-9.-]*demo[a-zA-Z0-9.-]*/g) || []) : [];
  
  const renderCurriculum = () => {
    if (loadingLessons) {
      return (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      );
    }

    // Ensure lessons is always an array
    let validLessons = Array.isArray(lessons) ? lessons : [];
    
    // Fallback: parse curriculum from description lines if API chưa có dữ liệu
    if (validLessons.length === 0 && description) {
      const curriculumLines = description
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => /^✅\s*Tuần\s*\d+/i.test(l) || /^Tuần\s*\d+/i.test(l));
      if (curriculumLines.length > 0) {
        validLessons = curriculumLines.map((text, idx) => ({
          id: `desc-${idx}`,
          title: formatVietnameseText(text.replace(/^✅\s*/,'').trim()),
          description: '',
          type: undefined,
          duration: undefined,
          materials: [],
        }));
      }
    }
    
    if (validLessons.length === 0) {
      return (
        <div className="text-gray-500 text-center py-4">
          <div className="text-lg mb-2">📚</div>
          <p>Chưa có chương trình học chi tiết</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800 mb-3">📚 Chương trình học ({validLessons.length} bài)</h4>
        <div className="max-h-64 overflow-y-auto pr-2">
          {validLessons.map((lesson, index) => (
            <div key={lesson.id || index} className="flex items-start space-x-3 p-2 hover:bg-blue-50 rounded transition-colors">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-gray-900 text-sm">{lesson.title || lesson.name || `Bài học ${index + 1}`}</h5>
                {lesson.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{lesson.description}</p>
                )}
                <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                  {lesson.duration && (
                    <span>⏱️ {lesson.duration}</span>
                  )}
                  {lesson.type && (
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">{lesson.type}</span>
                  )}
                  {lesson.materials && lesson.materials.length > 0 && (
                    <span>📎 {lesson.materials.length} tài liệu</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="course-description space-y-4">      
      {/* Main content */}
      {description && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
          <div className="text-sm text-gray-800 leading-relaxed space-y-2">
          {displayLines.map((line, index) => (
              <div 
                key={index}
                dangerouslySetInnerHTML={{ __html: formatText(formatVietnameseText(line)) }}
              />
            ))}
          </div>
          
          {hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {isExpanded ? (
                <>
                  <span className="mr-1">▲</span>
                  Thu gọn ({lines.length - previewLength} dòng ẩn)
                </>
              ) : (
                <>
                  <span className="mr-1">▼</span>
                  Xem thêm ({lines.length - previewLength} dòng)
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Video Section */}
      {videoLinks.length > 0 && (
        <div data-video-section className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowVideos(!showVideos)}
              className="flex items-center text-red-600 hover:text-red-800 font-medium"
            >
              <span className="mr-2">{showVideos ? '▼' : '▶'}</span>
              Video học thử ({videoLinks.length} video)
            </button>
            {showVideos && (
              <button
                onClick={() => setShowVideos(false)}
                className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Ẩn video
              </button>
            )}
          </div>
          {showVideos && (
            <div className="space-y-4">
              {videoLinks.map((videoUrl, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Video {index + 1}: Demo bài học
                    </span>
                  </div>
                  <YouTubeEmbed url={videoUrl} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Curriculum Section */}
      {courseId && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowCurriculum(!showCurriculum)}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <span className="mr-2">{showCurriculum ? '▼' : '▶'}</span>
              Khung chương trình học
            </button>
            {Array.isArray(lessons) && lessons.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                {lessons.length} bài học
              </span>
            )}
          </div>
          
          {showCurriculum && (
            <div className="border-t border-gray-100 pt-3">
              {renderCurriculum()}
            </div>
          )}
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {videoLinks.length > 0 && (
          <button 
            onClick={() => {
              setShowVideos(true);
              const videoSection = document.querySelector('[data-video-section]');
              if (videoSection) {
                videoSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
          >
            🎬 Xem {videoLinks.length} Video
          </button>
        )}
        
        {demoLinks.length > 0 && (
          <button className="inline-flex items-center px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors">
            🚀 {demoLinks.length} Demo
          </button>
        )}
        
        {description && description.includes('MODULE') && (
          <button
            onClick={() => {
              setIsExpanded(true);
              setShowCurriculum(true);
            }}
            className="inline-flex items-center px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors"
          >
            📚 Xem chương trình
          </button>
        )}

        {courseId && !showCurriculum && (
          <button
            onClick={() => setShowCurriculum(true)}
            className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
          >
            📋 Xem bài giảng
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseDescription;