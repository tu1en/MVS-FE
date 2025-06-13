import { message } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import ScheduleTable from "../../components/ScheduleTable";
import { getTeacherSchedule } from "../../services/scheduleService";
import "../student/SchedulePage.css";

// Chuyển đổi dữ liệu từ API sang định dạng hiển thị
const transformScheduleData = (apiData) => {
  return apiData.map(item => ({
    day: item.day,
    className: item.className,
    subject: item.subject,
    start: item.start,
    end: item.end,
    teacher: item.teacherName,
    materialsUrl: item.materialsUrl,
    meetUrl: item.meetUrl,
    room: item.room,
    studentCount: item.studentCount || (item.studentIds ? item.studentIds.length : 0)
  }));
};

const TeacherSchedulePage = () => {
  // Lấy ngày hiện tại và điều chỉnh về thứ 2 của tuần hiện tại
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Điều chỉnh khi là Chủ nhật
    return new Date(date.setDate(diff));
  };
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Lấy thông tin teacher từ localStorage
  const teacherId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTeacherSchedule();
  }, [currentWeekStart, teacherId]);

  const fetchTeacherSchedule = async () => {
    if (!token) {
      message.error('Vui lòng đăng nhập lại');
      return;
    }

    setLoading(true);
    try {
      // Thử gọi API thật trước
      const response = await axios.get('/api/teacher/schedule', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Teacher schedule API response:', response.data);
      const formattedData = transformScheduleData(response.data);
      setScheduleItems(formattedData);
      
    } catch (error) {
      console.warn('API không khả dụng, sử dụng mock data:', error.message);
      
      // Fallback to mock data nếu API lỗi
      try {
        const rawData = getTeacherSchedule(parseInt(teacherId) || 1, currentWeekStart);
        const formattedData = transformScheduleData(rawData);
        setScheduleItems(formattedData);
      } catch (mockError) {
        console.error('Lỗi lấy mock data:', mockError);
        message.error('Không thể tải lịch dạy');
      }
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeekStart(prevWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeekStart(nextWeek);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  return (
    <div className="schedule-page">
      <h1 className="teacher-schedule-title">Lịch Dạy Của Giáo Viên</h1>
      
      <div className="schedule-navigation">
        <button onClick={goToPreviousWeek} className="nav-button">
          &lt; Tuần trước
        </button>
        <button onClick={goToCurrentWeek} className="nav-button current-week">
          Tuần hiện tại
        </button>
        <button onClick={goToNextWeek} className="nav-button">
          Tuần sau &gt;
        </button>
      </div>
      
      <ScheduleTable scheduleData={scheduleItems} startDate={currentWeekStart} />
      
      <div className="schedule-actions">
        <button className="action-button print-button" onClick={() => window.print()}>
          In Lịch Dạy
        </button>
        <button className="action-button export-button" onClick={() => alert('Tính năng xuất file sẽ được phát triển sau')}>
          Xuất File Excel
        </button>
      </div>
    </div>
  );
};

export default TeacherSchedulePage;
