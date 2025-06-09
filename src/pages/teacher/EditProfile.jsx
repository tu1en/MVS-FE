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
      const response = await axios.get('/api/teacher/profile');
      const data = response.data;
      form.setFieldsValue({ ...data });
    } catch (error) {
      message.error('Không thể tải thông tin cá nhân');
      console.error('Error fetching profile:', error);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.put('/api/teacher/profile', values);
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
      <Card title="Chỉnh Sửa Thông Tin Giáo Viên" className="max-w-2xl mx-auto">
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
            name="email"
            label="Email"
            rules={[{ required: true, validator: validateEmail }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số Điện Thoại"
            rules={[{ required: true, validator: validatePhoneNumber }]}
            validateStatus={invalidPrefix ? 'error' : ''}
            help={invalidPrefix ? 'Số điện thoại phải bắt đầu bằng 03, 05, 07, 08 hoặc 09' : null}
          >
            <Input
              maxLength={11}
              value={form.getFieldValue('phoneNumber')}
              onChange={(e) => {
                let onlyNumbers = e.target.value.replace(/[^0-9]/g, '');

                if (onlyNumbers.length > 11) {
                  onlyNumbers = onlyNumbers.slice(0, 11);
                }

                form.setFieldsValue({ phoneNumber: onlyNumbers });

                if (onlyNumbers.length >= 2 && !/^0(3|5|7|8|9)/.test(onlyNumbers)) {
                  setInvalidPrefix(true);
                } else {
                  setInvalidPrefix(false);
                }
              }}
              inputMode="numeric"
              placeholder="Nhập số điện thoại"
            />
          </Form.Item>

          <Form.Item
            name="teacherId"
            label="Mã Giáo Viên"
            rules={[{ required: true }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="department"
            label="Khoa/Bộ Môn"
            rules={[{ required: true, message: 'Vui lòng nhập khoa/bộ môn' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="specialization"
            label="Chuyên Ngành"
            rules={[{ required: true, message: 'Vui lòng nhập chuyên ngành' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="degree"
            label="Học Vị"
            rules={[{ required: true, message: 'Vui lòng chọn học vị' }]}
          >
            <Select>
              <Option value="Thạc sĩ">Thạc sĩ</Option>
              <Option value="Tiến sĩ">Tiến sĩ</Option>
              <Option value="Phó Giáo sư">Phó Giáo sư</Option>
              <Option value="Giáo sư">Giáo sư</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="subject"
            label="Môn Giảng Dạy"
            rules={[{ required: true, message: 'Vui lòng nhập môn giảng dạy' }]}
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