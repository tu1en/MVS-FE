import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Card } from 'antd';
import axios from 'axios';
import { validatePhoneNumber, validateEmail } from '../../utils/validation';

const { Option } = Select;

const EditProfile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [invalidPrefix, setInvalidPrefix] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/v1/student/profile');
      form.setFieldsValue({
        ...response.data,
        class: response.data.className // map className to class for form
      });
    } catch (error) {
      message.error('Không thể tải thông tin cá nhân');
      console.error('Error fetching profile:', error);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const profileData = {
        ...values,
        className: values.class // map class back to className for API
      };
      delete profileData.class;

      await axios.put('/api/v1/student/profile', profileData);
      message.success('Cập nhật thông tin thành công');
    } catch (error) {
      message.error('Không thể cập nhật thông tin');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card title="Chỉnh Sửa Thông Tin Cá Nhân" className="max-w-2xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="max-w-xl mx-auto"
        >
          <Form.Item
            name="fullName"
            label="Họ và Tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[{ required: true, validator: validatePhoneNumber }]}
            validateStatus={invalidPrefix ? 'error' : ''}
            help={invalidPrefix ? 'Số điện thoại phải bắt đầu bằng 03, 05, 07, 08 hoặc 09' : null}
          >
            <Input
              maxLength={11}
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={(e) => {
                let value = e.target.value.replace(/[^0-9]/g, '');
                if (value.length > 11) value = value.slice(0, 11);
                form.setFieldsValue({ phoneNumber: value });

                if (value.length >= 2 && !/^0(3|5|7|8|9)/.test(value)) {
                  setInvalidPrefix(true);
                } else {
                  setInvalidPrefix(false);
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Giới Tính"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
          >
            <Select>
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="studentId"
            label="Mã Số Sinh Viên"
            rules={[{ required: true }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, validator: validateEmail }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item name="address" label="Địa Chỉ">
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="school"
            label="Trường"
            rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="class"
            label="Lớp"
            rules={[{ required: true, message: 'Vui lòng nhập tên lớp' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Cập Nhật Thông Tin
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditProfile;
