import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Card, message, Spin, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_CONFIG from '../../config/api-config';
import axiosInstance from '../../config/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import './WeeklySchedule.css';

const TeacherSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // Lấy thứ 2 của tuần hiện tại
    const today = dayjs();
    const dayOfWeek = today.day(); // 0 = Sunday, 1 = Monday, ...
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Điều chỉnh để thứ 2 là ngày đầu tuần
    return today.subtract(daysToSubtract, 'day');
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchSchedules();
  }, [currentWeekStart]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      console.log('Fetching schedules for teacher...');

      // Calculate first and last day of the selected week for the query
      const startDate = currentWeekStart.format('YYYY-MM-DD');
      const endDate = currentWeekStart.add(6, 'day').format('YYYY-MM-DD');
      
      console.log(`Fetching schedules from ${startDate} to ${endDate}`);
      console.log('Current user ID:', user?.id);
      
      // Use the endpoint from API_CONFIG with proper date parameters
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHER_SCHEDULE, {
        params: {
          startDate: startDate,
          endDate: endDate
        }
      });
      
      console.log('Schedules response:', response);
      console.log('Schedules data:', response.data);
      
      if (Array.isArray(response.data)) {
        if (response.data.length > 0) {
          console.log('First raw event from API:', JSON.stringify(response.data[0], null, 2));
        }
        // Map the response data to a consistent format
        const formattedSchedules = response.data.map(event => ({
          id: event.id,
          title: event.title || event.subject || 'Lịch học',
          description: event.description || '',
          classroomId: event.classroomId,
          classroomName: event.classroomName || 'Lớp học',
          lectureId: event.lectureId, // Add lectureId from API response
          startDatetime: event.startDatetime,
          endDatetime: event.endDatetime,
          location: event.location || event.room || 'Phòng học',
          color: event.color || '#1890ff'
        }));

        console.log('Formatted schedules:', formattedSchedules);

        // Debug specific dates
        formattedSchedules.forEach(schedule => {
          const scheduleDate = dayjs(schedule.startDatetime).format('YYYY-MM-DD');
          if (scheduleDate === '2025-08-18' || scheduleDate === '2025-08-19' || scheduleDate === '2025-08-20') {
            console.log(`🔍 Debug schedule - ID: ${schedule.id}, Date: ${scheduleDate}, StartDatetime: ${schedule.startDatetime}, Title: ${schedule.title}`);
          }
        });
        setSchedules(formattedSchedules);
      } else {
        console.error('Expected array but got:', typeof response.data);
        setSchedules([]);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      message.error('Không thể tải thời khóa biểu');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleClick = (schedule) => {
    console.log('🔍 Schedule clicked:', schedule);

    if (schedule && schedule.classroomId) {
      if (schedule.lectureId) {
        // Nếu có lectureId, sử dụng nó
        console.log('🔍 Navigating with lectureId:', schedule.lectureId);
        navigate(`/teacher/attendance/take/${schedule.classroomId}/${schedule.lectureId}`);
      } else {
        // Nếu không có lectureId, pass classroomId và scheduleDate để tìm lecture tương ứng
        const scheduleDate = dayjs(schedule.startDatetime).format('YYYY-MM-DD');
        console.log('🔍 No lectureId, navigating with classroomId and date:', schedule.classroomId, scheduleDate);
        navigate(`/teacher/attendance/take/${schedule.classroomId}`, {
          state: { scheduleDate: scheduleDate }
        });
      }
    } else {
      message.warning('Không thể mở lịch học này');
    }
  };

  // Navigation functions for week
  const goToPreviousWeek = () => {
    setCurrentWeekStart(currentWeekStart.subtract(7, 'day'));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(currentWeekStart.add(7, 'day'));
  };

  const goToCurrentWeek = () => {
    const today = dayjs();
    const dayOfWeek = today.day();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    setCurrentWeekStart(today.subtract(daysToSubtract, 'day'));
  };

  // Generate days of the week
  const generateWeekDays = () => {
    const days = [];
    const dayLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

    for (let i = 0; i < 7; i++) {
      const currentDate = currentWeekStart.add(i, 'day');
      days.push({
        label: dayLabels[i],
        date: currentDate.format('DD/MM'),
        fullDate: currentDate,
        dayIndex: i
      });
    }

    return days;
  };

  // Generate time slots (7:00 - 18:00)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  // Get schedules for a specific day
  const getSchedulesForDay = (dayIndex) => {
    const targetDate = currentWeekStart.add(dayIndex, 'day').format('YYYY-MM-DD');

    return schedules.filter(schedule => {
      const scheduleDate = schedule.startDatetime
        ? dayjs(schedule.startDatetime).format('YYYY-MM-DD')
        : null;
      return scheduleDate === targetDate;
    });
  };

  // Check if a schedule overlaps with a time slot
  const getScheduleForTimeSlot = (daySchedules, timeSlot) => {
    const [slotHour] = timeSlot.split(':').map(Number);

    return daySchedules.find(schedule => {
      const startTime = dayjs(schedule.startDatetime);
      const endTime = dayjs(schedule.endDatetime);
      const startHour = startTime.hour();
      const endHour = endTime.hour();

      return slotHour >= startHour && slotHour < endHour;
    });
  };

  const weekDays = generateWeekDays();
  const timeSlots = generateTimeSlots();

  return (
    <div className="weekly-schedule-container">
      {/* Header */}
      <div className="weekly-schedule-header">
        <h2 className="weekly-schedule-title">
          Lịch Dạy Tuần
        </h2>
        <p className="weekly-schedule-date-range">
          {currentWeekStart.format('DD/MM/YYYY')} - {currentWeekStart.add(6, 'day').format('DD/MM/YYYY')}
        </p>
      </div>

      {/* Navigation */}
      <Card className="weekly-schedule-navigation" style={{ borderRadius: '12px' }}>
        <div className="weekly-schedule-nav-buttons">
          <Button
            icon={<LeftOutlined />}
            onClick={goToPreviousWeek}
            size="large"
          >
            Tuần trước
          </Button>

          <Button
            icon={<CalendarOutlined />}
            onClick={goToCurrentWeek}
            type="primary"
            size="large"
          >
            Tuần hiện tại
          </Button>

          <Button
            icon={<RightOutlined />}
            onClick={goToNextWeek}
            size="large"
          >
            Tuần sau
          </Button>
        </div>
      </Card>

      {/* Weekly Schedule Grid */}
      <Card className="weekly-schedule-grid" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <Spin spinning={loading} tip="Đang tải lịch dạy...">
          {schedules.length === 0 && !loading ? (
            <div className="weekly-schedule-empty-state">
              <CalendarOutlined className="weekly-schedule-empty-icon" />
              <p className="weekly-schedule-empty-text">Không có lịch dạy trong tuần này</p>
              <Button onClick={fetchSchedules} type="primary">
                Tải lại
              </Button>
            </div>
          ) : (
            <div className="weekly-schedule-grid-container">
              {/* Header Row */}
              <div className="weekly-schedule-row">
                <div className="weekly-schedule-header-cell">
                  Giờ
                </div>
                {weekDays.map((day, index) => (
                  <div key={index} className="weekly-schedule-header-cell">
                    <div>{day.label}</div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>{day.date}</div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {timeSlots.map((timeSlot) => (
                <div key={timeSlot} className="weekly-schedule-row">
                  {/* Time Label */}
                  <div className="weekly-schedule-time-cell">
                    {timeSlot}
                  </div>

                  {/* Day Cells */}
                  {weekDays.map((_, dayIndex) => {
                    const daySchedules = getSchedulesForDay(dayIndex);
                    const scheduleForSlot = getScheduleForTimeSlot(daySchedules, timeSlot);

                    return (
                      <div key={`${timeSlot}-${dayIndex}`} className="weekly-schedule-day-cell">
                        {scheduleForSlot && (
                          <Tooltip title={`${scheduleForSlot.title || scheduleForSlot.classroomName} - ${scheduleForSlot.location}`}>
                            <div
                              onClick={() => handleScheduleClick(scheduleForSlot)}
                              className="weekly-schedule-event"
                              style={{
                                backgroundColor: scheduleForSlot.color || '#1890ff'
                              }}
                            >
                              <div className="weekly-schedule-event-title">
                                {scheduleForSlot.classroomName || scheduleForSlot.title}
                              </div>
                              <div className="weekly-schedule-event-time">
                                <ClockCircleOutlined style={{ marginRight: '4px' }} />
                                {dayjs(scheduleForSlot.startDatetime).format('HH:mm')}-
                                {dayjs(scheduleForSlot.endDatetime).format('HH:mm')}
                              </div>
                              <div className="weekly-schedule-event-location">
                                <EnvironmentOutlined style={{ marginRight: '4px' }} />
                                {scheduleForSlot.location}
                              </div>
                            </div>
                          </Tooltip>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default TeacherSchedule;
