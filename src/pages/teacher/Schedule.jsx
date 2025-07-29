import { Badge, Calendar, Card, Typography } from 'antd';
import { App as AntApp } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const { message } = AntApp.useApp();

  // Fetch schedules với AbortController để tránh duplicate
  const fetchSchedules = useCallback(async (month) => {
    if (!user?.id) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const startDate = month.startOf('month').format('YYYY-MM-DD');
    const endDate = month.endOf('month').format('YYYY-MM-DD');

    const controller = new AbortController();
    
    try {
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHER_SCHEDULE, {
        params: { startDate, endDate },
        signal: controller.signal
      });
      
      const data = Array.isArray(response.data) ? response.data : [];
      setSchedules(data.map(item => ({
        id: item.id,
        title: item.title || 'Lịch học',
        description: item.description || '',
        start_datetime: item.start_datetime,
        end_datetime: item.end_datetime,
        color: item.color || '#1890ff',
        classroom_id: item.classroom_id,
        classroom_name: item.classroom_name || item.title,
        lecture_id: item.lecture_id || null
      })));
      
      setLoading(false);
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error fetching schedules:', error);
        setSchedules([]);
        setLoading(false);
        message.error('Không thể tải lịch dạy');
      }
    }
  }, [user?.id, message]);

  useEffect(() => {
    fetchSchedules(currentMonth);
  }, [currentMonth, fetchSchedules]);

  const handleRefresh = useCallback(() => {
    fetchSchedules(currentMonth);
  }, [currentMonth, fetchSchedules]);

  const handleScheduleClick = useCallback((schedule) => {
    if (schedule && schedule.classroom_id) {
      if (schedule.lecture_id) {
        navigate(`/teacher/attendance/take/${schedule.classroom_id}/${schedule.lecture_id}`);
      } else {
        navigate(`/teacher/attendance/take/${schedule.classroom_id}/${schedule.id}`); // Use schedule.id as fallback for lectureId
      }
    } else {
      message.warning('Không thể mở lịch học này');
    }
  }, [navigate, message]);

  // Group events by date for performance
  const eventsByDate = useMemo(() => {
    return schedules.reduce((acc, schedule) => {
      const date = dayjs(schedule.start_datetime).format('YYYY-MM-DD');
      if (!acc[date]) acc[date] = [];
      acc[date].push(schedule);
      return acc;
    }, {});
  }, [schedules]);

  const cellRender = useCallback((current, info) => {
    if (info.type !== 'date') return info.originNode;
    
    const dateKey = current.format('YYYY-MM-DD');
    const daySchedules = eventsByDate[dateKey] || [];

    if (daySchedules.length === 0) return null;

    return (
      <div style={{ padding: 2 }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {daySchedules.slice(0, 3).map((event) => (
            <li
              key={`${event.id}-${event.start_datetime}`}
              onClick={() => handleScheduleClick(event)}
              style={{ 
                cursor: 'pointer',
                marginBottom: 2,
                lineHeight: 1.1
              }}
            >
              <Badge 
                color={event.color || '#1890ff'} 
                text={
                  <span style={{ fontSize: 10 }}>
                    {event.title || 'Lịch học'}
                    {event.start_datetime && 
                      ` (${dayjs(event.start_datetime).format('HH:mm')})`
                    }
                  </span>
                }
                style={{ width: '100%' }}
              />
            </li>
          ))}
          {daySchedules.length > 3 && (
            <li style={{ fontSize: 9, color: '#999' }}>
              +{daySchedules.length - 3} khác
            </li>
          )}
        </ul>
      </div>
    );
  }, [eventsByDate, handleScheduleClick]);

  const handlePanelChange = useCallback((date, mode) => {
    if (mode === 'month') {
      setCurrentMonth(date);
    }
  }, []);

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
            <button 
              onClick={handleRefresh}
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
            headerRender={({ value }) => (
              <div style={{ padding: 8 }}>
                <Typography.Title level={4}>{value.format('MMMM YYYY')}</Typography.Title>
              </div>
            )}
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