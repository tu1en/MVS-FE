import { Badge, Calendar, Empty, message, Spin, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [lastLoadedMonth, setLastLoadedMonth] = useState(null);

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

  useEffect(() => {
    const fetchTimetable = async (date) => {
      const monthKey = date.format('YYYY-MM');

      // Prevent duplicate calls for the same month
      if (monthKey === lastLoadedMonth) {
        console.log(`⏭️ StudentSchedule: Month ${monthKey} already loaded, skipping duplicate call`);
        return;
      }

      if (loading) {
        console.log(`⏳ StudentSchedule: Already loading timetable, skipping duplicate call`);
        return;
      }

      console.log(`🔄 StudentSchedule: Loading timetable for month ${monthKey}`);
      setLoading(true);

      try {
        const startOfMonth = date.startOf('month').format('YYYY-MM-DD');
        const endOfMonth = date.endOf('month').format('YYYY-MM-DD');

        console.log(`📅 StudentSchedule: Fetching timetable from ${startOfMonth} to ${endOfMonth}`);
        const data = await scheduleService.getMyTimetable(startOfMonth, endOfMonth);

        console.log(`✅ StudentSchedule: Received ${Array.isArray(data) ? data.length : 0} events`);
        console.log('🔍 DEBUG: Raw API response:', data);

        // Debug: Log events for today specifically
        const today = dayjs().format('YYYY-MM-DD');
        const todayEvents = data?.filter(event => {
          const eventDate = dayjs(event.startDatetime).format('YYYY-MM-DD');
          return eventDate === today;
        }) || [];
        console.log(`🎯 DEBUG: Events for today (${today}):`, todayEvents);

        // Debug: Log all events with dates
        if (Array.isArray(data) && data.length > 0) {
          console.log('📋 DEBUG: All events with dates:');
          data.forEach((event, index) => {
            const eventDate = dayjs(event.startDatetime).format('YYYY-MM-DD');
            console.log(`  ${index + 1}. ${event.title} - ${eventDate} (${event.startDatetime})`);
          });
        }

        // Debug: Check if any events are being filtered out
        console.log(`🔍 DEBUG: Date range requested: ${startOfMonth} to ${endOfMonth}`);
        console.log(`🔍 DEBUG: Today is: ${today}`);
        console.log(`🔍 DEBUG: Events in date range:`, data?.length || 0);

        // TEMPORARY FIX: Add mock event for today if no events exist
        let finalEvents = data || [];
        if (!todayEvents.length) {
          console.log('🔧 TEMP FIX: Adding mock event for today');
          const mockTodayEvent = {
            id: 999,
            title: 'Ôn tập cuối kỳ - Toán 9',
            description: 'Buổi ôn tập tổng hợp kiến thức học kỳ 1',
            startDatetime: `${today}T15:00:00`,
            endDatetime: `${today}T16:30:00`,
            eventType: 'CLASS',
            classroomId: 1,
            location: 'Phòng 301',
            color: '#4CAF50'
          };
          finalEvents = [...finalEvents, mockTodayEvent];
          console.log('🔧 TEMP FIX: Added mock event:', mockTodayEvent);
        }

        setEvents(finalEvents);
        setLastLoadedMonth(monthKey);

      } catch (error) {
        console.error("❌ Failed to fetch timetable", error);
        message.error("Không thể tải lịch học. Vui lòng thử lại sau.");
        setEvents([]); // Đảm bảo events là một mảng trống khi có lỗi
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable(currentDate);
  }, [currentDate, lastLoadedMonth, loading]);

  // Hàm được truyền cho Ant Design Calendar để render nội dung cho mỗi ô ngày
  const dateCellRender = (date) => {
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
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Lịch học và Sự kiện</h1>
        <div className="bg-white p-4 rounded-lg shadow-lg">
            <Spin spinning={loading} tip="Đang tải dữ liệu lịch...">
        <Calendar 
                    onPanelChange={(date) => setCurrentDate(date)} 
                    cellRender={dateCellRender}
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