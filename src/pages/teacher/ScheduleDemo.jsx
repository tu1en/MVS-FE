import React, { useState } from 'react';
import { Button, Card, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined, CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './WeeklySchedule.css';

// Demo component with mock data for testing
const ScheduleDemo = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = dayjs();
    const dayOfWeek = today.day();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return today.subtract(daysToSubtract, 'day');
  });

  // Mock schedule data
  const mockSchedules = [
    {
      id: 1,
      title: 'Toán học 12A1',
      classroomName: 'Lớp 12A1',
      classroomId: 1,
      lectureId: 1,
      startDatetime: currentWeekStart.add(0, 'day').hour(8).minute(0).format(),
      endDatetime: currentWeekStart.add(0, 'day').hour(9).minute(30).format(),
      location: 'Phòng A101',
      color: '#1890ff'
    },
    {
      id: 2,
      title: 'Vật lý 11B2',
      classroomName: 'Lớp 11B2',
      classroomId: 2,
      lectureId: 2,
      startDatetime: currentWeekStart.add(1, 'day').hour(10).minute(0).format(),
      endDatetime: currentWeekStart.add(1, 'day').hour(11).minute(30).format(),
      location: 'Phòng B201',
      color: '#52c41a'
    },
    {
      id: 3,
      title: 'Hóa học 10C3',
      classroomName: 'Lớp 10C3',
      classroomId: 3,
      lectureId: 3,
      startDatetime: currentWeekStart.add(2, 'day').hour(14).minute(0).format(),
      endDatetime: currentWeekStart.add(2, 'day').hour(15).minute(30).format(),
      location: 'Phòng C301',
      color: '#f5222d'
    },
    {
      id: 4,
      title: 'Toán học 12A1',
      classroomName: 'Lớp 12A1',
      classroomId: 1,
      lectureId: 4,
      startDatetime: currentWeekStart.add(3, 'day').hour(8).minute(0).format(),
      endDatetime: currentWeekStart.add(3, 'day').hour(9).minute(30).format(),
      location: 'Phòng A101',
      color: '#1890ff'
    },
    {
      id: 5,
      title: 'Vật lý 11B2',
      classroomName: 'Lớp 11B2',
      classroomId: 2,
      lectureId: 5,
      startDatetime: currentWeekStart.add(4, 'day').hour(13).minute(0).format(),
      endDatetime: currentWeekStart.add(4, 'day').hour(14).minute(30).format(),
      location: 'Phòng B201',
      color: '#52c41a'
    }
  ];

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
    
    return mockSchedules.filter(schedule => {
      const scheduleDate = dayjs(schedule.startDatetime).format('YYYY-MM-DD');
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

  // Navigation functions
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

  const handleScheduleClick = (schedule) => {
    alert(`Clicked on: ${schedule.classroomName}\nTime: ${dayjs(schedule.startDatetime).format('HH:mm')}-${dayjs(schedule.endDatetime).format('HH:mm')}\nLocation: ${schedule.location}`);
  };

  const weekDays = generateWeekDays();
  const timeSlots = generateTimeSlots();

  return (
    <div className="weekly-schedule-container">
      {/* Header */}
      <div className="weekly-schedule-header">
        <h2 className="weekly-schedule-title">
          Lịch Dạy Tuần (Demo)
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
      </Card>
    </div>
  );
};

export default ScheduleDemo;
