import React, { useState, useEffect } from 'react';
import { Calendar, Badge, message } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('/api/student/schedules');
      setSchedules(response.data);
    } catch (error) {
      message.error('Không thể tải thời khóa biểu');
      console.error('Error fetching schedules:', error);
    }
  };

  const dateCellRender = (value) => {
    const date = value.format('YYYY-MM-DD');
    const daySchedules = schedules.filter(
      schedule => dayjs(schedule.date).format('YYYY-MM-DD') === date
    );

    return (
      <ul className="events" style={{ listStyle: 'none', padding: 0 }}>
        {daySchedules.map(schedule => (
          <li key={schedule.id}>
            <Badge 
              status="processing" 
              text={`${schedule.className} (${schedule.startTime}-${schedule.endTime})`}
              style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2>Thời Khóa Biểu</h2>
      <Calendar 
        dateCellRender={dateCellRender}
        mode="month"
        style={{ 
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      />
    </div>
  );
};

export default Schedule;
