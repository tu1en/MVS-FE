import React, { useState, useEffect } from "react";
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
    studentCount: item.studentIds.length // Thêm thông tin số lượng học sinh
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
  
  // Giả lập ID của giáo viên đang đăng nhập
  const teacherId = 1; // Trong thực tế, lấy từ context hoặc redux store

  useEffect(() => {
    // Lấy dữ liệu lịch dạy cho giáo viên theo tuần hiện tại
    const rawData = getTeacherSchedule(teacherId, currentWeekStart);
    const formattedData = transformScheduleData(rawData);
    setScheduleItems(formattedData);
  }, [currentWeekStart, teacherId]);

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
