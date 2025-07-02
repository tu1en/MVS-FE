import React, { useState } from 'react';
import axios from 'axios';

const AttendanceExplanation = () => {
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('userId', 1); // TODO: Replace with real user id from auth
      formData.append('date', date);
      formData.append('reason', reason);
      if (file) formData.append('file', file);
      const res = await axios.post('/api/accountant/attendance-explanations/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Giải trình đã được gửi thành công!');
      setDate('');
      setReason('');
      setFile(null);
    } catch (err) {
      setMessage('Lỗi: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #f0f1f2' }}>
      <h2>Gửi giải trình chấm công</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Ngày liên quan</label><br />
          <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Lý do giải trình</label><br />
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Đính kèm tài liệu (nếu có)</label><br />
          <input type="file" onChange={e => setFile(e.target.files[0])} />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, background: '#1890ff', color: '#fff', border: 'none', borderRadius: 4 }}>
          {loading ? 'Đang gửi...' : 'Gửi giải trình'}
        </button>
      </form>
      {message && <div style={{ marginTop: 16, color: message.startsWith('Lỗi') ? 'red' : 'green' }}>{message}</div>}
    </div>
  );
};

export default AttendanceExplanation;
