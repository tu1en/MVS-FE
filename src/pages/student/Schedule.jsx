import { Badge, Calendar, Empty, message, Spin, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import scheduleService from '../../services/scheduleService';

// Component con để hiển thị một sự kiện
const EventItem = ({ item }) => (
    <Tooltip title={`${item.title} (${item.classroomName}) - ${item.description || 'Không có mô tả'}`}>
        <li>
            <Badge 
                color={item.color || 'blue'} 
                text={`${dayjs(item.startDatetime).format('HH:mm')} ${item.title}`} 
            />
        </li>
    </Tooltip>
);

const StudentSchedule = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false); // Khởi tạo false thay vì true
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [loadedMonths, setLoadedMonths] = useState(new Set()); // Track multiple loaded months

  // Sử dụng useMemo để tối ưu hóa việc nhóm các sự kiện theo ngày
  const eventsByDate = useMemo(() => {
    const groupedEvents = {};
    events.forEach(event => {
      const dateStr = dayjs(event.startDatetime).format('YYYY-MM-DD');
      if (!groupedEvents[dateStr]) {
        groupedEvents[dateStr] = [];
      }
      groupedEvents[dateStr].push(event);
    });
    return groupedEvents;
  }, [events]);

  // Sử dụng useCallback để tránh re-render không cần thiết
  const fetchTimetable = useCallback(async (date) => {
    const monthKey = date.format('YYYY-MM');

    // Prevent duplicate calls for the same month
    if (loadedMonths.has(monthKey)) {
      console.log(`⏭️ StudentSchedule: Month ${monthKey} already loaded, skipping duplicate call`);
      return;
    }

    console.log(`🔄 StudentSchedule: Loading timetable for month ${monthKey}`);
    setLoading(true);

    try {
      const startOfMonth = date.startOf('month').format('YYYY-MM-DD');
      const endOfMonth = date.endOf('month').format('YYYY-MM-DD');

      console.log(`📅 StudentSchedule: Fetching timetable from ${startOfMonth} to ${endOfMonth}`);
      const data = await scheduleService.getMyTimetable(startOfMonth, endOfMonth);

      console.log(`✅ StudentSchedule: Received ${Array.isArray(data) ? data.length : 0} events for month ${monthKey}`);
      
      // Cập nhật events - merge với data cũ thay vì replace hoàn toàn
      setEvents(prevEvents => {
        // Filter out events from the same month and add new ones
        const filteredPrevEvents = prevEvents.filter(event => {
          const eventMonth = dayjs(event.startDatetime).format('YYYY-MM');
          return eventMonth !== monthKey;
        });
        return [...filteredPrevEvents, ...(data || [])];
      });
      
      // Mark this month as loaded
      setLoadedMonths(prev => new Set([...prev, monthKey]));

    } catch (error) {
      console.error("❌ Failed to fetch timetable for month", monthKey, error);
      message.error("Không thể tải lịch học. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [loadedMonths]);

  // Load initial data
  useEffect(() => {
    console.log(`🚀 StudentSchedule: Initial load for current month`);
    fetchTimetable(currentDate);
  }, []); // Chỉ chạy một lần khi component mount

  // Handle month panel changes
  const handlePanelChange = useCallback((date) => {
    console.log(`📅 StudentSchedule: Panel changed to ${date.format('YYYY-MM')}`);
    setCurrentDate(date);
    fetchTimetable(date);
  }, [fetchTimetable]);

  // Hàm được truyền cho Ant Design Calendar để render nội dung cho mỗi ô ngày
  const dateCellRender = useCallback((date) => {
    const dateStr = date.format('YYYY-MM-DD');
    const dayEvents = eventsByDate[dateStr] || [];

    if (dayEvents.length === 0) {
        return null; // Không hiển thị gì nếu không có sự kiện
    }

    return (
      <ul className="events" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {dayEvents.map(item => <EventItem key={item.id} item={item} />)}
      </ul>
    );
  }, [eventsByDate]);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Lịch học và Sự kiện</h1>
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <Spin spinning={loading} tip="Đang tải dữ liệu lịch...">
            <Calendar 
              onPanelChange={handlePanelChange} 
              cellRender={dateCellRender}
              defaultValue={currentDate}
            />
            {!loading && events.length === 0 && (
              <div className="py-10">
                <Empty description="Không có lịch học hoặc sự kiện nào trong tháng này." />
              </div>
            )}
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default StudentSchedule;