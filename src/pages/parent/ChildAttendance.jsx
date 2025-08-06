import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import parentService from '../../services/parentService';

export default function ChildAttendance() {
  const { childId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await parentService.getChildAttendance(childId);
        setData(res);
      } catch (err) {
        setError('Không thể tải dữ liệu điểm danh');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [childId]);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!data) return null;

  return (
    <div>
      <h3>Điểm danh của học sinh</h3>
      <ul>
        <li>Tổng số buổi: {data.totalSessions}</li>
        <li>Có mặt: {data.presentSessions}</li>
        <li>Vắng: {data.absentSessions}</li>
        <li>Tỉ lệ điểm danh: {data.attendanceRate}%</li>
      </ul>
    </div>
  );
}