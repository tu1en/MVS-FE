import { message } from 'antd';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const EditCoursePage = () => {
  const { courseId } = useParams();
  const auth = useSelector((state) => state.auth);
  const [reportText, setReportText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReportSubmit = async () => {
    if (!reportText.trim()) {
      message.warning('Vui lòng nhập nội dung báo cáo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const reportPayload = {
        courseId,
        teacherId: auth.userId,
        teacherName: auth.fullName || auth.username,
        subject: auth.subject || 'Không rõ',
        message: reportText.trim(),
        timestamp: new Date().toISOString(),
      };

      // Giả lập API gửi báo cáo - cần thay bằng real API sau
      console.log('Đã gửi báo cáo:', reportPayload);

      message.success('Báo cáo của bạn đã được gửi đến quản trị viên và quản lý.');
      setReportText('');
    } catch (error) {
      console.error('Lỗi gửi báo cáo:', error);
      message.error('Gửi báo cáo thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Chỉnh sửa khóa học</h1>

      <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded">
        <p><strong>Lưu ý:</strong> Giáo viên không có quyền chỉnh sửa khóa học.</p>
        <p>Nếu bạn gặp lỗi này, vui lòng báo cáo cho quản trị viên hoặc quản lý để được hỗ trợ.</p>
      </div>


      {/* Form báo cáo lỗi */}
      <div className="mt-8 bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Gửi báo cáo lỗi</h2>
        <p className="text-sm text-gray-600 mb-4">
        </p>
        <textarea
          className="w-full border rounded p-3 text-sm"
          rows="4"
          placeholder="Nhập nội dung bạn muốn báo cáo..."
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
        ></textarea>
        <button
          onClick={handleReportSubmit}
          disabled={isSubmitting}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
        </button>
      </div>
    </div>
  );
};

export default EditCoursePage;
