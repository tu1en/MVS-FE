import { Button, Form, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import requestService from '../services/requestService'; // Import new service

const { TextArea } = Input;

const TeacherRequestForm = ({ onClose, initialEmail = '' }) => {
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
        requestedRole: 'TEACHER',
        // Stringify additional form fields into formResponses
        formResponses: JSON.stringify({
          specialization: values.specialization,
          reason: values.reason,
        }),
      };

      await requestService.submitRequest(requestData);

      message.success('Yêu cầu đăng ký giáo viên đã được gửi thành công!');
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
      name="teacherRequestForm"
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
        name="specialization"
        label="Chuyên ngành giảng dạy"
        rules={[{ required: true, message: 'Vui lòng nhập chuyên ngành' }]}
      >
        <Input placeholder="Ví dụ: Lập trình Web, Phân tích dữ liệu" />
      </Form.Item>

      <Form.Item
        name="reason"
        label="Lý do muốn trở thành giáo viên"
        rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
      >
        <TextArea rows={4} placeholder="Trình bày ngắn gọn kinh nghiệm và mong muốn của bạn" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Gửi yêu cầu
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TeacherRequestForm; 