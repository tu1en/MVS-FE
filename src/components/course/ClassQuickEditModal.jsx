import { useEffect, useState } from 'react';
import classManagementService from '../../services/classManagementService';
import { showNotification } from '../../utils/courseManagementUtils';

export default function ClassQuickEditModal({ open, onClose, classItem, onUpdated, onReschedule }) {
  const [isPublic, setIsPublic] = useState(!!classItem?.isPublic);
  const [tuitionFee, setTuitionFee] = useState(classItem?.tuitionFee ?? 0);
  const [saving, setSaving] = useState(false);
  const [introVideoUrl, setIntroVideoUrl] = useState(classItem?.introVideoUrl || '');
  const [classStatus, setClassStatus] = useState(classItem?.status || 'ACTIVE');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    setIsPublic(!!classItem?.isPublic);
    setTuitionFee(classItem?.tuitionFee ?? 0);
    setIntroVideoUrl(classItem?.introVideoUrl || '');
    setClassStatus(classItem?.status || 'ACTIVE');
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

  const handleSaveIntroVideo = async () => {
    try {
      setSaving(true);
      await classManagementService.updateClassPartial(classItem.id, { introVideoUrl });
      showNotification('Đã lưu video học thử', 'success');
      onUpdated && onUpdated();
    } catch (e) {
      showNotification('Lỗi lưu video học thử', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openReschedule = () => {
    onClose && onClose();
    onReschedule && onReschedule(classItem);
  };

  const handleCancelClass = async () => {
    setShowCancelConfirm(false);

    try {
      setSaving(true);
      const response = await fetch(`http://localhost:8088/api/classes/${classItem.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'CANCELLED' })
      });

      if (response.ok) {
        showNotification('Đã hủy lớp học thành công!', 'success');
        onUpdated && onUpdated();
        onClose && onClose();
      } else {
        throw new Error('Lỗi hủy lớp');
      }
    } catch (e) {
      showNotification('Lỗi hủy lớp học: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
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
            <div className="font-medium mb-2">Video học thử</div>
            <div className="space-y-2">
              <input
                type="url"
                placeholder="Dán link YouTube/Vimeo..."
                value={introVideoUrl}
                onChange={(e) => setIntroVideoUrl(e.target.value)}
                className="w-full px-2 py-1 border rounded"
              />
              <div>
                <button disabled={saving} onClick={handleSaveIntroVideo} className="bg-blue-600 text-white px-3 py-1 rounded">
                  Lưu video
                </button>
              </div>
            </div>
          </div>

          <div className="border rounded p-4">
            <div className="font-medium mb-2">Lịch học</div>
            <p className="text-sm text-gray-600 mb-3">Đổi lịch theo khung ngày/giờ/ngày trong tuần và tự động chọn phòng trống.</p>
            <button onClick={openReschedule} className="bg-purple-600 text-white px-3 py-1 rounded">
              🗓️ Đổi lịch
            </button>
          </div>

          <div className="border rounded p-4 border-red-200 bg-red-50">
            <div className="font-medium mb-2 text-red-800">⚠️ Hủy lớp học</div>
            <p className="text-sm text-red-600 mb-3">
              Hủy lớp học sẽ chuyển trạng thái thành "Đã hủy" và không thể hoàn tác.
            </p>
            <button
              onClick={() => setShowCancelConfirm(true)}
              disabled={saving || classItem?.status === 'CANCELLED'}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {classItem?.status === 'CANCELLED' ? '✅ Đã hủy' : '🗑️ Hủy lớp'}
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100">Đóng</button>
        </div>
      </div>

      {/* Custom Confirm Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận hủy lớp học</h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn <span className="font-semibold text-red-600">hủy lớp học này</span>?
                <br />
                <span className="text-sm text-red-500">Hành động này không thể hoàn tác!</span>
              </p>

              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Không, giữ lại
                </button>
                <button
                  onClick={handleCancelClass}
                  disabled={saving}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                >
                  {saving ? 'Đang hủy...' : 'Có, hủy lớp'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


