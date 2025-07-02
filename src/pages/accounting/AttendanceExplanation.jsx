import React, { useState } from 'react';
import { Form, Input, Button, Upload, message, Card, Typography, DatePicker } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Paragraph } = Typography;

const AttendanceExplanation = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [file, setFile] = useState(null);

  const handleFinish = async (values) => {
    setLoading(true);
    setMsg("");
    try {
      const formData = new FormData();
      formData.append('userId', localStorage.getItem('userId') || 1); // Lấy userId thực tế
      formData.append('date', values.date.format('YYYY-MM-DDTHH:mm'));
      formData.append('reason', values.reason);
      if (file) formData.append('file', file);
      await axios.post('/api/attendance-explanations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMsg('Giải trình đã được gửi thành công!');
      form.resetFields();
      setFile(null);
    } catch (err) {
      setMsg('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
      <Card style={{ maxWidth: 480, width: '100%', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>Gửi giải trình chấm công</Title>
        <Paragraph style={{ textAlign: 'center', color: '#888', marginBottom: 24 }}>
          Bạn có thể gửi giải trình đi trễ, về sớm, quên chấm công, nghỉ phép... và đính kèm tài liệu minh chứng.
        </Paragraph>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          style={{ width: '100%' }}
        >
          <Form.Item name="date" label="Ngày liên quan" rules={[{ required: true, message: 'Chọn ngày liên quan' }]}> 
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="Lý do giải trình" rules={[{ required: true, message: 'Nhập lý do' }]}> 
            <Input.TextArea rows={4} placeholder="Nhập lý do giải trình..." />
          </Form.Item>
          <Form.Item label="Đính kèm tài liệu (nếu có)">
            <Upload
              beforeUpload={file => { setFile(file); return false; }}
              maxCount={1}
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            >
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
            {file && <span style={{ marginLeft: 8 }}>{file.name}</span>}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Gửi giải trình
            </Button>
          </Form.Item>
        </Form>
        {msg && <div style={{ marginTop: 16, color: msg.startsWith('Lỗi') ? 'red' : 'green', textAlign: 'center' }}>{msg}</div>}
      </Card>
    </div>
  );
};

export default AttendanceExplanation;
