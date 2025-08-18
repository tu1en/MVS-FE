import { message, Spin } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import ScheduleTable from "../../components/ScheduleTable";
import "../student/SchedulePage.css";

// Chuyển đổi dữ liệu từ API sang định dạng hiển thị (nếu cần)
const transformScheduleData = (apiData) => {
  // API đã trả về đúng định dạng, không cần biến đổi
  return apiData;
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
      // Gọi API thực tế
      const response = await axios.get('/api/teacher/schedules', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Teacher schedule API response:', response.data);
      
      // Dữ liệu đã có định dạng chuẩn, không cần chuyển đổi nhiều
      setScheduleItems(response.data || []);
      
    } catch (error) {
      console.error('Error fetching teacher schedule:', error);
      message.error('Không thể tải lịch dạy. Vui lòng thử lại.');
      setScheduleItems([]);
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
      
      <Spin spinning={loading} tip="Đang tải lịch dạy...">
        <ScheduleTable scheduleData={scheduleItems} startDate={currentWeekStart} />
      </Spin>
      
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
