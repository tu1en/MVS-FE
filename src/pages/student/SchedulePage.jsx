import React, { useState, useEffect } from "react";
import ScheduleTable from "../../components/ScheduleTable";
import { getStudentSchedule } from "../../services/scheduleService";
import "./SchedulePage.css";

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
    room: item.room
  }));
};

const SchedulePage = () => {
  // Lấy ngày hiện tại và điều chỉnh về thứ 2 của tuần hiện tại
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Điều chỉnh khi là Chủ nhật
    return new Date(date.setDate(diff));
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [scheduleItems, setScheduleItems] = useState([]);
  
  // Giả lập ID của học sinh đang đăng nhập
  const studentId = 101; // Trong thực tế, lấy từ context hoặc redux store

  useEffect(() => {
    // Lấy dữ liệu lịch học cho học sinh theo tuần hiện tại
    const rawData = getStudentSchedule(studentId, currentWeekStart);
    const formattedData = transformScheduleData(rawData);
    setScheduleItems(formattedData);
  }, [currentWeekStart, studentId]);

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
    </div>
  );
};

export default SchedulePage;
