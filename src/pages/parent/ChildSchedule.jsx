import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import parentService from '../../services/parentService';

export default function ChildSchedule() {
  const { childId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await parentService.getChildSchedule(childId);
        setData(res);
      } catch (err) {
        setError('Không thể tải lịch học');
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
      <h3>Lịch học của học sinh</h3>
      <ul>
        {Array.isArray(data.classes) ? data.classes.map((cls, idx) => (
          <li key={idx}>{cls.subject} - {cls.time} (GV: {cls.teacher})</li>
        )) : null}
      </ul>
    </div>
  );
}