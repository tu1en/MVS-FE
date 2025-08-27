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

  // Helper function to format payroll period
  const formatPayrollPeriod = (payrollPeriod) => {
    if (!payrollPeriod) return null;

    try {
      // Handle different formats: "2025-08", "20258", etc.
      if (typeof payrollPeriod === 'string') {
        if (payrollPeriod.includes('-')) {
          // Format: "2025-08" -> "08/2025"
          const [year, month] = payrollPeriod.split('-');
          return `${month.padStart(2, '0')}/${year}`;
        } else if (payrollPeriod.length === 5) {
          // Format: "20258" -> "08/2025" (assuming last digit is month)
          const year = payrollPeriod.substring(0, 4);
          const month = payrollPeriod.substring(4);
          return `${month.padStart(2, '0')}/${year}`;
        }
      }
      return payrollPeriod;
    } catch (error) {
      console.warn('Error formatting payroll period:', payrollPeriod, error);
      return payrollPeriod;
    }
  };

  // Helper function to convert contract type to Vietnamese
  const formatContractType = (contractType) => {
    if (!contractType) return 'Chưa xác định';

    const typeMap = {
      'TEACHER': 'Giáo viên',
      'MANAGER': 'Quản lý',
      'ADMIN': 'Quản trị viên',
      'STUDENT': 'Học sinh',
      'STAFF': 'Nhân viên',
      'ACCOUNTANT': 'Kế toán'
    };

    return typeMap[contractType.toUpperCase()] || contractType;
  };

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await PayrollService.getMyPayroll(user.id, period.format('YYYY-MM'));
      console.log('Payroll data received:', res);
      console.log('Contract type:', res?.contractType);
      console.log('Payroll period:', res?.payrollPeriod);
      
      // Debug: Log all the time-related fields to understand the data
      console.log('🔍 Time data debug:', {
        actualWorkingDays: res?.actualWorkingDays,
        actualWorkingHours: res?.actualWorkingHours,
        weekdayWorkingHours: res?.weekdayWorkingHours,
        weekendWorkingHours: res?.weekendWorkingHours,
        totalWorkingDays: res?.totalWorkingDays,
        standardMonthlyHours: res?.standardMonthlyHours
      });
      
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
        {/* <Space>
          <span>Kỳ giảng dạy:</span>
          <MonthPicker allowClear={false} value={period} onChange={(v)=>setPeriod(v||moment())} format="MM/YYYY" />
          <Button onClick={load}>Tải lại</Button>
        </Space> */}
        <Space>
          <Button type="primary" loading={confirming} onClick={onConfirmViewed}>Xác nhận đã xem</Button>
          <Button danger onClick={() => setIssueOpen(true)}>Báo sai / Tra soát</Button>
        </Space>
      </Row>

      {data ? (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Card title="Thông tin tổng hợp">
            <Row gutter={16}>
              <Col span={8}><Statistic title="Số tiết dạy" value={Number(data.actualWorkingDays || 0)} formatter={(v)=>Number(v).toLocaleString()} suffix=" tiết" /></Col>
              <Col span={8}><Statistic title="Giờ dạy" value={Number(data.actualWorkingHours || 0)} formatter={(v)=>Number(v).toLocaleString()} suffix=" giờ" /></Col>
              {/* <Col span={8}><Statistic title="Giờ dạy (Tính lại)" valueStyle={{ color: '#52c41a' }} value={Number(data.actualWorkingDays || 0) * 1.5} formatter={(v)=>Number(v).toLocaleString()} suffix=" giờ" /></Col> */}
            </Row>
          </Card>

          <Card title="Chi tiết">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Loại HĐ">{formatContractType(data.contractType || data.contract?.type)}</Descriptions.Item>
              <Descriptions.Item label="Kỳ lương">{formatPayrollPeriod(data.payrollPeriod) || period.format('MM/YYYY')}</Descriptions.Item>
              <Descriptions.Item label="Số tiết chuẩn">{data.totalWorkingDays || 0}</Descriptions.Item>
              <Descriptions.Item label="Số tiết thực tế">{data.actualWorkingDays || 0}</Descriptions.Item>
              <Descriptions.Item label="Giờ ngày thường">{data.weekdayWorkingHours || 0}</Descriptions.Item>
              <Descriptions.Item label="Giờ cuối tuần">{data.weekendWorkingHours || 0}</Descriptions.Item>
              <Descriptions.Item label="Tổng giờ dạy">{Number(data.actualWorkingHours || 0) + Number(data.weekdayWorkingHours || 0) + Number(data.weekendWorkingHours || 0)} giờ</Descriptions.Item>
            </Descriptions>
            
            {/* Debug section to show raw data */}
            <Divider />
      {/* 
      
      */}
            {/* <Alert type="info" message="Số liệu tính theo TopCV từ hợp đồng và chấm công giảng dạy" /> */}
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


