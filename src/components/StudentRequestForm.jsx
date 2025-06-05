import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, message } from 'antd';

const { TextArea } = Input;

const StudentRequestForm = ({ onClose, initialEmail = '' }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  
  const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:8088';

  const checkActiveRequest = useCallback(async (email) => {
    try {
      const response = await fetch(`${baseUrl}/role-requests/check?email=${email}&role=STUDENT`);
      if (response.ok) {
        const hasRequest = await response.json();
        setHasActiveRequest(hasRequest);
        if (hasRequest) {
          message.info('Bạn đã có yêu cầu đăng ký làm học sinh đang chờ xử lý');
        }
      }
    } catch (error) {
      console.error('Error checking request status:', error);
    }
  }, [baseUrl]);

  useEffect(() => {
    const emailToUse = initialEmail || localStorage.getItem('email');
    if (emailToUse) {
      form.setFieldsValue({ email: emailToUse });
      checkActiveRequest(emailToUse);
    }
  }, [form, checkActiveRequest, initialEmail]);

  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${baseUrl}/role-requests/student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        message.success('Đăng ký thành công! Yêu cầu của bạn đang được xử lý.');
        localStorage.setItem('email', values.email); // Save email for future use
        onClose();
      } else {
        const errorData = await response.json();
        message.error(`Đăng ký thất bại: ${errorData.message || 'Vui lòng thử lại sau'}`);
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi gửi yêu cầu');
      console.error('Error submitting request:', error);
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
      disabled={hasActiveRequest || loading}
    >
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Vui lòng nhập email' },
          { type: 'email', message: 'Email không hợp lệ' }
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
        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
      >
        <Input placeholder="Nhập số điện thoại liên hệ" />
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

      <Form.Item
        name="additionalInfo"
        label="Thông tin thêm"
      >
        <TextArea rows={3} placeholder="Thông tin thêm (nếu có)" />
      </Form.Item>

      {hasActiveRequest ? (
        <div className="text-orange-500 mb-4">
          Bạn đã có yêu cầu đăng ký đang chờ xử lý. Vui lòng chờ phản hồi.
        </div>
      ) : (
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Gửi yêu cầu
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

export default StudentRequestForm; 