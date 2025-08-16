<div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span>Không đổi</span>
                </div>
                import React, { useEffect, useState } from 'react';
import classManagementService from '../../services/classManagementService';
import { showNotification } from '../../utils/courseManagementUtils';

const weekdays = [
  { key: 'monday', label: 'Thứ 2' },
  { key: 'tuesday', label: 'Thứ 3' },
  { key: 'wednesday', label: 'Thứ 4' },
  { key: 'thursday', label: 'Thứ 5' },
  { key: 'friday', label: 'Thứ 6' },
  { key: 'saturday', label: 'Thứ 7' },
  { key: 'sunday', label: 'Chủ nhật' }
];

// Hệ thống slot cố định 120 phút
const TIME_SLOTS = [
  { value: '07:30-09:30', label: '🌅 Slot 1: 07:30 - 09:30', icon: '🌅' },
  { value: '09:50-11:50', label: '🌤️ Slot 2: 09:50 - 11:50', icon: '🌤️' },
  { value: '13:30-15:30', label: '☀️ Slot 3: 13:30 - 15:30', icon: '☀️' },
  { value: '15:50-17:50', label: '🌇 Slot 4: 15:50 - 17:50', icon: '🌇' },
  { value: '18:00-20:00', label: '🌃 Slot 5: 18:00 - 20:00', icon: '🌃' },
  { value: '20:10-22:10', label: '🌙 Slot 6: 20:10 - 22:10', icon: '🌙' }
];

