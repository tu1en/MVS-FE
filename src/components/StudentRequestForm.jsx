import { Button, Form, Input, message } from 'antd';
import React, { useEffect, useState } from 'react';
import requestService from '../services/requestService'; // Import new service

const { TextArea } = Input;

const StudentRequestForm = ({ onClose, initialEmail = '' }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      form.setFieldsValue({ email: initialEmail });
    }
  }, [form, initialEmail]);

  // Simplified phone number validation
  const validatePhoneNumber = (_, value) => {
    if (value && /^\d{10,11}$/.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject('Số điện thoại phải có 10 hoặc 11 chữ số.');
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Structure the data according to CreateRequestDto
      const requestData = {
        email: values.email,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        requestedRole: 'STUDENT',
        // Stringify additional form fields into formResponses
        formResponses: JSON.stringify({
          grade: values.grade,
          parentContact: values.parentContact,
          additionalInfo: values.additionalInfo,
        }),
      };

      await requestService.submitRequest(requestData);

      message.success('Yêu cầu đăng ký học sinh đã được gửi thành công!');
      onClose(); // Close the modal on success
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      name="studentRequestForm"
      layout="vertical"
      onFinish={onFinish}
      autoComplete="off"
    >
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Vui lòng nhập email' },
          { type: 'email', message: 'Email không hợp lệ' },
        ]}
      >
        <Input placeholder="Nhập email của bạn" disabled={!!initialEmail} />
      </Form.Item>

      <Form.Item
        name="fullName"
        label="Họ tên"
        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
      >
        <Input placeholder="Nhập họ tên đầy đủ" />
      </Form.Item>

      <Form.Item
        name="phoneNumber"
        label="Số điện thoại"
        rules={[
          { required: true, message: 'Vui lòng nhập số điện thoại' },
          { validator: validatePhoneNumber },
        ]}
      >
        <Input placeholder="Nhập số điện thoại" />
      </Form.Item>

      <Form.Item
        name="grade"
        label="Lớp"
        rules={[{ required: true, message: 'Vui lòng nhập lớp' }]}
      >
        <Input placeholder="Ví dụ: Lớp 10, Lớp 11, Lớp 12..." />
      </Form.Item>

      <Form.Item
        name="parentContact"
        label="Thông tin phụ huynh"
        rules={[{ required: true, message: 'Vui lòng nhập thông tin phụ huynh' }]}
      >
        <TextArea rows={3} placeholder="Tên và số điện thoại liên hệ của phụ huynh" />
      </Form.Item>

      <Form.Item name="additionalInfo" label="Thông tin thêm">
        <TextArea rows={3} placeholder="Thông tin thêm (nếu có)" />
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          Gửi yêu cầu
        </Button>
      </Form.Item>
    </Form>
  );
};

export default StudentRequestForm; 