import { CalendarOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import TimetableView from '../TimetableView';

const { Title } = Typography;

/**
 * Student Timetable component - wrapper for TimetableView specifically for students
 * According to UC: "Xem Lịch Học" in the UserRoleScreenAnalysis guide
 */
const StudentTimetable = () => {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
          <CalendarOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
          Lịch Trình Học Tập
        </Title>
        <p style={{ color: '#666', marginTop: '8px' }}>
          Xem lịch học, hạn nộp bài tập và các sự kiện quan trọng trong khóa học của bạn
        </p>
      </div>
      
      <TimetableView />
    </div>
  );
};

export default StudentTimetable;
