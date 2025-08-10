import React, { useCallback, useEffect, useState } from 'react';
import roomService from '../../services/roomService';
import { showNotification } from '../../utils/courseManagementUtils';

const RoomAvailabilityCalendar = ({ 
  roomId = null, 
  selectedDate = null,
  onTimeSlotSelect = null,
  className = ""
}) => {
  const [state, setState] = useState({
    selectedRoom: null,
    rooms: [],
    schedule: [],
    currentDate: selectedDate || new Date().toISOString().split('T')[0],
    weekDates: [],
    loading: false,
    viewMode: 'week', // 'week' | 'day'
    selectedSlot: null // { date, startTime }
  });

  // Time slots for the calendar aligned with school periods (start at 07:30)
  // 30-minute granularity from 07:30 to 22:00 to khớp với mặc định các ca 07:30-09:30, ...
  const timeSlots = [
    '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  // Generate week dates
  const generateWeekDates = useCallback((date) => {
    const currentDate = new Date(date);
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = currentDate.getDay();
    const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Monday start
    startOfWeek.setDate(diff);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
      });
    }
    return weekDates;
  }, []);

  // Load rooms for selection
  const loadRooms = useCallback(async () => {
    try {
      const response = await roomService.getAllRooms({ status: 'active' });
      const rooms = response.data?.data || response.data || [];
      setState(prev => ({ ...prev, rooms: Array.isArray(rooms) ? rooms : [] }));
      
      // Auto select room if roomId provided
      if (roomId && rooms.length > 0) {
        const room = rooms.find(r => r.id === roomId);
        if (room) {
          setState(prev => ({ ...prev, selectedRoom: room }));
        }
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
      setState(prev => ({ ...prev, rooms: [] }));
      showNotification('Lỗi tải danh sách phòng: ' + error.message, 'error');
    }
  }, [roomId]);

  // Load schedule for selected room and time period
  const loadSchedule = useCallback(async () => {
    if (!state.selectedRoom) return;

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      let startDate, endDate;
      if (state.viewMode === 'week') {
        startDate = state.weekDates[0]?.date || state.currentDate;
        endDate = state.weekDates[6]?.date || state.currentDate;
      } else {
        startDate = endDate = state.currentDate;
      }

      const response = await roomService.getRoomSchedule(state.selectedRoom.id, startDate, endDate);
      const schedule = response.data?.data || response.data || [];
      
      setState(prev => ({
        ...prev,
        schedule,
        loading: false
      }));
    } catch (error) {
      console.error('Error loading schedule:', error);
      showNotification('Lỗi tải lịch phòng: ' + error.message, 'error');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.selectedRoom, state.currentDate, state.weekDates, state.viewMode]);

  // Initialize data
  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    const weekDates = generateWeekDates(state.currentDate);
    setState(prev => ({ ...prev, weekDates }));
  }, [state.currentDate, generateWeekDates]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // Handle room selection
  const handleRoomSelect = (room) => {
    setState(prev => ({ ...prev, selectedRoom: room }));
  };

  // Handle date navigation
  const navigateDate = (direction) => {
    const currentDate = new Date(state.currentDate);
    const days = state.viewMode === 'week' ? 7 : 1;
    currentDate.setDate(currentDate.getDate() + (direction * days));
    setState(prev => ({ 
      ...prev, 
      currentDate: currentDate.toISOString().split('T')[0]
    }));
  };

  // Check if time slot is booked
  const isTimeSlotBooked = (date, startTime) => {
    return state.schedule.some(booking => {
      const bookingDate = booking.date || booking.scheduledDate;
      const bookingStart = booking.startTime;
      const bookingEnd = booking.endTime;
      
      if (bookingDate !== date) return false;
      
      // Check if the time slot overlaps with booking
      const slotEnd = timeSlots[timeSlots.indexOf(startTime) + 1] || '22:30';
      return (startTime >= bookingStart && startTime < bookingEnd) ||
             (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
             (startTime <= bookingStart && slotEnd >= bookingEnd);
    });
  };

  // Get booking info for time slot
  const getBookingInfo = (date, startTime) => {
    return state.schedule.find(booking => {
      const bookingDate = booking.date || booking.scheduledDate;
      const bookingStart = booking.startTime;
      const bookingEnd = booking.endTime;
      
      if (bookingDate !== date) return false;
      return startTime >= bookingStart && startTime < bookingEnd;
    });
  };

  // Handle time slot click
  const handleTimeSlotClick = (date, startTime) => {
    if (isTimeSlotBooked(date, startTime)) return;

    // Lưu highlight cục bộ để người dùng thấy phản hồi ngay
    setState(prev => ({ ...prev, selectedSlot: { date, startTime } }));

    const endTime = timeSlots[timeSlots.indexOf(startTime) + 1] || '22:30';
    if (onTimeSlotSelect) {
      onTimeSlotSelect({
        room: state.selectedRoom,
        date,
        startTime,
        endTime
      });
    } else {
      showNotification(`Đã chọn ${date} • ${startTime} - ${endTime} tại phòng ${state.selectedRoom?.name || `${state.selectedRoom?.building}-${state.selectedRoom?.number}`}`, 'info');
    }
  };

  return (
    <div className={`room-availability-calendar vietnamese-text ${className}`}>
      {/* Room Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn phòng học:
        </label>
        <select
          value={state.selectedRoom?.id || ''}
          onChange={(e) => {
            const room = state.rooms.find(r => String(r.id) === String(e.target.value));
            handleRoomSelect(room);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Chọn phòng học --</option>
          {(state.rooms && Array.isArray(state.rooms) ? state.rooms : []).map(room => (
            <option key={room.id} value={room.id}>
              {room.name || `${room.building}-${room.number}`} 
              ({room.capacity} chỗ) - {room.building}
            </option>
          ))}
        </select>
      </div>

      {state.selectedRoom && (
        <>
          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateDate(-1)}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ← {state.viewMode === 'week' ? 'Tuần trước' : 'Hôm trước'}
              </button>
              <button
                onClick={() => setState(prev => ({ 
                  ...prev, 
                  currentDate: new Date().toISOString().split('T')[0]
                }))}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Hôm nay
              </button>
              <button
                onClick={() => navigateDate(1)}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {state.viewMode === 'week' ? 'Tuần sau' : 'Hôm sau'} →
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={state.viewMode}
                onChange={(e) => setState(prev => ({ ...prev, viewMode: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded-md"
              >
                <option value="week">Tuần</option>
                <option value="day">Ngày</option>
              </select>
              <button
                onClick={loadSchedule}
                disabled={state.loading}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {state.loading ? '🔄' : '🔄'} Làm mới
              </button>
            </div>
          </div>

          {/* Room Info */}
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <h3 className="font-medium text-blue-900">
              📍 {state.selectedRoom.name || `${state.selectedRoom.building}-${state.selectedRoom.number}`}
            </h3>
            <div className="text-sm text-blue-700 mt-1">
              🏢 {state.selectedRoom.building} • 
              🏷️ {state.selectedRoom.type || 'N/A'} • 
              👥 {state.selectedRoom.capacity || 0} chỗ ngồi
            </div>
            {state.selectedRoom.description && (
              <div className="text-sm text-blue-600 mt-1">
                {state.selectedRoom.description}
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {state.loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Đang tải lịch phòng...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        Giờ
                      </th>
                      {(state.viewMode === 'week' ? state.weekDates : [{ 
                        date: state.currentDate, 
                        dayName: new Date(state.currentDate).toLocaleDateString('vi-VN', { weekday: 'short' }),
                        dayNumber: new Date(state.currentDate).getDate(),
                        isToday: state.currentDate === new Date().toISOString().split('T')[0]
                      }]).map(day => (
                        <th key={day.date} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className={`${day.isToday ? 'text-blue-600 font-bold' : ''}`}>
                            {day.dayName}
                          </div>
                          <div className={`text-sm ${day.isToday ? 'text-blue-600 font-bold' : 'text-gray-900'}`}>
                            {day.dayNumber}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {timeSlots.map(time => (
                      <tr key={time} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 border-r border-gray-200">
                          {time}
                        </td>
                        {(state.viewMode === 'week' ? state.weekDates : [{ date: state.currentDate }]).map(day => {
                          const isBooked = isTimeSlotBooked(day.date, time);
                          const bookingInfo = getBookingInfo(day.date, time);
                          
                          return (
                            <td
                              key={day.date}
                              onClick={() => handleTimeSlotClick(day.date, time)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleTimeSlotClick(day.date, time);
                                }
                              }}
                              className={`
                                px-2 py-2 text-xs border-r border-gray-200 cursor-pointer transition-colors
                                ${isBooked ? 
                                  'bg-red-100 hover:bg-red-200' : 
                                   'hover:bg-green-100'
                                }
                                ${onTimeSlotSelect && !isBooked ? 'cursor-pointer' : ''}
                                 ${state.selectedSlot && state.selectedSlot.date === day.date && state.selectedSlot.startTime === time ? 'ring-2 ring-blue-500' : ''}
                              `}
                            >
                              {isBooked ? (
                                <div className="text-red-800">
                                  <div className="font-medium truncate">
                                    {bookingInfo?.className || bookingInfo?.title || 'Đã đặt'}
                                  </div>
                                  {bookingInfo && (
                                    <div className="text-xs opacity-75">
                                      {bookingInfo.startTime} - {bookingInfo.endTime}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-green-600 text-center opacity-50">
                                  ⭕ Trống
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2"></div>
              <span>Đã đặt</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
              <span>Còn trống</span>
            </div>
            {onTimeSlotSelect && (
              <div className="text-gray-600">
                💡 Click vào ô trống để chọn thời gian
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RoomAvailabilityCalendar;