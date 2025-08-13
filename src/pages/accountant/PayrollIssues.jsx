import { Button, Card, Col, Input, message, Modal, Row, Select, Space, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import PayrollService from '../../services/payrollService';

const { Option } = Select;

const statusColor = (s) => {
  if (s === 'RESOLVED') return 'green';
  if (s === 'IN_PROGRESS') return 'blue';
  return 'orange';
};

const PayrollIssues = () => {
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('ALL');
  const [view, setView] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await PayrollService.listAllPayrollIssues();
      setIssues(data || []);
    } catch (e) {
      console.error(e);
      message.error('Không thể tải danh sách tra soát');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (id, newStatus) => {
    try {
      await PayrollService.updatePayrollIssueStatus(id, newStatus);
      message.success('Đã cập nhật trạng thái');
      load();
    } catch (e) {
      console.error(e);
      message.error('Cập nhật trạng thái thất bại');
    }
  };

  const filtered = issues.filter((it) => {
    if (status !== 'ALL' && (it.status || 'OPEN') !== status) return false;
    const key = (q || '').toLowerCase();
    if (!key) return true;
    return (
      String(it.id || '').includes(key) ||
      String(it.userId || '').includes(key) ||
      (it.period || '').toLowerCase().includes(key) ||
      (it.subject || '').toLowerCase().includes(key)
    );
  });

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'User ID', dataIndex: 'userId', key: 'userId', width: 100 },
    { title: 'Kỳ lương', dataIndex: 'period', key: 'period', width: 110 },
    { title: 'Tiêu đề', dataIndex: 'subject', key: 'subject' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140,
      render: (s) => <Tag color={statusColor(s)}>{s || 'OPEN'}</Tag>
    },
    {
      title: 'Hành động', key: 'action', width: 220,
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => setView(r)}>Xem</Button>
          <Select size="small" value={r.status || 'OPEN'} onChange={(val) => changeStatus(r.id, val)} style={{ width: 140 }}>
            <Option value="OPEN">OPEN</Option>
            <Option value="IN_PROGRESS">IN_PROGRESS</Option>
            <Option value="RESOLVED">RESOLVED</Option>
          </Select>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Tra soát bảng lương">
        <Row justify="space-between" style={{ marginBottom: 12 }} gutter={12}>
          <Col>
            <Space>
              <Input.Search placeholder="Tìm theo ID/Người dùng/Kỳ/tiêu đề" allowClear value={q} onChange={(e)=>setQ(e.target.value)} style={{ width: 360 }} />
              <Select value={status} onChange={setStatus} style={{ width: 180 }}>
                <Option value="ALL">Tất cả</Option>
                <Option value="OPEN">OPEN</Option>
                <Option value="IN_PROGRESS">IN_PROGRESS</Option>
                <Option value="RESOLVED">RESOLVED</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button onClick={load} loading={loading}>Tải lại</Button>
            </Space>
          </Col>
        </Row>
        <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={`Chi tiết tra soát #${view?.id || ''}`}
        open={!!view}
        onCancel={() => setView(null)}
        footer={[<Button key="close" onClick={() => setView(null)}>Đóng</Button>]}
      >
        {view && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Row justify="space-between"><span>Người gửi (User ID):</span><strong>{view.userId}</strong></Row>
            <Row justify="space-between"><span>Kỳ lương:</span><strong>{view.period}</strong></Row>
            <Row><span>Tiêu đề:</span></Row>
            <div><strong>{view.subject}</strong></div>
            <Row><span>Nội dung:</span></Row>
            <div style={{ whiteSpace: 'pre-wrap' }}>{view.description}</div>
            {view.attachmentUrl && (
              <a href={view.attachmentUrl} target="_blank" rel="noreferrer">Mở tệp đính kèm</a>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default PayrollIssues;


