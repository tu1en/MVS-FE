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
        setEvents(data || []);
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
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen vietnamese-text">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 vietnamese-heading">Lịch học và Sự kiện</h1>
        <div className="bg-white p-4 rounded-lg shadow-lg vietnamese-body">
            <Spin spinning={loading} tip="Đang tải dữ liệu lịch...">
        <Calendar
                    onPanelChange={(date) => setCurrentDate(date)}
                    cellRender={dateCellRender}
                    className="vietnamese-text"
        />
                {!loading && events.length === 0 && (
                    <div className="py-10 vietnamese-body">
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