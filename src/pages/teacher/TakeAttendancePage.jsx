import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API_CONFIG from '../../config/api-config';
import { useAuth } from '../../context/AuthContext';
import { teacherAttendanceService } from '../../services/teacherAttendanceService';

const TakeAttendancePage = () => {
  const { classroomId, lectureId: urlLectureId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [students, setStudents] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [actualLectureId, setActualLectureId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchAttempted = useRef(false);

  // ✅ Kiểm tra đăng nhập và quyền
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    const role = user.role?.replace('ROLE_', '');
    if (role !== 'TEACHER') {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // ✅ Lấy danh sách bài giảng theo classroom
  const fetchLectures = useCallback(async () => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/lectures/classroom/${classroomId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      setLectures(data);

      if (data.length === 0) {
        setError('Lớp học này không có bài giảng nào để điểm danh');
        return;
      }

      // Chọn lecture hợp lệ
      let targetLectureId = null;
      if (urlLectureId) {
        const validLecture = data.find(l => l.id?.toString() === urlLectureId);
        targetLectureId = validLecture ? validLecture.id : data[0].id;
      } else {
        targetLectureId = data[0].id;
      }
      setActualLectureId(targetLectureId);
    } catch (err) {
      console.error('Error fetching lectures:', err);
      setError('Không thể tải danh sách bài giảng');
    }
  }, [classroomId, urlLectureId]);

  // ✅ Lấy dữ liệu điểm danh
  const fetchAttendanceData = useCallback(async () => {
    if (fetchAttempted.current || !actualLectureId || !classroomId) return;
    fetchAttempted.current = true;

    setIsLoading(true);
    setError(null);

    try {
      const data = await teacherAttendanceService.getAttendanceForLecture(actualLectureId, classroomId);
      if (!data || data.length === 0) {
        setStudents([]);
        setError('Không tìm thấy học sinh cho bài giảng này');
        return;
      }

      const formatted = data.map(s => ({ ...s, status: s.status || 'PRESENT' }));
      setStudents(formatted);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Không thể tải dữ liệu điểm danh');
    } finally {
      setIsLoading(false);
    }
  }, [actualLectureId, classroomId]);

  // ✅ Gọi API lấy lectures
  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  // ✅ Gọi API lấy dữ liệu attendance khi có actualLectureId
  useEffect(() => {
    if (actualLectureId) {
      fetchAttempted.current = false;
      fetchAttendanceData();
    }
  }, [fetchAttendanceData, actualLectureId]);

  const handleStatusChange = (studentId, newStatus) => {
    setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, status: newStatus } : s));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSubmitSuccess(false);

    const payload = {
      lectureId: parseInt(actualLectureId, 10),
      classroomId: parseInt(classroomId, 10),
      records: students.map(({ studentId, status }) => ({ studentId, status }))
    };

    try {
      await teacherAttendanceService.submitAttendance(payload);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 2000);
    } catch (err) {
      console.error('Error submitting attendance:', err);
      setError('Gửi dữ liệu điểm danh thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => {
    fetchAttempted.current = false;
    fetchAttendanceData();
  };

  if (loading) return <div className="p-8 text-center">Đang kiểm tra đăng nhập...</div>;
  if (isLoading) return <div className="p-8 text-center">Đang tải dữ liệu điểm danh...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Điểm danh</h1>
      <h2 className="text-lg mb-2">
        Lớp: {classroomId} | Bài giảng: {actualLectureId}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Lỗi:</strong> {error}
          <button onClick={handleRefresh} className="ml-4 px-3 py-1 bg-red-500 text-white rounded">
            Thử lại
          </button>
        </div>
      )}

      {submitSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Điểm danh thành công!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border-b">Mã HS</th>
              <th className="py-2 px-4 border-b">Họ và tên</th>
              <th className="py-2 px-4 border-b">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map(s => (
                <tr key={s.studentId}>
                  <td className="py-2 px-4 border-b">{s.studentId}</td>
                  <td className="py-2 px-4 border-b">{s.studentName}</td>
                  <td className="py-2 px-4 border-b">
                    <select
                      value={s.status}
                      onChange={e => handleStatusChange(s.studentId, e.target.value)}
                      className="p-2 border rounded"
                    >
                      <option value="PRESENT">Có mặt</option>
                      <option value="ABSENT">Vắng</option>
                      <option value="LATE">Đi trễ</option>
                      <option value="EXCUSED">Có phép</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="py-4 text-center">
                  Không có học sinh nào trong bài giảng này
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting || students.length === 0}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu điểm danh'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TakeAttendancePage;
