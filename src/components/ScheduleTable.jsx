import React from "react";
import "./ScheduleTable.css";

// scheduleData: Array of { day: 0-6, className, subject, start, end, teacher, materialsUrl, meetUrl }
const ScheduleTable = ({ scheduleData, startDate }) => {
  // Calculate days of the week based on startDate
  const generateDaysOfWeek = (startDate) => {
    const days = [];
    const dayLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    
    const start = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      const day = currentDate.getDate().toString().padStart(2, '0');
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      
      days.push({
        label: dayLabels[i],
        date: `${day}/${month}`,
        fullDate: currentDate
      });
    }
    
    return days;
  };
  
  const daysOfWeek = generateDaysOfWeek(startDate);
  
  // Format week label
  const formatWeekLabel = (startDate) => {
    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setDate(start.getDate() + 6);
    
    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    return `Tuần ${formatDate(start)} đến ${formatDate(end)}`;
  };
  
  const weekLabel = formatWeekLabel(startDate);
  
  // Group by day
  const grouped = Array(7)
    .fill()
    .map(() => []);
  scheduleData.forEach((item) => {
    grouped[item.day].push(item);
  });

  return (
    <div className="schedule-table-wrapper">
      <h2 className="schedule-title">Lịch Học - {weekLabel}</h2>
      <div className="schedule-table">
        <div className="schedule-row schedule-header">
          <div className="schedule-cell schedule-header-cell">Ngày</div>
          {daysOfWeek.map((d, idx) => (
            <div key={idx} className="schedule-cell schedule-header-cell">
              <div>{d.label}</div>
              <div>{d.date}</div>
            </div>
          ))}
        </div>
        <div className="schedule-row">
          <div className="schedule-cell schedule-label">Lớp Học</div>
          {grouped.map((classes, idx) => (
            <div key={idx} className="schedule-cell">
              {classes.length === 0 ? (
                <div className="schedule-empty"></div>
              ) : (
                classes.map((c, i) => (
                  <div key={i} className="schedule-class-card">
                    <div>
                      <strong>{c.className} - {c.subject}</strong>
                    </div>
                    <div>{c.start} - {c.end}</div>
                    <div className="schedule-teacher">{c.teacher}</div>
                    {c.room && <div className="schedule-room">Phòng: {c.room}</div>}
                    {c.studentCount && <div className="schedule-student-count">Số học sinh: {c.studentCount}</div>}
                    {c.materialsUrl ? (
                      <div className="schedule-materials">
                        <a href={c.materialsUrl} target="_blank" rel="noopener noreferrer">View Materials</a>
                      </div>
                    ) : c.meetUrl ? (
                      <div className="schedule-meet">
                        <a href={c.meetUrl} target="_blank" rel="noopener noreferrer">Meet URL</a>
                      </div>
                    ) : (
                      <div className="schedule-notyet">Not yet</div>
                    )}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleTable;
