import { Button, Form, Input, message, Select } from 'antd';
import React, { useState, useEffect } from 'react';
import requestService from '../services/requestService';

const { TextArea } = Input;
const { Option } = Select;

const ParentRequestForm = ({ onClose, initialEmail = '' }) => {
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
      // Get children emails from form values
      const formChildrenEmails = values.childrenEmails || [];
      
      // Filter out empty emails
      const validChildrenEmails = formChildrenEmails.filter(email => email && email.trim() !== '');
      
      // Validate children emails before submitting
      if (validChildrenEmails.length === 0) {
        message.error('Vui lòng nhập ít nhất một email con em.');
        setLoading(false);
        return;
      }

      // Validate each email format and existence
      for (let i = 0; i < validChildrenEmails.length; i++) {
        const email = validChildrenEmails[i];
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          message.error(`Email con em thứ ${i + 1} không hợp lệ.`);
          setLoading(false);
          return;
        }

        // Check if child email exists in system
        try {
          const response = await requestService.checkChildEmailExists(email);
          if (!response.data.exists) {
            message.error(`Email con em "${email}" chưa tồn tại trong hệ thống.`);
            setLoading(false);
            return;
          }
        } catch (error) {
          message.error(`Không thể kiểm tra email con em "${email}". Vui lòng thử lại.`);
          setLoading(false);
          return;
        }
      }
      
      // Structure the data according to CreateRequestDto
      const requestData = {
        email: values.email,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        requestedRole: 'PARENT',
        // Stringify additional form fields into formResponses
        formResponses: JSON.stringify({
          childrenEmails: validChildrenEmails,
          additionalInfo: values.additionalInfo,
        }),
      };

      await requestService.submitRequest(requestData);

      message.success('Yêu cầu đăng ký tài khoản phụ huynh đã được gửi thành công!');
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
      name="parentRequestForm"
      layout="vertical"
      onFinish={onFinish}
      autoComplete="off"
      initialValues={{ childrenEmails: [''] }}
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
        name="childrenEmails"
        label="Thông tin con em"
        rules={[
          { required: true, message: 'Vui lòng nhập ít nhất một email con em' },
          { type: 'array', min: 1, message: 'Vui lòng nhập ít nhất một email con em' }
        ]}
      >
        <Select
          mode="tags"
          placeholder="Nhập email con em"
          style={{ width: '100%' }}
          tokenSeparators={[',']}
        />
      </Form.Item>

      <Form.Item name="additionalInfo" label="Thông tin thêm">
        <TextArea rows={3} placeholder="Thông tin thêm (nếu có)" />
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          Gửi đơn tạo tài khoản
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ParentRequestForm;
