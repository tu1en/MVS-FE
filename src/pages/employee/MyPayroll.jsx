import { InboxOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, DatePicker, Descriptions, Divider, Modal, Row, Space, Spin, Statistic, Upload, message } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PayrollService from '../../services/payrollService';

const { MonthPicker } = DatePicker;

const MyPayroll = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState(moment());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [issue, setIssue] = useState({ subject: '', description: '', file: null });

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await PayrollService.getMyPayroll(user.id, period.format('YYYY-MM'));
      // BE có thể trả 204 No Content → axios data = '' hoặc undefined
      setData(res || null);
    } catch (e) {
      console.error(e);
      const status = e?.response?.status;
      if (status === 204 || status === 404) {
        setData(null);
      } else {
        message.error('Không thể tải dữ liệu lương');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [period]);

  const onConfirmViewed = async () => {
    if (!user?.id) return;
    setConfirming(true);
    try {
      await PayrollService.confirmMyPayroll(user.id, period.format('YYYY-MM'));
      message.success('Đã xác nhận đã xem');
    } catch (e) {
      console.error(e);
      message.error('Xác nhận thất bại');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <div style={{ padding: 24, textAlign: 'center' }}><Spin /></div>;

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Space>
          <span>Kỳ lương:</span>
          <MonthPicker allowClear={false} value={period} onChange={(v)=>setPeriod(v||moment())} format="MM/YYYY" />
          <Button onClick={load}>Tải lại</Button>
        </Space>
        <Space>
          <Button type="primary" loading={confirming} onClick={onConfirmViewed}>Xác nhận đã xem</Button>
          <Button danger onClick={() => setIssueOpen(true)}>Báo sai / Tra soát</Button>
        </Space>
      </Row>

      {data ? (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Card title="Thông tin tổng hợp">
            <Row gutter={16}>
              {/* Ẩn thống kê Gross */}
              {/* <Col span={6}><Statistic title="Gross" value={Number(data.proratedGrossSalary||0)} formatter={(v)=>Number(v).toLocaleString()} suffix=" VNĐ" /></Col> */}
              <Col span={8}><Statistic title="Thuế TNCN" value={Number(data.topCVResult?.personalIncomeTax||0)} formatter={(v)=>Number(v).toLocaleString()} suffix=" VNĐ" /></Col>
              <Col span={8}><Statistic title="BH NLĐ" value={Number(data.topCVResult?.insuranceDetails?.totalEmployeeContribution||0)} formatter={(v)=>Number(v).toLocaleString()} suffix=" VNĐ" /></Col>
              <Col span={8}><Statistic title="Thực nhận (Net)" valueStyle={{ color: '#52c41a' }} value={Number(data.netSalary||0)} formatter={(v)=>Number(v).toLocaleString()} suffix=" VNĐ" /></Col>
            </Row>
          </Card>

          <Card title="Chi tiết">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Loại HĐ">{data.contractType}</Descriptions.Item>
              <Descriptions.Item label="Kỳ lương">{(data.payrollPeriod)||''}</Descriptions.Item>
              <Descriptions.Item label="Ngày công chuẩn">{data.totalWorkingDays}</Descriptions.Item>
              <Descriptions.Item label="Ngày công thực tế">{data.actualWorkingDays}</Descriptions.Item>
              <Descriptions.Item label="Giờ ngày thường">{data.weekdayWorkingHours}</Descriptions.Item>
              <Descriptions.Item label="Giờ cuối tuần">{data.weekendWorkingHours}</Descriptions.Item>
            </Descriptions>
            <Divider />
            <Alert type="info" message="Số liệu tính theo TopCV từ hợp đồng và chấm công" />
          </Card>
        </Space>
      ) : (
        <Alert type="warning" message="Không có dữ liệu kỳ lương" />
      )}

      <Modal
        title="Báo sai / Tra soát lương"
        open={issueOpen}
        onCancel={() => setIssueOpen(false)}
        onOk={async ()=>{
          try {
            const payload = {
              userId: user.id,
              period: period.format('YYYY-MM'),
              subject: issue.subject,
              description: issue.description,
              file: issue.file,
            };
            await PayrollService.createPayrollIssue(payload);
            message.success('Đã gửi tra soát');
            setIssueOpen(false);
            setIssue({ subject: '', description: '', file: null });
          } catch(e) {
            console.error(e);
            message.error('Gửi tra soát thất bại');
          }
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <input
            style={{ width: '100%', padding: 8 }}
            placeholder="Tiêu đề"
            value={issue.subject}
            onChange={(e)=>setIssue({ ...issue, subject: e.target.value })}
          />
          <textarea
            rows={5}
            style={{ width: '100%', padding: 8 }}
            placeholder="Nội dung chi tiết"
            value={issue.description}
            onChange={(e)=>setIssue({ ...issue, description: e.target.value })}
          />
          <Upload.Dragger
            name="file"
            beforeUpload={(file)=>{ setIssue({ ...issue, file }); return false; }}
            maxCount={1}
            accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Kéo thả hoặc bấm để chọn tệp đính kèm (tuỳ chọn)</p>
          </Upload.Dragger>
        </Space>
      </Modal>
    </div>
  );
};

export default MyPayroll;


