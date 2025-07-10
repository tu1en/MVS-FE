import { Badge, Calendar, Card, message, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_CONFIG from '../../config/api-config';
import axiosInstance from '../../config/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const TeacherSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchSchedules(currentMonth);
  }, [currentMonth]);

  const fetchSchedules = async (month) => {
    try {
      setLoading(true);
      console.log('Fetching schedules for teacher...');
      
      // Calculate first and last day of the selected month for the query
      const startDate = month.startOf('month').format('YYYY-MM-DD');
      const endDate = month.endOf('month').format('YYYY-MM-DD');
      
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
          startDatetime: event.startDatetime,
          endDatetime: event.endDatetime,
          location: event.location || event.room || 'Phòng học',
          color: event.color || '#1890ff'
        }));
        
        console.log('Formatted schedules:', formattedSchedules);
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
    if (schedule && schedule.classroomId) {
      // Navigate to attendance page with only classroomId
      // TakeAttendancePage will auto-select the appropriate lecture
      navigate(`/teacher/attendance/take/${schedule.classroomId}`);
    } else {
      message.warning('Không thể mở lịch học này');
    }
  };

  const cellRender = (current, info) => {
    if (info.type !== 'date') return info.originNode;
    
    const date = current.format('YYYY-MM-DD');
    
    // Filter schedules for the current date, handling different date formats
    const daySchedules = schedules.filter(schedule => {
      // Handle both startDatetime and startTime properties
      const scheduleDate = schedule.startDatetime 
        ? dayjs(schedule.startDatetime).format('YYYY-MM-DD')
        : null;
          
      return scheduleDate === date;
    });

    if (daySchedules.length === 0) return null;

    return (
      <ul className="events" style={{ listStyle: 'none', padding: 0 }}>
        {daySchedules.map((schedule) => (
          <li
            key={schedule.id}
            onClick={() => handleScheduleClick(schedule)}
            style={{ cursor: 'pointer' }}
          >
            <Badge
              status="processing"
              color={schedule.color}
              text={
                <span style={{ fontSize: '12px' }}>
                  {`${schedule.classroomName || schedule.title}`}
                  <br />
                  {`${dayjs(schedule.startDatetime).format('HH:mm')}-${dayjs(
                    schedule.endDatetime
                  ).format('HH:mm')}`}
                  <br />
                  {`Phòng: ${schedule.location}`}
                </span>
              }
              style={{
                whiteSpace: 'normal',
                lineHeight: '1.2',
              }}
            />
          </li>
        ))}
      </ul>
    );
  };

  const handlePanelChange = (date, mode) => {
    console.log('Panel changed:', date.format('YYYY-MM'), mode);
    if (mode === 'month') {
      setCurrentMonth(date);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2 className="text-2xl font-bold mb-6">Lịch Dạy</h2>
      <Card className="shadow-md">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Đang tải lịch dạy...
          </div>
        ) : schedules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Không có lịch dạy trong tháng này</p>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
              (ID người dùng hiện tại: {user?.id || 'Không có'})
            </p>
            <button 
              onClick={() => fetchSchedules(currentMonth)} 
              style={{ 
                marginTop: '10px', 
                padding: '5px 10px', 
                backgroundColor: '#1890ff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Tải lại
            </button>
          </div>
        ) : (
        <Calendar
          cellRender={cellRender}
            mode="month"
            onPanelChange={handlePanelChange}
            value={currentMonth}
          headerRender={({ value, onChange }) => {
            return (
              <div style={{ padding: 8 }}>
                <Typography.Title level={4}>{value.format('MMMM YYYY')}</Typography.Title>
              </div>
            );
          }}
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
          }}
        />
        )}
      </Card>
    </div>
  );
};

export default TeacherSchedule;
