import React, { useCallback, useEffect, useState } from 'react';
import roomService from '../../services/roomService';
import { showNotification } from '../../utils/courseManagementUtils';

const RoomSelector = ({ 
  selectedRoom, 
  onRoomSelect, 
  scheduleData = null,  // { date, startTime, endTime, classId }
  minCapacity = 0,
  disabled = false,
  className = ""
}) => {
  const [state, setState] = useState({
    rooms: [],
    availableRooms: [],
    loading: false,
    searchMode: 'all', // 'all' | 'available'
    filters: {
      building: '',
      type: '',
      status: 'active'
    }
  });

  // Load all rooms
  const loadAllRooms = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const response = await roomService.getAllRooms(state.filters);
      const rooms = response.data?.data || response.data || [];
      
      setState(prev => ({
        ...prev,
        rooms,
        loading: false
      }));
    } catch (error) {
      console.error('Error loading rooms:', error);
      showNotification('Lỗi tải danh sách phòng: ' + error.message, 'error');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.filters]);

  // Search available rooms for specific time slot
  const searchAvailableRooms = useCallback(async () => {
    if (!scheduleData || !scheduleData.date || !scheduleData.startTime || !scheduleData.endTime) {
      setState(prev => ({ ...prev, availableRooms: [] }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      const searchParams = {
        date: scheduleData.date,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
        minCapacity: minCapacity || 0,
        building: state.filters.building,
        type: state.filters.type,
        excludeClassId: scheduleData.classId // Exclude current class from conflict check
      };

      const response = await roomService.getAvailableRooms(searchParams);
      const availableRooms = response.data?.data || response.data || [];
      
      setState(prev => ({
        ...prev,
        availableRooms,
        loading: false
      }));
    } catch (error) {
      console.error('Error searching available rooms:', error);
      showNotification('Lỗi tìm phòng trống: ' + error.message, 'error');
      setState(prev => ({ ...prev, loading: false, availableRooms: [] }));
    }
  }, [scheduleData, minCapacity, state.filters]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    if (state.searchMode === 'all') {
      loadAllRooms();
    } else {
      searchAvailableRooms();
    }
  }, [state.searchMode, loadAllRooms, searchAvailableRooms]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [filterType]: value }
    }));
  };

  // Handle search mode change
  const handleSearchModeChange = (mode) => {
    setState(prev => ({ ...prev, searchMode: mode }));
  };

  // Get rooms to display based on search mode
  const getRoomsToDisplay = () => {
    return state.searchMode === 'available' ? state.availableRooms : state.rooms;
  };

  // Check if a room is available (when in 'all' mode but have schedule data)
  const isRoomAvailable = (room) => {
    if (state.searchMode === 'available') return true;
    if (!scheduleData) return true;
    
    // If we have available rooms data, check if this room is in the list
    return state.availableRooms.length === 0 || 
           state.availableRooms.some(ar => ar.id === room.id);
  };

  const roomsToDisplay = getRoomsToDisplay();

  return (
    <div className={`room-selector vietnamese-text ${className}`}>
      {/* Search Mode Toggle */}
      <div className="mb-4">
        <div className="flex items-center space-x-4 mb-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="searchMode"
              value="all"
              checked={state.searchMode === 'all'}
              onChange={(e) => handleSearchModeChange(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm font-medium">Tất cả phòng</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="searchMode"
              value="available"
              checked={state.searchMode === 'available'}
              onChange={(e) => handleSearchModeChange(e.target.value)}
              disabled={!scheduleData}
              className="mr-2"
            />
            <span className="text-sm font-medium">
              Chỉ phòng trống 
              {!scheduleData && <span className="text-gray-400 ml-1">(cần thông tin lịch)</span>}
            </span>
          </label>
        </div>

        {/* Schedule Info */}
        {scheduleData && (
          <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
            🕒 {scheduleData.date} • {scheduleData.startTime} - {scheduleData.endTime}
            {minCapacity > 0 && ` • Tối thiểu ${minCapacity} chỗ ngồi`}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <select
          value={state.filters.building}
          onChange={(e) => handleFilterChange('building', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">Tất cả tòa nhà</option>
          <option value="A">Tòa A</option>
          <option value="B">Tòa B</option>
          <option value="C">Tòa C</option>
          <option value="D">Tòa D</option>
        </select>

        <select
          value={state.filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
           <option value="">Tất cả loại phòng</option>
           <option value="lecture">Phòng giảng</option>
          <option value="lab">Phòng thí nghiệm</option>
          <option value="computer">Phòng máy tính</option>
          <option value="seminar">Phòng seminar</option>
          <option value="meeting">Phòng họp</option>
        </select>

        <button
          onClick={state.searchMode === 'available' ? searchAvailableRooms : loadAllRooms}
          disabled={state.loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {state.loading ? '🔄 Đang tải...' : '🔍 Tìm phòng'}
        </button>
      </div>

      {/* Room List */}
      <div className="max-h-64 overflow-y-auto">
        {state.loading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 mt-2">Đang tìm kiếm phòng...</p>
          </div>
        ) : roomsToDisplay.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            {state.searchMode === 'available' ? 
              '🚫 Không có phòng trống trong khoảng thời gian này' : 
              '📭 Không tìm thấy phòng nào'
            }
          </div>
        ) : (
          <div className="space-y-2">
            {roomsToDisplay.map((room) => {
              const available = isRoomAvailable(room);
              const isSelected = selectedRoom?.id === room.id;
              
              return (
                <div
                  key={room.id}
                  onClick={() => !disabled && onRoomSelect(room)}
                  className={`
                    p-3 border rounded-lg cursor-pointer transition-colors
                    ${isSelected ? 
                      'border-blue-500 bg-blue-50' : 
                      'border-gray-200 hover:bg-gray-50'
                    }
                    ${!available ? 'opacity-60 cursor-not-allowed' : ''}
                    ${disabled ? 'cursor-not-allowed opacity-50' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">
                          {room.name || `${room.building}-${room.number}`}
                        </span>
                        {!available && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Đã đặt
                          </span>
                        )}
                        {isSelected && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            ✓ Đã chọn
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-600 mt-1">
                        📍 {room.building} • 
                        🏷️ {room.type || 'N/A'} • 
                        👥 {room.capacity || 0} chỗ
                      </div>
                      
                      {room.description && (
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {room.description}
                        </div>
                      )}
                    </div>

                    <div className="ml-2 text-right">
                      <div className={`
                        w-3 h-3 rounded-full
                        ${available ? 'bg-green-400' : 'bg-red-400'}
                      `}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Room Summary */}
      {selectedRoom && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm font-medium text-green-800">
            ✓ Đã chọn: {selectedRoom.name || `${selectedRoom.building}-${selectedRoom.number}`}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {selectedRoom.building} • {selectedRoom.type} • {selectedRoom.capacity} chỗ
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomSelector;