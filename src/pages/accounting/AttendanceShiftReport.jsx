import React, { useEffect, useState } from 'react';
import { Table, Button, DatePicker, Select, Spin, Modal } from 'antd';
import axios from 'axios';

const { RangePicker } = DatePicker;

const AttendanceShiftReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [shift, setShift] = useState('');
  const [reasonModal, setReasonModal] = useState({ open: false, reason: '' });

  // Lấy danh sách ca làm (giả lập, có thể lấy từ API)
  const shifts = [
    { label: 'Sáng', value: 'morning' },
    { label: 'Chiều', value: 'afternoon' },
    { label: 'Tối', value: 'evening' }
  ];

  const fetchReport = async () => {
    setLoading(true);
    try {
      // Gọi API lấy dữ liệu báo cáo chấm công theo ca, truyền dateRange và shift
      const res = await axios.get('/api/attendance/shift-report', {
        params: {
          from: dateRange[0]?.format('YYYY-MM-DD'),
          to: dateRange[1]?.format('YYYY-MM-DD'),
          shift,
        }
      });
      setData(res.data);
    } catch (err) {
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Tự động load báo cáo lần đầu hoặc khi filter thay đổi
    if (dateRange.length === 2 && shift) fetchReport();
    // eslint-disable-next-line
  }, [dateRange, shift]);

  const columns = [
    { title: 'Tên nhân viên', dataIndex: 'employeeName', key: 'employeeName' },
    { title: 'Ca làm', dataIndex: 'shift', key: 'shift' },
    { title: 'Ngày', dataIndex: 'date', key: 'date' },
    { title: 'Giờ vào', dataIndex: 'checkIn', key: 'checkIn' },
    { title: 'Giờ ra', dataIndex: 'checkOut', key: 'checkOut' },
    { title: 'Đi trễ', dataIndex: 'isLate', key: 'isLate', render: v => v ? <span style={{color:'red'}}>Có</span> : 'Không' },
    { title: 'Lý do đi trễ', dataIndex: 'lateReason', key: 'lateReason',
      render: (text, record) => record.isLate && text ? (
        <Button type="link" onClick={() => setReasonModal({ open: true, reason: text })}>Xem lý do</Button>
      ) : record.isLate ? <span style={{color:'#888'}}>Chưa có</span> : '-' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Báo cáo chấm công theo ca</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <RangePicker onChange={setDateRange} style={{ minWidth: 220 }} />
        <Select
          placeholder="Chọn ca làm"
          options={shifts}
          style={{ minWidth: 120 }}
          onChange={setShift}
        />
        <Button type="primary" onClick={fetchReport} disabled={!(dateRange.length===2 && shift)}>
          Tải lại báo cáo
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey={r => r.id}
          bordered
          pagination={{ pageSize: 10 }}
        />
      </Spin>
      <Modal
        open={reasonModal.open}
        onCancel={() => setReasonModal({ open: false, reason: '' })}
        footer={null}
        title="Lý do đi trễ"
      >
        <div style={{ whiteSpace: 'pre-line' }}>{reasonModal.reason}</div>
      </Modal>
    </div>
  );
};

export default AttendanceShiftReport;
