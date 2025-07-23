import { Button, Form, Input, Upload, message } from 'antd';
import { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import axiosInstance from '../config/axiosInstance';

const normFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

const RecruitmentApplyForm = ({ job, onSuccess }) => {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);

  const handleFinish = async (values) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('jobPositionId', job.id);
      formData.append('email', values.email);
      formData.append('fullName', values.fullName);
      if (values.cv && values.cv.length > 0) {
        formData.append('cv', values.cv[0].originFileObj);
      }
      await axiosInstance.post('/recruitments/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('Nộp CV thành công!');
      onSuccess && onSuccess();
    } catch (err) {
      message.error('Nộp CV thất bại!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      autoComplete="off"
    >
      <Form.Item
        name="fullName"
        label="Họ và tên"
        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
      >
        <Input placeholder="Nhập họ tên đầy đủ" />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Vui lòng nhập email' },
          { type: 'email', message: 'Email không hợp lệ' },
        ]}
      >
        <Input placeholder="Nhập email của bạn" />
      </Form.Item>
      <Form.Item
        name="cv"
        label="Tải lên CV"
        valuePropName="fileList"
        getValueFromEvent={normFile}
        rules={[{
          validator: (_, value) =>
            value && value.length > 0
              ? Promise.resolve()
              : Promise.reject('Vui lòng upload file CV'),
        }]}
      >
        <Upload beforeUpload={() => false} maxCount={1} accept=".pdf,.doc,.docx">
          <Button icon={<UploadOutlined />}>Chọn file</Button>
        </Upload>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={uploading} block size="large">
          Gửi CV ứng tuyển
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RecruitmentApplyForm; 