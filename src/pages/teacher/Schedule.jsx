import { Badge, Calendar, Card, message } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const TeacherSchedule = () => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('/api/teacher/schedules');
      setSchedules(response.data);
    } catch (error) {
      message.error('Không thể tải thời khóa biểu');
      console.error('Error fetching schedules:', error);
    }
  };
  const cellRender = (current, info) => {
    if (info.type !== 'date') return info.originNode;
    
    const date = current.format('YYYY-MM-DD');
    const daySchedules = schedules.filter(
      schedule => dayjs(schedule.date).format('YYYY-MM-DD') === date
    );

    return (
      <ul className="events" style={{ listStyle: 'none', padding: 0 }}>
        {daySchedules.map(schedule => (
          <li key={schedule.id}>
            <Badge 
              status="processing" 
              text={
                <span style={{ fontSize: '12px' }}>
                  {`${schedule.className} - ${schedule.subject}`}
                  <br />
                  {`${schedule.startTime}-${schedule.endTime}`}
                  <br />
                  {`Phòng: ${schedule.room}`}
                </span>
              }
              style={{ 
                whiteSpace: 'normal',
                lineHeight: '1.2'
              }}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2 className="text-2xl font-bold mb-6">Lịch Dạy</h2>
      <Card className="shadow-md">        <Calendar 
          cellRender={cellRender}
          mode="month"
          style={{ 
            backgroundColor: 'white',
            borderRadius: '8px'
          }}
        />
      </Card>
    </div>
  );
};

export default TeacherSchedule;
