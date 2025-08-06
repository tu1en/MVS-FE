import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import parentService from '../../services/parentService';

export default function ChildAssignments() {
  const { childId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await parentService.getChildAssignments(childId);
        setData(res);
      } catch (err) {
        setError('Không thể tải dữ liệu bài tập');
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
      <h3>Bài tập của học sinh</h3>
      <ul>
        <li>Tổng số bài tập: {data.totalAssignments}</li>
        <li>Đã hoàn thành: {data.completedAssignments}</li>
        <li>Chưa hoàn thành: {data.pendingAssignments}</li>
        <li>Trung bình điểm: {data.averageGrade}</li>
      </ul>
    </div>
  );
}