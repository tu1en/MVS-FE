import { Button, Form, Input, message } from 'antd';
import React, { useState, useEffect } from 'react';
import requestService from '../services/requestService';

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
    if (!value) {
      return Promise.reject(new Error('Vui lòng nhập số điện thoại học sinh'));
    }
    const phoneRegex = /^0[0-9]{9,10}$/;
    if (!phoneRegex.test(value)) {
      return Promise.reject(new Error('Số điện thoại học sinh phải bắt đầu bằng số 0 và có 10-11 chữ số'));
    }
    return Promise.resolve();
  };

  const validateParentPhoneNumber = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng nhập số điện thoại phụ huynh'));
    }
    const phoneRegex = /^0[0-9]{9,10}$/;
    if (!phoneRegex.test(value)) {
      return Promise.reject(new Error('Số điện thoại phụ huynh phải bắt đầu bằng số 0 và có 10-11 chữ số'));
    }
    return Promise.resolve();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const requestData = {
        email: values.email,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        requestedRole: 'STUDENT',
        formResponses: JSON.stringify({
          parentEmail: values.parentEmail,
          parentFullName: values.parentFullName,
          parentPhoneNumber: values.parentPhoneNumber,
          additionalInfo: values.additionalInfo,
        }),
      };
      
      await requestService.submitRequest(requestData);
      message.success('Yêu cầu đăng ký tài khoản học sinh đã được gửi thành công!');
      onClose();
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
      {/* Thông tin học sinh */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-600">Thông tin học sinh</h3>
        
        <Form.Item
          name="email"
          label="Email học sinh"
          rules={[
            { required: true, message: 'Vui lòng nhập email học sinh' },
            { type: 'email', message: 'Email không hợp lệ' },
            { max: 50, message: 'Email học sinh không được quá 50 ký tự' }
          ]}
        >
          <Input placeholder="Nhập email học sinh" />
        </Form.Item>

        <Form.Item
          name="fullName"
          label="Họ và tên học sinh"
          rules={[
            { required: true, message: 'Vui lòng nhập họ và tên học sinh' },
            { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' },
            { max: 50, message: 'Họ và tên học sinh không được quá 50 ký tự' }
          ]}
        >
          <Input placeholder="Nhập họ và tên học sinh" />
        </Form.Item>

        <Form.Item
          name="phoneNumber"
          label="Số điện thoại học sinh"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại học sinh' },
            { validator: validatePhoneNumber }
          ]}
        >
          <Input placeholder="Nhập số điện thoại học sinh" />
        </Form.Item>
      </div>

      {/* Thông tin phụ huynh */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-green-600">Thông tin phụ huynh</h3>
        
        <Form.Item
          name="parentEmail"
          label="Email phụ huynh"
          rules={[
            { required: true, message: 'Vui lòng nhập email phụ huynh' },
            { type: 'email', message: 'Email phụ huynh không hợp lệ' },
            { max: 50, message: 'Email phụ huynh không được quá 50 ký tự' }
          ]}
        >
          <Input placeholder="Nhập email phụ huynh" />
        </Form.Item>

        <Form.Item
          name="parentFullName"
          label="Họ và tên phụ huynh"
          rules={[
            { required: true, message: 'Vui lòng nhập họ và tên phụ huynh' },
            { min: 2, message: 'Họ và tên phụ huynh phải có ít nhất 2 ký tự' },
            { max: 50, message: 'Họ và tên phụ huynh không được quá 50 ký tự' }
          ]}
        >
          <Input placeholder="Nhập họ và tên phụ huynh" />
        </Form.Item>

        <Form.Item
          name="parentPhoneNumber"
          label="Số điện thoại phụ huynh"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại phụ huynh' },
            { validator: validateParentPhoneNumber }
          ]}
        >
          <Input placeholder="Nhập số điện thoại phụ huynh" />
        </Form.Item>
      </div>

      {/* Thông tin thêm */}
      <Form.Item
        name="additionalInfo"
        label="Thông tin thêm"
        rules={[
          { max: 200, message: 'Thông tin thêm không được quá 200 ký tự' }
        ]}
      >
        <TextArea
          rows={3}
          placeholder="Nhập thông tin bổ sung (nếu có)"
          showCount
          maxLength={200}
        />
      </Form.Item>

      <Form.Item className="mb-0">
        <div className="flex justify-end space-x-3">
          <Button onClick={onClose}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Gửi đơn tạo tài khoản
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default StudentRequestForm; 