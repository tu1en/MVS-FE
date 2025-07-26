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
      formData.append('phoneNumber', values.phoneNumber);
      formData.append('address', values.address);
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
    <Form form={form} onFinish={handleFinish} layout="vertical">
      <Form.Item
        name="fullName"
        label="Họ và tên"
        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Vui lòng nhập email!' },
          { type: 'email', message: 'Email không hợp lệ!' }
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="phoneNumber"
        label="Số điện thoại"
        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="address"
        label="Địa chỉ"
        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
      >
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item
        name="cv"
        label="Tải lên CV"
        valuePropName="fileList"
        getValueFromEvent={normFile}
        rules={[{ required: true, message: 'Vui lòng tải lên CV!' }]}
      >
        <Upload
          beforeUpload={() => false}
          accept=".pdf,.doc,.docx"
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Chọn file CV</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={uploading} block>
          Nộp đơn ứng tuyển
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RecruitmentApplyForm; 