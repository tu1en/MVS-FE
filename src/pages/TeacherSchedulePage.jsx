import { AlertCircle, BookOpen, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

const TeacherSchedulePage = () => {
  const [schedule, setSchedule] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock schedule data - replace with actual API call later
  const mockScheduleData = [
    {
      id: 1,
      courseName: "Toán học cơ bản",
      classRoom: "Phòng A101",
      time: "08:00 - 09:30",
      dayOfWeek: "Thứ 2",
      date: "2024-01-15",
      studentCount: 25,
      color: "bg-blue-500"
    },
    {
      id: 2,
      courseName: "Văn học Việt Nam",
      classRoom: "Phòng B205",
      time: "10:00 - 11:30",
      dayOfWeek: "Thứ 2",
      date: "2024-01-15",
      studentCount: 30,
      color: "bg-green-500"
    },
    {
      id: 3,
      courseName: "Toán học cơ bản",
      classRoom: "Phòng A101",
      time: "08:00 - 09:30",
      dayOfWeek: "Thứ 4",
      date: "2024-01-17",
      studentCount: 25,
      color: "bg-blue-500"
    },
    {
      id: 4,
      courseName: "Hình học",
      classRoom: "Phòng A202",
      time: "14:00 - 15:30",
      dayOfWeek: "Thứ 5",
      date: "2024-01-18",
      studentCount: 22,
      color: "bg-purple-500"
    },
    {
      id: 5,
      courseName: "Văn học Việt Nam",
      classRoom: "Phòng B205",
      time: "09:00 - 10:30",
      dayOfWeek: "Thứ 6",
      date: "2024-01-19",
      studentCount: 30,
      color: "bg-green-500"
    }
  ];

  useEffect(() => {
    // Simulate API loading
    setLoading(true);
    setTimeout(() => {
      setSchedule(mockScheduleData);
      setLoading(false);
    }, 1000);
  }, [selectedWeek]);

  const weekDays = [
    { key: 'monday', label: 'Thứ 2' },
    { key: 'tuesday', label: 'Thứ 3' },
    { key: 'wednesday', label: 'Thứ 4' },
    { key: 'thursday', label: 'Thứ 5' },
    { key: 'friday', label: 'Thứ 6' },
    { key: 'saturday', label: 'Thứ 7' },
    { key: 'sunday', label: 'Chủ nhật' }
  ];

  const timeSlots = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const getScheduleForDay = (dayLabel) => {
    return schedule.filter(item => item.dayOfWeek === dayLabel);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeek(newDate);
  };

  const goToToday = () => {
    setSelectedWeek(new Date());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="bg-gray-300 h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Calendar className="mr-3 text-blue-600" size={32} />
              Lịch Giảng Dạy
            </h1>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Hôm nay
              </button>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousWeek}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  ‹
                </button>
                <span className="text-lg font-semibold px-4">
                  Tuần {formatDate(selectedWeek)}
                </span>
                <button
                  onClick={goToNextWeek}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <BookOpen className="text-blue-600 mr-2" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Tổng tiết dạy</p>
                  <p className="text-xl font-bold text-blue-600">{schedule.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="text-green-600 mr-2" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Tổng học sinh</p>
                  <p className="text-xl font-bold text-green-600">
                    {schedule.reduce((total, item) => total + item.studentCount, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Clock className="text-purple-600 mr-2" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Giờ dạy/tuần</p>
                  <p className="text-xl font-bold text-purple-600">{schedule.length * 1.5}h</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <MapPin className="text-orange-600 mr-2" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Phòng học</p>
                  <p className="text-xl font-bold text-orange-600">
                    {new Set(schedule.map(item => item.classRoom)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-8 border-b">
            <div className="p-4 bg-gray-50 font-semibold text-gray-700">Giờ</div>
            {weekDays.map(day => (
              <div key={day.key} className="p-4 bg-gray-50 font-semibold text-gray-700 text-center">
                {day.label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-8">
            {/* Time column */}
            <div className="border-r">
              {timeSlots.map(time => (
                <div key={time} className="p-4 text-sm text-gray-600 border-b h-20 flex items-center">
                  {time}
                </div>
              ))}
            </div>

            {/* Schedule columns */}
            {weekDays.map(day => (
              <div key={day.key} className="border-r">
                {timeSlots.map(time => {
                  const daySchedule = getScheduleForDay(day.label);
                  const scheduleItem = daySchedule.find(item => 
                    item.time.startsWith(time)
                  );

                  return (
                    <div key={`${day.key}-${time}`} className="h-20 border-b p-1">
                      {scheduleItem && (
                        <div className={`${scheduleItem.color} text-white p-2 rounded-md h-full flex flex-col justify-between text-xs`}>
                          <div>
                            <div className="font-semibold truncate">{scheduleItem.courseName}</div>
                            <div className="text-xs opacity-90">{scheduleItem.classRoom}</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs">{scheduleItem.studentCount} SV</span>
                            <Clock size={12} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="mr-2 text-blue-600" size={20} />
            Lịch hôm nay
          </h2>
          
          <div className="space-y-3">
            {schedule
              .filter(item => {
                const today = new Date();
                const dayNames = {
                  0: 'Chủ nhật',
                  1: 'Thứ 2',
                  2: 'Thứ 3',
                  3: 'Thứ 4',
                  4: 'Thứ 5',
                  5: 'Thứ 6',
                  6: 'Thứ 7'
                };
                return item.dayOfWeek === dayNames[today.getDay()];
              })
              .map(item => (
                <div key={item.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className={`w-4 h-4 ${item.color} rounded-full mr-4`}></div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{item.courseName}</div>
                    <div className="text-sm text-gray-600">{item.classRoom} • {item.studentCount} học sinh</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{item.time}</div>
                  </div>
                </div>
              ))}
            
            {schedule.filter(item => {
              const today = new Date();
              const dayNames = {
                0: 'Chủ nhật',
                1: 'Thứ 2',
                2: 'Thứ 3',
                3: 'Thứ 4',
                4: 'Thứ 5',
                5: 'Thứ 6',
                6: 'Thứ 7'
              };
              return item.dayOfWeek === dayNames[today.getDay()];
            }).length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Calendar className="mx-auto mb-2 text-gray-400" size={24} />
                <p>Không có lịch dạy nào hôm nay</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSchedulePage;
