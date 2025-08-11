import React, { useEffect, useState } from 'react';
import classManagementService from '../../services/classManagementService';
import { showNotification } from '../../utils/courseManagementUtils';

export default function ClassQuickEditModal({ open, onClose, classItem, onUpdated, onReschedule }) {
  const [isPublic, setIsPublic] = useState(!!classItem?.isPublic);
  const [tuitionFee, setTuitionFee] = useState(classItem?.tuitionFee ?? 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsPublic(!!classItem?.isPublic);
    setTuitionFee(classItem?.tuitionFee ?? 0);
  }, [classItem]);

  if (!open || !classItem) return null;

  const handleSavePublic = async () => {
    try {
      setSaving(true);
      await classManagementService.updateClassPublic(classItem.id, isPublic);
      showNotification('Đã cập nhật hiển thị lớp', 'success');
      onUpdated && onUpdated();
    } catch (e) {
      showNotification('Lỗi cập nhật hiển thị lớp', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTuition = async () => {
    try {
      setSaving(true);
      await classManagementService.updateClassTuition(classItem.id, Number(tuitionFee || 0));
      showNotification('Đã cập nhật học phí', 'success');
      onUpdated && onUpdated();
    } catch (e) {
      showNotification('Lỗi cập nhật học phí', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openReschedule = () => {
    onClose && onClose();
    onReschedule && onReschedule(classItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 vietnamese-text">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Chỉnh sửa: {classItem.className}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✖</button>
        </div>

        <div className="space-y-5">
          <div className="border rounded p-4">
            <div className="font-medium mb-2">Trạng thái hiển thị</div>
            <label className="inline-flex items-center space-x-2">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              <span>{isPublic ? 'Công khai' : 'Riêng tư'}</span>
            </label>
            <div className="mt-3">
              <button disabled={saving} onClick={handleSavePublic} className="bg-blue-600 text-white px-3 py-1 rounded">
                Lưu hiển thị
              </button>
            </div>
          </div>

          <div className="border rounded p-4">
            <div className="font-medium mb-2">Học phí</div>
            <div className="flex items-center space-x-2">
              <span>💰</span>
              <input
                type="number"
                min="0"
                value={tuitionFee}
                onChange={(e) => setTuitionFee(e.target.value)}
                className="w-32 px-2 py-1 border rounded"
              />
              <button disabled={saving} onClick={handleSaveTuition} className="bg-green-600 text-white px-3 py-1 rounded">
                Lưu học phí
              </button>
            </div>
          </div>

          <div className="border rounded p-4">
            <div className="font-medium mb-2">Lịch học</div>
            <p className="text-sm text-gray-600 mb-3">Đổi lịch theo khung ngày/giờ/ngày trong tuần và tự động chọn phòng trống.</p>
            <button onClick={openReschedule} className="bg-purple-600 text-white px-3 py-1 rounded">
              🗓️ Đổi lịch
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100">Đóng</button>
        </div>
      </div>
    </div>
  );
}