export default function RescheduleModal({ open, onClose, classItem, onSuccess }) {
  const [autoRoom, setAutoRoom] = useState(true);
  const [preferRoomId, setPreferRoomId] = useState(null);
  const [checking, setChecking] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [freeRooms, setFreeRooms] = useState([]);
  const [propagateMode, setPropagateMode] = useState('all');
  const [lessons, setLessons] = useState([]);
  
  // Cài đặt chung cho slot
  const [applySameSlot, setApplySameSlot] = useState(false);
  const [globalSlot, setGlobalSlot] = useState('');

  if (!open) return null;

  // Load lessons khi mở modal
  useEffect(() => {
    if (open && classItem?.id) {
      classManagementService.getClassLessons(classItem.id)
        .then(res => {
          const data = res.data?.data ?? res.data ?? [];
          const parseLocalDate = (v) => {
            try {
              if (!v && v !== 0) return null;
              if (Array.isArray(v) && v.length >= 3) {
                return new Date(v[0], v[1] - 1, v[2]);
              }
              if (typeof v === 'string') {
                const s = v.trim();
                if (/^\d{8}$/.test(s)) {
                  const y = s.slice(0, 4); const m = s.slice(4, 6); const d = s.slice(6, 8);
                  return new Date(`${y}-${m}-${d}`);
                }
                // ISO or other formats
                return new Date(s);
              }
              return null;
            } catch { return null; }
          };

          const formatDate = (v) => {
            const d = parseLocalDate(v);
            if (!d || isNaN(d.getTime())) return String(v ?? 'N/A');
            return d.toLocaleDateString('vi-VN');
          };

          const normalizeTime = (t) => {
            if (!t) return '';
            const s = String(t);
            // Expect HH:mm or HH:mm:ss
            const m = s.match(/^(\d{2}:\d{2})(?::\d{2})?$/);
            return m ? m[1] : s;
          };

          const mapped = (Array.isArray(data) ? data : []).map((ls, idx) => ({
            id: ls.id,
            idx,
            actualDate: ls.actualDate,
            displayDate: formatDate(ls.actualDate),
            actualStartTime: normalizeTime(ls.actualStartTime),
            actualEndTime: normalizeTime(ls.actualEndTime),
            originalSlot: `${normalizeTime(ls.actualStartTime)}-${normalizeTime(ls.actualEndTime)}`,
            selected: false,
            newDate: '',
            newSlot: '',
            status: 'unknown'
          }));
          setLessons(mapped);
        })
        .catch(() => setLessons([]));
    }
  }, [open, classItem]);

  // Áp dụng slot giống nhau khi thay đổi global slot
  useEffect(() => {
    if (applySameSlot && globalSlot) {
      setLessons(prev => prev.map(lesson => 
        lesson.selected ? { ...lesson, newSlot: globalSlot, status: 'unknown' } : lesson
      ));
    }
  }, [applySameSlot, globalSlot]);

  const updateLesson = (id, field, value) => {
    setLessons(prev => prev.map(lesson => 
      lesson.id === id ? { ...lesson, [field]: value, status: 'unknown' } : lesson
    ));
  };

  // Kiểm tra ngày có hợp lệ không (không được là quá khứ)
  const isValidDate = (dateString) => {
    if (!dateString) return false;
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return selectedDate >= today;
  };

  // Kiểm tra lesson có đầy đủ thông tin hợp lệ không
  const isLessonReady = (lesson) => {
    return lesson.selected && 
           lesson.newDate && 
           lesson.newSlot && 
           isValidDate(lesson.newDate) &&
           !hasInternalConflict(lesson);
  };

  const hasInternalConflict = (currentLesson) => {
    if (!currentLesson.newDate || !currentLesson.newSlot) return false;
    
    const [startTime, endTime] = currentLesson.newSlot.split('-');
    
    // Kiểm tra xem có buổi nào khác đã chọn cùng ngày và thời gian không
    for (const otherLesson of lessons) {
      if (otherLesson.id === currentLesson.id || !otherLesson.selected || !otherLesson.newDate || !otherLesson.newSlot) {
        continue;
      }
      
      if (otherLesson.newDate === currentLesson.newDate) {
        const [otherStartTime, otherEndTime] = otherLesson.newSlot.split('-');
        
        // Kiểm tra overlap: (start1 < end2) && (start2 < end1)
        const hasOverlap = startTime < otherEndTime && otherStartTime < endTime;
        
        if (hasOverlap) {
          return true; // Có conflict
        }
      }
    }
    
    return false; // Không có conflict
  };

  const toggleLessonSelection = (id, checked) => {
    setLessons(prev => prev.map(lesson => 
      lesson.id === id ? { 
        ...lesson, 
        selected: checked,
        ...(applySameSlot && checked && globalSlot ? { newSlot: globalSlot } : {})
      } : lesson
    ));
  };

  const resetLesson = (id) => {
    setLessons(prev => prev.map(lesson => 
      lesson.id === id ? { ...lesson, newDate: '', newSlot: '', status: 'unknown' } : lesson
    ));
  };

  const handleCheck = async () => {
    try {
      setChecking(true);
      setConflicts([]);
      
      const rowsToCheck = lessons.filter(l => isLessonReady(l));
      if (rowsToCheck.length === 0) {
        showNotification('Hãy chọn buổi và nhập ngày/slot mới hợp lệ cho từng buổi', 'warning');
        return;
      }

      // Kiểm tra conflict nội bộ trong lớp trước
      const dateTimeMap = new Map();
      for (const lesson of rowsToCheck) {
        const date = lesson.newDate;
        const [startTime, endTime] = lesson.newSlot.split('-');
        
        if (dateTimeMap.has(date)) {
          for (const existingTimeRange of dateTimeMap.get(date)) {
            const existingStart = existingTimeRange.startTime;
            const existingEnd = existingTimeRange.endTime;
            
            // Kiểm tra overlap: (start1 < end2) && (start2 < end1)
            const hasOverlap = startTime < existingEnd && existingStart < endTime;
            
            if (hasOverlap) {
              showNotification(`Phát hiện xung đột nội bộ: Buổi học #${lesson.id} trùng lịch với buổi khác trong cùng ngày ${date}`, 'warning');
              // Đánh dấu cả hai buổi là conflict
              setLessons(prev => prev.map(l => 
                (l.id === lesson.id || l.id === existingTimeRange.lessonId) ? 
                { ...l, status: 'conflict' } : l
              ));
              return;
            }
          }
        }
        
        // Thêm vào map để kiểm tra
        if (!dateTimeMap.has(date)) {
          dateTimeMap.set(date, []);
        }
        dateTimeMap.get(date).push({ startTime, endTime, lessonId: lesson.id });
      }

      const results = await Promise.all(rowsToCheck.map(async (l) => {
        const day = new Date(l.newDate);
        const dayName = day.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const [startTime, endTime] = l.newSlot.split('-');
        const scheduleOne = JSON.stringify({ 
          startTime, 
          endTime, 
          days: [dayName] 
        });
        
        const res = await classManagementService.checkScheduleConflicts({
          classId: classItem.id,
          teacherId: classItem.teacherId,
          schedule: scheduleOne,
          startDate: l.newDate,
          endDate: l.newDate
        });
        
        const hasConflict = (res.data?.data ?? res.data ?? []).length > 0;
        return { id: l.id, ok: !hasConflict };
      }));

      setLessons(prev => prev.map(l => {
        const result = results.find(x => x.id === l.id);
        return result ? { ...l, status: result.ok ? 'ok' : 'conflict' } : l;
      }));

      showNotification('Đã kiểm tra xung đột', 'success');
    } catch (e) {
      showNotification('Lỗi kiểm tra xung đột', 'error');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const updates = lessons.filter(l => isLessonReady(l))
        .map(l => {
          const [newStartTime, newEndTime] = l.newSlot.split('-');
          return {
            lessonId: l.id,
            newDate: l.newDate,
            newStartTime,
            newEndTime
          };
        });

      if (updates.length === 0) {
        showNotification('Chưa có buổi nào đủ thông tin hợp lệ để đổi', 'warning');
        return;
      }

      // Kiểm tra conflict nội bộ trong frontend trước khi submit
      const dateTimeMap = new Map();
      for (const update of updates) {
        const date = update.newDate;
        const startTime = update.newStartTime;
        const endTime = update.newEndTime;
        
        if (dateTimeMap.has(date)) {
          for (const existingTimeRange of dateTimeMap.get(date)) {
            const existingStart = existingTimeRange.startTime;
            const existingEnd = existingTimeRange.endTime;
            
            // Kiểm tra overlap: (start1 < end2) && (start2 < end1)
            const hasOverlap = startTime < existingEnd && existingStart < endTime;
            
            if (hasOverlap) {
              showNotification(`Không thể đổi lịch: Buổi học #${update.lessonId} trùng lịch với buổi khác trong cùng ngày ${date} (thời gian: ${startTime}-${endTime} chồng lấn với ${existingStart}-${existingEnd})`, 'error');
              return;
            }
          }
        }
        
        // Thêm vào map để kiểm tra
        if (!dateTimeMap.has(date)) {
          dateTimeMap.set(date, []);
        }
        dateTimeMap.get(date).push({ startTime, endTime });
      }

      await classManagementService.rescheduleClass(classItem.id, {
        lessonUpdates: updates,
        autoAssignRoom: autoRoom,
        preferRoomId: autoRoom ? preferRoomId : null
      });

      showNotification(`Đổi lịch thành công ${updates.length} buổi`, 'success');
      onSuccess && onSuccess();
      onClose();
    } catch (e) {
      console.error('Error rescheduling:', e);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = 'Lỗi đổi lịch';
      if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      showNotification(errorMessage, 'error');
    }
  };

  const getSlotIcon = (slot) => {
    const slotConfig = TIME_SLOTS.find(s => s.value === slot);
    return slotConfig ? slotConfig.icon : '🕐';
  };

  const selectedCount = lessons.filter(l => l.selected).length;
  const readyCount = lessons.filter(l => isLessonReady(l)).length;
  const conflictCount = lessons.filter(l => l.status === 'conflict' || hasInternalConflict(l)).length;
  const pastDateCount = lessons.filter(l => l.selected && l.newDate && !isValidDate(l.newDate)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-blue-50">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              🗓️ Đổi lịch: {classItem?.className}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Thiết lập lịch mới cho từng buổi học với slot cố định 120 phút
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ✖
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Cài đặt chung */}
          <div className="border rounded-lg p-4 mb-4 bg-gray-50">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              ⚙️ Cài đặt chung
            </h4>
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={applySameSlot}
                  onChange={(e) => setApplySameSlot(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Áp dụng slot giống nhau cho tất cả</span>
              </label>
              
              {applySameSlot && (
                <select
                  value={globalSlot}
                  onChange={(e) => setGlobalSlot(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Chọn slot chung --</option>
                  {TIME_SLOTS.map(slot => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              )}
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoRoom}
                  onChange={(e) => setAutoRoom(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Tự động chọn phòng trống</span>
              </label>
            </div>
          </div>

          {/* Danh sách buổi học */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800 flex items-center gap-2">
                📚 Danh sách buổi học ({lessons.length} buổi)
              </h4>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Không xung đột</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Có xung đột</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Chưa kiểm tra</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Ngày quá khứ</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {lessons.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  📭 Không có dữ liệu buổi học
                </div>
              )}
              
              {lessons.map(lesson => (
                <div 
                  key={lesson.id} 
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    
                    {/* Checkbox + Info */}
                    <div className="col-span-3 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={lesson.selected}
                        onChange={(e) => toggleLessonSelection(lesson.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="text-sm">
                        <div className="font-medium text-gray-800">#{lesson.id}</div>
                         <div className="text-gray-500 text-xs">
                           📅 {lesson.displayDate || 'N/A'}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {getSlotIcon(lesson.originalSlot)} {lesson.originalSlot || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="col-span-1 flex justify-center">
                      <span className="text-gray-300 text-lg">→</span>
                    </div>

                    {/* Ngày mới */}
                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ngày mới
                      </label>
                      <input
                        type="date"
                        value={lesson.newDate}
                        min={new Date().toISOString().split('T')[0]} // Không cho chọn ngày quá khứ
                        onChange={(e) => updateLesson(lesson.id, 'newDate', e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          lesson.newDate && !isValidDate(lesson.newDate) 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>

                    {/* Slot mới */}
                    <div className="col-span-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Slot mới (120 phút)
                      </label>
                      <select
                        value={lesson.newSlot}
                        onChange={(e) => updateLesson(lesson.id, 'newSlot', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">-- Chọn slot --</option>
                        {TIME_SLOTS.map(slot => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Actions + Status */}
                    <div className="col-span-1 flex items-center justify-center gap-2">
                      <button
                        onClick={() => resetLesson(lesson.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Reset về ban đầu"
                      >
                        🔄
                      </button>
                      
                      <div className="flex items-center">
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            lesson.newDate && !isValidDate(lesson.newDate) ? 'bg-orange-500' :
                            hasInternalConflict(lesson) ? 'bg-red-500' :
                            lesson.status === 'ok' ? 'bg-green-500' :
                            lesson.status === 'conflict' ? 'bg-red-500' :
                            lesson.selected && lesson.newDate && lesson.newSlot ? 'bg-yellow-500' :
                            'bg-gray-300'
                          }`}
                          title={
                            lesson.newDate && !isValidDate(lesson.newDate) ? 'Ngày không hợp lệ (quá khứ)' :
                            hasInternalConflict(lesson) ? 'Trùng lịch nội bộ trong lớp' :
                            lesson.status === 'ok' ? 'Không xung đột' :
                            lesson.status === 'conflict' ? 'Có xung đột' :
                            lesson.selected && lesson.newDate && lesson.newSlot ? 'Chưa kiểm tra' :
                            'Chưa thiết lập'
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Validation messages */}
                  {lesson.selected && lesson.newDate && !lesson.newSlot && (
                    <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      ⚠️ Vui lòng chọn slot thời gian
                    </div>
                  )}
                  
                  {lesson.selected && lesson.newSlot && !lesson.newDate && (
                    <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      ⚠️ Vui lòng chọn ngày học mới
                    </div>
                  )}

                  {/* Conflict nội bộ */}
                  {lesson.selected && lesson.newDate && lesson.newSlot && hasInternalConflict(lesson) && (
                    <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      ⚠️ Trùng lịch với buổi khác trong cùng ngày
                    </div>
                  )}

                  {lesson.newDate && !isValidDate(lesson.newDate) && (
                    <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                      🚫 Không thể đổi lịch về ngày quá khứ (hôm nay: {new Date().toLocaleDateString('vi-VN')})
                    </div>
                  )}

                  {lesson.status === 'conflict' && (
                    <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      ❌ Phát hiện xung đột thời gian
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          {selectedCount > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-lg">📊</span>
                <div className="text-sm">
                  <p className="text-blue-800 font-medium">Tóm tắt thay đổi:</p>
                  <p className="text-blue-700">
                    {readyCount}/{selectedCount} buổi học đã sẵn sàng để đổi lịch.
                    {conflictCount > 0 && (
                      <span className="text-red-600 ml-2">
                        ⚠️ {conflictCount} buổi có xung đột.
                      </span>
                    )}
                    {pastDateCount > 0 && (
                      <span className="text-orange-600 ml-2">
                        🚫 {pastDateCount} buổi chọn ngày quá khứ.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              📋 <span>ID: {classItem?.id} • Tạo: {new Date().toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleCheck} 
              disabled={checking || readyCount === 0}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {checking ? '🔄 Đang kiểm tra...' : '🔍 Kiểm tra xung đột'}
            </button>
            <button 
              onClick={handleSubmit}
              disabled={readyCount === 0 || conflictCount > 0 || pastDateCount > 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              ✅ Xác nhận đổi {readyCount} buổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}