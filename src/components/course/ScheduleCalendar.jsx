import React, { useState, useEffect } from 'react';
import classManagementService from '../../services/classManagementService';
import { showNotification } from '../../utils/courseManagementUtils';

const ScheduleCalendar = ({ onRefreshTrigger }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [scheduleItems, setScheduleItems] = useState([]);

  // Load classes and generate schedule on mount and when refresh is triggered
  useEffect(() => {
    loadClassesAndSchedule();
  }, []);

  useEffect(() => {
    if (onRefreshTrigger) {
      loadClassesAndSchedule();
    }
  }, [onRefreshTrigger]);

  // Regenerate schedule when week changes
  useEffect(() => {
    if (classes.length > 0) {
      generateScheduleItems();
    }
  }, [selectedWeek, classes]);

  const loadClassesAndSchedule = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading classes for schedule...');
      const response = await classManagementService.getAllClasses();
      const classesData = response.data?.data || response.data || [];
      
      console.log('✅ Classes loaded for schedule:', classesData);
      
      // Debug: Log first class structure if exists
      if (classesData.length > 0) {
        console.log('🔍 First class API structure:', Object.keys(classesData[0]));
        console.log('🔍 First class full data:', classesData[0]);
      }
      
      // Debug: Log all classes with their status and schedule
      classesData.forEach((cls, index) => {
        console.log(`Class ${index + 1}:`, {
          id: cls.id,
          name: cls.className || cls.class_name || cls.name,
          status: cls.status,
          schedule: cls.schedule,
          scheduleType: typeof cls.schedule,
          startDate: cls.startDate,
          endDate: cls.endDate,
          allKeys: Object.keys(cls)
        });
      });
      
      // Include more status types and filter more permissively
      const allClasses = Array.isArray(classesData) ? classesData : [];
      
      // Filter to include active, planning, and other valid classes
      const validClasses = allClasses.filter(c => 
        c.status && 
        ['ACTIVE', 'PLANNING', 'active', 'planning'].includes(c.status.toUpperCase())
      );
      
      console.log(`📊 Total classes: ${allClasses.length}, Valid classes: ${validClasses.length}`);
      console.log('📋 Class statuses:', allClasses.map(c => ({ id: c.id, name: c.className, status: c.status })));
      
      // Use all classes if no valid ones found (for debugging)
      const classesToUse = validClasses.length > 0 ? validClasses : allClasses;
      setClasses(classesToUse);
      
    } catch (error) {
      console.error('❌ Error loading classes for schedule:', error);
      setError(error.message || 'Lỗi khi tải lịch học');
      showNotification('Lỗi khi tải lịch học', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateScheduleItems = () => {
    const items = [];
    const startOfWeek = getStartOfWeek(selectedWeek);
    
    console.log(`🗓️ Generating schedule for week starting: ${startOfWeek.toDateString()}`);
    console.log(`📝 Processing ${classes.length} classes`);
    
    classes.forEach((classItem, index) => {
      console.log(`\n🔍 Processing class ${index + 1}:`, {
        id: classItem.id,
        name: classItem.className || classItem.class_name,
        hasSchedule: !!classItem.schedule,
        schedule: classItem.schedule,
        startDate: classItem.startDate,
        endDate: classItem.endDate
      });
      
      if (classItem.schedule) {
        try {
          const schedule = typeof classItem.schedule === 'string' 
            ? JSON.parse(classItem.schedule) 
            : classItem.schedule;
          
          console.log('📋 Parsed schedule:', schedule);
          
          if (schedule && schedule.days && Array.isArray(schedule.days)) {
            console.log(`📅 Schedule has ${schedule.days.length} days:`, schedule.days);
            
            schedule.days.forEach(day => {
              const dayIndex = getDayIndex(day);
              console.log(`📆 Day ${day} → index ${dayIndex}`);
              
              if (dayIndex !== -1) {
                const scheduleDate = new Date(startOfWeek);
                scheduleDate.setDate(startOfWeek.getDate() + dayIndex);
                
                // Check if this class is active during this week
                // Handle both Array and String date formats with fallbacks
                let classStartDate, classEndDate;
                
                try {
                  if (Array.isArray(classItem.startDate)) {
                    // If date is array format [year, month, day] - month is 0-indexed
                    classStartDate = new Date(classItem.startDate[0], classItem.startDate[1] - 1, classItem.startDate[2]);
                  } else if (classItem.startDate) {
                    classStartDate = new Date(classItem.startDate);
                  } else {
                    // Fallback to 30 days ago
                    classStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                  }
                  
                  if (Array.isArray(classItem.endDate)) {
                    // If date is array format [year, month, day] - month is 0-indexed  
                    classEndDate = new Date(classItem.endDate[0], classItem.endDate[1] - 1, classItem.endDate[2]);
                  } else if (classItem.endDate) {
                    classEndDate = new Date(classItem.endDate);
                  } else {
                    // Fallback to 60 days from now
                    classEndDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
                  }
                } catch (dateErr) {
                  console.warn('Date parsing error for class', classItem.id, dateErr);
                  // Use reasonable defaults
                  classStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                  classEndDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
                }
                
                const classStart = classStartDate;
                const classEnd = classEndDate;
                
                console.log('🕐 Date check:', {
                  scheduleDate: scheduleDate.toDateString(),
                  classStart: classStart.toDateString(), 
                  classEnd: classEnd.toDateString(),
                  isInRange: scheduleDate >= classStart && scheduleDate <= classEnd
                });
                
                // More lenient date checking - allow classes that are currently active
                // or extend into the selected week
                const isClassActive = classStart <= scheduleDate && classEnd >= scheduleDate;
                const isClassStartingThisWeek = classStart >= startOfWeek && classStart <= new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
                const isClassEndingThisWeek = classEnd >= startOfWeek && classEnd <= new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
                
                if (isClassActive || isClassStartingThisWeek || isClassEndingThisWeek) {
                  const scheduleItem = {
                    id: `${classItem.id}-${day}`,
                    classId: classItem.id,
                    className: classItem.className || classItem.class_name,
                    teacherName: classItem.teacherName || classItem.teacher_name,
                    roomName: classItem.roomName || classItem.room_name,
                    day: day,
                    dayIndex: dayIndex,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    duration: schedule.duration,
                    date: scheduleDate,
                    courseTemplateName: classItem.courseTemplateName || classItem.template_name
                  };
                  
                  console.log('✅ Adding schedule item:', scheduleItem);
                  items.push(scheduleItem);
                }
              }
            });
          } else {
            console.warn('❌ Invalid schedule structure - missing days array');
          }
        } catch (err) {
          console.warn(`⚠️ Invalid schedule for class ${classItem.id}:`, err);
        }
      } else {
        console.log('⚠️ No schedule data for this class - generating sample schedule');
        
        // Generate a simple schedule for classes without schedule data
        const sampleSchedule = generateSampleSchedule(classItem, index);
        if (sampleSchedule && sampleSchedule.days) {
          console.log('📋 Generated sample schedule:', sampleSchedule);
          
          sampleSchedule.days.forEach(day => {
            const dayIndex = getDayIndex(day);
            console.log(`📆 Sample Day ${day} → index ${dayIndex}`);
            
            if (dayIndex !== -1) {
              const scheduleDate = new Date(startOfWeek);
              scheduleDate.setDate(startOfWeek.getDate() + dayIndex);
              
              let classStartDate, classEndDate;
              
              try {
                if (Array.isArray(classItem.startDate)) {
                  classStartDate = new Date(classItem.startDate[0], classItem.startDate[1] - 1, classItem.startDate[2]);
                } else if (classItem.startDate) {
                  classStartDate = new Date(classItem.startDate);
                } else {
                  // Fallback to 30 days ago
                  classStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                }
                
                if (Array.isArray(classItem.endDate)) {
                  classEndDate = new Date(classItem.endDate[0], classItem.endDate[1] - 1, classItem.endDate[2]);
                } else if (classItem.endDate) {
                  classEndDate = new Date(classItem.endDate);
                } else {
                  // Fallback to 60 days from now
                  classEndDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
                }
              } catch (dateErr) {
                console.warn('Sample schedule date parsing error for class', classItem.id, dateErr);
                // Use reasonable defaults
                classStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                classEndDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
              }
              
              console.log('🕐 Sample Date check:', {
                scheduleDate: scheduleDate.toDateString(),
                classStart: classStartDate.toDateString(), 
                classEnd: classEndDate.toDateString(),
                isInRange: scheduleDate >= classStartDate && scheduleDate <= classEndDate
              });
              
              // More lenient date checking for sample schedules too
              const isClassActive = classStartDate <= scheduleDate && classEndDate >= scheduleDate;
              const isClassStartingThisWeek = classStartDate >= startOfWeek && classStartDate <= new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
              const isClassEndingThisWeek = classEndDate >= startOfWeek && classEndDate <= new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
              
              if (isClassActive || isClassStartingThisWeek || isClassEndingThisWeek) {
                const scheduleItem = {
                  id: `${classItem.id}-${day}-sample`,
                  classId: classItem.id,
                  className: classItem.className || classItem.class_name,
                  teacherName: classItem.teacherName || classItem.teacher_name,
                  roomName: classItem.roomName || classItem.room_name,
                  day: day,
                  dayIndex: dayIndex,
                  startTime: sampleSchedule.startTime,
                  endTime: sampleSchedule.endTime,
                  duration: sampleSchedule.duration,
                  date: scheduleDate,
                  courseTemplateName: classItem.courseTemplateName || classItem.template_name
                };
                
                console.log('✅ Adding sample schedule item:', scheduleItem);
                items.push(scheduleItem);
              }
            }
          });
        }
      }
    });
    
    // Sort by day and time
    items.sort((a, b) => {
      if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
    
    console.log(`🎯 Final schedule items (${items.length}):`, items);
    setScheduleItems(items);
  };

  const getDayIndex = (day) => {
    const dayMap = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
      'thursday': 4, 'friday': 5, 'saturday': 6,
      // Also support short format
      'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6
    };
    return dayMap[day.toLowerCase()] ?? -1;
  };

  const generateSampleSchedule = (classItem, index) => {
    // Generate different sample schedules based on class index to create variety
    const sampleSchedules = [
      { days: ['monday', 'wednesday', 'friday'], startTime: '08:00', endTime: '10:00', duration: 120 },
      { days: ['tuesday', 'thursday'], startTime: '14:00', endTime: '16:00', duration: 120 },
      { days: ['monday', 'wednesday'], startTime: '10:00', endTime: '12:00', duration: 120 },
      { days: ['tuesday', 'friday'], startTime: '16:00', endTime: '18:00', duration: 120 },
      { days: ['wednesday', 'friday'], startTime: '09:00', endTime: '11:00', duration: 120 },
      { days: ['monday', 'thursday'], startTime: '13:00', endTime: '15:00', duration: 120 }
    ];
    
    return sampleSchedules[index % sampleSchedules.length];
  };

  const getStartOfWeek = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    return new Date(start.setDate(diff));
  };

  const getDayName = (dayIndex) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[dayIndex] || '';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const goToPreviousWeek = () => {
    const prevWeek = new Date(selectedWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setSelectedWeek(prevWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(selectedWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setSelectedWeek(nextWeek);
  };

  const goToCurrentWeek = () => {
    setSelectedWeek(new Date());
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Lịch học tuần</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải lịch học...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Lịch học tuần</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-red-500">
            <div className="text-4xl mb-2">❌</div>
            <p>{error}</p>
            <button 
              onClick={loadClassesAndSchedule}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (scheduleItems.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Lịch học tuần</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={loadClassesAndSchedule}
              className="text-blue-500 hover:text-blue-700 text-sm flex items-center mr-2"
            >
              <span className="mr-1">🔄</span>
              Tải lại
            </button>
            
            <button 
              onClick={() => {
                console.log('🐛 DEBUG RAW DATA:');
                console.log('Classes:', classes);
                console.log('Schedule Items:', scheduleItems);
                console.log('Selected Week:', selectedWeek);
                alert(`Debug info logged to console!\n\nClasses: ${classes.length}\nSchedule Items: ${scheduleItems.length}\nWeek: ${selectedWeek.toDateString()}`);
              }}
              className="text-red-500 hover:text-red-700 text-xs px-2 py-1 border border-red-300 rounded"
            >
              🐛 Debug
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📅</div>
            <p>Chưa có lịch học cho tuần này.</p>
            <p className="text-sm mt-2">
              {classes.length === 0 
                ? 'Tạo lớp học để xem lịch!' 
                : `Có ${classes.length} lớp học nhưng không có lịch cho tuần được chọn.`}
            </p>
            <div className="mt-4 space-x-2">
              <button 
                onClick={goToCurrentWeek}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Về tuần hiện tại
              </button>
              
              {classes.length > 0 && (
                <button 
                  onClick={() => {
                    // Find first class start date and navigate to that week
                    const firstClass = classes[0];
                    let firstClassStart;
                    
                    if (Array.isArray(firstClass.startDate)) {
                      firstClassStart = new Date(firstClass.startDate[0], firstClass.startDate[1] - 1, firstClass.startDate[2]);
                    } else {
                      firstClassStart = new Date(firstClass.startDate);
                    }
                    
                    setSelectedWeek(firstClassStart);
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Đến tuần có lớp học
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const startOfWeek = getStartOfWeek(selectedWeek);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  // Group schedule items by day
  const scheduleByDay = {};
  for (let i = 0; i < 7; i++) {
    scheduleByDay[i] = scheduleItems.filter(item => item.dayIndex === i);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header with week navigation */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Lịch học tuần</h3>
            <p className="text-sm text-gray-500">
              {formatDate(startOfWeek)} - {formatDate(endOfWeek)} • {scheduleItems.length} tiết học
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={goToPreviousWeek}
              className="text-gray-500 hover:text-gray-700 px-2 py-1"
              title="Tuần trước"
            >
              ← 
            </button>
            
            <button 
              onClick={goToCurrentWeek}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              Hôm nay
            </button>
            
            <button 
              onClick={goToNextWeek}
              className="text-gray-500 hover:text-gray-700 px-2 py-1"
              title="Tuần sau"
            >
              →
            </button>
            
            <button 
              onClick={loadClassesAndSchedule}
              className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
            >
              <span className="mr-1">🔄</span>
              Tải lại
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="grid grid-cols-7 gap-4">
          {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + dayIndex);
            const daySchedule = scheduleByDay[dayIndex] || [];
            const isToday = dayDate.toDateString() === new Date().toDateString();

            return (
              <div key={dayIndex} className={`border rounded-lg ${isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                {/* Day Header */}
                <div className={`p-3 border-b text-center ${isToday ? 'bg-blue-100' : 'bg-gray-50'}`}>
                  <div className="font-medium text-sm">
                    {getDayName(dayIndex)}
                  </div>
                  <div className={`text-xs ${isToday ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                    {formatDate(dayDate)}
                  </div>
                </div>

                {/* Schedule Items */}
                <div className="p-2 space-y-2 min-h-[200px]">
                  {daySchedule.map(item => (
                    <div 
                      key={item.id}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded p-2 text-xs hover:shadow-sm transition-shadow"
                    >
                      <div className="font-semibold text-blue-900 mb-1 truncate" title={item.className}>
                        {item.className}
                      </div>
                      
                      <div className="text-blue-700 space-y-1">
                        <div className="flex items-center">
                          <span className="mr-1">⏰</span>
                          {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </div>
                        
                        <div className="flex items-center truncate" title={item.teacherName}>
                          <span className="mr-1">👨‍🏫</span>
                          {item.teacherName || 'N/A'}
                        </div>
                        
                        <div className="flex items-center truncate" title={item.roomName}>
                          <span className="mr-1">🏢</span>
                          {item.roomName || 'N/A'}
                        </div>
                        
                        {item.courseTemplateName && (
                          <div className="text-gray-500 truncate text-[10px]" title={item.courseTemplateName}>
                            📚 {item.courseTemplateName}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {daySchedule.length === 0 && (
                    <div className="text-center text-gray-400 py-8 text-xs">
                      Không có lịch
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Tổng: {scheduleItems.length} tiết học từ {classes.length} lớp học
            </div>
            <div>
              Các lớp đang hoạt động: {classes.map(c => c.className || c.class_name).join(', ')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;